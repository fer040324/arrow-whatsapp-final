const express = require("express");
const QRCode = require("qrcode");
const pino = require("pino");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const app = express();
let qrDataUrl = "";

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Arrow WhatsApp</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 24px; background: #111; color: #fff; }
          img { max-width: 320px; width: 100%; border-radius: 16px; margin-top: 20px; }
          .box { display:inline-block; padding:16px 20px; border:1px solid #333; border-radius:16px; margin-top:20px; }
        </style>
      </head>
      <body>
        <h1>Arrow WhatsApp Final</h1>
        <div class="box">
          ${qrDataUrl ? `<img src="${qrDataUrl}" alt="QR WhatsApp" />` : "<p>Esperando QR...</p>"}
        </div>
        <p>Escaneá el QR desde WhatsApp > Dispositivos vinculados</p>
      </body>
    </html>
  `);
});

app.listen(process.env.PORT || 3000, "0.0.0.0", () => {
  console.log("Servidor listo");
});

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "silent" }),
    browser: ["Arrow Store", "Chrome", "1.0"],
    printQRInTerminal: false,
    markOnlineOnConnect: false,
    syncFullHistory: false
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrDataUrl = await QRCode.toDataURL(qr);
      console.log("QR actualizado");
    }

    if (connection === "open") {
      console.log("WHATSAPP LISTO");
    }

    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      console.log("Conexión cerrada:", code);

      if (code !== DisconnectReason.loggedOut) {
        startBot();
      } else {
        console.log("Sesión cerrada, toca volver a escanear.");
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages?.[0];
    if (!msg || msg.key.fromMe) return;

    const jid = msg.key.remoteJid;
    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      "";

    if (!text.trim()) return;

    await sock.sendMessage(jid, { text: "Arrow IA activa: " + text }, { quoted: msg });
  });
}

startBot();
