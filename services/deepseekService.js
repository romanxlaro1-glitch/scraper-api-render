const axios = require("axios");
const BASE = "https://deep-seek.ai";
const UA = "Mozilla/5.0 (Linux; Android 13; SM-A536E) AppleWebKit/537.36 Chrome/124.0.0.0 Mobile Safari/537.36";
let cookieJar = "";
let csrfToken = "";

async function initSession() {
  const res = await axios.get(BASE + "/chat", { headers: { "User-Agent": UA }, transformResponse: [(v) => v] });
  cookieJar = res.headers["set-cookie"]?.join('; ') || "";
  const html = String(res.data);
  const m = html.match(/<meta\s+name=["']csrf-token["']\s+content=["']([^"']+)["']/i);
  if (!m) throw new Error("CSRF token not found");
  csrfToken = m[1];
}

exports.chat = async (prompt, model) => {
  if (!csrfToken) await initSession();
  const res = await axios.post(BASE + "/api/chat", {
    model: model || "deepseek/deepseek-v4-flash", messages: [{ role: "user", content: prompt }]
  }, {
    headers: { "User-Agent": UA, "X-CSRF-TOKEN": csrfToken, "Cookie": cookieJar, "Content-Type": "application/json" },
    responseType: 'stream'
  });
  let buffer = "", accumulated = "";
  return new Promise((resolve) => {
    res.data.on("data", (chunk) => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split("\n"); buffer = lines.pop();
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data:")) {
          const payload = trimmed.slice(5).trim();
          if (payload && payload !== "[DONE]") {
            try {
              const obj = JSON.parse(payload);
              const delta = obj.choices?.[0]?.delta?.content || obj.choices?.[0]?.message?.content || "";
              if (delta) accumulated += delta;
            } catch {}
          }
        }
      }
    });
    res.data.on("end", () => resolve({ status: true, result: accumulated }));
    res.data.on("error", (err) => resolve({ error: err.message }));
  });
};
