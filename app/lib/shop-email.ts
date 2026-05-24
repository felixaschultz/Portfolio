/** Client-safe email normalization and validation for the shop. */
export function normalizeShopEmail(value: string): string | null {
  const to = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return null;
  return to;
}

export function isValidShopEmail(value: string): boolean {
  return normalizeShopEmail(value) !== null;
}
