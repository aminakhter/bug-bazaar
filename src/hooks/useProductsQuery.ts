import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { AppApiError, AsyncState, ProductQueryParams, ProductsListResponse } from '../types/api';

export const PRODUCTS_QUERY_KEY = 'products';

export function useProductsQuery(params: ProductQueryParams, forceEmpty = false) {
  const query = useQuery<ProductsListResponse, AppApiError>({
    queryKey: [
      PRODUCTS_QUERY_KEY,
      params.search ?? '',
      params.category ?? '',
      params.sort ?? '',
      params.page ?? 1,
      params.inStockOnly ?? false,
      forceEmpty,
    ],
    queryFn: async ({ signal }) => {
      const data = await apiClient.getProducts(params, signal);
      return forceEmpty ? { items: [], total: 0 } : data;
    },
    staleTime: 30_000,
    retry: false,
  });

  let state: AsyncState<ProductsListResponse>;
  if (query.isPending) {
    state = { status: 'loading' };
  } else if (query.isError) {
    state = { status: 'error', error: query.error };
  } else if (query.isSuccess) {
    state = { status: 'success', data: query.data };
  } else {
    state = { status: 'idle' };
  }

  return {
    state,
    retry: () => {
      void query.refetch();
    },
  };
}