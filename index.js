const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const DISCORD_TOKEN = process.env.TOKEN;

// --- ROBLOX GRUP VE RÜTBE AYARLARI ---
const GROUP_ID = "1107209279"; // Senin Roblox Grup ID'n
const TARGET_RANK_ID = 1;      // Vermek istediğin rütbenin numarasını (Rank 0-255) buraya yazabilirsin!

client.once('ready', () => {
    console.log(`Discord botu aktif ve hazır: ${client.user.tag}`);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // Kullanım: !rolver RobloxKullaniciAdi
    if (message.content.startsWith('!rolver')) {
        const args = message.content.split(' ');
        const username = args[1];

        if (!username) {
            return message.reply('Lütfen bir Roblox kullanıcı adı girin! Örnek: `!rolver KullaniciAdi`');
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

            // 2. Adım: Bilgilendirme ve İşlem Onayı
            message.reply(`🔍 **${displayName}** (@${username}, ID: ${userId}) başarıyla bulundu!\n🎖️ Hedef Grup ID: **${GROUP_ID}** | Hedef Rütbe Seviyesi: **${TARGET_RANK_ID}**\n\n*(Rütbeyi değiştirmek istersen kodun üst kısmındaki TARGET_RANK_ID değerini düzenleyebilirsin.)*`);

        } catch (error) {
            console.error(error);
            message.reply('İşlem sırasında bir hata oluştu.');
        }
    }
});

client.login(DISCORD_TOKEN);
