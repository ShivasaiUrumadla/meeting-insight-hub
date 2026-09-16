# Meeting Analysis AI — frontend

A single-page app where someone uploads a meeting recording, watches it get processed, and reads a clean report.

## Screens (one page, four states)

1. **Landing** — minimal top bar (product name, "How it works", "Features", "Upload Meeting"), a large headline "Turn meetings into actionable knowledge.", supporting copy, primary CTA, "MP4 supported". Hero visual is built purely in CSS: fine grid, waveform bars, transcript-like ruled lines, one orange accent mark, very restrained motion. Below: how-it-works pipeline strip and a calm empty state ("Ready to analyze your next meeting.").
2. **Upload** — large drag-and-drop zone, click-to-choose, MP4-only validation, selected file name + size + remove, "Analyze Meeting" disabled until a file is chosen.
3. **Processing** — vertical pipeline with five steps (Upload, Extracting audio, Transcribing, Analyzing, Preparing report), each pending / active / complete, orange only on the active step, real upload percentage during the direct upload, plus the reassurance copy.
4. **Report** — editorial layout: file name and metadata, actions (copy, download, new meeting), Meeting Summary, "If you missed the meeting" highlighted block, Key Topics, Important Decisions, Action Items (task / person / deadline, "Not specified" when absent), Open Questions, and a collapsed "View Full Transcript" with a copy button.

Error states designed as first-class screens: unsupported file, file too large, upload failed, processing failed, no speech detected, network error. No fake report is ever shown.

## Visual direction

Light theme: near-white background, near-black text, muted gray secondary, hairline gray borders, warm orange #F55036 used sparingly for actions, active states and small marks. Bold large type, wide whitespace, square-ish corners, almost no shadow. Fully responsive: wide centered desktop, tighter tablet, single-column mobile with an always-reachable primary action.

## Backend wiring

- `POST /upload-url` with filename and content type
- direct `PUT` of the MP4 to the returned Backblaze presigned URL (browser → B2, never through the API), with real progress
- `POST /process?object_key=...`, then render `transcript` and `report`

All of this lives in one small service file; components stay presentation-only. The API base comes from an environment variable defaulting to `http://127.0.0.1:8000`.

## Technical notes

- This project runs on TanStack Start with React + TypeScript + Tailwind v4, so files are `.tsx` under `src/routes` and `src/components` rather than `src/pages` + `main.jsx`. Same component breakdown (Navbar, UploadCard, ProcessingState, ReportView, SectionCard, Footer, HeroVisual), same behaviour; the requested Vite/React/Tailwind/lucide-react stack is otherwise unchanged.
- Colors and type scale go into `src/styles.css` as theme tokens; no hardcoded color classes in components.
- State is plain React hooks: `selectedFile`, `uploadProgress`, `stage`, `transcript`, `report`, `error`.
- The backend returns `report` as text. It will be parsed into the named sections by heading, with a graceful fallback to rendering the raw report if the shape does not match — no invented content either way.
- Direct upload uses `XMLHttpRequest` for progress; the B2 bucket must allow CORS `PUT` from the browser origin.
- Because the backend is on `127.0.0.1`, the app will only reach it when run on your own machine; in the hosted preview those calls will fail and surface as a network error state.
