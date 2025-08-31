'use client';

import React from 'react';
import { useAuth } from './AuthProvider';

interface AuthGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGate({ children, fallback }: AuthGateProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Redirect to sign-in page
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Access Required
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              You need to be signed in to access this page.
            </p>
          </div>
          <div>
            <a
              href="/auth/sign-in"
              className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Sign in to continue
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
