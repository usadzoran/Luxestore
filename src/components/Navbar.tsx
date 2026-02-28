import React from 'react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="text-2xl font-serif italic tracking-tight">
          LuxeStore
        </Link>
        <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-zinc-500">
          <Link to="/" className="hover:text-zinc-900 transition-colors">Home</Link>
          <Link to="/products" className="hover:text-zinc-900 transition-colors">Shop</Link>
        </div>
      </div>
    </nav>
  );
};
