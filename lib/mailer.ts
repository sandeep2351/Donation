import nodemailer from 'nodemailer';

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

function buildContactPlainText(payload: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  return buildContactBodies(payload).text;
}

async function sendWithSmtp(payload: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  const transport = getMailer();
  if (!transport) {
    return { ok: false, error: 'SMTP is not configured (missing SMTP_HOST, SMTP_USER, or SMTP_PASS).' };
  }
  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
  const { text, html } = buildContactBodies(payload);
  try {
    await transport.sendMail({
      from: `"${payload.name}" <${from}>`,
      to: adminInbox,
      replyTo: payload.email,
      subject: `[Campaign contact] ${payload.subject}`,
      text,
      html,
    });
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : 'SMTP send failed' };
  }
}

/**
 * Web3Forms (https://web3forms.com) — alternative to SMTP. Delivers to the inbox tied to your access key.
 * Called only after SMTP fails or is not configured.
 */
async function sendWithWeb3Forms(payload: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY?.trim();
  if (!accessKey) {
    return { ok: false, error: 'WEB3FORMS_ACCESS_KEY is not set.' };
  }

  const message = buildContactPlainText(payload);

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `[Campaign contact] ${payload.subject}`,
        name: payload.name,
        email: payload.email,
        message,
        ...(payload.phone ? { phone: payload.phone } : {}),
      }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      message?: string;
    };

    if (res.ok && data.success === true) {
      return { ok: true };
    }

    const msg = data.message || `HTTP ${res.status}`;
    return { ok: false, error: msg };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : 'Web3Forms request failed' };
  }
}

/**
 * Contact form delivery order (see `.env`):
 * 1. **Primary** — SMTP (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, …)
 * 2. **Alternative** — Web3Forms (`WEB3FORMS_ACCESS_KEY`) if SMTP is missing or errors
 */
export async function sendContactEmail(payload: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  // 1. Primary: SMTP
  const smtp = await sendWithSmtp(payload);
  if (smtp.ok) {
    return { ok: true };
  }

  // 2. Alternative: Web3Forms
  const web3 = await sendWithWeb3Forms(payload);
  if (web3.ok) {
    return { ok: true };
  }

  const parts = [
    smtp.error && `SMTP: ${smtp.error}`,
    web3.error && `Web3Forms: ${web3.error}`,
  ].filter(Boolean);

  return {
    ok: false,
    error:
      parts.join(' · ') ||
      'Could not send message. Configure SMTP_* (Gmail app password) and/or WEB3FORMS_ACCESS_KEY.',
  };
}
