import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Package, MapPin, TrendingUp, ArrowRight, CheckCircle2, Navigation, ShoppingBag, Zap } from 'lucide-react';
import { useAuth } from '../../store/useAuth';
import TrackingMap from '../../components/TrackingMap';
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

export default function Overview() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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

  const activeOrder = orders.find(o => ['PENDING', 'ACCEPTED', 'PICKED_UP'].includes(o.status));
  const deliveredCount = orders.filter(o => o.status === 'DELIVERED').length;
  const totalSpent = orders.reduce((sum, o) => sum + (o.status === 'DELIVERED' ? o.totalPrice : 0), 0);

  const stats = [
    { title: 'Aktif Siparişler', value: activeOrder ? '1' : '0', icon: Package, color: 'text-brand-orange' },
    { title: 'Teslim Edilenler', value: String(deliveredCount), icon: CheckCircle2, color: 'text-green-500' },
    { title: 'Harcanan Tutar', value: `₺${totalSpent.toLocaleString('tr-TR')}`, icon: TrendingUp, color: 'text-blue-500' },
    { title: 'Toplam İşlem', value: String(orders.length), icon: ShoppingBag, color: 'text-purple-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-14 h-14 border-4 border-white/10 border-t-brand-orange rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-up">
      {/* ── Header ───────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Merhaba, {user?.firstName} 👋</h1>
          <p className="text-gray-400 mt-2 text-lg font-medium">Teslimatlarının durumu ve istatistiklerin burada.</p>
        </div>
        <Link 
          to="/dashboard/create-order" 
          className="px-8 py-4 bg-gradient-to-r from-brand-orange to-[#ff9d42] text-white rounded-[1.25rem] font-black transition-all shadow-[0_0_30px_rgba(255,122,0,0.4)] hover:shadow-[0_0_50px_rgba(255,122,0,0.6)] flex items-center gap-3 hover:scale-[1.02] active:scale-95 group"
        >
          <Zap className="w-6 h-6 group-hover:animate-pulse" />
          Hemen Kurye Çağır
        </Link>
      </div>

      {/* ── Stats Row ────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 relative overflow-hidden group hover:border-white/10 transition-colors"
            >
              {/* Background accent */}
              <div className="absolute -top-10 -right-10 p-4 opacity-[0.03] group-hover:scale-125 group-hover:opacity-[0.08] transition-all duration-500">
                <Icon className="w-32 h-32" />
              </div>
              
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className={`p-2.5 rounded-xl bg-white/[0.04] shadow-inner border border-white/[0.05] ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest">{stat.title}</h3>
              </div>
              <div className="text-4xl font-black text-white relative z-10">{stat.value}</div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Main Layout: Map + Sidebar ──────────── */}
      <div className="grid lg:grid-cols-3 gap-8 relative z-10">
        
        {/* Left Column (Map + Recent) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Order Map */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <Navigation className="w-6 h-6 text-brand-orange" />
              Canlı Takip
            </h2>
            {activeOrder && (
              <div className="flex items-center gap-3 text-brand-orange text-xs font-black uppercase tracking-widest bg-brand-orange/10 px-4 py-2 rounded-full border border-brand-orange/20 animate-glow-pulse">
                <span className="w-2 h-2 bg-brand-orange rounded-full animate-ping" />
                Kurye Yolda
              </div>
            )}
          </div>
          
          <div className="relative rounded-[2.5rem] overflow-hidden glass-card shadow-2xl h-[400px]">
            <TrackingMap orderId={activeOrder?.id || 'demo-order'} />
            {!activeOrder && (
              <div className="absolute inset-0 bg-[#0B1220]/80 backdrop-blur-sm flex items-center justify-center p-8 text-center z-10">
                <div className="max-w-sm">
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Navigation className="w-10 h-10 text-gray-600 animate-float" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Aktif Sipariş Yok</h3>
                  <p className="text-gray-400 text-sm font-medium">Şu an takip edilecek bir teslimatınız bulunmuyor. Yeni bir kurye çağırarak başlayın.</p>
                </div>
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-white">Son İşlemler</h3>
            <div className="glass-card overflow-hidden">
              <AnimatePresence mode="popLayout">
                {orders.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-gray-500 font-medium text-sm">Henüz bir siparişiniz bulunmuyor.</p>
                  </div>
                ) : (
                  orders.slice(0, 3).map((order) => (
                    <motion.div 
                      key={order.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-6 border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors group relative"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="bg-white/[0.04] border border-white/[0.05] p-3 rounded-2xl group-hover:scale-105 transition-transform">
                            <Package className="w-6 h-6 text-brand-orange" />
                          </div>
                          <div>
                            <div className="font-black text-white text-lg">#{order.id.slice(0, 8).toUpperCase()}</div>
                            <div className="text-xs text-gray-500 font-semibold uppercase tracking-widest mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                            </div>
                          </div>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                          order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {order.status === 'DELIVERED' && <CheckCircle2 className="w-3 h-3" />}
                          {order.status === 'DELIVERED' ? 'Tamamlandı' : order.status === 'CANCELLED' ? 'İptal' : 'Kuryede'}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-gray-400 text-sm font-medium">
                        <MapPin className="w-4 h-4 text-brand-orange" />
                        <span className="truncate">{order.dropoffAddress}</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Column (Quick Actions & Premium) */}
        <div className="space-y-8">
          <h2 className="text-2xl font-black text-white">Hızlı İşlemler</h2>
          <div className="grid grid-cols-1 gap-4">
            <Link to="/dashboard/addresses" className="flex items-center justify-between p-5 glass-card hover:border-brand-orange/40 hover:bg-white/[0.04] transition-all group">
              <div className="flex items-center gap-4">
                <div className="bg-white/5 p-3 rounded-xl text-gray-400 group-hover:text-brand-orange group-hover:bg-brand-orange/10 transition-colors">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white text-base">Adreslerim</div>
                  <div className="text-xs text-gray-500 font-semibold uppercase tracking-widest mt-0.5">Sık kullanılanlar</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-brand-orange group-hover:translate-x-1 transition-all" />
            </Link>

            <button className="flex items-center justify-between p-5 glass-card hover:border-brand-orange/40 hover:bg-white/[0.04] transition-all group">
              <div className="flex items-center gap-4">
                <div className="bg-white/5 p-3 rounded-xl text-gray-400 group-hover:text-brand-orange group-hover:bg-brand-orange/10 transition-colors">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white text-base">Kampanyalar</div>
                  <div className="text-xs text-gray-500 font-semibold uppercase tracking-widest mt-0.5">Sana özel indirimler</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-brand-orange group-hover:translate-x-1 transition-all" />
            </button>
          </div>

          {/* Premium Banner */}
          <div className="relative overflow-hidden group">
            {/* Animated border gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-brand-orange via-purple-500 to-brand-orange rounded-[2.5rem] opacity-30 group-hover:opacity-100 animate-gradient-x transition-opacity duration-500" />
            
            <div className="absolute inset-[1px] bg-[#0F172A] rounded-[2.5rem] z-0" />
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-brand-orange/20 rounded-full blur-[50px] group-hover:bg-brand-orange/30 transition-all duration-700 z-0" />
            
            <div className="relative z-10 p-10">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-brand-orange" />
                <h3 className="text-xl font-black text-white">Premium Jetis</h3>
              </div>
              <p className="text-gray-400 mb-8 leading-relaxed font-medium text-sm">
                Sınırsız teslimat ve VIP kurye önceliği için JETIS Premium'a katıl.
              </p>
              <button className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black hover:bg-white/10 transition-all uppercase tracking-widest text-[11px] shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                Detayları İncele
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
