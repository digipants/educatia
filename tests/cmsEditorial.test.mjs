import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('editorial routes are noindex and private with separate CMS gate', async () => {
  const config = await read('next.config.mjs');
  assert.match(config, /source: '\/admin\/content\/:path\*'/);
  assert.match(config, /no-store, no-cache/);
  const dashboard = await read('src/app/admin/content/page.tsx');
  const detail = await read('src/app/admin/content/[id]/page.tsx');
  for (const page of [dashboard, detail]) {
    assert.match(page, /noarchive: true/);
    assert.doesNotMatch(page, /<\/?main\b/);
  }
  const backend = await read('src/lib/cmsStore.ts');
  assert.match(backend, /getServerSession\(authOptions\)/);
  assert.match(backend, /withCmsStaff\(config, email, required/);
});

test('draft, review, publish and archive paths are separated and revision-protected', async () => {
  const server = await read('src/lib/cmsStore.ts');
  for (const operation of ['createCmsPost', 'editCmsPost', 'submitCmsPost', 'publishCmsPost', 'archiveCmsPost']) {
    assert.match(server, new RegExp(`export async function ${operation}`));
  }
  assert.match(server, /revision: expectedRevision, status: 'draft'/);
  assert.match(server, /revision: expectedRevision, status: 'review'/);
  assert.match(server, /revision: expectedRevision, status: 'published'/);
  const actions = await read('src/app/admin/content/actions.ts');
  assert.match(actions, /withCmsAccess\('publisher'/);
  assert.match(actions, /withCmsAccess\('editor'/);
  assert.match(actions, /parseCmsPublishChecks\(values\.sourceVerified, values\.claimsAccurate, values\.privacyReviewed\)/);
  assert.match(actions, /returnCmsPostToDraft\(id!, values\.expectedRevision, values\.reason\), \{ requirePublishing: false \}\)/);
  assert.match(actions, /archiveCmsPost\(id!, values\.expectedRevision\), \{ requirePublishing: false \}\)/);
  assert.match(actions, /parseCmsActionForm\(form,/);
  const parser = await read('src/lib/cmsActionForm.ts');
  assert.match(parser, /values.has\(key\)/);
  const content = await read('src/lib/cmsContent.ts');
  assert.match(content, /isEvidenceReference\(post\.evidenceNote\)/);
  assert.match(content, /checks\?\.sourceVerified === true && checks\.claimsAccurate === true && checks\.privacyReviewed === true/);
  const detail = await read('src/app/admin/content/[id]/page.tsx');
  assert.match(detail, /name="sourceVerified" type="checkbox" value="yes" required/);
  assert.match(detail, /name="claimsAccurate" type="checkbox" value="yes" required/);
  assert.match(detail, /name="privacyReviewed" type="checkbox" value="yes" required/);
  assert.match(detail, /name="reason" required defaultValue=""/);
  assert.match(detail, /post\.status === 'published' && publisher/);
  assert.match(detail, /post\.status === 'review' && publisher/);
});

test('public site displays only published records and no unsupported example posts', async () => {
  const server = await read('src/lib/cmsStore.ts');
  assert.match(server, /process\.env\.CMS_CONTENT_ENABLED !== 'true'/);
  assert.match(server, /find\(\{ kind: \{ \$in: \['announcement', 'program-update'\] \}, status: 'published' \}/);
  assert.match(server, /\.limit\(12\)/);
  const news = await read('src/app/news-updates/page.tsx');
  assert.match(news, /listPublishedCmsPosts/);
  assert.match(news, /whitespace-pre-line/);
  assert.doesNotMatch(news, /dangerouslySetInnerHTML|demo student|example achievement/i);
  const form = await read('src/app/admin/content/page.tsx');
  assert.doesNotMatch(form, /application storage|backend verification/i);
});
