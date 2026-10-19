const SUPABASE_URL = 'https://lhncvnrreuxjhyzcgzli.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VE8NUgKll5s4p9tZ-i9D9w_CoX7bkbb';
const BASE_URL = 'https://www.naxachat.com';
const EMAIL_DOMAIN = 'akunlama.com';
const AKUNLAMA_BASE = 'https://akunlama.com';
const NAMES = ['aldi','bagas','citra','deni','eka','fajar','gilang','hana','indra','joko'];

function generateRandomEmail() {
  const name = NAMES[Math.floor(Math.random() * NAMES.length)];
  const suffix = Math.floor(Math.random() * 9000) + 1000;
  return `${name}${suffix}@${EMAIL_DOMAIN}`;
}

async function listInbox(username) {
  const u = username.split('@')[0];
  const res = await fetch(`${AKUNLAMA_BASE}/api/list?recipient=${encodeURIComponent(u)}`);
  return res.json();
}

async function getFullMessage(region, key) {
  const htmlRes = await fetch(`${AKUNLAMA_BASE}/api/getHtml?region=${encodeURIComponent(region)}&key=${encodeURIComponent(key)}`);
  return htmlRes.text();
}

function extractLinks(html) {
  const links = [];
  const re = /href=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const url = m[1].replace(/&amp;/g, '&');
    if (url.startsWith('http')) links.push(url);
  }
  return links;
}

async function waitForConfirmLink(username, maxWait = 60000) {
  const interval = 4000;
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    await new Promise(r => setTimeout(r, interval));
    const inbox = await listInbox(username);
    if (!Array.isArray(inbox) || inbox.length === 0) continue;
    const msg = inbox.find(m => 
      (m.message?.headers?.subject || '').toLowerCase().includes('confirm') ||
      (m.message?.headers?.from || '').toLowerCase().includes('supabase')
    );
    if (!msg?.storage?.region || !msg?.storage?.key) continue;
    const html = await getFullMessage(msg.storage.region, msg.storage.key);
    const links = extractLinks(html);
    const confirmLink = links.find(l => l.includes('supabase.co') && (l.includes('verify') || l.includes('confirm')));
    if (confirmLink) return confirmLink;
  }
  throw new Error('Timeout nunggu email konfirmasi');
}

exports.register = async (email, password) => {
  const newEmail = email || generateRandomEmail();
  const newPassword = password || `Pass_${Math.random().toString(36).slice(2)}`;
  await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST', headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: newEmail, password: newPassword })
  });
  return { status: 'registered', email: newEmail };
};

exports.login = async (email, password) => {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST', headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (data.access_token) return { status: 'logged_in', token: data.access_token };
  throw new Error('Login failed');
};

exports.chat = async (token, message) => {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ history: [{ role: 'user', content: message }], chatId: null, personaId: null, memoryEnabled: false, imageMode: false, replyMode: 'default', conversationMode: 'default' })
  });
  const rawBody = await res.text();
  let full = '';
  for (const line of rawBody.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === '[DONE]') continue;
    const jsonStr = trimmed.startsWith('data:') ? trimmed.slice(5).trim() : trimmed;
    if (!jsonStr) continue;
    try { const parsed = JSON.parse(jsonStr); if (parsed.type === 'text' && parsed.text) full += parsed.text; } catch {}
  }
  return { status: true, reply: full || rawBody };
};
