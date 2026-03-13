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
  XCircle
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
}

type Page = 'home' | 'send' | 'find' | 'details';

// --- Main App Component ---
export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

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
    };
    setParcels(prev => [parcel, ...prev]);
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      setPage('home');
    }, 2000);
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
  const renderHeader = (title: string, showBack = true) => (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center gap-4">
      {showBack && (
        <button 
          onClick={() => setPage('home')}
          className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-slate-600" />
        </button>
      )}
      <h1 className="text-xl font-bold text-slate-900 flex-1">{title}</h1>
      {!showBack && <Truck className="w-6 h-6 text-emerald-600" />}
    </header>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100">
      <AnimatePresence mode="wait">
        {/* --- HOME PAGE --- */}
        {page === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col min-h-screen"
          >
            <div className="p-8 pt-12 flex flex-col items-center text-center flex-1">
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mb-6 shadow-inner"
              >
                <Truck className="w-10 h-10 text-emerald-600" />
              </motion.div>
              
              <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">
                Wassali
              </h1>
              <p className="text-slate-500 font-medium mb-10">
                Coordination de livraison simple et rapide
              </p>

              <div className="relative w-full aspect-[4/3] max-w-sm mb-12 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-emerald-200/50">
                <img 
                  src="https://images.unsplash.com/photo-1586769852044-692d6e3703f0?auto=format&fit=crop&q=80&w=800" 
                  alt="Delivery Illustration" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              <div className="w-full max-w-sm space-y-4">
                <button 
                  onClick={() => setPage('send')}
                  className="group w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 px-8 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] flex items-center justify-between"
                >
                  <span className="flex items-center gap-3">
                    <Package className="w-6 h-6" />
                    Envoyer un colis
                  </span>
                  <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>

                <button 
                  onClick={() => setPage('find')}
                  className="group w-full bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-100 py-5 px-8 rounded-2xl font-bold text-lg shadow-sm transition-all active:scale-[0.98] flex items-center justify-between"
                >
                  <span className="flex items-center gap-3">
                    <Search className="w-6 h-6 text-emerald-600" />
                    Trouver un colis
                  </span>
                  <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>
            
            <footer className="p-6 text-center text-slate-400 text-xs font-medium uppercase tracking-widest">
              © 2024 Wassali Delivery
            </footer>
          </motion.div>
        )}

        {/* --- SEND PAGE --- */}
        {page === 'send' && (
          <motion.div
            key="send"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col min-h-screen"
          >
            {renderHeader("Envoyer un colis")}
            
            <div className="p-6 flex-1 max-w-md mx-auto w-full">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h2 className="text-2xl font-bold mb-6">Détails de l'envoi</h2>
                
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
                    <label className="text-sm font-semibold text-slate-500 ml-1">Société de livraison</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        required
                        name="company"
                        placeholder="ex: DHL, Express..."
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-500 ml-1">Destinataire</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        required
                        name="receiver"
                        placeholder="Nom et prénom"
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-500 ml-1">Téléphone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        required
                        name="phone"
                        type="tel"
                        placeholder="06 00 00 00 00"
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-500 ml-1">Adresse de livraison</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                      <textarea 
                        required
                        name="address"
                        rows={3}
                        placeholder="Adresse complète"
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-[0.98] mt-4"
                  >
                    Publier la demande
                  </button>
                </form>
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
                    <h3 className="text-2xl font-bold mb-2">Publié !</h3>
                    <p className="text-slate-500">Votre demande de livraison a été enregistrée avec succès.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* --- FIND PAGE --- */}
        {page === 'find' && (
          <motion.div
            key="find"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col min-h-screen"
          >
            {renderHeader("Colis disponibles")}
            
            <div className="p-6 space-y-6 max-w-md mx-auto w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une société..."
                  className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div className="space-y-4">
                {filteredParcels.length === 0 ? (
                  <div className="text-center py-20">
                    <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">Aucun colis disponible</p>
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
                      className="w-full bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 text-left hover:shadow-md transition-all active:scale-[0.99]"
                    >
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0",
                        parcel.status === 'accepted' ? "bg-slate-100" : "bg-emerald-50"
                      )}>
                        <Building2 className={cn(
                          "w-7 h-7",
                          parcel.status === 'accepted' ? "text-slate-400" : "text-emerald-600"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{parcel.companyName}</h3>
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <User className="w-3.5 h-3.5" />
                          <span className="truncate">{parcel.receiverName}</span>
                        </div>
                      </div>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                        parcel.status === 'accepted' 
                          ? "bg-slate-100 text-slate-500" 
                          : "bg-emerald-100 text-emerald-700"
                      )}>
                        {parcel.status === 'accepted' ? 'Accepté' : 'Disponible'}
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
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
            <header className="px-6 py-4 flex items-center gap-4">
              <button 
                onClick={() => setPage('find')}
                className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-slate-600" />
              </button>
              <h1 className="text-xl font-bold text-slate-900 flex-1">Détails du colis</h1>
            </header>

            <div className="p-6 flex-1 max-w-md mx-auto w-full">
              <motion.div 
                layoutId={selectedParcel.id}
                className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100"
              >
                <div className="bg-emerald-600 p-8 text-white flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-4">
                    <Building2 className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold">{selectedParcel.companyName}</h2>
                  <p className="opacity-80 text-sm mt-1">Demande de livraison</p>
                </div>

                <div className="p-8 space-y-8">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Destinataire</p>
                      <p className="text-lg font-bold">{selectedParcel.receiverName}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Téléphone</p>
                      <p className="text-lg font-bold">{selectedParcel.phone}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Adresse</p>
                      <p className="text-lg font-bold leading-snug">{selectedParcel.address}</p>
                    </div>
                  </div>

                  <div className="pt-4 space-y-3">
                    {selectedParcel.status === 'available' ? (
                      <>
                        <button 
                          onClick={() => {
                            updateParcelStatus(selectedParcel.id, 'accepted');
                            setPage('find');
                          }}
                          className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                        >
                          <CheckCircle2 className="w-6 h-6" />
                          Accepter la livraison
                        </button>
                        <button 
                          onClick={() => setPage('find')}
                          className="w-full bg-white text-slate-400 py-5 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
                        >
                          <XCircle className="w-6 h-6" />
                          Refuser
                        </button>
                      </>
                    ) : (
                      <div className="bg-slate-50 p-6 rounded-2xl text-center">
                        <p className="text-slate-500 font-bold flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          Livraison déjà acceptée
                        </p>
                        <button 
                          onClick={() => updateParcelStatus(selectedParcel.id, 'available')}
                          className="mt-4 text-xs text-slate-400 underline"
                        >
                          Remettre en disponibilité
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
