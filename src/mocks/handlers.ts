import { http, HttpResponse, delay } from 'msw';
import {
  ApiError,
  CreateOrderResponse,
  LoginResponse,
  OrderDetailsResponse,
  ProductCategory,
  ProductSortOption,
  ProductsListResponse,
  User,
} from '../types/api';
import { mockProductStore } from './seedProducts';

const PAGE_SIZE = 24;
const DEMO_TOKEN = 'bb_live_mock_token_2026';
const DEMO_USER: User = {
  id: 'user-01',
  email: 'dev@bugbazaar.io',
  name: 'Ada Debugger',
};

const processedIdempotencyKeys = new Map<string, CreateOrderResponse>();
const ordersStore = new Map<string, OrderDetailsResponse>();

function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: Record<string, string>,
) {
  const payload: ApiError = { error: { code, message, details } };
  return HttpResponse.json(payload, { status });
}

function checkForcedError(request: Request) {
  const forced = request.headers.get('X-Force-Error');
  if (!forced) return null;

  switch (forced) {
    case '400':
      return errorResponse(400, 'VALIDATION_ERROR', 'Invalid request input.', {
        email: 'Please enter a valid developer email address.',
      });
    case '401':
      return errorResponse(401, 'UNAUTHORIZED', 'Your session has expired. Please log in again.');
    case '404':
      return errorResponse(404, 'NOT_FOUND', 'The requested resource could not be found.');
    case '409':
      return errorResponse(409, 'OUT_OF_STOCK', 'Tactile 65% Custom Kit #1 just went out of stock.', {
        productId: 'prod-0001',
      });
    case '500':
      return errorResponse(500, 'INTERNAL_ERROR', 'Simulated backend outage. Please retry.');
    default:
      return null;
  }
}

export const handlers = [
  // GET /api/products
  http.get('/api/products', async ({ request }) => {
    const url = new URL(request.url);
    const searchParam = (url.searchParams.get('search') ?? '').trim();
    const isRaceSimulated = request.headers.get('X-Simulate-Race') === 'true';
    // When simulating out-of-order responses, shorter/earlier queries take longer
    const simulatedDelay = isRaceSimulated ? Math.max(100, 950 - searchParam.length * 180) : 180;
    await delay(simulatedDelay);
    const forced = checkForcedError(request);
    if (forced) return forced;
    const search = (url.searchParams.get('search') ?? '').trim().toLowerCase();
    const category = (url.searchParams.get('category') ?? '') as ProductCategory | '';
    const sort = (url.searchParams.get('sort') ?? '') as ProductSortOption | '';
    const inStockOnly = url.searchParams.get('inStock') === 'true';
    const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);

    let filtered = mockProductStore;

    if (category) {
      filtered = filtered.filter((p) => p.category === category);
    }

    if (inStockOnly) {
      filtered = filtered.filter((p) => p.stock > 0);
    }

    if (search) {
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(search) || p.id.toLowerCase().includes(search),
      );
    }

    if (sort) {
      filtered = [...filtered].sort((a, b) => {
        switch (sort) {
          case 'price_asc':
            return a.price - b.price;
          case 'price_desc':
            return b.price - a.price;
          case 'rating_desc':
            return b.rating - a.rating;
          case 'name_asc':
            return a.name.localeCompare(b.name);
        }
      });
    }

    const total = filtered.length;
    const start = (page - 1) * PAGE_SIZE;
    const items = filtered.slice(start, start + PAGE_SIZE);

    const response: ProductsListResponse = { items, total };
    return HttpResponse.json(response, { status: 200 });
  }),

  // GET /api/products/:id
  http.get('/api/products/:id', async ({ params, request }) => {
    await delay(120);
    const forced = checkForcedError(request);
    if (forced) return forced;

    const product = mockProductStore.find((p) => p.id === params.id);
    if (!product) {
      return errorResponse(404, 'PRODUCT_NOT_FOUND', `Product "${String(params.id)}" does not exist.`);
    }

    return HttpResponse.json(product, { status: 200 });
  }),

  // POST /api/login
  http.post('/api/login', async ({ request }) => {
    await delay(200);
    const forced = checkForcedError(request);
    if (forced) return forced;

    const body = (await request.json()) as { email?: string; password?: string };
    if (!body.email || !body.email.includes('@')) {
      return errorResponse(400, 'INVALID_INPUT', 'Validation failed.', {
        email: 'A valid email address is required.',
      });
    }
    if (!body.password || body.password.length < 4) {
      return errorResponse(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    const response: LoginResponse = {
      token: DEMO_TOKEN,
      user: { ...DEMO_USER, email: body.email },
    };
    return HttpResponse.json(response, { status: 200 });
  }),

  // GET /api/me
  http.get('/api/me', async ({ request }) => {
    await delay(100);
    const forced = checkForcedError(request);
    if (forced) return forced;

    const auth = request.headers.get('Authorization');
    if (auth !== `Bearer ${DEMO_TOKEN}`) {
      return errorResponse(401, 'UNAUTHORIZED', 'Missing or invalid authentication token.');
    }

    return HttpResponse.json(DEMO_USER, { status: 200 });
  }),

  // POST /api/orders
  http.post('/api/orders', async ({ request }) => {
    await delay(250);
    const forced = checkForcedError(request);
    if (forced) return forced;

    const auth = request.headers.get('Authorization');
    if (auth !== `Bearer ${DEMO_TOKEN}`) {
      return errorResponse(401, 'UNAUTHORIZED', 'You must be logged in to place an order.');
    }

    const idempotencyKey = request.headers.get('Idempotency-Key');
    if (idempotencyKey && processedIdempotencyKeys.has(idempotencyKey)) {
      const existing = processedIdempotencyKeys.get(idempotencyKey)!;
      return HttpResponse.json(existing, { status: 201 });
    }

    const body = (await request.json()) as {
      items?: Array<{ productId: string; quantity: number }>;
    };

    if (!body.items || body.items.length === 0) {
      return errorResponse(400, 'EMPTY_ORDER', 'Order must contain at least one item.');
    }

    // Validate stock before decrementing
    for (const item of body.items) {
      const product = mockProductStore.find((p) => p.id === item.productId);
      if (!product) {
        return errorResponse(400, 'UNKNOWN_PRODUCT', `Unknown product ${item.productId}.`);
      }
      if (product.stock < item.quantity) {
        return errorResponse(
          409,
          'OUT_OF_STOCK',
          `${product.name} does not have enough stock (available: ${product.stock}).`,
          { productId: product.id, productName: product.name },
        );
      }
    }

    // Decrement stock
    for (const item of body.items) {
      const product = mockProductStore.find((p) => p.id === item.productId);
      if (product) {
        product.stock -= item.quantity;
      }
    }

    const orderId = `ord-${Date.now()}`;
    const created: CreateOrderResponse = { id: orderId, status: 'queued' };
    ordersStore.set(orderId, { id: orderId, status: 'queued' });
    if (idempotencyKey) {
      processedIdempotencyKeys.set(idempotencyKey, created);
    }

    return HttpResponse.json(created, { status: 201 });
  }),

  // GET /api/orders/:id
  http.get('/api/orders/:id', async ({ params, request }) => {
    await delay(120);
    const forced = checkForcedError(request);
    if (forced) return forced;

    const auth = request.headers.get('Authorization');
    if (auth !== `Bearer ${DEMO_TOKEN}`) {
      return errorResponse(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const order = ordersStore.get(String(params.id));
    if (!order) {
      return errorResponse(404, 'ORDER_NOT_FOUND', 'Order not found.');
    }

    return HttpResponse.json(order, { status: 200 });
  }),
];