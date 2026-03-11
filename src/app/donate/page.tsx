"use client";

import { useState } from "react";
import { createRazorpayOrder } from "@/lib/api";

export default function DonatePage() {
  const [amount, setAmount] = useState(3000);
  const [loading, setLoading] = useState(false);

  const presets = [
    { value: 500, label: "₹500 – 1 month support" },
    { value: 3000, label: "₹3000 – 1 year student support" },
  ];

  const handleDonate = async () => {
    try {
      setLoading(true);
      const order = await createRazorpayOrder({ amount, currency: "INR" });
      if (!order) return;
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Educatia",
        description: "General Donation",
        order_id: order.id,
        handler: (response: any) => console.log("Payment success", response),
      };
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Donate</h1>
        <p className="text-slate-700">
          Fast, transparent, and compliant. Your contribution reaches students
          immediately.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card space-y-3 md:col-span-2">
          <h2 className="text-lg font-semibold">Why donate</h2>
          <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
            <li>
              Funds devices, data, and live academic support for government
              school students.
            </li>
            <li>Audited spending with quarterly impact updates.</li>
            <li>80G eligible; instant receipt and acknowledgment.</li>
          </ul>
        </div>
        <div className="card space-y-3">
          <h2 className="text-lg font-semibold">Payment methods</h2>
          <p className="text-sm text-slate-700">
            UPI / Card / Netbanking via Razorpay. Secure & encrypted.
          </p>
          <p className="text-xs text-slate-600">
            You’ll see the Razorpay checkout when you click donate.
          </p>
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="text-lg font-semibold">Choose an amount</h3>
        <div className="flex flex-wrap gap-3">
          {presets.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setAmount(p.value)}
              className={`rounded-lg border px-4 py-2 text-sm transition ${
                amount === p.value
                  ? "border-brand-primary bg-sky-50 text-brand-primary font-semibold"
                  : "border-slate-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Or enter a custom amount (INR)
          </label>
          <input
            type="number"
            min={100}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full rounded-md border border-slate-200 px-3 py-2"
          />
        </div>
        <button
          className="btn w-full md:w-auto"
          onClick={handleDonate}
          disabled={loading}
        >
          {loading ? "Processing…" : "Donate with Razorpay"}
        </button>
        <p className="text-xs text-slate-600">
          Checkout supports UPI, cards, and netbanking.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card space-y-2">
          <h3 className="text-lg font-semibold">Compliance & Proofs</h3>
          <p className="text-sm text-slate-700">
            80G certificate and registration documents available post-payment in
            your email receipt.
          </p>
        </div>
        <div className="card space-y-2 md:col-span-2">
          <h3 className="text-lg font-semibold">FAQs</h3>
          <div className="space-y-3 text-sm text-slate-700">
            <details className="group">
              <summary className="cursor-pointer font-semibold text-slate-900">
                How do I get my 80G receipt?
              </summary>
              <p className="mt-1 text-slate-700">
                An instant digital receipt with 80G details is emailed after
                payment. You can also request duplicates via
                educatiawelfaretrust@gmail.com.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer font-semibold text-slate-900">
                Where does my money go?
              </summary>
              <p className="mt-1 text-slate-700">
                Devices, data packs, live tutoring hours, and monitoring.
                Quarterly reports share student counts and learning gains.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer font-semibold text-slate-900">
                Is my payment secure?
              </summary>
              <p className="mt-1 text-slate-700">
                Payments are processed via Razorpay with PCI-DSS compliance and
                bank-grade encryption.
              </p>
            </details>
          </div>
        </div>
      </div>

      <div className="card bg-sky-50 border-sky-100 text-slate-800 space-y-2">
        <h3 className="font-semibold">Thank you</h3>
        <p className="text-sm">
          Every contribution keeps a student learning safely and consistently.
          We’ll keep you updated on impact.
        </p>
      </div>
    </div>
  );
}
