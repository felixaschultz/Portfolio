import { UploadIcon } from "@sanity/icons";
import { Button, Flex, Stack, Text } from "@sanity/ui";
import { useCallback, useRef, useState } from "react";
import {
  ArrayOfObjectsInput,
  type ArrayOfObjectsInputProps,
  PatchEvent,
  set,
  useClient,
} from "sanity";

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|heic|heif|tiff?)$/i;

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/") || IMAGE_EXT.test(file.name);
}

function newKey(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

export function GalleryImagesInput(props: ArrayOfObjectsInputProps) {
  const client = useClient({ apiVersion: "2024-05-16" });
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const value = Array.isArray(props.value) ? props.value : [];

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const images = files.filter(isImageFile);
      if (!images.length) {
        setError("No image files found.");
        return;
      }

      setUploading(true);
      setError(null);

      try {
        const assets = await Promise.all(
          images.map((file) =>
            client.assets.upload("image", file, { filename: file.name }),
          ),
        );

        const newItems = assets.map((asset) => ({
          _type: "galleryImage" as const,
          _key: newKey(),
          image: {
            _type: "image" as const,
            asset: {
              _type: "reference" as const,
              _ref: asset._id,
            },
          },
        }));

        props.onChange(PatchEvent.from(set([...value, ...newItems])));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [client, props, value],
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
          disabled={uploading || Boolean(props.readOnly)}
          onClick={() => inputRef.current?.click()}
        />
        <Text size={1} muted>
          Selects every image in a folder (Chrome, Safari, Edge). You can also drag many
          files onto the grid or multi-select in the normal Upload dialog.
        </Text>
      </Flex>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        // Folder upload (non-standard; supported in Chromium & Safari)
        {...({ webkitdirectory: "", directory: "" } as React.InputHTMLAttributes<HTMLInputElement>)}
        onChange={onFolderChange}
      />

      {error ? (
        <Text size={1} style={{ color: "var(--card-badge-critical-fg-color, #f03e2e)" }}>
          {error}
        </Text>
      ) : null}

      <ArrayOfObjectsInput {...props} />
    </Stack>
  );
}
