import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowRight, AudioLines, FileText, ListChecks, ShieldCheck, Zap } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroVisual } from "@/components/HeroVisual";
import { UploadCard } from "@/components/UploadCard";
import { ProcessingState, STAGES, type Stage } from "@/components/ProcessingState";
import { ReportView } from "@/components/ReportView";
import { ErrorState } from "@/components/ErrorState";
import { ApiError, processMeeting, requestUploadUrl, uploadToStorage } from "@/services/api";
import type { ApiErrorKind } from "@/services/api";

const TITLE = "Meeting Analysis AI — Turn meetings into actionable knowledge";
const DESCRIPTION =
  "Upload a meeting recording and get an AI-generated summary, decisions, action items, open questions, and a catch-up brief for anyone who missed it.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

type View = "idle" | "processing" | "report" | "error";

function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [view, setView] = useState<View>("idle");
  const [stage, setStage] = useState<Stage>("upload");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [report, setReport] = useState("");
  const [error, setError] = useState<{ kind: ApiErrorKind; detail?: string } | null>(null);
  const [meta, setMeta] = useState<{ name: string; size: number } | null>(null);

  const workRef = useRef<HTMLDivElement>(null);

  function scrollToWork() {
    workRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function reset() {
    setFile(null);
    setView("idle");
    setStage("upload");
    setUploadProgress(0);
    setTranscript("");
    setReport("");
    setError(null);
    setMeta(null);
    scrollToWork();
  }

  async function analyze() {
    if (!file) return;
    setMeta({ name: file.name, size: file.size });
    setView("processing");
    setStage("upload");
    setUploadProgress(0);
    setError(null);
    scrollToWork();

    try {
      const { upload_url, object_key } = await requestUploadUrl(file);
      await uploadToStorage(upload_url, file, setUploadProgress);

      // The backend runs extraction, transcription and analysis in one call,
      // so advance the pipeline optimistically while it works.
      setStage("audio");
      const timers = [
        setTimeout(() => setStage("transcribe"), 6000),
        setTimeout(() => setStage("analyze"), 20000),
      ];

      try {
        const result = await processMeeting(object_key);
        timers.forEach(clearTimeout);
        setStage("ready");
        setTranscript(result.transcript);
        setReport(result.report ?? "");
        setView("report");
      } finally {
        timers.forEach(clearTimeout);
      }
    } catch (err) {
      const apiError = err instanceof ApiError ? err : null;
      setError({
        kind: apiError?.kind ?? "unknown",
        detail: apiError?.message ?? (err instanceof Error ? err.message : undefined),
      });
      setView("error");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar onUploadClick={scrollToWork} />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:py-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:px-10 lg:py-28">
            <div className="min-w-0">
              <p className="font-mono text-[11px] tracking-[0.2em] text-brand uppercase">
                Meeting intelligence
              </p>
              <h1 className="mt-5 text-4xl leading-[1.02] font-bold tracking-[-0.03em] sm:text-6xl lg:text-7xl">
                Turn meetings into actionable knowledge.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Upload a meeting recording and get a concise AI-generated summary, decisions,
                action items, and everything someone who missed the meeting needs to know.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button type="button" onClick={scrollToWork} className="btn-primary">
                  Upload Meeting
                  <ArrowRight className="size-4" aria-hidden />
                </button>
                <span className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                  MP4 supported
                </span>
              </div>
            </div>

            <HeroVisual />
          </div>
        </section>

        {/* Work area: upload / processing / report / error */}
        <section ref={workRef} className="scroll-mt-20 border-b border-border">
          <div className="mx-auto max-w-5xl px-5 py-14 sm:py-20 lg:px-10">
            {view === "idle" ? (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Ready to analyze your next meeting.
                  </h2>
                  <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
                    Upload a recording and we'll turn the conversation into a clear, actionable
                    report.
                  </p>
                </div>
                <UploadCard file={file} onFileChange={setFile} onAnalyze={analyze} />
              </>
            ) : null}

            {view === "processing" ? (
              <ProcessingState
                stage={stage}
                uploadProgress={uploadProgress}
                fileName={meta?.name ?? ""}
              />
            ) : null}

            {view === "report" ? (
              <ReportView
                report={report}
                transcript={transcript}
                fileName={meta?.name ?? "Meeting"}
                fileSize={meta?.size}
                onNewMeeting={reset}
              />
            ) : null}

            {view === "error" && error ? (
              <ErrorState kind={error.kind} detail={error.detail} onRetry={reset} />
            ) : null}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-20 border-b border-border">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:py-20 lg:px-10">
            <p className="font-mono text-[11px] tracking-[0.2em] text-brand uppercase">
              How it works
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
              One upload. A full pipeline runs behind it.
            </h2>

            <ol className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-5">
              {STAGES.map((step, i) => (
                <li key={step.key} className="bg-surface p-6">
                  <span className="font-mono text-[11px] tracking-[0.18em] text-brand">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-4 text-base font-bold tracking-tight">{step.label}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:py-20 lg:px-10">
            <p className="font-mono text-[11px] tracking-[0.2em] text-brand uppercase">Features</p>
            <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
              Built for the people who weren't in the room.
            </h2>

            <div className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: FileText,
                  title: "Structured report",
                  body: "Summary, topics, decisions and open questions, laid out like a document — not a chat log.",
                },
                {
                  icon: ListChecks,
                  title: "Action items with owners",
                  body: "Task, person and deadline. Anything the meeting never said is marked Not specified.",
                },
                {
                  icon: AudioLines,
                  title: "Full transcript",
                  body: "The complete transcription stays one click away, copyable and out of your way.",
                },
                {
                  icon: Zap,
                  title: "Direct-to-storage upload",
                  body: "Recordings go straight from your browser to object storage, so large files move fast.",
                },
                {
                  icon: ShieldCheck,
                  title: "No invented content",
                  body: "If speech can't be detected, you get a clear message instead of a fabricated report.",
                },
                {
                  icon: ArrowRight,
                  title: "Catch-up brief",
                  body: "A short read for anyone who missed the meeting and needs the outcome, not the play-by-play.",
                },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title} className="bg-surface p-6 sm:p-8">
                  <Icon className="size-5 text-brand" aria-hidden />
                  <h3 className="mt-5 text-lg font-bold tracking-tight">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
