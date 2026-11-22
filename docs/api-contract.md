# Shared API Contract

All monetary values (`price`) are integers stored and transmitted in **cents** (e.g., `1999` = `$19.99`).

## Endpoints

| Method | Endpoint | Success | Errors |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products?search=&category=&sort=&page=&inStock=` | `200 { items: Product[], total: number }` | `500` |
| `GET` | `/api/products/:id` | `200 Product` | `404` |
| `POST` | `/api/login` | `200 { token: string, user: User }` | `400`, `401` |
| `GET` | `/api/me` | `200 User` | `401` |
| `POST` | `/api/orders` | `201 { id: string, status: "queued" }` | `400`, `401`, `409` |
| `GET` | `/api/orders/:id` | `200 { id: string, status: OrderStatus }` | `401`, `404` |

## Error Simulation
Call `setForcedErrorCode(400 | 401 | 404 | 409 | 500 | null)` in `src/api/client.ts` (or via the debug toolbar) to attach `X-Force-Error` and trigger any documented error status deterministically.