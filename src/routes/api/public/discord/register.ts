import { createFileRoute } from "@tanstack/react-router";

import {
  ApplicationCommandOptionType,
  COMMAND_CUSTOMIZE,
  COMMAND_EXCLUDED,
  COMMAND_MESSAGES,
  COMMAND_PANEL,
  COMMAND_RESIGN,
  COMMAND_REVIEWERS,
  COMMAND_SETUP,
  ChannelType,
  DISCORD_API,
  OPTION_ACCEPT_MESSAGE,
  OPTION_AUTO_REMOVE_ROLES,
  OPTION_BUTTON_LABEL,
  OPTION_CHANNEL,
  OPTION_COLOR,
  OPTION_DESCRIPTION,
  OPTION_IMAGE,
  OPTION_IMAGE_URL,
  OPTION_NAME,
  OPTION_PANEL_CHANNEL,
  OPTION_REASON,
  OPTION_REJECT_MESSAGE,
  OPTION_ROLE,
  OPTION_THUMBNAIL_URL,
  OPTION_TITLE,
  Permissions,
  ROLE_SLOTS,
} from "@/lib/discord/constants";

const adminOnly = String(Permissions.MANAGE_GUILD);
const textChannels = [ChannelType.GUILD_TEXT, ChannelType.GUILD_ANNOUNCEMENT];

function roleSlotOptions(count: number) {
  return ROLE_SLOTS.slice(0, count).map((slot, index) => ({
    name: slot,
    description: `رتبة رقم ${index + 1}`,
    type: ApplicationCommandOptionType.ROLE,
    required: false,
  }));
}

const commands = [
  {
    name: COMMAND_RESIGN,
    description: "تقديم طلب استقالة",
    dm_permission: false,
    options: [
      {
        name: OPTION_NAME,
        description: "اسمك",
        type: ApplicationCommandOptionType.STRING,
        required: true,
      },
      {
        name: OPTION_IMAGE,
        description: "صورة الرتبة",
        type: ApplicationCommandOptionType.ATTACHMENT,
        required: true,
      },
      {
        name: OPTION_REASON,
        description: "سبب الاستقالة",
        type: ApplicationCommandOptionType.STRING,
        required: true,
      },
    ],
  },
  {
    name: COMMAND_SETUP,
    description: "إعداد قناة استقبال الطلبات ورتبة الستاف",
    dm_permission: false,
    default_member_permissions: adminOnly,
    options: [
      {
        name: OPTION_CHANNEL,
        description: "قناة استقبال طلبات الاستقالة",
        type: ApplicationCommandOptionType.CHANNEL,
        required: true,
        channel_types: textChannels,
      },
      {
        name: OPTION_ROLE,
        description: "رتبة الستاف المرجعية",
        type: ApplicationCommandOptionType.ROLE,
        required: true,
      },
      {
        name: OPTION_PANEL_CHANNEL,
        description: "قناة نشر لوحة الاستقالة (اختياري)",
        type: ApplicationCommandOptionType.CHANNEL,
        required: false,
        channel_types: textChannels,
      },
      {
        name: OPTION_AUTO_REMOVE_ROLES,
        description: "هل تُزال الرتب الأعلى من رتبة الستاف تلقائيًا عند القبول؟",
        type: ApplicationCommandOptionType.BOOLEAN,
        required: false,
      },
    ],
  },
  {
    name: COMMAND_PANEL,
    description: "نشر لوحة الاستقالة مع زر التقديم",
    dm_permission: false,
    default_member_permissions: adminOnly,
    options: [
      {
        name: OPTION_CHANNEL,
        description: "قناة النشر (اختياري)",
        type: ApplicationCommandOptionType.CHANNEL,
        required: false,
        channel_types: textChannels,
      },
    ],
  },
  {
    name: COMMAND_CUSTOMIZE,
    description: "تخصيص شكل لوحة الاستقالة",
    dm_permission: false,
    default_member_permissions: adminOnly,
    options: [
      {
        name: OPTION_TITLE,
        description: "عنوان الرسالة",
        type: ApplicationCommandOptionType.STRING,
        required: false,
      },
      {
        name: OPTION_DESCRIPTION,
        description: "وصف الرسالة (استخدم \\n لسطر جديد)",
        type: ApplicationCommandOptionType.STRING,
        required: false,
      },
      {
        name: OPTION_COLOR,
        description: "لون الرسالة بصيغة HEX مثل #5865F2",
        type: ApplicationCommandOptionType.STRING,
        required: false,
      },
      {
        name: OPTION_IMAGE_URL,
        description: "رابط صورة كبيرة",
        type: ApplicationCommandOptionType.STRING,
        required: false,
      },
      {
        name: OPTION_THUMBNAIL_URL,
        description: "رابط صورة مصغّرة",
        type: ApplicationCommandOptionType.STRING,
        required: false,
      },
      {
        name: OPTION_BUTTON_LABEL,
        description: "اسم زر التقديم",
        type: ApplicationCommandOptionType.STRING,
        required: false,
      },
      {
        name: OPTION_PANEL_CHANNEL,
        description: "قناة اللوحة الافتراضية",
        type: ApplicationCommandOptionType.CHANNEL,
        required: false,
        channel_types: textChannels,
      },
    ],
  },
  {
    name: COMMAND_EXCLUDED,
    description: "تحديد الرتب المستثناة من الإزالة عند القبول (بدون خيارات = مسح القائمة)",
    dm_permission: false,
    default_member_permissions: adminOnly,
    options: roleSlotOptions(5),
  },
  {
    name: COMMAND_REVIEWERS,
    description: "تحديد الرتب التي يحق لها قبول/رفض الطلبات",
    dm_permission: false,
    default_member_permissions: adminOnly,
    options: roleSlotOptions(3),
  },
  {
    name: COMMAND_MESSAGES,
    description: "تخصيص رسائل نتيجة القبول والرفض",
    dm_permission: false,
    default_member_permissions: adminOnly,
    options: [
      {
        name: OPTION_ACCEPT_MESSAGE,
        description: "نص يظهر في بطاقة القبول",
        type: ApplicationCommandOptionType.STRING,
        required: false,
      },
      {
        name: OPTION_REJECT_MESSAGE,
        description: "نص يظهر في بطاقة الرفض",
        type: ApplicationCommandOptionType.STRING,
        required: false,
      },
    ],
  },
];

// نقطة تسجيل الأوامر: تُستدعى مرة واحدة بعد إضافة الأسرار.
// المصادقة تتم بتمرير Bot Token نفسه في ترويسة Authorization.
export const Route = createFileRoute("/api/public/discord/register")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const botToken = process.env["DISCORD_BOT_TOKEN"];
        const applicationId = process.env["DISCORD_APPLICATION_ID"];
        if (!botToken || !applicationId) {
          return new Response(JSON.stringify({ error: "الأسرار غير مضبوطة بعد" }), {
            status: 503,
            headers: { "content-type": "application/json" },
          });
        }

        const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        if (provided !== botToken) {
          return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: { "content-type": "application/json" },
          });
        }

        const response = await fetch(`${DISCORD_API}/applications/${applicationId}/commands`, {
          method: "PUT",
          headers: {
            Authorization: `Bot ${botToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(commands),
        });

        const text = await response.text();
        return new Response(text, {
          status: response.status,
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
