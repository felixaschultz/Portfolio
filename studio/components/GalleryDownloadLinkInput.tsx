import type { StringInputProps } from "sanity";
import { SecretLinkInput } from "./SecretLinkInput";

export function GalleryDownloadLinkInput(props: StringInputProps) {
  return (
    <SecretLinkInput
      {...props}
      urlPath="download/gallery"
      intro="Private link for customers to download all photos as a ZIP. Works before the gallery is published on the site. Only shown here — not on the public gallery page."
      emptyHint="No download link yet. Generate one when the photos are ready to share."
      generateLabel="Generate download link"
    />
  );
}
