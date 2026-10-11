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
    console.log(`Discord botu aktif ve hazır: ${client.user.tag}`);
});

client.on('messageCreate', async message => {
    // Kendi attığı veya başka botların attığı mesajları yok say (Spam engelleme)
    if (message.author.bot) return;

    if (message.content.startsWith('!roblox')) {
        const args = message.content.split(' ');
        const username = args[1];

        if (!username) {
            return message.reply('Lütfen bir Roblox kullanıcı adı girin! Örnek: `!roblox KullaniciAdi`');
        }

        try {
            const response = await fetch('https://users.roblox.com/v1/usernames/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    usernames: [username],
                    excludeBannedUsers: true
                })
            });

            const data = await response.json();

            if (!data.data || data.data.length === 0) {
                return message.reply('Bu isimde bir Roblox kullanıcısı bulunamadı.');
            }

            const userData = data.data[0];
            message.reply(`Bulunan Kullanıcı:\n- **Kullanıcı Adı:** ${username}\n- **Görünen Ad:** ${userData.displayName}\n- **ID:** ${userData.id}`);

        } catch (error) {
            console.error(error);
            message.reply('Roblox API ile iletişim kurarken bir hata oluştu.');
        }
    }
});

client.login(DISCORD_TOKEN);
