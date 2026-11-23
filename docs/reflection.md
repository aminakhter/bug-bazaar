# Project Reflection

## What Went Well
- Centralizing all `fetch` calls and Zod validation in `src/api/client.ts` kept components clean and made HTTP error mapping (`400`, `401`, `404`, `409`, `500`) uniform across the app.
- Combining URL-synced filters (`useSearchParams`) with `AbortController` and TanStack Query made browsing 5,000 products fast and resilient to rapid typing.

## What Would Be Improved Next
- Replace the simulated WebSocket timer in `src/api/stockFeed.ts` with a real backend WebSocket/SSE endpoint and add end-to-end Playwright tests against a staging deployment.