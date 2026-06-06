import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, CheckCircle, TrendingUp, Bell, Clock, ArrowRight, Navigation, Phone, CheckCircle2, XCircle, Zap } from 'lucide-react';
import { useAuth } from '../../store/useAuth';
import { useSocket } from '../../hooks/useSocket';
import api, { handleApiResponse } from '../../lib/api';

type AvailableOrder = {
  id: string;
  totalPrice?: number;
  price?: number;
  deliveryType: string;
  pickupAddress: string;
  dropoffAddress: string;
  status: string;
  user?: { firstName?: string; lastName?: string; phone?: string };
};

export default function CourierOverview() {
  const { user, token } = useAuth();
  const socket = useSocket();
  const [availableOrders, setAvailableOrders] = useState<AvailableOrder[]>([]);
  const [activeOrder, setActiveOrder] = useState<AvailableOrder | null>(null);
  const [, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [availableRes, myOrdersRes] = await Promise.all([
        api.get('/orders/available'),
        api.get('/orders/my') // Should be filtered by courierId in backend or frontend
      ]);
      
      const availableData = handleApiResponse(availableRes) as any;
      setAvailableOrders(availableData.orders as AvailableOrder[]);
      
      const myOrdersData = handleApiResponse(myOrdersRes) as any;
      const active = (myOrdersData.orders as AvailableOrder[]).find(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
      setActiveOrder(active || null);
    } catch (err: any) {
      console.error('Failed to fetch data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (socket) {
      socket.on('new_order', (order: AvailableOrder) => {
        setAvailableOrders((prev) => [order, ...prev]);
      });
      
      socket.on('order_update', (updated: AvailableOrder) => {
        if (updated.id === activeOrder?.id) {
          setActiveOrder(updated);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('new_order');
        socket.off('order_update');
      }
    };
  }, [socket, token, activeOrder?.id]);

  const handleAcceptOrder = async (orderId: string) => {
    setUpdating(true);
    try {
      const response = await api.post(`/orders/${orderId}/accept`);
      const data = handleApiResponse(response) as any;
      setActiveOrder(data.order);
      setAvailableOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err: any) {
      alert('Sipariş kabul edilemedi: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateStatus = async (status: string, otp?: string) => {
    if (!activeOrder) return;
    
    if (status === 'DELIVERED' && !otp) {
      setShowOtpModal(true);
      return;
    }

    setUpdating(true);
    try {
      const response = await api.patch(`/orders/${activeOrder.id}/status`, { status, otp });
      const data = handleApiResponse(response) as any;
      if (status === 'DELIVERED' || status === 'CANCELLED') {
        setActiveOrder(null);
        setShowOtpModal(false);
        setOtpInput('');
        fetchData();
      } else {
        setActiveOrder(data.order);
      }
    } catch (err: any) {
      alert('Durum güncellenemedi: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const stats = [
    { title: 'Günlük Kazanç', value: '₺1.240', icon: TrendingUp, color: 'text-green-500' },
    { title: 'Bugün Teslim', value: '12', icon: CheckCircle, color: 'text-blue-500' },
    { title: 'Puanım', value: '4.9', icon: Bell, color: 'text-yellow-500' },
    { title: 'Online Süre', value: '6 sa', icon: Clock, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-8 pb-10 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Kurye Paneli</h1>
          <p className="text-gray-400 mt-2 text-lg font-medium">Hoş geldin {user?.firstName}, bugün harika işler çıkaracaksın! 🏍️</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-5 py-2.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-2xl text-sm font-black flex items-center gap-3 animate-glow-pulse">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            SİSTEMDE ONLINESIN
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {activeOrder ? (
              <motion.section 
                key="active-task"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-orange to-[#ff9d42] rounded-[2.5rem] blur opacity-20 animate-pulse" />
                <div className="relative glass-card border-brand-orange/30 p-10 overflow-hidden group">
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-orange/10 rounded-full blur-[80px] group-hover:bg-brand-orange/20 transition-all duration-700" />
                  
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-brand-orange/20 border border-brand-orange/30 rounded-2xl flex items-center justify-center">
                        <Navigation className="w-8 h-8 text-brand-orange animate-bounce" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Aktif Görev</h2>
                        <div className="flex items-center gap-2 text-brand-orange font-bold text-sm">
                          <span className="w-2 h-2 rounded-full bg-brand-orange animate-ping" />
                          {activeOrder.status === 'PICKED_UP' ? 'Teslimata Gidiliyor' : 'Paket Alınıyor'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-500 text-xs font-bold uppercase mb-1 tracking-widest">Tahmini Kazanç</div>
                      <div className="text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(255,122,0,0.3)]">₺{activeOrder.totalPrice || activeOrder.price}</div>
                    </div>
                  </div>

                  <div className="space-y-8 mb-10 relative z-10">
                    <div className="flex gap-6 relative">
                      <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-white/10 border-dashed border-l" />
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 z-10 border border-white/20">
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1.5">Alış Adresi</div>
                        <div className="text-white font-bold text-lg">{activeOrder.pickupAddress}</div>
                      </div>
                    </div>
                    <div className="flex gap-6 relative z-10">
                      <div className="w-6 h-6 rounded-full bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center shrink-0 z-10">
                        <div className="w-2 h-2 rounded-full bg-brand-orange animate-ping" />
                      </div>
                      <div>
                        <div className="text-[10px] text-brand-orange font-black uppercase tracking-widest mb-1.5">Teslimat Adresi</div>
                        <div className="text-white font-bold text-lg">{activeOrder.dropoffAddress}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 relative z-10">
                    <button 
                      disabled={updating}
                      className="py-4 bg-white/[0.04] border border-white/[0.08] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white/[0.08] transition-all"
                    >
                      <Phone className="w-5 h-5" /> Müşteriyi Ara
                    </button>
                    {activeOrder.status === 'PENDING' || activeOrder.status === 'ACCEPTED' ? (
                      <button 
                        disabled={updating}
                        onClick={() => handleUpdateStatus('PICKED_UP')}
                        className="py-4 bg-gradient-to-r from-brand-orange to-[#ff9d42] text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(255,122,0,0.4)] transition-all"
                      >
                        <Package className="w-6 h-6" /> Paketi Aldım
                      </button>
                    ) : (
                      <button 
                        disabled={updating}
                        onClick={() => handleUpdateStatus('DELIVERED')}
                        className="py-4 bg-gradient-to-r from-green-500 to-emerald-400 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all"
                      >
                        <CheckCircle2 className="w-6 h-6" /> Teslim Ettim
                      </button>
                    )}
                  </div>
                  
                  <button 
                    disabled={updating}
                    onClick={() => handleUpdateStatus('CANCELLED')}
                    className="w-full mt-4 py-3 text-gray-500 text-xs font-bold hover:text-red-400 transition-colors flex items-center justify-center gap-2 relative z-10"
                  >
                    <XCircle className="w-4 h-4" /> Sorun Bildir / İptal Et
                  </button>
                </div>
              </motion.section>
            ) : (
              <motion.section key="available-list" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-white flex items-center gap-3">
                    <Zap className="w-7 h-7 text-brand-orange" />
                    Yeni İşler
                    <span className="bg-brand-orange/10 border border-brand-orange/20 text-brand-orange px-3 py-1 rounded-full text-xs font-black">
                      {availableOrders.length}
                    </span>
                  </h2>
                  <button onClick={fetchData} className="text-xs font-black text-brand-orange hover:text-[#ff9d42] transition-colors uppercase tracking-widest flex items-center gap-1">
                    <Clock className="w-4 h-4" /> Yenile
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {availableOrders.length === 0 ? (
                    <div className="glass-card border-dashed p-20 text-center">
                      <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-10 h-10 text-gray-600 animate-float" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Şu An İş Bulunmuyor</h3>
                      <p className="text-gray-500 max-w-xs mx-auto text-sm font-medium">Sakin kal ve GPS sinyalini kontrol et. Yeni bir iş düştüğünde seni anında bilgilendireceğiz.</p>
                    </div>
                  ) : (
                    availableOrders.map((order) => (
                      <motion.div
                        key={order.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-8 hover:border-brand-orange/40 transition-all group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-bl-full group-hover:bg-brand-orange/10 transition-colors" />
                        
                        <div className="flex items-center justify-between mb-8 relative z-10">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-brand-orange/10 border border-brand-orange/20 text-brand-orange rounded-2xl flex items-center justify-center font-black text-2xl group-hover:scale-105 transition-transform">
                              ₺{order.price ?? order.totalPrice ?? 0}
                            </div>
                            <div>
                              <div className="font-black text-white text-xl">
                                {order.user?.firstName || 'Müşteri'} {order.user?.lastName || ''}
                              </div>
                              <div className="text-[10px] text-brand-orange font-black uppercase tracking-widest mt-1">{order.deliveryType}</div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6 mb-8 relative z-10">
                          <div className="flex gap-4">
                            <div className="w-2 h-2 rounded-full bg-gray-500 mt-2 shadow-[0_0_8px_rgba(156,163,175,0.5)]" />
                            <div>
                              <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">ALIŞ</div>
                              <div className="text-white font-medium text-sm line-clamp-1">{order.pickupAddress}</div>
                            </div>
                          </div>
                          <div className="flex gap-4">
                            <div className="w-2 h-2 rounded-full bg-brand-orange mt-2 shadow-[0_0_8px_rgba(255,122,0,0.5)] animate-pulse" />
                            <div>
                              <div className="text-[10px] text-brand-orange font-black uppercase tracking-widest mb-1">TESLİMAT</div>
                              <div className="text-white font-medium text-sm line-clamp-1">{order.dropoffAddress}</div>
                            </div>
                          </div>
                        </div>

                        <button 
                          disabled={updating}
                          onClick={() => handleAcceptOrder(order.id)}
                          className="w-full py-4 bg-white text-black rounded-2xl font-black hover:bg-gray-200 transition-all flex items-center justify-center gap-3 shadow-lg group-hover:scale-[1.02] relative z-10"
                        >
                          İşi Kabul Et
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-brand-orange to-[#ff9d42] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-[0_15px_40px_rgba(255,122,0,0.2)] animate-glow-pulse">
            <TrendingUp className="absolute -bottom-4 -right-4 w-40 h-40 opacity-20 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            <h3 className="text-lg font-bold mb-6 opacity-90 uppercase tracking-widest text-xs">Haftalık Hedef</h3>
            <div className="text-4xl font-black mb-2 drop-shadow-md">₺4.850 / ₺7.500</div>
            <div className="h-2.5 bg-black/20 rounded-full w-full mb-6 overflow-hidden">
              <div className="h-full bg-white rounded-full w-[65%] shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            </div>
            <p className="text-sm font-bold opacity-90">Hedefine ulaşmak için 22 teslimat daha yapmalısın.</p>
          </div>

          <div className="glass-card p-8">
            <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
              <Zap className="w-6 h-6 text-brand-orange" /> Kurye Ligi
            </h3>
            <div className="space-y-6">
              {[
                { name: 'Sen', score: '4.9', rank: 1, img: '🥇', color: 'text-brand-orange' },
                { name: 'Mehmet A.', score: '4.8', rank: 2, img: '🥈', color: 'text-gray-400' },
                { name: 'Caner K.', score: '4.7', rank: 3, img: '🥉', color: 'text-amber-700' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between group cursor-default p-3 -mx-3 rounded-2xl hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl filter group-hover:scale-110 group-hover:rotate-12 transition-transform drop-shadow-lg inline-block">{item.img}</span>
                    <span className={`font-bold text-lg ${i === 0 ? 'text-white' : 'text-gray-400 group-hover:text-gray-200 transition-colors'}`}>
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 rounded-xl">
                    <Bell className={`w-3 h-3 ${item.color}`} />
                    <span className="text-white font-black">{item.score}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-4 border border-white/[0.08] rounded-2xl text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-white hover:bg-white/[0.04] transition-all">
              Tüm Sıralamayı Gör
            </button>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0B1220] border border-white/10 p-8 rounded-[2rem] w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/10 rounded-full blur-[50px] pointer-events-none" />
              
              <h2 className="text-2xl font-black text-white mb-2 text-center">Teslimat Kodu (OTP)</h2>
              <p className="text-gray-400 text-sm text-center mb-8">Müşteriden aldığınız 4 haneli güvenlik kodunu girin.</p>
              
              <input
                type="text"
                maxLength={4}
                value={otpInput}
                onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                placeholder="0000"
                className="w-full text-center text-4xl tracking-[1em] font-black bg-white/[0.03] border border-white/10 rounded-2xl py-6 text-white focus:outline-none focus:border-brand-orange focus:bg-brand-orange/5 transition-all mb-8"
              />
              
              <div className="flex gap-4">
                <button
                  onClick={() => { setShowOtpModal(false); setOtpInput(''); }}
                  className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-all"
                >
                  İptal
                </button>
                <button
                  onClick={() => handleUpdateStatus('DELIVERED', otpInput)}
                  disabled={updating || otpInput.length !== 4}
                  className="flex-1 py-4 bg-gradient-to-r from-brand-orange to-[#ff9d42] text-white rounded-xl font-black hover:shadow-[0_0_20px_rgba(255,122,0,0.4)] transition-all disabled:opacity-50"
                >
                  Onayla
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
