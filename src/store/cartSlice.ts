import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../types/api';
import type { RootState } from './store';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

const CART_STORAGE_KEY = 'bug_bazaar_cart_v1';

function loadInitialCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

function persistCart(items: CartItem[]): void {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage quota errors
  }
}

const initialState: CartState = {
  items: loadInitialCart(),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<{ product: Product; quantity?: number }>) {
      const { product, quantity = 1 } = action.payload;
      if (product.stock <= 0) return;

      const existing = state.items.find((item) => item.product.id === product.id);
      if (existing) {
        existing.product = product;
        existing.quantity = Math.min(product.stock, existing.quantity + quantity);
      } else {
        state.items.push({
          product,
          quantity: Math.min(product.stock, Math.max(1, quantity)),
        });
      }
      persistCart(state.items);
    },

    updateCartQuantity(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      const { productId, quantity } = action.payload;
      const index = state.items.findIndex((item) => item.product.id === productId);
      if (index === -1) return;

      if (quantity <= 0) {
        state.items.splice(index, 1);
      } else {
        const current = state.items[index];
        if (current) {
          current.quantity = Math.min(current.product.stock, quantity);
        }
      }
      persistCart(state.items);
    },

    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.product.id !== action.payload);
      persistCart(state.items);
    },

    syncProductStock(state, action: PayloadAction<{ productId: string; stock: number }>) {
      const item = state.items.find((entry) => entry.product.id === action.payload.productId);
      if (!item) return;
      item.product.stock = action.payload.stock;
      if (item.quantity > action.payload.stock && action.payload.stock > 0) {
        item.quantity = action.payload.stock;
      }
      persistCart(state.items);
    },

    clearCart(state) {
      state.items = [];
      persistCart(state.items);
    },
  },
});

export const { addToCart, updateCartQuantity, removeFromCart, syncProductStock, clearCart } =
  cartSlice.actions;

// Memoized derived selectors
export const selectCartItems = (state: RootState): CartItem[] => state.cart.items;

export const selectCartTotalCount = createSelector([selectCartItems], (items): number =>
  items.reduce((sum, item) => sum + item.quantity, 0),
);

export const selectCartSubtotalCents = createSelector([selectCartItems], (items): number =>
  items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
);

export default cartSlice.reducer;