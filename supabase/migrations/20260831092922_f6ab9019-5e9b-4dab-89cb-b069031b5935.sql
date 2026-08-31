CREATE TABLE public.discord_guild_settings (
  guild_id TEXT PRIMARY KEY,
  resignation_channel_id TEXT,
  staff_role_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.discord_guild_settings TO service_role;

ALTER TABLE public.discord_guild_settings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER discord_guild_settings_updated_at
BEFORE UPDATE ON public.discord_guild_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();