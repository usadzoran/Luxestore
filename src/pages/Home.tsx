import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export const Home: React.FC = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=2000" 
          alt="Luxe Interior" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-7xl md:text-9xl font-serif italic text-white mb-8 tracking-tighter">
            LuxeStore
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light tracking-wide">
            Curated elegance for your modern sanctuary. Discover timeless pieces crafted for longevity and style.
          </p>
          <Link 
            to="/products"
            className="inline-block px-12 py-5 bg-white text-zinc-900 rounded-full text-sm font-bold uppercase tracking-[0.2em] hover:bg-zinc-100 transition-all shadow-2xl hover:scale-105 active:scale-95"
          >
            Shop Now
          </Link>
        </motion.div>
      </div>
    </div>
  );
};
