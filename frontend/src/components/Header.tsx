'use client';
import Link from 'next/link';
// import { ThemeToggle } from '@/components/theme-toggle'; // Uncomment if available
// import Logo from '@/components/Logo'; // Uncomment if available

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          {/* <Logo className="h-6 w-6 text-primary" /> */}
          <span>Peer Bonus</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/feed" className="hover:text-primary">Feed</Link>
          {/* <ThemeToggle /> */}
        </nav>
      </div>
    </header>
  );
}
