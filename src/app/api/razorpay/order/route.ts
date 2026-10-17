import { NextResponse } from 'next/server';

export async function POST() {
  // Razorpay activation is pending documents, and payment verification,
  // webhook reconciliation, and receipts are not implemented yet.
  // Deliberately do not allow an environment flag to bypass these blockers.
  return NextResponse.json(
    { error: 'Online donations are temporarily unavailable.' },
    { status: 503 }
  );
}
