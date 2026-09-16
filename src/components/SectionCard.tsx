import type { ReactNode } from "react";

interface SectionCardProps {
  index?: string;
  title: string;
  children: ReactNode;
  highlight?: boolean;
  id?: string;
}

export function SectionCard({ index, title, children, highlight, id }: SectionCardProps) {
  return (
    <section
      id={id}
      className={
        highlight
          ? "border border-brand/40 bg-brand-soft p-6 sm:p-8"
          : "border-t border-border py-8 first:border-t-0 sm:py-10"
      }
    >
      <div className="mb-4 flex items-baseline gap-3">
        {index ? (
          <span className="font-mono text-[11px] tracking-[0.18em] text-brand">{index}</span>
        ) : null}
        <h3 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h3>
      </div>
      <div className="max-w-3xl">{children}</div>
    </section>
  );
}
