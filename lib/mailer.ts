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

async function sendWithSmtp(payload: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  const transport = getMailer();
  if (!transport) {
    return {
      ok: false,
      error: 'SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in .env.',
    };
  }
  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
  const { text, html } = buildContactBodies(payload);
  try {
    await transport.sendMail({
      from: `"Campaign contact" <${from}>`,
      to: adminInbox,
      replyTo: `"${payload.name}" <${payload.email}>`,
      subject: `[Campaign contact] ${payload.subject}`,
      text,
      html,
    });
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : 'SMTP send failed' };
  }
}

/** Sends contact form submissions via SMTP (see SMTP_* and ADMIN_INBOX_EMAIL in .env). */
export async function sendContactEmail(payload: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  return sendWithSmtp(payload);
}
