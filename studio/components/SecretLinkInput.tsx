import { PatchEvent, type StringInputProps, set, unset } from "sanity";
import { SecretLinkCard } from "./SecretLinkCard";

export type SecretLinkInputProps = StringInputProps & {
  urlPath: string;
  intro: string;
  emptyHint: string;
  generateLabel?: string;
};

export function SecretLinkInput({
  urlPath,
  intro,
  emptyHint,
  generateLabel,
  ...props
}: SecretLinkInputProps) {
  const token = typeof props.value === "string" && props.value.length > 0 ? props.value : null;

  return (
    <SecretLinkCard
      urlPath={urlPath}
      token={token}
      intro={intro}
      emptyHint={emptyHint}
      generateLabel={generateLabel}
      onTokenChange={(next) => {
        props.onChange(PatchEvent.from(next ? set(next) : unset()));
      }}
    />
  );
}
