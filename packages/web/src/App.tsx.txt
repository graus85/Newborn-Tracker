import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/providers/AuthProvider';
import { PWAProvider } from '@/providers/PWAProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Layout } from '@/components/Layout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Lazy load pages for code splitting
const DailyLogPage = React.lazy(() => import('@/pages/DailyLogPage'));
const SummaryPage = React.lazy(() => import('@/pages/SummaryPage'));
const MorePage = React.lazy(() => import('@/pages/MorePage'));
const AuthPage = React.lazy(() => import('@/pages/AuthPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60, // 1 hour
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors
        if (error?.status === 401) return false;
        return failureCount < 3;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <PWAProvider>
              <Router>
                <div className="app">
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/*" element={<Layout />}>
                        <Route index element={<DailyLogPage />} />
                        <Route path="summary" element={<SummaryPage />} />
                        <Route path="more" element={<MorePage />} />
                      </Route>
                    </Routes>
                  </Suspense>
                  <Toaster
                    position="top-center"
                    reverseOrder={false}
                    gutter={8}
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: 'var(--color-surface)',
                        color: 'var(--color-text)',
                        border: '1px solid var(--color-border)',
                      },
                    }}
                  />
                </div>
              </Router>
            </PWAProvider>
          </AuthProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
