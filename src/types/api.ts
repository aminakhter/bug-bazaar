import { z } from 'zod';

export const ProductCategorySchema = z.enum(['keyboards', 'ducks', 'coffee', 'stickers']);
export type ProductCategory = z.infer<typeof ProductCategorySchema>;

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().int().nonnegative(), // Stored in cents
  category: ProductCategorySchema,
  stock: z.number().int().nonnegative(),
  rating: z.number().min(0).max(5),
  imageUrl: z.string(),
});
export type Product = z.infer<typeof ProductSchema>;

export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.string(), z.string()).optional(),
  }),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

export const ProductsListResponseSchema = z.object({
  items: z.array(ProductSchema),
  total: z.number().int().nonnegative(),
});
export type ProductsListResponse = z.infer<typeof ProductsListResponseSchema>;

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
});
export type User = z.infer<typeof UserSchema>;

export const LoginResponseSchema = z.object({
  token: z.string(),
  user: UserSchema,
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const OrderStatusSchema = z.enum(['queued', 'processing', 'fulfilled', 'failed']);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const CreateOrderResponseSchema = z.object({
  id: z.string(),
  status: z.literal('queued'),
});
export type CreateOrderResponse = z.infer<typeof CreateOrderResponseSchema>;

export const OrderDetailsResponseSchema = z.object({
  id: z.string(),
  status: OrderStatusSchema,
});
export type OrderDetailsResponse = z.infer<typeof OrderDetailsResponseSchema>;

export type ProductSortOption = 'price_asc' | 'price_desc' | 'rating_desc' | 'name_asc';

export interface ProductQueryParams {
  search?: string;
  category?: ProductCategory | '';
  sort?: ProductSortOption | '';
  page?: number;
  inStockOnly?: boolean;
}

export interface CreateOrderPayload {
  items: Array<{ productId: string; quantity: number }>;
  idempotencyKey: string;
}

/**
 * Discriminated union modeling request states so impossible states
 * (e.g., loading=true while error is populated) cannot be represented.
 */
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: AppApiError };

export class AppApiError extends Error {
  public readonly httpStatus: number;
  public readonly code: string;
  public readonly details?: Record<string, string>;

  constructor(httpStatus: number, code: string, message: string, details?: Record<string, string>) {
    super(message);
    this.name = 'AppApiError';
    this.httpStatus = httpStatus;
    this.code = code;
    this.details = details;
  }
}