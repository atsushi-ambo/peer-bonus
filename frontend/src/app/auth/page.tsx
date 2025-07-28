'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/LoginForm';
import { RegisterForm } from '@/components/RegisterForm';
import AppShell from '@/components/AppShell';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to home if already logged in
    if (!loading && isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, loading, router]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render form if already logged in (while redirect is happening)
  if (isLoggedIn) {
    return null;
  }

  return (
    <AppShell requireAuth={false}>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Peer Bonus</h1>
            <p className="mt-2 text-gray-600">
              Celebrate achievements and share appreciation with your team
            </p>
          </div>

          {isLogin ? (
            <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </AppShell>
  );
}