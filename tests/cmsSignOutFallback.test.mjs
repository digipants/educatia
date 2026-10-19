import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = async path => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('editorial errors provide an exit independently of MongoDB reads', async () => {
  const actions = await read('src/app/admin/content/CmsAccessActions.tsx');
  assert.match(actions, /status === 'unauthenticated'/);
  assert.match(actions, /<CmsAuthButton action="sign-in" \/>/);
  assert.match(actions, /<CmsAuthButton action="sign-out" \/>/);
  assert.match(actions, /href="\/admin\/content"/);
  assert.match(actions, /Retry workspace/);
  assert.match(actions, /min-h-11/);
  assert.doesNotMatch(actions, /MONGODB_URI|GOOGLE_CLIENT_SECRET|NEXTAUTH_SECRET/);
});

test('both CMS pages expose the fallback for unavailable and error states', async () => {
  const dashboard = await read('src/app/admin/content/page.tsx');
  const detail = await read('src/app/admin/content/[id]/page.tsx');
  assert.match(dashboard, /<CmsAccessActions status=\{status\} \/>/);
  assert.match(detail, /<CmsAccessActions status=\{result\.status\} \/>/);
  assert.match(detail, /<CmsAccessActions status="not-found" \/>/);
  assert.match(dashboard, /<CmsAuthButton action="sign-out" \/>/);
  assert.match(detail, /<CmsAuthButton action="sign-out" \/>/);
  assert.match(dashboard, /robots: \{ index: false/);
  assert.match(detail, /robots: \{ index: false/);
});

test('the CMS sign-out retains NextAuth session termination', async () => {
  const button = await read('src/app/admin/content/CmsAuthButton.tsx');
  assert.match(button, /signOut\(\{ callbackUrl: '\/admin\/content' \}\)/);
  assert.match(button, /'Sign out'/);
});
