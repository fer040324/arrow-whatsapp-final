const { Client } = require('whatsapp-web.js');

const client = new Client({
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
    console.log('QR:');
    console.log(qr);
});

client.on('ready', () => {
    console.log('WhatsApp listo');
});

client.on('disconnected', (reason) => {
    console.log('Reconectando...', reason);
    client.initialize();
});

client.initialize();

setInterval(() => {
    console.log('bot vivo');
}, 10000);
