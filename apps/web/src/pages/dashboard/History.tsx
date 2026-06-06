import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Search, Filter, MapPin, Calendar, CreditCard, ChevronRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api, { handleApiResponse } from '../../lib/api';

type Order = {
  id: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  pickupAddress: string;
  dropoffAddress: string;
  deliveryType: string;
};

export default function History() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/my');
      const data = handleApiResponse(response) as { orders: Order[] };
      setOrders(data.orders || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Failed to fetch orders:', err.message);
      } else {
        console.error('Failed to fetch orders:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
     
    fetchOrders();
   
  }, []);

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.dropoffAddress.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-14 h-14 border-4 border-white/10 border-t-brand-orange rounded-full animate-spin shadow-[0_0_15px_rgba(255,122,0,0.5)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            Sipariş Geçmişi <Zap className="w-8 h-8 text-brand-orange drop-shadow-[0_0_15px_rgba(255,122,0,0.5)]" />
          </h1>
          <p className="text-gray-400 mt-2 font-medium text-lg">Tüm geçmiş ve aktif gönderilerinizin listesi.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 relative z-10">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-brand-orange transition-colors" />
          <input
            type="text"
            placeholder="Sipariş ID veya adres ile ara..."
            className="w-full glass-card border-white/[0.08] rounded-2xl py-4 pl-14 pr-4 text-white focus:outline-none focus:border-brand-orange/50 focus:bg-white/[0.04] transition-all font-medium placeholder-gray-600 shadow-inner"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center gap-3 px-8 py-4 glass-card hover:border-brand-orange/40 hover:text-white transition-all text-gray-400 font-bold group">
          <Filter className="w-5 h-5 group-hover:text-brand-orange transition-colors" />
          <span>Filtrele</span>
        </button>
      </div>

      <div className="glass-card overflow-hidden relative z-10">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Sipariş</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Durum</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Tarih</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Varış</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Tutar</th>
                <th className="px-8 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              <AnimatePresence mode="popLayout">
                {filteredOrders.map((order) => (
                  <motion.tr 
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group hover:bg-white/[0.03] transition-colors cursor-pointer relative"
                    onClick={() => navigate(`/dashboard/track/${order.id}`)}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-brand-orange group-hover:border-brand-orange/30 group-hover:bg-brand-orange/10 group-hover:scale-105 transition-all">
                          <Package className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-black text-white text-lg tracking-tight">#{order.id.slice(0, 8).toUpperCase()}</div>
                          <div className="text-[10px] text-brand-orange font-bold uppercase tracking-widest mt-1">{order.deliveryType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${
                          order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                        }`}>
                          {(order.status === 'PENDING' || order.status === 'ACCEPTED' || order.status === 'PICKED_UP') && (
                            <span className={`w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse`} />
                          )}
                          {order.status === 'DELIVERED' ? 'Tamamlandı' : 
                           order.status === 'CANCELLED' ? 'İptal Edildi' : 
                           order.status === 'PICKED_UP' ? 'Kurye Yolda' : 'Hazırlanıyor'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-gray-300 font-medium">
                        <Calendar className="w-4 h-4 text-brand-orange opacity-70" />
                        <span className="text-sm">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 max-w-xs">
                      <div className="flex items-center gap-2 text-gray-300">
                        <MapPin className="w-4 h-4 text-brand-orange shrink-0" />
                        <span className="text-sm font-medium truncate">{order.dropoffAddress}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 text-white font-black text-xl">
                        <CreditCard className="w-4 h-4 text-gray-500" />
                        ₺{order.totalPrice.toLocaleString('tr-TR')}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right pr-10">
                      <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-brand-orange group-hover:translate-x-2 transition-all drop-shadow-md" />
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="p-24 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-gray-600 animate-float" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Sipariş Bulunamadı</h3>
              <p className="text-gray-400 font-medium">Arama kriterlerinize uygun bir sipariş yok.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
