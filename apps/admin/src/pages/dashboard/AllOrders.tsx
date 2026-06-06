import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Eye, Download, X, 
  Truck, Clock, RefreshCw, AlertCircle
} from 'lucide-react';
import api, { handleApiResponse } from '../../lib/api';

type Order = {
  id: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  pickupAddress: string;
  dropoffAddress: string;
  deliveryType: string;
  vehicleType: string;
  packageDetails?: string;
  distanceKm?: number;
  estimatedTime?: number;
  basePrice?: number;
  distancePrice?: number;
  surgePrice?: number;
  weatherPrice?: number;
  taxPrice?: number;
  discountPrice?: number;
  user?: { firstName: string; lastName: string; email: string };
  courier?: { firstName: string; lastName: string; email: string };
};

export default function AllOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: any) {
      console.error('Failed to update order status:', err.message);
      alert('Sipariş durumu güncellenemedi: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'PENDING': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'PICKED_UP': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'DELIVERED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'CANCELLED': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      `${order.user?.firstName} ${order.user?.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (order.courier &&
        `${order.courier?.firstName} ${order.courier?.lastName}`
          .toLowerCase()
          .includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ['Siparis ID', 'Tarih', 'Musteri', 'Kurye', 'Durum', 'Tutar'];
    const rows = filteredOrders.map(order => [
      order.id,
      new Date(order.createdAt).toLocaleString('tr-TR'),
      `${order.user?.firstName} ${order.user?.lastName}`,
      order.courier ? `${order.courier?.firstName} ${order.courier?.lastName}` : 'Atanmadi',
      order.status,
      `TL${order.totalPrice}`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `jetis_orders_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Sipariş Yönetimi
          </h1>
          <p className="text-gray-400 mt-1 font-medium">Sistemdeki tüm teslimat hareketlerini izleyin ve yönetin.</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 hover:border-white/20 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-white/[0.02]"
        >
          <Download className="w-5 h-5" />
          Raporu İndir (.csv)
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
        {['ALL', 'PENDING', 'PICKED_UP', 'DELIVERED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              statusFilter === status 
                ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' 
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {status === 'ALL' ? 'Tümü' : getStatusLabel(status)}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="ID, müşteri veya kurye adı ile ara..."
            className="w-full bg-[#111827] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-brand-orange/50 transition-all font-medium placeholder-gray-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-[#111827]/80 backdrop-blur-md border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase tracking-widest">Sipariş</th>
                <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase tracking-widest">Müşteri</th>
                <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase tracking-widest">Kurye</th>
                <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase tracking-widest text-center">Durum</th>
                <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Tutar</th>
                <th className="px-8 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <motion.tr 
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-white/[0.01] transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div>
                          <div className="font-bold text-white tracking-tight hover:text-brand-orange transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
                            #{order.id.slice(0, 8).toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-500 font-medium mt-0.5">{new Date(order.createdAt).toLocaleString('tr-TR')}</div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500 text-xs font-bold">
                            {order.user?.firstName?.[0]}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{order.user?.firstName} {order.user?.lastName}</div>
                            <div className="text-[10px] text-gray-500 mt-0.5">{order.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {order.courier ? (
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-brand-orange/10 rounded-lg flex items-center justify-center text-brand-orange text-xs font-bold">
                                  {order.courier?.firstName?.[0]}
                              </div>
                              <div>
                                  <div className="text-sm font-bold text-white">{order.courier?.firstName} {order.courier?.lastName}</div>
                                  <div className="text-[10px] text-gray-500 mt-0.5">Aktif Kurye</div>
                              </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-600 italic">Atanmadı</span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="text-white font-black">₺{order.totalPrice.toLocaleString('tr-TR')}</div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                        <AlertCircle className="w-10 h-10 text-gray-600" />
                        <span className="font-medium text-sm">Sipariş bulunamadı.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
          {loading && (
            <div className="p-20 text-center text-gray-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-brand-orange" />
              Yükleniyor...
            </div>
          )}
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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0B0F19] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl z-10"
            >
              {/* Header */}
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Sipariş Detayı</h3>
                  <p className="text-xs text-gray-500 mt-1">ID: #{selectedOrder.id}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Status Selector */}
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-brand-orange" />
                    <span className="text-sm font-bold text-white">Sipariş Durumu</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {['PENDING', 'PICKED_UP', 'DELIVERED', 'CANCELLED'].map((st) => (
                      <button
                        key={st}
                        disabled={actionLoading}
                        onClick={() => updateStatus(selectedOrder.id, st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          selectedOrder.status === st 
                            ? 'bg-brand-orange text-white' 
                            : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {getStatusLabel(st)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Addresses */}
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-6 h-6 rounded-full bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center text-[10px] text-brand-orange font-bold">1</div>
                      <div className="w-0.5 h-10 bg-white/5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Teslim Alım Adresi</div>
                      <p className="text-sm text-white font-medium mt-1">{selectedOrder.pickupAddress}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-[10px] text-green-500 font-bold">2</div>
                    <div>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Teslimat Adresi</div>
                      <p className="text-sm text-white font-medium mt-1">{selectedOrder.dropoffAddress}</p>
                    </div>
                  </div>
                </div>

                <hr className="border-white/5" />

                {/* Logistics Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kurye Aracı</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Truck className="w-4 h-4 text-brand-orange" />
                      <span className="text-sm text-white font-bold">{selectedOrder.vehicleType}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Paket Detayı</div>
                    <span className="text-sm text-white font-bold block mt-2">{selectedOrder.packageDetails || 'Belirtilmedi'}</span>
                  </div>
                </div>

                <hr className="border-white/5" />

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-white">Ücret Kırılımı</h4>
                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex justify-between">
                      <span>Açılış Ücreti</span>
                      <span className="text-white font-medium">Extra ₺{selectedOrder.basePrice || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mesafe Ücreti</span>
                      <span className="text-white font-medium">₺{selectedOrder.distancePrice || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Talep Artışı (Surge)</span>
                      <span className="text-white font-medium">₺{selectedOrder.surgePrice || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>KDV (20%)</span>
                      <span className="text-white font-medium">₺{selectedOrder.taxPrice || 0}</span>
                    </div>
                    {selectedOrder.discountPrice && selectedOrder.discountPrice > 0 ? (
                      <div className="flex justify-between text-green-500">
                        <span>İndirim</span>
                        <span>-₺{selectedOrder.discountPrice}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between text-base font-black text-white pt-2 border-t border-t-white/5">
                      <span>Toplam</span>
                      <span className="text-brand-orange">₺{selectedOrder.totalPrice}</span>
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
