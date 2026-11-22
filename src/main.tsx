import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import { themeConfig } from './theme/themeConfig';
import App from './App';

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
      <ConfigProvider theme={themeConfig}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConfigProvider>
    </StrictMode>,
  );
});