// بوت Gateway خارجي: يستمع للأمر النصي "$استقاله" وينشر لوحة الاستقالة نفسها.
// أوامر السلاش والأزرار والـ Modal تبقى تعمل عبر Interactions Endpoint في تطبيق Lovable.
import { Client, GatewayIntentBits, Partials } from "discord.js";

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const APP_URL = (process.env.APP_URL || "").replace(/\/$/, "");
const PREFIX_COMMANDS = ["$استقاله", "$استقالة"];

if (!TOKEN || !APP_URL) {
  console.error("مطلوب متغيرا البيئة DISCORD_BOT_TOKEN و APP_URL");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

async function fetchPanel(guildId) {
  const response = await fetch(`${APP_URL}/api/public/discord/panel?guild_id=${guildId}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!response.ok) {
    throw new Error(`تعذّر جلب اللوحة (${response.status}): ${await response.text()}`);
  }
  return response.json();
}

client.once("clientReady", () => {
  console.log(`تم تسجيل الدخول باسم ${client.user.tag} — الأمر النصي: ${PREFIX_COMMANDS[0]}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;
  const content = message.content.trim();
  if (!PREFIX_COMMANDS.some((cmd) => content === cmd)) return;

  try {
    const payload = await fetchPanel(message.guild.id);
    await message.channel.send(payload);
  } catch (error) {
    console.error(error);
    await message.reply("تعذّر نشر لوحة الاستقالة. تأكد من إعداد البوت عبر /اعداد-الاستقالة.");
  }
});

client.login(TOKEN);
