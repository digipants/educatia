import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  galleryPurgeKeys, galleryUploadLocked, isSafeGalleryStorageKey, MAX_GALLERY_CLEANUP_KEYS,
  planGalleryUpload
} from '../src/lib/cmsGalleryWorkflow.ts';
import { canPublishGalleryPhoto, parseGalleryFields, parseGalleryReviewReason } from '../src/lib/cmsGalleryContent.ts';
import { getCmsGalleryConfiguration } from '../src/lib/cmsGallerySecurity.ts';
import { getCmsConfiguration, withCmsStaff } from '../src/lib/cmsSecurity.ts';
import { isSameOriginMutation } from '../src/lib/cmsRequestSecurity.ts';

const photoId = '11111111-1111-4111-8111-111111111111';
const revision = '22222222-2222-4222-8222-222222222222';
const originalToken = '33333333-3333-4333-8333-333333333333';
const retryToken = '44444444-4444-4444-8444-444444444444';
const activeToken = '55555555-5555-4555-8555-555555555555';
const originalKey = `gallery/${photoId}/${activeToken}/display.webp`;
const thumbnailKey = `gallery/${photoId}/${activeToken}/thumbnail.webp`;
const now = new Date('2026-06-01T00:00:00.000Z');

const fields = {
  title: 'Learning activity', caption: 'Students work together on a lesson.',
  altText: 'A group works around a classroom table.', category: 'school-visits',
  activityDate: '2026-05-31', displayOrder: '4', sourceReference: 'RIGHTS-2026-01',
  subjectVisibility: 'none', subjectPermissionReference: '', guardianPermissionReference: ''
};

test('gallery metadata permits bounded text and rejects unsafe or identifying additions', () => {
  assert.deepEqual(parseGalleryFields(fields), {
    ...fields, displayOrder: 4
  });
  for (const change of [
    { category: 'other' }, { activityDate: '2026-02-30' }, { title: '<script>alert(1)</script>' },
    { sourceReference: 'name@example.com' }, { subjectVisibility: 'unknown', extra: 'PII' },
    { subjectVisibility: 'minors', subjectPermissionReference: 'CONSENT-1' }
  ]) assert.throws(() => parseGalleryFields({ ...fields, ...change }));
  assert.equal(parseGalleryReviewReason('permission-record'), 'permission-record');
  assert.throws(() => parseGalleryReviewReason('guardian called from 555-1234'));
});

test('gallery publication denies missing evidence, self approval, unknown subjects and minors by default', () => {
  const base = {
    status: 'review', authorEmail: 'editor@example.org', sourceReference: 'RIGHTS-1',
    subjectVisibility: 'none', subjectPermissionReference: '', guardianPermissionReference: '',
    mediaState: 'ready'
  };
  const checks = {
    sourceVerified: true, metadataPrivacyVerified: true,
    subjectPermissionVerified: true, guardianPermissionVerified: true,
    mediaPublishingEnabled: true, minorPublishingEnabled: false
  };
  assert.equal(canPublishGalleryPhoto(base, 'publisher@example.org', checks), true);
  assert.equal(canPublishGalleryPhoto(base, 'editor@example.org', checks), false);
  assert.equal(canPublishGalleryPhoto(base, 'publisher@example.org', { ...checks, sourceVerified: false }), false);
  assert.equal(canPublishGalleryPhoto(base, 'publisher@example.org', { ...checks, metadataPrivacyVerified: false }), false);
  assert.equal(canPublishGalleryPhoto({ ...base, subjectVisibility: 'unknown' }, 'publisher@example.org', checks), false);
  assert.equal(canPublishGalleryPhoto({ ...base, subjectVisibility: 'minors', subjectPermissionReference: 'C-1', guardianPermissionReference: 'G-1' }, 'publisher@example.org', checks), false);
  assert.equal(canPublishGalleryPhoto({ ...base, subjectVisibility: 'minors', subjectPermissionReference: 'C-1', guardianPermissionReference: 'G-1' }, 'publisher@example.org', { ...checks, minorPublishingEnabled: true }), true);
});

test('media storage and public publication require explicit independent gates and an approved region', () => {
  assert.deepEqual(getCmsGalleryConfiguration({}), {
    enabled: false, publishingEnabled: false, minorPublishingEnabled: false, storageRegion: null
  });
  const configured = {
    CMS_CONTENT_ENABLED: 'true', CMS_MEDIA_ENABLED: 'true', CMS_PUBLISHING_ENABLED: 'false',
    CMS_MEDIA_PUBLISHING_ENABLED: 'true', CMS_MINOR_MEDIA_PUBLISHING_ENABLED: 'true',
    CMS_MEDIA_STORAGE_REGION: 'ap-southeast-1'
  };
  assert.equal(getCmsGalleryConfiguration(configured).enabled, true);
  assert.equal(getCmsGalleryConfiguration(configured).publishingEnabled, true);
  assert.equal(getCmsGalleryConfiguration(configured).minorPublishingEnabled, true);
  assert.equal(getCmsGalleryConfiguration({ ...configured, CMS_MEDIA_PUBLISHING_ENABLED: 'false' }).publishingEnabled, false);
  assert.equal(getCmsGalleryConfiguration({ ...configured, CMS_MEDIA_STORAGE_REGION: 'ap-south-1' }).enabled, false);
  assert.equal(getCmsGalleryConfiguration({ ...configured, CMS_MEDIA_ENABLED: 'false' }).publishingEnabled, false);
});

test('CMS roles keep editor and publisher responsibilities distinct while allowing safe returns with publishing off', async () => {
  const configuration = getCmsConfiguration({
    CMS_CONTENT_ENABLED: 'true', CMS_PUBLISHING_ENABLED: 'false',
    MONGODB_URI: 'mongodb://localhost/educatia', GOOGLE_CLIENT_ID: 'client', GOOGLE_CLIENT_SECRET: 'secret',
    NEXTAUTH_URL: 'https://educatia.example.org', NEXTAUTH_SECRET: 'this-is-a-test-secret-with-over-32-characters',
    CMS_EDITOR_EMAILS: 'editor@example.org', CMS_PUBLISHER_EMAILS: 'publisher@example.org'
  });
  const operation = async () => 'allowed';
  assert.deepEqual(await withCmsStaff(configuration, 'editor@example.org', 'publisher', operation), { status: 'unauthorized' });
  assert.deepEqual(await withCmsStaff(configuration, 'outsider@example.org', 'editor', operation), { status: 'unauthorized' });
  assert.deepEqual(await withCmsStaff(configuration, 'publisher@example.org', 'publisher', operation), { status: 'unauthorized' });
  assert.deepEqual(await withCmsStaff(configuration, 'publisher@example.org', 'publisher', operation, { requirePublishing: false }), {
    status: 'ok', value: 'allowed'
  });
});

test('gallery uploads require an exact same-origin mutation request', () => {
  const request = headers => new Request('https://educatia.example/api/upload', { method: 'POST', headers });
  assert.equal(isSameOriginMutation(request({ host: 'educatia.example', origin: 'https://educatia.example' })), true);
  assert.equal(isSameOriginMutation(request({ host: 'educatia.example', origin: 'https://other.example' })), false);
  assert.equal(isSameOriginMutation(request({ host: 'educatia.example', origin: 'https://educatia.example', 'sec-fetch-site': 'cross-site' })), false);
  assert.equal(isSameOriginMutation(request({ host: 'educatia.example' })), false);
});

test('upload retries use fresh keys, wait out in-flight work, and track abandoned objects', () => {
  const initial = planGalleryUpload({ mediaState: 'missing', cleanupKeys: [] }, photoId, originalToken, now);
  assert.ok(initial);
  assert.notEqual(initial.displayKey, initial.thumbnailKey);
  assert.deepEqual(initial.previousKeys, []);

  const pendingPhoto = {
    mediaState: 'pending', cleanupKeys: [], mediaKeys: { display: originalKey, thumbnail: thumbnailKey },
    pendingUpload: initial
  };
  assert.equal(galleryUploadLocked(pendingPhoto, new Date(now.getTime() + 60_000)), true);
  assert.equal(galleryUploadLocked(pendingPhoto, new Date(now.getTime() + 16 * 60_000)), false);
  assert.equal(planGalleryUpload(pendingPhoto, photoId, retryToken, new Date(now.getTime() + 60_000)), null);
  const retry = planGalleryUpload(pendingPhoto, photoId, retryToken, new Date(now.getTime() + 16 * 60_000));
  assert.ok(retry);
  assert.notEqual(retry.displayKey, initial.displayKey);
  assert.deepEqual(retry.previousKeys, [originalKey, thumbnailKey, initial.displayKey, initial.thumbnailKey]);
  assert.equal(planGalleryUpload({ ...pendingPhoto, cleanupKeys: [originalKey] }, photoId, revision, now), null);
  assert.equal(planGalleryUpload({ ...pendingPhoto, mediaState: 'purging' }, photoId, revision, now), null);
  assert.equal(planGalleryUpload({ ...pendingPhoto, mediaKeys: { display: 'https://example.org/p.jpg', thumbnail: thumbnailKey } }, photoId, revision, new Date(now.getTime() + 16 * 60_000)), null);
});

test('purge plans cover current, pending and queued objects and reject malformed storage paths', () => {
  const plan = planGalleryUpload({ mediaState: 'missing', cleanupKeys: [] }, photoId, revision, now);
  const keys = galleryPurgeKeys({
    cleanupKeys: [originalKey], mediaKeys: { display: originalKey, thumbnail: thumbnailKey },
    pendingUpload: plan
  });
  assert.deepEqual(keys, [originalKey, thumbnailKey, plan.displayKey, plan.thumbnailKey]);
  assert.equal(galleryPurgeKeys({ cleanupKeys: ['../secret'], mediaKeys: undefined, pendingUpload: undefined }), null);
  assert.equal(isSafeGalleryStorageKey(originalKey), true);
  assert.equal(isSafeGalleryStorageKey('../secret'), false);
  assert.ok(MAX_GALLERY_CLEANUP_KEYS >= 8);
});

test('gallery admin and public paths enforce server authorization, revisions and published-only visibility', async () => {
  const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
  const store = await read('src/lib/cmsGalleryStore.ts');
  const actions = await read('src/app/admin/content/gallery/actions.ts');
  const upload = await read('src/app/api/cms/gallery/[id]/upload/route.ts');
  const media = await read('src/app/api/cms/gallery/[id]/media/[variant]/route.ts');
  assert.match(store, /findOne\(\{ _id: id, kind: 'gallery-photo', revision: expectedRevision, status: 'draft' \}\)/);
  assert.match(store, /if \(!configuration\.enabled\) return \{ status: 'unavailable' \}/);
  assert.match(store, /revision: expectedRevision, status: 'review', mediaState: 'ready'/);
  assert.match(store, /status: 'published', mediaState: 'ready'/);
  assert.match(store, /limit\(60\)/);
  assert.match(actions, /withCmsGalleryAccess\('publisher'/);
  assert.match(actions, /withCmsGalleryAccess\('editor'/);
  assert.match(store, /requiresGalleryPublishing && !configuration\.publishingEnabled/);
  assert.match(store, /withCmsAccess\(required, operation, \{ requirePublishing: false \}\)/);
  assert.match(upload, /isSameOriginMutation\(request\)/);
  assert.match(upload, /readBoundedMultipartBytes/);
  assert.match(upload, /withCmsAccess\('editor'/);
  assert.match(upload, /prepared === 'retry-later'/);
  assert.match(media, /private, no-store/);
  assert.match(media, /withCmsAccess\('editor'/);
  assert.doesNotMatch(media, /key.*searchParams|searchParams.*key/i);
});
