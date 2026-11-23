# System Architecture — The Bug Bazaar

## Layered Module Structure
- **`src/types/api.ts`**: Runtime Zod schemas (`ProductSchema`, `ApiErrorSchema`, response validators) and discriminated `AsyncState<T>` unions preventing impossible UI states.
- **`src/api/client.ts` & `src/api/stockFeed.ts`**: Single centralized HTTP boundary (handling auth headers, `AbortSignal`, error normalization, and schema validation) plus the auto-reconnecting live stock stream.
- **`src/store/`**: Redux Toolkit slices for client-only state (`cartSlice` persisted to `localStorage`, `authSlice` kept strictly in memory).
- **`src/hooks/`**: Data-fetching and UI hooks (`useProductsQuery` backed by TanStack Query `staleTime: 30s`, `useLiveStockFeed`, `useDebouncedValue`, `useLocalStorage`).
- **`src/features/`**: Domain-grouped UI modules (`browse/`, `cart/`, `auth/`) built strictly with Ant Design components and BEM SCSS modules.