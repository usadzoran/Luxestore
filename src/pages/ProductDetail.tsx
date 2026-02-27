import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { motion } from 'motion/react';
import { ArrowLeft, ExternalLink, CheckCircle2, Star, ShieldCheck, Truck, MessageCircle, HelpCircle, PlayCircle } from 'lucide-react';
import { AdPlacement } from '../components/AdPlacement';
import { db } from '../lib/firebase';
import { ref, onValue, query, orderByChild, equalTo, get } from 'firebase/database';
import { useLanguage } from '../lib/LanguageContext';

export const ProductDetail: React.FC = () => {
  const { id: slugOrId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, isRTL } = useLanguage();

  // Urgency/Scarcity state - MUST be at the top level
  const [stockCount, setStockCount] = useState(12);
  const [viewers, setViewers] = useState(42);
  const [timeLeft, setTimeLeft] = useState({ h: 2, m: 45, s: 12 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
        return prev;
      });
    }, 1000);

    // Randomly update viewers
    const viewerTimer = setInterval(() => {
      setViewers(prev => Math.max(15, Math.min(100, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(viewerTimer);
    };
  }, []);

  useEffect(() => {
    if (!slugOrId) return;
    
    const fetchProduct = async () => {
      setLoading(true);
      // Try fetching by ID first
      const productRef = ref(db, `products/${slugOrId}`);
      const snapshot = await get(productRef);
      
      if (snapshot.exists()) {
        setProduct(snapshot.val());
        setLoading(false);
      } else {
        // Try fetching by slug
        const productsRef = ref(db, 'products');
        const slugQuery = query(productsRef, orderByChild('slug'), equalTo(slugOrId));
        const slugSnapshot = await get(slugQuery);
        
        if (slugSnapshot.exists()) {
          const data = slugSnapshot.val();
          const productKey = Object.keys(data)[0];
          setProduct(data[productKey]);
        } else {
          setProduct(null);
        }
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slugOrId]);

  if (loading) return (
    <div className="pt-32 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mb-4" />
      <p className="text-zinc-500 font-medium">{t.products.loading}</p>
    </div>
  );

  if (!product) {
    return (
      <div className="pt-32 text-center px-6">
        <h2 className="text-3xl font-serif italic mb-4">{t.productDetail.notFound}</h2>
        <button onClick={() => navigate('/products')} className="px-8 py-3 bg-zinc-900 text-white rounded-full text-sm font-bold uppercase tracking-widest">
          {t.productDetail.backToShop}
        </button>
      </div>
    );
  }

  // Default values for landing page elements if missing
  const headline = product.headline || `Experience the Ultimate ${product.name}`;
  const subHeadline = product.subHeadline || `Discover why thousands of customers choose our ${product.category.toLowerCase()} for their modern sanctuary.`;
  const benefits = product.benefits || [
    "Premium quality materials for long-lasting durability",
    "Ergonomic design focused on comfort and style",
    "Ethically sourced and environmentally friendly",
    "Easy to maintain and clean for daily use"
  ];
  const reviews = product.reviews || [
    { author: "Sarah J.", rating: 5, comment: "Absolutely stunning piece! It transformed my living room completely. The quality is even better than in the photos.", date: "2 days ago" },
    { author: "Michael R.", rating: 5, comment: "Fast shipping and excellent customer service. The product is solid and feels very premium.", date: "1 week ago" },
    { author: "Elena W.", rating: 4, comment: "Beautiful design. It fits perfectly with my minimalist decor. Highly recommended.", date: "2 weeks ago" }
  ];
  const faqs = product.faqs || [
    { question: "What is the shipping time?", answer: "We typically process orders within 24-48 hours. Shipping usually takes 7-14 business days depending on your location." },
    { question: "Do you offer a warranty?", answer: "Yes, we offer a 12-month limited warranty on all our products against manufacturing defects." },
    { question: "What is your return policy?", answer: "We have a 30-day money-back guarantee. If you're not satisfied, you can return the product for a full refund." },
    { question: "Is the assembly difficult?", answer: "Most of our products come pre-assembled or with very simple instructions that take less than 15 minutes." },
    { question: "How do I contact support?", answer: "You can reach our customer support team 24/7 via the contact form or email support@luxestore.com." }
  ];

  const handleBuyNow = () => {
    window.open(product.externalLink, '_blank');
  };

  return (
    <div className="pt-20 pb-24 min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-zinc-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <button 
            onClick={() => navigate('/products')}
            className={`flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors mb-8 text-xs uppercase tracking-widest font-bold ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft size={14} className={isRTL ? 'rotate-180' : ''} />
            {t.productDetail.back}
          </button>

          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${isRTL ? 'rtl' : ''}`}>
            <div className={isRTL ? 'text-right' : ''}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <span className="inline-block px-4 py-1 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-2 text-red-600 animate-pulse">
                    <div className="w-2 h-2 bg-red-600 rounded-full" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {t.productDetail.onlyLeft.replace('{count}', stockCount.toString())}
                    </span>
                  </div>
                </div>

                <h1 className="text-4xl md:text-6xl font-serif italic mb-6 leading-tight tracking-tight">
                  {headline}
                </h1>
                <p className="text-lg md:text-xl text-zinc-600 mb-10 leading-relaxed font-light">
                  {subHeadline}
                </p>
                
                <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">{t.productDetail.saleEnds}</p>
                    <div className="flex gap-4 font-mono text-2xl font-bold text-zinc-900">
                      <div className="flex flex-col items-center">
                        <span>{timeLeft.h.toString().padStart(2, '0')}</span>
                        <span className="text-[8px] uppercase tracking-widest text-zinc-400">Hrs</span>
                      </div>
                      <span>:</span>
                      <div className="flex flex-col items-center">
                        <span>{timeLeft.m.toString().padStart(2, '0')}</span>
                        <span className="text-[8px] uppercase tracking-widest text-zinc-400">Min</span>
                      </div>
                      <span>:</span>
                      <div className="flex flex-col items-center">
                        <span>{timeLeft.s.toString().padStart(2, '0')}</span>
                        <span className="text-[8px] uppercase tracking-widest text-zinc-400">Sec</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-12 w-px bg-zinc-100 hidden md:block" />
                  <div className="text-center md:text-left">
                    <p className="text-3xl font-bold text-zinc-900">${product.price}</p>
                    <p className="text-xs text-zinc-400 line-through">${(product.price * 1.25).toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <button 
                    onClick={handleBuyNow}
                    className="flex-1 py-5 bg-zinc-900 text-white rounded-full text-sm font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {t.productDetail.buyNow}
                    <ExternalLink size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-3 text-zinc-500 mb-8">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-zinc-200 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] font-medium uppercase tracking-wider">
                    {t.productDetail.viewing.replace('{count}', viewers.toString())}
                  </span>
                </div>

                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <ShieldCheck size={18} className="text-emerald-500" />
                    <span className="text-xs font-medium uppercase tracking-wider">Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Truck size={18} className="text-emerald-500" />
                    <span className="text-xs font-medium uppercase tracking-wider">Fast Shipping</span>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="relative">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="aspect-[4/5] bg-white rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white"
              >
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              {/* Floating badge */}
              <div className="absolute -bottom-6 -right-6 md:-right-12 bg-white p-6 rounded-3xl shadow-xl border border-zinc-100 max-w-[200px]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Limited Offer</p>
                <p className="text-2xl font-serif italic text-zinc-900">Save 20% Today</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6">
        <AdPlacement placement="product_detail_top" />

        {/* Benefits Section */}
        <section className="py-24 border-b border-zinc-100">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif italic mb-4">{t.productDetail.whyLove}</h2>
            <div className="w-24 h-1 bg-zinc-900 mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, i) => (
              <div key={i} className="bg-zinc-50 p-8 rounded-3xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-zinc-100">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <CheckCircle2 className="text-emerald-500" size={24} />
                </div>
                <p className="text-zinc-900 font-medium leading-relaxed">
                  {benefit}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Video Placeholder Section */}
        <section className="py-24 border-b border-zinc-100">
          <div className="bg-zinc-900 rounded-[3rem] overflow-hidden relative aspect-video flex items-center justify-center group cursor-pointer">
            <img 
              src={product.images[1] || product.images[0]} 
              alt="Video Preview" 
              className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="relative z-10 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 mx-auto shadow-2xl group-hover:scale-110 transition-transform">
                <PlayCircle size={40} className="text-zinc-900 ml-1" />
              </div>
              <h3 className="text-white text-2xl font-serif italic">{t.productDetail.watchShowcase}</h3>
            </div>
          </div>
        </section>

        <AdPlacement placement="product_detail_mid" />

        {/* Storytelling Section */}
        <section className="py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center border-b border-zinc-100">
          <div className={`order-2 lg:order-1 ${isRTL ? 'text-right' : ''}`}>
            <h2 className="text-3xl md:text-5xl font-serif italic mb-8">{t.productDetail.crafted}</h2>
            <div className="prose prose-zinc max-w-none">
              <p className="text-zinc-600 text-lg leading-relaxed mb-6">
                {product.description}
              </p>
              <p className="text-zinc-600 text-lg leading-relaxed">
                Every detail of the {product.name} has been meticulously thought out to provide you with an unparalleled experience. From the selection of raw materials to the final finishing touches, we ensure that each piece meets our rigorous standards of excellence.
              </p>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 size={16} />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider text-zinc-500">{t.productDetail.handmade}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 size={16} />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider text-zinc-500">{t.productDetail.ecoFriendly}</span>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <img src={product.images[1] || product.images[0]} className="rounded-3xl w-full aspect-square object-cover shadow-lg" referrerPolicy="no-referrer" />
              <img src={product.images[2] || product.images[0]} className="rounded-3xl w-full aspect-[3/4] object-cover shadow-lg" referrerPolicy="no-referrer" />
            </div>
            <div className="pt-8 space-y-4">
              <img src={product.images[3] || product.images[0]} className="rounded-3xl w-full aspect-[3/4] object-cover shadow-lg" referrerPolicy="no-referrer" />
              <img src={product.images[0]} className="rounded-3xl w-full aspect-square object-cover shadow-lg" referrerPolicy="no-referrer" />
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-24 border-b border-zinc-100">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className={isRTL ? 'text-right' : ''}>
              <h2 className="text-3xl md:text-5xl font-serif italic mb-4">{t.productDetail.customerStories}</h2>
              <p className="text-zinc-500 uppercase tracking-widest text-xs font-bold">{t.productDetail.reviewsSub}</p>
            </div>
            <div className="flex items-center gap-4 bg-zinc-50 px-6 py-4 rounded-2xl">
              <div className="text-right">
                <p className="text-2xl font-bold text-zinc-900">4.9</p>
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">{t.productDetail.avgRating}</p>
              </div>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex text-amber-400 mb-4">
                  {[...Array(review.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <p className="text-zinc-700 italic mb-6 leading-relaxed">"{review.comment}"</p>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm text-zinc-900">{review.author}</p>
                  <p className="text-xs text-zinc-400">{review.date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 border-b border-zinc-100">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <HelpCircle className="mx-auto mb-4 text-zinc-400" size={40} />
              <h2 className="text-3xl md:text-5xl font-serif italic mb-4">{t.productDetail.faqTitle}</h2>
              <p className="text-zinc-500">{t.productDetail.faqSub} {product.name}</p>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details key={i} className="group bg-zinc-50 rounded-2xl overflow-hidden">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-bold text-zinc-900 hover:bg-zinc-100 transition-colors">
                    {faq.question}
                    <span className="group-open:rotate-180 transition-transform">↓</span>
                  </summary>
                  <div className="p-6 pt-0 text-zinc-600 leading-relaxed border-t border-zinc-100">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24">
          <div className="bg-zinc-900 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-serif italic text-white mb-8">{t.productDetail.readyTitle}</h2>
              <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light">
                {t.productDetail.readySub}
              </p>
              <div className="flex flex-col items-center gap-6">
                <button 
                  onClick={handleBuyNow}
                  className="px-16 py-6 bg-white text-zinc-900 rounded-full text-sm font-bold uppercase tracking-[0.2em] hover:bg-zinc-100 transition-all shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-3"
                >
                  {t.productDetail.getNow}
                  <ExternalLink size={18} />
                </button>
                <div className="flex flex-wrap justify-center gap-8 mt-4">
                  <div className="flex items-center gap-2 text-white/40">
                    <ShieldCheck size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t.productDetail.guarantee}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/40">
                    <Truck size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t.productDetail.shipping}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/40">
                    <MessageCircle size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t.productDetail.support}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <AdPlacement placement="product_detail_bottom" />
      </div>
    </div>
  );
};
