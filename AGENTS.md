# AGENTS.md

## Operational Commands

- Package manager and runtime: `bun` only. Do not use npm, yarn, or pnpm (`bun.lock` is the lockfile).
- Dev (API server + Vite together): `bun run dev`
- API server only (watch mode): `bun run server`
- Tests: `bun run test` (Vitest). Watch: `bun run test:watch`
- Lint: `bun run lint`
- Typecheck + build: `bun run build` (runs `tsc -b` then `vite build`)
- Before reporting work as done: `bun run test`, `bun run lint`, and `bun x tsc -b` must all pass.

## Golden Rules

### Immutable

- Run tests with `bun run test`, never `bun test`. `bun test` uses Bun's native runner, which ignores the Vitest jsdom environment and `src/test/setup.ts` (vite.config.ts:16-20); 3 of the 14 tests fail under it.
- API keys live only on the server. `/api/config` exposes only booleans (`!!ENV_KEYS.anthropic`, server/index.ts:150-153); never return, log, or echo key values. Do not add `VITE_`-prefixed key variables, because Vite inlines them into the client bundle.
- `.env` is gitignored (.gitignore:32) and copied into worktrees by `.worktreeinclude`. Never commit it, and never read its values into code or output.
- The Vite proxy target and the Bun server port must match: `http://localhost:3002` (vite.config.ts:11) and `port: 3002` (server/index.ts:139). Change both or neither.

### Do's

- Do keep generated-code normalization in pure functions in `server/generator.ts`. The file is side-effect free so it can be unit-tested (server/generator.ts:1-2); `server/index.ts` starts `Bun.serve` on import and has no tests.
- Do use `import type` for type-only imports. `verbatimModuleSyntax` is on (tsconfig.app.json:14); see src/App.tsx:5.
- Do use only erasable TypeScript syntax (no `enum`, no `namespace`, no parameter properties): `erasableSyntaxOnly` is on (tsconfig.app.json:23).
- Do keep user-facing copy in Korean. Existing UI strings and server error messages are Korean (server/index.ts:124, 196, 203).

### Don'ts

- Don't remove either half of a double defense (see server/AGENTS.md): the system prompt rules and the post-processing in `server/generator.ts` guard the same failures.
- Don't persist the client-entered API key (no localStorage, cookies, or URL). It is held only in React state (src/App.tsx) and cleared on provider switch (src/App.tsx:43).

## Project Context

- Goal: turn a natural-language prompt into a React component and render it live in the browser.
- Stack: React 19, TypeScript, Vite, Bun (API proxy), react-live, Vitest + Testing Library, Anthropic Messages API, Google Gemini API.

## Standards & References

- Setup and feature overview: README.md. Do not duplicate it here.
- Commit format: `<type>: <Korean summary>` with type in `feat | fix | refactor | chore`. Follow `.claude/skills/commit/SKILL.md`.
- Tests are colocated as `*.test.ts(x)` under `src/` or `server/` (vite.config.ts:20); files elsewhere are not picked up.
- Maintenance Policy: if a rule here conflicts with the code (moved line, renamed file, changed port), propose an update to this file in the same change instead of following the stale rule.

## Context Map

- **[API server and AI provider calls (Bun)](./server/AGENTS.md)** — when changing `/api/*` routes, provider calls, the system prompt, model fallback, or response post-processing.
- **[UI, live preview, and design system (React)](./src/AGENTS.md)** — when changing components, react-live preview behavior, styles, or tests under `src/`.
