import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Truck, 
  Package, 
  LayoutDashboard, 
  LogOut, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  BarChart3, 
  Megaphone,
  Save,
  Play,
  Menu
} from 'lucide-react';
import { db, auth } from './firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  doc, 
  deleteDoc,
  addDoc,
  setDoc,
  getDoc,
  getDocs
} from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface VisitorStat {
  id: string;
  timestamp: number;
  page: string;
  ip: string;
}

interface Distributor {
  uid: string;
  email: string;
  name?: string;
  phone?: string;
  city?: string;
  vehicleType?: string;
  status: 'active' | 'offline';
  deliveriesCount: number;
}

interface Customer {
  uid: string;
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  parcelsSent: number;
}

interface Parcel {
  id: string;
  parcelId: string;
  senderName: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  destinationArea: string;
  distributorAssigned?: string;
  status: 'pending' | 'collected' | 'in-transit' | 'out-for-delivery' | 'delivered' | 'returned' | 'cancelled';
  createdAt: number;
}

interface AdsConfig {
  topBar: string;
  products: string;
  tracking: string;
  footer: string;
}

// --- Components ---

export function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Use Firebase Auth for admin login
      await signInWithEmailAndPassword(auth, username, password);
      localStorage.setItem('admin_auth', 'true');
      onLogin();
    } catch (err: any) {
      console.error('Admin login error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Email ou mot de passe incorrect');
      } else {
        setError('Erreur de connexion: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
            <LayoutDashboard className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Wassali Admin</h1>
          <p className="text-slate-500 mt-2 text-center">Connectez-vous pour gérer la plateforme</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 text-rose-600 text-sm rounded-2xl border border-rose-100 text-center">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Email</label>
            <input 
              type="email" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-emerald-500"
              placeholder="wassali@Gmail.com"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Mot de passe</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-emerald-500"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'visitors' | 'distributors' | 'customers' | 'parcels' | 'ads'>('visitors');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('admin_auth');
    window.location.hash = '/admin-login';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex relative">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "bg-slate-900 text-white transition-all duration-300 flex flex-col fixed inset-y-0 left-0 z-50 lg:relative",
        isSidebarOpen ? 'w-72' : 'w-0 lg:w-20 overflow-hidden lg:overflow-visible',
        isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="p-6 flex items-center gap-4 border-b border-white/10">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          {(isSidebarOpen || isMobileMenuOpen) && <span className="font-black text-xl tracking-tighter">Wassali</span>}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem 
            icon={<BarChart3 />} 
            label="Visiteurs" 
            active={activeTab === 'visitors'} 
            onClick={() => { setActiveTab('visitors'); setIsMobileMenuOpen(false); }} 
            collapsed={!isSidebarOpen && !isMobileMenuOpen}
          />
          <SidebarItem 
            icon={<Truck />} 
            label="Livreurs" 
            active={activeTab === 'distributors'} 
            onClick={() => { setActiveTab('distributors'); setIsMobileMenuOpen(false); }} 
            collapsed={!isSidebarOpen && !isMobileMenuOpen}
          />
          <SidebarItem 
            icon={<Users />} 
            label="Clients" 
            active={activeTab === 'customers'} 
            onClick={() => { setActiveTab('customers'); setIsMobileMenuOpen(false); }} 
            collapsed={!isSidebarOpen && !isMobileMenuOpen}
          />
          <SidebarItem 
            icon={<Package />} 
            label="Colis" 
            active={activeTab === 'parcels'} 
            onClick={() => { setActiveTab('parcels'); setIsMobileMenuOpen(false); }} 
            collapsed={!isSidebarOpen && !isMobileMenuOpen}
          />
          <SidebarItem 
            icon={<Megaphone />} 
            label="Publicités" 
            active={activeTab === 'ads'} 
            onClick={() => { setActiveTab('ads'); setIsMobileMenuOpen(false); }} 
            collapsed={!isSidebarOpen && !isMobileMenuOpen}
          />
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-rose-500/10 text-rose-400 transition-all"
          >
            <LogOut className="w-6 h-6" />
            {(isSidebarOpen || isMobileMenuOpen) && <span className="font-bold">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="bg-white border-b border-slate-200 p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 capitalize">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse">
              <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
              Synchronisation Temps Réel
            </div>
            <div className="text-right hidden sm:block">
              <div className="font-bold text-slate-900">Admin Wassali</div>
              <div className="text-xs text-slate-400">Super Administrateur</div>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          {activeTab === 'visitors' && <VisitorsSection />}
          {activeTab === 'distributors' && <DistributorsSection />}
          {activeTab === 'customers' && <CustomersSection />}
          {activeTab === 'parcels' && <ParcelsSection />}
          {activeTab === 'ads' && <AdsSection />}
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick, collapsed }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
        active 
          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <div className="shrink-0">{icon}</div>
      {!collapsed && <span className="font-bold">{label}</span>}
    </button>
  );
}

// --- Sections ---

function VisitorsSection() {
  const [stats, setStats] = useState({
    total: 0,
    drivers: 0,
    parcels: 0
  });

  useEffect(() => {
    // Real-time stats from Firestore
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const drivers = snap.docs.filter(d => d.data().role === 'driver').length;
      const clients = snap.docs.filter(d => d.data().role === 'client').length;
      setStats(prev => ({ ...prev, total: snap.size, drivers }));
    });

    const unsubParcels = onSnapshot(collection(db, 'parcels'), (snap) => {
      setStats(prev => ({ ...prev, parcels: snap.size }));
    });

    return () => {
      unsubUsers();
      unsubParcels();
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Utilisateurs" value={stats.total.toLocaleString()} icon={<Users className="text-blue-600" />} color="bg-blue-50" />
        <StatCard title="Livreurs Actifs" value={stats.drivers.toLocaleString()} icon={<Truck className="text-emerald-600" />} color="bg-emerald-50" />
        <StatCard title="Total Colis" value={stats.parcels.toLocaleString()} icon={<Package className="text-amber-600" />} color="bg-amber-50" />
      </div>

      <div className="bg-white rounded-[2rem] p-4 sm:p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold mb-6">Visites Quotidiennes</h3>
        <div className="h-64 bg-slate-50 rounded-2xl flex items-end justify-between p-4 sm:p-6 gap-2">
          {[40, 60, 45, 90, 65, 80, 55].map((h, i) => (
            <div key={i} className="flex-1 bg-emerald-500 rounded-t-lg transition-all hover:bg-emerald-600" style={{ height: `${h}%` }}></div>
          ))}
        </div>
        <div className="flex justify-between mt-4 text-xs text-slate-400 font-bold uppercase tracking-widest px-2">
          <span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold">Visites Récentes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Page</th>
                <th className="px-6 py-4">Date & Heure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5].map((_, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-slate-600">192.168.1.{10 + i}</td>
                  <td className="px-6 py-4"><span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold">/tracking</span></td>
                  <td className="px-6 py-4 text-sm text-slate-400">Il y a {i + 2} minutes</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DistributorsSection() {
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    vehicleType: 'Moto',
    status: 'active' as const
  });

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'driver'));
    return onSnapshot(q, (snapshot) => {
      setDistributors(snapshot.docs.map(doc => ({ 
        uid: doc.id, 
        ...doc.data(),
        deliveriesCount: 0 // In a real app, we'd count their delivered parcels
      } as Distributor)));
    });
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we'd create a Firebase Auth user too.
    // For this demo, we just add to Firestore.
    await addDoc(collection(db, 'users'), {
      ...formData,
      role: 'driver',
      email: `${formData.name.toLowerCase().replace(' ', '.')}@wassali.com`,
      deliveriesCount: 0
    });
    setShowAddModal(false);
    setFormData({ name: '', phone: '', city: '', vehicleType: 'Moto', status: 'active' });
  };

  const handleDelete = async (uid: string) => {
    if (window.confirm('Supprimer ce livreur ?')) {
      await deleteDoc(doc(db, 'users', uid));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Rechercher un livreur..." 
            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-6 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-100"
        >
          <Plus className="w-5 h-5" /> Ajouter un livreur
        </button>
      </div>

      <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Livreur</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Livraisons</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {distributors.map((d) => (
                <tr key={d.uid} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{d.name || d.email.split('@')[0]}</div>
                    <div className="text-xs text-slate-400">{d.city || 'Non spécifié'} • {d.vehicleType || 'Moto'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{d.phone || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-emerald-600">{d.deliveriesCount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      d.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {d.status === 'active' ? 'En ligne' : 'Hors ligne'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(d.uid)} className="p-2 hover:bg-rose-50 text-rose-600 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl sm:text-2xl font-black mb-6">Nouveau Livreur</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <input 
                type="text" 
                placeholder="Nom complet" 
                required 
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
              <input 
                type="tel" 
                placeholder="Numéro de téléphone" 
                required 
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="Ville" 
                required 
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6"
                value={formData.city}
                onChange={e => setFormData({...formData, city: e.target.value})}
              />
              <select 
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6"
                value={formData.vehicleType}
                onChange={e => setFormData({...formData, vehicleType: e.target.value})}
              >
                <option>Moto</option>
                <option>Voiture</option>
                <option>Camionnette</option>
                <option>Vélo</option>
              </select>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 font-bold text-slate-400">Annuler</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomersSection() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'client'));
    return onSnapshot(q, (snapshot) => {
      setCustomers(snapshot.docs.map(doc => ({ 
        uid: doc.id, 
        ...doc.data(),
        parcelsSent: 0
      } as Customer)));
    });
  }, []);

  const filtered = customers.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Rechercher un client..." 
          className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-6 focus:ring-2 focus:ring-emerald-500"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Adresse</th>
                <th className="px-6 py-4">Colis Envoyés</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.uid} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{c.name || c.email.split('@')[0]}</div>
                    <div className="text-xs text-slate-400">{c.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{c.phone || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{c.address || 'Non renseignée'}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-blue-600">{c.parcelsSent}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ParcelsSection() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [drivers, setDrivers] = useState<Distributor[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'parcels'), orderBy('createdAt', 'desc'));
    const dq = query(collection(db, 'users'), where('role', '==', 'driver'));
    
    const unsubParcels = onSnapshot(q, (snapshot) => {
      setParcels(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    });
    
    const unsubDrivers = onSnapshot(dq, (snapshot) => {
      setDrivers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as any)));
    });

    return () => { unsubParcels(); unsubDrivers(); };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'parcels', id), { status });
  };

  const assignDriver = async (id: string, driverUid: string) => {
    await updateDoc(doc(db, 'parcels', id), { deliveryUID: driverUid, status: 'collected' });
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">ID Colis</th>
                <th className="px-6 py-4">Expéditeur / Destinataire</th>
                <th className="px-6 py-4">Destination</th>
                <th className="px-6 py-4">Livreur</th>
                <th className="px-6 py-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {parcels.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-slate-400">#{p.id.slice(-6).toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-900">De: {p.senderName || 'Client'}</div>
                    <div className="text-xs text-slate-500">À: {p.receiverName} ({p.receiverPhone})</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600">{p.destinationArea}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{p.receiverAddress}</div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      className="bg-slate-50 border-none rounded-xl text-xs py-2 px-3 focus:ring-2 focus:ring-emerald-500"
                      value={p.distributorAssigned || ''}
                      onChange={e => assignDriver(p.id, e.target.value)}
                    >
                      <option value="">Non assigné</option>
                      {drivers.map(d => (
                        <option key={d.uid} value={d.uid}>{d.name || d.email.split('@')[0]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      className={`border-none rounded-xl text-[10px] font-black uppercase tracking-widest py-2 px-3 focus:ring-2 focus:ring-emerald-500 ${
                        p.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}
                      value={p.status}
                      onChange={e => updateStatus(p.id, e.target.value)}
                    >
                      <option value="pending">En attente</option>
                      <option value="collected">Collecté</option>
                      <option value="in-transit">En transit</option>
                      <option value="out-for-delivery">En cours</option>
                      <option value="delivered">Livré</option>
                      <option value="returned">Retourné</option>
                      <option value="cancelled">Annulé</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdsSection() {
  const [ads, setAds] = useState<AdsConfig>({
    topBar: '',
    products: '',
    tracking: '',
    footer: ''
  });
  const [preview, setPreview] = useState<keyof AdsConfig | null>(null);

  useEffect(() => {
    const docRef = doc(db, 'config', 'ads');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setAds(docSnap.data() as AdsConfig);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (key: keyof AdsConfig) => {
    const docRef = doc(db, 'config', 'ads');
    await setDoc(docRef, ads, { merge: true });
    alert('Publicité enregistrée !');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <AdEditor 
        title="Publicité Barre Supérieure" 
        value={ads.topBar} 
        onChange={v => setAds({...ads, topBar: v})} 
        onSave={() => handleSave('topBar')}
        onPreview={() => setPreview('topBar')}
      />
      <AdEditor 
        title="Publicité Page Produits" 
        value={ads.products} 
        onChange={v => setAds({...ads, products: v})} 
        onSave={() => handleSave('products')}
        onPreview={() => setPreview('products')}
      />
      <AdEditor 
        title="Publicité Page Suivi" 
        value={ads.tracking} 
        onChange={v => setAds({...ads, tracking: v})} 
        onSave={() => handleSave('tracking')}
        onPreview={() => setPreview('tracking')}
      />
      <AdEditor 
        title="Publicité Pied de Page" 
        value={ads.footer} 
        onChange={v => setAds({...ads, footer: v})} 
        onSave={() => handleSave('footer')}
        onPreview={() => setPreview('footer')}
      />

      {preview && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-10">
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] w-full max-w-4xl h-[90vh] sm:h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-bold">Aperçu Publicité</h3>
              <button onClick={() => setPreview(null)} className="text-slate-400 hover:text-slate-600 font-bold">Fermer</button>
            </div>
            <div className="flex-1 overflow-auto p-4 sm:p-10 bg-slate-50">
              <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-sm border border-slate-100 min-h-full" dangerouslySetInnerHTML={{ __html: ads[preview] }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdEditor({ title, value, onChange, onSave, onPreview }: any) {
  return (
    <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100 space-y-4">
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <textarea 
        className="w-full bg-slate-50 border-none rounded-2xl p-6 font-mono text-sm min-h-[200px] focus:ring-2 focus:ring-emerald-500"
        placeholder="Collez votre code HTML ici..."
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <div className="flex gap-4">
        <button 
          onClick={onPreview}
          className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" /> Aperçu
        </button>
        <button 
          onClick={onSave}
          className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
        >
          <Save className="w-4 h-4" /> Enregistrer
        </button>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100 flex items-center gap-4 sm:gap-6">
      <div className={`w-12 h-12 sm:w-16 sm:h-16 ${color} rounded-2xl flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <div className="text-[10px] sm:text-sm font-bold text-slate-400 uppercase tracking-widest">{title}</div>
        <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{value}</div>
      </div>
    </div>
  );
}
