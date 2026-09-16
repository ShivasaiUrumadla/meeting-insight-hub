const BARS = [
  18, 42, 26, 64, 88, 52, 34, 72, 96, 44, 28, 60, 80, 38, 22, 54, 92, 46, 30, 68, 84, 36, 24, 58,
  76, 40, 20, 50, 70, 32,
];

export function HeroVisual() {
  return (
    <div
      aria-hidden
      className="relative w-full overflow-hidden border border-border bg-surface"
      style={{
        backgroundImage:
          "linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="absolute top-0 right-0 size-3 bg-brand" />

      <div className="flex h-28 items-end gap-[3px] border-b border-border px-5 py-4 sm:h-36 sm:px-7">
        {BARS.map((height, i) => (
          <span
            key={i}
            className="wave-bar flex-1 bg-foreground/80"
            style={{
              height: `${height}%`,
              animationDelay: `${i * 70}ms`,
              backgroundColor: i % 7 === 3 ? "var(--color-brand)" : undefined,
            }}
          />
        ))}
      </div>

      <div className="space-y-3 px-5 py-6 sm:px-7">
        {[
          ["82%", "58%"],
          ["64%", "36%"],
          ["91%", "44%"],
          ["48%", "70%"],
        ].map(([a, b], i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-muted-foreground">
              {String(i * 37).padStart(2, "0")}:{String((i * 17) % 60).padStart(2, "0")}
            </span>
            <span className="h-[6px] bg-foreground/15" style={{ width: a }} />
            <span
              className="h-[6px]"
              style={{
                width: b,
                backgroundColor: i === 2 ? "var(--color-brand)" : "var(--color-border)",
              }}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-border px-5 py-3 font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase sm:px-7">
        <span>Audio → Transcript</span>
        <span className="text-brand">Analysis</span>
      </div>
    </div>
  );
}
