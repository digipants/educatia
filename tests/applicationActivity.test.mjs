import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MAX_APPLICATION_ACTIVITY_ITEMS,
  buildApplicationActivity
} from '../src/lib/applicationActivity.ts';

const administratorEmails = ['admin@example.org'];

test('activity uses only bounded server-derived submission, status, and assignment metadata', () => {
  const record = {
    _id: '4d6f58dc-1d5b-49fa-9627-ec5ed0749bb7',
    formType: 'Student',
    source: 'Become a Member',
    data: { fullName: 'Private applicant data' },
    status: 'Contacted',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-04T00:00:00.000Z'),
    statusUpdatedAt: new Date('2026-01-03T00:00:00.000Z'),
    statusUpdatedBy: 'admin@example.org',
    statusRevision: '4d6f58dc-1d5b-49fa-9627-ec5ed0749bb7',
    assignedAt: new Date('2026-01-02T00:00:00.000Z'),
    assignedBy: 'admin@example.org',
    assignedTo: 'admin@example.org',
    assignmentRevision: '6a7bc93e-44b9-4d81-b245-53b8ae8ff480'
  };

  const activity = buildApplicationActivity(record, administratorEmails);
  assert.equal(activity.length, MAX_APPLICATION_ACTIVITY_ITEMS);
  assert.deepEqual(activity.map(({ kind }) => kind), ['status', 'assignment', 'submitted']);
  assert.equal(activity[0].message, 'Latest status: Contacted');
  assert.equal(activity[1].message, 'Assigned to admin@example.org');
  assert.equal(activity[2].message, 'Application received');
  assert.equal(JSON.stringify(activity).includes('Private applicant data'), false);
  assert.equal(activity.some((item) => 'noteText' in item), false);
});

test('activity omits invalid timestamps and hides administrators no longer allowlisted', () => {
  const activity = buildApplicationActivity({
    _id: '4d6f58dc-1d5b-49fa-9627-ec5ed0749bb7',
    formType: 'Volunteer',
    source: 'Become a Member',
    data: {},
    status: 'New',
    createdAt: new Date('invalid'),
    statusUpdatedAt: new Date('2026-01-03T00:00:00.000Z'),
    statusUpdatedBy: 'removed@example.org',
    assignedAt: new Date('2026-01-02T00:00:00.000Z'),
    assignedBy: 'removed@example.org',
    assignedTo: 'removed@example.org'
  }, administratorEmails);

  assert.equal(activity.length, 2);
  assert.deepEqual(activity.map((item) => item.actor), [null, null]);
  assert.equal(activity[1].message, 'Assignment changed');
});
