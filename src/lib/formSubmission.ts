export type FormPayload = {
  source: string;
  formType: string;
  data: Record<string, string>;
};

type PendingRetry = { idempotencyKey: string; firstAttemptAt: number };

// Transient in-memory retry cache: no raw form values or persistent storage.
const pendingIdempotencyKeys = new Map<string, PendingRetry>();
const MAX_PENDING_RETRIES = 32;
const RETRY_WINDOW_MS = 10 * 60 * 1000;
let pageSessionSalt: string | undefined;

async function opaqueRetryIdentity(body: string): Promise<string> {
  pageSessionSalt ??= globalThis.crypto.randomUUID();
  const bytes = new TextEncoder().encode(pageSessionSalt + ':' + body);
  const hash = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), (value) => value.toString(16).padStart(2, '0')).join('');
}

function pruneRetryCache(now: number) {
  for (const [identity, retry] of pendingIdempotencyKeys) {
    if (now - retry.firstAttemptAt >= RETRY_WINDOW_MS) pendingIdempotencyKeys.delete(identity);
  }
  while (pendingIdempotencyKeys.size > MAX_PENDING_RETRIES) {
    const oldest = pendingIdempotencyKeys.keys().next().value;
    if (oldest === undefined) break;
    pendingIdempotencyKeys.delete(oldest);
  }
}

export async function submitForm(payload: FormPayload) {
  const isApplication = payload.formType === 'Student' || payload.formType === 'Volunteer';
  const requestBody = JSON.stringify(payload);
  let retryIdentity: string | undefined;
  let idempotencyKey: string | undefined;

  if (isApplication) {
    retryIdentity = await opaqueRetryIdentity(requestBody);
    const now = Date.now();
    pruneRetryCache(now);
    const previous = pendingIdempotencyKeys.get(retryIdentity);
    if (previous) {
      idempotencyKey = previous.idempotencyKey;
    } else {
      idempotencyKey = globalThis.crypto.randomUUID();
      pendingIdempotencyKeys.set(retryIdentity, { idempotencyKey, firstAttemptAt: now });
      pruneRetryCache(now);
    }
  }

  const res = await fetch('/api/forms/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {})
    },
    body: requestBody
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Submission failed' }));
    throw new Error(body.error || 'Submission failed');
  }

  if (retryIdentity) pendingIdempotencyKeys.delete(retryIdentity);
  return res.json();
}
