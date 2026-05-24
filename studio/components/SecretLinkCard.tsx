import { DownloadIcon, LinkIcon, ResetIcon } from "@sanity/icons";
import { Box, Button, Card, Flex, Stack, Text, TextInput, useToast } from "@sanity/ui";
import { useCallback, useMemo } from "react";
import { randomHex } from "../lib/crypto";
import { siteBaseUrl } from "../lib/siteBaseUrl";

export type SecretLinkCardProps = {
  urlPath: string;
  token: string | null;
  onTokenChange: (token: string | null) => void;
  intro?: string;
  emptyHint: string;
  generateLabel?: string;
  disabled?: boolean;
};

function newToken(): string {
  return randomHex(24);
}

export function SecretLinkCard({
  urlPath,
  token,
  onTokenChange,
  intro,
  emptyHint,
  generateLabel = "Generate link",
  disabled = false,
}: SecretLinkCardProps) {
  const toast = useToast();

  const shareUrl = useMemo(
    () => (token ? `${siteBaseUrl()}/${urlPath}/${token}` : null),
    [token, urlPath],
  );

  const generate = useCallback(() => {
    onTokenChange(newToken());
    toast.push({ status: "success", title: "Link created" });
  }, [onTokenChange, toast]);

  const regenerate = useCallback(() => {
    if (
      !window.confirm(
        "Generate a new link? The old link stops working immediately for anyone you already shared it with.",
      )
    ) {
      return;
    }
    onTokenChange(newToken());
    toast.push({ status: "success", title: "New link created" });
  }, [onTokenChange, toast]);

  const revoke = useCallback(() => {
    if (!window.confirm("Remove this link? Existing shared URLs will stop working.")) {
      return;
    }
    onTokenChange(null);
    toast.push({ status: "success", title: "Link removed" });
  }, [onTokenChange, toast]);

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
      {intro ? (
        <Text size={1} muted>
          {intro}
        </Text>
      ) : null}

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
                disabled={disabled}
                onClick={() => void copyLink()}
              />
              <Button
                icon={ResetIcon}
                text="New link"
                mode="ghost"
                tone="caution"
                disabled={disabled}
                onClick={regenerate}
              />
              <Button
                text="Remove link"
                mode="ghost"
                tone="critical"
                disabled={disabled}
                onClick={revoke}
              />
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
              <Button
                icon={DownloadIcon}
                text={generateLabel}
                disabled={disabled}
                onClick={generate}
              />
            </Box>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
