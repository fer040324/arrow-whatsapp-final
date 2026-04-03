const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', async (qr) => {
    console.log('QR RECEIVED');

    const url = await qrcode.toDataURL(qr);
    console.log('SCAN THIS QR:');
    console.log(url);
});

client.on('ready', () => {
    console.log('BOT LISTO');
});

client.on('message', async msg => {
    if (msg.body.toLowerCase() === 'hola') {
        msg.reply('Hola 👋 soy la IA de Arrow Store');
    }
});

client.initialize();
