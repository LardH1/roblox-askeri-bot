const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
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

    if (command === '!roblox') {
        if (!username) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('⚠️ Eksik Komut Kullanımı')
                .setDescription('Lütfen bir Roblox kullanıcı adı girin!\n\n**Örnek Kullanım:**\n`!roblox mertxerdem112`');
            return message.reply({ embeds: [errorEmbed] });
        }

        try {
            // 1. Kullanıcı ID ve Display Name çekme
            const userResponse = await fetch('https://users.roblox.com/v1/usernames/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernames: [username], excludeBannedUsers: true })
            });

            const userData = await userResponse.json();
            if (!userData.data || userData.data.length === 0) {
                const notFoundEmbed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('❌ Kullanıcı Bulunamadı')
                    .setDescription(`**${username}** adında aktif bir Roblox kullanıcısı bulunamadı.`);
                return message.reply({ embeds: [notFoundEmbed] });
            }

            const userId = userData.data[0].id;
            const displayName = userData.data[0].displayName;

            // 2. Kullanıcının Avatar (Profil Resmi) URL'sini çekme
            const avatarResponse = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
            const avatarData = await avatarResponse.json();
            const avatarUrl = avatarData.data?.[0]?.imageUrl || 'https://www.roblox.com';

            // 3. Şık ve Gösterişli Embed Tasarımı Oluşturma
            const embed = new EmbedBuilder()
                .setColor('#2B2D31') // Discord koyu tema şık gri/siyah tonu
                .setTitle(`📌 Roblox Kullanıcı Profili`)
                .setURL(`https://www.roblox.com/users/${userId}/profile`)
                .setThumbnail(avatarUrl) // Profil fotoğrafını sağ üst köşeye koyar
                .addFields(
                    { name: '👤 Görünen Ad', value: `\`${displayName}\``, inline: true },
                    { name: '🏷️ Kullanıcı Adı', value: `\`@${username}\``, inline: true },
                    { name: '🆔 Roblox ID', value: `\`${userId}\``, inline: false },
                    { name: '🛡️ Hedef Grup ID', value: `\`${GROUP_ID}\``, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'TTS Rütbe Sistemi', iconURL: client.user.displayAvatarURL() });

            return message.reply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            const systemErrorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('⚠️ Sistem Hatası')
                .setDescription('Roblox API ile iletişim kurulurken bir hata oluştu.');
            return message.reply({ embeds: [systemErrorEmbed] });
        }
    }
});

client.login(DISCORD_TOKEN);
