const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const DISCORD_TOKEN = process.env.TOKEN;

// Roblox Grup Bilgileri (Bunları kendi grubuna göre dolduracaksın)
const GROUP_ID = "GRUP_ID_BURAYA"; // Örn: "1234567"
const RANK_ID = 2; // Vermek istediğin rütbenin ID'si veya değeri

client.once('ready', () => {
    console.log(`Discord botu aktif ve hazır: ${client.user.tag}`);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // Kullanım: !grupver KullaniciAdi
    if (message.content.startsWith('!grupver')) {
        const args = message.content.split(' ');
        const username = args[1];

        if (!username) {
            return message.reply('Lütfen bir Roblox kullanıcı adı girin! Örnek: `!grupver KullaniciAdi`');
        }

        try {
            // 1. Adım: Roblox Kullanıcı Adından ID Bulma
            const userResponse = await fetch('https://users.roblox.com/v1/usernames/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usernames: [username],
                    excludeBannedUsers: true
                })
            });

            const userDataJson = await userResponse.json();

            if (!userDataJson.data || userDataJson.data.length === 0) {
                return message.reply('❌ Bu isimde bir Roblox kullanıcısı bulunamadı.');
            }

            const userId = userDataJson.data[0].id;
            const displayName = userDataJson.data[0].displayName;

            // 2. Adım: Roblox Grup API ile Rütbe Verme / Değiştirme
            // Not: Grup işlemleri için Roblox Open Cloud API Key gereklidir.
            // Bu kısmı grubunun API anahtarı ve yetkileriyle bağlayacağız.

            message.reply(`🔍 **${displayName}** (ID: ${userId}) bulundu!\n⏳ Roblox grubunda rütbe verme işlemi için Open Cloud API bağlantısı hazırlanıyor...`);

        } catch (error) {
            console.error(error);
            message.reply('İşlem sırasında bir hata oluştu.');
        }
    }
});

client.login(DISCORD_TOKEN);
