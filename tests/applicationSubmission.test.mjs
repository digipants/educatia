import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createApplicationRecord,
  insertApplicationOnce,
  IdempotencyConflictError,
  processSubmission,
  SubmissionValidationError
} from '../src/lib/applicationSubmission.ts';

const student = (source = 'Contact Page', consent = 'true') => ({
  source,
  formType: 'Student',
  data: {
    fullName: '  Asha   Kumar ',
    dob: '2012-06-15',
    gender: 'Female',
    classOrGrade: 'Class 9',
    instituteSchoolUniversity: 'Government School',
    parentOrGuardianFullName: 'Parent Kumar',
    parentOrGuardianContactNo: '+91 98765 43210',
    studentWhatsappNo: '+91 98765 11111',
    emailId: 'asha@example.org',
    program: 'Academics',
    parentGuardianConsent: consent
  }
});

const volunteer = () => ({
  source: 'Become a Member',
  formType: 'Volunteer',
  data: {
    fullName: '  Ravi   Singh ',
    dob: '1990-01-20',
    gender: 'Male',
    mobile: '+91 98765 43210',
    whatsapp: '+91 98765 11111',
    email: 'RAVI@example.org',
    address: '12 Private Street',
    serviceOrAreaOfExpertise: 'Mathematics tutoring'
  }
});

const key = '4d6f58dc-1d5b-49fa-9627-ec5ed0749bb7';

function dependencies(overrides = {}) {
  return {
    storageEnabled: false,
    idempotencyKey: key,
    saveApplication: async () => {
      throw new Error('save should not be called');
    },
    sendEmail: async () => {},
    ...overrides
  };
}

test('requires guardian consent for Student submissions from both entry points', async () => {
  for (const source of ['Contact Page', 'Become a Member']) {
    let sideEffect = false;
    await assert.rejects(
      processSubmission(student(source, 'false'), dependencies({
        sendEmail: async () => { sideEffect = true; },
        saveApplication: async () => { sideEffect = true; return true; }
      })),
      SubmissionValidationError
    );
    assert.equal(sideEffect, false);
  }
});

test('rejects malformed Student and Volunteer fields before side effects', async () => {
  for (const payload of [
    { ...student(), data: { ...student().data, program: 'Unlisted program' } },
    { ...student(), data: { ...student().data, parentOrGuardianContactNo: 'not a phone' } },
    { ...volunteer(), data: { ...volunteer().data, email: 'invalid email' } }
  ]) {
    let sideEffect = false;
    await assert.rejects(processSubmission(payload, dependencies({
      storageEnabled: true,
      saveApplication: async () => { sideEffect = true; return true; },
      sendEmail: async () => { sideEffect = true; }
    })), SubmissionValidationError);
    assert.equal(sideEffect, false);
  }
});

test('stores only the minimal normalized Student application data', async () => {
  let saved;
  const result = await processSubmission(student(), dependencies({
    storageEnabled: true,
    saveApplication: async (application) => { saved = application; return true; }
  }));

  assert.equal(result.persisted, true);
  assert.deepEqual(Object.keys(saved).sort(), ['_id', 'createdAt', 'data', 'formType', 'source', 'status', 'updatedAt']);
  assert.deepEqual(saved.data, {
    fullName: 'Asha Kumar',
    classOrGrade: 'Class 9',
    instituteSchoolUniversity: 'Government School',
    parentOrGuardianFullName: 'Parent Kumar',
    parentOrGuardianContactNo: '+919876543210',
    program: 'Academics',
    parentGuardianConsent: true
  });
  assert.equal(saved.status, 'New');
  assert.equal(saved.source, 'Contact Page');
  assert.equal(saved.createdAt, saved.updatedAt);
});

test('stores only essential Volunteer data and normalizes contact fields', async () => {
  let saved;
  await processSubmission(volunteer(), dependencies({
    storageEnabled: true,
    saveApplication: async (application) => { saved = application; return true; }
  }));

  assert.deepEqual(saved.data, {
    fullName: 'Ravi Singh',
    mobile: '+919876543210',
    whatsapp: '+919876511111',
    email: 'ravi@example.org',
    serviceOrAreaOfExpertise: 'Mathematics tutoring'
  });
});

test('storage-disabled mode preserves email submission and never attempts database storage', async () => {
  let emailed = 0;
  const saveApplication = async () => { throw new Error('must remain disabled'); };
  for (const payload of [student(), volunteer(), {
    source: 'Contact Page', formType: 'Parent', data: { fullName: 'Parent' }
  }, {
    source: 'Contact Page', formType: 'Teacher', data: { fullName: 'Teacher' }
  }]) {
    await processSubmission(payload, dependencies({
      sendEmail: async () => { emailed += 1; },
      saveApplication
    }));
  }
  assert.equal(emailed, 4);
});

test('Parent and Teacher remain email-only when application storage is enabled', async () => {
  let emailed = 0;
  await processSubmission({ source: 'Contact Page', formType: 'Parent', data: { fullName: 'Parent' } }, dependencies({
    storageEnabled: true,
    sendEmail: async () => { emailed += 1; }
  }));
  await processSubmission({ source: 'Contact Page', formType: 'Teacher', data: { fullName: 'Teacher' } }, dependencies({
    storageEnabled: true,
    sendEmail: async () => { emailed += 1; }
  }));
  assert.equal(emailed, 2);
});

test('database failure rejects and does not send a success email', async () => {
  let emailed = false;
  await assert.rejects(processSubmission(student(), dependencies({
    storageEnabled: true,
    saveApplication: async () => { throw new Error('database unavailable'); },
    sendEmail: async () => { emailed = true; }
  })), /database unavailable/);
  assert.equal(emailed, false);
});

test('email failure after a durable save still succeeds without asking for resubmission', async () => {
  const result = await processSubmission(student(), dependencies({
    storageEnabled: true,
    saveApplication: async () => true,
    sendEmail: async () => { throw new Error('SMTP unavailable'); }
  }));
  assert.deepEqual(result, { persisted: true, duplicate: false });
});

test('an idempotent retry does not create a second record or notification', async () => {
  const records = new Map();
  let insertAttempts = 0;
  let notifications = 0;
  const collection = {
    async insertOne(application) {
      insertAttempts += 1;
      if (records.has(application._id)) {
        const error = new Error('duplicate key');
        error.code = 11000;
        throw error;
      }
      records.set(application._id, application);
    },
    async findOne({ _id }) {
      return records.get(_id) || null;
    }
  };
  const saveApplication = async (application) => insertApplicationOnce(collection, application);
  const sendEmail = async () => { notifications += 1; };

  const first = await processSubmission(student(), dependencies({
    storageEnabled: true, saveApplication, sendEmail
  }));
  const retry = await processSubmission(student(), dependencies({
    storageEnabled: true, saveApplication, sendEmail
  }));

  assert.deepEqual(first, { persisted: true, duplicate: false });
  assert.deepEqual(retry, { persisted: true, duplicate: true });
  assert.equal(insertAttempts, 2);
  assert.equal(records.size, 1);
  assert.equal(notifications, 1);
});

test('rejects reuse of an idempotency key for different application data', async () => {
  const records = new Map();
  const collection = {
    async insertOne(application) {
      if (records.has(application._id)) {
        const error = new Error('duplicate key');
        error.code = 11000;
        throw error;
      }
      records.set(application._id, application);
    },
    async findOne({ _id }) {
      return records.get(_id) || null;
    }
  };
  const original = createApplicationRecord(
    { ...student(), data: { ...student().data } },
    key
  );
  await insertApplicationOnce(collection, original);

  const changed = {
    ...original,
    data: { ...original.data, classOrGrade: 'Class 10' }
  };
  await assert.rejects(
    insertApplicationOnce(collection, changed),
    IdempotencyConflictError
  );
});

test('storage-enabled applications require a valid idempotency key', async () => {
  await assert.rejects(processSubmission(student(), dependencies({
    storageEnabled: true,
    idempotencyKey: null
  })), SubmissionValidationError);
});

test('unknown submitted fields and control characters are rejected before email or database side effects', async () => {
  for (const payload of [
    { ...student(), data: { ...student().data, injectedField: 'extra private info' } },
    { ...volunteer(), data: { ...volunteer().data, debugInfo: 'not allowed' } },
    { source: 'Contact Page', formType: 'Parent', data: { fullName: 'Parent', hidden: 'extra' } },
    { source: 'Contact Page', formType: 'Teacher', data: { fullName: 'Teacher\\u0000Injected' } }
  ]) {
    let sideEffects = 0;
    await assert.rejects(processSubmission(payload, dependencies({
      saveApplication: async () => { sideEffects++; return true; },
      sendEmail: async () => { sideEffects++; }
    })), SubmissionValidationError);
    assert.equal(sideEffects, 0);
  }
});

test('outbound Student emails exclude child DOB, gender, private contact and arbitrary keys', async () => {
  let message;
  await processSubmission(student(), dependencies({
    sendEmail: async (data) => { message = data; }
  }));
  assert.deepEqual(Object.keys(message.data), [
    'fullName', 'classOrGrade', 'instituteSchoolUniversity',
    'parentOrGuardianFullName', 'parentOrGuardianContactNo',
    'program', 'parentGuardianConsent'
  ]);
  assert.equal('dob' in message.data, false);
  assert.equal('gender' in message.data, false);
  assert.equal('studentWhatsappNo' in message.data, false);
  assert.equal('emailId' in message.data, false);
});

test('outbound Volunteer emails omit DOB, gender and street address', async () => {
  let message;
  await processSubmission(volunteer(), dependencies({
    sendEmail: async (data) => { message = data; }
  }));
  assert.deepEqual(Object.keys(message.data), [
    'fullName', 'mobile', 'whatsapp', 'email', 'serviceOrAreaOfExpertise'
  ]);
  for (const key of ['dob', 'gender', 'address']) assert.equal(key in message.data, false);
});

test('stored applicant notifications use the same minimal outbound email projection', async () => {
  let message;
  await processSubmission(student(), dependencies({
    storageEnabled: true,
    saveApplication: async () => true,
    sendEmail: async (data) => { message = data; }
  }));
  assert.equal('dob' in message.data, false);
  assert.equal('gender' in message.data, false);
  assert.equal(message.data.parentOrGuardianContactNo, '+91 98765 43210');
});

