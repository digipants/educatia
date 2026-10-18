import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MAX_FORM_BODY_BYTES,
  parseBoundedJsonBody,
  RequestBodyError
} from '../src/lib/boundedRequestBody.ts';

const jsonReq = (body, headers = {}) => new Request('https://example.test/api/forms/submit', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  body
});

function streamRequest(chunks, headers = {}) {
  let offset = 0;
  const source = new ReadableStream({
    pull(controller) {
      if (offset === chunks.length) return controller.close();
      controller.enqueue(chunks[offset++]);
    }
  });
  return new Request('https://example.test/api/forms/submit', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: source,
    duplex: 'half'
  });
}

const fails = async (request, status) => {
  await assert.rejects(
    parseBoundedJsonBody(request),
    error => error instanceof RequestBodyError && error.status === status
  );
};

test('accepts well-formed JSON with and without length header', async () => {
  const body = JSON.stringify({ formType: 'Parent', data: { fullName: 'Test Parent' } });
  assert.deepEqual(await parseBoundedJsonBody(jsonReq(body)), JSON.parse(body));
  assert.deepEqual(await parseBoundedJsonBody(jsonReq(body, { 'content-length': String(Buffer.byteLength(body)) })), JSON.parse(body));
});

test('enforces actual byte limit even when Content-Length is absent or lies', async () => {
  const large = new TextEncoder().encode('x'.repeat(MAX_FORM_BODY_BYTES + 1));
  await fails(streamRequest([large]), 413);
  await fails(streamRequest([large.subarray(0, 9000), large.subarray(9000)], { 'content-length': '1' }), 413);
});

test('accepts exact maximum bytes and rejects one beyond boundary', async () => {
  const body = '"' + 'x'.repeat(MAX_FORM_BODY_BYTES - 2) + '"';
  assert.equal((await parseBoundedJsonBody(jsonReq(body))).length, MAX_FORM_BODY_BYTES - 2);
  await fails(jsonReq(body + ' '), 413);
});

test('rejects declared oversize and invalid lengths before reading body', async () => {
  await fails(jsonReq('{}', { 'content-length': String(MAX_FORM_BODY_BYTES + 1) }), 413);
  await fails(jsonReq('{}', { 'content-length': '-20' }), 400);
});

test('returns generic bad-request errors for empty, invalid JSON, and invalid UTF-8', async () => {
  await fails(jsonReq(''), 400);
  await fails(jsonReq('{oops}'), 400);
  await fails(streamRequest([new Uint8Array([0xff, 0xff])]), 400);
});

test('rejects non-JSON content types while accepting valid JSON media type', async () => {
  await fails(new Request('https://example.test/api/forms/submit', {
    method: 'POST', headers: { 'content-type': 'text/plain' }, body: '{}'
  }), 415);
  await fails(new Request('https://example.test/api/forms/submit', {
    method: 'POST', body: '{}'
  }), 415);
});
