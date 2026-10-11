const { Client, GatewayIntentBits } = require('discord.js');
const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot aktif\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`HTTP sunucusu ${PORT} portunda.`);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const DISCORD_TOKEN = process.env.TOKEN;

client.once('ready', () => {
    console.log(`Bot Discord'a bağlandı: ${client.user.tag}`);
});

client.on('messageCreate', async message => {
    // Sunucuda yazılan HER MESAJI konsola yazdır (Botun mesajları görüp görmediğini test etmek için)
    console.log(`[MESAJ GELDİ] Gönderen: ${message.author.tag} | İçerik: ${message.content}`);

    if (message.author.bot) return;

    const msg = message.content.toLowerCase().trim();

    if (msg.startsWith('!roblox')) {
        return message.reply('✅ Roblox komutu çalışıyor!');
    }
});

client.login(DISCORD_TOKEN);
