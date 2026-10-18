import assert from 'node:assert/strict';
import test from 'node:test';
import {
  APPLICATION_ASSIGNMENT_DETAIL_PROJECTION,
  APPLICATION_ASSIGNMENT_SUMMARY_PROJECTION,
  currentAllowlistedAssignee,
  parseApplicationAssignmentMutation,
  updateApplicationAssignmentAtomically
} from '../src/lib/applicationAssignment.ts';
import { getAdminConfiguration, runAsAdministrator } from '../src/lib/adminSecurity.ts';

const applicationId = '4d6f58dc-1d5b-49fa-9627-ec5ed0749bb7';
const firstMutationId = 'b180b96a-fd61-43cc-bd1f-0ab4056cd44e';
const secondMutationId = 'a12e9da0-bc73-4f21-ae21-a9f10a0a888c';
const firstRevision = '91e64ef6-b15c-4ce2-b06f-45f0d1915ad1';
const secondRevision = '6a7bc93e-44b9-4d81-b245-53b8ae8ff480';
const administratorEmails = ['admin@example.org', 'other-admin@example.org'];
const readyEnvironment = {
  ADMIN_APPLICATIONS_ENABLED: 'true',
  APPLICATION_STORAGE_ENABLED: 'true',
  MONGODB_URI: 'mongodb://localhost/educatia',
  NEXTAUTH_URL: 'https://educatia.example.org',
  NEXTAUTH_SECRET: 'test-secret-with-at-least-32-characters-long',
  GOOGLE_CLIENT_ID: 'client-id',
  GOOGLE_CLIENT_SECRET: 'client-secret',
  ADMIN_EMAILS: administratorEmails.join(',')
};

function mutation(assignedTo = 'admin@example.org', expectedRevision = '', mutationId = firstMutationId) {
  return { applicationId, expectedRevision, mutationId, assignedTo };
}

function createCollection({ record, matchedCount = 1 } = {}) {
  const calls = { updates: [], reads: [] };
  return {
    calls,
    collection: {
      async findOne(filter, options) {
        calls.reads.push({ filter, options });
        return record ? { ...record } : null;
      },
      async updateOne(filter, update) {
        calls.updates.push({ filter, update });
        return { matchedCount };
      }
    }
  };
}

function legacyRecord(extra = {}) {
  return { _id: applicationId, formType: 'Student', ...extra };
}

function formEntries({ assignedTo = 'admin@example.org', revision = '', mutationId = firstMutationId } = {}) {
  return [
    ['$ACTION_ID_test', 'framework metadata'],
    ['applicationId', applicationId],
    ['expectedAssignmentRevision', revision],
    ['mutationId', mutationId],
    ['assignedTo', assignedTo]
  ];
}

test('assignment parser allows only unassigned or an exact configured administrator', () => {
  assert.deepEqual(parseApplicationAssignmentMutation(formEntries(), administratorEmails), mutation());
  assert.deepEqual(
    parseApplicationAssignmentMutation(formEntries({ assignedTo: '' }), administratorEmails),
    mutation(null)
  );
  assert.equal(parseApplicationAssignmentMutation(formEntries({ assignedTo: 'outsider@example.org' }), administratorEmails), null);
  assert.equal(parseApplicationAssignmentMutation(formEntries({ assignedTo: 'admin@example.org.attacker.test' }), administratorEmails), null);
  assert.equal(parseApplicationAssignmentMutation(formEntries({ assignedTo: ' admin@example.org ' }), administratorEmails), null);
});

test('inbox display hides assignees no longer in the configured allowlist', () => {
  assert.equal(currentAllowlistedAssignee('ADMIN@example.org', administratorEmails), 'admin@example.org');
  assert.equal(currentAllowlistedAssignee('removed-admin@example.org', administratorEmails), null);
  assert.equal(currentAllowlistedAssignee(null, administratorEmails), null);
});

test('assignment parser rejects malformed IDs, duplicate or unexpected fields, and non-string input', () => {
  for (const entries of [
    [['applicationId', '../private'], ['expectedAssignmentRevision', ''], ['mutationId', firstMutationId], ['assignedTo', '']],
    [['applicationId', applicationId], ['expectedAssignmentRevision', 'bad-revision'], ['mutationId', firstMutationId], ['assignedTo', '']],
    [['applicationId', applicationId], ['expectedAssignmentRevision', ''], ['mutationId', 'bad-id'], ['assignedTo', '']],
    [...formEntries(), ['assignedTo', '']],
    [...formEntries(), ['data.fullName', 'private applicant data']],
    formEntries({ assignedTo: new Blob(['unexpected file']) })
  ]) {
    assert.equal(parseApplicationAssignmentMutation(entries, administratorEmails), null);
  }
});

test('legacy applications can be assigned with a guarded missing-revision compare-and-swap', async () => {
  const { collection, calls } = createCollection({ record: legacyRecord() });
  const now = new Date('2026-04-05T06:07:09.000Z');

  assert.equal(await updateApplicationAssignmentAtomically(collection, mutation(), 'admin@example.org', now), 'updated');
  assert.deepEqual(calls.updates[0].filter, {
    _id: applicationId,
    formType: { $in: ['Student', 'Volunteer'] },
    assignmentRevision: { $exists: false },
    assignedTo: { $exists: false }
  });
  const set = calls.updates[0].update.$set;
  const { assignmentRevision, ...metadata } = set;
  assert.deepEqual(metadata, {
    assignedTo: 'admin@example.org',
    assignedAt: now,
    assignedBy: 'admin@example.org',
    lastAssignmentMutationId: firstMutationId
  });
  assert.match(assignmentRevision, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assert.deepEqual(Object.keys(set).sort(), [
    'assignedAt', 'assignedBy', 'assignedTo', 'assignmentRevision', 'lastAssignmentMutationId'
  ]);
});

test('unassigning clears the assignee while retaining bounded audit metadata', async () => {
  const { collection, calls } = createCollection({
    record: legacyRecord({ assignedTo: 'other-admin@example.org', assignmentRevision: firstRevision })
  });
  const now = new Date('2026-04-05T06:07:09.000Z');

  assert.equal(await updateApplicationAssignmentAtomically(
    collection,
    mutation(null, firstRevision),
    'admin@example.org',
    now
  ), 'updated');
  assert.deepEqual(calls.updates[0].filter.assignmentRevision, firstRevision);
  assert.equal(calls.updates[0].update.$set.assignedTo, null);
  assert.equal(calls.updates[0].update.$set.assignedAt, now);
  assert.equal(calls.updates[0].update.$set.assignedBy, 'admin@example.org');
  assert.equal(calls.updates[0].update.$set.lastAssignmentMutationId, firstMutationId);
});

test('same assignment is unchanged and duplicate submissions are idempotent', async () => {
  const alreadyAssigned = createCollection({
    record: legacyRecord({ assignedTo: 'admin@example.org', assignmentRevision: firstRevision })
  });
  assert.equal(await updateApplicationAssignmentAtomically(
    alreadyAssigned.collection,
    mutation('admin@example.org', firstRevision),
    'admin@example.org'
  ), 'unchanged');
  assert.equal(alreadyAssigned.calls.updates.length, 0);

  const duplicate = createCollection({
    matchedCount: 0,
    record: legacyRecord({
      assignedTo: 'admin@example.org',
      assignmentRevision: secondRevision,
      lastAssignmentMutationId: firstMutationId
    })
  });
  assert.equal(await updateApplicationAssignmentAtomically(
    duplicate.collection,
    mutation('admin@example.org', firstRevision),
    'admin@example.org'
  ), 'unchanged');
});

test('concurrent duplicate submissions produce one update and one idempotent result', async () => {
  let record = legacyRecord({ assignmentRevision: firstRevision, assignedTo: null });
  const collection = {
    async findOne() {
      return { ...record };
    },
    async updateOne(filter, update) {
      if (filter.assignmentRevision !== record.assignmentRevision) return { matchedCount: 0 };
      record = { ...record, ...update.$set };
      return { matchedCount: 1 };
    }
  };
  const submitted = mutation('admin@example.org', firstRevision);
  const results = await Promise.all([
    updateApplicationAssignmentAtomically(collection, submitted, 'admin@example.org'),
    updateApplicationAssignmentAtomically(collection, submitted, 'admin@example.org')
  ]);

  assert.deepEqual(results.sort(), ['unchanged', 'updated']);
  assert.equal(record.assignedTo, 'admin@example.org');
  assert.equal(record.lastAssignmentMutationId, firstMutationId);
});

test('stale revisions, including ABA changes, never overwrite concurrent assignments', async () => {
  const reads = [
    legacyRecord({ assignedTo: 'other-admin@example.org', assignmentRevision: firstRevision }),
    legacyRecord({
      assignedTo: 'admin@example.org',
      assignmentRevision: secondRevision,
      lastAssignmentMutationId: secondMutationId
    })
  ];
  const calls = { updates: [] };
  const collection = {
    async findOne() { return reads.shift() ?? null; },
    async updateOne(filter, update) {
      calls.updates.push({ filter, update });
      return { matchedCount: 0 };
    }
  };
  assert.equal(await updateApplicationAssignmentAtomically(
    collection,
    mutation('admin@example.org', firstRevision),
    'other-admin@example.org'
  ), 'stale');
  assert.equal(calls.updates[0].filter.assignmentRevision, firstRevision);
  assert.equal(calls.updates[0].update.$set.assignedBy, 'other-admin@example.org');
});

test('missing applications return a generic not-found outcome without writes', async () => {
  const { collection, calls } = createCollection({ record: null });
  assert.equal(await updateApplicationAssignmentAtomically(collection, mutation(), 'admin@example.org'), 'not-found');
  assert.equal(calls.updates.length, 0);
});

test('disabled, anonymous, and non-allowlisted administrators cannot open the collection', async () => {
  const configuration = getAdminConfiguration(readyEnvironment);
  let collectionRequests = 0;
  const getCollection = async () => {
    collectionRequests += 1;
    return createCollection({ record: legacyRecord() }).collection;
  };

  const disabled = await runAsAdministrator(
    getAdminConfiguration({ ...readyEnvironment, ADMIN_APPLICATIONS_ENABLED: 'false' }),
    'admin@example.org', getCollection
  );
  const storageDisabled = await runAsAdministrator(
    getAdminConfiguration({ ...readyEnvironment, APPLICATION_STORAGE_ENABLED: 'false' }),
    'admin@example.org', getCollection
  );
  const anonymous = await runAsAdministrator(configuration, null, getCollection);
  const unauthorized = await runAsAdministrator(
    configuration, 'outsider@example.org', getCollection
  );

  assert.deepEqual(disabled, { status: 'unavailable' });
  assert.deepEqual(storageDisabled, { status: 'unavailable' });
  assert.deepEqual(anonymous, { status: 'unauthenticated' });
  assert.deepEqual(unauthorized, { status: 'unauthorized' });
  assert.equal(collectionRequests, 0);
});

test('inbox reads only assignment fields needed for each protected view', () => {
  assert.deepEqual(APPLICATION_ASSIGNMENT_SUMMARY_PROJECTION, { assignedTo: 1 });
  assert.deepEqual(APPLICATION_ASSIGNMENT_DETAIL_PROJECTION, {
    assignedTo: 1,
    assignedAt: 1,
    assignedBy: 1,
    assignmentRevision: 1
  });
});
