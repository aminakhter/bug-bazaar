import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { FeedConnectionStatus, StockFeedClient } from '../api/stockFeed';
import { useAppDispatch } from '../store/hooks';
import { syncProductStock } from '../store/cartSlice';
import { ProductsListResponse } from '../types/api';
import { PRODUCTS_QUERY_KEY } from './useProductsQuery';

export function useLiveStockFeed() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const clientRef = useRef<StockFeedClient | null>(null);
  const [status, setStatus] = useState<FeedConnectionStatus>('disconnected');

  useEffect(() => {
    const client = new StockFeedClient();
    clientRef.current = client;

    const unsubscribeStatus = client.onStatusChange(setStatus);
    const unsubscribeStock = client.onStockUpdate((event) => {
      dispatch(syncProductStock({ productId: event.productId, stock: event.stock }));

      queryClient.setQueriesData<ProductsListResponse>(
        { queryKey: [PRODUCTS_QUERY_KEY] },
        (oldData) => {
          if (!oldData) return oldData;
          let changed = false;
          const nextItems = oldData.items.map((item) => {
            if (item.id === event.productId && item.stock !== event.stock) {
              changed = true;
              return { ...item, stock: event.stock };
            }
            return item;
          });
          return changed ? { ...oldData, items: nextItems } : oldData;
        },
      );
    });

    client.connect();

    return () => {
      unsubscribeStatus();
      unsubscribeStock();
      client.disconnect();
      clientRef.current = null;
    };
  }, [dispatch, queryClient]);

  const triggerDrop = () => {
    clientRef.current?.simulateDisconnect();
  };

  return { status, triggerDrop };
}