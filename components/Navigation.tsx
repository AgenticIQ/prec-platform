'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">PREC Real Estate</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-md hover:bg-blue-700 transition-colors ${isActive('/')}`}
            >
              Home
            </Link>

            <Link
              href="/portal/register"
              className={`px-4 py-2 rounded-md hover:bg-blue-700 transition-colors ${isActive('/portal/register')}`}
            >
              Register
            </Link>

            <Link
              href="/portal/login"
              className={`px-4 py-2 rounded-md hover:bg-blue-700 transition-colors ${isActive('/portal/login')}`}
            >
              Login
            </Link>

            <Link
              href="/portal/dashboard"
              className={`px-4 py-2 rounded-md hover:bg-blue-700 transition-colors ${isActive('/portal/dashboard')}`}
            >
              Portal
            </Link>

            <Link
              href="/admin"
              className={`px-4 py-2 rounded-md hover:bg-blue-700 transition-colors bg-blue-800 ${isActive('/admin')}`}
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
