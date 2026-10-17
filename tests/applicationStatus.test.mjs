import assert from 'node:assert/strict';
import test from 'node:test';
import {
  APPLICATION_STATUSES,
  parseApplicationStatusMutation,
  updateApplicationStatusAtomically
} from '../src/lib/applicationStatus.ts';
import { getAdminConfiguration, runAsAdministrator } from '../src/lib/adminSecurity.ts';

const applicationId = '4d6f58dc-1d5b-49fa-9627-ec5ed0749bb7';
const mutationId = 'b180b96a-fd61-43cc-bd1f-0ab4056cd44e';
const initialRevision = '2026-04-05T06:07:08.000Z';
const readyEnvironment = {
  ADMIN_APPLICATIONS_ENABLED: 'true',
  APPLICATION_STORAGE_ENABLED: 'true',
  MONGODB_URI: 'mongodb://localhost/educatia',
  NEXTAUTH_URL: 'https://educatia.example.org',
  NEXTAUTH_SECRET: 'test-secret-with-at-least-32-characters-long',
  GOOGLE_CLIENT_ID: 'client-id',
  GOOGLE_CLIENT_SECRET: 'client-secret',
  ADMIN_EMAILS: 'admin@example.org'
};

function mockCollection({ matchedCount = 1, currentStatus = 'New', currentRevision = initialRevision, currentMutationId } = {}) {
  const calls = { updates: [], lookups: [] };
  return {
    calls,
    collection: {
      async updateOne(filter, update) {
        calls.updates.push({ filter, update });
        return { matchedCount };
      },
      async findOne(filter, options) {
        calls.lookups.push({ filter, options });
        if (!currentStatus) return null;
        return currentRevision.includes('T')
          ? { status: currentStatus, updatedAt: new Date(currentRevision) }
          : { status: currentStatus, statusRevision: currentRevision, lastStatusMutationId: currentMutationId };
      }
    }
  };
}

function mutation(expectedStatus = 'New', status = 'In Review', expectedRevision = initialRevision) {
  return { applicationId, expectedStatus, expectedRevision, mutationId, status };
}

test('mutation parser accepts only bounded IDs, revisions, and fixed statuses', () => {
  const validEntries = [
    ['$ACTION_ID_test', 'framework metadata'],
    ['applicationId', applicationId],
    ['expectedStatus', 'New'],
    ['expectedRevision', initialRevision],
    ['mutationId', mutationId],
    ['status', 'In Review']
  ];
  assert.deepEqual(parseApplicationStatusMutation(validEntries), mutation());
  assert.deepEqual(parseApplicationStatusMutation([
    ['applicationId', applicationId],
    ['expectedStatus', 'In Review'],
    ['expectedRevision', mutationId],
    ['mutationId', 'a12e9da0-bc73-4f21-ae21-a9f10a0a888c'],
    ['status', 'Closed']
  ]), {
    applicationId,
    expectedStatus: 'In Review',
    expectedRevision: mutationId,
    mutationId: 'a12e9da0-bc73-4f21-ae21-a9f10a0a888c',
    status: 'Closed'
  });

  for (const entries of [
    [['applicationId', '../private'], ['expectedStatus', 'New'], ['expectedRevision', initialRevision], ['mutationId', mutationId], ['status', 'Closed']],
    [['applicationId', applicationId], ['expectedStatus', 'New'], ['expectedRevision', 'not-a-revision'], ['mutationId', mutationId], ['status', 'Closed']],
    [['applicationId', applicationId], ['expectedStatus', 'New'], ['expectedRevision', initialRevision], ['mutationId', 'bad-id'], ['status', 'Closed']],
    [['applicationId', applicationId], ['expectedStatus', 'New'], ['expectedRevision', initialRevision], ['mutationId', mutationId], ['status', 'Approved']],
    [['applicationId', applicationId], ['expectedStatus', 'New'], ['expectedRevision', initialRevision], ['mutationId', mutationId], ['status', 'Closed'], ['data.fullName', 'PII']],
    [['applicationId', applicationId], ['applicationId', applicationId], ['expectedStatus', 'New'], ['expectedRevision', initialRevision], ['mutationId', mutationId], ['status', 'Closed']],
    [['applicationId', applicationId], ['expectedStatus', 'New'], ['expectedRevision', initialRevision], ['mutationId', mutationId], ['status', new Blob(['file'])]]
  ]) {
    assert.equal(parseApplicationStatusMutation(entries), null);
  }
});

test('all valid statuses can transition with a compare-and-swap revision filter', async () => {
  for (const expectedStatus of APPLICATION_STATUSES) {
    for (const status of APPLICATION_STATUSES) {
      const { collection, calls } = mockCollection({ currentStatus: expectedStatus });
      const result = await updateApplicationStatusAtomically(
        collection,
        mutation(expectedStatus, status),
        'admin@example.org',
        new Date('2026-04-05T06:07:09.000Z')
      );

      if (status === expectedStatus) {
        assert.equal(result, 'unchanged');
        assert.equal(calls.updates.length, 0);
      } else {
        assert.equal(result, 'updated');
        assert.deepEqual(calls.updates[0].filter, {
          _id: applicationId,
          formType: { $in: ['Student', 'Volunteer'] },
          status: expectedStatus,
          updatedAt: new Date(initialRevision),
          statusRevision: { $exists: false }
        });
      }
    }
  }
});

test('status update changes workflow metadata only and persists a new revision token', async () => {
  const { collection, calls } = mockCollection();
  const now = new Date('2026-04-05T06:07:09.000Z');

  await updateApplicationStatusAtomically(collection, mutation('New', 'Contacted'), 'admin@example.org', now);

  const update = calls.updates[0].update.$set;
  const { statusRevision, ...metadata } = update;
  assert.deepEqual(metadata, {
    status: 'Contacted',
    updatedAt: now,
    statusUpdatedAt: now,
    statusUpdatedBy: 'admin@example.org',
    lastStatusMutationId: mutationId
  });
  assert.match(statusRevision, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
});

test('duplicate submission is idempotent but an intervening ABA update remains stale', async () => {
  const duplicate = mockCollection({
    matchedCount: 0,
    currentStatus: 'Closed',
    currentRevision: '91e64ef6-b15c-4ce2-b06f-45f0d1915ad1',
    currentMutationId: mutationId
  });
  assert.equal(await updateApplicationStatusAtomically(
    duplicate.collection,
    mutation('New', 'Closed'),
    'admin@example.org'
  ), 'unchanged');

  const competing = mockCollection({
    matchedCount: 0,
    currentStatus: 'New',
    currentRevision: '91e64ef6-b15c-4ce2-b06f-45f0d1915ad1'
  });
  assert.equal(await updateApplicationStatusAtomically(
    competing.collection,
    mutation('New', 'Closed'),
    'admin@example.org'
  ), 'stale');
  assert.deepEqual(competing.calls.updates[0].filter.status, 'New');
  assert.deepEqual(competing.calls.updates[0].filter.statusRevision, { $exists: false });
  assert.deepEqual(competing.calls.updates[0].filter.updatedAt, new Date(initialRevision));
});

test('disabled storage/admin access, anonymous users, and non-allowlisted users cannot run mutations', async () => {
  const configuration = getAdminConfiguration(readyEnvironment);
  let writes = 0;
  const write = async () => { writes += 1; return 'updated'; };

  const disabled = await runAsAdministrator(
    getAdminConfiguration({ ...readyEnvironment, ADMIN_APPLICATIONS_ENABLED: 'false' }),
    'admin@example.org',
    write
  );
  const storageDisabled = await runAsAdministrator(
    getAdminConfiguration({ ...readyEnvironment, APPLICATION_STORAGE_ENABLED: 'false' }),
    'admin@example.org',
    write
  );
  const anonymous = await runAsAdministrator(configuration, null, write);
  const unauthorized = await runAsAdministrator(configuration, 'other@example.org', write);

  assert.deepEqual(disabled, { status: 'unavailable' });
  assert.deepEqual(storageDisabled, { status: 'unavailable' });
  assert.deepEqual(anonymous, { status: 'unauthenticated' });
  assert.deepEqual(unauthorized, { status: 'unauthorized' });
  assert.equal(writes, 0);
});
