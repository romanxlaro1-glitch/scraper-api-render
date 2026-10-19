const axios = require("axios");
const BASE_URL = "https://kiyoraai.vercel.app";
const sessions = new Map();

exports.chat = async (prompt, sessionId = "default") => {
  if (!prompt) throw new Error("Prompt required");
  const history = sessions.get(sessionId) || [];
  history.push({ role: "user", content: prompt });
  const response = await axios.post(`${BASE_URL}/api/chat`, { history }, {
    headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0", "Referer": `${BASE_URL}/`, "Origin": BASE_URL }, timeout: 60000
  });
  const reply = response.data?.text || response.data;
  history.push({ role: "assistant", content: reply });
  sessions.set(sessionId, history);
  return { status: true, result: reply };
};

exports.reset = (sessionId = "default") => {
  sessions.set(sessionId, []);
  return { status: true, message: "Session reset" };
};
