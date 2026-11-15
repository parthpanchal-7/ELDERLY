import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 minutes
      gcTime: 1000 * 60 * 10,         // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && 'response' in error) {
          const axiosError = error as { response?: { status?: number } };
          const status = axiosError.response?.status;
          if (status && status >= 400 && status < 500) return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: false,
    },
  },
});
