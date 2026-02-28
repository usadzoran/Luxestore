import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="group">
      <Link to={`/product/${product.slug}`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100 rounded-2xl mb-4">
          <img 
            src={product.images?.[0] || 'https://picsum.photos/seed/placeholder/800/1000'} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm">
            <span className="text-xs font-bold text-zinc-900">${product.price}</span>
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-zinc-900 group-hover:underline decoration-zinc-300 underline-offset-4">
            {product.name}
          </h3>
          <p className="text-xs text-zinc-400 uppercase tracking-widest">{product.category}</p>
        </div>
      </Link>
    </div>
  );
};
