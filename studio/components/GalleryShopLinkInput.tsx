import type { StringInputProps } from "sanity";
import { SecretLinkInput } from "./SecretLinkInput";

export function GalleryShopLinkInput(props: StringInputProps) {
  return (
    <SecretLinkInput
      {...props}
      urlPath="shop/gallery"
      intro="Shop link for Stripe checkout (select photos, pay, download). Use “Show buy button on public gallery” to expose it on the published album; otherwise share this URL only."
      emptyHint="No shop link yet. Set a price per photo below, then generate a link."
      generateLabel="Generate shop link"
    />
  );
}
