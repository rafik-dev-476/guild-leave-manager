ALTER TABLE public.discord_guild_settings
  ADD COLUMN IF NOT EXISTS panel_channel_id text,
  ADD COLUMN IF NOT EXISTS panel_title text,
  ADD COLUMN IF NOT EXISTS panel_description text,
  ADD COLUMN IF NOT EXISTS panel_color integer,
  ADD COLUMN IF NOT EXISTS panel_image_url text,
  ADD COLUMN IF NOT EXISTS panel_thumbnail_url text,
  ADD COLUMN IF NOT EXISTS panel_button_label text,
  ADD COLUMN IF NOT EXISTS excluded_role_ids text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS reviewer_role_ids text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS accept_message text,
  ADD COLUMN IF NOT EXISTS reject_message text;