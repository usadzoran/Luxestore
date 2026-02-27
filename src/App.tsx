/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Admin } from './pages/Admin';
import { AdPlacement } from './components/AdPlacement';
import { db } from './lib/firebase';
import { ref, runTransaction, onValue } from 'firebase/database';
import { LanguageProvider, useLanguage } from './lib/LanguageContext';
import { Language } from './lib/translations';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent = () => {
  const [globalScripts, setGlobalScripts] = React.useState('');
  const { t, isRTL, setLanguage } = useLanguage();

  React.useEffect(() => {
    // Fetch global scripts
    const scriptsRef = ref(db, 'settings/globalScripts');
    const unsubscribe = onValue(scriptsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setGlobalScripts(data);
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (!globalScripts) return;
    
    // Inject global scripts into head
    const container = document.createElement('div');
    container.innerHTML = globalScripts;
    const scripts = container.querySelectorAll('script');
    
    const injectedScripts: HTMLScriptElement[] = [];
    
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr: Attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      document.head.appendChild(newScript);
      injectedScripts.push(newScript);
    });

    return () => {
      injectedScripts.forEach(s => s.remove());
    };
  }, [globalScripts]);

  React.useEffect(() => {
    // Basic visitor tracking
    const trackVisit = async () => {
      let country = 'Unknown';
      let detectedLang: Language = 'en';

      try {
        // Try to get country from IP
        const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          const data = await res.json();
          country = data.country_name || 'Unknown';
          const countryCode = data.country_code || '';

          // Map country to language
          if (['SA', 'AE', 'EG', 'JO', 'KW', 'QA', 'BH', 'OM', 'LB', 'IQ', 'MA', 'DZ', 'TN', 'LY', 'YE', 'SY', 'PS'].includes(countryCode)) {
            detectedLang = 'ar';
          } else if (['FR', 'BE', 'CH', 'CA', 'SN', 'CI', 'CM'].includes(countryCode)) {
            detectedLang = 'fr';
          } else if (['ES', 'MX', 'AR', 'CO', 'CL', 'PE'].includes(countryCode)) {
            detectedLang = 'es';
          }
          
          if (!localStorage.getItem('app_lang')) {
            setLanguage(detectedLang);
          }
        }
      } catch (e) {
        // Silently fail fetch, use fallback
      }

      try {
        const visitorsRef = ref(db, 'stats/visitors');
        await runTransaction(visitorsRef, (current) => {
          if (current === null) {
            return { count: 1, locations: { [country]: 1 } };
          }
          const newCount = (current.count || 0) + 1;
          const newLocations = { ...(current.locations || {}) };
          newLocations[country] = (newLocations[country] || 0) + 1;
          return { count: newCount, locations: newLocations };
        });
      } catch (e) {
        // Database error
      }
    };

    // Only track once per session
    if (!sessionStorage.getItem('visited')) {
      trackVisit();
      sessionStorage.setItem('visited', 'true');
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/p/:id" element={<ProductDetail />} />
          <Route path="/portal-access-secure" element={<Admin />} />
        </Routes>
      </main>

      <footer className="bg-white border-t border-zinc-100 py-16 px-6">
        <div className="max-w-7xl mx-auto mb-12">
          <AdPlacement placement="footer_top" />
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <a href="/" className="text-2xl font-serif italic tracking-tight mb-2 block">
              LuxeStore
            </a>
            <p className="text-zinc-400 text-xs uppercase tracking-widest">
              © 2026 LuxeStore. {t.footer.rights}
            </p>
          </div>
          <div className={`flex gap-8 text-[10px] text-zinc-400 uppercase tracking-widest font-bold ${isRTL ? 'flex-row-reverse' : ''}`}>
            <a href="#" className="hover:text-zinc-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <AppContent />
      </Router>
    </LanguageProvider>
  );
}
