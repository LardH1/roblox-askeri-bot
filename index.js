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
    if (!message.content.startsWith('!')) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // --- 1. BİLGİ: !roblox KullaniciAdi ---
    if (command === 'roblox') {
        const username = args[0];
        if (!username) return message.reply('Örnek: `!roblox mertxerdem112`');

        try {
            const userResponse = await fetch('https://users.roblox.com/v1/usernames/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernames: [username], excludeBannedUsers: true })
            });

            const userDataJson = await userResponse.json();
            if (!userDataJson.data || userDataJson.data.length === 0) {
                return message.reply('❌ Kullanıcı bulunamadı.');
            }

            const userId = userDataJson.data[0].id;
            const displayName = userDataJson.data[0].displayName;

            return message.reply(`🔍 **Bilgi:** ${displayName} (@${username}) - ID: ${userId}`);
        } catch (error) {
            console.error(error);
            return message.reply('Bir hata oluştu.');
        }
    }

    // --- 2. RÜTBE VER: !rver KullaniciAdi Rank ---
    if (command === 'rver') {
        const username = args[0];
        const rankId = args[1];

        if (!username || !rankId) {
            return message.reply('Eksik kullanım! Örnek: `!rver mertxerdem112 3`');
        }

        try {
            const userResponse = await fetch('https://users.roblox.com/v1/usernames/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernames: [username], excludeBannedUsers: true })
            });

            const userDataJson = await userResponse.json();
            if (!userDataJson.data || userDataJson.data.length === 0) {
                return message.reply('❌ Kullanıcı bulunamadı.');
            }

            const userId = userDataJson.data[0].id;
            const displayName = userDataJson.data[0].displayName;

            return message.reply(`✅ **${displayName}** (@${username}, ID: ${userId}) için rütbe verme (${rankId}) isteği hazırlandı!`);
        } catch (error) {
            console.error(error);
            return message.reply('Bir hata oluştu.');
        }
    }

    // --- 3. RÜTBE SİL: !rsil KullaniciAdi ---
    if (command === 'rsil') {
        const username = args[0];
        if (!username) return message.reply('Örnek: `!rsil mertxerdem112`');

        try {
            const userResponse = await fetch('https://users.roblox.com/v1/usernames/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernames: [username], excludeBannedUsers: true })
            });

            const userDataJson = await userResponse.json();
            if (!userDataJson.data || userDataJson.data.length === 0) {
                return message.reply('❌ Kullanıcı bulunamadı.');
            }

            const userId = userDataJson.data[0].id;
            const displayName = userDataJson.data[0].displayName;

            return message.reply(`🗑️ **${displayName}** (@${username}, ID: ${userId}) için rütbe silme isteği hazırlandı!`);
        } catch (error) {
            console.error(error);
            return message.reply('Bir hata oluştu.');
        }
    }

    // --- 4. GRUPTAN AT: !rat KullaniciAdi ---
    if (command === 'rat') {
        const username = args[0];
        if (!username) return message.reply('Örnek: `!rat mertxerdem112`');

        try {
            const userResponse = await fetch('https://users.roblox.com/v1/usernames/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernames: [username], excludeBannedUsers: true })
            });

            const userDataJson = await userResponse.json();
            if (!userDataJson.data || userDataJson.data.length === 0) {
                return message.reply('❌ Kullanıcı bulunamadı.');
            }

            const userId = userDataJson.data[0].id;
            const displayName = userDataJson.data[0].displayName;

            return message.reply(`🚫 **${displayName}** (@${username}, ID: ${userId}) kullanıcısını gruptan atma isteği hazırlandı!`);
        } catch (error) {
            console.error(error);
            return message.reply('Bir hata oluştu.');
        }
    }
});

client.login(DISCORD_TOKEN);
