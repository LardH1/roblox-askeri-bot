index.js
const { Client, GatewayIntentBits } = require('discord.js');
const noblox = require('noblox.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const GROUP_ID = Number(process.env.GROUP_ID);

async function startBot() {
    await noblox.setCookie(process.env.COOKIE);
    console.log("Roblox hesabına başarıyla giriş yapıldı!");
}

client.on('ready', () => {
    console.log(`Discord botu aktif: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith('!rolver')) {
        const args = message.content.split(' ');
        const username = args[1];
        const roleInput = args.slice(2).join(' ');

        if (!username || !roleInput) {
            return message.reply('Kullanım: `!rolver <RobloxKullanıcıAdı> <RolAdı veya RankID>`');
        }

        try {
            const userId = await noblox.getIdFromUsername(username);
            
            let rank;
            if (!isNaN(roleInput)) {
                rank = await noblox.setRank(GROUP_ID, userId, Number(roleInput));
            } else {
                rank = await noblox.setRole(GROUP_ID, userId, roleInput);
            }

            message.reply(`✅ **${username}** adlı oyuncunun Roblox grubundaki yeni rolü: **${rank.name}**`);
        } catch (err) {
            console.error(err);
            message.reply(`❌ Bir hata oluştu: ${err.message}`);
        }
    }
});

startBot();
client.login(process.env.TOKEN);
