/** Human-readable PaymentIntent description (visible in Stripe Dashboard). Max 1000 chars. */
export function buildShopPaymentIntentDescription(options: {
  customerName?: string | null;
  galleryTitle: string;
  imageCount: number;
  licenseLabel?: string | null;
}): string {
  const parts: string[] = [];
  const name = options.customerName?.trim();
  if (name) parts.push(name);

  const count = options.imageCount;
  const gallery = options.galleryTitle.trim() || "Gallery";
  parts.push(`${gallery} · ${count} ${count === 1 ? "photo" : "photos"}`);

  const license = options.licenseLabel?.trim();
  if (license) parts.push(license);

  return parts.join(" · ").slice(0, 1000);
}
