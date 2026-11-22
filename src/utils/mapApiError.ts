import { AppApiError } from '../types/api';

export interface MappedUiError {
  title: string;
  description: string;
  fieldErrors: Record<string, string>;
  canRetry: boolean;
  isNotFound: boolean;
  isOutOfStock: boolean;
}

export function mapApiError(error: unknown): MappedUiError {
  if (error instanceof AppApiError) {
    switch (error.httpStatus) {
      case 400:
        return {
          title: 'Please check your input',
          description: error.message || 'Some fields need correction before continuing.',
          fieldErrors: error.details ?? {},
          canRetry: false,
          isNotFound: false,
          isOutOfStock: false,
        };
      case 401:
        return {
          title: 'Session expired',
          description: 'Please log in again to continue.',
          fieldErrors: {},
          canRetry: false,
          isNotFound: false,
          isOutOfStock: false,
        };
      case 404:
        return {
          title: 'Not found',
          description: error.message || 'The item or page you requested does not exist.',
          fieldErrors: {},
          canRetry: false,
          isNotFound: true,
          isOutOfStock: false,
        };
      case 409: {
        const outOfStockItem = error.details?.productName;
        return {
          title: 'Item out of stock',
          description: outOfStockItem
            ? `"${outOfStockItem}" does not have enough stock remaining. Please update your cart.`
            : error.message || 'One or more items in your cart ran out of stock.',
          fieldErrors: error.details ?? {},
          canRetry: false,
          isNotFound: false,
          isOutOfStock: true,
        };
      }
      default:
        return {
          title: 'Server temporarily unavailable',
          description: 'Something went wrong on our end. Please try again.',
          fieldErrors: {},
          canRetry: true,
          isNotFound: false,
          isOutOfStock: false,
        };
    }
  }

  return {
    title: 'Unexpected error',
    description: 'Unable to complete the request. Please try again.',
    fieldErrors: {},
    canRetry: true,
    isNotFound: false,
    isOutOfStock: false,
  };
}