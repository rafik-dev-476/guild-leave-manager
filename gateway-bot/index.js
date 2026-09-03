// بوت Gateway خارجي: يستمع للأمر النصي "$استقالة" وينشر لوحة الاستقالة نفسها.
// أوامر السلاش والأزرار والـ Modal تبقى تعمل عبر Interactions Endpoint في تطبيق Lovable.
import { createServer } from "node:http";
import { Client, Events, GatewayIntentBits, Partials } from "discord.js";

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const APP_URL = (process.env.APP_URL || "https://guild-leave-manager.lovable.app").replace(/\/$/, "");
const PORT = Number(process.env.PORT || 3000);
const DISPLAY_COMMAND = "$استقالة";
const VERSION = "3.0.0";
let gatewayReady = false;

if (!TOKEN) {
  console.error("متغير البيئة DISCORD_BOT_TOKEN مطلوب");
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
  gatewayReady = true;
  console.log(
    `تم تسجيل الدخول باسم ${client.user?.tag} — الأمر النصي: ${DISPLAY_COMMAND} — الإصدار ${VERSION}`,
  );
  console.log(`APP_URL = ${APP_URL}`);
  console.log("البوت جاهز لاستقبال رسائل السيرفرات.");
}

client.once(Events.ClientReady, onReady);

client.on("error", (e) => console.error("خطأ في العميل:", e));

function isResignationCommand(rawContent) {
  const normalized = rawContent
    .normalize("NFKC")
    .replace(
      /[\u0000-\u001F\u061C\u064B-\u065F\u0670\u0640\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/g,
      "",
    )
    .trim()
    .replace(/^([!$])\s+/, "$1")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ");

  return /^(?:\$|!)استقاله(?:\s.*)?$/u.test(normalized);
}

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;
  const content = message.content.trim();
  if (!content) {
    console.warn("وصلت رسالة فارغة — على الأرجح MESSAGE CONTENT INTENT غير مفعّل.");
    return;
  }
  if (!isResignationCommand(content)) return;

  console.log(`تم استلام أمر الاستقالة في السيرفر ${message.guild.id}`);

  try {
    const payload = await fetchPanel(message.guild.id);
    await message.channel.send({ ...payload, allowedMentions: { parse: [] } });
    console.log(`تم نشر لوحة الاستقالة في السيرفر ${message.guild.id}`);
  } catch (error) {
    console.error(error);
    await message
      .reply(`تعذّر نشر لوحة الاستقالة: ${String(error.message || error).slice(0, 400)}`)
      .catch(() => {});
  }
});

client.on("warn", (warning) => console.warn("تحذير من Gateway:", warning));

client.on("shardDisconnect", (event, shardId) => {
  gatewayReady = false;
  console.error(`انقطع Gateway للشريحة ${shardId} بالكود ${event.code}`);
  if (event.code === 4014) {
    console.error("فعّل MESSAGE CONTENT INTENT من Discord Developer Portal ثم أعد تشغيل الخدمة.");
  }
});

// يبقي منصات الاستضافة المجانية على علم بأن الخدمة حية، ويعرض حالة اتصال Gateway.
createServer((request, response) => {
  if (request.url !== "/" && request.url !== "/health") {
    response.writeHead(404).end("not found");
    return;
  }
  response.writeHead(gatewayReady ? 200 : 503, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify({ ok: gatewayReady, version: VERSION, command: DISPLAY_COMMAND }));
}).listen(PORT, "0.0.0.0", () => console.log(`Health check يعمل على المنفذ ${PORT}`));

client.login(TOKEN).catch((error) => {
  console.error("فشل تسجيل دخول البوت. تحقق من التوكن:", error.message);
  process.exit(1);
});
