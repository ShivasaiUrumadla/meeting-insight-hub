import { useMemo, useState } from "react";
import { Check, ChevronDown, Copy, Download, Plus } from "lucide-react";
import { parseReport, NOT_SPECIFIED_LABEL } from "@/lib/report";
import { SectionCard } from "@/components/SectionCard";
import { formatBytes } from "@/components/UploadCard";

interface ReportViewProps {
  report: string;
  transcript: string;
  fileName: string;
  fileSize?: number;
  onNewMeeting: () => void;
}

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  async function copy(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      setCopied(null);
    }
  }
  return { copied, copy };
}

function Paragraphs({ text }: { text: string }) {
  return (
    <div className="space-y-4">
      {text
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i} className="text-[15px] leading-relaxed text-foreground/90 sm:text-base">
            {p}
          </p>
        ))}
    </div>
  );
}

export function ReportView({
  report,
  transcript,
  fileName,
  fileSize,
  onNewMeeting,
}: ReportViewProps) {
  const parsed = useMemo(() => parseReport(report), [report]);
  const { copied, copy } = useCopy();
  const [showTranscript, setShowTranscript] = useState(false);

  function download() {
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName.replace(/\.[^.]+$/, "")}-report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <article className="border border-border bg-surface">
      <header className="border-b border-border p-5 sm:p-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
          <span className="flex items-center gap-1.5 text-brand">
            <Check className="size-3" aria-hidden /> Processing complete
          </span>
          <span className="truncate">{fileName}</span>
          {typeof fileSize === "number" ? <span>{formatBytes(fileSize)}</span> : null}
        </div>

        <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">Meeting Report</h2>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => copy("report", report)}
            className="btn-ghost"
          >
            <Copy className="size-3.5" aria-hidden />
            {copied === "report" ? "Copied" : "Copy report"}
          </button>
          <button type="button" onClick={download} className="btn-ghost">
            <Download className="size-3.5" aria-hidden />
            Download
          </button>
          <button type="button" onClick={onNewMeeting} className="btn-ghost">
            <Plus className="size-3.5" aria-hidden />
            New meeting
          </button>
        </div>
      </header>

      <div className="px-5 sm:px-8">
        {parsed.summary ? (
          <SectionCard index="01" title="Meeting Summary">
            <Paragraphs text={parsed.summary} />
          </SectionCard>
        ) : null}

        {parsed.missedBrief ? (
          <div className="py-8">
            <SectionCard title="If you missed the meeting" highlight>
              <Paragraphs text={parsed.missedBrief} />
            </SectionCard>
          </div>
        ) : null}

        {parsed.topics.length > 0 ? (
          <SectionCard index="02" title="Key Topics">
            <ol className="divide-y divide-border">
              {parsed.topics.map((topic, i) => (
                <li key={i} className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 py-3">
                  <span className="font-mono text-[11px] text-brand">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[15px] leading-relaxed">{topic}</span>
                </li>
              ))}
            </ol>
          </SectionCard>
        ) : null}

        {parsed.decisions.length > 0 ? (
          <SectionCard index="03" title="Important Decisions">
            <ul className="space-y-3">
              {parsed.decisions.map((decision, i) => (
                <li
                  key={i}
                  className="border-l-2 border-brand bg-brand-soft/60 px-4 py-3 text-[15px] leading-relaxed"
                >
                  {decision}
                </li>
              ))}
            </ul>
          </SectionCard>
        ) : null}

        {parsed.actionItems.length > 0 ? (
          <SectionCard index="04" title="Action Items">
            <div className="border border-border">
              <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] gap-4 border-b border-border px-4 py-2 font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase sm:grid">
                <span>Task</span>
                <span>Person</span>
                <span>Deadline</span>
              </div>
              <ul className="divide-y divide-border">
                {parsed.actionItems.map((item, i) => (
                  <li
                    key={i}
                    className="grid gap-2 px-4 py-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] sm:gap-4"
                  >
                    <span className="text-[15px] leading-relaxed">{item.task}</span>
                    <span
                      className={`text-sm ${
                        item.person === NOT_SPECIFIED_LABEL
                          ? "text-muted-foreground italic"
                          : "text-foreground"
                      }`}
                    >
                      <span className="mr-2 font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase sm:hidden">
                        Person
                      </span>
                      {item.person}
                    </span>
                    <span
                      className={`text-sm ${
                        item.deadline === NOT_SPECIFIED_LABEL
                          ? "text-muted-foreground italic"
                          : "text-foreground"
                      }`}
                    >
                      <span className="mr-2 font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase sm:hidden">
                        Deadline
                      </span>
                      {item.deadline}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </SectionCard>
        ) : null}

        {parsed.questions.length > 0 ? (
          <SectionCard index="05" title="Open Questions">
            <ul className="space-y-3">
              {parsed.questions.map((q, i) => (
                <li key={i} className="flex gap-3 text-[15px] leading-relaxed">
                  <span className="text-brand">?</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        ) : null}

        {parsed.other.map((section, i) => (
          <SectionCard key={i} title={section.heading}>
            <Paragraphs text={section.body} />
          </SectionCard>
        ))}

        <section className="border-t border-border py-8">
          <button
            type="button"
            onClick={() => setShowTranscript((v) => !v)}
            aria-expanded={showTranscript}
            className="flex w-full items-center justify-between gap-4 font-mono text-[11px] tracking-[0.16em] uppercase focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
          >
            <span>View full transcript</span>
            <ChevronDown
              className={`size-4 transition-transform ${showTranscript ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>

          {showTranscript ? (
            <div className="mt-5 border border-border">
              <div className="flex items-center justify-between border-b border-border px-4 py-2">
                <span className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                  Transcript
                </span>
                <button
                  type="button"
                  onClick={() => copy("transcript", transcript)}
                  className="btn-ghost"
                >
                  <Copy className="size-3.5" aria-hidden />
                  {copied === "transcript" ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="max-h-[28rem] overflow-auto px-4 py-4 font-mono text-[13px] leading-7 whitespace-pre-wrap text-foreground/85">
                {transcript}
              </pre>
            </div>
          ) : null}
        </section>
      </div>
    </article>
  );
}
