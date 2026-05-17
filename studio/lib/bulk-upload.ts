import type { SanityClient, SanityAssetDocument } from "@sanity/client";

/** Sanity direct upload limit (stay under to avoid opaque failures). */
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

const UPLOAD_DELAY_MS = 400;
const MAX_RETRIES = 4;
const RETRY_BASE_MS = 1200;

export type UploadFailure = {
  filename: string;
  message: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatUploadError(err: unknown): string {
  if (err && typeof err === "object") {
    const e = err as {
      message?: string;
      statusCode?: number;
      response?: { body?: { error?: { description?: string } } };
      details?: { description?: string };
    };
    const parts = [
      e.message,
      e.statusCode ? `HTTP ${e.statusCode}` : null,
      e.response?.body?.error?.description,
      e.details?.description,
    ].filter(Boolean);
    if (parts.length) return parts.join(" — ");
  }
  return err instanceof Error ? err.message : "Upload failed";
}

function isRetryableUploadError(err: unknown): boolean {
  const status = err && typeof err === "object" ? (err as { statusCode?: number }).statusCode : undefined;
  if (status === 429 || status === 502 || status === 503 || status === 504) return true;

  const message = formatUploadError(err).toLowerCase();
  return (
    message.includes("request error") ||
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("timeout") ||
    message.includes("econnreset") ||
    message.includes("socket") ||
    message.includes("aborted")
  );
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (!isRetryableUploadError(err) || attempt === MAX_RETRIES) break;
      await sleep(Math.min(RETRY_BASE_MS * 2 ** attempt, 20_000));
    }
  }
  throw lastError;
}

export type BulkUploadOptions = {
  client: SanityClient;
  files: File[];
  safeFilename: (name: string) => string;
  onProgress: (completed: number, total: number, filename: string) => void;
};

export type BulkUploadResult = {
  assets: SanityAssetDocument[];
  failures: UploadFailure[];
  skipped: UploadFailure[];
};

/**
 * Upload many images sequentially with pacing and retries.
 * Sequential uploads avoid browser/API overload that causes generic "Request error" failures.
 */
export async function uploadImagesInBulk({
  client,
  files,
  safeFilename,
  onProgress,
}: BulkUploadOptions): Promise<BulkUploadResult> {
  const assets: SanityAssetDocument[] = [];
  const failures: UploadFailure[] = [];
  const skipped: UploadFailure[] = [];
  const total = files.length;
  let completed = 0;

  for (const file of files) {
    if (file.size > MAX_UPLOAD_BYTES) {
      skipped.push({
        filename: file.name,
        message: `Over ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))}MB — resize or export smaller JPEGs`,
      });
      completed += 1;
      onProgress(completed, total, file.name);
      continue;
    }

    try {
      const asset = await withRetry(() =>
        client.assets.upload("image", file, {
          filename: safeFilename(file.name),
          contentType: file.type || "image/jpeg",
          timeout: 180_000,
        }),
      );
      assets.push(asset);
    } catch (err) {
      failures.push({ filename: file.name, message: formatUploadError(err) });
    }

    completed += 1;
    onProgress(completed, total, file.name);

    if (completed < total) {
      await sleep(UPLOAD_DELAY_MS);
    }
  }

  return { assets, failures, skipped };
}
