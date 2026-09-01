import { createFileRoute } from "@tanstack/react-router";

import { panelPayload } from "@/lib/discord/panel";
import { getGuildSettings } from "@/lib/discord/settings.server";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// يستخدمه بوت الـ Gateway الخارجي للحصول على حمولة لوحة الاستقالة الخاصة بالسيرفر.
// المصادقة: Authorization: Bearer <DISCORD_BOT_TOKEN> (نفس توكن البوت).
export const Route = createFileRoute("/api/public/discord/panel")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const botToken = process.env["DISCORD_BOT_TOKEN"];
        if (!botToken) return json({ error: "الأسرار غير مضبوطة بعد" }, 503);

        const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        if (provided !== botToken) return json({ error: "unauthorized" }, 401);

        const guildId = new URL(request.url).searchParams.get("guild_id");
        if (!guildId || !/^\d{5,25}$/.test(guildId)) return json({ error: "guild_id غير صالح" }, 400);

        const settings = await getGuildSettings(guildId);
        // في حال لم يُخصَّص شيء بعد، ننشر اللوحة بالقيم الافتراضية بدل رفض الطلب.
        return json(
          panelPayload(
            settings ?? {
              panel_title: null,
              panel_description: null,
              panel_color: null,
              panel_image_url: null,
              panel_thumbnail_url: null,
              panel_button_label: null,
            },
          ),
        );
      },
    },
  },
});
