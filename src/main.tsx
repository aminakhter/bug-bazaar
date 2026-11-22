import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store/store';
import { themeConfig } from './theme/themeConfig';
import App from './App';
import { AppErrorBoundary } from './components/AppErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

async function enableMocking(): Promise<void> {
  const shouldMock = import.meta.env.VITE_ENABLE_MOCK_API !== 'false';
  if (!shouldMock) return;

  const { worker } = await import('./mocks/browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

void enableMocking().then(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ConfigProvider theme={themeConfig}>
            <BrowserRouter>
              <AppErrorBoundary>
                <App />
              </AppErrorBoundary>
            </BrowserRouter>
          </ConfigProvider>
        </QueryClientProvider>
      </Provider>
    </StrictMode>,
  );
});