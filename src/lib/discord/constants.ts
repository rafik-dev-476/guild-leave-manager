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
} as const;

export const MessageFlags = { EPHEMERAL: 64 } as const;

export const ButtonStyle = {
  PRIMARY: 1,
  SECONDARY: 2,
  SUCCESS: 3,
  DANGER: 4,
} as const;

export const ApplicationCommandOptionType = {
  STRING: 3,
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
} as const;

export const COMMAND_RESIGN = "استقالة";
export const COMMAND_SETUP = "اعداد-الاستقالة";

export const OPTION_NAME = "الاسم";
export const OPTION_IMAGE = "صورة-الرتبة";
export const OPTION_REASON = "السبب";
export const OPTION_CHANNEL = "القناة";
export const OPTION_ROLE = "رتبة-الستاف";

export const DISCORD_API = "https://discord.com/api/v10";
