/* ---------------------------------------------------------------------------
   POST /api/contact  —  Vercel serverless function

   Validates a contact-form submission, then does up to two things with it:

     1. appends a row to the Google Sheet   (via the Apps Script web app)
     2. sends you an email                  (via Resend)

   Both are optional and independent. Each switches itself on when its
   environment variables are present, so you can run sheet-only, email-only or
   both without touching this file.

   Environment variables — Vercel -> Project -> Settings -> Environment
   Variables, ticked for all three environments:

     SHEETS_WEBHOOK_URL     Apps Script deployment URL, ending in /exec
     SHEETS_WEBHOOK_SECRET  must match SECRET in Code.gs exactly

     RESEND_API_KEY         from resend.com -> API Keys  (starts "re_")
     MAIL_TO                where enquiries land: 'you@dexoid.com'
                            several addresses allowed, comma-separated
     MAIL_FROM              'Dexoid Website <hello@dexoid.com>'
                            the domain must be verified in Resend

   Remember that environment variables are read at deploy time. After adding or
   changing one, redeploy — Deployments -> ... -> Redeploy.
   ------------------------------------------------------------------------- */

/* Best-effort rate limit. Serverless instances are recycled and requests can
   land on different ones, so this thins out floods rather than guaranteeing a
   ceiling. The honeypot does most of the real work. */
const HITS = new Map();
const WINDOW_MS = 60 * 60 * 1000;   // one hour
const MAX_PER_WINDOW = 5;           // per IP

function rateLimited(ip) {
  const now = Date.now();
  const fresh = (HITS.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (fresh.length >= MAX_PER_WINDOW) return true;
  fresh.push(now);
  HITS.set(ip, fresh);
  if (HITS.size > 5000) HITS.clear();
  return false;
}

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/* Deliberately loose. Strict email regexes reject valid addresses far more
   often than they catch bad ones; the real test is whether a reply lands. */
const looksLikeEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

/* Submitted text goes into an HTML email, so it has to be escaped. Without
   this a message containing < or > mangles the layout, and anything resembling
   a tag is interpreted rather than shown. */
const esc = (v) => String(v ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/* --------------------------------------------------------------------------
   The two destinations
   ------------------------------------------------------------------------ */

async function writeToSheet(env, data) {
  const res = await fetch(env.SHEETS_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    redirect: 'follow',                 // Apps Script 302s to googleusercontent
    signal: AbortSignal.timeout(10000),
    body: JSON.stringify({ secret: env.SHEETS_WEBHOOK_SECRET, ...data }),
  });

  /* Apps Script answers 200 to almost everything, including its own errors, so
     the body is what actually says whether the row was written. */
  const text = await res.text();
  let body = {};
  try { body = JSON.parse(text); } catch { /* not JSON — treat as failure */ }

  if (!res.ok || body.ok !== true) {
    throw new Error('sheet ' + res.status + ': ' + text.slice(0, 300));
  }
}

function emailBody(d) {
  const rows = [
    ['Name', d.name],
    ['Work email', d.email],
    ['Company', d.company],
    ['What they need', d.topic || 'Not specified'],
    ['Received', d.receivedAt],
    ['Page', d.page || ''],
    ['Referrer', d.referrer || '(direct)'],
  ];

  const html =
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1a1a1a;line-height:1.55;max-width:640px">' +
      '<p style="margin:0 0 4px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#D90000">' +
        'Dexoid Technologies — website enquiry</p>' +
      '<h2 style="margin:0 0 18px;font-size:20px;font-weight:700">' +
        esc(d.name) + ' · ' + esc(d.company) + '</h2>' +
      '<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;margin-bottom:20px">' +
        rows.map(([k, v]) =>
          '<tr>' +
            '<td style="padding:7px 14px 7px 0;color:#6b6b66;white-space:nowrap;vertical-align:top;border-bottom:1px solid #eceae3">' + esc(k) + '</td>' +
            '<td style="padding:7px 0;border-bottom:1px solid #eceae3">' + esc(v) + '</td>' +
          '</tr>').join('') +
      '</table>' +
      '<p style="margin:0 0 6px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#6b6b66">The problem</p>' +
      '<div style="padding:14px 16px;background:#f5f4ef;border-left:3px solid #D90000;white-space:pre-wrap">' +
        esc(d.message || '(no message)') + '</div>' +
      '<p style="margin:20px 0 0;font-size:12.5px;color:#6b6b66">Reply to this email to answer ' +
        esc(d.name) + ' directly.</p>' +
    '</div>';

  const text = rows.map(([k, v]) => k + ': ' + v).join('\n') +
    '\n\nThe problem:\n' + (d.message || '(no message)') +
    '\n\nReply to this email to answer ' + d.name + ' directly.';

  return { html, text };
}

async function sendEmail(env, d) {
  const { html, text } = emailBody(d);

  const payload = {
    from: env.MAIL_FROM,
    to: env.MAIL_TO.split(',').map((s) => s.trim()).filter(Boolean),
    subject: 'Website enquiry — ' + d.company + ' (' + (d.topic || 'no topic') + ')',
    html,
    text,
  };

  /* This is the line that makes the notification useful: hitting Reply writes
     to the person who filled in the form, not to yourself. */
  if (looksLikeEmail(d.email)) payload.reply_to = d.email;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + env.RESEND_API_KEY,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(10000),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('resend ' + res.status + ': ' + (await res.text()).slice(0, 300));
  }
}

/* --------------------------------------------------------------------------
   Handler
   ------------------------------------------------------------------------ */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const env = process.env;
  const useSheet = Boolean(env.SHEETS_WEBHOOK_URL && env.SHEETS_WEBHOOK_SECRET);
  const useEmail = Boolean(env.RESEND_API_KEY && env.MAIL_TO && env.MAIL_FROM);

  if (!useSheet && !useEmail) {
    console.error('contact: neither the sheet nor Resend is configured');
    return res.status(500).json({ ok: false, error: 'Form is not configured' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  if (!body || typeof body !== 'object') body = {};

  // Honeypot: a real person never fills a field they cannot see. Answer 200 so
  // a bot gets no signal that it was caught.
  if (str(body.company_website, 200)) return res.status(200).json({ ok: true });

  const data = {
    receivedAt: new Date().toISOString(),
    name: str(body.name, 120),
    email: str(body.email, 200),
    company: str(body.company, 160),
    topic: str(body.topic, 80),
    message: str(body.message, 5000),
    page: str(body.page, 300),
    referrer: str(body.referrer, 300),
  };

  if (!data.name || !data.email || !data.company) {
    return res.status(400).json({ ok: false, error: 'Name, email and company are required.' });
  }
  if (!looksLikeEmail(data.email)) {
    return res.status(400).json({ ok: false, error: 'That email address does not look right.' });
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) {
    return res.status(429).json({ ok: false, error: 'Too many submissions. Try again later.' });
  }

  /* Run both, let both finish, then judge. allSettled rather than all, so a
     failing email never cancels a sheet write that was going to succeed. */
  const tasks = [];
  if (useSheet) tasks.push(['sheet', writeToSheet(env, data)]);
  if (useEmail) tasks.push(['email', sendEmail(env, data)]);

  const results = await Promise.allSettled(tasks.map(([, p]) => p));
  const failed = [];
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      failed.push(tasks[i][0]);
      console.error('contact: ' + tasks[i][0] + ' failed', r.reason);
    }
  });

  /* The submission is safe if ANY destination accepted it, so tell the visitor
     it worked. Only when every destination failed has the enquiry actually been
     lost — and then the form must say so rather than thank them for nothing. */
  if (failed.length === tasks.length) {
    return res.status(502).json({ ok: false, error: 'Could not record your enquiry.' });
  }

  return res.status(200).json({ ok: true });
}
