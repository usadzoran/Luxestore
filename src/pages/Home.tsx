import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { AdPlacement } from '../components/AdPlacement';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/luxury-home/1920/1080" 
            alt="Luxury Home" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <h1 className="text-6xl md:text-8xl font-serif italic text-white mb-8 tracking-tight">
              LuxeStore
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light tracking-wide">
              Curated elegance for your modern sanctuary. Discover timeless pieces crafted for longevity.
            </p>
            <button 
              onClick={() => navigate('/products')}
              className="px-12 py-5 bg-white text-zinc-900 rounded-full text-sm font-bold uppercase tracking-[0.2em] hover:bg-zinc-100 transition-all shadow-xl hover:scale-105 active:scale-95"
            >
              Shop Now
            </button>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 w-full">
        <AdPlacement placement="home_hero_bottom" />
      </div>
    </div>
  );
};