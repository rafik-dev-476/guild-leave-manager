import { createFileRoute } from "@tanstack/react-router";

import {
  ApplicationCommandOptionType,
  COMMAND_RESIGN,
  COMMAND_SETUP,
  ChannelType,
  DISCORD_API,
  OPTION_CHANNEL,
  OPTION_IMAGE,
  OPTION_NAME,
  OPTION_REASON,
  OPTION_ROLE,
  Permissions,
} from "@/lib/discord/constants";

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
    description: "إعداد قناة الاستقالات ورتبة الستاف",
    dm_permission: false,
    default_member_permissions: String(Permissions.MANAGE_GUILD),
    options: [
      {
        name: OPTION_CHANNEL,
        description: "قناة نشر بطاقات الاستقالة",
        type: ApplicationCommandOptionType.CHANNEL,
        required: true,
        channel_types: [ChannelType.GUILD_TEXT, ChannelType.GUILD_ANNOUNCEMENT],
      },
      {
        name: OPTION_ROLE,
        description: "رتبة الستاف المرجعية",
        type: ApplicationCommandOptionType.ROLE,
        required: true,
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
