export async function createRazorpayOrder(payload: { amount: number; currency: string }) {
  const res = await fetch('/api/razorpay/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) return null;
  return res.json();
}

