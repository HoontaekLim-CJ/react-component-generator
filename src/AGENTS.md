# src/AGENTS.md

## Module Context

React 19 UI that sends prompts to `/api/generate`, keeps generated components in memory, and renders each one live through react-live. All network access goes through `src/hooks/useComponentGenerator.ts` and the `/api` proxy.

## Tech Stack & Constraints

- Only runtime dependencies are `react`, `react-dom`, and `react-live` (package.json). No CSS framework, router, or state library; plain CSS in `src/App.css` and `src/index.css`.
- Call the API with relative paths (`/api/...`, src/hooks/useComponentGenerator.ts:23). Never hardcode `http://localhost:3002`.
- Provider, prompt history, and generated components persist in localStorage via `usePersistentState` (src/hooks/usePersistentState.ts). Keys live only in `STORAGE_KEYS` (src/utils/persisted.ts); add new keys there.
- Every persisted value is read through a `parse*` validator in src/utils/persisted.ts that drops malformed entries. New persisted state needs its own validator; never cast `loadJSON` output directly.
- The API key is intentionally not persisted: generated code runs in this same origin (react-live) and could read localStorage. Use the server `.env` key instead.

## Implementation Patterns

- Design tokens are CSS custom properties in `src/index.css:13-26` (`--ink`, `--sheet`, `--nonphoto`, `--annot`, `--blade`, `--redline`, font stacks). Use the tokens; do not introduce new raw hex colors in `App.css`.
- Visual direction is the drafting table: ink outlines, 2px radii, no drop shadows except the generate button's offset shadow, grid only inside `.drawing`. Do not reintroduce card shadows, gradient washes, or uppercase eyebrow labels.
- Each generated component renders as a `.sheet` with a `.title-block` footer (src/components/ComponentCard.tsx). New per-component metadata goes into a title block cell, not a new header.

## Testing Strategy

- `bun run test` runs `src/**/*.test.tsx` in jsdom with `src/test/setup.ts`, which loads jest-dom matchers and runs `cleanup` after each test (src/test/setup.ts:1-8).
- Vitest runs with `css: false` (vite.config.ts:19); never assert on computed styles.
- Query by role and accessible name, as in `src/components/PromptInput.test.tsx`. Those tests pin the button names `컴포넌트 생성` and `생성 중...` and a single textbox; renaming them breaks the tests.

## Local Golden Rules

### Hard Constraint

- Keep `noInline` on `LiveProvider` (src/components/LivePreview.tsx:69). Server output depends on the explicit `render()` call it requires.
- Dimension lines measure `stage.firstElementChild.firstElementChild`, the root of the generated component inside react-live's wrapper div (src/components/LivePreview.tsx:32). Adding a wrapper element around `<ReactLivePreview />` inside `.drawing-stage` breaks measurement.
- `.drawing` scrolls (`overflow: auto`), so measured positions add `drawing.scrollLeft/scrollTop` (src/components/LivePreview.tsx:47-48). Keep that offset if you change the overlay positioning.

### Asymmetry

- Regenerate reuses `handleGenerate` (src/App.tsx), so it goes through the same key check as a fresh prompt. Route any new generate entry point through `handleGenerate`, not `generate` directly.

### Security Boundary

- The client sends `apiKey` only when non-empty (`...(apiKey && { apiKey })`, src/hooks/useComponentGenerator.ts). Keep it that way so the server falls back to the env key.
- The API key input is `type="password"` by default with an explicit show toggle (src/App.tsx). Do not default it to visible.
