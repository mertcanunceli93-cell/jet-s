import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, MapPin, Clock, Phone, ArrowLeft, ShieldCheck, Navigation } from 'lucide-react';
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
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  packageDetails?: string;
  estimatedTime?: number;
};

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        const data = handleApiResponse(response) as { order: Order };
        setOrder(data.order);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('Failed to fetch order details:', err.message);
        } else {
          console.error('Failed to fetch order details:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
       
      void fetchOrderDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <Package className="w-16 h-16 text-gray-800 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-white mb-4">Sipariş Bulunamadı</h2>
        <Link to="/dashboard/history" className="text-brand-orange font-bold hover:underline">Geçmişe Dön</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <Link 
          to="/dashboard/history" 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
        >
          <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="font-bold">Geri Dön</span>
        </Link>
        <div className="flex items-center gap-3">
            <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">Sipariş ID:</span>
            <span className="text-white font-black">#{order.id.slice(0, 8).toUpperCase()}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#111827] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-brand-orange/20 rounded-2xl flex items-center justify-center text-brand-orange shadow-[0_0_20px_rgba(255,122,0,0.2)]">
                  <Navigation className="w-7 h-7 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight">Canlı Takip</h1>
                  <p className="text-sm text-gray-400 font-medium">Kuryeniz şu an yolda ve size yaklaşıyor.</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Tahmini Varış</div>
                <div className="text-2xl font-black text-brand-orange">{order.estimatedTime || 15} DK</div>
              </div>
            </div>
            <div className="h-[500px]">
              <TrackingMap 
                orderId={order.id} 
                pickupCoords={[order.pickupLat, order.pickupLng]}
                deliveryCoords={[order.dropoffLat, order.dropoffLng]}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#111827] border border-white/5 rounded-3xl p-8 space-y-6">
                <h3 className="text-lg font-black text-white flex items-center gap-3">
                    <div className="w-2 h-2 bg-brand-orange rounded-full" />
                    Adres Bilgileri
                </h3>
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="mt-1 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 shrink-0">
                            <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Alış Adresi</div>
                            <div className="text-white font-medium leading-relaxed">{order.pickupAddress}</div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="mt-1 w-8 h-8 rounded-lg bg-brand-orange/20 flex items-center justify-center text-brand-orange shrink-0">
                            <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Teslimat Adresi</div>
                            <div className="text-white font-medium leading-relaxed">{order.dropoffAddress}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[#111827] border border-white/5 rounded-3xl p-8 space-y-6">
                <h3 className="text-lg font-black text-white flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    Gönderi Detayları
                </h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <Package className="w-5 h-5 text-gray-400" />
                            <span className="text-sm font-medium text-gray-300">İçerik</span>
                        </div>
                        <span className="text-white font-bold">{order.packageDetails || 'Belirtilmedi'}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <span className="text-sm font-medium text-gray-300">Hizmet</span>
                        </div>
                        <span className="text-brand-orange font-bold">{order.deliveryType}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-brand-orange/10 border border-brand-orange/20 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-brand-orange" />
                            <span className="text-sm font-medium text-brand-orange">Sigortalı</span>
                        </div>
                        <span className="text-brand-orange font-black">AKTİF</span>
                    </div>
                </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
            <div className="bg-[#111827] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 blur-3xl rounded-full" />
                <h3 className="text-xl font-black text-white mb-8">Teslimat Özeti</h3>
                
                <div className="space-y-6">
                    <div className="flex justify-between py-4 border-b border-white/5">
                        <span className="text-gray-400 font-medium">Ara Toplam</span>
                        <span className="text-white font-bold">₺{(order.totalPrice * 0.82).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-4 border-b border-white/5">
                        <span className="text-gray-400 font-medium">KDV (%20)</span>
                        <span className="text-white font-bold">₺{(order.totalPrice * 0.18).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-4">
                        <span className="text-xl font-black text-white">Toplam Ödenen</span>
                        <span className="text-2xl font-black text-brand-orange">₺{order.totalPrice.toLocaleString('tr-TR')}</span>
                    </div>
                </div>

                <button className="w-full mt-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-black uppercase tracking-widest text-xs transition-all">
                    Faturayı İndir
                </button>
            </div>

            <div className="bg-gradient-to-br from-brand-orange to-[#ff8a1a] rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(255,122,0,0.3)] text-white">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                        <Phone className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-xs font-black uppercase tracking-widest opacity-70">Müşteri Destek</div>
                        <div className="text-xl font-black leading-none mt-1">Yardıma mı ihtiyacınız var?</div>
                    </div>
                </div>
                <p className="text-white/80 font-medium mb-8 leading-relaxed">
                    Teslimatla ilgili bir sorun mu yaşıyorsunuz? 7/24 canlı destek ekibimize anında ulaşın.
                </p>
                <button className="w-full py-4 bg-white text-brand-orange rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                    Canlı Desteğe Bağlan
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
