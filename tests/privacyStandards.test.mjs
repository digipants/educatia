import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createApplicationRecord } from '../src/lib/applicationSubmission.ts';
import { getAdminConfiguration } from '../src/lib/adminSecurity.ts';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('sample configuration keeps storage and administrator UI opted out', async () => {
  const example = await read('.env.example');
  assert.match(example, /^APPLICATION_STORAGE_ENABLED=false$/m);
  assert.match(example, /^ADMIN_APPLICATIONS_ENABLED=false$/m);
  assert.equal(getAdminConfiguration({}).enabled, false);
  assert.equal(getAdminConfiguration({ APPLICATION_STORAGE_ENABLED: 'true' }).enabled, false);
});

test('student database projection omits DOB, gender and direct student contact fields', () => {
  const record = createApplicationRecord({
    formType: 'Student',
    source: 'Contact Page',
    data: {
      fullName: 'Synthetic Student',
      dob: '2012-01-01', gender: 'Other',
      classOrGrade: '8', instituteSchoolUniversity: 'Synthetic School',
      parentOrGuardianFullName: 'Synthetic Guardian',
      parentOrGuardianContactNo: '9000000000',
      studentWhatsappNo: '9111111111', emailId: 'student@example.test',
      program: 'Academics', parentGuardianConsent: 'true'
    }
  }, '4d6f58dc-1d5b-49fa-9627-ec5ed0749bb7', new Date('2026-10-01T00:00:00Z'));
  assert.deepEqual(Object.keys(record.data).sort(), [
    'classOrGrade','fullName','instituteSchoolUniversity','parentGuardianConsent',
    'parentOrGuardianContactNo','parentOrGuardianFullName','program'
  ].sort());
  assert.equal(record.data.parentGuardianConsent, true);
  assert.equal('dob' in record.data, false);
  assert.equal('gender' in record.data, false);
});

test('volunteer projection omits date of birth, gender and street address', () => {
  const record = createApplicationRecord({
    formType: 'Volunteer', source: 'Become a Member',
    data: {fullName:'Synthetic Volunteer',dob:'1994-01-01',gender:'Other',
      mobile:'9000000000',whatsapp:'9000000001',email:'volunteer@example.test',
      address:'Synthetic street',serviceOrAreaOfExpertise:'Tutoring'}
  }, '5d6f58dc-1d5b-49fa-9627-ec5ed0749bb7', new Date('2026-10-01T00:00:00Z'));
  assert.deepEqual(Object.keys(record.data).sort(), [
    'fullName','mobile','whatsapp','email','serviceOrAreaOfExpertise'
  ].sort());
});

test('internal documentation distinguishes email copies, consent acknowledgement and pending approvals', async () => {
  const readiness = await read('docs/application-retention-readiness.md');
  const inventory = await read('docs/application-data-flow-review.md');
  assert.match(readiness, /email is independently in scope/i);
  assert.match(readiness, /acknowledgment is not verification/i);
  assert.match(inventory, /not a legal opinion/i);
  assert.match(inventory, /APPLICATION_STORAGE_ENABLED/);
  assert.match(inventory, /Issue #27/);
});
