import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { submitForm } from '../src/lib/formSubmission.ts';

function payload(unique, formType = 'Student') {
  return {
    source: 'Contact Page',
    formType,
    data: { fullName: 'Synthetic Applicant ' + unique, parentOrGuardianContactNo: '9000000000' }
  };
}

test('failed Student request reuses its UUID on retry and clears it after success', async () => {
  const originalFetch = globalThis.fetch;
  const headers = [];
  let count = 0;
  try {
    globalThis.fetch = async (_url, options) => {
      headers.push(options.headers);
      count++;
      return new Response(JSON.stringify(count === 1 ? { error: 'Temporary failure' } : { ok: true }), {
        status: count === 1 ? 503 : 200,
        headers: { 'Content-Type': 'application/json' }
      });
    };
    const input = payload('retry-1');
    await assert.rejects(submitForm(input), /Temporary failure/);
    assert.deepEqual(await submitForm(input), { ok: true });
    assert.ok(headers[0]['Idempotency-Key']);
    assert.equal(headers[0]['Idempotency-Key'], headers[1]['Idempotency-Key']);
    await submitForm(input);
    assert.notEqual(headers[1]['Idempotency-Key'], headers[2]['Idempotency-Key']);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('changed application data gets a different request identity', async () => {
  const originalFetch = globalThis.fetch;
  const keys = [];
  try {
    globalThis.fetch = async (_url, options) => {
      keys.push(options.headers['Idempotency-Key']);
      return new Response(JSON.stringify({ error: 'Retry later' }), {
        status: 503, headers: { 'Content-Type': 'application/json' }
      });
    };
    await assert.rejects(submitForm(payload('a')), /Retry later/);
    await assert.rejects(submitForm(payload('b')), /Retry later/);
    assert.ok(keys[0] && keys[1]);
    assert.notEqual(keys[0], keys[1]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Parent/Teacher emails do not add idempotency keys', async () => {
  const originalFetch = globalThis.fetch;
  const sent = [];
  try {
    globalThis.fetch = async (_url, options) => {
      sent.push(options.headers);
      return new Response('{"ok":true}', {
        status: 200, headers: { 'Content-Type': 'application/json' }
      });
    };
    await submitForm(payload('p', 'Parent'));
    await submitForm(payload('t', 'Teacher'));
    for (const headers of sent) assert.equal(headers['Idempotency-Key'], undefined);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('pending retry cache keys are opaque, salted, bounded and never persisted', async () => {
  const code = await readFile(new URL('../src/lib/formSubmission.ts', import.meta.url), 'utf8');
  assert.match(code, /crypto\.subtle\.digest\('SHA-256'/);
  assert.match(code, /pageSessionSalt \?\?= globalThis\.crypto\.randomUUID/);
  assert.match(code, /MAX_PENDING_RETRIES = 32/);
  assert.match(code, /RETRY_WINDOW_MS = 10 \* 60 \* 1000/);
  assert.doesNotMatch(code, /pendingIdempotencyKeys\.set\(requestBody/);
  assert.doesNotMatch(code, /localStorage|sessionStorage|document\.cookie/);
});
