import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { motion } from 'motion/react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { AdPlacement } from '../components/AdPlacement';
import { db } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const productRef = ref(db, `products/${id}`);
    const unsubscribe = onValue(productRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProduct(data);
      } else {
        setProduct(null);
      }
      setLoading(false);
    }, (error) => {
      console.error(error);
      setProduct(null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  if (loading) return <div className="pt-32 text-center">Loading...</div>;

  if (!product) {
    return (
      <div className="pt-32 text-center">
        <h2 className="text-2xl font-serif italic">Product not found</h2>
        <button onClick={() => navigate('/products')} className="mt-4 text-zinc-500 underline">Back to Shop</button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors mb-12 text-sm uppercase tracking-widest font-bold"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Images */}
          <div className="space-y-6">
            {product.images.map((img, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="aspect-[4/5] bg-zinc-100 rounded-3xl overflow-hidden"
              >
                <img 
                  src={img} 
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            ))}
          </div>

          {/* Details */}
          <div className="lg:sticky lg:top-32 h-fit">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-4 block">
              {product.category}
            </span>
            <h1 className="text-5xl font-serif italic mb-6 tracking-tight">
              {product.name}
            </h1>
            <p className="text-2xl font-medium text-zinc-900 mb-8">
              ${product.price}
            </p>
            <div className="prose prose-zinc mb-12">
              <p className="text-zinc-600 leading-relaxed text-lg">
                {product.description}
              </p>
            </div>
            
            <button 
              onClick={() => window.open(product.externalLink, '_blank')}
              className="w-full py-5 bg-zinc-900 text-white rounded-full text-sm font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              Buy Now
              <ExternalLink size={18} />
            </button>

            <AdPlacement placement="product_detail_bottom" />
            
            <div className="mt-12 pt-12 border-t border-zinc-100 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400">
                  <span className="text-[10px] font-bold">01</span>
                </div>
                <p className="text-xs uppercase tracking-widest font-bold text-zinc-500">Premium Quality Materials</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400">
                  <span className="text-[10px] font-bold">02</span>
                </div>
                <p className="text-xs uppercase tracking-widest font-bold text-zinc-500">Ethically Sourced & Crafted</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400">
                  <span className="text-[10px] font-bold">03</span>
                </div>
                <p className="text-xs uppercase tracking-widest font-bold text-zinc-500">Timeless Design Aesthetic</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
