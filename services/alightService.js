const axios = require('axios');
const BASE_URL = 'https://am.kyzzz.xyz';
const GUERRILLA_BASE = 'https://api.guerrillamail.com/ajax.php';

exports.generate = async (action) => {
  if (action !== 'generate') throw new Error("Invalid action");
  const { data: initData } = await axios.get(`${GUERRILLA_BASE}?f=get_email_address`, { timeout: 15000 });
  const sid = initData?.sid_token;
  const userEmail = initData?.email_addr;
  await axios.post(`${BASE_URL}/api/send-link`, { email: userEmail }, { timeout: 20000 });
  let magicLink = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 2500));
    const { data: chkData } = await axios.get(`${GUERRILLA_BASE}?f=check_email&seq=0&sid_token=${sid}`, { timeout: 15000 });
    const list = chkData?.list || [];
    const amMsg = list.find(m => (m.mail_subject || '').toLowerCase().includes('alight'));
    if (amMsg) {
      const { data: mailDetail } = await axios.get(`${GUERRILLA_BASE}?f=fetch_email&email_id=${amMsg.mail_id}&sid_token=${sid}`, { timeout: 15000 });
      const body = mailDetail?.mail_body || '';
      const urls = body.match(/https?:\/\/[^\s"'<>]+/g) || [];
      magicLink = urls.find(u => u.includes('oobCode') || u.includes('signInWithEmailLink'));
      if (magicLink) break;
    }
  }
  if (!magicLink) throw new Error("Timeout waiting for verification link");
  const verifData = await axios.post(`${BASE_URL}/api/verify`, { email: userEmail, link: magicLink }, { timeout: 25000 });
  return { status: true, email: userEmail, orderId: verifData.data?.orderId, uid: verifData.data?.uid, magicLink };
};
