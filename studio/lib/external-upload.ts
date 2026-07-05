export type ExternalUploadResult = {
  url: string;
  width: number;
  height: number;
  filename: string;
};

export function getExternalUploadConfig(): { url: string; key: string } | null {
  const url = (import.meta.env.SANITY_STUDIO_IMAGE_UPLOAD_URL as string | undefined)?.trim();
  const key = (import.meta.env.SANITY_STUDIO_IMAGE_UPLOAD_KEY as string | undefined)?.trim();
  if (!url || !key) return null;
  return { url, key };
}

export function isExternalUploadConfigured(): boolean {
  return getExternalUploadConfig() !== null;
}

export async function uploadImageToExternalServer(
  file: File,
  uploadUrl: string,
  apiKey: string,
): Promise<ExternalUploadResult> {
  const body = new FormData();
  body.append("file", file);

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "X-API-Key": apiKey },
    body,
  });

  let raw: unknown;
  try {
    raw = await response.json();
  } catch {
    throw new Error(`Upload server returned non-JSON (HTTP ${response.status})`);
  }

  if (!response.ok) {
    const msg = (raw as { error?: string })?.error ?? `HTTP ${response.status}`;
    throw new Error(`Upload failed: ${msg}`);
  }

  const result = raw as ExternalUploadResult;
  if (!result.url) throw new Error("Upload server did not return a URL");
  return result;
}
