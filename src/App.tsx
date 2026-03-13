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

type Page = 'auth' | 'home' | 'add' | 'my-parcels' | 'available-parcels';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [page, setPage] = useState<Page>('auth');
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            setPage('home');
          } else {
            setPage('auth');
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
          setPage('auth');
        }
      } else {
        setProfile(null);
        setPage('auth');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Data Listener
  useEffect(() => {
    if (!user || !profile) {
      setParcels([]);
      return;
    }

    let q;
    if (profile.role === 'client') {
      // REQUIREMENT 3: Users can view only their own parcels.
      q = query(
        collection(db, 'parcels'),
        where('ownerId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
    } else {
      // REQUIREMENT 4: Delivery personnel can view available (pending) parcels from all users.
      q = query(
        collection(db, 'parcels'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Parcel));
      setParcels(data);
    }, (err) => {
      console.error("Firestore error:", err);
      // This might happen if index is building or rules are restrictive
      if (err.code === 'permission-denied') {
        setError("Accès refusé. Vérifiez vos permissions.");
      }
    });

    return unsubscribe;
  }, [user, profile]);

  // --- Actions ---

  const handleRegister = async (email: string, pass: string, role: 'client' | 'driver') => {
    try {
      setError(null);
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const newUser: UserProfile = { uid: res.user.uid, email, role };
      await setDoc(doc(db, 'users', res.user.uid), newUser);
      setProfile(newUser);
      setPage('home');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogin = async (email: string, pass: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setPage('auth');
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
        {page === 'auth' && (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6"
          >
            <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
                  <Truck className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-3xl font-black tracking-tight">Wassali</h2>
                <p className="text-slate-500 text-sm">Plateforme de livraison de colis</p>
              </div>

              <AuthForm 
                onLogin={handleLogin} 
                onRegister={handleRegister} 
                error={error}
                clearError={() => setError(null)}
              />
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
                  <button 
                    onClick={() => setPage('available-parcels')}
                    className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold text-lg shadow-lg shadow-blue-100 flex items-center justify-center gap-3"
                  >
                    <Search className="w-6 h-6" /> Colis disponibles
                  </button>
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
                  });
                }}
                className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-4"
              >
                <Input icon={Building2} name="company" placeholder="Entreprise de livraison" required />
                <Input icon={UserIcon} name="name" placeholder="Nom du destinataire" required />
                <Input icon={Phone} name="phone" placeholder="Téléphone" type="tel" required />
                <textarea 
                  name="address" 
                  placeholder="Adresse de livraison" 
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
                        <p className="text-sm text-slate-500">Dest: {p.receiverName}</p>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      {new Date(p.createdAt).toLocaleDateString()}
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
              {parcels.length === 0 ? (
                <div className="text-center py-20 text-slate-400">Aucun colis disponible pour le moment.</div>
              ) : (
                parcels.map(p => (
                  <div key={p.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{p.deliveryCompany}</h3>
                        <p className="text-sm text-slate-500">{p.receiverAddress}</p>
                      </div>
                      <button 
                        onClick={() => acceptParcel(p.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-blue-100"
                      >
                        Accepter
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <UserIcon className="w-3 h-3" /> {p.receiverName}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {p.receiverPhone}
                      </div>
                    </div>
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

function AuthForm({ onLogin, onRegister, error, clearError }: any) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'client' | 'driver'>('client');

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
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
          <button onClick={clearError} className="p-1">×</button>
        </div>
      )}

      <Input icon={UserIcon} name="email" type="email" placeholder="Email" required />
      <Input icon={ShieldCheck} name="pass" type="password" placeholder="Mot de passe" required />

      {!isLogin && (
        <div className="grid grid-cols-2 gap-3 p-1 bg-slate-50 rounded-2xl border border-slate-100">
          <button 
            type="button"
            onClick={() => setRole('client')}
            className={cn("py-2 rounded-xl text-sm font-bold transition-all", role === 'client' ? "bg-white shadow-sm text-blue-600" : "text-slate-400")}
          >
            Client
          </button>
          <button 
            type="button"
            onClick={() => setRole('driver')}
            className={cn("py-2 rounded-xl text-sm font-bold transition-all", role === 'driver' ? "bg-white shadow-sm text-blue-600" : "text-slate-400")}
          >
            Livreur
          </button>
        </div>
      )}

      <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100">
        {isLogin ? 'Se connecter' : "S'inscrire"}
      </button>

      <button 
        type="button"
        onClick={() => setIsLogin(!isLogin)}
        className="w-full text-slate-400 text-sm font-medium hover:text-slate-600"
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
