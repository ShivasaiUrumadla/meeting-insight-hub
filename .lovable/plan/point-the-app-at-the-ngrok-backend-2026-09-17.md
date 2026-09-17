# Point the app at the ngrok backend

The user's FastAPI backend is now reachable at `https://bakery-very-shuffle.ngrok-free.dev`. Wire the frontend to it.

## Changes

1. **Create `.env` in the project root** with:
   ```
   VITE_API_URL=https://bakery-very-shuffle.ngrok-free.dev
   ```
   - The code (`src/services/api.ts`) reads `import.meta.env["VITE_API_URL"]` — the `VITE_` prefix is required for Vite to expose it to the browser, so a plain `API_URL` would be ignored. Keep the existing `http://127.0.0.1:8000` fallback untouched.

2. **Handle ngrok's free-tier interstitial.** Free ngrok URLs serve a browser warning page on plain browser requests, which would break the `fetch` calls to `/upload-url` and `/process`. Add the `ngrok-skip-browser-warning: true` header to those two requests in `src/services/api.ts` (harmless when the backend is reached directly at `127.0.0.1`).

3. **Restart the dev server** so Vite picks up the new env file, then verify via Playwright that the app loads and that an upload attempt now reaches the ngrok URL (instead of failing on `127.0.0.1`).

## Notes

- The presigned `PUT` goes browser → Backblaze directly, so ngrok is only in the path for the two JSON calls.
- No report content is mocked; a real report still requires the backend to respond successfully.
