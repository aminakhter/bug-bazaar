import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from '../mocks/handlers';

export const server = setupServer(...handlers);

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' });
  // Ensure window.fetch and globalThis.fetch point to MSW's patched fetch in jsdom
  window.fetch = globalThis.fetch;
});

afterEach(() => {
  server.resetHandlers();
  window.localStorage.clear();
});

afterAll(() => server.close());