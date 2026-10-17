export type FormPayload = {
  source: string;
  formType: string;
  data: Record<string, string>;
};

const pendingIdempotencyKeys = new Map<string, string>();

export async function submitForm(payload: FormPayload) {
  const isApplication = payload.formType === 'Student' || payload.formType === 'Volunteer';
  const requestIdentity = JSON.stringify(payload);
  let idempotencyKey: string | undefined;

  if (isApplication) {
    idempotencyKey = pendingIdempotencyKeys.get(requestIdentity);
    if (!idempotencyKey) {
      idempotencyKey = globalThis.crypto.randomUUID();
      pendingIdempotencyKeys.set(requestIdentity, idempotencyKey);
    }
  }

  const res = await fetch('/api/forms/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {})
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Submission failed' }));
    throw new Error(body.error || 'Submission failed');
  }

  if (idempotencyKey) pendingIdempotencyKeys.delete(requestIdentity);
  return res.json();
}
