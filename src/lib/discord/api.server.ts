import { DISCORD_API } from "./constants";

export type DiscordRole = { id: string; name: string; position: number; managed?: boolean };
export type DiscordMember = { roles: string[]; user?: { id: string; username?: string } };

function botHeaders(token: string) {
  return {
    Authorization: `Bot ${token}`,
    "Content-Type": "application/json",
  };
}

async function discordFetch<T>(
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${DISCORD_API}${path}`, {
    ...init,
    headers: { ...botHeaders(token), ...(init.headers ?? {}) },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Discord API ${init.method ?? "GET"} ${path} -> ${response.status}: ${text}`);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function getGuildRoles(guildId: string, token: string) {
  return discordFetch<DiscordRole[]>(`/guilds/${guildId}/roles`, token);
}

export function getGuildMember(guildId: string, userId: string, token: string) {
  return discordFetch<DiscordMember>(`/guilds/${guildId}/members/${userId}`, token);
}

export function removeMemberRole(
  guildId: string,
  userId: string,
  roleId: string,
  token: string,
  reason: string,
) {
  return discordFetch<void>(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, token, {
    method: "DELETE",
    headers: { "X-Audit-Log-Reason": encodeURIComponent(reason) },
  });
}

export function createMessage(channelId: string, token: string, payload: unknown) {
  return discordFetch<{ id: string }>(`/channels/${channelId}/messages`, token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
