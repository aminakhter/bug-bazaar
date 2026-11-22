# The Bug Bazaar — Engineering & AI Guidelines

- **Scored Training Project:** Every line of code must be explainable by the engineer during the walkthrough.
- **Git Discipline:** At least one commit per task starting with the task ID (e.g., `D1-1: setup strict TypeScript and Ant Design theme`).
- **Documentation:** Record architectural/library choices in `docs/decisions.md` and notable AI usage in `docs/ai-notes.md`.
- **Shared API Contract:** Stay strictly on the documented endpoints and types. Prices are stored and transmitted in **cents** (integer) and formatted to dollars only at display time.
- **Strict TypeScript:** `strict: true` is mandatory. Zero `any`, zero `@ts-ignore`, and zero disabled ESLint rules.
- **Data Layer Boundary:** Components never call `fetch` or `axios`. All HTTP requests go through `src/api/client.ts`.
- **Security Baseline:**
  - Never store secrets in source or `VITE_` environment variables.
  - Store auth tokens in memory only (Redux state), never `localStorage` or `sessionStorage`. Cart persistence in `localStorage` is allowed.
  - Never use `dangerouslySetInnerHTML`.
  - Validate all API payloads at the boundary with Zod.
  - Checkout requests must include a unique idempotency key so retries never create duplicate orders.
  - Never log auth tokens or raw unredacted API error bodies.
- **Mandatory UI Rules:** Before creating or modifying any UI component or stylesheet, read and follow `UI.md`.