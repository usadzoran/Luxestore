import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { AdPlacement } from '../components/AdPlacement';
import { Product } from '../types';
import { db } from '../lib/firebase';
import { ref, onValue, query, limitToFirst } from 'firebase/database';
import { ProductCard } from '../components/ProductCard';
import { useLanguage } from '../lib/LanguageContext';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    const productsRef = ref(db, 'products');
    const featuredQuery = query(productsRef, limitToFirst(4));
    
    const unsubscribe = onValue(featuredQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productList = Object.keys(data).map(key => data[key]);
        setFeaturedProducts(productList);
      }
    });

    return () => unsubscribe();
  }, []);

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
              {t.home.heroTitle}
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light tracking-wide">
              {t.home.heroSubtitle}
            </p>
            <button 
              onClick={() => navigate('/products')}
              className="px-12 py-5 bg-white text-zinc-900 rounded-full text-sm font-bold uppercase tracking-[0.2em] hover:bg-zinc-100 transition-all shadow-xl hover:scale-105 active:scale-95"
            >
              {t.home.shopNow}
            </button>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 w-full">
        <AdPlacement placement="home_hero_bottom" />

        {featuredProducts.length > 0 && (
          <section className="py-24">
            <div className={`flex items-end justify-between mb-12 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-4 block">
                  {t.home.featured}
                </span>
                <h2 className="text-4xl font-serif italic tracking-tight">
                  {t.home.newArrivals}
                </h2>
              </div>
              <button 
                onClick={() => navigate('/products')}
                className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                {t.home.viewAll}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};