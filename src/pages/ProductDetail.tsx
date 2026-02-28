import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { Product } from '../types';
import { 
  ChevronLeft, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Star, 
  Play, 
  Plus, 
  Minus,
  CheckCircle2,
  Lock,
  Zap,
  Heart
} from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [stockCount, setStockCount] = useState(12);
  const [viewers, setViewers] = useState(45);

  useEffect(() => {
    if (!slug) return;

    const productsRef = ref(db, 'products');
    const slugQuery = query(productsRef, orderByChild('slug'), equalTo(slug));

    const unsubscribe = onValue(slugQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productData = Object.values(data)[0] as Product;
        setProduct(productData);
      } else {
        setProduct(null);
      }
      setLoading(false);
    });

    // Simulate dynamic urgency
    const stockInterval = setInterval(() => {
      setStockCount(prev => Math.max(3, prev - (Math.random() > 0.8 ? 1 : 0)));
    }, 15000);

    const viewerInterval = setInterval(() => {
      setViewers(prev => Math.max(20, prev + Math.floor(Math.random() * 5) - 2));
    }, 8000);

    return () => {
      unsubscribe();
      clearInterval(stockInterval);
      clearInterval(viewerInterval);
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <h1 className="text-4xl font-serif italic mb-4">Product Not Found</h1>
        <p className="text-zinc-500 mb-8">The item you're looking for doesn't exist or has been moved.</p>
        <Link to="/products" className="px-8 py-3 bg-zinc-900 text-white rounded-full text-xs font-bold uppercase tracking-widest">
          Back to Shop
        </Link>
      </div>
    );
  }

  const mainImage = product.images?.[0] || 'https://picsum.photos/seed/placeholder/800/1000';
  const secondaryImages = product.images?.slice(1) || [];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <Link to="/products" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors mb-12">
            <ChevronLeft size={14} /> Back to Collection
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Image Gallery */}
            <div className="space-y-6">
              <div className="aspect-[4/5] bg-zinc-50 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white">
                <img 
                  src={mainImage} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {secondaryImages.map((img, i) => (
                  <div key={i} className="aspect-square bg-zinc-50 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                    <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="lg:sticky lg:top-32">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">4.8/5 (124 Reviews)</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-serif italic tracking-tight mb-6 leading-tight">
                {product.headline || product.name}
              </h1>
              
              <p className="text-xl text-zinc-500 font-light mb-8 leading-relaxed">
                {product.subHeadline || product.description}
              </p>

              <div className="flex items-baseline gap-4 mb-10">
                <span className="text-4xl font-serif italic">${product.price}</span>
                <span className="text-zinc-400 line-through text-lg font-light">${Math.round(product.price * 1.4)}</span>
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Save 40%</span>
              </div>

              {/* Urgency Elements */}
              <div className="bg-zinc-50 rounded-3xl p-6 mb-10 space-y-4 border border-zinc-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Low Stock</span>
                  </div>
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Only {stockCount} items left</span>
                </div>
                <div className="h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${(stockCount / 15) * 100}%` }}
                    className="h-full bg-red-500"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest text-center">
                  🔥 {viewers} people are viewing this product right now
                </p>
              </div>

              <div className="space-y-4">
                <a 
                  href={product.buyNowUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-5 bg-zinc-900 text-white text-center rounded-full text-sm font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                >
                  Buy Now — Secure Checkout
                </a>
                <div className="flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  <span className="flex items-center gap-1"><ShieldCheck size={14} /> 30-Day Guarantee</span>
                  <span className="flex items-center gap-1"><Truck size={14} /> Free Shipping</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Persuasive Description */}
      <section className="py-24 bg-zinc-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-4 block">The Story</span>
            <h2 className="text-4xl font-serif italic mb-8">Why This Matters</h2>
          </div>
          <div className="prose prose-zinc prose-lg max-w-none text-zinc-600 font-light leading-relaxed space-y-8">
            {product.persuasiveDescription ? (
              product.persuasiveDescription.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))
            ) : (
              <p>{product.description}</p>
            )}
          </div>
        </div>
      </section>

      {/* Features & Benefits */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(product.features || [
              { title: "Premium Quality", description: "Crafted from the finest materials for a luxurious feel and lasting durability.", icon: "CheckCircle2" },
              { title: "Timeless Design", description: "A minimalist aesthetic that complements any modern sanctuary perfectly.", icon: "Heart" },
              { title: "Ethically Sourced", description: "We believe in responsible luxury. Every piece is ethically sourced.", icon: "ShieldCheck" }
            ]).map((feature, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                  <Zap size={24} />
                </div>
                <h3 className="text-xl font-serif italic mb-4">{feature.title}</h3>
                <p className="text-zinc-500 font-light leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-24 px-6 bg-zinc-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 mb-4 block">Showcase</span>
            <h2 className="text-4xl font-serif italic text-white">Experience the Quality</h2>
          </div>
          <div className="aspect-video bg-zinc-800 rounded-[3rem] overflow-hidden relative group cursor-pointer border-8 border-zinc-800 shadow-2xl">
            <img 
              src={secondaryImages[0] || mainImage} 
              className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" 
              alt="Video Preview"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <Play size={32} fill="currentColor" className="ml-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-zinc-50 border-y border-zinc-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                <RotateCcw size={24} className="text-zinc-400" />
              </div>
              <h3 className="text-lg font-serif italic">30-Day Returns</h3>
              <p className="text-sm text-zinc-500 font-light">Not in love? Return it within 30 days for a full, no-questions-asked refund.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Lock size={24} className="text-zinc-400" />
              </div>
              <h3 className="text-lg font-serif italic">Secure Payment</h3>
              <p className="text-sm text-zinc-500 font-light">Your security is our priority. We use industry-leading encryption for all transactions.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Truck size={24} className="text-zinc-400" />
              </div>
              <h3 className="text-lg font-serif italic">Global Shipping</h3>
              <p className="text-sm text-zinc-500 font-light">We ship to over 150 countries worldwide with real-time tracking on every order.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-4 block">Social Proof</span>
            <h2 className="text-4xl font-serif italic mb-4">What Our Customers Say</h2>
            <div className="flex items-center justify-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <span className="text-sm font-bold text-zinc-900">4.8 Average Rating</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(product.reviews || [
              { author: "James L.", rating: 5, comment: "I was skeptical at first, but the quality is undeniable. It's the centerpiece of my room now.", date: "2 days ago" },
              { author: "Sophia M.", rating: 5, comment: "Fast shipping and beautiful packaging. You can tell they care about the details.", date: "1 week ago" },
              { author: "David K.", rating: 4, comment: "Excellent product. Minor delay in shipping but the customer support was very helpful.", date: "2 weeks ago" }
            ]).map((review, i) => (
              <div key={i} className="bg-zinc-50 p-8 rounded-3xl border border-zinc-100">
                <div className="flex text-amber-400 mb-4">
                  {[...Array(review.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                </div>
                <p className="text-zinc-600 font-light italic mb-6 leading-relaxed">"{review.comment}"</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-900">{review.author}</span>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest">{review.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-zinc-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-4 block">Knowledge Base</span>
            <h2 className="text-4xl font-serif italic">Common Questions</h2>
          </div>
          <div className="space-y-4">
            {(product.faqs || [
              { question: "How long does shipping take?", answer: "We typically deliver within 7-14 business days depending on your location. You'll receive a tracking number as soon as your order ships." },
              { question: "Is there a warranty?", answer: "Yes, we provide a 1-year limited warranty on all our products covering manufacturing defects." },
              { question: "What is your return policy?", answer: "We offer a 30-day money-back guarantee. If you're not satisfied, simply contact us for a return authorization." }
            ]).map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-zinc-50 transition-colors"
                >
                  <span className="text-sm font-bold uppercase tracking-widest text-zinc-900">{faq.question}</span>
                  {openFaq === i ? <Minus size={16} /> : <Plus size={16} />}
                </button>
                {openFaq === i && (
                  <div className="px-8 pb-6 text-zinc-500 font-light text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-serif italic mb-8 leading-tight">Ready to Upgrade Your Sanctuary?</h2>
          <p className="text-xl text-zinc-500 font-light mb-12">Join over 10,000 happy customers who have already transformed their space with LuxeStore.</p>
          <a 
            href={product.buyNowUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-16 py-6 bg-zinc-900 text-white rounded-full text-sm font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-2xl hover:scale-105 active:scale-95"
          >
            Buy Now — Limited Stock
          </a>
          <div className="mt-8 flex items-center justify-center gap-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4 opacity-30" alt="Visa" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6 opacity-30" alt="Mastercard" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4 opacity-30" alt="PayPal" />
          </div>
        </div>
      </section>
    </div>
  );
};
