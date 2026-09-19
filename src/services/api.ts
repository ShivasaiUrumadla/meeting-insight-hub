/**
 * Meeting Analysis AI — backend service layer.
 *
 * Flow:
 *   1. POST {API_URL}/upload-url  -> presigned Backblaze B2 URL
 *   2. PUT  <presigned url>       -> MP4 goes browser -> B2 directly
 *   3. POST {API_URL}/process     -> transcript + report
 *
 * Keep network logic here; components stay presentation-only.
 */

export const API_URL =
  (import.meta.env["VITE_API_URL"] as string | undefined) ??
  "http://127.0.0.1:8000";


const MAX_FILE_SIZE = 500 * 1024 * 1024;


export type ApiErrorKind =
  | "network"
  | "invalid_file"
  | "upload_failed"
  | "processing_failed"
  | "no_speech"
  | "unknown";


export class ApiError extends Error {
  kind: ApiErrorKind;

  constructor(
    kind: ApiErrorKind,
    message: string
  ) {
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
  report: string | null;
}


async function readError(res: Response): Promise<string> {
  try {
    const text = await res.text();

    if (!text) {
      return `${res.status} ${res.statusText}`;
    }

    try {
      const json = JSON.parse(text) as {
        detail?: string;
        message?: string;
      };

      return json.detail ?? json.message ?? text;

    } catch {
      return text;
    }

  } catch {
    return `${res.status} ${res.statusText}`;
  }
}


/**
 * Step 1
 *
 * Ask FastAPI for a presigned B2 upload URL.
 */
export async function requestUploadUrl(
  file: File
): Promise<UploadUrlResponse> {

  // -------------------------
  // Validate file type
  // -------------------------

  if (file.type !== "video/mp4") {
    throw new ApiError(
      "invalid_file",
      "Only MP4 video files are supported."
    );
  }


  // -------------------------
  // Validate file size
  // -------------------------

  if (file.size <= 0) {
    throw new ApiError(
      "invalid_file",
      "The selected file is empty."
    );
  }


  if (file.size > MAX_FILE_SIZE) {
    throw new ApiError(
      "invalid_file",
      "File is too large. Maximum size is 500 MB."
    );
  }


  // -------------------------
  // Request presigned URL
  // -------------------------

  let res: Response;

  try {

    res = await fetch(
      `${API_URL}/upload-url`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          // ngrok browser warning bypass
          "ngrok-skip-browser-warning": "true",
        },

        body: JSON.stringify({
          filename: file.name,
          content_type: file.type,
          file_size: file.size,
        }),
      }
    );

  } catch {

    throw new ApiError(
      "network",
      "Could not reach the analysis service."
    );
  }


  // -------------------------
  // Handle backend error
  // -------------------------

  if (!res.ok) {

    throw new ApiError(
      "upload_failed",
      await readError(res)
    );
  }


  return (await res.json()) as UploadUrlResponse;
}


/**
 * Step 2
 *
 * Upload the MP4 directly to Backblaze B2.
 *
 * XMLHttpRequest is used instead of fetch so we can
 * track real upload progress.
 */
export function uploadToStorage(
  uploadUrl: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<void> {

  return new Promise((resolve, reject) => {

    const xhr = new XMLHttpRequest();

    xhr.open(
      "PUT",
      uploadUrl,
      true
    );


    xhr.setRequestHeader(
      "Content-Type",
      file.type || "video/mp4"
    );


    // -------------------------
    // Upload progress
    // -------------------------

    xhr.upload.onprogress = (event) => {

      if (event.lengthComputable) {

        const percent = Math.round(
          (event.loaded / event.total) * 100
        );

        onProgress(percent);
      }
    };


    // -------------------------
    // Upload completed
    // -------------------------

    xhr.onload = () => {

      if (
        xhr.status >= 200 &&
        xhr.status < 300
      ) {

        onProgress(100);

        resolve();

      } else {

        reject(
          new ApiError(
            "upload_failed",
            `Storage rejected the upload (${xhr.status}).`
          )
        );
      }
    };


    // -------------------------
    // Network error
    // -------------------------

    xhr.onerror = () => {

      reject(
        new ApiError(
          "network",
          "The connection dropped while uploading."
        )
      );
    };


    // -------------------------
    // Upload cancelled
    // -------------------------

    xhr.onabort = () => {

      reject(
        new ApiError(
          "upload_failed",
          "Upload was cancelled."
        )
      );
    };


    xhr.send(file);
  });
}


/**
 * Step 3
 *
 * Ask FastAPI to process the uploaded B2 object.
 */
export async function processMeeting(
  objectKey: string
): Promise<ProcessResponse> {

  let res: Response;

  try {

    res = await fetch(
      `${API_URL}/process?object_key=${encodeURIComponent(objectKey)}`,
      {
        method: "POST",

        headers: {
          // Needed while backend is exposed through ngrok
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

  } catch {

    throw new ApiError(
      "network",
      "Could not reach the analysis service."
    );
  }


  // -------------------------
  // Handle processing errors
  // -------------------------

  if (!res.ok) {

    const detail = await readError(res);

    if (
      /no\s+speech|no\s+audio|unintelligible/i.test(detail)
    ) {

      throw new ApiError(
        "no_speech",
        detail
      );
    }


    throw new ApiError(
      "processing_failed",
      detail
    );
  }


  // -------------------------
  // Parse response
  // -------------------------

  const data =
    (await res.json()) as ProcessResponse;


  const transcript =
    (data.transcript ?? "").trim();


  // -------------------------
  // No speech
  // -------------------------

  if (!transcript) {

    throw new ApiError(
      "no_speech",
      "No intelligible speech was found in this recording."
    );
  }


  return {
    ...data,
    transcript,
  };
}