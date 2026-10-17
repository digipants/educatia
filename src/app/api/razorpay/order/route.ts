import { NextResponse } from 'next/server';
import { getRazorpayClient, saveDonation } from '@/lib/server';

export async function POST(request: Request) {
  // Razorpay activation is pending required documents. Fail closed until
  // payment signature verification, webhook reconciliation and receipts exist.
  if (process.env.DONATIONS_ENABLED !== 'true') {
    return NextResponse.json(
      { error: 'Online donations are temporarily unavailable.' },
      { status: 503 }
    );
  }
  try {
    const { amount, currency } = await request.json();
    if (!Number.isSafeInteger(amount) || amount < 100 || amount > 1000000 || currency !== 'INR') {
      return NextResponse.json({ error: 'Missing amount or currency' }, { status: 400 });
    }

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({ amount: amount * 100, currency, payment_capture: true });

    await saveDonation({ amount, currency, status: 'created', orderId: order.id });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Razorpay order error');
    return NextResponse.json({ error: 'Unable to create order' }, { status: 500 });
  }
}
