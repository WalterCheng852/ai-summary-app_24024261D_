# Copilot Instructions — AI Summary App

Quick, focused guidance to get an AI coding agent productive in this repository.

## Big picture
- Framework: Next.js 13 (app directory) + TypeScript. See `app/` for UI and `app/api/` for server routes.
- Frontend: React client components live under `app/components/` (examples: `DocumentUploader.tsx`, `SummaryGenerator.tsx`).
- Backend: Serverless API routes in `app/api/*` talk directly to Supabase using `createServerSupabase()` from `app/lib/supabase.ts`.
- Data flow: client uploads/extracts raw text -> POST `/api/upload` inserts `documents` record -> `POST /api/summarize` calls AI provider -> stores/updates `summaries` table. See `app/api/upload/route.ts` and `app/api/summarize/route.ts`.

## Critical integration points & secrets
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` are required (see `app/lib/supabase.ts`). The service role key is used server-side only.
- AI providers: primary `GITHUB_MODEL_API_KEY` (GitHub Models), fallback `OPENROUTER_API_KEY` (see `app/lib/github-model-api.ts`). If keys are missing the server will throw or return errors.
- Storage: uploads use Supabase Storage bucket `documents` (see `app/api/upload/route.ts`).

## Project-specific behaviors & gotchas
- PDF handling is client-side only. The server rejects raw PDF files and expects raw extracted text. Check `app/lib/pdf-parser.ts` and the upload route's PDF guard.
- Validation constraints live in `app/lib/validation.ts`: `MAX_FILE_SIZE`, `MAX_TEXT_LENGTH`, allowed MIME types. Follow these limits when modifying upload logic.
- AI call shape: `summarizeWithGitHubModel()` expects a `SummarizeRequest` (text, optional `customPrompt`, `tone`, `maxLength`) and returns `{ summary, provider }` (see `app/lib/github-model-api.ts`).
- Database tables: code assumes `documents` and `summaries` tables with fields used in the routes. Changes to schema must be reflected in the API select/insert statements.

## Common developer workflows
- Run locally:

  cd my-app
  npm install
  npm run dev

- Build / start: `npm run build` then `npm run start` (inside `my-app`).
- Lint: `npm run lint`.

## Patterns to follow when editing or adding features
- Server routes (in `app/api`) are server-side only — use `createServerSupabase()` and avoid leaking service keys to the client.
- Client-side PDF text extraction: perform in the browser using `extractTextFromPDFFile()` from `app/lib/pdf-parser.ts` before sending text to `/api/upload`.
- Error handling: API routes return JSON with `{ error }` fields; helper `app/lib/api-client.ts` contains `safeParseJSON` and `getErrorMessage()` used by client components.

## Useful examples (copy-paste)
- Call summarize API (server-side shape):

  POST /api/summarize
  Body: { "documentId": "<id>", "customPrompt": "...", "tone": "professional", "maxLength": 300 }

- Upload text-only (server accepts JSON):

  POST /api/upload
  Body: { "filename": "notes.txt", "file_type": "raw_text", "raw_text": "..." }

## Where to look first when debugging
- API failures / env checks: `app/lib/supabase.ts` and `app/api/*` routes.
- AI call flow and fallbacks: `app/lib/github-model-api.ts`.
- Client-side PDF issues: `app/lib/pdf-parser.ts` and `public/pdf.worker.min.mjs`.

## Small conventions
- Console logging uses emoji-prefixed messages for important steps (e.g. `console.log('✅ ...')`). Keep logs consistent when adding instrumentation.
- UX copy is in Traditional Chinese (Cantonese); UI strings live in components under `app/`.

If any section is unclear or you'd like more examples (e.g., sample curl requests, or DB schema reference), tell me which part to expand.
