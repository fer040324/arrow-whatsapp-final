const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './session'
    }),
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

client.on('qr', (qr) => {
    console.log('================ QR ================');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('BOT CONECTADO');
});

client.on('authenticated', () => {
    console.log('AUTENTICADO');
});

client.initialize();
