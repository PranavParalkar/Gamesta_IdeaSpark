import nodemailer from 'nodemailer';
import path from 'path';
import { promises as fs } from 'fs';
import QRCode from 'qrcode';

type MailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
};

function getMailConfig(): MailConfig | null {
  const host = process.env.SMTP_HOST || '';
  const port = Number(process.env.SMTP_PORT || '587');
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true';
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  const from = process.env.MAIL_FROM || 'no-reply@gamesta.local';

  if (!host) return null;
  if (!Number.isFinite(port) || port <= 0) return null;

  return {
    host,
    port,
    secure,
    user: user || undefined,
    pass: pass || undefined,
    from,
  };
}

async function loadLogoPng(): Promise<Buffer | null> {
  try {
    // Uses the existing public/logo.png referenced by the UI.
    const filePath = path.join(process.cwd(), 'public', 'logo.png');
    return await fs.readFile(filePath);
  } catch {
    return null;
  }
}

function safe(v: string | null | undefined, d: string) {
  return !v || !String(v).trim() ? d : String(v);
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function nowString() {
  // Similar to Java version but locale-agnostic.
  return new Date().toISOString();
}

function buildPlain(userName: string | null | undefined, events: string[], orderId: string | null, paymentId: string | null, totalAmount: number | null) {
  const lines: string[] = [];
  lines.push(`Hi ${safe(userName, 'Participant')},`);
  lines.push('');
  lines.push('Your registration is confirmed.');
  lines.push('');
  lines.push('Events:');
  for (const ev of events) lines.push(` • ${ev}`);
  lines.push('');
  lines.push(`Order ID: ${safe(orderId, '-')}`);
  lines.push(`Payment ID: ${safe(paymentId, '-')}`);
  if (totalAmount != null) lines.push(`Total: ₹${totalAmount}`);
  lines.push(`When: ${nowString()}`);
  lines.push('');
  lines.push('Thanks for joining Gamesta!');
  lines.push('Gamesta Team');
  return lines.join('\n');
}

function buildHtml(userName: string | null | undefined, events: string[], orderId: string | null, paymentId: string | null, totalAmount: number | null) {
  const eventCount = events?.length || 0;

  const eventRows = events
    .map(
      (ev) =>
        "<tr>" +
        "<td style=\"padding:10px 12px;vertical-align:top;\">" +
        "  <div style=\"display:flex;gap:12px;align-items:center;\">" +
        "    <div style=\"width:40px;height:40px;border-radius:8px;background:linear-gradient(135deg,#f0abfc,#7c3aed);\"></div>" +
        `    <div style=\"font-weight:600;color:#0b1020;\">${escapeHtml(ev)}</div>` +
        '  </div>' +
        '</td>' +
        "<td style=\"padding:10px 12px;text-align:right;color:#475569;\">1 ticket</td>" +
        '</tr>',
    )
    .join('');

  const totalPaidRow =
    totalAmount == null
      ? ''
      : "<tr style=\"border-top:1px solid #e9eef7;\">" +
        "  <td style=\"padding:10px 12px;font-weight:700;color:#0b1020;\">Total Paid</td>" +
        `  <td style=\"padding:10px 12px;text-align:right;font-weight:800;color:#0b1020;\">₹${totalAmount}</td>` +
        '</tr>';

  return (
    "<div style='background:#f6f8fc;padding:24px;'>" +
    "  <div style='max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;border:1px solid #e6ecf6;overflow:hidden;'>" +
    "    <div style='padding:24px 24px 12px 24px;'>" +
    "      <table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='border-collapse:collapse;'>" +
    '        <tr>' +
    "          <td style='padding:0;vertical-align:middle;'>" +
    "            <img src='cid:logo' alt='Gamesta' width='120' height='36' style='display:block;border:0;outline:none;text-decoration:none;'>" +
    '          </td>' +
    "          <td style='padding:0;vertical-align:middle;text-align:right;'>" +
    "            <img src='cid:qr' alt='QR' width='96' height='96' style='display:inline-block;border:0;outline:none;text-decoration:none;border-radius:8px;'>" +
    '          </td>' +
    '        </tr>' +
    '      </table>' +
    "      <div style='text-align:center;margin:10px 0 14px 0;'>" +
    "        <div style='margin-top:4px;color:#10b981;font:700 16px Segoe UI,Arial,sans-serif;'>Your booking is confirmed!</div>" +
    "        <div style='margin-top:6px;color:#6b7280;font:500 12px Segoe UI,Arial,sans-serif;'>Booking ID</div>" +
    `        <div style='margin-top:2px;color:#111827;font:700 14px Segoe UI,Arial,sans-serif;'>${escapeHtml(
      safe(orderId, '-'),
    )}</div>` +
    '      </div>' +
    "      <table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='border-collapse:separate;border-spacing:0 10px;'>" +
    '        <tr>' +
    "          <td style='padding:0;'>" +
    "            <div style='border:1px solid #e6ecf6;border-radius:12px;padding:14px;'>" +
    "              <table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='border-collapse:collapse;'>" +
    '                <tr>' +
    "                  <td style='padding:6px 6px 10px 6px;'>" +
    `                    <div style='font:700 16px Segoe UI,Arial,sans-serif;color:#111827;'>${escapeHtml(
      safe(userName, 'Participant'),
    )}</div>` +
    `                    <div style='margin-top:2px;color:#6b7280;font:500 12px Segoe UI,Arial,sans-serif;'>${eventCount} event${
      eventCount === 1 ? '' : 's'
    } registered • ${escapeHtml(nowString())}</div>` +
    '                  </td>' +
    "                  <td style='padding:6px;text-align:right;vertical-align:top;'>" +
    "                    <span style='display:inline-block;border:2px solid #10b981;color:#10b981;padding:6px 10px;border-radius:999px;font:700 12px Segoe UI,Arial,sans-serif;'>CONFIRMED</span>" +
    '                  </td>' +
    '                </tr>' +
    '              </table>' +
    "              <table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='border-collapse:collapse;margin-top:6px;'>" +
    eventRows +
    '              </table>' +
    '            </div>' +
    '          </td>' +
    '        </tr>' +
    '      </table>' +
    "      <div style='margin-top:12px;border:1px dashed #d9e3f2;border-radius:12px;padding:12px;'>" +
    "        <table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='border-collapse:collapse;'>" +
    '          <tr>' +
    "            <td style='padding:8px 12px;color:#6b7280;'>Payment ID</td>" +
    `            <td style='padding:8px 12px;text-align:right;color:#111827;font-weight:600;'>${escapeHtml(
      safe(paymentId, '-'),
    )}</td>` +
    '          </tr>' +
    totalPaidRow +
    '        </table>' +
    '      </div>' +
    "      <div style='margin-top:14px;color:#6b7280;font:500 12px Segoe UI,Arial,sans-serif;'>Show this booking ID at the desk on event day.</div>" +
    '    </div>' +
    "    <div style='padding:14px 24px;background:#f3f6fb;color:#6b7280;font:500 12px Segoe UI,Arial,sans-serif;'>This is an automated email from <strong style=\"color:#111827\">Gamesta</strong>. Please do not reply.</div>" +
    '  </div>' +
    '</div>'
  );
}

export async function sendRegistrationConfirmation(args: {
  toEmail: string;
  userName?: string | null;
  events: string[];
  orderId: string;
  paymentId: string;
  totalAmount?: number | null;
}) {
  const cfg = getMailConfig();
  if (!cfg) {
    throw new Error('SMTP not configured (set SMTP_HOST/SMTP_PORT/MAIL_FROM etc)');
  }

  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: cfg.user && cfg.pass ? { user: cfg.user, pass: cfg.pass } : undefined,
  });

  const subject = 'Gamesta: Registration Confirmation';
  const plain = buildPlain(args.userName, args.events, args.orderId, args.paymentId, args.totalAmount ?? null);
  const html = buildHtml(args.userName, args.events, args.orderId, args.paymentId, args.totalAmount ?? null);

  const qrContent = args.orderId?.trim() ? args.orderId : args.paymentId;
  const qrPng = await QRCode.toBuffer(qrContent, { type: 'png', width: 220, margin: 1 });
  const logoPng = await loadLogoPng();

  await transporter.sendMail({
    from: cfg.from,
    to: args.toEmail,
    subject,
    text: plain,
    html,
    attachments: [
      ...(logoPng
        ? [
            {
              filename: 'logo.png',
              content: logoPng,
              cid: 'logo',
              contentType: 'image/png',
            },
          ]
        : []),
      {
        filename: 'qr.png',
        content: qrPng,
        cid: 'qr',
        contentType: 'image/png',
      },
    ],
  });
}
