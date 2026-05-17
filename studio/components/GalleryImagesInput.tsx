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

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|heic|heif|tiff?)$/i;
const UPLOAD_CONCURRENCY = 3;

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/") || IMAGE_EXT.test(file.name);
}

function newKey(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

function safeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );
  return results;
}

function formatUploadError(err: unknown): string {
  if (err && typeof err === "object") {
    const e = err as {
      message?: string;
      statusCode?: number;
      details?: { type?: string; description?: string };
    };
    const parts = [
      e.message,
      e.statusCode ? `HTTP ${e.statusCode}` : null,
      e.details?.description,
    ].filter(Boolean);
    if (parts.length) return parts.join(" — ");
  }
  return err instanceof Error ? err.message : "Upload failed";
}

export function GalleryImagesInput(props: ArrayOfObjectsInputProps) {
  const documentId = useFormValue(["_id"]) as string | undefined;
  const user = useCurrentUser();
  const writeToken = import.meta.env.SANITY_STUDIO_API_TOKEN as string | undefined;

  // Signed-in Studio users already have upload rights — only attach a token when not logged in.
  const client = useClient({ apiVersion: "2024-05-16" }).withConfig({
    useCdn: false,
    ...(!user && writeToken ? { token: writeToken } : {}),
  });

  const canUpload = Boolean(user || writeToken);

  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const value = useMemo(
    () => (Array.isArray(props.value) ? props.value : []),
    [props.value],
  );

  const photoCount = value.length;

  const clearAllImages = useCallback(async () => {
    if (photoCount === 0 || props.readOnly) return;

    const confirmed = window.confirm(
      `Remove all ${photoCount} photo${photoCount === 1 ? "" : "s"} from this gallery?\n\nThe cover selection will be reset. You can then use “Upload folder” to add a new set of images.`,
    );
    if (!confirmed) return;

    props.onChange(PatchEvent.from(set([])));
    if (documentId) {
      try {
        await client.patch(documentId).unset(["coverImageKey"]).commit();
      } catch (err) {
        setError(formatUploadError(err));
        return;
      }
    }
    setError(null);
    setProgress("");
  }, [client, documentId, photoCount, props]);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!canUpload) {
        setError(
          "Not signed in. Log in to Sanity Studio (top right), or add SANITY_STUDIO_API_TOKEN to .env (Editor or Administrator — not Viewer or Access Manager).",
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
      setProgress(`0 / ${images.length}`);

      try {
        let done = 0;
        const assets = await mapPool(images, UPLOAD_CONCURRENCY, async (file) => {
          const asset = await client.assets.upload("image", file, {
            filename: safeFilename(file.name),
            contentType: file.type || "image/jpeg",
          });
          done += 1;
          setProgress(`${done} / ${images.length}`);
          return asset;
        });

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
        setProgress("");
      } catch (err) {
        setError(
          `${formatUploadError(err)}. If uploads keep failing: sign in to Studio (top right), use an Editor/Administrator API token as SANITY_STUDIO_API_TOKEN (not Access Manager), restart npm run studio, and add both http://localhost:3333 and http://127.0.0.1:3333 to CORS at sanity.io/manage → API.`,
        );
      } finally {
        setUploading(false);
      }
    },
    [canUpload, client, props, value],
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
            ? "Pick a folder to add images, or clear all photos first when replacing a cloned gallery."
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
          Uploaded {progress}
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
