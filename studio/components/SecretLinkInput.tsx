import { DownloadIcon, LinkIcon, ResetIcon } from "@sanity/icons";
import { Box, Button, Card, Flex, Stack, Text, TextInput, useToast } from "@sanity/ui";
import { useCallback, useMemo } from "react";
import { PatchEvent, type StringInputProps, set, unset } from "sanity";
import { randomHex } from "../lib/crypto";
import { siteBaseUrl } from "../lib/siteBaseUrl";

export type SecretLinkInputProps = StringInputProps & {
  urlPath: string;
  intro: string;
  emptyHint: string;
  generateLabel?: string;
};

function newToken(): string {
  return randomHex(24);
}

export function SecretLinkInput({
  urlPath,
  intro,
  emptyHint,
  generateLabel = "Generate link",
  ...props
}: SecretLinkInputProps) {
  const toast = useToast();
  const token = typeof props.value === "string" && props.value.length > 0 ? props.value : null;

  const shareUrl = useMemo(
    () => (token ? `${siteBaseUrl()}/${urlPath}/${token}` : null),
    [token, urlPath],
  );

  const setToken = useCallback(
    (next: string | null) => {
      props.onChange(PatchEvent.from(next ? set(next) : unset()));
    },
    [props],
  );

  const generate = useCallback(() => {
    setToken(newToken());
    toast.push({ status: "success", title: "Link created" });
  }, [setToken, toast]);

  const regenerate = useCallback(() => {
    if (
      !window.confirm(
        "Generate a new link? The old link stops working immediately for anyone you already shared it with.",
      )
    ) {
      return;
    }
    setToken(newToken());
    toast.push({ status: "success", title: "New link created" });
  }, [setToken, toast]);

  const revoke = useCallback(() => {
    if (!window.confirm("Remove this link? Existing shared URLs will stop working.")) {
      return;
    }
    setToken(null);
    toast.push({ status: "success", title: "Link removed" });
  }, [setToken, toast]);

  const copyLink = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.push({ status: "success", title: "Link copied" });
    } catch {
      toast.push({ status: "error", title: "Could not copy — select and copy manually" });
    }
  }, [shareUrl, toast]);

  return (
    <Stack space={4}>
      <Text size={1} muted>
        {intro}
      </Text>

      {shareUrl ? (
        <Card padding={3} radius={2} border tone="positive">
          <Stack space={3}>
            <Flex align="center" gap={2}>
              <Text size={1} weight="semibold">
                <LinkIcon aria-hidden />
              </Text>
              <Text size={1} weight="semibold">
                Share this link
              </Text>
            </Flex>
            <TextInput readOnly value={shareUrl} />
            <Flex gap={2} wrap="wrap">
              <Button
                icon={LinkIcon}
                text="Copy link"
                tone="positive"
                onClick={() => void copyLink()}
              />
              <Button
                icon={ResetIcon}
                text="New link"
                mode="ghost"
                tone="caution"
                onClick={regenerate}
              />
              <Button text="Remove link" mode="ghost" tone="critical" onClick={revoke} />
            </Flex>
          </Stack>
        </Card>
      ) : (
        <Card padding={3} radius={2} border>
          <Stack space={3}>
            <Flex align="center" gap={2}>
              <Text muted>
                <DownloadIcon aria-hidden />
              </Text>
              <Text size={1} muted>
                {emptyHint}
              </Text>
            </Flex>
            <Box>
              <Button icon={DownloadIcon} text={generateLabel} onClick={generate} />
            </Box>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
