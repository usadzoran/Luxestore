import React from 'react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
      <div className="text-center">
        <h1 className="text-6xl font-serif italic mb-8">LuxeStore</h1>
        <Link 
          to="/products"
          className="px-8 py-4 bg-white text-zinc-900 rounded-full text-sm font-bold uppercase tracking-widest"
        >
          Shop Now
        </Link>
      </div>
    </div>
  );
};
