import assert from 'node:assert/strict';
import test from 'node:test';
import { readBoundedMultipartBytes } from '../src/lib/boundedMultipartBody.ts';
import { MultipartBodyError } from '../src/lib/boundedMultipartBody.ts';

const requestWithChunks = (chunks, headers = {}) => new Request('https://educatia.example/upload', {
  method: 'POST', headers, body: new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(new TextEncoder().encode(chunk));
      controller.close();
    }
  }), duplex: 'half'
});

test('bounded multipart reader accepts small streamed bodies with or without content length', async () => {
  const result = await readBoundedMultipartBytes(requestWithChunks(['ab', 'c'], { 'content-length': '3' }), 3);
  assert.equal(new TextDecoder().decode(result), 'abc');
  const streamed = await readBoundedMultipartBytes(requestWithChunks(['a', 'bc']), 3);
  assert.equal(new TextDecoder().decode(streamed), 'abc');
});

test('bounded multipart reader rejects declared and streamed over-limit payloads', async () => {
  await assert.rejects(readBoundedMultipartBytes(requestWithChunks(['abc'], { 'content-length': '4' }), 3),
    error => error instanceof MultipartBodyError && error.status === 413);
  await assert.rejects(readBoundedMultipartBytes(requestWithChunks(['ab', 'cd']), 3),
    error => error instanceof MultipartBodyError && error.status === 413);
});

test('bounded multipart reader rejects malformed lengths and empty bodies', async () => {
  await assert.rejects(readBoundedMultipartBytes(requestWithChunks(['a'], { 'content-length': '3junk' }), 10),
    error => error instanceof MultipartBodyError && error.status === 400);
  await assert.rejects(readBoundedMultipartBytes(requestWithChunks([]), 10),
    error => error instanceof MultipartBodyError && error.status === 400);
});
