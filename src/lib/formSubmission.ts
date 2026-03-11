export type FormPayload = {
  source: string;
  formType: string;
  data: Record<string, string>;
};

export async function submitForm(payload: FormPayload) {
  const res = await fetch('/api/forms/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Submission failed' }));
    throw new Error(body.error || 'Submission failed');
  }

  return res.json();
}
