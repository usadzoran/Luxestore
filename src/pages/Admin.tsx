import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { Plus, Trash2, Edit2, Save, X, Layout, Package, Sparkles, Globe, MessageSquare, HelpCircle, CheckCircle, LogOut } from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue, set, push, remove, update } from 'firebase/database';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'stats'>('products');
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Form State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '', price: 0, category: '', images: [], description: '', buyNowUrl: '',
    slug: '', headline: '', subHeadline: '', benefits: [], features: [], reviews: [], faqs: []
  });

  const SECRET_KEY = (import.meta as any).env.VITE_ADMIN_SECRET_KEY || 'luxe-admin-2026';

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === SECRET_KEY) setIsAuthenticated(true);

    if (isAuthenticated) {
      const productsRef = ref(db, 'products');
      const unsubscribe = onValue(productsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.keys(data).map(key => ({ ...data[key], id: key }));
          setProducts(list);
        } else {
          setProducts([]);
        }
      });
      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === SECRET_KEY) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', SECRET_KEY);
    } else {
      alert('Invalid secret key');
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleOptimizeWithAI = async (product: Partial<Product>, isEditing: boolean) => {
    if (!product.name || !product.description) {
      alert('Please provide a name and basic description first.');
      return;
    }

    setIsOptimizing(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this product and generate high-converting landing page content in JSON format.
        Product Name: ${product.name}
        Basic Description: ${product.description}
        Category: ${product.category}
        
        Return a JSON object with:
        - slug: SEO friendly URL slug
        - headline: Strong, benefit-driven headline
        - subHeadline: Persuasive sub-headline
        - benefits: Array of 4 key benefits
        - features: Array of 4 objects with {title, description, icon} (icons: check, shield, truck, star, heart, zap)
        - faqs: Array of 6 common questions and answers
        - reviews: Array of 3 realistic customer reviews with {author, rating, comment, date}
        - persuasiveDescription: A longer, sales-focused narrative (3-4 paragraphs)
        `,
        config: {
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(response.text || '{}');
      
      const updated = {
        ...product,
        slug: data.slug || generateSlug(product.name || ''),
        headline: data.headline,
        subHeadline: data.subHeadline,
        benefits: data.benefits,
        features: data.features,
        faqs: data.faqs,
        reviews: data.reviews,
        persuasiveDescription: data.persuasiveDescription
      };

      if (isEditing) {
        setEditingProduct(updated as Product);
      } else {
        setNewProduct(updated);
      }
    } catch (error) {
      console.error('AI Optimization failed:', error);
      alert('AI Optimization failed. Check your API key.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSaveProduct = async (product: Partial<Product>, id?: string) => {
    if (!product.name) return alert("Name is required");
    
    try {
      const productsRef = ref(db, 'products');
      const targetRef = id ? ref(db, `products/${id}`) : push(productsRef);
      
      const finalData = {
        ...product,
        id: id || targetRef.key,
        slug: product.slug || generateSlug(product.name || ''),
        createdAt: Date.now()
      };

      await set(targetRef, finalData);
      if (id) setEditingProduct(null);
      else setNewProduct({
        name: '', price: 0, category: '', images: [], description: '', buyNowUrl: '',
        slug: '', headline: '', subHeadline: '', benefits: [], features: [], reviews: [], faqs: []
      });
      alert("Product saved!");
    } catch (error) {
      console.error(error);
      alert("Failed to save.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this product?')) {
      await remove(ref(db, `products/${id}`));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-6">
        <div className="w-full max-w-md bg-white p-12 rounded-[2.5rem] shadow-2xl border border-zinc-100">
          <h1 className="text-3xl font-serif italic mb-8 text-center">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
              placeholder="Enter Secret Key"
            />
            <button type="submit" className="w-full py-4 bg-zinc-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all">
              Enter Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-zinc-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-serif italic">Dashboard</h1>
          <button 
            onClick={() => { sessionStorage.removeItem('admin_auth'); setIsAuthenticated(false); }}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form Column */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-100">
              <h2 className="text-xl font-serif italic mb-6">Add Product</h2>
              <div className="space-y-4">
                <input 
                  placeholder="Product Name" 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm"
                  value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                />
                <input 
                  placeholder="Price" type="number"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm"
                  value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                />
                <input 
                  placeholder="Category" 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm"
                  value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                />
                <textarea 
                  placeholder="Basic Description" 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm h-24"
                  value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                />
                <input 
                  placeholder="AliExpress / External Link" 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm"
                  value={newProduct.buyNowUrl} onChange={e => setNewProduct({...newProduct, buyNowUrl: e.target.value})}
                />
                <textarea 
                  placeholder="Image URLs (one per line)" 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm h-24"
                  value={newProduct.images?.join('\n')} onChange={e => setNewProduct({...newProduct, images: e.target.value.split('\n').filter(Boolean)})}
                />

                <div className="pt-4 border-t border-zinc-100 space-y-4">
                  <button 
                    onClick={() => handleOptimizeWithAI(newProduct, false)}
                    disabled={isOptimizing}
                    className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Sparkles size={14} /> {isOptimizing ? 'Optimizing...' : 'Optimize with AI'}
                  </button>
                  <button 
                    onClick={() => handleSaveProduct(newProduct)}
                    className="w-full py-4 bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all"
                  >
                    Publish Product
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* List Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2rem] shadow-sm border border-zinc-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-zinc-50 border-b border-zinc-100">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Product</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Price</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <img src={p.images?.[0]} className="w-12 h-12 rounded-xl object-cover" alt="" />
                          <div>
                            <p className="text-sm font-bold text-zinc-900">{p.name}</p>
                            <p className="text-[10px] text-zinc-400 uppercase tracking-widest">{p.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm text-zinc-500">${p.price}</td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setEditingProduct(p)} className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(p.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-8 py-20 text-center text-zinc-400 italic text-sm">No products found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl p-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-serif italic">Edit Product</h2>
              <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-2">Name</label>
                  <input className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-2">Price</label>
                  <input type="number" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-2">Slug</label>
                  <input className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm" value={editingProduct.slug} onChange={e => setEditingProduct({...editingProduct, slug: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-2">Buy Now URL</label>
                  <input className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm" value={editingProduct.buyNowUrl} onChange={e => setEditingProduct({...editingProduct, buyNowUrl: e.target.value})} />
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-2">Headline</label>
                  <input className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm" value={editingProduct.headline || ''} onChange={e => setEditingProduct({...editingProduct, headline: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-2">Sub Headline</label>
                  <textarea className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm h-24" value={editingProduct.subHeadline || ''} onChange={e => setEditingProduct({...editingProduct, subHeadline: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-2">Images</label>
                  <textarea className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm h-24" value={editingProduct.images?.join('\n')} onChange={e => setEditingProduct({...editingProduct, images: e.target.value.split('\n').filter(Boolean)})} />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-2">Persuasive Description</label>
                <textarea className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm h-48" value={editingProduct.persuasiveDescription || ''} onChange={e => setEditingProduct({...editingProduct, persuasiveDescription: e.target.value})} />
              </div>
            </div>

            <div className="mt-10 flex justify-between items-center pt-8 border-t border-zinc-100">
              <button 
                onClick={() => handleOptimizeWithAI(editingProduct, true)}
                disabled={isOptimizing}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-100 transition-all disabled:opacity-50"
              >
                <Sparkles size={14} /> {isOptimizing ? 'Optimizing...' : 'Optimize with AI'}
              </button>
              <div className="flex gap-4">
                <button onClick={() => setEditingProduct(null)} className="px-8 py-3 border border-zinc-200 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-zinc-50 transition-all">Cancel</button>
                <button onClick={() => handleSaveProduct(editingProduct, editingProduct.id)} className="px-8 py-3 bg-zinc-900 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-2"><Save size={16} /> Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
