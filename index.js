const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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
            // 1. Kullanıcı ID, Display Name ve Kayıt Tarihi Çekme
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

            // Detaylı profil bilgisi (Kayıt tarihi için)
            const profileResponse = await fetch(`https://users.roblox.com/v1/users/${userId}`);
            const profileData = await profileResponse.json();
            const createdDate = profileData.created ? new Date(profileData.created).toLocaleDateString('tr-TR') : 'Bilinmiyor';

            // 2. Kullanıcının Avatar (Profil Resmi) URL'sini çekme
            const avatarResponse = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
            const avatarData = await avatarResponse.json();
            const avatarUrl = avatarData.data?.[0]?.imageUrl || 'https://www.roblox.com';

            // 3. Kullanıcının Durumunu (Online / Oyun Bilgisi) Çekme
            const presenceResponse = await fetch('https://presence.roblox.com/v1/presence/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userIds: [userId] })
            });
            const presenceData = await presenceResponse.json();
            const presence = presenceData.userPresences?.[0];

            let statusText = '🔴 Çevrimdışı (Offline)';
            let embedColor = '#FF0000'; // Çevrimdışıyken Kırmızı
            let currentGamePlaceId = null;

            if (presence) {
                if (presence.userPresenceType === 1) {
                    statusText = '🟢 Çevrimiçi (Website)';
                    embedColor = '#00FF00'; // Aktifken Yeşil
                } else if (presence.userPresenceType === 2) {
                    statusText = `🎮 Oyunda: **${presence.lastLocation || 'Bilinmeyen Oyun'}**`;
                    embedColor = '#00FF00'; // Oyundayken Yeşil
                    currentGamePlaceId = presence.placeId; // Oynadığı oyunun Place ID'si
                } else if (presence.userPresenceType === 3) {
                    statusText = `💻 Stüdyoda (Roblox Studio)`;
                    embedColor = '#00FF00'; // Stüdyodayken Yeşil
                }
            }

            // 4. Embed Tasarımı
            const embed = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle(`📌 Roblox Kullanıcı Profili`)
                .setURL(`https://www.roblox.com/users/${userId}/profile`)
                .setThumbnail(avatarUrl)
                .addFields(
                    { name: '👤 Görünen Ad', value: `\`${displayName}\``, inline: true },
                    { name: '🏷️ Kullanıcı Adı', value: `\`@${username}\``, inline: true },
                    { name: '🌐 Anlık Durum', value: statusText, inline: false },
                    { name: '📅 Kayıt Tarihi', value: `\`${createdDate}\``, inline: true },
                    { name: '🆔 Roblox ID', value: `\`${userId}\``, inline: true },
                    { name: '🛡️ Hedef Grup ID', value: `\`${GROUP_ID}\``, inline: false }
                )
                .setTimestamp()
                .setFooter({ text: 'NPC Tayfa', iconURL: client.user.displayAvatarURL() });

            // 5. Tıklanabilir Link Butonları Oluşturma
            const components = [];
            const row = new ActionRowBuilder();

            // Profil Butonu
            row.addComponents(
                new ButtonBuilder()
                    .setLabel('Roblox Profiline Git')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://www.roblox.com/users/${userId}/profile`)
            );

            // Eğer kişide oyun bilgisi varsa "Oyuna Katıl / Aç" Butonu Ekle
            if (currentGamePlaceId) {
                row.addComponents(
                    new ButtonBuilder()
                        .setLabel('🎮 Oynadığı Oyuna Git')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://www.roblox.com/games/${currentGamePlaceId}`)
                );
            }

            components.push(row);

            return message.reply({ embeds: [embed], components: components });

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
