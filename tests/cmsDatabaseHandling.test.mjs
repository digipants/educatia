import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { classifyCmsOperationFailure, getCmsConfiguration, withCmsStaff } from '../src/lib/cmsSecurity.ts';

function databaseError(name, code, message = 'never log this private failure detail') {
  return Object.assign(new Error(message), { name, code });
}

test('CMS database failures are separated into safe operational categories', () => {
  const cases = [
    [databaseError('MongoServerError', 18), 'database_authentication'],
    [databaseError('MongoServerError', 13), 'database_permission'],
    [databaseError('MongoServerError', 999), 'database_server_error'],
    [databaseError('MongoServerSelectionError'), 'database_unreachable'],
    [databaseError('MongoNetworkTimeoutError'), 'database_timeout'],
    [databaseError('MongoNetworkError'), 'database_network'],
    [databaseError('MongoWaitQueueTimeoutError'), 'database_pool_timeout'],
    [databaseError('MongoParseError'), 'database_configuration'],
    [new Error('test-only private value'), 'unexpected'],
    [null, 'unexpected']
  ];
  for (const [error, expected] of cases) assert.equal(classifyCmsOperationFailure(error), expected);
});

test('a database authorization failure returns only a generic CMS error', async () => {
  const config = getCmsConfiguration({
    CMS_CONTENT_ENABLED: 'true',
    CMS_PUBLISHING_ENABLED: 'false',
    CMS_EDITOR_EMAILS: 'editor@example.test',
    CMS_PUBLISHER_EMAILS: 'publisher@example.test',
    MONGODB_URI: 'mongodb://localhost/educatia',
    GOOGLE_CLIENT_ID: 'test',
    GOOGLE_CLIENT_SECRET: 'test',
    NEXTAUTH_SECRET: '32-chars-minimum-test-secret-safe-only',
    NEXTAUTH_URL: 'https://educatia.example.test'
  });
  const calls = [];
  const original = console.warn;
  console.warn = (...args) => { calls.push(args); };
  try {
    assert.deepEqual(await withCmsStaff(config, 'editor@example.test', 'editor',
      async () => { throw databaseError('MongoServerError', 13); }), { status: 'error' });
    assert.deepEqual(calls, [['educatia_cms_operation_failure', 'database_permission']]);
    assert.equal(JSON.stringify(calls).includes('private failure detail'), false);
  } finally {
    console.warn = original;
  }
});

test('generic MongoDB server failures log only the numeric server code', async () => {
  const config = getCmsConfiguration({
    CMS_CONTENT_ENABLED: 'true',
    CMS_PUBLISHING_ENABLED: 'false',
    CMS_EDITOR_EMAILS: 'editor@example.test',
    MONGODB_URI: 'mongodb://localhost/educatia',
    GOOGLE_CLIENT_ID: 'test',
    GOOGLE_CLIENT_SECRET: 'test',
    NEXTAUTH_SECRET: '32-chars-minimum-test-secret-safe-only',
    NEXTAUTH_URL: 'https://educatia.example.test'
  });
  const calls = [];
  const original = console.warn;
  console.warn = (...args) => { calls.push(args); };
  try {
    const error = databaseError('MongoServerError', 8000, 'mongodb://sensitive-host/private detail');
    assert.deepEqual(await withCmsStaff(config, 'editor@example.test', 'editor',
      async () => { throw error; }), { status: 'error' });
    assert.deepEqual(calls, [[
      'educatia_cms_operation_failure', 'database_server_error', 'mongo_code_8000'
    ]]);
    assert.equal(JSON.stringify(calls).includes('sensitive-host'), false);
    assert.equal(JSON.stringify(calls).includes('private detail'), false);
  } finally {
    console.warn = original;
  }
});

test('malformed MongoDB server codes are not written to logs', async () => {
  const config = getCmsConfiguration({
    CMS_CONTENT_ENABLED: 'true',
    CMS_PUBLISHING_ENABLED: 'false',
    CMS_EDITOR_EMAILS: 'editor@example.test',
    MONGODB_URI: 'mongodb://localhost/educatia',
    GOOGLE_CLIENT_ID: 'test',
    GOOGLE_CLIENT_SECRET: 'test',
    NEXTAUTH_SECRET: '32-chars-minimum-test-secret-safe-only',
    NEXTAUTH_URL: 'https://educatia.example.test'
  });
  const calls = [];
  const original = console.warn;
  console.warn = (...args) => { calls.push(args); };
  try {
    const error = databaseError('MongoServerError', 'private-data');
    await withCmsStaff(config, 'editor@example.test', 'editor', async () => { throw error; });
    assert.deepEqual(calls, [['educatia_cms_operation_failure', 'database_server_error']]);
  } finally {
    console.warn = original;
  }
});

test('database connector shares in-flight connect and bounds per-instance resources', async () => {
  const source = await readFile(new URL('../src/lib/server.ts', import.meta.url), 'utf8');
  assert.match(source, /pendingConnection \?\? \(pendingConnection = openClient\(\)\)/);
  assert.match(source, /await candidate\.connect\(\);\s*client = candidate;/);
  assert.match(source, /await candidate\.close\(\)\.catch/);
  assert.match(source, /if \(pendingConnection === attempt\) pendingConnection = null/);
  assert.match(source, /serverSelectionTimeoutMS: 8000/);
  assert.match(source, /connectTimeoutMS: 5000/);
  assert.match(source, /waitQueueTimeoutMS: 5000/);
  assert.match(source, /maxPoolSize: 5/);
  assert.match(source, /maxIdleTimeMS: 30000/);
  assert.doesNotMatch(source, /console\.(?:log|warn|error)/);
});
