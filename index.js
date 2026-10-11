const { Client, GatewayIntentBits } = require('discord.js');
const http = require('http');
const noblox = require('noblox.js');

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
const RAW_COOKIE = process.env.ROBLOSECURITY || process.env.ROBLOX_COOKIE || '';
const GROUP_ID = 1107209279;

async function startRoblox() {
    if (RAW_COOKIE) {
        try {
            // Çerezin başındaki fazlalıkları temizle (varsa)
            const cleanCookie = RAW_COOKIE.trim();
            const currentUser = await noblox.setCookie(cleanCookie);
            console.log(`Roblox hesabına giriş yapıldı: ${currentUser.UserName} (ID: ${currentUser.UserID})`);
        } catch (err) {
            console.error("Roblox Cookie giriş hatası:", err.message);
        }
    } else {
        console.warn("UYARI: ROBLOSECURITY değişkeni bulunamadı!");
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

    // 1. KULLANICI BİLGİSİ
    if (command === '!roblox') {
        if (!username) return message.reply('❌ Lütfen bir Roblox kullanıcı adı girin!');
        try {
            const id = await noblox.getIdFromUsername(username);
            const rank = await noblox.getRankInGroup(GROUP_ID, id);
            const rankName = await noblox.getRoleInGroup(GROUP_ID, id).catch(() => "Bilinmiyor");
            
            return message.reply(`🔍 **Kullanıcı:** ${username}\n🆔 **Roblox ID:** ${id}\n🎖️ **Rütbe:** ${rankName} (Seviye: ${rank})`);
        } catch (err) {
            return message.reply(`❌ Kullanıcı bulunamadı: ${err.message}`);
        }
    }

    // 2. RÜTBE VERME
    if (command === '!rolver') {
        const rank = parseInt(parts[2]);
        if (!username || isNaN(rank)) {
            return message.reply('❌ Doğru kullanım: `!rolver KullaniciAdi RütbeNumarası`');
        }

        try {
            const id = await noblox.getIdFromUsername(username);
            await noblox.setRank(GROUP_ID, id, rank);
            return message.reply(`✅ **${username}** kullanıcısının rütbesi başarıyla **${rank}** olarak güncellendi!`);
        } catch (err) {
            return message.reply(`❌ Rütbe verilirken hata oluştu: ${err.message}`);
        }
    }

    // 3. GRUPTAN ATMA
    if (command === '!gruptanat') {
        if (!username) return message.reply('❌ Lütfen bir kullanıcı adı girin!');
        try {
            const id = await noblox.getIdFromUsername(username);
            await noblox.exile(GROUP_ID, id);
            return message.reply(`🚫 **${username}** kullanıcısı gruptan atıldı!`);
        } catch (err) {
            return message.reply(`❌ Gruptan atılırken hata oluştu: ${err.message}`);
        }
    }
});

client.login(DISCORD_TOKEN);
