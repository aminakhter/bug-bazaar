# Order Lifecycle & Idempotent Checkout

## Status Flow
1. **`queued`**: Returned immediately (`201 Created`) by `POST /api/orders` once stock validation passes and inventory is decremented.
2. **`processing`**: Warehouse picks and packs items (`GET /api/orders/:id`).
3. **`fulfilled` / `failed`**: Terminal order states.

## Idempotency & Concurrency Guarantees
- **Unique `Idempotency-Key`**: `CartPage` generates one UUID per checkout attempt and sends it in the `Idempotency-Key` header. Retrying a failed network request reuses the same key so the backend returns the original `201` order instead of charging or decrementing stock twice.
- **Stock Conflict (`409 OUT_OF_STOCK`)**: If inventory drops before checkout completes, the API returns `409` with the offending product name, and TanStack Query invalidates `['products']` to refresh catalog stock counts immediately.