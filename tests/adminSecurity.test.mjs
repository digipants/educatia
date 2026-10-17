import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getAdminConfiguration,
  isValidApplicationId,
  isVerifiedGoogleAdministrator,
  parseApplicationPagination,
  readAsAdministrator
} from '../src/lib/adminSecurity.ts';

const readyEnvironment = {
  ADMIN_APPLICATIONS_ENABLED: 'true',
  APPLICATION_STORAGE_ENABLED: 'true',
  MONGODB_URI: 'mongodb://localhost/educatia',
  NEXTAUTH_URL: 'https://educatia.example.org',
  NEXTAUTH_SECRET: 'test-secret-with-at-least-32-characters-long',
  GOOGLE_CLIENT_ID: 'client-id',
  GOOGLE_CLIENT_SECRET: 'client-secret',
  ADMIN_EMAILS: 'admin@example.org,second@example.org'
};

test('admin inbox configuration remains unavailable until every explicit prerequisite is present', () => {
  assert.equal(getAdminConfiguration({}).enabled, false);
  assert.equal(getAdminConfiguration({ ...readyEnvironment, APPLICATION_STORAGE_ENABLED: 'false' }).enabled, false);
  assert.equal(getAdminConfiguration({ ...readyEnvironment, ADMIN_APPLICATIONS_ENABLED: 'false' }).enabled, false);
  assert.equal(getAdminConfiguration({ ...readyEnvironment, ADMIN_EMAILS: '' }).enabled, false);
  assert.equal(getAdminConfiguration({ ...readyEnvironment, GOOGLE_CLIENT_SECRET: '' }).enabled, false);
  assert.equal(getAdminConfiguration({ ...readyEnvironment, NEXTAUTH_SECRET: 'weak' }).enabled, false);
  assert.equal(getAdminConfiguration({ ...readyEnvironment, NEXTAUTH_URL: 'http://admin.example.org' }).enabled, false);
  assert.equal(getAdminConfiguration(readyEnvironment).enabled, true);
});

test('only a provider-verified Google email exactly matching the allowlist is accepted', () => {
  const configuration = getAdminConfiguration(readyEnvironment);
  assert.equal(isVerifiedGoogleAdministrator('admin@example.org', true, 'admin@example.org', configuration.administratorEmails), true);
  assert.equal(isVerifiedGoogleAdministrator('admin@example.org', false, 'admin@example.org', configuration.administratorEmails), false);
  assert.equal(isVerifiedGoogleAdministrator('admin@example.org.attacker.test', true, 'admin@example.org.attacker.test', configuration.administratorEmails), false);
  assert.equal(isVerifiedGoogleAdministrator('admin@example.org', true, 'other@example.org', configuration.administratorEmails), false);
});

test('unauthenticated and non-allowlisted reads never invoke the database callback', async () => {
  const configuration = getAdminConfiguration(readyEnvironment);
  let reads = 0;
  const read = async () => { reads += 1; return [{ name: 'minor private data' }]; };

  const anonymous = await readAsAdministrator(configuration, null, read);
  const unauthorized = await readAsAdministrator(configuration, 'outsider@example.org', read);
  const disabled = await readAsAdministrator(
    getAdminConfiguration({ ...readyEnvironment, APPLICATION_STORAGE_ENABLED: 'false' }),
    'admin@example.org',
    read
  );

  assert.deepEqual(anonymous, { status: 'unauthenticated' });
  assert.deepEqual(unauthorized, { status: 'unauthorized' });
  assert.deepEqual(disabled, { status: 'unavailable' });
  assert.equal(JSON.stringify([anonymous, unauthorized, disabled]).includes('minor private data'), false);
  assert.equal(reads, 0);
});

test('database errors return a generic result without including the error or record data', async () => {
  const result = await readAsAdministrator(
    getAdminConfiguration(readyEnvironment),
    'admin@example.org',
    async () => { throw new Error('sensitive query failure with private applicant name'); }
  );

  assert.deepEqual(result, { status: 'error' });
});

test('pagination defaults to 20, allows at most 50, and rejects malformed or ambiguous values', () => {
  assert.deepEqual(parseApplicationPagination({}), { page: 1, limit: 20, skip: 0 });
  assert.deepEqual(parseApplicationPagination({ page: '3', limit: '50' }), { page: 3, limit: 50, skip: 100 });
  for (const input of [
    { page: '0' },
    { page: '-1' },
    { page: '10001' },
    { limit: '51' },
    { limit: ['20', '50'] },
    { page: '1.5' }
  ]) {
    assert.equal(parseApplicationPagination(input), null);
  }
});

test('application detail accepts only persisted UUID identifiers', () => {
  assert.equal(isValidApplicationId('4d6f58dc-1d5b-49fa-9627-ec5ed0749bb7'), true);
  assert.equal(isValidApplicationId('../applications'), false);
  assert.equal(isValidApplicationId('507f1f77bcf86cd799439011'), false);
});
