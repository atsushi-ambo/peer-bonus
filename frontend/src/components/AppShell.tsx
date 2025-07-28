'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface AppShellProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export default function AppShell({ children, requireAuth = true }: AppShellProps) {
  const { user, logout, loading, isLoggedIn } = useAuth();
  const router = useRouter();

  // Handle authentication redirect in useEffect (after render)
  useEffect(() => {
    if (!loading && requireAuth && !isLoggedIn) {
      router.push('/auth');
    }
  }, [loading, requireAuth, isLoggedIn, router]);

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
    <div className="min-h-screen bg-gray-50">
      {isLoggedIn && (
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-900">Peer Bonus</h1>
                <nav className="flex space-x-4">
                  <button
                    onClick={() => router.push('/')}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Feed
                  </button>
                  <button
                    onClick={() => router.push('/feed')}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    My Kudos
                  </button>
                </nav>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user?.name}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}
      
      <main className={isLoggedIn ? "py-6" : ""}>
        {children}
      </main>
    </div>
  );
}
