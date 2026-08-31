export type GuildSettings = {
  guild_id: string;
  resignation_channel_id: string | null;
  staff_role_id: string | null;
};

export async function getGuildSettings(guildId: string): Promise<GuildSettings | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("discord_guild_settings")
    .select("guild_id, resignation_channel_id, staff_role_id")
    .eq("guild_id", guildId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function saveGuildSettings(settings: GuildSettings): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("discord_guild_settings")
    .upsert(settings, { onConflict: "guild_id" });
  if (error) throw new Error(error.message);
}
