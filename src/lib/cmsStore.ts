import 'server-only';
import { randomUUID } from 'node:crypto';
import { getServerSession } from 'next-auth';
import { getDb } from './server';
import { authOptions } from './auth';
import { getCmsConfiguration, getCmsRole, withCmsStaff, type CmsRole } from './cmsSecurity';
import {
  canCmsTransition, type CmsFields, type CmsPost, isCmsId, parseEvidenceNote
} from './cmsContent';

type StoreResult = 'saved' | 'stale' | 'duplicate';

async function cmsCollection() {
  return (await getDb()).collection<CmsPost>('cmsPosts', {
    writeConcern: { w: 'majority', j: true }
  });
}

export async function withCmsAccess<T>(required: CmsRole, operation: (email: string) => Promise<T>) {
  const config = getCmsConfiguration(process.env);
  if (!config.enabled) return { status: 'unavailable' } as const;
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    return await withCmsStaff(config, email, required, () => operation((email ?? '').trim().toLowerCase()));
  } catch {
    console.warn('educatia_cms_session_failure');
    return { status: 'error' } as const;
  }
}

export async function listCmsPosts() {
  return withCmsAccess('editor', async () => {
    const posts = await (await cmsCollection())
      .find({}, { projection: { title: 1, kind: 1, status: 1, authorEmail: 1, updatedAt: 1, revision: 1 } })
      .sort({ updatedAt: -1 }).limit(50).toArray();
    return posts.map(post => ({
      id: post._id,
      title: post.title,
      kind: post.kind,
      status: post.status,
      author: post.authorEmail,
      updatedAt: post.updatedAt.toISOString(),
      revision: post.revision
    }));
  });
}

export async function readCmsPost(id: string) {
  return withCmsAccess('editor', async () => {
    if (!isCmsId(id)) return null;
    const post = await (await cmsCollection()).findOne({ _id: id });
    if (!post) return null;
    return {
      id: post._id, revision: post.revision, title: post.title, kind: post.kind,
      summary: post.summary, body: post.body, evidenceNote: post.evidenceNote, reviewFeedback: post.reviewFeedback ?? '',
      status: post.status, authorEmail: post.authorEmail,
      updatedAt: post.updatedAt.toISOString(), publishedAt: post.publishedAt?.toISOString() ?? null
    };
  });
}

export async function createCmsPost(id: string, fields: CmsFields, actor: string): Promise<StoreResult> {
  if (!isCmsId(id)) return 'stale';
  const now = new Date();
  const post: CmsPost = {
    _id: id, revision: randomUUID(), ...fields,
    evidenceNote: '', reviewFeedback: '', status: 'draft', authorEmail: actor,
    createdAt: now, updatedAt: now
  };
  try {
    await (await cmsCollection()).insertOne(post);
    return 'saved';
  } catch (error) {
    if ((error as { code?: number })?.code === 11000) return 'duplicate';
    throw error;
  }
}

export async function editCmsPost(
  id: string, expectedRevision: string, fields: CmsFields
): Promise<StoreResult> {
  if (!isCmsId(id) || !isCmsId(expectedRevision)) return 'stale';
  const result = await (await cmsCollection()).updateOne(
    { _id: id, revision: expectedRevision, status: 'draft' },
    { $set: { ...fields, updatedAt: new Date(), revision: randomUUID() } }
  );
  return result.modifiedCount === 1 ? 'saved' : 'stale';
}

export async function submitCmsPost(
  id: string, expectedRevision: string, note: string
): Promise<StoreResult> {
  if (!isCmsId(id) || !isCmsId(expectedRevision)) return 'stale';
  const evidenceNote = parseEvidenceNote(note);
  const result = await (await cmsCollection()).updateOne(
    { _id: id, revision: expectedRevision, status: 'draft' },
    { $set: { status: 'review', evidenceNote, updatedAt: new Date(), revision: randomUUID() } }
  );
  return result.modifiedCount === 1 ? 'saved' : 'stale';
}

export async function returnCmsPostToDraft(
  id: string, expectedRevision: string, feedback: string
): Promise<StoreResult> {
  if (!isCmsId(id) || !isCmsId(expectedRevision)) return 'stale';
  const reviewFeedback = parseEvidenceNote(feedback);
  const now = new Date();
  const result = await (await cmsCollection()).updateOne(
    { _id: id, revision: expectedRevision, status: 'review' },
    { $set: {
      status: 'draft', reviewFeedback, evidenceNote: '',
      updatedAt: now, revision: randomUUID()
    } }
  );
  return result.modifiedCount === 1 ? 'saved' : 'stale';
}

export async function publishCmsPost(
  id: string, expectedRevision: string, reviewer: string
): Promise<StoreResult> {
  if (!isCmsId(id) || !isCmsId(expectedRevision)) return 'stale';
  const collection = await cmsCollection();
  const post = await collection.findOne({ _id: id, revision: expectedRevision }, {
    projection: { status: 1, authorEmail: 1, evidenceNote: 1 }
  });
  if (!post || !canCmsTransition(post, 'publish', reviewer)) return 'stale';
  const now = new Date();
  const result = await collection.updateOne(
    { _id: id, revision: expectedRevision, status: 'review' },
    { $set: { status: 'published', reviewedBy: reviewer, publishedAt: now, updatedAt: now, revision: randomUUID() } }
  );
  return result.modifiedCount === 1 ? 'saved' : 'stale';
}

export async function archiveCmsPost(id: string, expectedRevision: string): Promise<StoreResult> {
  if (!isCmsId(id) || !isCmsId(expectedRevision)) return 'stale';
  const now = new Date();
  const result = await (await cmsCollection()).updateOne(
    { _id: id, revision: expectedRevision, status: 'published' },
    { $set: { status: 'archived', archivedAt: now, updatedAt: now, revision: randomUUID() } }
  );
  return result.modifiedCount === 1 ? 'saved' : 'stale';
}

export async function listPublishedCmsPosts() {
  if (process.env.CMS_CONTENT_ENABLED !== 'true') return [];
  try {
    const posts = await (await cmsCollection())
      .find({ status: 'published' }, {
        projection: { title: 1, summary: 1, body: 1, kind: 1, publishedAt: 1 }
      })
      .sort({ publishedAt: -1 }).limit(12).toArray();
    return posts
      .filter(post => typeof post.title === 'string' && typeof post.summary === 'string'
        && typeof post.body === 'string' && post.publishedAt instanceof Date)
      .map(post => ({
        id: post._id, title: post.title.slice(0, 120), summary: post.summary.slice(0, 240),
        body: post.body.slice(0, 4000), kind: post.kind, publishedAt: post.publishedAt!.toISOString()
      }));
  } catch {
    // Do not leak operational details or ever fall back to non-approved drafts.
    return [];
  }
}

export function cmsRoleForEmail(email: unknown) {
  return getCmsRole(getCmsConfiguration(process.env), email);
}
