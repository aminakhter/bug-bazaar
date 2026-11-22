import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '../api/client';
import { AppApiError, AsyncState, ProductQueryParams, ProductsListResponse } from '../types/api';

export function useProductsQuery(params: ProductQueryParams, forceEmpty = false) {
  const [state, setState] = useState<AsyncState<ProductsListResponse>>({ status: 'idle' });
  const [retryCounter, setRetryCounter] = useState(0);
  const requestSeqRef = useRef(0);

  const retry = useCallback(() => {
    setRetryCounter((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const currentSeq = ++requestSeqRef.current;

    setState({ status: 'loading' });

    apiClient
      .getProducts(params, controller.signal)
      .then((data) => {
        if (controller.signal.aborted || currentSeq !== requestSeqRef.current) {
          return;
        }
        const finalData: ProductsListResponse = forceEmpty ? { items: [], total: 0 } : data;
        setState({ status: 'success', data: finalData });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted || currentSeq !== requestSeqRef.current) {
          return;
        }
        const apiError =
          err instanceof AppApiError
            ? err
            : new AppApiError(500, 'UNKNOWN_ERROR', 'Failed to load products.');
        setState({ status: 'error', error: apiError });
      });

    return () => {
      controller.abort();
    };
  }, [
    params.search,
    params.category,
    params.sort,
    params.page,
    params.inStockOnly,
    forceEmpty,
    retryCounter,
  ]);

  return { state, retry };
}