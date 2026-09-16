import { useRef, useState, type DragEvent } from "react";
import { UploadCloud, X, FileVideo, AlertTriangle } from "lucide-react";

const MAX_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unit]}`;
}

interface UploadCardProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  onAnalyze: () => void;
}

export function UploadCard({ file, onFileChange, onAnalyze }: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  function validateAndSet(candidate: File | undefined) {
    if (!candidate) return;
    const isMp4 =
      candidate.type === "video/mp4" || candidate.name.toLowerCase().endsWith(".mp4");
    if (!isMp4) {
      setValidationError("Unsupported file type. Upload an MP4 recording.");
      onFileChange(null);
      return;
    }
    if (candidate.size > MAX_BYTES) {
      setValidationError(`File is too large (${formatBytes(candidate.size)}). Limit is 2 GB.`);
      onFileChange(null);
      return;
    }
    setValidationError(null);
    onFileChange(candidate);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    validateAndSet(event.dataTransfer.files?.[0]);
  }

  return (
    <div className="border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-3 font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
        <span>Upload meeting</span>
        <span>MP4</span>
      </div>

      <div className="p-5 sm:p-8">
        <div
          role="button"
          tabIndex={0}
          aria-label="Drop your meeting video here, or choose a file"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 border border-dashed px-5 py-12 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand sm:py-16 ${
            dragging ? "border-brand bg-brand-soft" : "border-border hover:border-foreground/40"
          }`}
        >
          <UploadCloud className={`size-7 ${dragging ? "text-brand" : "text-muted-foreground"}`} aria-hidden />
          <p className="text-lg font-bold tracking-tight">Drop your meeting video here</p>
          <p className="text-sm text-muted-foreground">
            or <span className="text-brand underline underline-offset-4">choose a file</span>
          </p>
          <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            MP4 · up to 2 GB
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,.mp4"
            className="sr-only"
            onChange={(e) => validateAndSet(e.target.files?.[0])}
          />
        </div>

        {validationError ? (
          <p
            role="alert"
            className="mt-4 flex items-start gap-2 border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            {validationError}
          </p>
        ) : null}

        {file ? (
          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border border-border px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <FileVideo className="size-4 shrink-0 text-brand" aria-hidden />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {formatBytes(file.size)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onFileChange(null)}
              aria-label={`Remove ${file.name}`}
              className="flex items-center gap-1 border border-border px-2 py-1 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <X className="size-3" aria-hidden />
              Remove
            </button>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onAnalyze}
            disabled={!file}
            className="btn-primary w-full sm:w-auto"
          >
            Analyze Meeting
          </button>
          {!file ? (
            <span className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
              Select a recording to continue
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
