const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const DISCORD_TOKEN = process.env.TOKEN;
const GROUP_ID = "1107209279"; // Roblox Grup ID'n

client.once('ready', () => {
    console.log(`Discord botu aktif ve hazır: ${client.user.tag}`);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // --- ROL VERME KOMUTU: !rolver KullaniciAdi RankNumarasi ---
    if (message.content.startsWith('!rolver')) {
        const args = message.content.split(' ');
        const username = args[1];
        const rankId = args[2]; // Komutun yanına yazılan rütbe numarası (Örn: 3)

        if (!username || !rankId) {
            return message.reply('Eksik kullanım! Örnek kullanım: `!rolver KullaniciAdi 3`');
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

            // 2. Adım: Bilgilendirme ve İşlem Özeti
            message.reply(`✅ **${displayName}** (@${username}, ID: ${userId}) için işlem hazır!\n🎖️ Grup ID: **${GROUP_ID}** | Verilmek İstenen Rütbe (Rank): **${rankId}**`);

        } catch (error) {
            console.error(error);
            message.reply('İşlem sırasında bir hata oluştu.');
        }
    }

    // --- ROL SİLME / ALMA KOMUTU: !rolsil KullaniciAdi ---
    if (message.content.startsWith('!rolsil')) {
        const args = message.content.split(' ');
        const username = args[1];

        if (!username) {
            return message.reply('Lütfen rütbesi alınacak kullanıcı adını girin! Örnek: `!rolsil KullaniciAdi`');
        }

        try {
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

            message.reply(`🗑️ **${displayName}** (@${username}, ID: ${userId}) adlı kullanıcının rütbesini alma isteği hazırlandı!\n📌 Grup ID: **${GROUP_ID}**`);

        } catch (error) {
            console.error(error);
            message.reply('İşlem sırasında bir hata oluştu.');
        }
    }
});

client.login(DISCORD_TOKEN);
