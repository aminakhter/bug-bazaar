# Engineering Glossary

- **Discriminated Union (`AsyncState<T>`)**: A TypeScript union tagged by `status` (`idle | loading | success | error`) that makes impossible states (like simultaneous loading and error) unrepresentable.
- **Idempotency Key**: A unique client-generated token sent with `POST /api/orders` ensuring repeated submissions of the same checkout attempt produce at most one order.
- **Boundary Validation**: Parsing untrusted network JSON through Zod schemas inside `src/api/client.ts` before data enters React state.
- **Stale-While-Revalidate (`staleTime`)**: TanStack Query caching strategy that serves cached catalog pages immediately for 30 seconds while invalidating automatically after mutations.