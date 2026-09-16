import { Check } from "lucide-react";

export type Stage = "upload" | "audio" | "transcribe" | "analyze" | "ready";

export const STAGES: { key: Stage; label: string; done: string }[] = [
  { key: "upload", label: "Uploading recording", done: "Upload complete" },
  { key: "audio", label: "Extracting audio", done: "Audio extracted" },
  { key: "transcribe", label: "Transcribing meeting", done: "Transcription complete" },
  { key: "analyze", label: "Analyzing transcript", done: "Analysis complete" },
  { key: "ready", label: "Preparing report", done: "Report ready" },
];

interface ProcessingStateProps {
  stage: Stage;
  uploadProgress: number;
  fileName: string;
}

export function ProcessingState({ stage, uploadProgress, fileName }: ProcessingStateProps) {
  const activeIndex = STAGES.findIndex((s) => s.key === stage);

  return (
    <div className="border border-border bg-surface" aria-live="polite">
      <div className="flex items-center justify-between border-b border-border px-5 py-3 font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
        <span className="truncate">{fileName}</span>
        <span className="text-brand">Processing</span>
      </div>

      <div className="p-5 sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Your meeting is being analyzed…
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This may take a few minutes depending on recording length.
        </p>

        <ol className="mt-8 space-y-0">
          {STAGES.map((step, i) => {
            const state = i < activeIndex ? "complete" : i === activeIndex ? "active" : "pending";
            return (
              <li
                key={step.key}
                className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 border-t border-border py-4 first:border-t-0"
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center">
                  {state === "complete" ? (
                    <Check className="size-4 text-foreground" aria-hidden />
                  ) : state === "active" ? (
                    <span className="pulse-dot size-2.5 rounded-full bg-brand" />
                  ) : (
                    <span className="size-2.5 rounded-full border border-border" />
                  )}
                </span>
                <div className="min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      state === "pending"
                        ? "text-muted-foreground"
                        : state === "active"
                          ? "text-brand"
                          : "text-foreground"
                    }`}
                  >
                    {state === "complete" ? step.done : step.label}
                  </p>
                  {state === "active" && step.key === "upload" ? (
                    <div className="mt-3 max-w-md">
                      <div className="h-[3px] w-full bg-border">
                        <div
                          className="h-full bg-brand transition-[width] duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                        {uploadProgress}% uploaded
                      </p>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
