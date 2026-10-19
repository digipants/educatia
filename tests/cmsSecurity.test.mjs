import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { getCmsConfiguration, getCmsRole, isVerifiedGoogleCmsStaff, withCmsStaff } from '../src/lib/cmsSecurity.ts';
import { getAdminConfiguration, isAllowedAdministrator } from '../src/lib/adminSecurity.ts';

const env = {
  CMS_CONTENT_ENABLED: 'true',
  CMS_PUBLISHING_ENABLED: 'true',
  CMS_EDITOR_EMAILS: 'EDITOR@example.org',
  CMS_PUBLISHER_EMAILS: 'publisher@example.org',
  MONGODB_URI: 'mongodb://localhost/educatia',
  NEXTAUTH_URL: 'https://educatia.example.org',
  NEXTAUTH_SECRET: 'at-least-thirty-two-secret-characters',
  GOOGLE_CLIENT_ID: 'client',
  GOOGLE_CLIENT_SECRET: 'client-secret'
};

test('editorial access remains disabled by default and fails closed without credentials', () => {
  assert.equal(getCmsConfiguration({}).enabled, false);
  for (const change of [
    { CMS_CONTENT_ENABLED: 'false' }, { MONGODB_URI: '' }, { GOOGLE_CLIENT_ID: '' },
    { GOOGLE_CLIENT_SECRET: '' }, { NEXTAUTH_SECRET: 'weak' },
    { NEXTAUTH_URL: 'http://public.example.org' },
    { CMS_EDITOR_EMAILS: '', CMS_PUBLISHER_EMAILS: '' }
  ]) assert.equal(getCmsConfiguration({ ...env, ...change }).enabled, false);
});

test('verified Google sign-in can authorize CMS independently of applicant access', () => {
  const cms = getCmsConfiguration(env);
  assert.equal(cms.enabled, true);
  assert.equal(getCmsRole(cms, 'editor@example.org'), 'editor');
  assert.equal(getCmsRole(cms, 'publisher@example.org'), 'publisher');
  assert.equal(getCmsRole(cms, 'outsider@example.org'), null);
  assert.equal(isVerifiedGoogleCmsStaff('EDITOR@example.org', true, 'editor@example.org', cms), true);
  assert.equal(isVerifiedGoogleCmsStaff('editor@example.org', false, 'editor@example.org', cms), false);
  assert.equal(isVerifiedGoogleCmsStaff('editor@example.org', true, 'publisher@example.org', cms), false);
  assert.equal(getAdminConfiguration(env).enabled, false);
  assert.equal(isAllowedAdministrator('editor@example.org', getAdminConfiguration(env).administratorEmails), false);
});

test('publishing is separately disabled and editor cannot publish', async () => {
  const off = getCmsConfiguration({ ...env, CMS_PUBLISHING_ENABLED: 'false' });
  assert.equal(off.enabled, true);
  assert.equal(off.publishingEnabled, false);
  let invoked = 0;
  const op = async () => { invoked++; return 'data'; };
  assert.deepEqual(await withCmsStaff(off, 'publisher@example.org', 'publisher', op), { status: 'unauthorized' });
  assert.deepEqual(await withCmsStaff(getCmsConfiguration(env), 'editor@example.org', 'publisher', op), { status: 'unauthorized' });
  assert.equal(invoked, 0);
  assert.deepEqual(await withCmsStaff(getCmsConfiguration(env), 'publisher@example.org', 'publisher', op), { status: 'ok', value: 'data' });
  assert.equal(invoked, 1);
});

test('unverified profile and malformed CMS addresses cannot authorize', () => {
  const conf = getCmsConfiguration({ ...env, CMS_EDITOR_EMAILS: 'editor@example.org,malformed' });
  assert.equal(getCmsRole(conf, 'editor@example.org'), null);
  assert.equal(isVerifiedGoogleCmsStaff('publisher@example.org', 'true', 'publisher@example.org', conf), false);
});

test('the OAuth callback keeps CMS staff independent of applicant feature flags', async () => {
  const src = await readFile(new URL('../src/lib/auth.ts', import.meta.url), 'utf8');
  assert.match(src, /getCmsConfiguration\(process\.env\)/);
  assert.match(src, /applicationAdmin \|\| cmsStaff/);
  assert.match(src, /isVerifiedGoogleCmsStaff/);
  const vars = await readFile(new URL('../.env.example', import.meta.url), 'utf8');
  assert.match(vars, /^CMS_CONTENT_ENABLED=false$/m);
  assert.match(vars, /^CMS_PUBLISHING_ENABLED=false$/m);
  assert.match(vars, /^APPLICATION_STORAGE_ENABLED=false$/m);
  assert.match(vars, /^ADMIN_APPLICATIONS_ENABLED=false$/m);
});
