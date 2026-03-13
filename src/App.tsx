import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  Truck, 
  Search, 
  Plus, 
  ChevronLeft, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  Building2, 
  User,
  ArrowRight,
  XCircle,
  Star,
  CreditCard,
  TrendingUp,
  Coins,
  Navigation2,
  ShieldCheck
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Parcel {
  id: string;
  companyName: string;
  receiverName: string;
  phone: string;
  address: string;
  status: 'available' | 'accepted';
  createdAt: number;
  lat?: number;
  lng?: number;
}

type Page = 'home' | 'send' | 'find' | 'details' | 'evaluation' | 'subscription' | 'nearby';
type Language = 'fr' | 'ar';

const translations = {
  fr: {
    welcome: "Bienvenue sur la plateforme !",
    send: "Envoyer un colis",
    find: "Trouver un colis",
    subscription: "Abonnement",
    nearby: "Colis Proches",
    addTitle: "Ajouter un Colis",
    company: "Société de livraison",
    receiver: "Nom du destinataire",
    phone: "Téléphone du destinataire",
    address: "Adresse du destinataire",
    publish: "Publier le Colis",
    findTitle: "Trouver un Colis",
    searchPlaceholder: "Liste des Sociétés de livraison",
    noParcels: "Aucun colis disponible",
    detailsTitle: "Détails du colis",
    accept: "Accepter",
    refuse: "Refuser",
    evalTitle: "Évaluation Livreur",
    rateDriver: "Noter le Livreur",
    validateEval: "Valider l'évaluation",
    userTrust: "+ Confiance Utilisateurs",
    subTitle: "Abonnement Entreprises",
    premiumOffer: "Offre Premium",
    boostActivity: "Boostez votre activité",
    priority: "Visibilité Prioritaire",
    tracking: "Suivi Avancé",
    support: "Support 24/7",
    monthlySub: "Abonnement Mensuel",
    nearbyTitle: "Zone Colis Proches",
    multipleDeliveries: "Livraisons Locales Multiples",
    optimizeTrips: "Optimisez vos trajets",
    moreGains: "Plus de Livraisons = Plus de Gains",
    maximizeIncome: "Maximisez vos revenus",
    published: "Publié !",
    seeDetails: "Voir Details Colis",
    available: "Disponible",
    accepted: "Accepté",
    gainPoint: "Point de Gain €",
    commission: "Commission sur chaque livraison",
    ads: "Commission + Annonces Publicitaires"
  },
  ar: {
    welcome: "مرحباً بكم في المنصة!",
    send: "إرسال طرد",
    find: "البحث عن طرد",
    subscription: "اشتراك",
    nearby: "طرود قريبة",
    addTitle: "إضافة طرد",
    company: "شركة التوصيل",
    receiver: "اسم المستلم",
    phone: "هاتف المستلم",
    address: "عنوان المستلم",
    publish: "نشر الطرد",
    findTitle: "البحث عن طرد",
    searchPlaceholder: "قائمة شركات التوصيل",
    noParcels: "لا توجد طرود متاحة",
    detailsTitle: "تفاصيل الطرد",
    accept: "قبول",
    refuse: "رفض",
    evalTitle: "تقييم السائق",
    rateDriver: "تقييم السائق",
    validateEval: "تأكيد التقييم",
    userTrust: "+ ثقة المستخدمين",
    subTitle: "اشتراك الشركات",
    premiumOffer: "عرض بريميوم",
    boostActivity: "عزز نشاطك",
    priority: "رؤية ذات أولوية",
    tracking: "تتبع متقدم",
    support: "دعم 24/7",
    monthlySub: "اشتراك شهري",
    nearbyTitle: "منطقة الطرود القريبة",
    multipleDeliveries: "عمليات توصيل محلية متعددة",
    optimizeTrips: "حسّن مساراتك",
    moreGains: "توصيل أكثر = أرباح أكثر",
    maximizeIncome: "ضاعف دخلك",
    published: "تم النشر!",
    seeDetails: "عرض التفاصيل",
    available: "متاح",
    accepted: "تم القبول",
    gainPoint: "نقطة ربح €",
    commission: "عمولة على كل عملية توصيل",
    ads: "عمولة + إعلانات تجارية"
  }
};

// --- Main App Component ---
export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [lang, setLang] = useState<Language>('fr');
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [rating, setRating] = useState(0);

  const t = translations[lang];
  const isRTL = lang === 'ar';

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('wassali_parcels');
    if (saved) {
      try {
        setParcels(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved parcels", e);
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('wassali_parcels', JSON.stringify(parcels));
  }, [parcels]);

  // --- Actions ---
  const addParcel = (newParcel: Omit<Parcel, 'id' | 'status' | 'createdAt'>) => {
    const parcel: Parcel = {
      ...newParcel,
      id: Math.random().toString(36).substring(2, 9),
      status: 'available',
      createdAt: Date.now(),
      // Add random location for demo
      lat: 48.8566 + (Math.random() - 0.5) * 0.1,
      lng: 2.3522 + (Math.random() - 0.5) * 0.1,
    };
    setParcels(prev => [parcel, ...prev]);
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      setPage('evaluation');
    }, 1500);
  };

  const updateParcelStatus = (id: string, status: 'available' | 'accepted') => {
    setParcels(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    if (selectedParcel?.id === id) {
      setSelectedParcel(prev => prev ? { ...prev, status } : null);
    }
  };

  const filteredParcels = parcels.filter(p => 
    p.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.receiverName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Render Helpers ---
  const renderHeader = (title: string, showBack = true, backTo: Page = 'home') => (
    <header className={cn(
      "sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center gap-4",
      isRTL && "flex-row-reverse"
    )}>
      {showBack && (
        <button 
          onClick={() => setPage(backTo)}
          className={cn("p-2 hover:bg-slate-100 rounded-full transition-colors", isRTL ? "-mr-2" : "-ml-2")}
        >
          {isRTL ? <ArrowRight className="w-6 h-6 text-slate-600" /> : <ChevronLeft className="w-6 h-6 text-slate-600" />}
        </button>
      )}
      <h1 className={cn("text-xl font-bold text-slate-900 flex-1", isRTL && "text-right")}>{title}</h1>
      {!showBack && <Truck className="w-6 h-6 text-emerald-600" />}
    </header>
  );

  const GainPoint = ({ label, icon: Icon = Coins }: { label: string, icon?: any }) => (
    <div className={cn("bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3 mt-4", isRTL && "flex-row-reverse text-right")}>
      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
        <Icon className="w-5 h-5 text-amber-600" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">{t.gainPoint}</p>
        <p className="text-sm font-bold text-amber-900">{label}</p>
      </div>
    </div>
  );

  return (
    <div className={cn(
      "min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100",
      isRTL && "font-arabic"
    )} dir={isRTL ? 'rtl' : 'ltr'}>
      <AnimatePresence mode="wait">
        {/* --- HOME PAGE --- */}
        {page === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col min-h-screen relative overflow-hidden"
          >
            {/* Language Toggle */}
            <div className="absolute top-6 right-6 z-50 flex gap-2">
              <button 
                onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
                className="bg-white/80 backdrop-blur-sm border border-slate-100 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm hover:bg-white transition-all"
              >
                {lang === 'fr' ? 'العربية' : 'Français'}
              </button>
            </div>

            <div className="p-8 pt-20 flex flex-col items-center text-center flex-1">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-24 h-24 bg-emerald-100 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl shadow-emerald-100/50 relative"
              >
                <Truck className="w-12 h-12 text-emerald-600" />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 rounded-full border-4 border-white"
                />
              </motion.div>
              
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-2">
                  Wassali
                </h1>
                <p className="text-slate-500 font-medium mb-12">
                  {t.welcome}
                </p>
              </motion.div>

              <div className="w-full max-w-sm space-y-4">
                <motion.button 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  onClick={() => setPage('send')}
                  className="group w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 px-8 rounded-2xl font-bold text-xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] flex items-center justify-between"
                >
                  <span className="flex items-center gap-3">
                    <Package className="w-6 h-6" />
                    {t.send}
                  </span>
                  <ArrowRight className={cn("w-5 h-5 opacity-50 group-hover:opacity-100 transition-all", isRTL ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1")} />
                </motion.button>

                <motion.button 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => setPage('find')}
                  className="group w-full bg-blue-600 hover:bg-blue-700 text-white py-6 px-8 rounded-2xl font-bold text-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-between"
                >
                  <span className="flex items-center gap-3">
                    <Search className="w-6 h-6" />
                    {t.find}
                  </span>
                  <ArrowRight className={cn("w-5 h-5 opacity-50 group-hover:opacity-100 transition-all", isRTL ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1")} />
                </motion.button>

                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="pt-8 grid grid-cols-2 gap-4"
                >
                  <button 
                    onClick={() => setPage('subscription')}
                    className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-2 hover:border-indigo-200 transition-colors"
                  >
                    <CreditCard className="w-6 h-6 text-indigo-500" />
                    <span className="text-xs font-bold">{t.subscription}</span>
                  </button>
                  <button 
                    onClick={() => setPage('nearby')}
                    className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-2 hover:border-rose-200 transition-colors"
                  >
                    <Navigation2 className="w-6 h-6 text-rose-500" />
                    <span className="text-xs font-bold">{t.nearby}</span>
                  </button>
                </motion.div>
              </div>
            </div>
            
            <footer className="p-6 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              © 2024 Wassali Delivery
            </footer>
          </motion.div>
        )}

        {/* --- SEND PAGE (Ajouter un Colis) --- */}
        {page === 'send' && (
          <motion.div
            key="send"
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            className="flex flex-col min-h-screen"
          >
            {renderHeader(t.addTitle)}
            
            <div className="p-6 flex-1 max-w-md mx-auto w-full">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    addParcel({
                      companyName: formData.get('company') as string,
                      receiverName: formData.get('receiver') as string,
                      phone: formData.get('phone') as string,
                      address: formData.get('address') as string,
                    });
                  }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <div className="relative">
                      <Building2 className={cn("absolute top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400", isRTL ? "right-4" : "left-4")} />
                      <input required name="company" placeholder={t.company} className={cn("w-full bg-slate-50 border-none rounded-2xl py-4 pr-4 focus:ring-2 focus:ring-emerald-500", isRTL ? "pl-4 pr-12 text-right" : "pl-12 pr-4")} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <User className={cn("absolute top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400", isRTL ? "right-4" : "left-4")} />
                      <input required name="receiver" placeholder={t.receiver} className={cn("w-full bg-slate-50 border-none rounded-2xl py-4 pr-4 focus:ring-2 focus:ring-emerald-500", isRTL ? "pl-4 pr-12 text-right" : "pl-12 pr-4")} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Phone className={cn("absolute top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400", isRTL ? "right-4" : "left-4")} />
                      <input required name="phone" type="tel" placeholder={t.phone} className={cn("w-full bg-slate-50 border-none rounded-2xl py-4 pr-4 focus:ring-2 focus:ring-emerald-500", isRTL ? "pl-4 pr-12 text-right" : "pl-12 pr-4")} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <MapPin className={cn("absolute top-4 w-5 h-5 text-slate-400", isRTL ? "right-4" : "left-4")} />
                      <textarea required name="address" rows={3} placeholder={t.address} className={cn("w-full bg-slate-50 border-none rounded-2xl py-4 pr-4 focus:ring-2 focus:ring-emerald-500 resize-none", isRTL ? "pl-4 pr-12 text-right" : "pl-12 pr-4")} />
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-rose-500 text-white py-5 rounded-2xl font-bold shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all active:scale-[0.98]">
                    {t.publish}
                  </button>
                </form>

                <GainPoint label={t.commission} />
              </div>
            </div>

            <AnimatePresence>
              {showConfirmation && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm"
                >
                  <div className="bg-white rounded-[2.5rem] p-10 flex flex-col items-center text-center shadow-2xl max-w-xs">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{t.published}</h3>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* --- EVALUATION PAGE --- */}
        {page === 'evaluation' && (
          <motion.div
            key="evaluation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col min-h-screen"
          >
            {renderHeader(t.evalTitle)}
            <div className="p-6 flex-1 max-w-md mx-auto w-full">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center">
                <h2 className="text-xl font-bold mb-6">{t.rateDriver}</h2>
                <div className="flex justify-center gap-2 mb-8">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setRating(s)}>
                      <Star className={cn("w-10 h-10 transition-colors", s <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200")} />
                    </button>
                  ))}
                </div>
                
                <button 
                  onClick={() => setPage('home')}
                  className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-rose-100"
                >
                  {t.validateEval}
                </button>

                <div className={cn("mt-8 p-4 bg-emerald-50 rounded-2xl flex items-center gap-3", isRTL && "flex-row-reverse")}>
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  <span className="text-sm font-bold text-emerald-900">{t.userTrust}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- FIND PAGE (Trouver un Colis) --- */}
        {page === 'find' && (
          <motion.div
            key="find"
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            className="flex flex-col min-h-screen"
          >
            {renderHeader(t.findTitle)}
            
            <div className="p-6 space-y-6 max-w-md mx-auto w-full">
              <div className="relative">
                <Search className={cn("absolute top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400", isRTL ? "right-4" : "left-4")} />
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className={cn("w-full bg-white border-none rounded-2xl py-4 shadow-sm focus:ring-2 focus:ring-blue-500 transition-all", isRTL ? "pl-4 pr-12 text-right" : "pl-12 pr-4")}
                />
              </div>

              <div className="space-y-4">
                {filteredParcels.length === 0 ? (
                  <div className="text-center py-20">
                    <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">{t.noParcels}</p>
                  </div>
                ) : (
                  filteredParcels.map((parcel) => (
                    <motion.button
                      layoutId={parcel.id}
                      key={parcel.id}
                      onClick={() => {
                        setSelectedParcel(parcel);
                        setPage('details');
                      }}
                      className={cn("w-full bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 text-left hover:shadow-md transition-all active:scale-[0.99]", isRTL && "flex-row-reverse text-right")}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                        <Building2 className="w-7 h-7 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{parcel.companyName}</h3>
                        <span className="text-blue-600 text-xs font-bold">{t.seeDetails}</span>
                      </div>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                        parcel.status === 'accepted' ? "bg-slate-100 text-slate-500" : "bg-blue-100 text-blue-700"
                      )}>
                        {parcel.status === 'accepted' ? t.accepted : t.available}
                      </div>
                    </motion.button>
                  ))
                )}
              </div>

              <GainPoint label={t.ads} icon={TrendingUp} />
            </div>
          </motion.div>
        )}

        {/* --- DETAILS PAGE --- */}
        {page === 'details' && selectedParcel && (
          <motion.div
            key="details"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col min-h-screen"
          >
            {renderHeader(t.detailsTitle, true, 'find')}

            <div className="p-6 flex-1 max-w-md mx-auto w-full">
              <motion.div 
                layoutId={selectedParcel.id}
                className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100"
              >
                <div className="bg-blue-600 p-8 text-white flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-4">
                    <Building2 className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold">{selectedParcel.companyName}</h2>
                </div>

                <div className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className={cn("flex gap-4", isRTL && "flex-row-reverse text-right")}>
                      <User className="w-5 h-5 text-slate-400 shrink-0" />
                      <p className="text-sm font-medium">{selectedParcel.receiverName}</p>
                    </div>
                    <div className={cn("flex gap-4", isRTL && "flex-row-reverse text-right")}>
                      <Phone className="w-5 h-5 text-slate-400 shrink-0" />
                      <p className="text-sm font-medium">{selectedParcel.phone}</p>
                    </div>
                    <div className={cn("flex gap-4", isRTL && "flex-row-reverse text-right")}>
                      <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                      <p className="text-sm font-medium">{selectedParcel.address}</p>
                    </div>
                  </div>

                  <div className="pt-4 grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => {
                        updateParcelStatus(selectedParcel.id, 'accepted');
                        setPage('find');
                      }}
                      className="bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100"
                    >
                      {t.accept}
                    </button>
                    <button 
                      onClick={() => setPage('find')}
                      className="bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-rose-100"
                    >
                      {t.refuse}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* --- SUBSCRIPTION PAGE (Abonnement Entreprises) --- */}
        {page === 'subscription' && (
          <motion.div
            key="subscription"
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            className="flex flex-col min-h-screen"
          >
            {renderHeader(t.subTitle)}
            <div className="p-6 flex-1 max-w-md mx-auto w-full">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
                <div className="bg-indigo-600 rounded-3xl p-6 text-white mb-8 text-center">
                  <h3 className="text-2xl font-bold mb-2">{t.premiumOffer}</h3>
                  <p className="text-indigo-100 text-sm">{t.boostActivity}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className={cn("flex items-center gap-3", isRTL && "flex-row-reverse text-right")}>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="font-medium">{t.priority}</span>
                  </li>
                  <li className={cn("flex items-center gap-3", isRTL && "flex-row-reverse text-right")}>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="font-medium">{t.tracking}</span>
                  </li>
                  <li className={cn("flex items-center gap-3", isRTL && "flex-row-reverse text-right")}>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="font-medium">{t.support}</span>
                  </li>
                </ul>

                <button className="w-full bg-rose-500 text-white py-5 rounded-2xl font-bold shadow-lg shadow-rose-100">
                  {t.monthlySub}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- NEARBY PAGE (Zone Colis Proches) --- */}
        {page === 'nearby' && (
          <motion.div
            key="nearby"
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            className="flex flex-col min-h-screen"
          >
            {renderHeader(t.nearbyTitle)}
            <div className="p-6 flex-1 max-w-md mx-auto w-full space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className={cn("flex items-center gap-4 mb-6 p-4 bg-rose-50 rounded-2xl border border-rose-100", isRTL && "flex-row-reverse text-right")}>
                  <Navigation2 className="w-8 h-8 text-rose-500" />
                  <div>
                    <h3 className="font-bold">{t.multipleDeliveries}</h3>
                    <p className="text-xs text-rose-600">{t.optimizeTrips}</p>
                  </div>
                </div>

                {/* Map Simulation */}
                <div className="h-64 bg-slate-100 rounded-2xl relative overflow-hidden mb-6 border border-slate-200">
                  <div className="absolute inset-0 bg-[url('https://api.maptiler.com/maps/basic-v2/static/2.3522,48.8566,12/600x400.png?key=get_your_own_key')] bg-cover bg-center opacity-50" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="w-12 h-12 bg-rose-500/20 rounded-full animate-ping absolute -inset-0" />
                      <div className="w-12 h-12 bg-rose-500/40 rounded-full animate-pulse absolute -inset-0" />
                      <MapPin className="w-8 h-8 text-rose-600 relative z-10" />
                    </div>
                  </div>
                  {parcels.slice(0, 3).map((p, i) => (
                    <div key={p.id} className="absolute" style={{ top: `${30 + i * 20}%`, left: `${20 + i * 25}%` }}>
                      <Package className="w-5 h-5 text-blue-600 animate-bounce" />
                    </div>
                  ))}
                </div>

                <div className="bg-rose-500 rounded-2xl p-6 text-white text-center">
                  <p className="text-sm font-bold mb-1">{t.moreGains}</p>
                  <p className="text-[10px] opacity-80 uppercase tracking-widest">{t.maximizeIncome}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
