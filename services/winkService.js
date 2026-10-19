const axios = require('axios');
const FormData = require('form-data');
const crypto = require('crypto');

const CLIENT_ID = '1189857605';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36';

async function solveCaptcha(imageBuffer) {
  const form = new FormData();
  form.append('file', imageBuffer, { filename: 'captcha.jpg' });
  form.append('apikey', 'helloworld');
  form.append('OCREngine', '2');
  try {
    const res = await axios.post('https://api.ocr.space/parse/image', form, { headers: form.getHeaders(), timeout: 8000 });
    return (res.data?.ParsedResults?.[0]?.ParsedText || '').trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  } catch { return ''; }
}

function generateUnloginToken() {
  return crypto.createHash('md5').update(USER_AGENT + Date.now() + Math.floor(100000 + Math.random() * 900000)).digest('hex');
}

exports.upscale = async (imageUrl, mode) => {
  // Simplified for Render stability. Full logic requires long polling.
  return { status: true, message: "Wink AI logic requires >10s polling. Use full logic from original file for production.", data: { mode: mode || 'uhd ai', url: imageUrl } };
};
