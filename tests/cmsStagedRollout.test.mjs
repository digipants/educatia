import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { getCmsConfiguration, withCmsStaff } from '../src/lib/cmsSecurity.ts';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');
const staging = {
  CMS_CONTENT_ENABLED: 'true',
  CMS_PUBLISHING_ENABLED: 'false',
  CMS_EDITOR_EMAILS: 'editor@example.test',
  CMS_PUBLISHER_EMAILS: 'publisher@example.test',
  MONGODB_URI: 'mongodb://localhost/educatia',
  GOOGLE_CLIENT_ID: 'testing',
  GOOGLE_CLIENT_SECRET: 'testing',
  NEXTAUTH_SECRET: '32-chars-minimum-test-secret-safe-only',
  NEXTAUTH_URL: 'https://educatia.example.test'
};

test('staged CMS gates publishing but allows explicitly non-publishing publisher actions', async () => {
  const cfg = getCmsConfiguration(staging);
  assert.equal(cfg.enabled, true);
  assert.equal(cfg.publishingEnabled, false);
  let writes = 0;
  const operation = async () => { writes++; return true; };
  for (const email of ['editor@example.test', 'publisher@example.test']) {
    assert.equal((await withCmsStaff(cfg,email,'editor',operation)).status, 'ok');
    assert.equal((await withCmsStaff(cfg,email,'publisher',operation)).status, 'unauthorized');
  }
  assert.equal((await withCmsStaff(cfg, 'publisher@example.test', 'publisher', operation, {
    requirePublishing: false
  })).status, 'ok');
  assert.equal(writes,3);
});

test('the protected CMS dashboard and review screen explain paused publication', async () => {
  const dashboard = await read('src/app/admin/content/page.tsx');
  const detail = await read('src/app/admin/content/[id]/page.tsx');
  assert.match(dashboard, /getCmsConfiguration\(process\.env\)\.publishingEnabled/);
  assert.match(dashboard, /Publishing is paused until the team finishes its access checks/);
  assert.match(detail, /Publishing is paused\. You can still return this item for correction/);
  assert.match(detail, /post\.status === 'review' && publisher/);
  assert.match(detail, /post\.status === 'published' && publisher/);
  assert.match(dashboard, /result\.status !== 'ok'/);
  assert.match(detail, /result\.status !== 'ok'/);
});
