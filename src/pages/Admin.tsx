import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { Plus, Trash2, Edit2, Save, X, Layout, Package } from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue, set, push, remove, update } from 'firebase/database';

interface Ad {
  id: string;
  placement: string;
  content: string;
  active: number;
}

export const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'ads'>('products');

  const SECRET_KEY = (import.meta as any).env.VITE_ADMIN_SECRET_KEY || 'luxe-admin-2026';

  // Product Form State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    id: '', name: '', price: 0, category: '', images: [], description: '', externalLink: ''
  });

  // Ad Form State
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [newAd, setNewAd] = useState<Partial<Ad>>({ placement: '', content: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === SECRET_KEY) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', SECRET_KEY);
    } else {
      alert('Invalid secret key');
    }
  };

  useEffect(() => {
    // Add no-index meta tag
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);

    // Check if already authenticated in session
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === SECRET_KEY) {
      setIsAuthenticated(true);
    }

    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const productsRef = ref(db, 'products');
    const adsRef = ref(db, 'ads');

    const unsubscribeProducts = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productList = Object.keys(data).map(key => ({
          ...data[key],
          firebaseId: key // Keep track of firebase key if needed
        }));
        setProducts(productList);
      } else {
        setProducts([]);
      }
    });

    const unsubscribeAds = onValue(adsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const adList = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        setAds(adList);
      } else {
        setAds([]);
      }
    });

    return () => {
      unsubscribeProducts();
      unsubscribeAds();
    };
  }, []);

  // Product Handlers
  const handleAddProduct = async () => {
    if (!newProduct.id) return alert("ID is required");
    const productsRef = ref(db, `products/${newProduct.id}`);
    await set(productsRef, newProduct);
    setNewProduct({ id: '', name: '', price: 0, category: '', images: [], description: '', externalLink: '' });
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    const productRef = ref(db, `products/${editingProduct.id}`);
    await update(productRef, editingProduct);
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    const productRef = ref(db, `products/${id}`);
    await remove(productRef);
  };

  // Ad Handlers
  const handleAddAd = async () => {
    const adsRef = ref(db, 'ads');
    const newAdRef = push(adsRef);
    await set(newAdRef, { ...newAd, active: 1 });
    setNewAd({ placement: '', content: '' });
  };

  const handleUpdateAd = async () => {
    if (!editingAd) return;
    const adRef = ref(db, `ads/${editingAd.id}`);
    await update(adRef, editingAd);
    setEditingAd(null);
  };

  const handleDeleteAd = async (id: string) => {
    if (!confirm('Delete this ad?')) return;
    const adRef = ref(db, `ads/${id}`);
    await remove(adRef);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-6">
        <div className="w-full max-w-md bg-white p-12 rounded-3xl shadow-xl border border-zinc-100">
          <h1 className="text-3xl font-serif italic mb-8 text-center">Secure Access</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block ml-2">Secret Key</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit"
              className="w-full py-4 bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg"
            >
              Enter Portal
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
          <h1 className="text-4xl font-serif italic">Admin Dashboard</h1>
          <div className="flex bg-white rounded-full p-1 shadow-sm border border-zinc-200">
            <button 
              onClick={() => setActiveTab('products')}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'products' ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              <Package size={14} /> Products
            </button>
            <button 
              onClick={() => setActiveTab('ads')}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'ads' ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              <Layout size={14} /> Ads
            </button>
          </div>
        </div>

        {activeTab === 'products' ? (
          <div className="space-y-8">
            {/* Add Product Form */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100">
              <h2 className="text-xl font-serif italic mb-6">Add New Product</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <input 
                  placeholder="ID (e.g., p1)" 
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm"
                  value={newProduct.id} onChange={e => setNewProduct({...newProduct, id: e.target.value})}
                />
                <input 
                  placeholder="Name" 
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm"
                  value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                />
                <input 
                  placeholder="Price" type="number"
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm"
                  value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                />
                <input 
                  placeholder="Category" 
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm"
                  value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                />
                <input 
                  placeholder="Images (comma separated URLs)" 
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm"
                  value={newProduct.images?.join(',')} onChange={e => setNewProduct({...newProduct, images: e.target.value.split(',')})}
                />
                <input 
                  placeholder="External Link" 
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm"
                  value={newProduct.externalLink} onChange={e => setNewProduct({...newProduct, externalLink: e.target.value})}
                />
                <textarea 
                  placeholder="Description" 
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm md:col-span-2 lg:col-span-3 h-32"
                  value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                />
              </div>
              <button 
                onClick={handleAddProduct}
                className="mt-6 px-8 py-3 bg-zinc-900 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-2"
              >
                <Plus size={16} /> Add Product
              </button>
            </div>

            {/* Product List */}
            <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-zinc-50 border-b border-zinc-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Product</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Price</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Category</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img src={p.images[0]} className="w-10 h-10 rounded-lg object-cover" />
                          <span className="text-sm font-medium">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-500">${p.price}</td>
                      <td className="px-6 py-4 text-sm text-zinc-500">{p.category}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setEditingProduct(p)}
                            className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Add Ad Form */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100">
              <h2 className="text-xl font-serif italic mb-6">Add New Ad Placement</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <select 
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm"
                  value={newAd.placement} onChange={e => setNewAd({...newAd, placement: e.target.value})}
                >
                  <option value="">Select Placement</option>
                  <option value="home_hero_bottom">Home Hero Bottom</option>
                  <option value="products_top">Products Top</option>
                  <option value="products_bottom">Products Bottom</option>
                  <option value="product_detail_bottom">Product Detail Bottom</option>
                  <option value="footer_top">Footer Top</option>
                </select>
                <textarea 
                  placeholder="HTML Content (e.g., <a href='...'><img src='...' /></a>)" 
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm md:col-span-2 h-32"
                  value={newAd.content} onChange={e => setNewAd({...newAd, content: e.target.value})}
                />
              </div>
              <button 
                onClick={handleAddAd}
                className="mt-6 px-8 py-3 bg-zinc-900 text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-2"
              >
                <Plus size={16} /> Add Ad
              </button>
            </div>

            {/* Ad List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ads.map(ad => (
                <div key={ad.id} className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{ad.placement}</span>
                      <span className={`px-2 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${ad.active ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-100 text-zinc-400'}`}>
                        {ad.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="bg-zinc-50 p-4 rounded-xl mb-4 overflow-hidden border border-zinc-100">
                      <code className="text-[10px] text-zinc-500 break-all">{ad.content}</code>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => setEditingAd(ad)}
                      className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteAd(ad.id)}
                      className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-serif italic">Edit Product</h2>
              <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Name</label>
                <input 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm"
                  value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Price</label>
                <input 
                  type="number"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm"
                  value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Category</label>
                <input 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm"
                  value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">External Link</label>
                <input 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm"
                  value={editingProduct.externalLink} onChange={e => setEditingProduct({...editingProduct, externalLink: e.target.value})}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Images (comma separated)</label>
                <input 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm"
                  value={editingProduct.images.join(',')} onChange={e => setEditingProduct({...editingProduct, images: e.target.value.split(',')})}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Description</label>
                <textarea 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm h-32"
                  value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-4">
              <button 
                onClick={() => setEditingProduct(null)}
                className="px-8 py-3 border border-zinc-200 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-zinc-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateProduct}
                className="px-8 py-3 bg-zinc-900 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-2"
              >
                <Save size={16} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Ad Modal */}
      {editingAd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-serif italic">Edit Ad Placement</h2>
              <button onClick={() => setEditingAd(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Placement</label>
                <select 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm"
                  value={editingAd.placement} onChange={e => setEditingAd({...editingAd, placement: e.target.value})}
                >
                  <option value="home_hero_bottom">Home Hero Bottom</option>
                  <option value="products_top">Products Top</option>
                  <option value="products_bottom">Products Bottom</option>
                  <option value="product_detail_bottom">Product Detail Bottom</option>
                  <option value="footer_top">Footer Top</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">HTML Content</label>
                <textarea 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm h-48"
                  value={editingAd.content} onChange={e => setEditingAd({...editingAd, content: e.target.value})}
                />
              </div>
              <div className="flex items-center gap-3 ml-4">
                <input 
                  type="checkbox" id="ad-active"
                  checked={editingAd.active === 1} onChange={e => setEditingAd({...editingAd, active: e.target.checked ? 1 : 0})}
                  className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                />
                <label htmlFor="ad-active" className="text-xs font-bold uppercase tracking-widest text-zinc-500">Active</label>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-4">
              <button 
                onClick={() => setEditingAd(null)}
                className="px-8 py-3 border border-zinc-200 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-zinc-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateAd}
                className="px-8 py-3 bg-zinc-900 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-2"
              >
                <Save size={16} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
