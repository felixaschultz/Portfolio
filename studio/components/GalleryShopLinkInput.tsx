import type { StringInputProps } from "sanity";
import { SecretLinkInput } from "./SecretLinkInput";

export function GalleryShopLinkInput(props: StringInputProps) {
  return (
    <SecretLinkInput
      {...props}
      urlPath="shop/gallery"
      intro="Private shop link: customers select photos and pay via Stripe for digital downloads. Works before publish. Not listed on the public site."
      emptyHint="No shop link yet. Set a price per photo below, then generate a link."
      generateLabel="Generate shop link"
    />
  );
}
