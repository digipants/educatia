import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { saveApplication } from '@/lib/applicationStore';
import { parseBoundedJsonBody, RequestBodyError } from '@/lib/boundedRequestBody';
import {
  IdempotencyConflictError,
  processSubmission,
  SubmissionValidationError,
  type SubmissionPayload
} from '@/lib/applicationSubmission';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
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
  let isStoredApplication = false;

  try {
    const payload: unknown = await parseBoundedJsonBody(request);
    const storageEnabled = process.env.APPLICATION_STORAGE_ENABLED === 'true';
    const candidate = payload as Partial<SubmissionPayload> | null;
    isStoredApplication = Boolean(
      storageEnabled && candidate &&
      (candidate.formType === 'Student' || candidate.formType === 'Volunteer')
    );

    await processSubmission(payload, {
      storageEnabled,
      idempotencyKey: request.headers.get('idempotency-key'),
      saveApplication,
      sendEmail: async (validatedPayload) => {
        const transporter = createTransporter();
        const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@educatiawelfaretrust.org';
        const submittedEmail = validatedPayload.data.email || validatedPayload.data.emailId || '';
        const replyTo = /^[^\s@\r\n]+@[^\s@\r\n]+\.[^\s@\r\n]+$/.test(submittedEmail)
          ? submittedEmail
          : process.env.SMTP_USER;

        await transporter.sendMail({
          from,
          to: recipient,
          replyTo,
          subject: `[Educatia] ${validatedPayload.source} - ${validatedPayload.formType} submission`,
          text: asText(validatedPayload),
          html: asHtml(validatedPayload)
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof SubmissionValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof IdempotencyConflictError) {
      return NextResponse.json({ error: 'Application request conflict' }, { status: 409 });
    }

    console.error(isStoredApplication ? 'Application persistence failed' : 'Form submission email error');
    return NextResponse.json(
      {
        error: isStoredApplication
          ? 'Unable to save your application right now. Please try again later.'
          : 'Unable to submit form right now'
      },
      { status: isStoredApplication ? 503 : 500 }
    );
  }
}
