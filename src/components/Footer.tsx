import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-50 border-t border-zinc-100 py-12">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-2xl font-serif italic mb-4">LuxeStore</p>
        <p className="text-xs text-zinc-400 uppercase tracking-widest">
          © {new Date().getFullYear()} LuxeStore. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
