import type { SanityClient, SanityAssetDocument } from "@sanity/client";

/** Sanity direct upload limit (stay under to avoid opaque failures). */
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

const UPLOAD_DELAY_MS = 700;
const MAX_RETRIES = 4;
const RETRY_BASE_MS = 1500;

export type UploadFailure = {
  filename: string;
  message: string;
};

export type UploadFileStatus = "pending" | "uploading" | "success" | "failed" | "skipped";

export type UploadFileResult = {
  filename: string;
  status: UploadFileStatus;
  message?: string;
  asset?: SanityAssetDocument;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readResponseBody(body: unknown): string | null {
  if (!body) return null;
  if (typeof body === "string") return body;
  if (typeof body === "object") {
    const record = body as {
      error?: { description?: string; message?: string };
      message?: string;
    };
    return record.error?.description ?? record.error?.message ?? record.message ?? null;
  }
  return null;
}

export function formatUploadError(err: unknown): string {
  if (err instanceof Error && err.message) {
    const base = err.message.trim();
    const extra = err as Error & {
      statusCode?: number;
      responseBody?: unknown;
      response?: { body?: unknown };
    };
    const status = extra.statusCode ? `HTTP ${extra.statusCode}` : null;
    const api =
      readResponseBody(extra.responseBody) ?? readResponseBody(extra.response?.body);
    return [base, status, api].filter(Boolean).join(" — ");
  }

  if (err && typeof err === "object") {
    const e = err as {
      message?: string;
      statusCode?: number;
      responseBody?: unknown;
      response?: { body?: unknown };
      details?: { description?: string };
    };
    const parts = [
      typeof e.message === "string" ? e.message : null,
      e.statusCode ? `HTTP ${e.statusCode}` : null,
      readResponseBody(e.responseBody) ?? readResponseBody(e.response?.body),
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
    message.includes("aborted") ||
    message.includes("failed to fetch")
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
      await sleep(Math.min(RETRY_BASE_MS * 2 ** attempt, 25_000));
    }
  }
  throw lastError;
}

export function isFileTooLarge(file: File): boolean {
  return file.size > MAX_UPLOAD_BYTES;
}

export function skipMessageForFile(file: File): string {
  return `Over ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} MB — resize or export smaller JPEGs`;
}

export async function uploadSingleImage(
  client: SanityClient,
  file: File,
  safeFilename: (name: string) => string,
): Promise<SanityAssetDocument> {
  return withRetry(() =>
    client.assets.upload("image", file, {
      filename: safeFilename(file.name),
      contentType: file.type || "image/jpeg",
      timeout: 180_000,
    }),
  );
}

export type ProcessUploadQueueOptions = {
  client: SanityClient;
  files: File[];
  safeFilename: (name: string) => string;
  onFileStart?: (filename: string, index: number, total: number) => void;
  onFileComplete?: (result: UploadFileResult, index: number, total: number) => void;
  shouldCancel?: () => boolean;
};

/**
 * Upload files one at a time; each result is reported via onFileComplete (failures do not stop the queue).
 */
export async function processUploadQueue({
  client,
  files,
  safeFilename,
  onFileStart,
  onFileComplete,
  shouldCancel,
}: ProcessUploadQueueOptions): Promise<void> {
  const total = files.length;

  for (let index = 0; index < total; index++) {
    if (shouldCancel?.()) break;

    const file = files[index];
    onFileStart?.(file.name, index, total);

    if (isFileTooLarge(file)) {
      onFileComplete?.(
        { filename: file.name, status: "skipped", message: skipMessageForFile(file) },
        index,
        total,
      );
      continue;
    }

    try {
      const asset = await uploadSingleImage(client, file, safeFilename);
      onFileComplete?.({ filename: file.name, status: "success", asset }, index, total);
    } catch (err) {
      onFileComplete?.(
        { filename: file.name, status: "failed", message: formatUploadError(err) },
        index,
        total,
      );
    }

    if (index < total - 1 && !shouldCancel?.()) {
      await sleep(UPLOAD_DELAY_MS);
    }
  }
}

/** @deprecated Use processUploadQueue + uploadSingleImage for UI-driven uploads */
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

export async function uploadImagesInBulk(options: BulkUploadOptions): Promise<BulkUploadResult> {
  const assets: SanityAssetDocument[] = [];
  const failures: UploadFailure[] = [];
  const skipped: UploadFailure[] = [];

  await processUploadQueue({
    ...options,
    onFileComplete: (result) => {
      if (result.status === "success" && result.asset) {
        assets.push(result.asset);
      } else if (result.status === "failed" && result.message) {
        failures.push({ filename: result.filename, message: result.message });
      } else if (result.status === "skipped" && result.message) {
        skipped.push({ filename: result.filename, message: result.message });
      }
    },
  });

  return { assets, failures, skipped };
}
