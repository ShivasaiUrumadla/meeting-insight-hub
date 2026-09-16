import { AlertTriangle, MicOff, WifiOff } from "lucide-react";
import type { ApiErrorKind } from "@/services/api";

interface ErrorStateProps {
  kind: ApiErrorKind;
  detail?: string;
  onRetry: () => void;
}

const COPY: Record<ApiErrorKind, { title: string; message: string; action: string }> = {
  network: {
    title: "Network error",
    message: "We couldn't reach the analysis service. Check your connection and try again.",
    action: "Try again",
  },
  upload_failed: {
    title: "Upload failed",
    message: "The recording didn't finish uploading to storage.",
    action: "Try another recording",
  },
  processing_failed: {
    title: "Processing failed",
    message: "Something went wrong while analyzing this recording.",
    action: "Try another recording",
  },
  no_speech: {
    title: "No speech detected",
    message: "We couldn't find intelligible speech in this recording.",
    action: "Try another recording",
  },
  unknown: {
    title: "Something went wrong",
    message: "The meeting couldn't be analyzed.",
    action: "Try again",
  },
};

export function ErrorState({ kind, detail, onRetry }: ErrorStateProps) {
  const copy = COPY[kind] ?? COPY.unknown;
  const Icon = kind === "no_speech" ? MicOff : kind === "network" ? WifiOff : AlertTriangle;

  return (
    <div role="alert" className="border border-destructive/40 bg-surface">
      <div className="border-b border-destructive/30 px-5 py-3 font-mono text-[11px] tracking-[0.16em] text-destructive uppercase">
        Error
      </div>
      <div className="p-5 sm:p-8">
        <Icon className="size-6 text-destructive" aria-hidden />
        <h2 className="mt-4 text-2xl font-bold tracking-tight">{copy.title}</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">{copy.message}</p>
        {detail ? (
          <p className="mt-3 max-w-xl border border-border px-3 py-2 font-mono text-[11px] break-words text-muted-foreground">
            {detail}
          </p>
        ) : null}
        <button type="button" onClick={onRetry} className="btn-primary mt-6">
          {copy.action}
        </button>
      </div>
    </div>
  );
}
