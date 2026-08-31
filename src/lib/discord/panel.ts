import {
  ButtonStyle,
  ComponentType,
  CUSTOM_ID_OPEN_MODAL,
  DEFAULT_BUTTON_LABEL,
  DEFAULT_PANEL_DESCRIPTION,
  DEFAULT_PANEL_TITLE,
  EmbedColors,
} from "./constants";
import type { GuildSettings } from "./settings.server";

export type PanelConfig = Pick<
  GuildSettings,
  | "panel_title"
  | "panel_description"
  | "panel_color"
  | "panel_image_url"
  | "panel_thumbnail_url"
  | "panel_button_label"
>;

// حمولة رسالة لوحة الاستقالة — تُستخدم من مسار التفاعلات ومن بوت الـ Gateway الخارجي.
export function panelPayload(settings: PanelConfig) {
  const embed: Record<string, unknown> = {
    title: settings.panel_title || DEFAULT_PANEL_TITLE,
    description: settings.panel_description || DEFAULT_PANEL_DESCRIPTION,
    color: settings.panel_color ?? EmbedColors.PANEL,
  };
  if (settings.panel_image_url) embed['image'] = { url: settings.panel_image_url };
  if (settings.panel_thumbnail_url) embed['thumbnail'] = { url: settings.panel_thumbnail_url };

  return {
    embeds: [embed],
    components: [
      {
        type: ComponentType.ACTION_ROW,
        components: [
          {
            type: ComponentType.BUTTON,
            style: ButtonStyle.PRIMARY,
            label: settings.panel_button_label || DEFAULT_BUTTON_LABEL,
            emoji: { name: "📝" },
            custom_id: CUSTOM_ID_OPEN_MODAL,
          },
        ],
      },
    ],
  };
}
