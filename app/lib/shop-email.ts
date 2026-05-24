/** Client-safe email normalization and validation for the shop. */
export function normalizeShopEmail(value: string): string | null {
  const to = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return null;
  return to;
}

export function isValidShopEmail(value: string): boolean {
  return normalizeShopEmail(value) !== null;
}

export function normalizeShopCustomerName(value: string): string | null {
  const name = value.trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 120) return null;
  return name;
}

export function isValidShopCustomerName(value: string): boolean {
  return normalizeShopCustomerName(value) !== null;
}

/** Optional company name for commercial licenses; empty input is allowed. */
export function normalizeShopCompanyName(value: string): string | null {
  const company = value.trim().replace(/\s+/g, " ");
  if (!company) return null;
  if (company.length < 2 || company.length > 160) return null;
  return company;
}
