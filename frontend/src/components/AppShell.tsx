import { ReactNode } from 'react';
import Header from '@/components/Header';

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-8">{children}</div>
      </main>
    </div>
  );
}
