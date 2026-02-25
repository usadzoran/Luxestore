import React, { useEffect, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';
import { AdPlacement } from '../components/AdPlacement';
import { db } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const productsRef = ref(db, 'products');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productList = Object.keys(data).map(key => data[key]);
        setProducts(productList);
      } else {
        setProducts([]);
      }
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="pt-32 pb-24 min-h-screen bg-white">
      <section className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-4 block">
            The Collection
          </span>
          <h1 className="text-5xl font-serif italic tracking-tight">
            Our Products
          </h1>
        </div>

        <AdPlacement placement="products_top" />

        {loading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
              {products.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            <AdPlacement placement="products_mid" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16 mt-16">
              {products.slice(4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}

        <AdPlacement placement="products_bottom" />
      </section>
    </div>
  );
};
