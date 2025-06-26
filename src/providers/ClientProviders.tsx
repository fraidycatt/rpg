'use client'; // This is the crucial directive! It marks this as a client boundary.

import { AuthProvider } from '@/context/AuthContext';
import { ReactNode } from 'react';

// This component's only job is to render the client-side providers.
export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}