import { createFileRoute } from "@tanstack/react-router";

import {
  ButtonStyle,
  COMMAND_CUSTOMIZE,
  COMMAND_EXCLUDED,
  COMMAND_MESSAGES,
  COMMAND_PANEL,
  COMMAND_RESIGN,
  COMMAND_REVIEWERS,
  COMMAND_SETUP,
  ComponentType,
  CUSTOM_ID_MODAL,
  CUSTOM_ID_OPEN_MODAL,
  DEFAULT_ACCEPT_MESSAGE,
  DEFAULT_REJECT_MESSAGE,
  EmbedColors,
  FIELD_IMAGE,
  FIELD_NAME,
  FIELD_REASON,
  InteractionResponseType,
  InteractionType,
  MessageFlags,
  OPTION_ACCEPT_MESSAGE,
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
  TextInputStyle,
} from "@/lib/discord/constants";
import {
  createMessage,
  getGuildMember,
  getGuildRoles,
  removeMemberRole,
} from "@/lib/discord/api.server";
import {
  getGuildSettings,
  saveGuildSettings,
  type GuildSettings,
} from "@/lib/discord/settings.server";
import { panelPayload } from "@/lib/discord/panel";
import { verifyDiscordRequest } from "@/lib/discord/verify.server";

type Option = { name: string; type: number; value?: string | number | boolean };

type ModalComponent = {
  type: number;
  components?: { type: number; custom_id?: string; value?: string }[];
};

type Interaction = {
  type: number;
  guild_id?: string;
  member?: {
    user?: { id: string; username?: string; global_name?: string | null };
    permissions?: string;
    roles?: string[];
  };
  data?: {
    name?: string;
    custom_id?: string;
    options?: Option[];
    components?: ModalComponent[];
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

function modalValue(components: ModalComponent[] | undefined, customId: string): string {
  for (const row of components ?? []) {
    for (const component of row.components ?? []) {
      if (component.custom_id === customId) return (component.value ?? "").trim();
    }
  }
  return "";
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

function canReview(interaction: Interaction, settings: GuildSettings | null): boolean {
  if (hasAdminPermission(interaction.member?.permissions)) return true;
  const reviewers = settings?.reviewer_role_ids ?? [];
  if (reviewers.length === 0) return false;
  const memberRoles = interaction.member?.roles ?? [];
  return memberRoles.some((roleId) => reviewers.includes(roleId));
}

function displayName(interaction: Interaction): string {
  const user = interaction.member?.user;
  return user?.global_name || user?.username || "غير معروف";
}

function parseColor(input: string | undefined): number | null {
  if (!input) return null;
  const clean = input.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return Number.parseInt(clean, 16);
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\/\S+$/i.test(value);
}

function collectRoleIds(options: Option[] | undefined): string[] {
  const ids = ROLE_SLOTS.map((slot) => optionValue(options, slot)).filter(
    (value): value is string => Boolean(value),
  );
  return Array.from(new Set(ids));
}

/* ---------------------------------- اللوحة --------------------------------- */

function resignationModal() {
  return json({
    type: InteractionResponseType.MODAL,
    data: {
      custom_id: CUSTOM_ID_MODAL,
      title: "نموذج الاستقالة",
      components: [
        {
          type: ComponentType.ACTION_ROW,
          components: [
            {
              type: ComponentType.TEXT_INPUT,
              custom_id: FIELD_NAME,
              label: "الاسم",
              style: TextInputStyle.SHORT,
              required: true,
              max_length: 100,
            },
          ],
        },
        {
          type: ComponentType.ACTION_ROW,
          components: [
            {
              type: ComponentType.TEXT_INPUT,
              custom_id: FIELD_IMAGE,
              label: "رابط صورة الرتبة",
              placeholder: "https://...",
              style: TextInputStyle.SHORT,
              required: true,
              max_length: 500,
            },
          ],
        },
        {
          type: ComponentType.ACTION_ROW,
          components: [
            {
              type: ComponentType.TEXT_INPUT,
              custom_id: FIELD_REASON,
              label: "السبب",
              style: TextInputStyle.PARAGRAPH,
              required: true,
              max_length: 1000,
            },
          ],
        },
      ],
    },
  });
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
      type: ComponentType.ACTION_ROW,
      components: [
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SUCCESS,
          label: "قبول",
          custom_id: `resign_accept:${authorId}`,
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.DANGER,
          label: "رفض",
          custom_id: `resign_reject:${authorId}`,
        },
      ],
    },
  ];
}

/* --------------------------------- الأوامر --------------------------------- */

async function handleSetup(interaction: Interaction) {
  if (!interaction.guild_id) return ephemeral("هذا الأمر يعمل داخل السيرفر فقط.");
  if (!hasAdminPermission(interaction.member?.permissions)) {
    return ephemeral("هذا الأمر مخصص للإدارة فقط.");
  }
  const channelId = optionValue(interaction.data?.options, OPTION_CHANNEL);
  const roleId = optionValue(interaction.data?.options, OPTION_ROLE);
  const panelChannelId = optionValue(interaction.data?.options, OPTION_PANEL_CHANNEL);
  if (!channelId || !roleId) return ephemeral("يجب تحديد قناة الطلبات ورتبة الستاف.");

  await saveGuildSettings({
    guild_id: interaction.guild_id,
    resignation_channel_id: channelId,
    staff_role_id: roleId,
    ...(panelChannelId ? { panel_channel_id: panelChannelId } : {}),
  });

  return ephemeral(
    `تم الحفظ ✅\nقناة استقبال الطلبات: <#${channelId}>\nرتبة الستاف: <@&${roleId}>` +
      (panelChannelId ? `\nقناة اللوحة: <#${panelChannelId}>` : ""),
  );
}

async function handleCustomize(interaction: Interaction) {
  if (!interaction.guild_id) return ephemeral("هذا الأمر يعمل داخل السيرفر فقط.");
  if (!hasAdminPermission(interaction.member?.permissions)) {
    return ephemeral("هذا الأمر مخصص للإدارة فقط.");
  }
  const options = interaction.data?.options;
  const title = optionValue(options, OPTION_TITLE);
  const description = optionValue(options, OPTION_DESCRIPTION);
  const colorInput = optionValue(options, OPTION_COLOR);
  const image = optionValue(options, OPTION_IMAGE_URL);
  const thumbnail = optionValue(options, OPTION_THUMBNAIL_URL);
  const buttonLabel = optionValue(options, OPTION_BUTTON_LABEL);
  const panelChannelId = optionValue(options, OPTION_PANEL_CHANNEL);

  if (colorInput && parseColor(colorInput) === null) {
    return ephemeral("صيغة اللون غير صحيحة. استخدم صيغة HEX مثل #5865F2.");
  }
  for (const url of [image, thumbnail]) {
    if (url && !isHttpUrl(url)) return ephemeral("روابط الصور يجب أن تبدأ بـ http(s).");
  }

  const patch: Partial<GuildSettings> & { guild_id: string } = { guild_id: interaction.guild_id };
  if (title) patch.panel_title = title;
  if (description) patch.panel_description = description.replace(/\\n/g, "\n");
  if (colorInput) patch.panel_color = parseColor(colorInput);
  if (image) patch.panel_image_url = image;
  if (thumbnail) patch.panel_thumbnail_url = thumbnail;
  if (buttonLabel) patch.panel_button_label = buttonLabel;
  if (panelChannelId) patch.panel_channel_id = panelChannelId;

  if (Object.keys(patch).length === 1) return ephemeral("لم تحدد أي خيار للتعديل.");

  await saveGuildSettings(patch);
  return ephemeral("تم تحديث تخصيص اللوحة ✅ استخدم /لوحة-الاستقالة لنشرها.");
}

async function handleSendPanel(interaction: Interaction, token: string) {
  if (!interaction.guild_id) return ephemeral("هذا الأمر يعمل داخل السيرفر فقط.");
  if (!hasAdminPermission(interaction.member?.permissions)) {
    return ephemeral("هذا الأمر مخصص للإدارة فقط.");
  }
  const settings = await getGuildSettings(interaction.guild_id);
  const override = optionValue(interaction.data?.options, OPTION_CHANNEL);
  const channelId = override || settings?.panel_channel_id || settings?.resignation_channel_id;
  if (!settings || !channelId) {
    return ephemeral("حدد قناة اللوحة أولًا عبر /اعداد-الاستقالة أو مرّر القناة مع الأمر.");
  }

  await createMessage(channelId, token, panelPayload(settings));
  if (override && override !== settings.panel_channel_id) {
    await saveGuildSettings({ guild_id: interaction.guild_id, panel_channel_id: override });
  }
  return ephemeral(`تم نشر لوحة الاستقالة في <#${channelId}> ✅`);
}

async function handleRoleList(
  interaction: Interaction,
  field: "excluded_role_ids" | "reviewer_role_ids",
) {
  if (!interaction.guild_id) return ephemeral("هذا الأمر يعمل داخل السيرفر فقط.");
  if (!hasAdminPermission(interaction.member?.permissions)) {
    return ephemeral("هذا الأمر مخصص للإدارة فقط.");
  }
  const ids = collectRoleIds(interaction.data?.options);
  await saveGuildSettings({ guild_id: interaction.guild_id, [field]: ids });

  const label = field === "excluded_role_ids" ? "الرتب المستثناة" : "من يحق لهم القبول/الرفض";
  return ephemeral(
    ids.length === 0
      ? `تم مسح قائمة ${label} ✅`
      : `تم تحديث ${label} ✅\n${ids.map((id) => `<@&${id}>`).join(" ")}`,
  );
}

async function handleMessages(interaction: Interaction) {
  if (!interaction.guild_id) return ephemeral("هذا الأمر يعمل داخل السيرفر فقط.");
  if (!hasAdminPermission(interaction.member?.permissions)) {
    return ephemeral("هذا الأمر مخصص للإدارة فقط.");
  }
  const accept = optionValue(interaction.data?.options, OPTION_ACCEPT_MESSAGE);
  const reject = optionValue(interaction.data?.options, OPTION_REJECT_MESSAGE);
  if (!accept && !reject) return ephemeral("حدد رسالة القبول أو رسالة الرفض على الأقل.");

  await saveGuildSettings({
    guild_id: interaction.guild_id,
    ...(accept ? { accept_message: accept } : {}),
    ...(reject ? { reject_message: reject } : {}),
  });
  return ephemeral("تم تحديث رسائل النتيجة ✅");
}

async function submitResignation(
  interaction: Interaction,
  token: string,
  input: { name: string; reason: string; imageUrl: string },
) {
  const settings = await getGuildSettings(interaction.guild_id!);
  if (!settings?.resignation_channel_id || !settings.staff_role_id) {
    return ephemeral("لم يتم إعداد البوت بعد. استخدم أمر /اعداد-الاستقالة أولًا.");
  }
  const authorId = interaction.member?.user?.id;
  if (!authorId) return ephemeral("تعذّر تحديد مقدّم الطلب.");

  await createMessage(settings.resignation_channel_id, token, {
    embeds: [resignationEmbed({ ...input, authorId })],
    components: decisionButtons(authorId),
  });
  return ephemeral("تم إرسال طلب الاستقالة إلى الإدارة ✅");
}

async function handleResignationCommand(interaction: Interaction, token: string) {
  if (!interaction.guild_id) return ephemeral("هذا الأمر يعمل داخل السيرفر فقط.");
  const name = optionValue(interaction.data?.options, OPTION_NAME);
  const reason = optionValue(interaction.data?.options, OPTION_REASON);
  const attachmentId = optionValue(interaction.data?.options, OPTION_IMAGE);
  const imageUrl = attachmentId
    ? interaction.data?.resolved?.attachments?.[attachmentId]?.url
    : undefined;

  if (!name || !reason || !imageUrl) {
    return ephemeral("بيانات ناقصة، تأكد من تعبئة جميع الحقول.");
  }
  return submitResignation(interaction, token, { name, reason, imageUrl });
}

async function handleModalSubmit(interaction: Interaction, token: string) {
  if (!interaction.guild_id) return ephemeral("هذا الأمر يعمل داخل السيرفر فقط.");
  const components = interaction.data?.components;
  const name = modalValue(components, FIELD_NAME);
  const imageUrl = modalValue(components, FIELD_IMAGE);
  const reason = modalValue(components, FIELD_REASON);

  if (!name || !imageUrl || !reason) return ephemeral("جميع الحقول مطلوبة.");
  if (!isHttpUrl(imageUrl)) {
    return ephemeral("رابط صورة الرتبة غير صالح. ارفع الصورة في أي قناة وانسخ رابطها ثم أعد المحاولة.");
  }
  return submitResignation(interaction, token, { name, reason, imageUrl });
}

/* ---------------------------------- الأزرار -------------------------------- */

async function removeRolesAboveStaff(
  guildId: string,
  memberId: string,
  settings: GuildSettings,
  token: string,
) {
  const roles = await getGuildRoles(guildId, token);
  const staffRole = roles.find((role) => role.id === settings.staff_role_id);
  if (!staffRole) return 0;

  const member = await getGuildMember(guildId, memberId, token);
  const excluded = settings.excluded_role_ids ?? [];
  const rolesToRemove = member.roles.filter((roleId) => {
    if (excluded.includes(roleId)) return false;
    const role = roles.find((item) => item.id === roleId);
    return role && !role.managed && role.position > staffRole.position;
  });

  for (const roleId of rolesToRemove) {
    await removeMemberRole(guildId, memberId, roleId, token, "قبول طلب استقالة");
  }
  return rolesToRemove.length;
}

async function handleButton(interaction: Interaction, token: string) {
  const customId = interaction.data?.custom_id ?? "";
  if (customId === CUSTOM_ID_OPEN_MODAL) return resignationModal();

  const [action, memberId] = customId.split(":");
  if (action !== "resign_accept" && action !== "resign_reject") {
    return ephemeral("زر غير معروف.");
  }
  if (!interaction.guild_id || !memberId) return ephemeral("طلب غير صالح.");

  const settings = await getGuildSettings(interaction.guild_id);
  if (!canReview(interaction, settings)) {
    return ephemeral("لا تملك الصلاحية لاستخدام هذا الزر.");
  }

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
    if (!settings?.staff_role_id) return ephemeral("رتبة الستاف غير محددة في الإعدادات.");
    try {
      const removed = await removeRolesAboveStaff(
        interaction.guild_id,
        memberId,
        settings,
        token,
      );
      statusValue += ` — تمت إزالة ${removed} رتبة`;
    } catch (error) {
      console.error(error);
      return ephemeral(
        "تعذّر إزالة الرتب. تأكد أن رتبة البوت أعلى من رتب العضو ولديه صلاحية إدارة الرتب.",
      );
    }
  }

  const resultText = accepted
    ? settings?.accept_message || DEFAULT_ACCEPT_MESSAGE
    : settings?.reject_message || DEFAULT_REJECT_MESSAGE;

  const fields = (embed.fields ?? [])
    .map((field) => (field.name === "الحالة" ? { ...field, value: statusValue } : field))
    .concat([{ name: "النتيجة", value: resultText }]);

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
            switch (interaction.data?.name) {
              case COMMAND_SETUP:
                return await handleSetup(interaction);
              case COMMAND_CUSTOMIZE:
                return await handleCustomize(interaction);
              case COMMAND_PANEL:
                return await handleSendPanel(interaction, botToken);
              case COMMAND_EXCLUDED:
                return await handleRoleList(interaction, "excluded_role_ids");
              case COMMAND_REVIEWERS:
                return await handleRoleList(interaction, "reviewer_role_ids");
              case COMMAND_MESSAGES:
                return await handleMessages(interaction);
              case COMMAND_RESIGN:
                return await handleResignationCommand(interaction, botToken);
              default:
                return ephemeral("أمر غير معروف.");
            }
          }
          if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
            return await handleButton(interaction, botToken);
          }
          if (interaction.type === InteractionType.MODAL_SUBMIT) {
            return await handleModalSubmit(interaction, botToken);
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
