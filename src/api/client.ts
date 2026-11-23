import { z } from 'zod';
import {
  ApiErrorSchema,
  AppApiError,
  CreateOrderPayload,
  CreateOrderResponse,
  CreateOrderResponseSchema,
  LoginResponse,
  LoginResponseSchema,
  OrderDetailsResponse,
  OrderDetailsResponseSchema,
  Product,
  ProductQueryParams,
  ProductSchema,
  ProductsListResponse,
  ProductsListResponseSchema,
  User,
  UserSchema,
} from '../types/api';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL ?? `${import.meta.env.BASE_URL}api`;
const API_BASE_URL = rawBaseUrl.startsWith('http')
  ? rawBaseUrl
  : `${typeof window !== 'undefined' && window.location.origin !== 'null' ? window.location.origin : 'http://localhost:5173'}${rawBaseUrl}`;

// In-memory auth token store (never stored in localStorage per security rules)
let authToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

// Debug error trigger for testing error states on purpose (D1-2 / D2-3 / D3-4)
export type ForcedErrorCode = 400 | 401 | 404 | 409 | 500 | null;
let forcedErrorCode: ForcedErrorCode = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

export function setForcedErrorCode(code: ForcedErrorCode): void {
  forcedErrorCode = code;
}

export function getForcedErrorCode(): ForcedErrorCode {
  return forcedErrorCode;
}

let simulateRaceCondition = false;

export function setSimulateRaceCondition(enabled: boolean): void {
  simulateRaceCondition = enabled;
}

export function getSimulateRaceCondition(): boolean {
  return simulateRaceCondition;
}

interface RequestOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
  signal?: AbortSignal;
  extraHeaders?: Record<string, string>;
}

async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...options.extraHeaders,
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (forcedErrorCode !== null) {
    headers['X-Force-Error'] = String(forcedErrorCode);
  }

  if (simulateRaceCondition) {
    headers['X-Simulate-Race'] = 'true';
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  

  const rawText = await response.text();
  let parsedJson: unknown = null;

  if (rawText.length > 0) {
    try {
      parsedJson = JSON.parse(rawText) as unknown;
    } catch {
      throw new AppApiError(response.status, 'INVALID_JSON', 'Server returned malformed JSON.');
    }
  }

  if (!response.ok) {
    if (response.status === 401 && unauthorizedHandler) {
      unauthorizedHandler();
    }

    const parsedError = ApiErrorSchema.safeParse(parsedJson);
    if (parsedError.success) {
      const { code, message, details } = parsedError.data.error;
      throw new AppApiError(response.status, code, message, details);
    }

    throw new AppApiError(
      response.status,
      `HTTP_${response.status}`,
      'An unexpected server error occurred.',
    );
  }

  const validated = schema.safeParse(parsedJson);
  if (!validated.success) {
    throw new AppApiError(502, 'CONTRACT_VIOLATION', 'API response did not match expected schema.');
  }

  return validated.data;
}

export const apiClient = {
  getProducts(params: ProductQueryParams = {}, signal?: AbortSignal): Promise<ProductsListResponse> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.category) query.set('category', params.category);
    if (params.sort) query.set('sort', params.sort);
    if (params.page && params.page > 1) query.set('page', String(params.page));
    if (params.inStockOnly) query.set('inStock', 'true');

    const queryString = query.toString();
    const path = queryString ? `/products?${queryString}` : '/products';
    return request(path, ProductsListResponseSchema, { signal });
  },

  getProductById(id: string, signal?: AbortSignal): Promise<Product> {
    return request(`/products/${encodeURIComponent(id)}`, ProductSchema, { signal });
  },

  login(email: string, password: string, signal?: AbortSignal): Promise<LoginResponse> {
    return request('/login', LoginResponseSchema, {
      method: 'POST',
      body: { email, password },
      signal,
    });
  },

  getMe(signal?: AbortSignal): Promise<User> {
    return request('/me', UserSchema, { signal });
  },

  createOrder(payload: CreateOrderPayload, signal?: AbortSignal): Promise<CreateOrderResponse> {
    return request('/orders', CreateOrderResponseSchema, {
      method: 'POST',
      body: { items: payload.items },
      extraHeaders: { 'Idempotency-Key': payload.idempotencyKey },
      signal,
    });
  },

  getOrderById(id: string, signal?: AbortSignal): Promise<OrderDetailsResponse> {
    return request(`/orders/${encodeURIComponent(id)}`, OrderDetailsResponseSchema, { signal });
  },
};