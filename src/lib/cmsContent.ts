export type CmsKind = 'announcement' | 'program-update';
export type CmsStatus = 'draft' | 'review' | 'published' | 'archived';

export type CmsPost = {
  _id: string;
  revision: string;
  kind: CmsKind;
  title: string;
  summary: string;
  body: string;
  evidenceNote: string;
  reviewFeedback?: string;
  status: CmsStatus;
  authorEmail: string;
  createdAt: Date;
  updatedAt: Date;
  reviewedBy?: string;
  publishedAt?: Date;
  archivedAt?: Date;
};

export type CmsFields = Pick<CmsPost, 'kind' | 'title' | 'summary' | 'body'>;
export class CmsValidationError extends Error {}
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const controlPattern = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;
const htmlPattern = /<[^>]*>/;

export function isCmsId(value: unknown): value is string {
  return typeof value === 'string' && uuidPattern.test(value);
}

function safeText(value: unknown, limit: number): string {
  if (typeof value !== 'string') throw new CmsValidationError('Invalid content');
  const text = value.trim().replace(/\r\n/g, '\n');
  if (!text || text.length > limit || controlPattern.test(text) || htmlPattern.test(text)) {
    throw new CmsValidationError('Invalid content');
  }
  return text;
}

export function parseCmsFields(values: Record<string, unknown>): CmsFields {
  const allowed = ['kind', 'title', 'summary', 'body'];
  if (Object.keys(values).some(key => !allowed.includes(key))) throw new CmsValidationError('Invalid content');
  if (values.kind !== 'announcement' && values.kind !== 'program-update') {
    throw new CmsValidationError('Invalid content');
  }
  return {
    kind: values.kind,
    title: safeText(values.title, 120),
    summary: safeText(values.summary, 240),
    body: safeText(values.body, 4000)
  };
}


/**
 * React/Next Server Actions include framework-owned $ACTION_ form fields.
 * Ignore only those; do not weaken the list of accepted application fields.
 */
export function parseCmsActionFields(
  entries: Array<[string, unknown]>,
  expectedKeys: readonly string[]
): Record<string, string> {
  const supplied = entries.filter(([key]) => !key.startsWith('$ACTION_'));
  const keys = supplied.map(([key]) => key);
  if (keys.length !== expectedKeys.length ||
    keys.some(key => !expectedKeys.includes(key)) ||
    new Set(keys).size !== keys.length ||
    supplied.some(([, value]) => typeof value !== 'string')) {
    throw new CmsValidationError('Invalid request');
  }
  return Object.fromEntries(supplied) as Record<string, string>;
}

export function parseEvidenceNote(value: unknown): string {
  return safeText(value, 400);
}

export function canCmsTransition(
  post: Pick<CmsPost, 'status' | 'authorEmail' | 'evidenceNote'>,
  action: 'submit' | 'publish' | 'return' | 'archive',
  actor: string
): boolean {
  if (action === 'submit') return post.status === 'draft' && Boolean(post.evidenceNote);
  if (action === 'return') return post.status === 'review';
  if (action === 'publish') {
    return post.status === 'review' && Boolean(post.evidenceNote) &&
      post.authorEmail.toLowerCase() !== actor.toLowerCase();
  }
  return post.status === 'published';
}
