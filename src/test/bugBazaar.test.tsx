import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer, {
  addToCart,
  clearCart,
  removeFromCart,
  selectCartSubtotalCents,
  selectCartTotalCount,
  updateCartQuantity,
} from '../store/cartSlice';
import authReducer from '../store/authSlice';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { formatPrice } from '../utils/formatPrice';
import { Product } from '../types/api';
import App from '../App';
import { server } from './setup';

const sampleDuck: Product = {
  id: 'prod-0002',
  name: 'Async Stack-Trace Duck #2',
  price: 1500,
  category: 'ducks',
  stock: 3,
  rating: 4.8,
  imageUrl: 'https://example.com/duck.png',
};

const sampleKeyboard: Product = {
  id: 'prod-0001',
  name: 'Tactile 65% Custom Kit #1',
  price: 12000,
  category: 'keyboards',
  stock: 2,
  rating: 4.9,
  imageUrl: 'https://example.com/kb.png',
};

function createTestStore() {
  return configureStore({
    reducer: {
      cart: cartReducer,
      auth: authReducer,
    },
  });
}

function renderApp(initialEntries: string[] = ['/']) {
  const store = createTestStore();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return {
    store,
    ...render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={initialEntries}>
            <App />
          </MemoryRouter>
        </QueryClientProvider>
      </Provider>,
    ),
  };
}

async function submitLoginForm(): Promise<void> {
  await screen.findByText(/Developer Sign In/i, {}, { timeout: 8000 });
  const signInButtons = screen.getAllByRole('button', { name: /sign in/i });
  const submitButton = signInButtons.find((btn) => btn.getAttribute('type') === 'submit');
  const form = submitButton?.closest('form');
  if (!form) {
    throw new Error('Login form not found');
  }
  fireEvent.submit(form);
}

describe('Cart Redux Logic & Derived Selectors (D3-1, D3-2)', () => {
  it('1. adds items and calculates derived total count and subtotal in cents', () => {
    const store = createTestStore();
    store.dispatch(addToCart({ product: sampleDuck, quantity: 2 }));
    store.dispatch(addToCart({ product: sampleKeyboard, quantity: 1 }));

    expect(selectCartTotalCount(store.getState())).toBe(3);
    expect(selectCartSubtotalCents(store.getState())).toBe(15000);
  });

  it('2. caps cart quantity at available product stock', () => {
    const store = createTestStore();
    store.dispatch(addToCart({ product: sampleDuck, quantity: 10 }));
    expect(store.getState().cart.items[0]?.quantity).toBe(3);
  });

  it('3. updates item quantity and removes item when quantity becomes 0', () => {
    const store = createTestStore();
    store.dispatch(addToCart({ product: sampleDuck, quantity: 2 }));
    store.dispatch(updateCartQuantity({ productId: sampleDuck.id, quantity: 1 }));
    expect(selectCartTotalCount(store.getState())).toBe(1);

    store.dispatch(updateCartQuantity({ productId: sampleDuck.id, quantity: 0 }));
    expect(selectCartTotalCount(store.getState())).toBe(0);
  });

  it('4. removes an item directly and clears cart', () => {
    const store = createTestStore();
    store.dispatch(addToCart({ product: sampleDuck }));
    store.dispatch(addToCart({ product: sampleKeyboard }));
    store.dispatch(removeFromCart(sampleDuck.id));
    expect(selectCartTotalCount(store.getState())).toBe(1);

    store.dispatch(clearCart());
    expect(selectCartTotalCount(store.getState())).toBe(0);
  });

  it('5. formats integer cents into USD currency strings accurately', () => {
    expect(formatPrice(1999)).toBe('$19.99');
    expect(formatPrice(0)).toBe('$0.00');
  });
});

describe('Custom Hooks Behavior (D2-5)', () => {
  it('6. useDebouncedValue delays updating value until timer expires', async () => {
    const { result, rerender } = renderHook(({ val }) => useDebouncedValue(val, 50), {
      initialProps: { val: 'key' },
    });

    expect(result.current).toBe('key');
    rerender({ val: 'keyboard' });
    expect(result.current).toBe('key');

    await act(async () => {
      await new Promise((r) => setTimeout(r, 80));
    });
    expect(result.current).toBe('keyboard');
  });

  it('7. useLocalStorage persists updates to window.localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test_pref', 'light'));
    expect(result.current[0]).toBe('light');

    act(() => {
      result.current[1]('dark');
    });

    expect(result.current[0]).toBe('dark');
    expect(window.localStorage.getItem('test_pref')).toBe('"dark"');
  });
});

describe('Catalog Browsing & Filtering (D2-1, D2-2)', () => {
  it('8. renders seeded products from the API with formatted prices', async () => {
    renderApp(['/']);
    expect(
      await screen.findByText(/Async Linear Switch Pack #1/i, {}, { timeout: 4000 }),
    ).toBeInTheDocument();
  });

  it('9. filters products when URL search query is provided', async () => {
    renderApp(['/?search=Segfault']);
    expect(
      await screen.findByText(/Recursive Captain Segfault Duck #2/i, {}, { timeout: 4000 }),
    ).toBeInTheDocument();
  });

  it('10. shows Clear button when filters are active and resets results', async () => {
    renderApp(['/?search=Segfault']);
    const clearBtn = await screen.findByRole('button', { name: /clear/i }, { timeout: 4000 });
    fireEvent.click(clearBtn);
    expect(
      await screen.findByText(/Async Linear Switch Pack #1/i, {}, { timeout: 4000 }),
    ).toBeInTheDocument();
  });

  it('11. renders 404 Not Found page on unknown route', async () => {
    renderApp(['/non-existent-route']);
    expect(await screen.findByText(/404/i, {}, { timeout: 4000 })).toBeInTheDocument();
  });
});

describe('Authentication & Protected Routes (D3-3)', () => {
  it('12. redirects unauthenticated user from /account to /login', async () => {
    renderApp(['/account']);
    expect(
      await screen.findByText(/Developer Sign In/i, {}, { timeout: 4000 }),
    ).toBeInTheDocument();
  });

  it('13. logs in user and navigates back to intended protected page', async () => {
    renderApp(['/account']);
    await submitLoginForm();

    expect(
      await screen.findByText(/Developer Account/i, {}, { timeout: 4000 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/dev@bugbazaar.io/i)).toBeInTheDocument();
  });
});

describe('Checkout Flow & Error Handling (D3-2, D3-4)', () => {
  it('14. completes checkout with 201 order confirmation and clears cart', async () => {
    const { store } = renderApp(['/login']);
    await submitLoginForm();
    await screen.findByText(/Async Linear Switch Pack #1/i, {}, { timeout: 4000 });

    act(() => {
      store.dispatch(addToCart({ product: sampleDuck, quantity: 1 }));
    });

    fireEvent.click(screen.getByRole('link', { name: /Cart with 1 items/i }));
    const placeOrderBtn = await screen.findByRole(
      'button',
      { name: /Place Order/i },
      { timeout: 4000 },
    );
    fireEvent.click(placeOrderBtn);

    expect(await screen.findByText(/Order Queued!/i, {}, { timeout: 4000 })).toBeInTheDocument();
    expect(selectCartTotalCount(store.getState())).toBe(0);
  });

  it('15. displays specific out-of-stock item message on 409 conflict', async () => {
    server.use(
      http.post('*/api/orders', () =>
        HttpResponse.json(
          {
            error: {
              code: 'OUT_OF_STOCK',
              message: 'Out of stock',
              details: { productName: 'Async Stack-Trace Duck #2' },
            },
          },
          { status: 409 },
        ),
      ),
    );

    const { store } = renderApp(['/login']);
    await submitLoginForm();
    await screen.findByText(/Async Linear Switch Pack #1/i, {}, { timeout: 4000 });

    act(() => {
      store.dispatch(addToCart({ product: sampleDuck, quantity: 1 }));
    });

    fireEvent.click(screen.getByRole('link', { name: /Cart with 1 items/i }));
    fireEvent.click(
      await screen.findByRole('button', { name: /Place Order/i }, { timeout: 4000 }),
    );

    expect(
      await screen.findByText(/Item out of stock/i, {}, { timeout: 4000 }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Async Stack-Trace Duck #2/i).length).toBeGreaterThan(0);
  });

  it('16. displays retryable error alert on 500 server failure', async () => {
    server.use(
      http.get('*/api/products', () =>
        HttpResponse.json(
          { error: { code: 'INTERNAL_ERROR', message: 'Database down' } },
          { status: 500 },
        ),
      ),
    );

    renderApp(['/']);
    await waitFor(
      () => {
        expect(screen.getByText(/Server temporarily unavailable/i)).toBeInTheDocument();
      },
      { timeout: 4000 },
    );
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
  });
});