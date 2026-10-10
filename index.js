const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios'); // Roblox API sorguları için

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const DISCORD_TOKEN = process.env.TOKEN;
const GROUP_ID = Number(process.env.GROUP_ID);

client.once('ready', () => {
    console.log(`Discord botu aktif ve hazır: ${client.user.tag}`);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // Örnek: Roblox Kullanıcı Bilgisi Sorgulama Komutu (!roblox <kullanıcıadı>)
    if (message.content.startsWith('!roblox')) {
        const args = message.content.split(' ');
        const username = args[1];

        if (!username) {
            return message.reply('Lütfen bir Roblox kullanıcı adı girin! Örnek: `!roblox KullaniciAdi`');
        }

        try {
            // Roblox API üzerinden kullanıcı ID'sini bulma (Cookie istemez)
            const userRes = await axios.post('https://users.roblox.com/v1/usernames/users', {
                usernames: [username],
                excludeBannedUsers: true
            });

            if (userRes.data.data.length === 0) {
                return message.reply('Bu isimde bir Roblox kullanıcısı bulunamadı.');
            }

            const userData = userRes.data.data[0];
            const userId = userData.id;
            const displayName = userData.displayName;

            message.reply(`Bulunan Kullanıcı:\n- **Kullanıcı Adı:** ${username}\n- **Görünen Ad:** ${displayName}\n- **ID:** ${userId}`);

        } catch (error) {
            console.error(error);
            message.reply('Roblox API ile iletişim kurarken bir hata oluştu.');
        }
    }
});

client.login(DISCORD_TOKEN);
