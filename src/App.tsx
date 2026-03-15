import React, { useState, useEffect, Component } from 'react';
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
  User as UserIcon,
  ArrowRight,
  LogOut,
  LogIn,
  UserPlus,
  ShieldCheck,
  Clock,
  CheckCircle,
  LayoutDashboard
} from 'lucide-react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AdminLogin, AdminDashboard } from './Admin';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Firebase Imports
import { db, auth } from './firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

// --- Error Handling ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(error instanceof Error ? error.message : String(error));
}

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Parcel {
  id: string;
  deliveryCompany: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  destinationArea: string; // New field for public view
  ownerId: string;
  status: 'pending' | 'accepted' | 'delivered';
  deliveryUID?: string;
  createdAt: number;
}

interface UserProfile {
  uid: string;
  email: string;
  role: 'client' | 'driver';
  name?: string;
  phone?: string;
  address?: string;
  createdAt?: number;
}

interface AdsConfig {
  topBar: string;
  products: string;
  tracking: string;
  footer: string;
}

type Page = 'landing' | 'home' | 'add' | 'my-parcels' | 'available-parcels' | 'driver-deliveries';

function useAds() {
  const [ads, setAds] = useState<AdsConfig | null>(null);

  useEffect(() => {
    const docRef = doc(db, 'config', 'ads');
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        setAds(doc.data() as AdsConfig);
      }
    });
  }, []);

  return ads;
}

function AdSlot({ html }: { html?: string }) {
  if (!html) return null;
  return <div className="w-full overflow-hidden flex justify-center" dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/admin-login" element={<AdminLoginWrapper />} />
        <Route path="/wassali-admin" element={<AdminLoginWrapper />} />
        <Route path="/secure-admin-panel" element={<AdminDashboardWrapper />} />
        <Route path="*" element={<MainApp />} />
      </Routes>
    </HashRouter>
  );
}

function AdminLoginWrapper() {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuth(!!user && localStorage.getItem('admin_auth') === 'true');
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return null;
  if (isAuth) return <Navigate to="/secure-admin-panel" />;
  
  return <AdminLogin onLogin={() => {
    localStorage.setItem('admin_auth', 'true');
    setIsAuth(true);
  }} />;
}

function AdminDashboardWrapper() {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuth(!!user && localStorage.getItem('admin_auth') === 'true');
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
    </div>
  );

  if (!isAuth) return <Navigate to="/wassali-admin" />;
  return <AdminDashboard />;
}

function MainApp() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [page, setPage] = useState<Page>('landing');
  const [isLogin, setIsLogin] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'client' | 'driver'>('client');
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [driverParcels, setDriverParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const ads = useAds();

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const docRef = doc(db, 'users', u.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
            // Automatically go to home if logged in and profile exists
            if (page === 'landing') setPage('home');
          } else {
            // If user exists but no profile, we might need to create one or stay on landing
            console.warn("User logged in but no profile found in Firestore.");
            setProfile(null);
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
      } else {
        setProfile(null);
        if (page !== 'available-parcels') setPage('landing');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [page]);

  // Data Listener
  useEffect(() => {
    if (!user || !profile) {
      setParcels([]);
      setDriverParcels([]);
      return;
    }

    let q;
    let dq;

    if (profile.role === 'client') {
      // Clients see only their own parcels
      q = query(
        collection(db, 'parcels'),
        where('ownerId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
    } else {
      // Drivers see all available (pending) parcels
      q = query(
        collection(db, 'parcels'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      // Drivers also see parcels they have accepted
      dq = query(
        collection(db, 'parcels'),
        where('deliveryUID', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Parcel));
      setParcels(data);
    });

    let unsubscribeDriver: any;
    if (dq) {
      unsubscribeDriver = onSnapshot(dq, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Parcel));
        setDriverParcels(data);
      });
    }

    return () => {
      unsubscribe();
      if (unsubscribeDriver) unsubscribeDriver();
    };
  }, [user, profile]);

  // --- Actions ---

  const handleRegister = async (email: string, pass: string, role: 'client' | 'driver') => {
    try {
      setError(null);
      setAuthLoading(true);
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const newUser: UserProfile = { 
        uid: res.user.uid, 
        email, 
        role,
        createdAt: Date.now()
      };
      try {
        await setDoc(doc(db, 'users', res.user.uid), newUser);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${res.user.uid}`);
      }
      setProfile(newUser);
      setPage('home');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (email: string, pass: string) => {
    try {
      setError(null);
      setAuthLoading(true);
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async (role: 'client' | 'driver') => {
    try {
      setError(null);
      setAuthLoading(true);
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      
      // Check if profile exists, if not create it
      const docRef = doc(db, 'users', res.user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        const newUser: UserProfile = { 
          uid: res.user.uid, 
          email: res.user.email || '', 
          role,
          createdAt: Date.now()
        };
        await setDoc(docRef, newUser);
        setProfile(newUser);
      } else {
        setProfile(docSnap.data() as UserProfile);
      }
      setPage('home');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setPage('landing');
  };

  const addParcel = async (data: Omit<Parcel, 'id' | 'ownerId' | 'status' | 'createdAt'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'parcels'), {
        ...data,
        ownerId: user.uid,
        senderName: profile?.name || user.email?.split('@')[0] || 'Client',
        status: 'pending',
        createdAt: Date.now()
      });
      setPage('home');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const acceptParcel = async (parcelId: string) => {
    if (!user) return;
    try {
      const parcelRef = doc(db, 'parcels', parcelId);
      await updateDoc(parcelRef, {
        status: 'accepted',
        deliveryUID: user.uid
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const markAsDelivered = async (parcelId: string) => {
    try {
      const parcelRef = doc(db, 'parcels', parcelId);
      await updateDoc(parcelRef, { status: 'delivered' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // --- Render Helpers ---
  const Header = ({ title, showBack = true }: { title: string, showBack?: boolean }) => (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3 sm:gap-4">
        {showBack && (
          <button onClick={() => setPage('home')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
          </button>
        )}
        <h1 className="text-lg sm:text-xl font-black tracking-tighter text-slate-900">{title}</h1>
      </div>
      <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
        <LogOut className="w-5 h-5" />
      </button>
    </header>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <AdSlot html={ads?.topBar} />
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
        {page === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col bg-white"
          >
            {/* Top Right Buttons (only if auth is shown) */}
            {showAuth && !user && (
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex gap-2 sm:gap-3 z-10">
                <button 
                  onClick={() => setIsLogin(true)}
                  className={cn(
                    "px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all",
                    isLogin ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  Connexion
                </button>
                <button 
                  onClick={() => setIsLogin(false)}
                  className={cn(
                    "px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all",
                    !isLogin ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  Inscription
                </button>
              </div>
            )}

            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
              {!showAuth && !user ? (
                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center py-12 md:py-0">
                  <div className="text-left space-y-6 order-2 md:order-1">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                      <Truck className="w-4 h-4" /> Livraison Premium & Express
                    </div>
                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter text-slate-900 leading-none">
                      Wassali
                    </h1>
                    <p className="text-slate-500 text-lg sm:text-xl leading-relaxed max-w-md">
                      L'excellence de la livraison à votre portée. Connectez-vous avec les meilleurs livreurs pour un service rapide, sécurisé et irréprochable.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                      <button 
                        onClick={() => { setSelectedRole('client'); setShowAuth(true); setIsLogin(false); }}
                        className="group bg-slate-900 text-white p-6 rounded-[2rem] hover:bg-slate-800 transition-all text-left shadow-2xl shadow-slate-200 border border-white/10"
                      >
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <UserIcon className="w-6 h-6" />
                        </div>
                        <div className="font-bold text-lg">Client</div>
                        <div className="text-xs text-slate-400">Envoyer un colis avec soin</div>
                      </button>
                      
                      <button 
                        onClick={() => { setSelectedRole('driver'); setShowAuth(true); setIsLogin(false); }}
                        className="group bg-emerald-600 text-white p-6 rounded-[2rem] hover:bg-emerald-500 transition-all text-left shadow-2xl shadow-emerald-100 border border-white/10"
                      >
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Truck className="w-6 h-6" />
                        </div>
                        <div className="font-bold text-lg">Livreur</div>
                        <div className="text-xs text-emerald-100">Rejoindre l'élite du transport</div>
                      </button>
                    </div>

                    <button 
                      onClick={() => setPage('available-parcels')}
                      className="w-full py-4 text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Search className="w-4 h-4" /> Voir les colis disponibles sans compte
                    </button>
                  </div>

                  <div className="relative order-1 md:order-2">
                    <div className="absolute -inset-4 bg-emerald-100 rounded-[3rem] -rotate-3 scale-95 opacity-50 blur-2xl"></div>
                    <img 
                      src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&q=80&w=1000" 
                      alt="Happy Customer Delivery" 
                      className="relative rounded-[2rem] sm:rounded-[3rem] shadow-2xl w-full aspect-[4/5] object-cover border-4 sm:border-8 border-white"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-50 flex items-center gap-3 sm:gap-4 animate-bounce">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-black text-sm sm:text-base text-slate-900">Satisfaction</div>
                        <div className="text-[8px] sm:text-[10px] text-slate-400 uppercase font-bold tracking-widest">Garantie 100%</div>
                      </div>
                    </div>
                    
                    <div className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl border border-slate-50 flex items-center gap-2 sm:gap-3">
                      <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                          <div key={i} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                          </div>
                        ))}
                      </div>
                      <div className="text-[8px] sm:text-[10px] font-bold text-slate-600">+2k Clients Heureux</div>
                    </div>
                  </div>
                </div>
              ) : showAuth && !user ? (
                <div className="w-full max-w-md">
                  <button 
                    onClick={() => setShowAuth(false)}
                    className="mb-8 flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-sm"
                  >
                    <ChevronLeft className="w-4 h-4" /> Retour à l'accueil
                  </button>
                  <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl border border-slate-100">
                    <div className="flex flex-col items-center mb-6 sm:mb-8">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
                        {selectedRole === 'client' ? <UserIcon className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" /> : <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                        {isLogin ? 'Connexion' : 'Inscription'} {selectedRole === 'client' ? 'Client' : 'Livreur'}
                      </h2>
                    </div>
                    <AuthForm 
                      isLogin={isLogin}
                      setIsLogin={setIsLogin}
                      onLogin={handleLogin} 
                      onRegister={handleRegister} 
                      onGoogleLogin={handleGoogleLogin}
                      initialRole={selectedRole}
                      error={error}
                      clearError={() => setError(null)}
                      loading={authLoading}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                   <div className="mb-12">
                    <div className="w-24 h-24 bg-emerald-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <Truck className="w-12 h-12 text-emerald-600" />
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter mb-4 text-slate-900">Wassali</h1>
                    <p className="text-slate-500 text-lg max-w-sm mx-auto leading-relaxed">
                      Ravi de vous revoir ! Accédez à votre espace pour gérer vos livraisons premium.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
                    <button 
                      onClick={() => setPage('available-parcels')}
                      className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group"
                    >
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <Search className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold">Voir les colis</div>
                        <div className="text-xs text-slate-400">Trouvez des livraisons à effectuer</div>
                      </div>
                    </button>
                    <button 
                      onClick={() => setPage('home')}
                      className="bg-emerald-600 text-white p-6 rounded-3xl shadow-lg shadow-emerald-100 flex items-center justify-center gap-3 font-bold"
                    >
                      Accéder à mon espace <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {page === 'home' && profile && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen flex flex-col"
          >
            <Header title="Wassali" showBack={false} />
            
            <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
              <div className="mb-8">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {profile.role === 'client' ? <UserIcon className="w-10 h-10 text-blue-600" /> : <Truck className="w-10 h-10 text-blue-600" />}
                </div>
                <h2 className="text-2xl font-bold">Bienvenue, {profile.email.split('@')[0]}</h2>
                <p className="text-slate-500">Vous êtes connecté en tant que <span className="font-bold text-blue-600">{profile.role === 'client' ? 'Client' : 'Livreur'}</span></p>
              </div>

              <div className="w-full max-w-sm space-y-4">
                {profile.role === 'client' ? (
                  <>
                    <button 
                      onClick={() => setPage('add')}
                      className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-100 flex items-center justify-center gap-3"
                    >
                      <Plus className="w-6 h-6" /> Envoyer un colis
                    </button>
                    <button 
                      onClick={() => setPage('my-parcels')}
                      className="w-full bg-white text-slate-900 border border-slate-200 py-5 rounded-2xl font-bold text-lg shadow-sm flex items-center justify-center gap-3"
                    >
                      <Package className="w-6 h-6 text-slate-400" /> Mes colis
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setPage('available-parcels')}
                      className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold text-lg shadow-lg shadow-blue-100 flex items-center justify-center gap-3"
                    >
                      <Search className="w-6 h-6" /> Colis disponibles
                    </button>
                    <button 
                      onClick={() => setPage('driver-deliveries')}
                      className="w-full bg-white text-slate-900 border border-slate-200 py-5 rounded-2xl font-bold text-lg shadow-sm flex items-center justify-center gap-3"
                    >
                      <Truck className="w-6 h-6 text-slate-400" /> Mes livraisons
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {page === 'add' && (
          <motion.div
            key="add"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen flex flex-col"
          >
            <Header title="Nouveau Colis" />
            <AdSlot html={ads?.products} />
            <div className="p-4 sm:p-6 max-w-md mx-auto w-full">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  addParcel({
                    deliveryCompany: fd.get('company') as string,
                    receiverName: fd.get('name') as string,
                    receiverPhone: fd.get('phone') as string,
                    receiverAddress: fd.get('address') as string,
                    destinationArea: fd.get('area') as string,
                  });
                }}
                className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-4"
              >
                <div className="p-4 bg-blue-50 rounded-2xl text-xs text-blue-700 flex gap-3 items-start">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <p>Les informations sensibles (nom, téléphone, adresse exacte) ne seront visibles par le livreur qu'après acceptation du colis.</p>
                </div>
                <Input icon={Building2} name="company" placeholder="Entreprise de livraison" required />
                <Input icon={MapPin} name="area" placeholder="Quartier / Ville de destination" required />
                <Input icon={UserIcon} name="name" placeholder="Nom du destinataire (Privé)" required />
                <Input icon={Phone} name="phone" placeholder="Téléphone (Privé)" type="tel" required />
                <textarea 
                  name="address" 
                  placeholder="Adresse exacte (Privé)" 
                  required 
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-12 focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                />
                <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100">
                  Publier la demande
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {page === 'my-parcels' && (
          <motion.div
            key="my-parcels"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen flex flex-col"
          >
            <Header title="Mes Colis" />
            <AdSlot html={ads?.tracking} />
            <div className="p-4 sm:p-6 max-w-md mx-auto w-full space-y-4">
              {parcels.length === 0 ? (
                <div className="text-center py-20 text-slate-400">Aucun colis trouvé.</div>
              ) : (
                parcels.map(p => (
                  <div key={p.id} className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{p.deliveryCompany}</h3>
                        <p className="text-sm text-slate-500">{p.destinationArea}</p>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="space-y-2 pt-2 border-t border-slate-50">
                      <p className="text-xs text-slate-400 flex items-center gap-2">
                        <UserIcon className="w-3 h-3" /> {p.receiverName}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-2">
                        <Phone className="w-3 h-3" /> {p.receiverPhone}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {page === 'available-parcels' && (
          <motion.div
            key="available"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen flex flex-col"
          >
            <Header title="Colis Disponibles" />
            <AdSlot html={ads?.products} />
            <div className="p-4 sm:p-6 max-w-md mx-auto w-full space-y-4">
              {!user && (
                <div className="p-4 sm:p-6 bg-blue-600 rounded-3xl text-white shadow-lg shadow-blue-100 mb-4">
                  <h3 className="font-bold text-lg mb-2">Prêt à livrer ?</h3>
                  <p className="text-blue-100 text-sm mb-4">Connectez-vous pour accepter des colis et commencer à gagner de l'argent.</p>
                  <button 
                    onClick={() => setPage('landing')}
                    className="w-full bg-white text-blue-600 py-3 rounded-xl font-bold text-sm"
                  >
                    Se connecter / S'inscrire
                  </button>
                </div>
              )}
              
              <div className="p-4 bg-amber-50 rounded-2xl text-xs text-amber-700 flex gap-3 items-center">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <p>Les informations précises sont masquées pour la sécurité.</p>
              </div>

              {parcels.length === 0 ? (
                <div className="text-center py-20 text-slate-400">Aucun colis disponible pour le moment.</div>
              ) : (
                parcels.map(p => (
                  <div key={p.id} className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{p.deliveryCompany}</h3>
                        <p className="text-sm text-blue-600 font-bold flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> {p.destinationArea}
                        </p>
                      </div>
                      {user && profile?.role === 'driver' ? (
                        <button 
                          onClick={() => acceptParcel(p.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-blue-100"
                        >
                          Accepter
                        </button>
                      ) : !user ? (
                        <button 
                          onClick={() => setPage('landing')}
                          className="bg-slate-100 text-slate-400 px-4 py-2 rounded-xl text-sm font-bold"
                        >
                          Détails
                        </button>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-300 italic">
                      <div className="flex items-center gap-1">
                        <UserIcon className="w-3 h-3" /> Nom masqué
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Téléphone masqué
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {page === 'driver-deliveries' && (
          <motion.div
            key="driver-deliveries"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen flex flex-col"
          >
            <Header title="Mes Livraisons" />
            <AdSlot html={ads?.tracking} />
            <div className="p-4 sm:p-6 max-w-md mx-auto w-full space-y-4">
              {driverParcels.length === 0 ? (
                <div className="text-center py-20 text-slate-400">Vous n'avez pas encore accepté de colis.</div>
              ) : (
                driverParcels.map(p => (
                  <div key={p.id} className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-blue-700">{p.deliveryCompany}</h3>
                        <p className="text-sm font-bold text-slate-900">{p.destinationArea}</p>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                    
                    <div className="space-y-3 py-4 border-t border-slate-50">
                      <div className="flex items-center gap-3 text-sm">
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{p.receiverName}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <a href={`tel:${p.receiverPhone}`} className="text-blue-600 font-bold underline">{p.receiverPhone}</a>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                        <span className="text-slate-600">{p.receiverAddress}</span>
                      </div>
                    </div>

                    {p.status === 'accepted' && (
                      <button 
                        onClick={() => markAsDelivered(p.id)}
                        className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold mt-2 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" /> Marquer comme livré
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
      <AdSlot html={ads?.footer} />
    </div>
  );
}

// --- Components ---

function AuthForm({ isLogin, setIsLogin, onLogin, onRegister, onGoogleLogin, initialRole, error, clearError, loading }: any) {
  const [role, setRole] = useState<'client' | 'driver'>(initialRole || 'client');

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        if (loading) return;
        const fd = new FormData(e.currentTarget);
        const email = fd.get('email') as string;
        const pass = fd.get('pass') as string;
        if (isLogin) onLogin(email, pass);
        else onRegister(email, pass, role);
      }}
      className="space-y-4"
    >
      {error && (
        <div className="p-3 bg-rose-50 text-rose-600 text-xs rounded-xl border border-rose-100 flex justify-between items-center">
          <span className="flex-1">{error}</span>
          <button onClick={clearError} className="p-1 text-rose-400 hover:text-rose-600">×</button>
        </div>
      )}

      <Input icon={UserIcon} name="email" type="email" placeholder="Email" required disabled={loading} />
      <Input icon={ShieldCheck} name="pass" type="password" placeholder="Mot de passe" required disabled={loading} />

      <div className="grid grid-cols-2 gap-3 p-1 bg-slate-50 rounded-2xl border border-slate-100">
        <button 
          type="button"
          disabled={loading}
          onClick={() => setRole('client')}
          className={cn("py-2 rounded-xl text-sm font-bold transition-all", role === 'client' ? "bg-white shadow-sm text-emerald-600" : "text-slate-400", loading && "opacity-50")}
        >
          Client
        </button>
        <button 
          type="button"
          disabled={loading}
          onClick={() => setRole('driver')}
          className={cn("py-2 rounded-xl text-sm font-bold transition-all", role === 'driver' ? "bg-white shadow-sm text-emerald-600" : "text-slate-400", loading && "opacity-50")}
        >
          Livreur
        </button>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
        {isLogin ? 'Se connecter' : "S'inscrire"}
      </button>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold">Ou</span></div>
      </div>

      <button 
        type="button"
        disabled={loading}
        onClick={() => onGoogleLogin(role)}
        className="w-full bg-white border border-slate-200 text-slate-700 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-3"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continuer avec Google
      </button>

      <button 
        type="button"
        disabled={loading}
        onClick={() => setIsLogin(!isLogin)}
        className="w-full text-slate-400 text-sm font-medium hover:text-slate-600 disabled:opacity-50"
      >
        {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
      </button>
    </form>
  );
}

function Input({ icon: Icon, ...props }: any) {
  return (
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      <input 
        {...props} 
        className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 transition-all" 
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: "bg-amber-100 text-amber-700",
    accepted: "bg-blue-100 text-blue-700",
    delivered: "bg-emerald-100 text-emerald-700",
  }[status as 'pending' | 'accepted' | 'delivered'] || "bg-slate-100 text-slate-700";

  const labels = {
    pending: "En attente",
    accepted: "Accepté",
    delivered: "Livré",
  }[status as 'pending' | 'accepted' | 'delivered'] || status;

  return (
    <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", styles)}>
      {labels}
    </span>
  );
}
