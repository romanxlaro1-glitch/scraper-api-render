const https = require("https");
const http = require("http");
const crypto = require("crypto");

exports.getAccount = (deviceId) => {
  return new Promise((resolve, reject) => {
    const id = deviceId || crypto.randomBytes(16).toString("hex");
    const body = JSON.stringify({ device_id: id });
    const url = new URL("https://viu.interflazz.my.id/?action=account");
    const lib = url.protocol === "https:" ? https : http;
    
    const req = lib.request({
      hostname: url.hostname, path: url.pathname + url.search, method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" }
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); } 
        catch { reject(new Error("Invalid JSON")); }
      });
    });
    req.on("error", reject);
    req.write(body); req.end();
  });
};
