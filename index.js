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

    // --- 1. ROL VERME: !rolver KullaniciAdi RankNumarasi ---
    if (message.content.startsWith('!rolver')) {
        const args = message.content.split(' ');
        const username = args[1];
        const rankId = args[2];

        if (!username || !rankId) {
            return message.reply('Eksik kullanım! Örnek: `!rolver KullaniciAdi 3`');
        }

        try {
            const userResponse = await fetch('https://users.roblox.com/v1/usernames/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernames: [username], excludeBannedUsers: true })
            });

            const userDataJson = await userResponse.json();
            if (!userDataJson.data || userDataJson.data.length === 0) {
                return message.reply('❌ Bu isimde bir Roblox kullanıcısı bulunamadı.');
            }

            const userId = userDataJson.data[0].id;
            const displayName = userDataJson.data[0].displayName;

            message.reply(`✅ **${displayName}** (@${username}, ID: ${userId}) için rütbe verme isteği hazırlandı!\n🎖️ Grup ID: **${GROUP_ID}** | Hedef Rütbe: **${rankId}**`);

        } catch (error) {
            console.error(error);
            message.reply('İşlem sırasında bir hata oluştu.');
        }
    }

    // --- 2. ROL SİLME / ALMA: !rolsil KullaniciAdi ---
    if (message.content.startsWith('!rolsil')) {
        const args = message.content.split(' ');
        const username = args[1];

        if (!username) {
            return message.reply('Lütfen kullanıcı adını girin! Örnek: `!rolsil KullaniciAdi`');
        }

        try {
            const userResponse = await fetch('https://users.roblox.com/v1/usernames/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernames: [username], excludeBannedUsers: true })
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

    // --- 3. GRUPTAN ATMA: !gruptanat KullaniciAdi ---
    if (message.content.startsWith('!gruptanat')) {
        const args = message.content.split(' ');
        const username = args[1];

        if (!username) {
            return message.reply('Lütfen gruptan atılacak kullanıcı adını girin! Örnek: `!gruptanat KullaniciAdi`');
        }

        try {
            const userResponse = await fetch('https://users.roblox.com/v1/usernames/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernames: [username], excludeBannedUsers: true })
            });

            const userDataJson = await userResponse.json();
            if (!userDataJson.data || userDataJson.data.length === 0) {
                return message.reply('❌ Bu isimde bir Roblox kullanıcısı bulunamadı.');
            }

            const userId = userDataJson.data[0].id;
            const displayName = userDataJson.data[0].displayName;

            message.reply(`🚫 **${displayName}** (@${username}, ID: ${userId}) adlı kullanıcının gruptan atılma işlemi hazırlandı!\n📌 Grup ID: **${GROUP_ID}**`);

        } catch (error) {
            console.error(error);
            message.reply('İşlem sırasında bir hata oluştu.');
        }
    }
});

client.login(DISCORD_TOKEN);
