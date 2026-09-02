ALTER TABLE public.discord_guild_settings
ADD COLUMN IF NOT EXISTS auto_remove_roles boolean NOT NULL DEFAULT true;