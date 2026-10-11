const { Client, GatewayIntentBits } = require('discord.js');
const http = require('http');
const noblox = require('noblox.js');

// Render Port Sunucusu
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Roblox Botu Aktif!\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`HTTP sunucusu ${PORT} portunda.`));

// Discord Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const DISCORD_TOKEN = process.env.TOKEN;
const ROBLOX_COOKIE = process.env.ROBLOX_COOKIE; // Render Environment Variables kısmına eklenecek
const GROUP_ID = 1107209279; // Grubunun ID'si (Sayısal olarak)

async function startRoblox() {
    if (ROBLOX_COOKIE) {
        try {
            const currentUser = await noblox.setCookie(ROBLOX_COOKIE);
            console.log(`Roblox hesabına giriş yapıldı: ${currentUser.UserName} (ID: ${currentUser.UserID})`);
        } catch (err) {
            console.error("Roblox Cookie giriş hatası:", err.message);
        }
    } else {
        console.warn("UYARI: ROBLOX_COOKIE çevresel değişkeni bulunamadı!");
    }
}

client.once('ready', () => {
    console.log(`Discord Botu bağlandı: ${client.user.tag}`);
    startRoblox();
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const content = message.content.trim();
    const parts = content.split(/\s+/);
    const command = parts[0]?.toLowerCase();
    const username = parts[1];

    if (!command) return;

    // 1. KULLANICI BİLGİSİ: !roblox KullaniciAdi
    if (command === '!roblox') {
        if (!username) return message.reply('❌ Lütfen bir Roblox kullanıcı adı girin!');
        try {
            const id = await noblox.getIdFromUsername(username);
            const rankName = await noblox.getRoleInGroup(GROUP_ID, id);
            return message.reply(`🔍 **Kullanıcı:** ${username}\n🆔 **Roblox ID:** ${id}\n🎖️ **Gruptaki Rütbesi:** ${rankName}`);
        } catch (err) {
            return message.reply(`❌ Kullanıcı bulunamadı veya bir hata oluştu: ${err.message}`);
        }
    }

    // 2. GERÇEK RÜTBE VERME: !rolver KullaniciAdi RankSira
    if (command === '!rolver') {
        const rank = parseInt(parts[2]);
        if (!username || isNaN(rank)) {
            return message.reply('❌ Doǧru kullanım: `!rolver KullaniciAdi RütbeNumarası` (Örn: `!rolver mertxerdem112 5`)');
        }

        try {
            const id = await noblox.getIdFromUsername(username);
            const setRankRes = await noblox.setRank(GROUP_ID, id, rank);
            return message.reply(`✅ **${username}** kullanıcısının rütbesi başarıyla **${setRankRes}** (Rütbe Seviyesi: ${rank}) olarak güncellendi!`);
        } catch (err) {
            return message.reply(`❌ Rütbe verilirken hata oluştu: ${err.message}`);
        }
    }

    // 3. GERÇEK GRUPTAN ATMA: !gruptanat KullaniciAdi
    if (command === '!gruptanat') {
        if (!username) return message.reply('❌ Lütfen bir kullanıcı adı girin!');
        try {
            const id = await noblox.getIdFromUsername(username);
            await noblox.exile(GROUP_ID, id);
            return message.reply(`🚫 **${username}** kullanıcısı gruptan başarıyla atıldı!`);
        } catch (err) {
            return message.reply(`❌ Gruptan atılırken hata oluştu: ${err.message}`);
        }
    }
});

client.login(DISCORD_TOKEN);
