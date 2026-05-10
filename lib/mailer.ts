import nodemailer from 'nodemailer';
import { Resend } from 'resend';

const adminInbox = process.env.ADMIN_INBOX_EMAIL || 'sandeepkalyan299@gmail.com';

export function getMailer() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildContactBodies(payload: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const text = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    payload.phone ? `Phone: ${payload.phone}` : '',
    `Subject: ${payload.subject}`,
    '',
    payload.message,
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
      <h2>New message from the donation site</h2>
      <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
      ${payload.phone ? `<p><strong>Phone:</strong> ${escapeHtml(payload.phone)}</p>` : ''}
      <p><strong>Subject:</strong> ${escapeHtml(payload.subject)}</p>
      <p><strong>Message:</strong></p>
      <pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(payload.message)}</pre>
    `;

  return { text, html };
}

/**
 * Sends contact form mail. Easiest setup: **Resend** (`RESEND_API_KEY` + `RESEND_FROM_EMAIL`).
 * Fallback: classic SMTP (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`).
 */
export async function sendContactEmail(payload: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
    return sendWithResend(payload, resendKey);
  }

  const transport = getMailer();
  if (!transport) {
    return {
      ok: false,
      error:
        'Email not configured. Add RESEND_API_KEY (easiest) at https://resend.com — or set SMTP_HOST, SMTP_USER, and SMTP_PASS.',
    };
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
  const { text, html } = buildContactBodies(payload);

  await transport.sendMail({
    from: `"${payload.name}" <${from}>`,
    to: adminInbox,
    replyTo: payload.email,
    subject: `[Campaign contact] ${payload.subject}`,
    text,
    html,
  });

  return { ok: true };
}

async function sendWithResend(
  payload: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  },
  apiKey: string
): Promise<{ ok: boolean; error?: string }> {
  /** Verified domain address, or Resend’s test sender (limited; verify your domain for production). */
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim() || 'onboarding@resend.dev';
  const { text, html } = buildContactBodies(payload);

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: `Campaign site <${fromEmail}>`,
      to: [adminInbox],
      replyTo: payload.email,
      subject: `[Campaign contact] ${payload.subject}`,
      text,
      html,
    });

    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : 'Resend request failed' };
  }
}
