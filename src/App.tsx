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
  CheckCircle
} from 'lucide-react';
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
  User
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
}

type Page = 'landing' | 'home' | 'add' | 'my-parcels' | 'available-parcels' | 'driver-deliveries';

export default function App() {
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
      const newUser: UserProfile = { uid: res.user.uid, email, role };
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
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {showBack && (
          <button onClick={() => setPage('home')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </button>
        )}
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
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
              <div className="absolute top-6 right-6 flex gap-3 z-10">
                <button 
                  onClick={() => setIsLogin(true)}
                  className={cn(
                    "px-6 py-2 rounded-full text-sm font-bold transition-all",
                    isLogin ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  Connexion
                </button>
                <button 
                  onClick={() => setIsLogin(false)}
                  className={cn(
                    "px-6 py-2 rounded-full text-sm font-bold transition-all",
                    !isLogin ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  Inscription
                </button>
              </div>
            )}

            <div className="flex-1 flex flex-col items-center justify-center p-6">
              {!showAuth && !user ? (
                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div className="text-left space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-widest">
                      <Truck className="w-4 h-4" /> Livraison Express
                    </div>
                    <h1 className="text-7xl font-black tracking-tighter text-slate-900 leading-none">
                      Wassali
                    </h1>
                    <p className="text-slate-500 text-xl leading-relaxed max-w-md">
                      La solution de livraison intelligente qui connecte clients et livreurs en temps réel.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <button 
                        onClick={() => { setSelectedRole('client'); setShowAuth(true); setIsLogin(false); }}
                        className="group bg-slate-900 text-white p-6 rounded-[2rem] hover:bg-slate-800 transition-all text-left shadow-2xl shadow-slate-200"
                      >
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <UserIcon className="w-6 h-6" />
                        </div>
                        <div className="font-bold text-lg">Client</div>
                        <div className="text-xs text-slate-400">Envoyer un colis</div>
                      </button>
                      
                      <button 
                        onClick={() => { setSelectedRole('driver'); setShowAuth(true); setIsLogin(false); }}
                        className="group bg-emerald-600 text-white p-6 rounded-[2rem] hover:bg-emerald-500 transition-all text-left shadow-2xl shadow-emerald-100"
                      >
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Truck className="w-6 h-6" />
                        </div>
                        <div className="font-bold text-lg">Livreur</div>
                        <div className="text-xs text-emerald-100">Gagner de l'argent</div>
                      </button>
                    </div>

                    <button 
                      onClick={() => setPage('available-parcels')}
                      className="w-full py-4 text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Search className="w-4 h-4" /> Voir les colis disponibles sans compte
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute -inset-4 bg-emerald-100 rounded-[3rem] -rotate-3 scale-95 opacity-50"></div>
                    <img 
                      src="https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?auto=format&fit=crop&q=80&w=1000" 
                      alt="Delivery" 
                      className="relative rounded-[3rem] shadow-2xl w-full aspect-[4/5] object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-3xl shadow-xl border border-slate-50 flex items-center gap-4 animate-bounce">
                      <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-black text-slate-900">100%</div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Sécurisé</div>
                      </div>
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
                  <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100">
                    <div className="flex flex-col items-center mb-8">
                      <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
                        {selectedRole === 'client' ? <UserIcon className="w-8 h-8 text-emerald-600" /> : <Truck className="w-8 h-8 text-emerald-600" />}
                      </div>
                      <h2 className="text-2xl font-black tracking-tight">
                        {isLogin ? 'Connexion' : 'Inscription'} {selectedRole === 'client' ? 'Client' : 'Livreur'}
                      </h2>
                    </div>
                    <AuthForm 
                      isLogin={isLogin}
                      setIsLogin={setIsLogin}
                      onLogin={handleLogin} 
                      onRegister={handleRegister} 
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
                      Ravi de vous revoir ! Accédez à votre espace pour gérer vos livraisons.
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
            <div className="p-6 max-w-md mx-auto w-full">
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
                className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-4"
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
            <div className="p-6 max-w-md mx-auto w-full space-y-4">
              {parcels.length === 0 ? (
                <div className="text-center py-20 text-slate-400">Aucun colis trouvé.</div>
              ) : (
                parcels.map(p => (
                  <div key={p.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
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
            <div className="p-6 max-w-md mx-auto w-full space-y-4">
              {!user && (
                <div className="p-6 bg-blue-600 rounded-3xl text-white shadow-lg shadow-blue-100 mb-4">
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
                  <div key={p.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
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
            <div className="p-6 max-w-md mx-auto w-full space-y-4">
              {driverParcels.length === 0 ? (
                <div className="text-center py-20 text-slate-400">Vous n'avez pas encore accepté de colis.</div>
              ) : (
                driverParcels.map(p => (
                  <div key={p.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
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
  );
}

// --- Components ---

function AuthForm({ isLogin, setIsLogin, onLogin, onRegister, initialRole, error, clearError, loading }: any) {
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
          {error}
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
