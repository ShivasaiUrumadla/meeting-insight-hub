/**
 * Meeting Analysis AI — backend service layer.
 *
 * Flow:
 *   1. POST {API_URL}/upload-url  -> presigned Backblaze B2 URL
 *   2. PUT  <presigned url>       -> the MP4 goes browser -> B2 directly
 *   3. POST {API_URL}/process     -> transcript + report
 *
 * Keep all network logic here; components stay presentation-only.
 */

export const API_URL =
  (import.meta.env["VITE_API_URL"] as string | undefined) ?? "http://127.0.0.1:8000";

export type ApiErrorKind =
  | "network"
  | "upload_failed"
  | "processing_failed"
  | "no_speech"
  | "unknown";

export class ApiError extends Error {
  kind: ApiErrorKind;
  constructor(kind: ApiErrorKind, message: string) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
  }
}

export interface UploadUrlResponse {
  file_id: string;
  upload_url: string;
  object_key: string;
}

export interface ProcessResponse {
  message: string;
  transcript: string;
  report: string;
}

async function readError(res: Response): Promise<string> {
  try {
    const text = await res.text();
    if (!text) return `${res.status} ${res.statusText}`;
    try {
      const json = JSON.parse(text) as { detail?: string; message?: string };
      return json.detail ?? json.message ?? text;
    } catch {
      return text;
    }
  } catch {
    return `${res.status} ${res.statusText}`;
  }
}

/** Step 1 — ask the backend for a presigned upload URL. */
export async function requestUploadUrl(file: File): Promise<UploadUrlResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/upload-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        content_type: file.type || "video/mp4",
      }),
    });
  } catch {
    throw new ApiError("network", "Could not reach the analysis service.");
  }

  if (!res.ok) {
    throw new ApiError("upload_failed", await readError(res));
  }
  return (await res.json()) as UploadUrlResponse;
}

/** Step 2 — PUT the file straight to Backblaze B2 with real progress. */
export function uploadToStorage(
  uploadUrl: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Content-Type", file.type || "video/mp4");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
      } else {
        reject(new ApiError("upload_failed", `Storage rejected the upload (${xhr.status}).`));
      }
    };
    xhr.onerror = () =>
      reject(new ApiError("network", "The connection dropped while uploading."));
    xhr.onabort = () => reject(new ApiError("upload_failed", "Upload was cancelled."));
    xhr.send(file);
  });
}

/** Step 3 — kick off server-side processing and get the report back. */
export async function processMeeting(objectKey: string): Promise<ProcessResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/process?object_key=${encodeURIComponent(objectKey)}`, {
      method: "POST",
    });
  } catch {
    throw new ApiError("network", "Could not reach the analysis service.");
  }

  if (!res.ok) {
    const detail = await readError(res);
    if (/no\s+speech|no\s+audio|unintelligible/i.test(detail)) {
      throw new ApiError("no_speech", detail);
    }
    throw new ApiError("processing_failed", detail);
  }

  const data = (await res.json()) as ProcessResponse;
  const transcript = (data.transcript ?? "").trim();
  if (!transcript) {
    throw new ApiError("no_speech", "No intelligible speech was found in this recording.");
  }
  return { ...data, transcript };
}
