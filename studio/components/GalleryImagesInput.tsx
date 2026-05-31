import { TrashIcon, UploadIcon } from "@sanity/icons";
import { Button, Flex, Stack, Text } from "@sanity/ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrayOfObjectsInput,
  type ArrayOfObjectsInputProps,
  PatchEvent,
  set,
  useClient,
  useCurrentUser,
  useFormValue,
} from "sanity";
import {
  formatUploadError,
  isFileTooLarge,
  processUploadQueue,
  resolveUploadConcurrency,
  skipMessageForFile,
  uploadSingleImage,
} from "../lib/bulk-upload";
import { randomKey, randomQueueId } from "../lib/crypto";
import { isIos, supportsFolderUpload } from "../lib/device";
import { UploadQueuePanel, type UploadQueueItem } from "./UploadQueuePanel";

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|heic|heif|tiff?)$/i;
const FLUSH_EVERY = 12;
const uploadConcurrency = resolveUploadConcurrency();

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/") || IMAGE_EXT.test(file.name);
}

function newKey(): string {
  return randomKey(12);
}

function safeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function queueId(): string {
  return randomQueueId();
}

function assetToGalleryItem(asset: { _id: string }) {
  return {
    _type: "galleryImage" as const,
    _key: newKey(),
    image: {
      _type: "image" as const,
      asset: {
        _type: "reference" as const,
        _ref: asset._id,
      },
    },
  };
}

function filesToQueueItems(files: File[]): UploadQueueItem[] {
  return files.map((file) => ({
    id: queueId(),
    file,
    previewUrl: URL.createObjectURL(file),
    status: "pending" as const,
  }));
}

function revokeQueuePreviews(items: UploadQueueItem[]) {
  for (const item of items) {
    URL.revokeObjectURL(item.previewUrl);
  }
}

export function GalleryImagesInput(props: ArrayOfObjectsInputProps) {
  const folderUpload = supportsFolderUpload();
  const documentId = useFormValue(["_id"]) as string | undefined;
  const user = useCurrentUser();
  const writeToken = import.meta.env.SANITY_STUDIO_API_TOKEN as string | undefined;

  const client = useClient({ apiVersion: "2024-05-16" }).withConfig({
    useCdn: false,
    timeout: 180_000,
    ...(!user && writeToken ? { token: writeToken } : {}),
  });

  const canUpload = Boolean(user || writeToken);

  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);

  const value = useMemo(
    () => (Array.isArray(props.value) ? props.value : []),
    [props.value],
  );

  const photoCount = value.length;

  const flushItems = useCallback(
    (items: typeof value) => {
      props.onChange(PatchEvent.from(set(items)));
    },
    [props],
  );

  const updateQueueItem = useCallback((id: string, patch: Partial<UploadQueueItem>) => {
    setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const dismissQueue = useCallback(() => {
    setQueue((prev) => {
      revokeQueuePreviews(prev);
      return [];
    });
  }, []);

  useEffect(() => {
    return () => {
      setQueue((prev) => {
        revokeQueuePreviews(prev);
        return prev;
      });
    };
  }, []);

  const applyUploadSummary = useCallback(
    (successCount: number, failCount: number, skipCount: number) => {
      const parts: string[] = [];
      if (successCount > 0) {
        parts.push(`Added ${successCount} photo${successCount === 1 ? "" : "s"}.`);
      }
      if (failCount > 0) {
        parts.push(`${failCount} failed — see full errors below and use Retry.`);
      }
      if (skipCount > 0) {
        parts.push(`${skipCount} skipped (file too large).`);
      }

      if (failCount > 0 && successCount === 0 && skipCount === 0) {
        setError(
          "Every file failed. Common causes: rate limits, network timeouts, or missing API permissions. Retry individual files or upload a smaller batch with smaller JPEGs.",
        );
        setNotice(null);
      } else if (parts.length > 0) {
        setNotice(parts.join(" "));
        setError(null);
      }
    },
    [],
  );

  const processItems = useCallback(
    async (items: UploadQueueItem[], startValue: typeof value) => {
      const accumulated = [...startValue];
      let lastFlushAt = accumulated.length;
      let completed = 0;
      const total = items.length;
      const batchById = new Map(items.map((item) => [item.id, { ...item }]));

      const syncQueueFromBatch = () => {
        setQueue((current) =>
          current.map((entry) => {
            const updated = batchById.get(entry.id);
            return updated ? { ...entry, ...updated } : entry;
          }),
        );
      };

      const flushIfNeeded = () => {
        if (accumulated.length - lastFlushAt >= FLUSH_EVERY) {
          flushItems([...accumulated]);
          lastFlushAt = accumulated.length;
        }
      };

      await processUploadQueue({
        client,
        files: items.map((item) => item.file),
        safeFilename,
        concurrency: uploadConcurrency,
        onFileStart: (_filename, index) => {
          const item = items[index];
          if (item) {
            batchById.set(item.id, { ...item, status: "uploading", message: undefined });
            syncQueueFromBatch();
          }
          setProgress(`${completed} / ${total}`);
        },
        onFileComplete: (result, index) => {
          const item = items[index];
          completed += 1;
          setProgress(`${completed} / ${total}`);

          if (!item) return;

          if (result.status === "success" && result.asset) {
            accumulated.push(assetToGalleryItem(result.asset));
            flushIfNeeded();
            batchById.set(item.id, { ...item, status: "success", message: undefined });
          } else if (result.status === "failed") {
            batchById.set(item.id, {
              ...item,
              status: "failed",
              message: result.message ?? "Upload failed",
            });
          } else if (result.status === "skipped") {
            batchById.set(item.id, {
              ...item,
              status: "skipped",
              message: result.message ?? skipMessageForFile(item.file),
            });
          }

          syncQueueFromBatch();
        },
      });

      flushItems([...accumulated]);

      setQueue((current) => {
        const merged = current.map((entry) => {
          const updated = batchById.get(entry.id);
          return updated ? { ...entry, ...updated } : entry;
        });
        const successCount = merged.filter((i) => i.status === "success").length;
        const failCount = merged.filter((i) => i.status === "failed").length;
        const skipCount = merged.filter((i) => i.status === "skipped").length;
        applyUploadSummary(successCount, failCount, skipCount);
        return merged;
      });
    },
    [applyUploadSummary, client, flushItems],
  );

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!canUpload) {
        setError(
          "Not signed in. Log in to Sanity Studio (top right), or add SANITY_STUDIO_API_TOKEN to .env (Editor or Administrator — not Viewer).",
        );
        return;
      }

      const images = files.filter(isImageFile);
      if (!images.length) {
        setError("No image files found in that selection.");
        return;
      }

      dismissQueue();
      const items = filesToQueueItems(images);
      setQueue(items);
      setUploading(true);
      setError(null);
      setNotice(null);
      setProgress(`0 / ${images.length}`);

      try {
        await processItems(items, value);
      } catch (err) {
        setError(formatUploadError(err));
      } finally {
        setUploading(false);
        setProgress("");
      }
    },
    [canUpload, dismissQueue, processItems, value],
  );

  const retryItem = useCallback(
    async (id: string) => {
      const item = queue.find((i) => i.id === id);
      if (!item || uploading) return;

      if (isFileTooLarge(item.file)) {
        updateQueueItem(id, {
          status: "skipped",
          message: skipMessageForFile(item.file),
        });
        return;
      }

      setUploading(true);
      setError(null);
      updateQueueItem(id, { status: "uploading", message: undefined });

      try {
        const asset = await uploadSingleImage(client, item.file, safeFilename);
        const accumulated = [...value];
        accumulated.push(assetToGalleryItem(asset));
        flushItems([...accumulated]);
        updateQueueItem(id, { status: "success", message: undefined });
        setNotice(`Added ${item.file.name}.`);
        setError(null);
      } catch (err) {
        updateQueueItem(id, {
          status: "failed",
          message: formatUploadError(err),
        });
      } finally {
        setUploading(false);
      }
    },
    [client, flushItems, queue, updateQueueItem, uploading, value],
  );

  const retryAllFailed = useCallback(async () => {
    const failed = queue.filter((i) => i.status === "failed");
    if (!failed.length || uploading) return;

    setUploading(true);
    setError(null);

    try {
      await processItems(failed, value);
    } catch (err) {
      setError(formatUploadError(err));
    } finally {
      setUploading(false);
      setProgress("");
    }
  }, [processItems, queue, uploading, value]);

  const clearAllImages = useCallback(async () => {
    if (photoCount === 0 || props.readOnly) return;

    const confirmed = window.confirm(
      `Remove all ${photoCount} photo${photoCount === 1 ? "" : "s"} from this gallery?\n\nThe cover selection will be reset. You can then use “Upload folder” to add a new set of images.`,
    );
    if (!confirmed) return;

    flushItems([]);
    if (documentId) {
      try {
        await client.patch(documentId).unset(["coverImageKey"]).commit();
      } catch (err) {
        setError(formatUploadError(err));
        return;
      }
    }
    setError(null);
    setNotice(null);
    setProgress("");
    dismissQueue();
  }, [client, dismissQueue, documentId, flushItems, photoCount, props.readOnly]);

  const onFolderChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const list = event.target.files;
      if (!list?.length) return;
      await uploadFiles(Array.from(list));
      event.target.value = "";
    },
    [uploadFiles],
  );

  const onDragOver = useCallback(
    (event: React.DragEvent) => {
      if (props.readOnly || !canUpload || uploading) return;
      event.preventDefault();
      setDragOver(true);
    },
    [canUpload, props.readOnly, uploading],
  );

  const onDragLeave = useCallback((event: React.DragEvent) => {
    if (event.currentTarget.contains(event.relatedTarget as Node)) return;
    setDragOver(false);
  }, []);

  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      setDragOver(false);
      if (props.readOnly || !canUpload || uploading) return;

      const files = Array.from(event.dataTransfer.files);
      if (!files.length) return;
      await uploadFiles(files);
    },
    [canUpload, props.readOnly, uploadFiles, uploading],
  );

  return (
    <Stack
      space={4}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={
        dragOver
          ? {
              outline: "2px dashed var(--card-focus-ring-color, #2291ff)",
              outlineOffset: "4px",
              borderRadius: "4px",
            }
          : undefined
      }
    >
      <Flex align="center" gap={3} wrap="wrap">
        <Button
          icon={UploadIcon}
          text={uploading ? "Uploading…" : folderUpload ? "Upload folder" : "Upload photos"}
          tone="primary"
          mode="ghost"
          disabled={uploading || Boolean(props.readOnly) || !canUpload}
          onClick={() => inputRef.current?.click()}
        />
        <Button
          icon={TrashIcon}
          text="Clear all photos"
          tone="critical"
          mode="ghost"
          disabled={uploading || Boolean(props.readOnly) || photoCount === 0}
          onClick={clearAllImages}
        />
        <Text size={1} muted>
          {canUpload
            ? folderUpload
              ? `Drop a folder here or use Upload folder — ${uploadConcurrency} photos upload at once. Progress saves every ${FLUSH_EVERY} photos.`
              : isIos()
                ? "On iPhone, pick multiple photos from the library (folder upload is not supported in Safari)."
                : `Drop photos here or pick multiple files — ${uploadConcurrency} upload at once. Progress saves every ${FLUSH_EVERY} photos.`
            : "Sign in to Sanity (top right) to enable uploads."}
        </Text>
      </Flex>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        {...(folderUpload
          ? ({ webkitdirectory: "", directory: "" } as React.InputHTMLAttributes<HTMLInputElement>)
          : {})}
        onChange={onFolderChange}
      />

      {progress ? (
        <Text size={1} muted>
          {uploading ? "Uploading" : "Done"}: {progress}
        </Text>
      ) : null}

      {queue.length > 0 ? (
        <UploadQueuePanel
          items={queue}
          uploading={uploading}
          onRetry={retryItem}
          onRetryAllFailed={retryAllFailed}
          onDismiss={dismissQueue}
        />
      ) : null}

      {notice ? (
        <Text size={1} style={{ color: "var(--card-badge-positive-fg-color, #0d9488)" }}>
          {notice}
        </Text>
      ) : null}

      {error ? (
        <Text size={1} style={{ color: "var(--card-badge-critical-fg-color, #f03e2e)" }}>
          {error}
        </Text>
      ) : null}

      <ArrayOfObjectsInput {...props} />
    </Stack>
  );
}
