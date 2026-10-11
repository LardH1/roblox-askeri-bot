const { Client, GatewayIntentBits } = require('discord.js');

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

    if (msg.startsWith('!r-bilgi')) {
        return message.reply('✅ Bilgi komutu çalışıyor!');
    }

    if (msg.startsWith('!r-ver')) {
        return message.reply('✅ Rütbe verme komutu çalışıyor!');
    }

    if (msg.startsWith('!r-sil')) {
        return message.reply('✅ Rütbe silme komutu çalışıyor!');
    }

    if (msg.startsWith('!r-at')) {
        return message.reply('✅ Gruptan atma komutu çalışıyor!');
    }
});

client.login(DISCORD_TOKEN);
