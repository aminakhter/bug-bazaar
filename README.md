# Bug Bazaar

Bug Bazaar is a React and TypeScript storefront for developer gear, including keyboards, rubber ducks, coffee, and stickers. It demonstrates catalog browsing, filtering, authentication, shopping-cart behavior, checkout, live stock updates, error handling, and reusable UI patterns.

The application uses an in-browser mock API, so it can run without a backend.

## Features

- Search, category, stock, sorting, and pagination controls
- Debounced URL-synchronized catalog search
- Product details and responsive Ant Design product cards
- Redux Toolkit cart with persisted cart items
- Stock limits and live stock synchronization
- Demo login and protected account route
- Idempotent checkout with order confirmation
- Retryable API and out-of-stock error states
- Zod validation for API payloads
- React Error Boundary fallback
- QA controls for empty catalog and simulated API failures

## Tech Stack

- React 18
- TypeScript 5
- Vite 5
- Ant Design 5
- Redux Toolkit
- TanStack React Query
- React Router
- Zod
- MSW (Mock Service Worker)
- Vitest and Testing Library
- SCSS

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Install and Run

```bash
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

### Production Build

```bash
npm run build
npm run preview
```

### Deploy to GitHub Pages

The GitHub Actions workflow deploys the `main` branch to:

<https://aminakhter.github.io/bug-bazaar/>

Push or merge a change to `main` to start deployment. You can also run the workflow manually from the repository's **Actions** tab. In GitHub, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**.

The production build uses the `/bug-bazaar/` base path so Vite assets, React Router routes, the MSW worker, and the mock API work beneath the repository name. The workflow adds a `404.html` fallback for direct navigation to client-side routes. If the repository is renamed, update the base path in `vite.config.ts` and the Pages URL in this README.

## Demo Login

Use these credentials on the Sign In page:

- Email: `dev@bugbazaar.io`
- Password: `password123`

Authentication is kept in memory only. A page reload clears the current session.

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create a production build |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | Run TypeScript checking |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run format` | Format source TypeScript, TSX, SCSS, JSON, and Markdown files |

## Mock API

MSW intercepts `/api/*` requests in development and tests. The mock service provides deterministic seeded data and the following endpoints:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/products` | Search and filter products |
| `GET` | `/api/products/:id` | Get product details |
| `POST` | `/api/login` | Sign in and receive a demo token |
| `GET` | `/api/me` | Get the authenticated demo user |
| `POST` | `/api/orders` | Create an order |
| `GET` | `/api/orders/:id` | Get order status |

All prices are stored and transmitted as integer cents. For example, `1999` represents `$19.99`.

The QA toolbar can force empty results or HTTP error statuses. Error simulation can also be configured from `src/api/client.ts`.

## Project Structure

```text
src/
  api/                 API client and stock feed
  components/          Shared UI and error/loading components
  features/
    auth/              Login and protected account pages
    browse/            Catalog, filters, cards, and product details
    cart/              Cart and checkout
  hooks/               Query and reusable custom hooks
  mocks/               MSW handlers and deterministic product data
  store/               Redux store, cart, and auth slices
  theme/               Ant Design theme configuration
  types/               Zod schemas and shared API types
  utils/               Currency and API error helpers
  test/                Vitest setup and integration tests
docs/                  API, authentication, and architecture notes
public/                MSW browser worker
```

## Architecture

### Data and HTTP

Components do not call `fetch` or `axios` directly. HTTP requests pass through [src/api/client.ts](src/api/client.ts), which also:

- Adds the in-memory authorization token
- Adds forced-error and race-condition headers
- Maps malformed or unsuccessful responses
- Validates successful payloads with Zod
- Creates HTTP requests with an idempotency header for checkout

### State

- Redux Toolkit owns authentication state and the shopping cart.
- TanStack Query owns server-side catalog and product query state.
- URL search parameters own catalog filters and pagination.
- Cart items are the only application data persisted to `localStorage`.

### UI

The interface uses Ant Design components, BEM-style SCSS class names, and the Ant Design responsive grid. Global theme tokens are defined in [src/theme/themeToken.ts](src/theme/themeToken.ts).

## Testing

Run the test suite with:

```bash
npm test
```

The suite verifies:

- Cart reducers and derived totals
- Quantity limits and cart persistence behavior
- Debounced values and local-storage hooks
- Catalog search and clearing filters
- Protected routes and login redirects
- Successful and failed checkout flows

MSW is started through [src/test/setup.ts](src/test/setup.ts), and browser and Node requests use the same mock handlers.

## Environment Variables

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `/api` | API base URL |
| `VITE_ENABLE_MOCK_API` | `true` | Enable or disable the browser MSW worker |

Never store secrets or bearer tokens in `VITE_*` variables.

## Documentation

- [API contract](docs/api-contract.md)
- [Authentication decisions](docs/auth.md)
- [Architecture decisions](docs/decisions.md)
- [UI standards](UI.md)

<!-- verify CI workflow on pull request -->