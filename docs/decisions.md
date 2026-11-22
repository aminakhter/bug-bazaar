# Engineering & Architecture Decisions

## D1-2: Mock Service Worker (MSW) + Seeded Data
- **Chosen:** MSW (`msw/browser` and `msw/node`) with 5,000 deterministically generated products.
- **Considered:** Hardcoded JSON imports or a separate Express server.
- **Why:** MSW intercepts real `fetch` calls at the network layer, allowing the exact same handlers to power both local development and Vitest integration tests while testing true HTTP status codes, headers, and `AbortController` cancellation.

## D1-3: Zod Boundary Validation & Discriminated Unions
- **Chosen:** Zod schemas in `src/types/api.ts` paired with `AsyncState<T>` discriminated unions.
- **Considered:** TypeScript `as` type assertions and boolean flags (`isLoading`, `isError`).
- **Why:** TypeScript types disappear at runtime; Zod guarantees malformed payloads fail fast at the network boundary. Discriminated unions prevent impossible UI states (such as simultaneous loading and error states).

## D1-4: Native `fetch` Wrapper over Axios
- **Chosen:** Centralized `src/api/client.ts` built on native `fetch`.
- **Considered:** Axios.
- **Why:** With only 6 endpoints, native `fetch` has zero bundle overhead, integrates natively with `AbortSignal` for stale search cancellation, and keeps HTTP status mapping transparent.