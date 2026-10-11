const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, REST, Routes, SlashCommandBuilder } = require('discord.js');
const http = require('http');

// Render port isteği için HTTP sunucusu
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

// Slash Komut Tanımı (DM ve Grup Sohbeti Yetkileri Dahil)
const commands = [
    new SlashCommandBuilder()
        .setName('roblox')
        .setDescription('Roblox kullanıcı profilini ve oyun durumunu sorgular.')
        .addStringOption(option =>
            option.setName('kullanici_adi')
                .setDescription('Sorgulanacak Roblox kullanıcı adı')
                .setRequired(true))
        // Komutun hem Sunucularda (0) hem de Kullanıcı Hesabında (1) çalışmasını sağlar
        .setIntegrationTypes([0, 1])
        // Komutun Sunucu (0), Direkt Mesaj (1) ve Grup DM (2) ortamlarında görünmesini sağlar
        .setContexts([0, 1, 2])
        .toJSON()
];

client.once('ready', async () => {
    console.log(`Discord Botu bağlandı: ${client.user.tag}`);

    // Slash komutlarını Discord API'ye global olarak kaydetme
    const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
    try {
        console.log('Slash komutları kaydediliyor...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log('Slash komutları grup sohbetleri ve DM izinleriyle yüklendi!');
    } catch (error) {
        console.error('Komut yükleme hatası:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'roblox') {
        const username = interaction.options.getString('kullanici_adi');

        await interaction.deferReply();

        try {
            // 1. Kullanıcı ID, Display Name ve Kayıt Tarihi
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
                return interaction.editReply({ embeds: [notFoundEmbed] });
            }

            const userId = userData.data[0].id;
            const displayName = userData.data[0].displayName;

            const profileResponse = await fetch(`https://users.roblox.com/v1/users/${userId}`);
            const profileData = await profileResponse.json();
            const createdDate = profileData.created ? new Date(profileData.created).toLocaleDateString('tr-TR') : 'Bilinmiyor';

            // 2. Avatar Görseli
            const avatarResponse = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
            const avatarData = await avatarResponse.json();
            const avatarUrl = avatarData.data?.[0]?.imageUrl || 'https://www.roblox.com';

            // 3. Oyun/Durum Bilgisi
            const presenceResponse = await fetch('https://presence.roblox.com/v1/presence/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userIds: [userId] })
            });
            const presenceData = await presenceResponse.json();
            const presence = presenceData.userPresences?.[0];

            let statusText = '🔴 Çevrimdışı (Offline)';
            let embedColor = '#FF0000';
            let currentGamePlaceId = null;

            if (presence) {
                if (presence.userPresenceType === 1) {
                    statusText = '🟢 Çevrimiçi (Website)';
                    embedColor = '#00FF00';
                } else if (presence.userPresenceType === 2) {
                    statusText = `🎮 Oyunda: **${presence.lastLocation || 'Bilinmeyen Oyun'}**`;
                    embedColor = '#00FF00';
                    currentGamePlaceId = presence.placeId;
                } else if (presence.userPresenceType === 3) {
                    statusText = `💻 Stüdyoda (Roblox Studio)`;
                    embedColor = '#00FF00';
                }
            }

            // 4. Embed Mesajı
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

            // 5. Butonlar
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('Roblox Profiline Git')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://www.roblox.com/users/${userId}/profile`)
            );

            if (currentGamePlaceId) {
                row.addComponents(
                    new ButtonBuilder()
                        .setLabel('🎮 Oynadığı Oyuna Git')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://www.roblox.com/games/${currentGamePlaceId}`)
                );
            }

            return interaction.editReply({ embeds: [embed], components: [row] });

        } catch (err) {
            console.error(err);
            const systemErrorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('⚠️ Sistem Hatası')
                .setDescription('Roblox API ile iletişim kurulurken bir hata oluştu.');
            return interaction.editReply({ embeds: [systemErrorEmbed] });
        }
    }
});

client.login(DISCORD_TOKEN);
