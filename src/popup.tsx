import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { App } from './app';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const app = createRoot(document.querySelector('#root') as Element, {});

app.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
);
