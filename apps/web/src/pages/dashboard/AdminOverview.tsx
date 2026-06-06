import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Package, DollarSign, Activity, Search, 
  X, Truck, Eye, Zap
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api, { handleApiResponse } from '../../lib/api';

// Fix for default marker icons in Leaflet with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const getCourierIcon = (isOnline: boolean) => L.divIcon({
  className: 'custom-courier-icon',
  html: `<div class="p-2 rounded-full shadow-[0_0_20px_rgba(255,122,0,0.5)] transition-all ${
    isOnline 
      ? 'bg-brand-orange text-white animate-pulse' 
      : 'bg-gray-700 text-gray-400'
  }">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
         </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Programmatic map pan/zoom controller
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { animate: true, duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

type Courier = {
  id: string;
  vehicleType: string;
  plateNumber: string | null;
  isOnline: boolean;
  currentLat: number | null;
  currentLng: number | null;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
};

type Order = {
  id: string;
  totalPrice: number;
  price?: number;
  status: string;
  createdAt: string;
  pickupAddress: string;
  dropoffAddress: string;
  deliveryType: string;
  vehicleType: string;
  packageDetails?: string;
  basePrice?: number;
  distancePrice?: number;
  surgePrice?: number;
  weatherPrice?: number;
  taxPrice?: number;
  discountPrice?: number;
  user?: { firstName: string; lastName: string; email: string };
  courier?: { firstName: string; lastName: string; email: string };
};

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalCouriers: 0,
    monthlyRevenue: 0
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([41.0082, 28.9784]);
  const [mapZoom, setMapZoom] = useState(12);



  const fetchAllOrders = async () => {
    try {
      const response = await api.get('/orders/all');
      const data = handleApiResponse<any>(response);
      setOrders(data.orders || []);
    } catch (err: any) {
      console.error('Failed to fetch all orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/orders/stats');
      const data = handleApiResponse<any>(res);
      setStats(data.stats);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourierLocations = async () => {
    try {
      const res = await api.get('/orders/couriers/locations');
      const data = handleApiResponse<any>(res);
      setCouriers(data.couriers || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAllOrders();
    fetchStats();
    fetchCourierLocations();
  }, []);

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'PENDING': return 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
      case 'PICKED_UP': return 'bg-sky-500/10 text-sky-400 border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.2)]';
      case 'DELIVERED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
      case 'CANCELLED': return 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'PENDING': return 'Bekliyor';
      case 'PICKED_UP': return 'Yolda';
      case 'DELIVERED': return 'Teslim Edildi';
      case 'CANCELLED': return 'İptal Edildi';
      default: return status;
    }
  };

  const statCards = [
    { title: 'Toplam Kullanıcı', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'text-blue-500' },
    { title: 'Toplam Sipariş', value: stats.totalOrders.toLocaleString(), icon: Package, color: 'text-brand-orange' },
    { title: 'Toplam Ciro', value: `₺${stats.monthlyRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-500' },
    { title: 'Aktif Kurye', value: stats.totalCouriers.toLocaleString(), icon: Activity, color: 'text-purple-500' },
  ];

  const filteredOrders = orders.filter((order) => {
    const searchLower = search.toLowerCase();
    return (
      order.id.toLowerCase().includes(searchLower) ||
      (order.user && `${order.user.firstName} ${order.user.lastName}`.toLowerCase().includes(searchLower)) ||
      (order.courier && `${order.courier.firstName} ${order.courier.lastName}`.toLowerCase().includes(searchLower))
    );
  });

  const panToCourier = (lat: number, lng: number) => {
    setMapCenter([lat, lng]);
    setMapZoom(15);
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            Sistem Yönetimi <Zap className="w-8 h-8 text-brand-orange drop-shadow-[0_0_15px_rgba(255,122,0,0.5)]" />
          </h1>
          <p className="text-gray-400 mt-2 font-medium text-lg">JETIS platformundaki tüm hareketliliği buradan yönetin.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 relative overflow-hidden group hover:border-white/10 transition-colors"
            >
              <div className="absolute -top-10 -right-10 p-4 opacity-[0.03] group-hover:scale-125 group-hover:opacity-[0.08] transition-all duration-500">
                <Icon className="w-32 h-32" />
              </div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest">{stat.title}</h3>
                <div className={`p-2.5 rounded-xl bg-white/[0.04] shadow-inner border border-white/[0.05] ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-4xl font-black text-white relative z-10">{stat.value}</div>
              <div className="mt-4 text-[10px] text-green-400 font-black uppercase tracking-widest flex items-center gap-1 bg-green-500/10 w-fit px-2 py-1 rounded-full border border-green-500/20">
                +12% geçen haftaya göre
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Live Courier Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white">Canlı Kurye Haritası 📍</h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-brand-orange/10 border border-brand-orange/20 text-brand-orange rounded-full text-[10px] font-black uppercase tracking-widest animate-glow-pulse">
              <span className="w-2 h-2 rounded-full bg-brand-orange animate-ping" />
              Canlı Takip Aktif
            </div>
          </div>

          <div className="h-[400px] w-full rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative z-0">
            <MapContainer 
              center={mapCenter} 
              zoom={mapZoom} 
              style={{ height: '100%', width: '100%', background: '#080D17' }}
              zoomControl={true}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />

              {/* Dynamic pan/zoom controller */}
              <MapController center={mapCenter} zoom={mapZoom} />

              {/* Courier Markers */}
              {couriers.map((courier) => {
                if (courier.currentLat && courier.currentLng) {
                  return (
                    <Marker 
                      key={courier.id} 
                      position={[courier.currentLat, courier.currentLng]} 
                      icon={getCourierIcon(courier.isOnline)}
                    >
                      <Popup className="premium-popup">
                        <div className="p-1 space-y-1 text-xs">
                          <div className="font-bold text-gray-900">{courier.user.firstName} {courier.user.lastName}</div>
                          <div className="text-gray-500">Araç: {courier.vehicleType}</div>
                          <div className="text-gray-500">Plaka: {courier.plateNumber || 'Belirtilmedi'}</div>
                          <div className="font-semibold text-brand-orange mt-1">
                            {courier.isOnline ? '🟢 Aktif' : '🔴 Çevrimdışı'}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                }
                return null;
              })}
            </MapContainer>
          </div>
        </div>

        {/* Courier Sidebar List */}
        <div className="glass-card p-6 space-y-6 flex flex-col max-h-[516px]">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white">Aktif Kuryeler</h3>
            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-black">
              {couriers.filter(c => c.isOnline).length}
            </span>
          </div>
          <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
            {couriers.length > 0 ? (
              couriers.map((courier) => (
                <div 
                  key={courier.id}
                  onClick={() => courier.currentLat && courier.currentLng && panToCourier(courier.currentLat, courier.currentLng)}
                  className="p-4 bg-white/[0.02] border border-white/[0.05] hover:border-white/10 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/[0.06] transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-brand-orange group-hover:border-brand-orange/30 transition-colors">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-brand-orange transition-colors">
                        {courier.user.firstName} {courier.user.lastName}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1 font-bold tracking-widest uppercase">{courier.plateNumber || '34 JET 15'}</div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border flex items-center gap-1 ${
                    courier.isOnline 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}>
                    {courier.isOnline && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                    {courier.isOnline ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-10 font-medium text-sm flex flex-col items-center">
                <Truck className="w-10 h-10 text-gray-700 mb-3" />
                Aktif kurye bulunmamaktadır.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Orders List Section */}
      <div className="glass-card overflow-hidden">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h2 className="text-xl font-black text-white">Tüm Siparişler</h2>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-orange transition-colors" />
              <input 
                type="text" 
                placeholder="Sipariş veya müşteri ara..." 
                className="bg-white/[0.03] border border-white/[0.08] rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-brand-orange focus:bg-white/[0.05] transition-all placeholder-gray-600 w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] text-gray-500 text-[10px] uppercase tracking-widest font-black">
              <tr className="border-b border-white/5">
                <th className="px-8 py-5">Sipariş ID</th>
                <th className="px-8 py-5">Müşteri</th>
                <th className="px-8 py-5">Kurye</th>
                <th className="px-8 py-5 text-center">Durum</th>
                <th className="px-8 py-5 text-right">Fiyat</th>
                <th className="px-8 py-5 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {loading ? (
                <tr><td colSpan={6} className="px-8 py-10 text-center text-gray-500"><div className="w-8 h-8 border-2 border-white/10 border-t-brand-orange rounded-full animate-spin mx-auto" /></td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-10 text-center text-gray-500 font-medium">Kayıt bulunamadı.</td></tr>
              ) : (
                filteredOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5">
                      <div className="text-white font-black tracking-widest">#{order.id.slice(0, 8).toUpperCase()}</div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</div>
                    </td>
                    <td className="px-8 py-5 text-gray-300 font-bold text-sm">
                      {order.user?.firstName} {order.user?.lastName}
                    </td>
                    <td className="px-8 py-5 text-gray-300 text-sm font-medium">
                      {order.courier ? `${order.courier.firstName} ${order.courier.lastName}` : <span className="text-gray-600 italic">Atanmadı</span>}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black border uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right text-brand-orange font-black text-lg">₺{order.totalPrice || order.price}</td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-3 text-gray-500 hover:text-brand-orange bg-white/[0.03] hover:bg-brand-orange/10 border border-white/5 hover:border-brand-orange/20 rounded-xl transition-all"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-[#080D17]/80 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl glass-card overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10"
            >
              {/* Decorative top gradient */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-orange to-[#ff9d42]" />
              
              {/* Header */}
              <div className="p-8 border-b border-white/5 flex items-center justify-between relative z-10">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">Sipariş Detayı</h3>
                  <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest">ID: #{selectedOrder.id}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-3 bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar relative z-10">
                {/* Status Badge */}
                <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-400">Güncel Durum</span>
                  <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(selectedOrder.status)}`}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>

                {/* Addresses */}
                <div className="space-y-6">
                  <div className="flex gap-4 relative">
                    <div className="absolute left-[15px] top-8 bottom-[-24px] w-0.5 bg-white/10 border-dashed border-l" />
                    <div className="flex flex-col items-center gap-1 z-10">
                      <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs text-gray-400 font-black">1</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Teslim Alım Adresi</div>
                      <p className="text-base text-white font-bold mt-1">{selectedOrder.pickupAddress}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-xs text-brand-orange font-black">
                      <span className="w-2 h-2 bg-brand-orange rounded-full animate-ping absolute" />
                      2
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-brand-orange uppercase tracking-widest">Teslimat Adresi</div>
                      <p className="text-base text-white font-bold mt-1">{selectedOrder.dropoffAddress}</p>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-white/5" />

                {/* Logistics Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Kurye Aracı</div>
                    <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                      <Truck className="w-5 h-5 text-brand-orange" />
                      <span className="text-sm text-white font-bold">{selectedOrder.vehicleType}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Paket Detayı</div>
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-sm text-white font-bold">
                      {selectedOrder.packageDetails || 'Belirtilmedi'}
                    </div>
                  </div>
                </div>

                <div className="h-px bg-white/5" />

                {/* Price Breakdown */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ücret Kırılımı</h4>
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-3 text-sm text-gray-400">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Açılış Ücreti</span>
                      <span className="text-white font-bold">₺{selectedOrder.basePrice || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Mesafe Ücreti</span>
                      <span className="text-white font-bold">₺{selectedOrder.distancePrice || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Talep Artışı (Surge)</span>
                      <span className="text-white font-bold">₺{selectedOrder.surgePrice || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">KDV (20%)</span>
                      <span className="text-white font-bold">₺{selectedOrder.taxPrice || 0}</span>
                    </div>
                    {selectedOrder.discountPrice && selectedOrder.discountPrice > 0 ? (
                      <div className="flex justify-between items-center text-green-400">
                        <span className="font-bold">İndirim</span>
                        <span className="font-bold">-₺{selectedOrder.discountPrice}</span>
                      </div>
                    ) : null}
                    
                    <div className="flex justify-between items-center text-lg font-black text-white pt-4 mt-2 border-t border-white/10">
                      <span>Toplam</span>
                      <span className="text-brand-orange drop-shadow-[0_0_10px_rgba(255,122,0,0.4)]">₺{selectedOrder.totalPrice || selectedOrder.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
