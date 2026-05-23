import { DownloadIcon, LinkIcon, ResetIcon } from "@sanity/icons";
import { Box, Button, Card, Flex, Stack, Text, TextInput, useToast } from "@sanity/ui";
import { useCallback, useMemo } from "react";
import { PatchEvent, type StringInputProps, set, unset } from "sanity";
import { randomHex } from "../lib/crypto";

function siteBaseUrl(): string {
  const fromEnv = import.meta.env.SANITY_STUDIO_SITE_URL as string | undefined;
  const url = (fromEnv?.trim() || "https://www.felix-schultz.net").replace(/\/$/, "");
  return url;
}

function newDownloadToken(): string {
  return randomHex(24);
}

export function GalleryDownloadLinkInput(props: StringInputProps) {
  const toast = useToast();
  const token = typeof props.value === "string" && props.value.length > 0 ? props.value : null;

  const downloadUrl = useMemo(
    () => (token ? `${siteBaseUrl()}/download/gallery/${token}` : null),
    [token],
  );

  const setToken = useCallback(
    (next: string | null) => {
      props.onChange(PatchEvent.from(next ? set(next) : unset()));
    },
    [props],
  );

  const generate = useCallback(() => {
    setToken(newDownloadToken());
    toast.push({ status: "success", title: "Download link created" });
  }, [setToken, toast]);

  const regenerate = useCallback(() => {
    if (
      !window.confirm(
        "Generate a new link? The old link stops working immediately for anyone you already shared it with.",
      )
    ) {
      return;
    }
    setToken(newDownloadToken());
    toast.push({ status: "success", title: "New download link created" });
  }, [setToken, toast]);

  const revoke = useCallback(() => {
    if (!window.confirm("Remove the download link? Existing shared URLs will stop working.")) {
      return;
    }
    setToken(null);
    toast.push({ status: "success", title: "Download link removed" });
  }, [setToken, toast]);

  const copyLink = useCallback(async () => {
    if (!downloadUrl) return;
    try {
      await navigator.clipboard.writeText(downloadUrl);
      toast.push({ status: "success", title: "Link copied" });
    } catch {
      toast.push({ status: "error", title: "Could not copy — select and copy manually" });
    }
  }, [downloadUrl, toast]);

  return (
    <Stack space={4}>
      <Text size={1} muted>
        Private link for customers to download full-size photos as a ZIP. Works before the gallery
        is published on the site. Only shown here — not on the public gallery page.
      </Text>

      {downloadUrl ? (
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
            <TextInput readOnly value={downloadUrl} />
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
                No download link yet. Generate one when the photos are ready to share.
              </Text>
            </Flex>
            <Box>
              <Button icon={DownloadIcon} text="Generate download link" onClick={generate} />
            </Box>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
