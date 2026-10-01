# server/AGENTS.md

## Module Context

Bun HTTP proxy that receives prompts from the UI, calls Anthropic or Google with a shared system prompt, and returns code normalized for react-live. The UI reaches it only through the Vite `/api` proxy.

## Tech Stack & Constraints

- Runtime is Bun: `Bun.serve` and `process.env` (server/index.ts:59-62, 138). Bun loads `.env` automatically; do not add dotenv.
- Provider calls use raw `fetch` against the REST APIs (server/index.ts:69, 101), not SDKs. Keep that unless you migrate both providers together.
- Anthropic model: `claude-haiku-4-5-20251001` with `max_tokens: 4096` (server/index.ts:77-78). Google models are tried in priority order from `GOOGLE_MODELS` (server/index.ts:5).

## Implementation Patterns

- New logic that can be pure (parsing, normalization, retry policy) goes into its own module next to `generator.ts` / `fallback.ts` with a colocated `*.test.ts`, then gets imported by `index.ts`.
- Every `Response.json` carries `headers: CORS_HEADERS` (server/index.ts:142-217). New routes must too.
- Error responses are `{ error: string }`. The client shows `data.error` directly (src/hooks/useComponentGenerator.ts:31-32), so write it as a user-readable Korean sentence.

## Testing Strategy

- `bun run test` runs `server/**/*.test.ts` under Vitest (vite.config.ts:20).
- Do not import `server/index.ts` in tests; importing it starts a server on port 3002 (server/index.ts:138).
- `fallback.test.ts` shows the pattern: inject the attempt function with `vi.fn` instead of mocking `fetch`.

## Local Golden Rules

### Asymmetry

- Only the Google path has truncation detection (`finishReason === 'MAX_TOKENS'`, server/index.ts:123-125) and model fallback (server/index.ts:134-136). The Anthropic path has neither and returns truncated text silently. When you touch `callAnthropic`, check `stop_reason === 'max_tokens'` the same way; do not remove the Google checks to "make them consistent".

### Hard Constraint

- Output must run in react-live `noInline` mode (src/components/LivePreview.tsx:69): plain JavaScript, no `import` statements, no TypeScript syntax, and a final `render(<X />)` call. These come from SYSTEM_PROMPT (server/index.ts:11-12, 20). Do not weaken them.
- Status mapping depends on message text: the catch block checks `message.includes('503')` / `'429'` (server/index.ts:194, 201). Provider errors must keep the HTTP status in the thrown message (`Claude API error: ${status}`, server/index.ts:85, 112).

### Double Defense

- Missing `render()`: the prompt requires it (server/index.ts:12), and `ensureRenderCall` injects one if absent (server/generator.ts:16-24). Keep both.
- Markdown fences: the prompt forbids them (server/index.ts:16), and `stripCodeFences` removes them anyway (server/generator.ts:5-10). Keep both.
- Missing key: the UI blocks generation without a key (src/App.tsx:34-35), and the server returns 400 (server/index.ts:169-174). Keep the server check; the client one is advisory.

### Security Boundary

- Key precedence is client key, then env key (server/index.ts:64-66). Never send `ENV_KEYS` values to the client; `/api/config` returns booleans only.
- The Google key is placed in the request URL query (server/index.ts:99). Never log that URL or include it in error messages.
- `Access-Control-Allow-Origin: *` (server/index.ts:52) is acceptable only because the server is meant for local dev behind the Vite proxy. Do not deploy it publicly with env keys set without restricting CORS.
