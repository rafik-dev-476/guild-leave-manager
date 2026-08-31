export type GuildSettings = {
  guild_id: string;
  resignation_channel_id: string | null;
  staff_role_id: string | null;
  panel_channel_id: string | null;
  panel_title: string | null;
  panel_description: string | null;
  panel_color: number | null;
  panel_image_url: string | null;
  panel_thumbnail_url: string | null;
  panel_button_label: string | null;
  excluded_role_ids: string[];
  reviewer_role_ids: string[];
  accept_message: string | null;
  reject_message: string | null;
};

const COLUMNS =
  "guild_id, resignation_channel_id, staff_role_id, panel_channel_id, panel_title, panel_description, panel_color, panel_image_url, panel_thumbnail_url, panel_button_label, excluded_role_ids, reviewer_role_ids, accept_message, reject_message";

export async function getGuildSettings(guildId: string): Promise<GuildSettings | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("discord_guild_settings")
    .select(COLUMNS)
    .eq("guild_id", guildId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    ...(data as unknown as GuildSettings),
    excluded_role_ids: (data as unknown as GuildSettings).excluded_role_ids ?? [],
    reviewer_role_ids: (data as unknown as GuildSettings).reviewer_role_ids ?? [],
  };
}

export async function saveGuildSettings(
  settings: Partial<GuildSettings> & { guild_id: string },
): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("discord_guild_settings")
    .upsert(settings, { onConflict: "guild_id" });
  if (error) throw new Error(error.message);
}
