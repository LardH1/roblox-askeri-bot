const { Client, GatewayIntentBits } = require('discord.js');

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
    console.log(`Bot basariyla giris yapti: ${client.user.tag}`);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const content = message.content.trim();

    // 1. ROBLOX BİLGİ KOMUTU: !roblox KullaniciAdi
    if (content.startsWith('!roblox')) {
        const parts = content.split(/\s+/);
        const username = parts[1];

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

            return message.reply(`🔍 **Kullanıcı Bulundu:**\n* **Görünen Ad:** ${displayName}\n* **Kullanıcı Adı:** @${username}\n* **Roblox ID:** ${userId}`);
        } catch (err) {
            console.error(err);
            return message.reply('Sorgulama sırasında bir hata oluştu.');
        }
    }

    // 2. RÜTBE VERME KOMUTU: !rolver KullaniciAdi RankNumarasi
    if (content.startsWith('!rolver') || content.startsWith('!rver')) {
        const parts = content.split(/\s+/);
        const username = parts[1];
        const rankId = parts[2];

        if (!username || !rankId) {
            return message.reply('❌ Eksik komut! Örnek: `!rolver mertxerdem112 3`');
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

            return message.reply(`✅ **${displayName}** (@${username}, ID: ${userId}) için **Rütbe: ${rankId}** verme işlemi işlendi!`);
        } catch (err) {
            console.error(err);
            return message.reply('Rütbe verilirken bir hata oluştu.');
        }
    }

    // 3. RÜTBE SİLME KOMUTU: !rolsil KullaniciAdi
    if (content.startsWith('!rolsil') || content.startsWith('!rsil')) {
        const parts = content.split(/\s+/);
        const username = parts[1];

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

            return message.reply(`🗑️ **${displayName}** (@${username}, ID: ${userId}) kullanıcısının rütbesi sıfırlandı / alındı!`);
        } catch (err) {
            console.error(err);
            return message.reply('Rütbe silinirken bir hata oluştu.');
        }
    }

    // 4. GRUPTAN ATMA KOMUTU: !gruptanat KullaniciAdi
    if (content.startsWith('!gruptanat') || content.startsWith('!rat')) {
        const parts = content.split(/\s+/);
        const username = parts[1];

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

            return message.reply(`🚫 **${displayName}** (@${username}, ID: ${userId}) kullanıcısı gruptan atıldı!`);
        } catch (err) {
            console.error(err);
            return message.reply('Gruptan atma işlemi sırasında bir hata oluştu.');
        }
    }
});

client.login(DISCORD_TOKEN);
