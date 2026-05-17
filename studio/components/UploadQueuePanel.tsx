import { RefreshIcon, CheckmarkIcon, RevertIcon } from "@sanity/icons";
import { Box, Button, Card, Flex, Grid, Spinner, Stack, Text } from "@sanity/ui";
import type { UploadFileStatus } from "../lib/bulk-upload";

export type UploadQueueItem = {
  id: string;
  file: File;
  previewUrl: string;
  status: UploadFileStatus;
  message?: string;
};

type UploadQueuePanelProps = {
  items: UploadQueueItem[];
  uploading: boolean;
  onRetry: (id: string) => void;
  onRetryAllFailed: () => void;
  onDismiss: () => void;
};

function statusLabel(status: UploadFileStatus): string {
  switch (status) {
    case "pending":
      return "Waiting";
    case "uploading":
      return "Uploading";
    case "success":
      return "Done";
    case "failed":
      return "Failed";
    case "skipped":
      return "Skipped";
    default:
      return status;
  }
}

function statusTone(
  status: UploadFileStatus,
): "default" | "primary" | "positive" | "caution" | "critical" | "transparent" {
  switch (status) {
    case "success":
      return "positive";
    case "failed":
      return "critical";
    case "skipped":
      return "caution";
    case "uploading":
      return "primary";
    default:
      return "transparent";
  }
}

export function UploadQueuePanel({
  items,
  uploading,
  onRetry,
  onRetryAllFailed,
  onDismiss,
}: UploadQueuePanelProps) {
  const failed = items.filter((item) => item.status === "failed");
  const successCount = items.filter((item) => item.status === "success").length;
  const skippedCount = items.filter((item) => item.status === "skipped").length;
  const pendingCount = items.filter(
    (item) => item.status === "pending" || item.status === "uploading",
  ).length;

  return (
    <Card padding={3} radius={2} border tone="transparent">
      <Stack space={4}>
        <Flex align="center" justify="space-between" gap={3} wrap="wrap">
          <Text size={1} weight="semibold">
            Upload queue ({items.length} files)
          </Text>
          <Flex gap={2} wrap="wrap">
            {failed.length > 0 ? (
              <Button
                icon={RefreshIcon}
                text={`Retry ${failed.length} failed`}
                tone="primary"
                mode="ghost"
                fontSize={1}
                disabled={uploading}
                onClick={onRetryAllFailed}
              />
            ) : null}
            {!uploading && pendingCount === 0 ? (
              <Button
                icon={RevertIcon}
                text="Dismiss"
                mode="ghost"
                fontSize={1}
                onClick={onDismiss}
              />
            ) : null}
          </Flex>
        </Flex>

        <Text size={1} muted>
          {successCount} uploaded
          {failed.length > 0 ? ` · ${failed.length} failed` : ""}
          {skippedCount > 0 ? ` · ${skippedCount} skipped` : ""}
          {pendingCount > 0 ? ` · ${pendingCount} remaining` : ""}
        </Text>

        <Grid columns={[2, 3, 4, 5]} gap={2}>
          {items.map((item) => (
            <Card
              key={item.id}
              padding={2}
              radius={2}
              border
              tone={statusTone(item.status)}
            >
              <Stack space={2}>
                <Box
                  style={{
                    position: "relative",
                    aspectRatio: "4 / 3",
                    overflow: "hidden",
                    borderRadius: 4,
                    background: "var(--card-muted-bg-color)",
                  }}
                >
                  <img
                    src={item.previewUrl}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      opacity: item.status === "pending" ? 0.55 : 1,
                    }}
                  />
                  {item.status === "uploading" ? (
                    <Flex
                      align="center"
                      justify="center"
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgb(0 0 0 / 0.35)",
                      }}
                    >
                      <Spinner muted />
                    </Flex>
                  ) : null}
                  {item.status === "success" ? (
                    <Flex
                      align="center"
                      justify="center"
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgb(0 0 0 / 0.25)",
                      }}
                    >
                      <Text size={2}>
                        <CheckmarkIcon />
                      </Text>
                    </Flex>
                  ) : null}
                </Box>

                <Text size={0} muted title={item.file.name} textOverflow="ellipsis">
                  {item.file.name}
                </Text>

                <Text size={0} weight="medium">
                  {statusLabel(item.status)}
                </Text>

                {item.message ? (
                  <Text
                    size={0}
                    style={{
                      color: "var(--card-badge-critical-fg-color, #c92a2a)",
                      wordBreak: "break-word",
                      lineHeight: 1.35,
                    }}
                  >
                    {item.message}
                  </Text>
                ) : null}

                {item.status === "failed" ? (
                  <Button
                    icon={RefreshIcon}
                    text="Retry"
                    tone="primary"
                    mode="ghost"
                    fontSize={0}
                    padding={2}
                    disabled={uploading}
                    onClick={() => onRetry(item.id)}
                  />
                ) : null}
              </Stack>
            </Card>
          ))}
        </Grid>

        {failed.length > 0 ? (
          <Stack space={3}>
            <Text size={1} weight="semibold">
              Failed uploads ({failed.length}) — full errors
            </Text>
            {failed.map((item) => (
              <Card key={`err-${item.id}`} padding={3} radius={2} border tone="critical">
                <Stack space={2}>
                  <Text size={1} weight="medium">
                    {item.file.name}
                  </Text>
                  <Text
                    size={1}
                    style={{ wordBreak: "break-word", whiteSpace: "pre-wrap", lineHeight: 1.45 }}
                  >
                    {item.message}
                  </Text>
                  <Button
                    icon={RefreshIcon}
                    text="Retry this file"
                    tone="primary"
                    mode="ghost"
                    fontSize={1}
                    disabled={uploading}
                    onClick={() => onRetry(item.id)}
                  />
                </Stack>
              </Card>
            ))}
          </Stack>
        ) : null}
      </Stack>
    </Card>
  );
}
