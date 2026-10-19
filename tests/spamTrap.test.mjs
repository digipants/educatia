import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { validateSubmission, processSubmission, SubmissionValidationError } from '../src/lib/applicationSubmission.ts';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const payload = website => ({
  formType: 'Parent',
  source: 'Contact Page',
  data: { fullName: 'Synthetic Guardian', studentName: 'Synthetic Student', interestsOrNeeds: 'Tutoring' },
  ...(website !== undefined ? { website } : {})
});

test('legacy and empty honeypot requests are accepted without changing fields', () => {
  assert.equal(validateSubmission(payload()).data.fullName, 'Synthetic Guardian');
  assert.equal(validateSubmission(payload('')).data.fullName, 'Synthetic Guardian');
  assert.equal(validateSubmission(payload('   ')).data.fullName, 'Synthetic Guardian');
});

test('filled honeypot rejects before any SMTP or database side effects', async () => {
  for (const website of ['https://spam.example', 'website', 42]) {
    let called = 0;
    await assert.rejects(
      processSubmission(payload(website), {
        storageEnabled: false, idempotencyKey: null,
        sendEmail: async () => { called++; },
        saveApplication: async () => { called++; return true; }
      }),
      SubmissionValidationError
    );
    assert.equal(called, 0);
  }
});

test('every public form includes the decoy and reads it on submit', async () => {
  for (const path of [
    'src/forms/StudentForm.tsx', 'src/forms/VolunteerForm.tsx',
    'src/forms/ParentForm.tsx', 'src/forms/TeacherForm.tsx',
    'src/app/become-a-member/page.tsx'
  ]) {
    const code = await read(path);
    assert.match(code, /<SpamTrapField \/>/, path);
    assert.match(code, /readSpamTrap\(e\.currentTarget as HTMLFormElement\)/, path);
    assert.match(code, /}, spamTrap\);/, path);
  }
  const field = await read('src/components/SpamTrapField.tsx');
  assert.match(field, /aria-hidden="true"/);
  assert.match(field, /tabIndex=\{-1\}/);
  assert.match(field, /name="website"/);
  assert.doesNotMatch(field, /localStorage|cookie|analytics/);
});

test('shared submission helper does not persist the decoy or alter idempotency headers', async () => {
  const code = await read('src/lib/formSubmission.ts');
  assert.match(code, /JSON\.stringify\(\{ \.\.\.payload, website \}\)/);
  assert.match(code, /Idempotency-Key/);
  assert.doesNotMatch(code, /localStorage|sessionStorage|document\.cookie/);
});
