const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const app = express();
app.get("/", (_, res) => res.send("bot activo"));
app.listen(process.env.PORT || 3000, "0.0.0.0");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
      "--disable-gpu"
    ]
  }
});

client.on("qr", (qr) => {
  console.log("QR:");
  console.log(qr);
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("WhatsApp listo");
});

client.on("auth_failure", (msg) => {
  console.log("Auth failure:", msg);
});

client.on("disconnected", (reason) => {
  console.log("Disconnected:", reason);
});

client.initialize();
