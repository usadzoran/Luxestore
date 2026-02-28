import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const productsRef = ref(db, 'products');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        setProducts(list);
      } else {
        setProducts([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="pt-32 pb-24 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-16">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-4 block">
            The Collection
          </span>
          <h1 className="text-6xl font-serif italic tracking-tight">
            Our Products
          </h1>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-zinc-400 italic">No products available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
            {products.map((product, index) => (
              <div key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
