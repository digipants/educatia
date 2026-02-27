import { NextResponse } from 'next/server';
import { getRazorpayClient, saveDonation } from '@/lib/server';

export async function POST(request: Request) {
  try {
    const { amount, currency } = await request.json();
    if (!amount || !currency) {
      return NextResponse.json({ error: 'Missing amount or currency' }, { status: 400 });
    }

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({ amount: amount * 100, currency, payment_capture: true });

    await saveDonation({ amount, currency, status: 'created', orderId: order.id });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Razorpay order error', error);
    return NextResponse.json({ error: 'Unable to create order' }, { status: 500 });
  }
}
