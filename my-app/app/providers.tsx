'use client';

import { AuthProvider } from '@/app/lib/auth-context';
import { ReactNode } from 'react';

export function RootClientProviders({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
