import 'server-only';
import { randomUUID } from 'node:crypto';
import { getDb } from './server';
import { withCmsAccess } from './cmsStore';
import { getCmsGalleryConfiguration } from './cmsGallerySecurity';
import { isCmsId } from './cmsContent';
import {
  canPublishGalleryPhoto, parseGalleryReviewReason, type CmsGalleryPhoto, type GalleryAuditEvent,
  type GalleryFields, type GalleryMediaState
} from './cmsGalleryContent';
import {
  galleryPurgeKeys, galleryUploadLocked, isSafeGalleryStorageKey, MAX_GALLERY_CLEANUP_KEYS,
  planGalleryUpload
} from './cmsGalleryWorkflow';

type SaveResult = 'saved' | 'stale' | 'duplicate' | 'ineligible';
const TEXT_FIELDS = {
  title: 1, altText: 1, category: 1, status: 1, mediaState: 1, revision: 1, updatedAt: 1
} as const;
const MAX_HISTORY = 20;

async function galleryCollection() {
  return (await getDb()).collection<CmsGalleryPhoto>('cmsPosts', {
    writeConcern: { w: 'majority', j: true }
  });
}

function audit(event: GalleryAuditEvent['event'], actorEmail: string): GalleryAuditEvent {
  return { event, actorEmail, at: new Date() };
}

export async function withCmsGalleryAccess<T>(
  required: 'editor' | 'publisher',
  operation: (email: string) => Promise<T>,
  options: { requirePublishing?: boolean } = {}
) {
  const configuration = getCmsGalleryConfiguration(process.env);
  if (!configuration.enabled) return { status: 'unavailable' } as const;
  const requiresGalleryPublishing = required === 'publisher' && options.requirePublishing !== false;
  if (requiresGalleryPublishing && !configuration.publishingEnabled) {
    return { status: 'unavailable' } as const;
  }
  return withCmsAccess(required, operation, { requirePublishing: false });
}

function galleryStaff<T>(required: 'editor' | 'publisher', operation: (email: string) => Promise<T>, requirePublishing?: boolean) {
  return withCmsGalleryAccess(required, operation, { requirePublishing });
}

export async function listCmsGalleryPhotos() {
  return galleryStaff('editor', async () => {
    const items = await (await galleryCollection()).find({ kind: 'gallery-photo' }, {
      projection: { ...TEXT_FIELDS, altText: 1 }
    }).sort({ updatedAt: -1 }).limit(100).toArray();
    return items.map(item => ({
      id: item._id, title: item.title, category: item.category, status: item.status,
      altText: item.altText, mediaState: item.mediaState,
      updatedAt: item.updatedAt.toISOString(), revision: item.revision
    }));
  });
}

export async function readCmsGalleryPhoto(id: string) {
  return galleryStaff('editor', async () => {
    if (!isCmsId(id)) return null;
    const photo = await (await galleryCollection()).findOne({ _id: id, kind: 'gallery-photo' });
    if (!photo) return null;
    return {
      _id: photo._id, revision: photo.revision, kind: photo.kind,
      title: photo.title, caption: photo.caption, altText: photo.altText,
      category: photo.category, activityDate: photo.activityDate, displayOrder: photo.displayOrder,
      sourceReference: photo.sourceReference, subjectVisibility: photo.subjectVisibility,
      subjectPermissionReference: photo.subjectPermissionReference,
      guardianPermissionReference: photo.guardianPermissionReference,
      reviewFeedback: photo.reviewFeedback,
      status: photo.status, authorEmail: photo.authorEmail, mediaState: photo.mediaState,
      cleanupPending: Array.isArray(photo.cleanupKeys) && photo.cleanupKeys.length > 0,
      history: photo.history, rightsReview: photo.rightsReview,
      metadataReview: photo.metadataReview,
      consentReview: photo.consentReview, guardianReview: photo.guardianReview,
      updatedAt: photo.updatedAt.toISOString(), createdAt: photo.createdAt.toISOString(),
      publishedAt: photo.publishedAt?.toISOString() ?? null,
      archivedAt: photo.archivedAt?.toISOString() ?? null
    };
  });
}

export async function createCmsGalleryPhoto(id: string, fields: GalleryFields, authorEmail: string): Promise<SaveResult> {
  if (!isCmsId(id)) return 'stale';
  const now = new Date();
  const photo: CmsGalleryPhoto = {
    _id: id, revision: randomUUID(), kind: 'gallery-photo', ...fields,
    reviewFeedback: '', status: 'draft', authorEmail,
    createdAt: now, updatedAt: now, mediaState: 'missing', cleanupKeys: [], history: []
  };
  try {
    await (await galleryCollection()).insertOne(photo);
    return 'saved';
  } catch (error) {
    if ((error as { code?: number })?.code === 11000) return 'duplicate';
    throw error;
  }
}

export async function editCmsGalleryPhoto(
  id: string, expectedRevision: string, fields: GalleryFields
): Promise<SaveResult> {
  if (!isCmsId(id) || !isCmsId(expectedRevision)) return 'stale';
  const result = await (await galleryCollection()).updateOne(
    { _id: id, kind: 'gallery-photo', revision: expectedRevision, status: 'draft', mediaState: { $ne: 'purging' } },
    { $set: { ...fields, updatedAt: new Date(), revision: randomUUID() } }
  );
  return result.modifiedCount === 1 ? 'saved' : 'stale';
}

export async function submitCmsGalleryPhoto(
  id: string, expectedRevision: string, actorEmail: string
): Promise<SaveResult> {
  if (!isCmsId(id) || !isCmsId(expectedRevision)) return 'stale';
  const now = new Date();
  const result = await (await galleryCollection()).updateOne(
    { _id: id, kind: 'gallery-photo', revision: expectedRevision, status: 'draft', mediaState: 'ready' },
    {
      $set: { status: 'review', reviewFeedback: '', updatedAt: now, revision: randomUUID() },
      $push: { history: { $each: [audit('submitted', actorEmail)], $slice: -MAX_HISTORY } }
    }
  );
  return result.modifiedCount === 1 ? 'saved' : 'stale';
}

export async function returnCmsGalleryPhotoToDraft(
  id: string, expectedRevision: string, feedback: string, actorEmail: string
): Promise<SaveResult> {
  if (!isCmsId(id) || !isCmsId(expectedRevision)) return 'stale';
  const reviewFeedback = parseGalleryReviewReason(feedback);
  const now = new Date();
  const result = await (await galleryCollection()).updateOne(
    { _id: id, kind: 'gallery-photo', revision: expectedRevision, status: 'review' },
    {
      $set: { status: 'draft', reviewFeedback, updatedAt: now, revision: randomUUID() },
      $push: { history: { $each: [audit('returned', actorEmail)], $slice: -MAX_HISTORY } }
    }
  );
  return result.modifiedCount === 1 ? 'saved' : 'stale';
}

export async function publishCmsGalleryPhoto(
  id: string,
  expectedRevision: string,
  actorEmail: string,
  checks: {
    sourceVerified: boolean;
    metadataPrivacyVerified: boolean;
    subjectPermissionVerified: boolean;
    guardianPermissionVerified: boolean;
  }
): Promise<SaveResult> {
  if (!isCmsId(id) || !isCmsId(expectedRevision)) return 'stale';
  const config = getCmsGalleryConfiguration(process.env);
  const collection = await galleryCollection();
  const photo = await collection.findOne({
    _id: id, kind: 'gallery-photo', revision: expectedRevision, status: 'review'
  });
  if (!photo || !canPublishGalleryPhoto(photo, actorEmail, {
    ...checks,
    mediaPublishingEnabled: config.publishingEnabled,
    minorPublishingEnabled: config.minorPublishingEnabled
  })) return 'ineligible';

  const now = new Date();
  const update: Record<string, unknown> = {
    status: 'published',
    rightsReview: { reference: photo.sourceReference, verifiedBy: actorEmail, verifiedAt: now },
    metadataReview: { verifiedBy: actorEmail, verifiedAt: now },
    updatedAt: now,
    publishedAt: now,
    revision: randomUUID()
  };
  if (photo.subjectVisibility === 'adults' || photo.subjectVisibility === 'minors') {
    update.consentReview = { reference: photo.subjectPermissionReference, verifiedBy: actorEmail, verifiedAt: now };
  }
  if (photo.subjectVisibility === 'minors') {
    update.guardianReview = { reference: photo.guardianPermissionReference, verifiedBy: actorEmail, verifiedAt: now };
  }
  const result = await collection.updateOne(
    { _id: id, kind: 'gallery-photo', revision: expectedRevision, status: 'review', mediaState: 'ready' },
    { $set: update, $push: { history: { $each: [audit('published', actorEmail)], $slice: -MAX_HISTORY } } }
  );
  return result.modifiedCount === 1 ? 'saved' : 'stale';
}

export async function archiveCmsGalleryPhoto(
  id: string, expectedRevision: string, actorEmail: string
): Promise<SaveResult> {
  if (!isCmsId(id) || !isCmsId(expectedRevision)) return 'stale';
  const now = new Date();
  const result = await (await galleryCollection()).updateOne(
    { _id: id, kind: 'gallery-photo', revision: expectedRevision, status: 'published' },
    {
      $set: { status: 'archived', archivedAt: now, updatedAt: now, revision: randomUUID() },
      $push: { history: { $each: [audit('archived', actorEmail)], $slice: -MAX_HISTORY } }
    }
  );
  return result.modifiedCount === 1 ? 'saved' : 'stale';
}

export type GalleryUploadPreparation = {
  token: string;
  revision: string;
  displayKey: string;
  thumbnailKey: string;
  previousKeys: string[];
};

export async function beginCmsGalleryUpload(
  id: string, expectedRevision: string
): Promise<GalleryUploadPreparation | 'retry-later' | null> {
  if (!isCmsId(id) || !isCmsId(expectedRevision)) return null;
  const collection = await galleryCollection();
  const photo = await collection.findOne({ _id: id, kind: 'gallery-photo', revision: expectedRevision, status: 'draft' });
  if (!photo) return null;
  const now = new Date();
  if (galleryUploadLocked(photo, now)) return 'retry-later';
  // Each retry gets fresh object keys so a delayed earlier request cannot overwrite the new upload.
  const token = randomUUID();
  const plan = planGalleryUpload(photo, id, token, now);
  if (!plan) return null;

  const nextRevision = randomUUID();
  const result = await collection.updateOne(
    { _id: id, kind: 'gallery-photo', revision: expectedRevision, status: 'draft' },
    {
      $set: {
        mediaState: 'pending' satisfies GalleryMediaState,
        pendingUpload: plan,
        updatedAt: plan.createdAt, revision: nextRevision
      }
    }
  );
  return result.modifiedCount === 1 ? {
    token, revision: nextRevision, displayKey: plan.displayKey,
    thumbnailKey: plan.thumbnailKey, previousKeys: plan.previousKeys
  } : null;
}

export async function completeCmsGalleryUpload(
  id: string, revision: string, token: string
): Promise<{ revision: string; cleanupKeys: string[] } | null> {
  if (!isCmsId(id) || !isCmsId(revision) || !isCmsId(token)) return null;
  const collection = await galleryCollection();
  const photo = await collection.findOne({
    _id: id, kind: 'gallery-photo', revision, status: 'draft', mediaState: 'pending', 'pendingUpload.token': token
  });
  if (!photo?.pendingUpload || !Array.isArray(photo.cleanupKeys) || !Array.isArray(photo.pendingUpload.previousKeys) ||
      ![...photo.cleanupKeys, ...photo.pendingUpload.previousKeys, photo.pendingUpload.displayKey,
        photo.pendingUpload.thumbnailKey].every(isSafeGalleryStorageKey)) return null;
  const cleanupKeys = Array.from(new Set([...photo.cleanupKeys, ...photo.pendingUpload.previousKeys]));
  if (cleanupKeys.length > MAX_GALLERY_CLEANUP_KEYS) return null;
  const nextRevision = randomUUID();
  const result = await collection.updateOne(
    { _id: id, kind: 'gallery-photo', revision, status: 'draft', mediaState: 'pending', 'pendingUpload.token': token },
    {
      $set: {
        mediaState: 'ready',
        mediaKeys: { display: photo.pendingUpload.displayKey, thumbnail: photo.pendingUpload.thumbnailKey },
        cleanupKeys,
        updatedAt: new Date(), revision: nextRevision
      },
      $unset: { pendingUpload: '' }
    }
  );
  return result.modifiedCount === 1 ? { revision: nextRevision, cleanupKeys } : null;
}

export async function readCmsGalleryCleanupKeys(id: string) {
  if (!isCmsId(id)) return null;
  const photo = await (await galleryCollection()).findOne({ _id: id, kind: 'gallery-photo' }, {
    projection: { revision: 1, cleanupKeys: 1 }
  });
  if (!photo || !Array.isArray(photo.cleanupKeys) || !photo.cleanupKeys.every(isSafeGalleryStorageKey)) return null;
  return { revision: photo.revision, keys: photo.cleanupKeys };
}

export async function clearCmsGalleryCleanupKeys(id: string, revision: string, removedKeys: string[]): Promise<SaveResult> {
  if (!isCmsId(id) || !isCmsId(revision) || !removedKeys.length || !removedKeys.every(isSafeGalleryStorageKey)) return 'stale';
  const result = await (await galleryCollection()).updateOne(
    { _id: id, kind: 'gallery-photo', revision },
    { $pull: { cleanupKeys: { $in: removedKeys } }, $set: { revision: randomUUID(), updatedAt: new Date() } }
  );
  return result.modifiedCount === 1 ? 'saved' : 'stale';
}

export async function beginCmsGalleryPurge(id: string, expectedRevision: string) {
  if (!isCmsId(id) || !isCmsId(expectedRevision)) return null;
  const collection = await galleryCollection();
  const photo = await collection.findOne({
    _id: id, kind: 'gallery-photo', revision: expectedRevision, status: 'archived'
  });
  if (!photo) return null;
  const keys = galleryPurgeKeys(photo);
  if (!keys) return null;
  const token = randomUUID();
  const result = await collection.updateOne(
    { _id: id, kind: 'gallery-photo', revision: expectedRevision, status: 'archived' },
    {
      $set: { mediaState: 'purging', cleanupKeys: keys, purgeToken: token, revision: randomUUID(), updatedAt: new Date() },
      $unset: { mediaKeys: '', pendingUpload: '' }
    }
  );
  return result.modifiedCount === 1 ? { token, keys } : null;
}

export async function finishCmsGalleryPurge(id: string, token: string, remainingKeys: string[]): Promise<'deleted' | 'pending' | 'stale'> {
  if (!isCmsId(id) || !isCmsId(token) || remainingKeys.length > MAX_GALLERY_CLEANUP_KEYS + 4 ||
      !remainingKeys.every(isSafeGalleryStorageKey)) return 'stale';
  const collection = await galleryCollection();
  const photo = await collection.findOne({ _id: id, kind: 'gallery-photo', status: 'archived', purgeToken: token }, {
    projection: { revision: 1 }
  });
  if (!photo) return 'stale';
  if (remainingKeys.length) {
    const result = await collection.updateOne(
      { _id: id, kind: 'gallery-photo', status: 'archived', purgeToken: token, revision: photo.revision },
      { $set: { mediaState: 'purging', cleanupKeys: remainingKeys, revision: randomUUID(), updatedAt: new Date() } }
    );
    return result.modifiedCount === 1 ? 'pending' : 'stale';
  }
  const result = await collection.deleteOne({
    _id: id, kind: 'gallery-photo', status: 'archived', purgeToken: token, revision: photo.revision
  });
  return result.deletedCount === 1 ? 'deleted' : 'stale';
}

export async function getPublishedGalleryPhotoKeys(id: string, variant: 'display' | 'thumbnail') {
  const config = getCmsGalleryConfiguration(process.env);
  if (!config.publishingEnabled || !isCmsId(id)) return null;
  const photo = await (await galleryCollection()).findOne({
    _id: id, kind: 'gallery-photo', status: 'published', mediaState: 'ready'
  }, { projection: { mediaKeys: 1 } });
  if (!photo?.mediaKeys) return null;
  const key = photo.mediaKeys[variant];
  return isSafeGalleryStorageKey(key) ? key : null;
}

export async function getAdminGalleryPhotoKeys(id: string, variant: 'display' | 'thumbnail') {
  if (!isCmsId(id)) return null;
  const photo = await (await galleryCollection()).findOne({ _id: id, kind: 'gallery-photo', mediaState: 'ready' }, {
    projection: { mediaKeys: 1 }
  });
  if (!photo?.mediaKeys) return null;
  const key = photo.mediaKeys[variant];
  return isSafeGalleryStorageKey(key) ? key : null;
}

export async function listPublishedCmsGalleryPhotos() {
  const config = getCmsGalleryConfiguration(process.env);
  if (!config.publishingEnabled) return [];
  try {
    const items = await (await galleryCollection()).find({
      kind: 'gallery-photo', status: 'published', mediaState: 'ready'
    }, {
      projection: {
        title: 1, caption: 1, altText: 1, category: 1, activityDate: 1,
        displayOrder: 1, mediaState: 1, publishedAt: 1
      }
    }).sort({ displayOrder: 1, activityDate: -1, publishedAt: -1 }).limit(60).toArray();
    return items.map(item => ({
      id: item._id, title: item.title.slice(0, 120), caption: item.caption.slice(0, 300),
      altText: item.altText.slice(0, 180), category: item.category,
      activityDate: item.activityDate, displayOrder: item.displayOrder
    }));
  } catch {
    return [];
  }
}
