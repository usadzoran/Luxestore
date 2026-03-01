import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Navigation, 
  ChevronRight, 
  ArrowLeft, 
  Phone, 
  User, 
  Home as HomeIcon, 
  Map as MapIcon,
  CheckCircle2,
  Truck
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg: number) => deg * (Math.PI / 180);

// Fix Leaflet default icon issue
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createMarkerIcon = (label: string, color: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${label}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const iconA = createMarkerIcon('A', '#10b981'); // Emerald
const iconB = createMarkerIcon('B', '#ef4444'); // Red

// --- Components ---

const Header = ({ title, showBack, onBack }: { title: string; showBack?: boolean; onBack?: () => void }) => (
  <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-zinc-100 px-6 py-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      {showBack && (
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-zinc-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-zinc-600" />
        </button>
      )}
      <h1 className="text-2xl font-display font-extrabold gradient-text tracking-tight">
        {title}
      </h1>
    </div>
    <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
      <Truck className="w-5 h-5 text-emerald-600" />
    </div>
  </header>
);

// --- Pages ---

const HomePage = ({ onNext }: { onNext: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
    <div className="relative mb-12">
      <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-150" />
      <img 
        src="https://picsum.photos/seed/delivery/800/600" 
        alt="Delivery Service" 
        referrerPolicy="no-referrer"
        className="relative w-full max-w-sm rounded-[40px] shadow-2xl border-4 border-white"
      />
    </div>
    
    <h2 className="text-4xl font-display font-extrabold text-zinc-900 mb-4 leading-tight">
      Fast Delivery in <br />
      <span className="gradient-text">Oran & Suburbs</span>
    </h2>
    
    <p className="text-zinc-500 mb-10 max-w-xs mx-auto text-lg">
      The most reliable delivery service in the city. Request your delivery now!
    </p>
    
    <button 
      onClick={onNext}
      className="btn-primary flex items-center justify-center gap-2 text-xl"
    >
      Request Delivery
      <ChevronRight className="w-6 h-6" />
    </button>
  </div>
);

const MapEvents = ({ onMapClick }: { onMapClick: (latlng: L.LatLng) => void }) => {
  useMapEvents({
    click: (e) => onMapClick(e.latlng),
  });
  return null;
};

const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

const DeliveryPage = ({ 
  onNext, 
  onBack, 
  orderData, 
  setOrderData 
}: { 
  onNext: () => void; 
  onBack: () => void;
  orderData: any;
  setOrderData: (data: any) => void;
}) => {
  const [pickup, setPickup] = useState<[number, number] | null>(orderData.pickup || null);
  const [dropoff, setDropoff] = useState<[number, number] | null>(orderData.dropoff || null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([35.6971, -0.6308]); // Oran Center
  const [isSelecting, setIsSelecting] = useState<'pickup' | 'dropoff'>('pickup');
  const [showSummary, setShowSummary] = useState(false);

  const handleMapClick = (latlng: L.LatLng) => {
    if (isSelecting === 'pickup') {
      setPickup([latlng.lat, latlng.lng]);
      setIsSelecting('dropoff');
    } else {
      setDropoff([latlng.lat, latlng.lng]);
      setShowSummary(true);
    }
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const coords: [number, number] = [latitude, longitude];
        setMapCenter(coords);
        if (isSelecting === 'pickup') {
          setPickup(coords);
          setIsSelecting('dropoff');
        } else {
          setDropoff(coords);
          setShowSummary(true);
        }
      });
    }
  };

  const distance = pickup && dropoff ? calculateDistance(pickup[0], pickup[1], dropoff[0], dropoff[1]) : 0;
  const price = Math.max(100, Math.round(distance * 40)); // Minimum 100 DZD

  const handleContinue = () => {
    setOrderData({ ...orderData, pickup, dropoff, distance, price });
    onNext();
  };

  const resetSelection = () => {
    setPickup(null);
    setDropoff(null);
    setIsSelecting('pickup');
    setShowSummary(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-72px)]">
      {!showSummary ? (
        <div className="flex-1 relative">
          <MapContainer center={mapCenter} zoom={13} className="h-full w-full">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <MapEvents onMapClick={handleMapClick} />
            <MapController center={mapCenter} />
            
            {pickup && <Marker position={pickup} icon={iconA} />}
            {dropoff && <Marker position={dropoff} icon={iconB} />}
            {pickup && dropoff && (
              <Polyline positions={[pickup, dropoff]} color="red" weight={4} dashArray="10, 10" />
            )}
          </MapContainer>

          <div className="absolute top-4 left-4 right-4 z-[1000] space-y-2">
            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-zinc-200">
              <p className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                {isSelecting === 'pickup' ? 'Step 1: Select Pickup' : 'Step 2: Select Drop-off'}
              </p>
              <p className="text-zinc-900 font-medium">
                {isSelecting === 'pickup' ? 'Tap on the map to set point A' : 'Tap on the map to set point B'}
              </p>
            </div>
            
            <button 
              onClick={useCurrentLocation}
              className="bg-white p-3 rounded-full shadow-lg border border-zinc-200 flex items-center gap-2 text-sm font-bold text-emerald-600 active:scale-95 transition-transform"
            >
              <Navigation className="w-5 h-5" />
              Use My Location
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-zinc-50">
          <div className="card w-full max-w-md space-y-6">
            <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            
            <div className="text-center">
              <h3 className="text-2xl font-display font-bold text-zinc-900">Route Calculated</h3>
              <p className="text-zinc-500">We've found the best path for your delivery.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Distance</p>
                <p className="text-xl font-display font-bold text-zinc-900">{distance.toFixed(2)} km</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Price</p>
                <p className="text-xl font-display font-bold text-emerald-600">{price} DZD</p>
              </div>
            </div>

            <div className="space-y-3">
              <button onClick={handleContinue} className="btn-primary">
                Continue to Details
              </button>
              <button 
                onClick={resetSelection}
                className="w-full py-4 text-zinc-500 font-bold hover:text-zinc-700 transition-colors"
              >
                Change Locations
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoPage = ({ 
  onBack, 
  orderData, 
  setOrderData 
}: { 
  onBack: () => void;
  orderData: any;
  setOrderData: (data: any) => void;
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const message = `*New Delivery Request - Wassali*%0A%0A` +
      `*Client:* ${formData.firstName} ${formData.lastName}%0A` +
      `*Phone:* ${formData.phone}%0A` +
      `*Address:* ${formData.address}%0A` +
      `*Distance:* ${orderData.distance.toFixed(2)} km%0A` +
      `*Total Price:* ${orderData.price} DZD%0A%0A` +
      `_Sent via Wassali App_`;
    
    const whatsappUrl = `https://wa.me/213777117663?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="card mb-8">
        <h3 className="text-xl font-display font-bold text-zinc-900 mb-4">Customer Details</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400 uppercase ml-1">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  required
                  type="text" 
                  placeholder="John"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  value={formData.firstName}
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400 uppercase ml-1">Last Name</label>
              <input 
                required
                type="text" 
                placeholder="Doe"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                value={formData.lastName}
                onChange={e => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-400 uppercase ml-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                required
                type="tel" 
                placeholder="07XX XX XX XX"
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-400 uppercase ml-1">Full Address</label>
            <div className="relative">
              <HomeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                required
                type="text" 
                placeholder="Street, District, Oran"
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" className="btn-primary flex items-center justify-center gap-2">
              Confirm Order via WhatsApp
              <ChevronRight className="w-5 h-5" />
            </button>
            <button 
              type="button"
              onClick={onBack}
              className="w-full py-4 text-zinc-500 font-bold hover:text-zinc-700 transition-colors"
            >
              Back to Map
            </button>
          </div>
        </form>
      </div>

      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-4">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
          <MapIcon className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-emerald-900">Delivery Summary</p>
          <p className="text-xs text-emerald-700">
            {orderData.distance.toFixed(2)} km • {orderData.price} DZD
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'delivery' | 'info'>('home');
  const [orderData, setOrderData] = useState({
    pickup: null,
    dropoff: null,
    distance: 0,
    price: 0
  });

  const handleBack = useCallback(() => {
    if (currentPage === 'delivery') setCurrentPage('home');
    if (currentPage === 'info') setCurrentPage('delivery');
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-emerald-100 selection:text-emerald-900">
      <Header 
        title="Wassali" 
        showBack={currentPage !== 'home'} 
        onBack={handleBack} 
      />
      
      <main className="relative overflow-x-hidden">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <HomePage onNext={() => setCurrentPage('delivery')} />
            </motion.div>
          )}
          {currentPage === 'delivery' && (
            <motion.div 
              key="delivery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DeliveryPage 
                onNext={() => setCurrentPage('info')} 
                onBack={handleBack}
                orderData={orderData}
                setOrderData={setOrderData}
              />
            </motion.div>
          )}
          {currentPage === 'info' && (
            <motion.div 
              key="info"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <InfoPage 
                onBack={handleBack}
                orderData={orderData}
                setOrderData={setOrderData}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Branding */}
      <footer className="py-8 text-center">
        <p className="text-xs font-bold text-zinc-300 uppercase tracking-[0.2em]">
          &copy; 2026 Wassali Delivery Oran
        </p>
      </footer>
    </div>
  );
}
