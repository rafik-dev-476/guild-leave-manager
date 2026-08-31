// تحقق توقيع Ed25519 القادم من Discord باستخدام Web Crypto (متوفر في بيئة Worker).
function hexToBytes(hex: string): Uint8Array {
  const clean = hex.trim();
  if (clean.length % 2 !== 0) return new Uint8Array();
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    const byte = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
    if (Number.isNaN(byte)) return new Uint8Array();
    out[i] = byte;
  }
  return out;
}

export async function verifyDiscordRequest(
  rawBody: string,
  signature: string | null,
  timestamp: string | null,
  publicKeyHex: string,
): Promise<boolean> {
  if (!signature || !timestamp) return false;
  const sigBytes = hexToBytes(signature);
  const keyBytes = hexToBytes(publicKeyHex);
  if (sigBytes.length !== 64 || keyBytes.length !== 32) return false;

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      keyBytes as unknown as ArrayBuffer,
      { name: "Ed25519" },
      false,
      ["verify"],
    );
    return await crypto.subtle.verify(
      { name: "Ed25519" },
      key,
      sigBytes as unknown as ArrayBuffer,
      new TextEncoder().encode(timestamp + rawBody) as unknown as ArrayBuffer,
    );
  } catch (error) {
    console.error("Ed25519 verification failed", error);
    return false;
  }
}
