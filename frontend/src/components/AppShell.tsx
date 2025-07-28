'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useClientSide } from '@/hooks/useClientSide';
import { Button } from '@/components/ui/button';

interface AppShellProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export default function AppShell({ children, requireAuth = true }: AppShellProps) {
  const { user, logout, loading, isLoggedIn } = useAuth();
  const router = useRouter();
  const isClient = useClientSide();

  // Handle authentication redirect in useEffect (after render and hydration)
  useEffect(() => {
    if (isClient && !loading && requireAuth && !isLoggedIn) {
      router.push('/auth');
    }
  }, [isClient, loading, requireAuth, isLoggedIn, router]);

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

  // Don't render content if auth is required but user is not logged in
  if (requireAuth && !isLoggedIn) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {isLoggedIn && (
        <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">✨</span>
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Peer Bonus</h1>
                </div>
                <nav className="flex space-x-1">
                  <button
                    onClick={() => router.push('/feed')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    📊 Feed
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    ✨ Send Kudos
                  </button>
                </nav>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Welcome back!</p>
                  <p className="text-xs text-gray-600">{user?.name}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors duration-200"
                >
                  🚪 Logout
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}
      
      <main className={isLoggedIn ? "py-8" : ""}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
