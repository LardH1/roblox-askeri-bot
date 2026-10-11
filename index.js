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
    // Botun kendi mesajlarını ve diğer botları yoksay
    if (message.author.bot) return;

    // Sadece '!' ile başlayan mesajlarla ilgilen
    if (!message.content.startsWith('!')) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const username = args[0];

    // --- 1. ROBLOX BİLGİ / KONTROL: !roblox KullaniciAdi ---
    if (command === 'roblox') {
        if (!username) {
            return message.reply('Lütfen bir Roblox kullanıcı adı girin! Örnek: `!roblox mertxerdem112`');
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

            return message.reply(`🔍 **Kullanıcı Bilgisi:**\n* **Görünen Ad:** ${displayName}\n* **Kullanıcı Adı:** @${username}\n* **Roblox ID:** ${userId}`);

        } catch (error) {
            console.error(error);
            return message.reply('Kullanıcı bilgisi alınırken bir hata oluştu.');
        }
    }

    // --- 2. ROL VERME: !rolver KullaniciAdi RankNumarasi ---
    if (command === 'rolver') {
        const rankId = args[1];

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

            return message.reply(`✅ **${displayName}** (@${username}, ID: ${userId}) için rütbe verme isteği hazırlandı!\n🎖️ Grup ID: **${GROUP_ID}** | Hedef Rütbe: **${rankId}**`);

        } catch (error) {
            console.error(error);
            return message.reply('İşlem sırasında bir hata oluştu.');
        }
    }

    // --- 3. ROL SİLME / ALMA: !rolsil KullaniciAdi ---
    if (command === 'rolsil') {
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

            return message.reply(`🗑️ **${displayName}** (@${username}, ID: ${userId}) adlı kullanıcının rütbesini alma isteği hazırlandı!\n📌 Grup ID: **${GROUP_ID}**`);

        } catch (error) {
            console.error(error);
            return message.reply('İşlem sırasında bir hata oluştu.');
        }
    }

    // --- 4. GRUPTAN ATMA: !gruptanat KullaniciAdi ---
    if (command === 'gruptanat') {
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

            return message.reply(`🚫 **${displayName}** (@${username}, ID: ${userId}) adlı kullanıcının gruptan atılma işlemi hazırlandı!\n📌 Grup ID: **${GROUP_ID}**`);

        } catch (error) {
            console.error(error);
            return message.reply('İşlem sırasında bir hata oluştu.');
        }
    }
});

client.login(DISCORD_TOKEN);
