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

    if (msg.startsWith('!roblox')) {
        return message.reply('✅ Roblox komutu çalışıyor!');
    }

    if (msg.startsWith('!rolver')) {
        return message.reply('✅ Rolver komutu çalışıyor!');
    }

    if (msg.startsWith('!rolsil')) {
        return message.reply('✅ Rolsil komutu çalışıyor!');
    }

    if (msg.startsWith('!gruptanat')) {
        return message.reply('✅ Gruptanat komutu çalışıyor!');
    }
});

client.login(DISCORD_TOKEN);
