GRANT ALL ON public.discord_guild_settings TO service_role;

CREATE POLICY "Trusted service manages Discord guild settings"
ON public.discord_guild_settings
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);