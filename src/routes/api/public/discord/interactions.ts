import { createFileRoute } from "@tanstack/react-router";

import {
  ButtonStyle,
  COMMAND_RESIGN,
  COMMAND_SETUP,
  EmbedColors,
  InteractionResponseType,
  InteractionType,
  MessageFlags,
  OPTION_CHANNEL,
  OPTION_IMAGE,
  OPTION_NAME,
  OPTION_REASON,
  OPTION_ROLE,
  Permissions,
} from "@/lib/discord/constants";
import {
  createMessage,
  getGuildMember,
  getGuildRoles,
  removeMemberRole,
} from "@/lib/discord/api.server";
import { getGuildSettings, saveGuildSettings } from "@/lib/discord/settings.server";
import { verifyDiscordRequest } from "@/lib/discord/verify.server";

type Option = { name: string; type: number; value?: string | number | boolean };

type Interaction = {
  type: number;
  guild_id?: string;
  member?: {
    user?: { id: string; username?: string; global_name?: string | null };
    permissions?: string;
  };
  data?: {
    name?: string;
    custom_id?: string;
    options?: Option[];
    resolved?: { attachments?: Record<string, { url: string; content_type?: string }> };
  };
  message?: { embeds?: unknown[] };
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function ephemeral(content: string) {
  return json({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content, flags: MessageFlags.EPHEMERAL },
  });
}

function optionValue(options: Option[] | undefined, name: string): string | undefined {
  const found = options?.find((option) => option.name === name);
  return found?.value === undefined ? undefined : String(found.value);
}

function hasAdminPermission(permissionBits: string | undefined): boolean {
  if (!permissionBits) return false;
  const bits = BigInt(permissionBits);
  return (
    (bits & Permissions.ADMINISTRATOR) !== 0n ||
    (bits & Permissions.MANAGE_GUILD) !== 0n ||
    (bits & Permissions.MANAGE_ROLES) !== 0n
  );
}

function displayName(interaction: Interaction): string {
  const user = interaction.member?.user;
  return user?.global_name || user?.username || "غير معروف";
}

function resignationEmbed(input: {
  name: string;
  reason: string;
  imageUrl: string;
  authorId: string;
}) {
  return {
    title: "طلب استقالة",
    color: EmbedColors.PENDING,
    fields: [
      { name: "الاسم", value: input.name, inline: true },
      { name: "مقدّم الطلب", value: `<@${input.authorId}>`, inline: true },
      { name: "السبب", value: input.reason },
      { name: "الحالة", value: "⏳ قيد المراجعة" },
    ],
    image: { url: input.imageUrl },
    timestamp: new Date().toISOString(),
  };
}

function decisionButtons(authorId: string) {
  return [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: ButtonStyle.SUCCESS,
          label: "قبول",
          custom_id: `resign_accept:${authorId}`,
        },
        {
          type: 2,
          style: ButtonStyle.DANGER,
          label: "رفض",
          custom_id: `resign_reject:${authorId}`,
        },
      ],
    },
  ];
}

async function handleSetup(interaction: Interaction) {
  if (!interaction.guild_id) return ephemeral("هذا الأمر يعمل داخل السيرفر فقط.");
  if (!hasAdminPermission(interaction.member?.permissions)) {
    return ephemeral("هذا الأمر مخصص للإدارة فقط.");
  }
  const channelId = optionValue(interaction.data?.options, OPTION_CHANNEL);
  const roleId = optionValue(interaction.data?.options, OPTION_ROLE);
  if (!channelId || !roleId) return ephemeral("يجب تحديد القناة ورتبة الستاف.");

  await saveGuildSettings({
    guild_id: interaction.guild_id,
    resignation_channel_id: channelId,
    staff_role_id: roleId,
  });

  return ephemeral(`تم الحفظ ✅\nقناة النشر: <#${channelId}>\nرتبة الستاف: <@&${roleId}>`);
}

async function handleResignation(interaction: Interaction, token: string) {
  if (!interaction.guild_id) return ephemeral("هذا الأمر يعمل داخل السيرفر فقط.");
  const settings = await getGuildSettings(interaction.guild_id);
  if (!settings?.resignation_channel_id || !settings.staff_role_id) {
    return ephemeral("لم يتم إعداد البوت بعد. استخدم أمر /اعداد-الاستقالة أولًا.");
  }

  const name = optionValue(interaction.data?.options, OPTION_NAME);
  const reason = optionValue(interaction.data?.options, OPTION_REASON);
  const attachmentId = optionValue(interaction.data?.options, OPTION_IMAGE);
  const imageUrl = attachmentId
    ? interaction.data?.resolved?.attachments?.[attachmentId]?.url
    : undefined;
  const authorId = interaction.member?.user?.id;

  if (!name || !reason || !imageUrl || !authorId) {
    return ephemeral("بيانات ناقصة، تأكد من تعبئة جميع الحقول.");
  }

  await createMessage(settings.resignation_channel_id, token, {
    embeds: [resignationEmbed({ name, reason, imageUrl, authorId })],
    components: decisionButtons(authorId),
  });

  return ephemeral("تم إرسال طلب الاستقالة إلى الإدارة ✅");
}

async function removeRolesAboveStaff(
  guildId: string,
  memberId: string,
  staffRoleId: string,
  token: string,
) {
  const roles = await getGuildRoles(guildId, token);
  const staffRole = roles.find((role) => role.id === staffRoleId);
  if (!staffRole) return 0;

  const member = await getGuildMember(guildId, memberId, token);
  const rolesToRemove = member.roles.filter((roleId) => {
    const role = roles.find((item) => item.id === roleId);
    return role && !role.managed && role.position > staffRole.position;
  });

  for (const roleId of rolesToRemove) {
    await removeMemberRole(guildId, memberId, roleId, token, "قبول طلب استقالة");
  }
  return rolesToRemove.length;
}

async function handleButton(interaction: Interaction, token: string) {
  const [action, memberId] = (interaction.data?.custom_id ?? "").split(":");
  if (action !== "resign_accept" && action !== "resign_reject") {
    return ephemeral("زر غير معروف.");
  }
  if (!hasAdminPermission(interaction.member?.permissions)) {
    return ephemeral("لا تملك الصلاحية لاستخدام هذا الزر.");
  }
  if (!interaction.guild_id || !memberId) return ephemeral("طلب غير صالح.");

  const embed = (interaction.message?.embeds?.[0] ?? {}) as {
    fields?: { name: string; value: string; inline?: boolean }[];
    [key: string]: unknown;
  };
  const moderator = displayName(interaction);
  const accepted = action === "resign_accept";

  let statusValue = accepted
    ? `✅ مقبولة بواسطة ${moderator}`
    : `❌ مرفوضة بواسطة ${moderator}`;

  if (accepted) {
    const settings = await getGuildSettings(interaction.guild_id);
    if (!settings?.staff_role_id) return ephemeral("رتبة الستاف غير محددة في الإعدادات.");
    try {
      const removed = await removeRolesAboveStaff(
        interaction.guild_id,
        memberId,
        settings.staff_role_id,
        token,
      );
      statusValue += ` — تمت إزالة ${removed} رتبة`;
    } catch (error) {
      console.error(error);
      return ephemeral("تعذّر إزالة الرتب. تأكد أن رتبة البوت أعلى من رتب العضو ولديه صلاحية إدارة الرتب.");
    }
  }

  const fields = (embed.fields ?? []).map((field) =>
    field.name === "الحالة" ? { ...field, value: statusValue } : field,
  );

  return json({
    type: InteractionResponseType.UPDATE_MESSAGE,
    data: {
      embeds: [
        {
          ...embed,
          color: accepted ? EmbedColors.ACCEPTED : EmbedColors.REJECTED,
          fields,
        },
      ],
      components: [],
    },
  });
}

export const Route = createFileRoute("/api/public/discord/interactions")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const publicKey = process.env["DISCORD_PUBLIC_KEY"];
        const botToken = process.env["DISCORD_BOT_TOKEN"];
        const rawBody = await request.text();

        if (!publicKey || !botToken) {
          console.error("DISCORD_PUBLIC_KEY أو DISCORD_BOT_TOKEN غير مضبوط");
          return new Response("Server not configured", { status: 503 });
        }

        const valid = await verifyDiscordRequest(
          rawBody,
          request.headers.get("x-signature-ed25519"),
          request.headers.get("x-signature-timestamp"),
          publicKey,
        );
        if (!valid) return new Response("invalid request signature", { status: 401 });

        const interaction = JSON.parse(rawBody) as Interaction;

        try {
          if (interaction.type === InteractionType.PING) {
            return json({ type: InteractionResponseType.PONG });
          }
          if (interaction.type === InteractionType.APPLICATION_COMMAND) {
            if (interaction.data?.name === COMMAND_SETUP) return await handleSetup(interaction);
            if (interaction.data?.name === COMMAND_RESIGN) {
              return await handleResignation(interaction, botToken);
            }
            return ephemeral("أمر غير معروف.");
          }
          if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
            return await handleButton(interaction, botToken);
          }
          return json({ type: InteractionResponseType.PONG });
        } catch (error) {
          console.error("Discord interaction error", error);
          return ephemeral("حدث خطأ غير متوقع، حاول لاحقًا.");
        }
      },
    },
  },
});
