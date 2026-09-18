# Meeting Insight Hub

Build a modern production-quality React frontend for my project called:

MEETING ANALYSIS AI

The application allows users to upload a meeting recording (MP4), automatically process it with AI, and generate a structured meeting report.

IMPORTANT:

- Build the frontend in React.

- Use a clean light theme.

- Take visual inspiration from the current Groq website and GroqCloud design language: minimal, bold typography, strong whitespace, high contrast, sharp sections, subtle borders, technical/AI-product feel, and restrained use of a warm orange accent.

- Do NOT clone Groq's website, logo, branding, copy, or exact layout.

- Create an original design that feels like a premium AI developer product inspired by that visual direction.

- The app should feel fast, technical, trustworthy, and focused.

- Avoid generic SaaS dashboard templates.

- Avoid excessive gradients, glassmorphism, huge rounded cards, excessive shadows, or overly colorful UI.

==================================================

TECH STACK

==================================================

Use:

- React

- Vite

- Tailwind CSS

- JavaScript

- lucide-react for icons

Keep the code componentized and clean.

Suggested structure:

src/

  components/

    Navbar.jsx

    UploadCard.jsx

    ProcessingState.jsx

    ReportView.jsx

    SectionCard.jsx

    Footer.jsx

  pages/

    Home.jsx

  App.jsx

  main.jsx

==================================================

VISUAL DIRECTION

==================================================

Theme:

- Background: white / very light gray

- Primary text: near-black

- Secondary text: muted gray

- Borders: thin light gray

- Accent: warm orange similar to Groq's orange (#F55036)

- Use orange only for important actions, active states, highlights, progress indicators, and small visual details

- Typography should feel bold and modern

- Large headlines

- Strong hierarchy

- Generous whitespace

- Thin borders

- Minimal shadows

- Mostly rectangular or lightly rounded components

- Crisp technical aesthetic

The interface should feel similar to a modern AI infrastructure/developer product.

Use responsive design from the beginning.

Desktop, tablet, and mobile must all work properly.

==================================================

APP CONCEPT

==================================================

This is not primarily a dashboard.

The main experience is:

User lands on page

    ↓

Selects meeting video

    ↓

Uploads video

    ↓

Video uploads directly to Backblaze B2

    ↓

Backend processes meeting

    ↓

FFmpeg extracts audio

    ↓

Gemini transcribes meeting

    ↓

Gemini analyzes transcript

    ↓

Meeting report appears

The interface should make this flow extremely clear.

==================================================

PAGE 1 — HOME

==================================================

Create a single beautiful landing/application page.

Navbar:

Left:

MEETING ANALYSIS AI

Center/right navigation:

- How it works

- Features

Right:

- "Upload Meeting" button

Keep navbar minimal.

Hero section:

Large headline:

"Turn meetings into actionable knowledge."

Supporting text:

"Upload a meeting recording and get a concise AI-generated summary, decisions, action items, and everything someone who missed the meeting needs to know."

Primary CTA:

"Upload Meeting"

Secondary small text:

"MP4 supported"

Hero should be visually strong but minimal.

Do NOT use stock images.

Instead create a subtle abstract technical visual using CSS:

- waveform lines

- tiny grid

- transcript-like lines

- simple orange accent

- subtle motion if appropriate

Keep it sophisticated.

==================================================

UPLOAD EXPERIENCE

==================================================

When user clicks "Upload Meeting", show an upload section/modal.

The upload area should have:

- Large drag-and-drop zone

- Upload icon

- Text:

  "Drop your meeting video here"

- Secondary:

  "or choose a file"

- Supported format:

  "MP4"

- Selected filename

- File size

- Remove file button

Primary button:

"Analyze Meeting"

Do not allow analysis without a selected file.

Use clear validation messages.

==================================================

PROCESSING STATE

==================================================

After upload begins, show a dedicated processing interface.

Do NOT just display a spinner.

Show a visual pipeline:

UPLOAD

   ↓

PROCESSING AUDIO

   ↓

TRANSCRIBING

   ↓

ANALYZING

   ↓

READY

Each step should have one of these states:

- Pending

- Active

- Completed

Use the orange accent for the active state.

Example:

✓ Upload complete

● Extracting audio

○ Transcribing meeting

○ Analyzing transcript

○ Preparing report

Also show:

"Your meeting is being analyzed..."

and:

"This may take a few minutes depending on recording length."

The design should make the system feel alive and trustworthy.

==================================================

REPORT VIEW

==================================================

After processing completes, show the meeting report.

Top section:

Meeting title / uploaded filename

Small metadata:

- Processing complete

- Duration if available

- File name

Main heading:

"Meeting Report"

Create a clean editorial-style report layout.

Sections:

1. Meeting Summary

Display the summary in a large readable block.

2. Key Topics

Show topics as a list with subtle numbered markers.

3. Important Decisions

Clearly distinguish decisions from general discussion.

4. Action Items

Use a structured table/list.

Each action item should have:

- Task

- Person

- Deadline

If person or deadline is unknown, display:

"Not specified"

Do not invent missing data.

5. Open Questions

Show unresolved questions clearly.

6. What Someone Who Missed This Meeting Needs to Know

Make this the most prominent section after the main summary.

Use a slightly highlighted but still minimal container.

Title:

"If you missed the meeting"

This should provide a concise practical overview.

==================================================

TRANSCRIPT

==================================================

Include a collapsible section near the bottom:

"View Full Transcript"

When expanded:

- Show transcript in a readable monospace or clean document style

- Add a copy button

- Keep line spacing comfortable

Do not make the transcript visually dominate the report.

==================================================

ACTIONS

==================================================

Add useful actions near the report header:

- Copy report

- Download report

- New meeting

Buttons should be compact and consistent.

==================================================

EMPTY STATE

==================================================

Before any upload, the page should look intentional.

Show:

"Ready to analyze your next meeting."

Subtext:

"Upload a recording and we'll turn the conversation into a clear, actionable report."

==================================================

ERROR STATES

==================================================

Design proper error states for:

- Unsupported file type

- File too large

- Upload failed

- Processing failed

- No speech detected

- Network error

No speech state:

Title:

"No speech detected"

Message:

"We couldn't find intelligible speech in this recording."

Provide:

"Try another recording"

Do not show a fake report.

==================================================

FRONTEND API INTEGRATION

==================================================

The frontend must be structured around my existing FastAPI backend.

Current backend:

FastAPI:

http://127.0.0.1:8000

Endpoint 1:

POST /upload-url

Request:

{

  "filename": "meeting.mp4",

  "content_type": "video/mp4"

}

Response:

{

  "file_id": "...",

  "upload_url": "...",

  "object_key": "meetings/..."

}

The frontend must then upload the actual MP4 directly to the returned Backblaze B2 presigned URL using:

PUT

with:

Content-Type: file.type

body: file

After the B2 upload succeeds, call:

POST /process?object_key=<object_key>

The response looks like:

{

  "message": "Meeting processing completed",

  "transcript": "...",

  "report": "..."

}

The frontend should display the report.

Important:

- Do NOT send the MP4 through FastAPI.

- The MP4 must upload directly from browser to Backblaze B2 using the presigned URL.

- FastAPI is only responsible for generating the URL and processing the uploaded object.

- Keep API logic separate from UI components.

- Put API calls in a small dedicated service/helper file such as:

  src/services/api.js

==================================================

STATE MANAGEMENT

==================================================

Use React hooks.

Track:

- selectedFile

- uploadProgress/state

- processingState

- transcript

- report

- error

Do not add Redux unless truly necessary.

==================================================

UX DETAILS

==================================================

Add:

- drag and drop

- clickable upload area

- disabled states

- loading indicators

- progress feedback

- smooth but subtle transitions

- clear success state

- clear error messages

Do not over-animate the interface.

The UI should feel fast and calm.

==================================================

RESPONSIVE DESIGN

==================================================

Desktop:

- Wide centered layout

- Large hero typography

- Two-column report areas where useful

Tablet:

- Reduce spacing

- Maintain hierarchy

Mobile:

- Single column

- Full-width upload area

- Sticky or easily accessible main action

- Report sections stacked vertically

- No horizontal overflow

==================================================

ACCESSIBILITY

==================================================

Use:

- semantic HTML

- accessible buttons

- proper labels

- keyboard navigation

- visible focus states

- sufficient contrast

- ARIA where necessary

==================================================

DESIGN LANGUAGE

==================================================

Overall personality:

- AI infrastructure

- developer product

- technical

- premium

- minimal

- precise

- fast

- modern

Think:

"AI infrastructure tool meets editorial report."

Avoid:

- generic purple AI gradients

- cartoon illustrations

- excessive rounded cards

- unnecessary charts

- fake statistics

- fake testimonials

- fake customer logos

- pricing section

- authentication UI

- team management UI

These are not needed yet.

==================================================

IMPORTANT IMPLEMENTATION RULES

==================================================

1. Generate a real React application, not static HTML.

2. Make components reusable.

3. Keep API integration functional.

4. Do not use mock reports once API integration is implemented.

5. Use realistic loading/error states.

6. Keep the UI polished even when no data exists.

7. Do not hardcode the report content.

8. The frontend must work with the existing FastAPI API.

9. Use environment variables for the backend URL where practical, for example:

VITE_API_URL=http://127.0.0.1:8000

10. Keep the architecture easy to extend later for:

- authentication

- saved meetings

- database-backed reports

- asynchronous processing

- meeting history

==================================================

FINAL RESULT

==================================================

The finished product should feel like a real AI meeting intelligence application, not a student demo.

The first screen should immediately communicate:

"Upload a meeting → AI processes it → get a clear report."

The most important visual emphasis should be:

1. Upload Meeting

2. Processing pipeline

3. Meeting Summary

4. Action Items

5. Decisions

6. Missed Meeting Brief

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4d02d283-6826-463e-8241-2145bd5a9cb9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
