const { Client, GatewayIntentBits } = require('discord.js');
const http = require('http');

// Render port isteği için sunucu
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Roblox Botu Aktif!\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`HTTP sunucusu ${PORT} portunda.`));

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
    console.log(`Discord Botu bağlandı: ${client.user.tag}`);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const content = message.content.trim();
    const parts = content.split(/\s+/);
    const command = parts[0]?.toLowerCase();
    const username = parts[1];

    if (!command) return;

    // Sadece !roblox komutu çalışacak
    if (command === '!roblox') {
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

            return message.reply(`🔍 **Kullanıcı Bilgisi:**\n* **Görünen Ad:** ${displayName}\n* **Kullanıcı Adı:** @${username}\n* **Roblox ID:** ${userId}\n* **Grup ID:** ${GROUP_ID}`);
        } catch (err) {
            console.error(err);
            return message.reply('Kullanıcı bilgisi alınırken bir hata oluştu.');
        }
    }
});

client.login(DISCORD_TOKEN);
