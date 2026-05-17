import { TrashIcon, UploadIcon } from "@sanity/icons";
import { Button, Flex, Stack, Text } from "@sanity/ui";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ArrayOfObjectsInput,
  type ArrayOfObjectsInputProps,
  PatchEvent,
  set,
  useClient,
  useCurrentUser,
  useFormValue,
} from "sanity";
import { formatUploadError, uploadImagesInBulk } from "../lib/bulk-upload";

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|heic|heif|tiff?)$/i;
const FLUSH_EVERY = 8;

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/") || IMAGE_EXT.test(file.name);
}

function newKey(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

function safeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
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

export function GalleryImagesInput(props: ArrayOfObjectsInputProps) {
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
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

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
  }, [client, documentId, flushItems, photoCount, props.readOnly]);

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

      setUploading(true);
      setError(null);
      setNotice(null);
      setProgress(`0 / ${images.length}`);

      const accumulated = [...value];
      let lastFlushAt = 0;

      try {
        const { assets, failures, skipped } = await uploadImagesInBulk({
          client,
          files: images,
          safeFilename,
          onProgress: (completed, total, filename) => {
            setProgress(`${completed} / ${total} — ${filename}`);
          },
        });

        for (const asset of assets) {
          accumulated.push(assetToGalleryItem(asset));
          if (accumulated.length - lastFlushAt >= FLUSH_EVERY) {
            flushItems([...accumulated]);
            lastFlushAt = accumulated.length;
          }
        }

        flushItems([...accumulated]);

        const parts: string[] = [];
        if (assets.length > 0) {
          parts.push(`Added ${assets.length} photo${assets.length === 1 ? "" : "s"}.`);
        }
        if (failures.length > 0) {
          const sample = failures
            .slice(0, 3)
            .map((f) => `${f.filename} (${f.message})`)
            .join("; ");
          const more = failures.length > 3 ? ` (+${failures.length - 3} more)` : "";
          parts.push(`${failures.length} failed: ${sample}${more}`);
        }
        if (skipped.length > 0) {
          parts.push(`${skipped.length} skipped (file too large).`);
        }

        if (failures.length > 0 && assets.length === 0) {
          setError(
            `All uploads failed. This is usually rate limits or network timeouts when sending many large files — try again, upload in smaller folders, or export smaller JPEGs. First error: ${failures[0].message}`,
          );
          setNotice(null);
        } else if (failures.length > 0 || skipped.length > 0) {
          setNotice(parts.join(" "));
          setError(null);
        } else {
          setNotice(parts[0] ?? null);
          setError(null);
        }

        setProgress("");
      } catch (err) {
        if (accumulated.length > value.length) {
          flushItems([...accumulated]);
          setNotice(`Saved ${accumulated.length - value.length} photos before the batch stopped.`);
        }
        setError(formatUploadError(err));
      } finally {
        setUploading(false);
      }
    },
    [canUpload, client, flushItems, value],
  );

  const onFolderChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const list = event.target.files;
      if (!list?.length) return;
      await uploadFiles(Array.from(list));
      event.target.value = "";
    },
    [uploadFiles],
  );

  return (
    <Stack space={4}>
      <Flex align="center" gap={3} wrap="wrap">
        <Button
          icon={UploadIcon}
          text={uploading ? "Uploading…" : "Upload folder"}
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
            ? "Large folders upload one file at a time (slower, more reliable). Progress is saved every few photos."
            : "Sign in to Sanity (top right) to enable folder upload."}
        </Text>
      </Flex>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        {...({ webkitdirectory: "", directory: "" } as React.InputHTMLAttributes<HTMLInputElement>)}
        onChange={onFolderChange}
      />

      {progress ? (
        <Text size={1} muted>
          {uploading ? "Uploading" : "Done"}: {progress}
        </Text>
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
