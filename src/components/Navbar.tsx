import { Activity } from "lucide-react";

interface NavbarProps {
  onUploadClick: () => void;
}

export function Navbar({ onUploadClick }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 sm:flex sm:justify-between lg:px-10">
        <a
          href="/"
          className="flex min-w-0 items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
          <Activity className="size-5 shrink-0 text-brand" aria-hidden />
          <span className="truncate font-mono text-xs font-bold tracking-[0.18em] uppercase sm:text-sm">
            Meeting Analysis AI
          </span>
        </a>

        <nav className="flex items-center gap-1 sm:gap-6" aria-label="Main">
          <a
            href="#how-it-works"
            className="hidden font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand sm:inline"
          >
            How it works
          </a>
          <a
            href="#features"
            className="hidden font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand sm:inline"
          >
            Features
          </a>
          <button type="button" onClick={onUploadClick} className="btn-outline">
            Upload Meeting
          </button>
        </nav>
      </div>
    </header>
  );
}
