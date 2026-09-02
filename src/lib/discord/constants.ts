// أرقام ثابتة من واجهة Discord API — لا تعتمد على discord.js لأن البيئة Worker.
export const InteractionType = {
  PING: 1,
  APPLICATION_COMMAND: 2,
  MESSAGE_COMPONENT: 3,
  APPLICATION_COMMAND_AUTOCOMPLETE: 4,
  MODAL_SUBMIT: 5,
} as const;

export const InteractionResponseType = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
  DEFERRED_UPDATE_MESSAGE: 6,
  UPDATE_MESSAGE: 7,
  MODAL: 9,
} as const;

export const MessageFlags = { EPHEMERAL: 64 } as const;

export const ButtonStyle = {
  PRIMARY: 1,
  SECONDARY: 2,
  SUCCESS: 3,
  DANGER: 4,
} as const;

export const ComponentType = {
  ACTION_ROW: 1,
  BUTTON: 2,
  TEXT_INPUT: 4,
} as const;

export const TextInputStyle = { SHORT: 1, PARAGRAPH: 2 } as const;

export const ApplicationCommandOptionType = {
  STRING: 3,
  INTEGER: 4,
  BOOLEAN: 5,
  CHANNEL: 7,
  ROLE: 8,
  ATTACHMENT: 11,
} as const;

export const ChannelType = { GUILD_TEXT: 0, GUILD_ANNOUNCEMENT: 5 } as const;

// صلاحيات
export const Permissions = {
  ADMINISTRATOR: 1n << 3n,
  MANAGE_GUILD: 1n << 5n,
  MANAGE_ROLES: 1n << 28n,
} as const;

export const EmbedColors = {
  PENDING: 0xf1c40f,
  ACCEPTED: 0x2ecc71,
  REJECTED: 0xe74c3c,
  PANEL: 0x5865f2,
} as const;

// الأوامر
export const COMMAND_RESIGN = "استقالة";
export const COMMAND_SETUP = "اعداد-الاستقالة";
export const COMMAND_PANEL = "لوحة-الاستقالة";
export const COMMAND_CUSTOMIZE = "تخصيص-اللوحة";
export const COMMAND_EXCLUDED = "رتب-مستثناة";
export const COMMAND_REVIEWERS = "مراجعو-الاستقالة";
export const COMMAND_MESSAGES = "رسائل-الاستقالة";

// خيارات
export const OPTION_NAME = "الاسم";
export const OPTION_IMAGE = "صورة-الرتبة";
export const OPTION_REASON = "السبب";
export const OPTION_CHANNEL = "القناة";
export const OPTION_ROLE = "رتبة-الستاف";
export const OPTION_AUTO_REMOVE_ROLES = "ازالة-الرتب-تلقائيا";
export const OPTION_PANEL_CHANNEL = "قناة-اللوحة";
export const OPTION_TITLE = "العنوان";
export const OPTION_DESCRIPTION = "الوصف";
export const OPTION_COLOR = "اللون";
export const OPTION_IMAGE_URL = "الصورة";
export const OPTION_THUMBNAIL_URL = "الصورة-المصغرة";
export const OPTION_BUTTON_LABEL = "اسم-الزر";
export const OPTION_ACCEPT_MESSAGE = "رسالة-القبول";
export const OPTION_REJECT_MESSAGE = "رسالة-الرفض";
export const ROLE_SLOTS = ["رتبة-1", "رتبة-2", "رتبة-3", "رتبة-4", "رتبة-5"] as const;

// معرّفات المكوّنات
export const CUSTOM_ID_OPEN_MODAL = "resign_open";
export const CUSTOM_ID_MODAL = "resign_modal";
export const FIELD_NAME = "field_name";
export const FIELD_IMAGE = "field_image";
export const FIELD_REASON = "field_reason";

// القيم الافتراضية للوحة
export const DEFAULT_PANEL_TITLE = "تقديم استقالة";
export const DEFAULT_PANEL_DESCRIPTION =
  "اضغط على الزر بالأسفل لتعبئة نموذج الاستقالة وإرساله للإدارة.";
export const DEFAULT_BUTTON_LABEL = "استقالة";
export const DEFAULT_ACCEPT_MESSAGE = "تم قبول طلب الاستقالة. شكرًا لجهودك معنا.";
export const DEFAULT_REJECT_MESSAGE = "تم رفض طلب الاستقالة.";

export const DISCORD_API = "https://discord.com/api/v10";
