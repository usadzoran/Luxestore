import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="group">
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100 rounded-2xl mb-4">
          <img 
            src={product.images?.[0] || 'https://picsum.photos/seed/placeholder/800/1000'} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium text-zinc-900 mb-1">{product.name}</h3>
            <p className="text-xs text-zinc-500">{product.category}</p>
          </div>
          <span className="text-sm font-medium text-zinc-900">${product.price}</span>
        </div>
      </Link>
      <Link 
        to={`/product/${product.id}`}
        className="mt-4 block w-full py-2 text-center text-xs font-bold uppercase tracking-widest border border-zinc-200 rounded-full hover:bg-zinc-900 hover:text-white transition-all"
      >
        View Product
      </Link>
    </div>
  );
};