/** Stripe PaymentIntent metadata: each value ≤ 500 characters, ≤ 50 keys total. */
export const STRIPE_METADATA_VALUE_MAX = 500;

function parseImageKeysJson(raw: string): string[] | null {
  try {
    const keys = JSON.parse(raw) as unknown;
    if (!Array.isArray(keys) || !keys.every((k) => typeof k === "string")) return null;
    return [...new Set(keys.map((k) => k.trim()).filter(Boolean))];
  } catch {
    return null;
  }
}

function parseCommaSeparatedKeys(raw: string): string[] | null {
  const keys = raw
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  if (keys.length === 0) return null;
  return [...new Set(keys)];
}

/** Read image keys from PaymentIntent metadata (comma-separated or chunked). */
export function parseImageKeysFromMetadata(
  metadata: Record<string, string> | null | undefined,
): string[] | null {
  if (!metadata) return null;

  const partCountRaw = metadata.imageKeysParts;
  if (partCountRaw) {
    const partCount = Number(partCountRaw);
    if (!Number.isFinite(partCount) || partCount < 1 || partCount > 48) return null;

    const chunks: string[] = [];
    for (let i = 0; i < partCount; i++) {
      const chunk = metadata[`imageKeys${i}`];
      if (chunk === undefined) return null;
      chunks.push(chunk);
    }

    const joined = chunks.join(",");
    return parseCommaSeparatedKeys(joined);
  }

  const raw = metadata.imageKeys;
  if (!raw) return null;
  if (raw.startsWith("[")) return parseImageKeysJson(raw);
  return parseCommaSeparatedKeys(raw);
}

/** Write image keys into Stripe-safe metadata (splits across keys when needed). */
export function buildImageKeysMetadata(imageKeys: string[]): Record<string, string> {
  const compact = imageKeys.join(",");
  if (compact.length <= STRIPE_METADATA_VALUE_MAX) {
    return { imageKeys: compact };
  }

  const chunks: string[] = [];
  let current = "";

  for (const key of imageKeys) {
    const candidate = current ? `${current},${key}` : key;
    if (candidate.length <= STRIPE_METADATA_VALUE_MAX) {
      current = candidate;
      continue;
    }

    if (current) chunks.push(current);
    if (key.length > STRIPE_METADATA_VALUE_MAX) {
      throw new Error("Image key too long for Stripe metadata");
    }
    current = key;
  }

  if (current) chunks.push(current);

  const out: Record<string, string> = {
    imageKeysParts: String(chunks.length),
  };
  chunks.forEach((chunk, index) => {
    out[`imageKeys${index}`] = chunk;
  });
  return out;
}
