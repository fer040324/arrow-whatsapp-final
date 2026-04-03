const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const pino = require("pino");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    browser: ["Arrow", "Chrome", "1.0"],
    markOnlineOnConnect: false,
    syncFullHistory: false
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log("WHATSAPP IA LISTA");
    }

    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      console.log("Conexión cerrada:", code);

      if (code !== DisconnectReason.loggedOut) {
        startBot();
      } else {
        console.log("Sesión cerrada. Escaneá el QR otra vez.");
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

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Eres un vendedor experto de Arrow Store. Respondes corto, natural y cierras ventas."
            },
            { role: "user", content: text }
          ],
          temperature: 0.6
        })
      });

      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content || "¿Para qué celular sería?";

      await sock.sendMessage(jid, { text: reply }, { quoted: msg });
    } catch (error) {
      console.log("Error IA:", error);
      await sock.sendMessage(jid, { text: "Error IA" }, { quoted: msg });
    }
  });
}

startBot();
