import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck, Search, MapPin, Phone, Mail, Package, X,
  Eye, Zap, Shield
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api, { handleApiResponse } from '../../lib/api';

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, zoom, { animate: true, duration: 1.2 }); }, [center, zoom, map]);
  return null;
}

const getCourierMapIcon = (isOnline: boolean) => L.divIcon({
  className: 'custom-courier-icon',
  html: `<div class="p-2 rounded-full shadow-lg transition-all ${isOnline ? 'bg-brand-orange text-white' : 'bg-gray-700 text-gray-400'}">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

type CourierData = {
  id: string;
  vehicleType: string;
  plateNumber: string | null;
  isOnline: boolean;
  currentLat: number | null;
  currentLng: number | null;
  user: { firstName: string; lastName: string; email: string; phone: string | null; createdAt: string };
  assignedOrders: any[];
  stats: { totalDeliveries: number; totalRevenue: number; activeOrders: number };
};

export default function CourierManagement() {
  const [couriers, setCouriers] = useState<CourierData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [selectedCourier, setSelectedCourier] = useState<CourierData | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([41.0082, 28.9784]);
  const [mapZoom, setMapZoom] = useState(11);

  const fetchCouriers = async () => {
    try {
      const params: any = {};
      if (filter !== 'all') params.status = filter;
      if (search) params.search = search;
      const res = await api.get('/couriers', { params });
      const data = handleApiResponse<any>(res);
      setCouriers(data.couriers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCouriers(); }, [filter]);

  const toggleStatus = async (id: string) => {
    try {
      await api.patch(`/couriers/${id}/status`);
      fetchCouriers();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCouriers = couriers.filter((c) => {
    const term = search.toLowerCase();
    return (
      c.user.firstName.toLowerCase().includes(term) ||
      c.user.lastName.toLowerCase().includes(term) ||
      c.user.email.toLowerCase().includes(term) ||
      (c.plateNumber || '').toLowerCase().includes(term)
    );
  });

  const onlineCouriers = couriers.filter((c) => c.isOnline);

  const getVehicleLabel = (v: string) => {
    const map: Record<string, string> = { MOTO: 'Motorsiklet', CAR: 'Otomobil', VAN: 'Minivan', TAXI: 'Taksi', PANELVAN: 'Panel Van' };
    return map[v] || v;
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            Kurye Yönetimi <Truck className="w-8 h-8 text-brand-orange drop-shadow-[0_0_15px_rgba(255,122,0,0.5)]" />
          </h1>
          <p className="text-gray-400 mt-2 font-medium text-lg">Tüm kuryeleri yönetin, performanslarını takip edin.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-sm font-black">{onlineCouriers.length} Aktif</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl">
            <span className="text-gray-400 text-sm font-black">{couriers.length} Toplam</span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-orange transition-colors" />
          <input
            type="text" placeholder="Kurye adı, e-posta veya plaka ile ara..."
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-brand-orange focus:bg-white/[0.05] transition-all placeholder-gray-600"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'online', 'offline'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
                filter === f
                  ? 'bg-brand-orange text-white border-brand-orange shadow-[0_0_15px_rgba(255,122,0,0.3)]'
                  : 'bg-white/[0.03] text-gray-400 border-white/[0.08] hover:bg-white/[0.06]'
              }`}>
              {f === 'all' ? 'Tümü' : f === 'online' ? 'Aktif' : 'Pasif'}
            </button>
          ))}
        </div>
      </div>

      {/* Map + List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 glass-card p-6 space-y-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-orange" /> Konum Haritası
          </h2>
          <div className="h-[420px] rounded-2xl overflow-hidden border border-white/5">
            <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%', background: '#080D17' }} zoomControl={true}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              <MapController center={mapCenter} zoom={mapZoom} />
              {couriers.map((c) => c.currentLat && c.currentLng ? (
                <Marker key={c.id} position={[c.currentLat, c.currentLng]} icon={getCourierMapIcon(c.isOnline)}>
                  <Popup><div className="p-1 text-xs"><b>{c.user.firstName} {c.user.lastName}</b><br />{c.isOnline ? '🟢 Aktif' : '🔴 Çevrimdışı'}</div></Popup>
                </Marker>
              ) : null)}
            </MapContainer>
          </div>
        </div>

        {/* Courier List */}
        <div className="lg:col-span-3 glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/[0.02] text-gray-500 text-[10px] uppercase tracking-widest font-black">
                <tr className="border-b border-white/5">
                  <th className="px-6 py-4">Kurye</th>
                  <th className="px-6 py-4">Araç</th>
                  <th className="px-6 py-4 text-center">Durum</th>
                  <th className="px-6 py-4 text-center">Teslimat</th>
                  <th className="px-6 py-4 text-right">Ciro</th>
                  <th className="px-6 py-4 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {loading ? (
                  <tr><td colSpan={6} className="px-8 py-10 text-center"><div className="w-8 h-8 border-2 border-white/10 border-t-brand-orange rounded-full animate-spin mx-auto" /></td></tr>
                ) : filteredCouriers.length === 0 ? (
                  <tr><td colSpan={6} className="px-8 py-10 text-center text-gray-500 font-medium">Kurye bulunamadı.</td></tr>
                ) : (
                  filteredCouriers.map((c) => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-orange to-[#ff9d42] flex items-center justify-center text-white font-black text-sm">
                            {c.user.firstName[0]}{c.user.lastName[0]}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{c.user.firstName} {c.user.lastName}</div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{c.plateNumber || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300 font-medium">{getVehicleLabel(c.vehicleType)}</td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => toggleStatus(c.id)} className="group/toggle">
                          {c.isOnline ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-500/10 text-slate-400 border border-slate-500/20">
                              Pasif
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center text-white font-black">{c.stats.totalDeliveries}</td>
                      <td className="px-6 py-4 text-right text-brand-orange font-black">₺{c.stats.totalRevenue.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => { setSelectedCourier(c); if (c.currentLat && c.currentLng) { setMapCenter([c.currentLat, c.currentLng]); setMapZoom(15); } }}
                          className="p-2.5 text-gray-500 hover:text-brand-orange bg-white/[0.03] hover:bg-brand-orange/10 border border-white/5 hover:border-brand-orange/20 rounded-xl transition-all">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Courier Detail Modal */}
      <AnimatePresence>
        {selectedCourier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedCourier(null)} className="absolute inset-0 bg-[#080D17]/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl glass-card overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-orange to-[#ff9d42]" />
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-orange to-[#ff9d42] flex items-center justify-center text-white font-black text-2xl shadow-[0_0_30px_rgba(255,122,0,0.4)]">
                    {selectedCourier.user.firstName[0]}{selectedCourier.user.lastName[0]}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">{selectedCourier.user.firstName} {selectedCourier.user.lastName}</h3>
                    <p className="text-sm text-gray-400 font-medium mt-1">{getVehicleLabel(selectedCourier.vehicleType)} · {selectedCourier.plateNumber || 'Plaka yok'}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCourier(null)} className="p-3 bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-8 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Toplam Teslimat', value: selectedCourier.stats.totalDeliveries, icon: Package },
                    { label: 'Toplam Ciro', value: `₺${selectedCourier.stats.totalRevenue.toLocaleString()}`, icon: Zap },
                    { label: 'Aktif Sipariş', value: selectedCourier.stats.activeOrders, icon: Shield },
                  ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                        <Icon className="w-5 h-5 text-brand-orange mx-auto mb-2" />
                        <div className="text-2xl font-black text-white">{s.value}</div>
                        <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">{s.label}</div>
                      </div>
                    );
                  })}
                </div>
                {/* Contact */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">İletişim</h4>
                  <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl"><Mail className="w-4 h-4 text-brand-orange" /><span className="text-sm text-white">{selectedCourier.user.email}</span></div>
                  <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl"><Phone className="w-4 h-4 text-brand-orange" /><span className="text-sm text-white">{selectedCourier.user.phone || 'Belirtilmedi'}</span></div>
                </div>
                {/* Recent Orders */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Son Siparişler</h4>
                  {selectedCourier.assignedOrders.length === 0 ? (
                    <div className="text-center text-gray-500 py-6 text-sm">Henüz sipariş yok.</div>
                  ) : (
                    selectedCourier.assignedOrders.slice(0, 5).map((o: any) => (
                      <div key={o.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                        <div>
                          <div className="text-sm font-bold text-white">#{o.id.slice(0, 8).toUpperCase()}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">{new Date(o.createdAt).toLocaleDateString('tr-TR')}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                            o.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            o.status === 'PICKED_UP' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                            o.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>{o.status === 'DELIVERED' ? 'Teslim' : o.status === 'PICKED_UP' ? 'Yolda' : o.status === 'PENDING' ? 'Bekliyor' : 'İptal'}</span>
                          <span className="text-brand-orange font-black text-sm">₺{o.totalPrice}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
