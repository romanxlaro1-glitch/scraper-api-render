const crypto = require('crypto');
const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36';
const base = 'https://chatgpt.com/backend-anon';

function baseCfg() {
  return [8, 3000, new Date().toString(), 4294705152, 0, ua, '', 'dpl=abc', 'en-US', 'en-US,en', 0, 'webdriver-false', 'location', crypto.randomUUID()];
}

function solvePow(seed, diff) {
  const cfg = baseCfg();
  for (let i = 0; i < 500000; i++) {
    cfg[3] = i;
    const b64 = Buffer.from(JSON.stringify(cfg)).toString('base64');
    const hash = crypto.createHash('sha3-512').update(seed + b64).digest('hex');
    if (hash.slice(0, diff.length) <= diff) return 'gAAAAAB' + b64;
  }
  return 'wQ8jGT' + Buffer.from(seed).toString('base64');
}

exports.chat = async (prompt) => {
  const deviceId = crypto.randomUUID();
  const initP = 'gAAAAAC' + Buffer.from(JSON.stringify(baseCfg())).toString('base64');
  const reqRes = await fetch(base + '/sentinel/chat-requirements', {
    method: 'POST', headers: { 'user-agent': ua, 'content-type': 'application/json', 'oai-device-id': deviceId, 'origin': 'https://chatgpt.com' },
    body: JSON.stringify({ p: initP })
  });
  const reqData = await reqRes.json();
  const powToken = reqData.proofofwork ? solvePow(reqData.proofofwork.seed, reqData.proofofwork.difficulty) : null;
  const res = await fetch(base + '/conversation', {
    method: 'POST', headers: {
      'user-agent': ua, 'content-type': 'application/json', 'accept': 'text/event-stream', 'oai-device-id': deviceId,
      'openai-sentinel-chat-requirements-token': reqData.token,
      ...(powToken ? { 'openai-sentinel-proof-token': powToken } : {}), 'origin': 'https://chatgpt.com'
    },
    body: JSON.stringify({ action: 'next', messages: [{ id: crypto.randomUUID(), author: { role: 'user' }, content: { content_type: 'text', parts: [prompt] } }], parent_message_id: crypto.randomUUID(), model: 'auto', timezone_offset_min: -420, history_and_training_disabled: true })
  });
  const txt = await res.text();
  let answer = "";
  for (const line of txt.split('\n')) {
    if (line.startsWith('data: ') && !line.includes('[DONE]')) {
      try { const json = JSON.parse(line.slice(6)); if (json.message?.content?.parts?.[0]) answer = json.message.content.parts[0]; } catch(e) {}
    }
  }
  return { status: true, result: answer };
};
