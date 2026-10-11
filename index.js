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
const GROUP_ID = "1107209279";

client.once('ready', () => {
    console.log(`Bot Discord'a bağlandı: ${client.user.tag}`);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith('!')) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const username = args[0];

    // 1. KULLANICI BİLGİ: !roblox KullaniciAdi
    if (command === 'roblox') {
        if (!username) {
            return message.reply('❌ Lütfen bir kullanıcı adı girin! Örnek: `!roblox mertxerdem112`');
        }

        try {
            const userResponse = await fetch('https://users.roblox.com/v1/usernames/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernames: [username], excludeBannedUsers: true })
            });

            const userData = await userResponse.json();
            if (!userData.data || userData.data.length === 0) {
                return message.reply('❌ Bu isimde bir Roblox kullanıcısı bulunamadı.');
            }

            const userId = userData.data[0].id;
            const displayName = userData.data[0].displayName;

            return message.reply(`🔍 **Kullanıcı Bilgisi:**\n* **Görünen Ad:** ${displayName}\n* **Kullanıcı Adı:** @${username}\n* **Roblox ID:** ${userId}`);
        } catch (err) {
            console.error(err);
            return message.reply('Kullanıcı bilgisi alınırken bir hata oluştu.');
        }
    }

    // 2. RÜTBE VER: !rolver KullaniciAdi RankNumarasi
    if (command === 'rolver') {
        const rankId = args[1];
        if (!username || !rankId) {
            return message.reply('❌ Eksik kullanım! Örnek: `!rolver mertxerdem112 3`');
        }

        try {
            const userResponse = await fetch('https://users.roblox.com/v1/usernames/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernames: [username], excludeBannedUsers: true })
            });

            const userData = await userResponse.json();
            if (!userData.data || userData.data.length === 0) {
                return message.reply('❌ Bu isimde bir Roblox kullanıcısı bulunamadı.');
            }

            const userId = userData.data[0].id;
            const displayName = userData.data[0].displayName;

            return message.reply(`✅ **${displayName}** (@${username}, ID: ${userId}) için **Rütbe: ${rankId}** verme isteği hazırlandı!\n🎖️ Grup ID: **${GROUP_ID}**`);
        } catch (err) {
            console.error(err);
            return message.reply('İşlem sırasında bir hata oluştu.');
        }
    }

    // 3. RÜTBE SİL: !rolsil KullaniciAdi
    if (command === 'rolsil') {
        if (!username) {
            return message.reply('❌ Lütfen kullanıcı adını girin! Örnek: `!rolsil mertxerdem112`');
        }

        try {
            const userResponse = await fetch('https://users.roblox.com/v1/usernames/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernames: [username], excludeBannedUsers: true })
            });

            const userData = await userResponse.json();
            if (!userData.data || userData.data.length === 0) {
                return message.reply('❌ Bu isimde bir Roblox kullanıcısı bulunamadı.');
            }

            const userId = userData.data[0].id;
            const displayName = userData.data[0].displayName;

            return message.reply(`🗑️ **${displayName}** (@${username}, ID: ${userId}) kullanıcısının rütbesini alma isteği hazırlandı!\n📌 Grup ID: **${GROUP_ID}**`);
        } catch (err) {
            console.error(err);
            return message.reply('İşlem sırasında bir hata oluştu.');
        }
    }

    // 4. GRUPTAN AT: !gruptanat KullaniciAdi
    if (command === 'gruptanat') {
        if (!username) {
            return message.reply('❌ Lütfen gruptan atılacak kullanıcı adını girin! Örnek: `!gruptanat mertxerdem112`');
        }

        try {
            const userResponse = await fetch('https://users.roblox.com/v1/usernames/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernames: [username], excludeBannedUsers: true })
            });

            const userData = await userResponse.json();
            if (!userData.data || userData.data.length === 0) {
                return message.reply('❌ Bu isimde bir Roblox kullanıcısı bulunamadı.');
            }

            const userId = userData.data[0].id;
            const displayName = userData.data[0].displayName;

            return message.reply(`🚫 **${displayName}** (@${username}, ID: ${userId}) kullanıcısını gruptan atma isteği hazırlandı!\n📌 Grup ID: **${GROUP_ID}**`);
        } catch (err) {
            console.error(err);
            return message.reply('İşlem sırasında bir hata oluştu.');
        }
    }
});

client.login(DISCORD_TOKEN);
