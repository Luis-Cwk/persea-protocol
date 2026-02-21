'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Navbar() {
  return (
    <nav className="bg-green-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">🥑</span>
              <span className="text-xl font-bold">PERSÉA</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/market" className="hover:text-green-300 transition-colors">
              Mercado
            </Link>
            <Link href="/dashboard" className="hover:text-green-300 transition-colors">
              Dashboard
            </Link>
            <Link href="/register" className="hover:text-green-300 transition-colors">
              Registrar Lote
            </Link>
          </div>

          <div className="flex items-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
