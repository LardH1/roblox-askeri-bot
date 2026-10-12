const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, REST, Routes, SlashCommandBuilder } = require('discord.js');
const http = require('http');

// Render port isteği için HTTP sunucusu
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('NPC Tayfa Botu (Roblox & Minecraft) Aktif!\n');
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

// Slash Komut Tanımları
const commands = [
    // 1. Roblox Komutu
    new SlashCommandBuilder()
        .setName('roblox')
        .setDescription('Roblox kullanıcı profilini ve oyun durumunu sorgular.')
        .addStringOption(option =>
            option.setName('kullanici_adi')
                .setDescription('Sorgulanacak Roblox kullanıcı adı')
                .setRequired(true))
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .toJSON(),

    // 2. Minecraft Sunucu Sorgulama Komutu
    new SlashCommandBuilder()
        .setName('mcserver')
        .setDescription('Bir Minecraft sunucusunun durumunu ve oyuncu sayısını sorgular.')
        .addStringOption(option =>
            option.setName('ip')
                .setDescription('Minecraft Sunucu IP adresi (Örn: hypixel.net veya sunucu.aternos.me)')
                .setRequired(true))
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .toJSON(),

    // 3. Minecraft Oyuncu Profil Sorgulama Komutu
    new SlashCommandBuilder()
        .setName('mcuser')
        .setDescription('Minecraft oyuncusunun skin (dış görünüş) ve profil bilgilerini getirir.')
        .addStringOption(option =>
            option.setName('kullanici_adi')
                .setDescription('Minecraft kullanıcı adı')
                .setRequired(true))
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .toJSON()
];

client.once('ready', async () => {
    console.log(`Discord Botu bağlandı: ${client.user.tag}`);

    const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
    try {
        console.log('Slash komutları kaydediliyor...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log('Tüm komutlar (Roblox & Minecraft) başarıyla yüklendi!');
    } catch (error) {
        console.error('Komut yükleme hatası:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    // --- ROBLOX KOMUTU ---
    if (interaction.commandName === 'roblox') {
        const username = interaction.options.getString('kullanici_adi');
        await interaction.deferReply();

        try {
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

            const avatarResponse = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
            const avatarData = await avatarResponse.json();
            const avatarUrl = avatarData.data?.[0]?.imageUrl || 'https://www.roblox.com';

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
            return interaction.editReply('Roblox API hatası oluştu.');
        }
    }

    // --- MINECRAFT SUNUCU SORGULAMA KOMUTU ---
    if (interaction.commandName === 'mcserver') {
        const ip = interaction.options.getString('ip');
        await interaction.deferReply();

        try {
            const response = await fetch(`https://api.mcsrvstat.us/2/${ip}`);
            const data = await response.json();

            if (!data.online) {
                const offlineEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('🔴 Sunucu Kapalı / Bulunamadı')
                    .setDescription(`\`${ip}\` adresindeki Minecraft sunucusuna ulaşılamıyor veya sunucu kapalı.`);
                return interaction.editReply({ embeds: [offlineEmbed] });
            }

            const iconUrl = `https://api.mcsrvstat.us/icon/${ip}`;
            const motdText = data.motd?.clean ? data.motd.clean.join('\n') : 'Açıklama yok';

            const serverEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle(`🎮 Minecraft Sunucu Durumu`)
                .setThumbnail(iconUrl)
                .addFields(
                    { name: '🌐 Sunucu IP', value: `\`${ip}\``, inline: true },
                    { name: '🟢 Durum', value: 'Çevrimiçi (Açık)', inline: true },
                    { name: '👥 Oyuncu Sayısı', value: `\`${data.players.online} / ${data.players.max}\``, inline: true },
                    { name: '🛠️ Sürüm', value: `\`${data.version || 'Bilinmiyor'}\``, inline: true },
                    { name: '📝 Sunucu Mesajı (MOTD)', value: `\`\`\`${motdText}\`\`\``, inline: false }
                )
                .setTimestamp()
                .setFooter({ text: 'NPC Tayfa Minecraft', iconURL: client.user.displayAvatarURL() });

            return interaction.editReply({ embeds: [serverEmbed] });

        } catch (err) {
            console.error(err);
            return interaction.editReply('Minecraft Sunucu API hatası oluştu.');
        }
    }

    // --- MINECRAFT OYUNCU SORGULAMA KOMUTU ---
    if (interaction.commandName === 'mcuser') {
        const mcUser = interaction.options.getString('kullanici_adi');
        await interaction.deferReply();

        try {
            const uuidRes = await fetch(`https://api.mojang.com/users/profiles/minecraft/${mcUser}`);
            if (uuidRes.status === 204 || uuidRes.status === 404) {
                const notFound = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('❌ Oyuncu Bulunamadı')
                    .setDescription(`**${mcUser}** adında orijinal bir Minecraft hesabı bulunamadı.`);
                return interaction.editReply({ embeds: [notFound] });
            }

            const uuidData = await uuidRes.json();
            const uuid = uuidData.id;
            const realName = uuidData.name;

            const bodyUrl = `https://crafatar.com/renders/renders/full/${uuid}?overlay`;
            const headUrl = `https://crafatar.com/avatars/${uuid}?overlay`;

            const userEmbed = new EmbedBuilder()
                .setColor('#55FF55')
                .setTitle(`⛏️ Minecraft Oyuncu Profili`)
                .setThumbnail(headUrl)
                .setImage(bodyUrl)
                .addFields(
                    { name: '👤 Kullanıcı Adı', value: `\`${realName}\``, inline: true },
                    { name: '🆔 UUID', value: `\`${uuid}\``, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'NPC Tayfa Minecraft', iconURL: client.user.displayAvatarURL() });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('Skin İndir')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://crafatar.com/skins/${uuid}`)
            );

            return interaction.editReply({ embeds: [userEmbed], components: [row] });

        } catch (err) {
            console.error(err);
            return interaction.editReply('Minecraft Oyuncu API hatası oluştu.');
        }
    }
});

client.login(DISCORD_TOKEN);
