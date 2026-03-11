import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

type SubmissionPayload = {
  formType: string;
  source: string;
  data: Record<string, string>;
};

const recipient = 'educatiawelfaretrust@gmail.com';

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error('Missing SMTP configuration');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

function asText(payload: SubmissionPayload) {
  const lines = Object.entries(payload.data).map(([key, value]) => `${key}: ${value || '-'}`);
  return [`Source: ${payload.source}`, `Form Type: ${payload.formType}`, '', ...lines].join('\n');
}

function asHtml(payload: SubmissionPayload) {
  const rows = Object.entries(payload.data)
    .map(
      ([key, value]) =>
        `<tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600">${escapeHtml(key)}</td><td style="padding:8px;border:1px solid #e2e8f0">${escapeHtml(value || '-')}</td></tr>`
    )
    .join('');

  return `
    <div style="font-family:Arial,sans-serif;color:#0f172a">
      <h2 style="margin-bottom:4px">New Form Submission</h2>
      <p style="margin-top:0">Source: <strong>${escapeHtml(payload.source)}</strong> | Form: <strong>${escapeHtml(payload.formType)}</strong></p>
      <table style="border-collapse:collapse;width:100%;max-width:760px">${rows}</table>
    </div>
  `;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SubmissionPayload;

    if (!payload.formType || !payload.source || !payload.data || Object.keys(payload.data).length === 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const transporter = createTransporter();
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@educatiawelfaretrust.org';

    await transporter.sendMail({
      from,
      to: recipient,
      subject: `[Educatia] ${payload.source} - ${payload.formType} submission`,
      text: asText(payload),
      html: asHtml(payload)
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Form submission email error', error);
    return NextResponse.json({ error: 'Unable to submit form right now' }, { status: 500 });
  }
}
