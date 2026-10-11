const { Client, GatewayIntentBits } = require('discord.js');
const http = require('http');

// Render'ın "Web Service" port gereksinimini karşılamak için mini HTTP sunucusu
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Roblox Discord Botu aktif!\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`HTTP sunucusu ${PORT} portunda dinlemede.`);
});

// Discord Bot Başlangıcı
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const DISCORD_TOKEN = process.env.TOKEN;

client.once('ready', () => {
    console.log(`Bot aktif: ${client.user.tag}`);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const msg = message.content.toLowerCase().trim();

    if (msg.startsWith('!roblox')) {
        return message.reply('✅ Roblox komutu çalışıyor!');
    }

    if (msg.startsWith('!rolver') || msg.startsWith('!r-ver')) {
        return message.reply('✅ Rütbe verme komutu çalışıyor!');
    }

    if (msg.startsWith('!rolsil') || msg.startsWith('!r-sil')) {
        return message.reply('✅ Rütbe silme komutu çalışıyor!');
    }

    if (msg.startsWith('!gruptanat') || msg.startsWith('!r-at')) {
        return message.reply('✅ Gruptan atma komutu çalışıyor!');
    }
});

client.login(DISCORD_TOKEN);
