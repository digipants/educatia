import type { CmsStatus } from './cmsContent';

export const galleryCategories = [
  'school-visits',
  'online-classes',
  'volunteers-at-work',
  'student-participation'
] as const;

export type GalleryCategory = typeof galleryCategories[number];
export type GallerySubjectVisibility = 'none' | 'adults' | 'minors' | 'unknown';
export type GalleryMediaState = 'missing' | 'pending' | 'ready' | 'purging' | 'purged';
export const galleryReviewReasons = [
  'source-rights', 'permission-record', 'subject-classification', 'alt-text', 'caption', 'photo-quality'
] as const;
export type GalleryReviewReason = typeof galleryReviewReasons[number];
export const galleryReviewReasonLabels: Record<GalleryReviewReason, string> = {
  'source-rights': 'Source or usage-rights record needs review',
  'permission-record': 'Permission record needs review',
  'subject-classification': 'People shown need to be classified',
  'alt-text': 'Alternative text needs improvement',
  caption: 'Caption needs correction',
  'photo-quality': 'Photo needs replacement or quality check'
};
export type GalleryFields = {
  title: string;
  caption: string;
  altText: string;
  category: GalleryCategory;
  activityDate: string | null;
  displayOrder: number;
  sourceReference: string;
  subjectVisibility: GallerySubjectVisibility;
  subjectPermissionReference: string;
  guardianPermissionReference: string;
};

export type GalleryAuditEvent = {
  event: 'submitted' | 'returned' | 'published' | 'archived';
  actorEmail: string;
  at: Date;
};

export type CmsGalleryPhoto = GalleryFields & {
  _id: string;
  revision: string;
  kind: 'gallery-photo';
  reviewFeedback: GalleryReviewReason | '';
  status: CmsStatus;
  authorEmail: string;
  createdAt: Date;
  updatedAt: Date;
  mediaState: GalleryMediaState;
  mediaKeys?: { display: string; thumbnail: string };
  pendingUpload?: {
    token: string;
    displayKey: string;
    thumbnailKey: string;
    previousKeys: string[];
    createdAt: Date;
  };
  cleanupKeys: string[];
  rightsReview?: { reference: string; verifiedBy: string; verifiedAt: Date };
  metadataReview?: { verifiedBy: string; verifiedAt: Date };
  consentReview?: { reference: string; verifiedBy: string; verifiedAt: Date };
  guardianReview?: { reference: string; verifiedBy: string; verifiedAt: Date };
  history: GalleryAuditEvent[];
  publishedAt?: Date;
  archivedAt?: Date;
  purgeToken?: string;
};

export class GalleryValidationError extends Error {}

const controlPattern = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;
const htmlPattern = /<[^>]*>/;
const referencePattern = /^[A-Za-z0-9][A-Za-z0-9._/-]{1,79}$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function plainText(value: unknown, maximum: number): string {
  if (typeof value !== 'string') throw new GalleryValidationError('Invalid gallery content');
  const normalized = value.trim().replace(/\r\n/g, '\n');
  if (!normalized || normalized.length > maximum || controlPattern.test(normalized) || htmlPattern.test(normalized)) {
    throw new GalleryValidationError('Invalid gallery content');
  }
  return normalized;
}

function optionalReference(value: unknown): string {
  if (value === '') return '';
  if (typeof value !== 'string' || !referencePattern.test(value)) {
    throw new GalleryValidationError('Invalid gallery reference');
  }
  return value;
}

function activityDate(value: unknown): string | null {
  if (value === '' || value === null) return null;
  if (typeof value !== 'string' || !isoDatePattern.test(value)) {
    throw new GalleryValidationError('Invalid activity date');
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new GalleryValidationError('Invalid activity date');
  }
  return value;
}

export function parseGalleryFields(values: Record<string, unknown>): GalleryFields {
  const allowed = new Set([
    'title', 'caption', 'altText', 'category', 'activityDate', 'displayOrder',
    'sourceReference', 'subjectVisibility', 'subjectPermissionReference', 'guardianPermissionReference'
  ]);
  if (Object.keys(values).some(key => !allowed.has(key))) throw new GalleryValidationError('Invalid gallery content');
  if (typeof values.category !== 'string' || !galleryCategories.includes(values.category as GalleryCategory)) {
    throw new GalleryValidationError('Invalid gallery category');
  }
  if (values.subjectVisibility !== 'none' && values.subjectVisibility !== 'adults' &&
      values.subjectVisibility !== 'minors' && values.subjectVisibility !== 'unknown') {
    throw new GalleryValidationError('Invalid subject visibility');
  }
  const order = typeof values.displayOrder === 'string' && /^\d{1,4}$/.test(values.displayOrder)
    ? Number(values.displayOrder)
    : values.displayOrder;
  if (typeof order !== 'number' || !Number.isSafeInteger(order) || order < 0 || order > 9999) {
    throw new GalleryValidationError('Invalid display order');
  }
  const sourceReference = optionalReference(values.sourceReference);
  if (!sourceReference) throw new GalleryValidationError('Source reference required');
  const subjectPermissionReference = optionalReference(values.subjectPermissionReference);
  const guardianPermissionReference = optionalReference(values.guardianPermissionReference);
  if ((values.subjectVisibility === 'adults' || values.subjectVisibility === 'minors') && !subjectPermissionReference) {
    throw new GalleryValidationError('Permission reference required');
  }
  if (values.subjectVisibility === 'minors' && !guardianPermissionReference) {
    throw new GalleryValidationError('Guardian permission reference required');
  }
  return {
    title: plainText(values.title, 120),
    caption: plainText(values.caption, 300),
    altText: plainText(values.altText, 180),
    category: values.category as GalleryCategory,
    activityDate: activityDate(values.activityDate),
    displayOrder: order,
    sourceReference,
    subjectVisibility: values.subjectVisibility,
    subjectPermissionReference,
    guardianPermissionReference
  };
}

export function parseGalleryReviewReason(value: unknown): GalleryReviewReason {
  if (typeof value !== 'string' || !galleryReviewReasons.includes(value as GalleryReviewReason)) {
    throw new GalleryValidationError('Invalid review reason');
  }
  return value as GalleryReviewReason;
}

export type GalleryPublishChecks = {
  sourceVerified: boolean;
  metadataPrivacyVerified: boolean;
  subjectPermissionVerified: boolean;
  guardianPermissionVerified: boolean;
  mediaPublishingEnabled: boolean;
  minorPublishingEnabled: boolean;
};

export function canPublishGalleryPhoto(
  photo: Pick<CmsGalleryPhoto, 'status' | 'authorEmail' | 'sourceReference' | 'subjectVisibility' | 'subjectPermissionReference' | 'guardianPermissionReference' | 'mediaState'>,
  actor: string,
  checks: GalleryPublishChecks
): boolean {
  if (photo.status !== 'review' || photo.mediaState !== 'ready' || !checks.mediaPublishingEnabled ||
      !checks.sourceVerified || !checks.metadataPrivacyVerified || !photo.sourceReference ||
      photo.authorEmail.trim().toLowerCase() === actor.trim().toLowerCase()) {
    return false;
  }
  if (photo.subjectVisibility === 'unknown') return false;
  if (photo.subjectVisibility === 'adults') {
    return Boolean(photo.subjectPermissionReference) && checks.subjectPermissionVerified;
  }
  if (photo.subjectVisibility === 'minors') {
    return checks.minorPublishingEnabled && Boolean(photo.subjectPermissionReference) &&
      Boolean(photo.guardianPermissionReference) && checks.subjectPermissionVerified &&
      checks.guardianPermissionVerified;
  }
  return photo.subjectVisibility === 'none' && checks.subjectPermissionVerified;
}
