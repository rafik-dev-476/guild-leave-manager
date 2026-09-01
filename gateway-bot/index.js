// بوت Gateway خارجي: يستمع للأمر النصي "$استقاله" وينشر لوحة الاستقالة نفسها.
// أوامر السلاش والأزرار والـ Modal تبقى تعمل عبر Interactions Endpoint في تطبيق Lovable.
import { Client, GatewayIntentBits, Partials } from "discord.js";

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const APP_URL = (process.env.APP_URL || "").replace(/\/$/, "");
const PREFIX_COMMANDS = ["$استقاله", "$استقالة", "$استقاله ", "!استقاله", "!استقالة"];

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
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`تعذّر جلب اللوحة (${response.status}): ${text}`);
  }
  return JSON.parse(text);
}

function onReady() {
  console.log(`تم تسجيل الدخول باسم ${client.user?.tag} — الأمر النصي: ${PREFIX_COMMANDS[0]}`);
  console.log(`APP_URL = ${APP_URL}`);
}

// discord.js v14 يستخدم "ready" و v15 يستخدم "clientReady" — ندعم الاثنين.
client.once("ready", onReady);
client.once("clientReady", onReady);

client.on("error", (e) => console.error("خطأ في العميل:", e));

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;
  const content = message.content.trim();
  if (!content) {
    console.warn("وصلت رسالة فارغة — على الأرجح MESSAGE CONTENT INTENT غير مفعّل.");
    return;
  }
  const isCommand = PREFIX_COMMANDS.some(
    (cmd) => content === cmd.trim() || content.startsWith(`${cmd.trim()} `),
  );
  if (!isCommand) return;

  try {
    const payload = await fetchPanel(message.guild.id);
    await message.channel.send(payload);
  } catch (error) {
    console.error(error);
    await message
      .reply(`تعذّر نشر لوحة الاستقالة: ${String(error.message || error).slice(0, 400)}`)
      .catch(() => {});
  }
});

client.login(TOKEN);
