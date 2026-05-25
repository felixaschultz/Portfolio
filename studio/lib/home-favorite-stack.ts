export type HomeFavoriteStackPose = {
  rotate: number;
  offsetX: number;
  offsetY: number;
  scale: number;
};

const DEFAULTS: Record<number, HomeFavoriteStackPose[]> = {
  1: [{ rotate: 0, offsetX: 0, offsetY: 0, scale: 1 }],
  2: [
    { rotate: -3, offsetX: -7, offsetY: 4, scale: 0.96 },
    { rotate: 3, offsetX: 7, offsetY: -3, scale: 1 },
  ],
  3: [
    { rotate: -4, offsetX: -9, offsetY: 5, scale: 0.94 },
    { rotate: 0, offsetX: 0, offsetY: -2, scale: 0.97 },
    { rotate: 4, offsetX: 9, offsetY: -4, scale: 1 },
  ],
  4: [
    { rotate: -5, offsetX: -11, offsetY: 6, scale: 0.92 },
    { rotate: -2, offsetX: -4, offsetY: 2, scale: 0.95 },
    { rotate: 2, offsetX: 4, offsetY: -3, scale: 0.98 },
    { rotate: 5, offsetX: 11, offsetY: -5, scale: 1 },
  ],
  5: [
    { rotate: -5, offsetX: -12, offsetY: 7, scale: 0.91 },
    { rotate: -3, offsetX: -6, offsetY: 3, scale: 0.94 },
    { rotate: 0, offsetX: 0, offsetY: -2, scale: 0.97 },
    { rotate: 3, offsetX: 6, offsetY: -4, scale: 0.99 },
    { rotate: 5, offsetX: 12, offsetY: -6, scale: 1 },
  ],
};

export function defaultStackPose(index: number, total: number): HomeFavoriteStackPose {
  const count = Math.min(5, Math.max(1, total));
  const presets = DEFAULTS[count] ?? DEFAULTS[1]!;
  return { ...(presets[Math.min(index, presets.length - 1)] ?? presets[0]!) };
}

export function normalizeStackPose(
  raw?: Partial<HomeFavoriteStackPose> | null,
): HomeFavoriteStackPose | null {
  if (!raw || typeof raw !== "object") return null;
  const { rotate, offsetX, offsetY, scale } = raw;
  if (
    typeof rotate !== "number" ||
    typeof offsetX !== "number" ||
    typeof offsetY !== "number" ||
    typeof scale !== "number"
  ) {
    return null;
  }
  return {
    rotate: Math.min(18, Math.max(-18, rotate)),
    offsetX: Math.min(22, Math.max(-22, offsetX)),
    offsetY: Math.min(22, Math.max(-22, offsetY)),
    scale: Math.min(1.08, Math.max(0.82, scale)),
  };
}

export function resolveStackPose(
  raw: Partial<HomeFavoriteStackPose> | null | undefined,
  index: number,
  total: number,
): HomeFavoriteStackPose {
  return normalizeStackPose(raw) ?? defaultStackPose(index, total);
}
