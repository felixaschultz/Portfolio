import type { StringInputProps } from "sanity";
import { SecretLinkInput } from "./SecretLinkInput";

export function BundleDownloadLinkInput(props: StringInputProps) {
  return (
    <SecretLinkInput
      {...props}
      urlPath="download/bundle"
      intro="Private link to download all selected galleries in one ZIP (folder per gallery). Works with unpublished galleries."
      emptyHint="Generate a link after adding galleries to this bundle."
      generateLabel="Generate bundle download link"
    />
  );
}
