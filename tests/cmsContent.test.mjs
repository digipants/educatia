import assert from 'node:assert/strict';
import test from 'node:test';
import {
  parseCmsFields, parseEvidenceReference, parseCmsReviewReason, canCmsTransition,
  parseCmsPublishChecks, isCmsId, CmsValidationError
} from '../src/lib/cmsContent.ts';

const good = { kind: 'program-update', title: 'Program schedule information', summary: 'Contact our team about learning options.', body: 'Please contact Educatia for details about available sessions.' };

test('editorial model accepts bounded plain text and rejects unexpected keys', () => {
  assert.deepEqual(parseCmsFields(good), good);
  for (const entry of [
    { ...good, owner: 'injected' },
    { ...good, kind: 'donation-proof' },
    { ...good, title: '<script>alert(1)</script>' },
    { ...good, body: 'x'.repeat(4001) },
    { ...good, summary: 'bad\u0000text' },
    { ...good, title: '' }
  ]) assert.throws(() => parseCmsFields(entry), CmsValidationError);
  assert.equal(parseEvidenceReference('PROGRAM-2026-001'), 'PROGRAM-2026-001');
  for (const value of [
    'Checked against the internal program schedule', 'student@example.org',
    'PROGRAM-2026-001\nprivate detail', 'x'.repeat(81), ''
  ]) assert.throws(() => parseEvidenceReference(value), CmsValidationError);
  assert.equal(parseCmsReviewReason('privacy-review-needed'), 'privacy-review-needed');
  assert.throws(() => parseCmsReviewReason('Please call the parent at 1234567890'), CmsValidationError);
  assert.deepEqual(parseCmsPublishChecks('yes', 'yes', 'yes'), {
    sourceVerified: true, claimsAccurate: true, privacyReviewed: true
  });
  for (const values of [['yes', 'yes', 'no'], ['yes', undefined, 'yes'], ['yes', true, 'yes']]) {
    assert.throws(() => parseCmsPublishChecks(...values), CmsValidationError);
  }
  assert.equal(isCmsId('e8d1b88f-1659-43f1-95ab-a030920a4630'), true);
  assert.equal(isCmsId('../applications'), false);
});

test('draft goes to review only with evidence, and publisher may not self-approve', () => {
  const post = { status: 'draft', authorEmail: 'editor@example.org', evidenceNote: '' };
  assert.equal(canCmsTransition(post, 'submit', 'editor@example.org'), false);
  post.evidenceNote = 'PROGRAM-2026-001';
  assert.equal(canCmsTransition(post, 'submit', 'editor@example.org'), true);
  post.status = 'review';
  const checks = { sourceVerified: true, claimsAccurate: true, privacyReviewed: true };
  assert.equal(canCmsTransition(post, 'publish', 'publisher@example.org'), false);
  assert.equal(canCmsTransition(post, 'publish', 'publisher@example.org', { ...checks, privacyReviewed: false }), false);
  assert.equal(canCmsTransition(post, 'publish', 'editor@example.org', checks), false);
  assert.equal(canCmsTransition(post, 'publish', 'publisher@example.org', checks), true);
  assert.equal(canCmsTransition({ ...post, evidenceNote: 'Verified against a program schedule' },
    'publish', 'publisher@example.org', checks), false);
  post.status = 'published';
  assert.equal(canCmsTransition(post, 'archive', 'publisher@example.org'), true);
  post.status = 'archived';
  assert.equal(canCmsTransition(post, 'publish', 'publisher@example.org'), false);
});

test('publisher can return an item under review to draft for correction', () => {
  const underReview = { status: 'review', authorEmail: 'editor@example.org', evidenceNote: 'NEWS-2026-001' };
  assert.equal(canCmsTransition(underReview, 'return', 'publisher@example.org'), true);
  underReview.status = 'draft';
  assert.equal(canCmsTransition(underReview, 'return', 'publisher@example.org'), false);
});
