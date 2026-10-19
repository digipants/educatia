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
export const cmsReviewReasons = [
  'source-needs-verification', 'claim-needs-support', 'privacy-review-needed', 'content-correction-needed'
] as const;
export type CmsReviewReason = typeof cmsReviewReasons[number];
export type CmsPublishChecks = {
  sourceVerified: boolean;
  claimsAccurate: boolean;
  privacyReviewed: boolean;
};
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const controlPattern = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;
const htmlPattern = /<[^>]*>/;
const evidenceReferencePattern = /^[A-Za-z0-9][A-Za-z0-9._/-]{1,79}$/;

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

export function parseEvidenceReference(value: unknown): string {
  if (typeof value !== 'string') throw new CmsValidationError('Invalid source reference');
  const reference = value.trim();
  if (!evidenceReferencePattern.test(reference)) throw new CmsValidationError('Invalid source reference');
  return reference;
}

export function isEvidenceReference(value: unknown): value is string {
  return typeof value === 'string' && evidenceReferencePattern.test(value);
}

export function parseCmsReviewReason(value: unknown): CmsReviewReason {
  if (typeof value !== 'string' || !cmsReviewReasons.includes(value as CmsReviewReason)) {
    throw new CmsValidationError('Invalid review reason');
  }
  return value as CmsReviewReason;
}

export function parseCmsPublishChecks(
  sourceVerified: unknown,
  claimsAccurate: unknown,
  privacyReviewed: unknown
): CmsPublishChecks {
  if (sourceVerified !== 'yes' || claimsAccurate !== 'yes' || privacyReviewed !== 'yes') {
    throw new CmsValidationError('Incomplete publisher review');
  }
  return { sourceVerified: true, claimsAccurate: true, privacyReviewed: true };
}

export function canCmsTransition(
  post: Pick<CmsPost, 'status' | 'authorEmail' | 'evidenceNote'>,
  action: 'submit' | 'publish' | 'return' | 'archive',
  actor: string,
  checks?: CmsPublishChecks
): boolean {
  if (action === 'submit') return post.status === 'draft' && isEvidenceReference(post.evidenceNote);
  if (action === 'return') return post.status === 'review';
  if (action === 'publish') {
    return post.status === 'review' && isEvidenceReference(post.evidenceNote) &&
      checks?.sourceVerified === true && checks.claimsAccurate === true && checks.privacyReviewed === true &&
      post.authorEmail.toLowerCase() !== actor.toLowerCase();
  }
  return post.status === 'published';
}
