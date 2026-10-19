import assert from 'node:assert/strict';
import test from 'node:test';
import { parseCmsFields, parseEvidenceNote, canCmsTransition, isCmsId, CmsValidationError } from '../src/lib/cmsContent.ts';

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
  assert.equal(parseEvidenceNote('Checked against internal program schedule'), 'Checked against internal program schedule');
  assert.throws(() => parseEvidenceNote('x'.repeat(401)), CmsValidationError);
  assert.equal(isCmsId('e8d1b88f-1659-43f1-95ab-a030920a4630'), true);
  assert.equal(isCmsId('../applications'), false);
});

test('draft goes to review only with evidence, and publisher may not self-approve', () => {
  const post = { status: 'draft', authorEmail: 'editor@example.org', evidenceNote: '' };
  assert.equal(canCmsTransition(post, 'submit', 'editor@example.org'), false);
  post.evidenceNote = 'Program record checked';
  assert.equal(canCmsTransition(post, 'submit', 'editor@example.org'), true);
  post.status = 'review';
  assert.equal(canCmsTransition(post, 'publish', 'editor@example.org'), false);
  assert.equal(canCmsTransition(post, 'publish', 'publisher@example.org'), true);
  post.status = 'published';
  assert.equal(canCmsTransition(post, 'archive', 'publisher@example.org'), true);
  post.status = 'archived';
  assert.equal(canCmsTransition(post, 'publish', 'publisher@example.org'), false);
});

test('publisher can return an item under review to draft for correction', () => {
  const underReview = { status: 'review', authorEmail: 'editor@example.org', evidenceNote: 'Checked' };
  assert.equal(canCmsTransition(underReview, 'return', 'publisher@example.org'), true);
  underReview.status = 'draft';
  assert.equal(canCmsTransition(underReview, 'return', 'publisher@example.org'), false);
});
