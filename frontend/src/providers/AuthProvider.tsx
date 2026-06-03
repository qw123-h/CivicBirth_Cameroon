import React, { createContext, ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

export const AuthContext = createContext<any>(null);

interface AuthProviderProps {
  children: ReactNode;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export function AuthProvider({ children }: AuthProviderProps) {
  const { accessToken, setUser, logout } = useAuthStore();

  useEffect(() => {
    if (accessToken) {
      api
        .get('/auth/me')
        .then((res) => {
          setUser(res.data.user);
        })
        .catch(() => {
          logout();
        });
    }
  }, [accessToken, setUser, logout]);

  return (
    <AuthContext.Provider value={{ accessToken }}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </AuthContext.Provider>
  );
}
