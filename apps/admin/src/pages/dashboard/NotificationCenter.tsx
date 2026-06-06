import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, CheckCheck, Package, Truck, AlertTriangle, Info } from 'lucide-react';
import api, { handleApiResponse } from '../../lib/api';

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  data: string | null;
  isRead: boolean;
  createdAt: string;
};

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  ORDER_NEW:        { icon: Package,        color: 'text-brand-orange', bg: 'bg-brand-orange/10 border-brand-orange/20' },
  ORDER_STATUS:     { icon: Package,        color: 'text-blue-400',     bg: 'bg-blue-500/10 border-blue-500/20' },
  COURIER_OFFLINE:  { icon: Truck,          color: 'text-rose-400',     bg: 'bg-rose-500/10 border-rose-500/20' },
  COURIER_ONLINE:   { icon: Truck,          color: 'text-emerald-400',  bg: 'bg-emerald-500/10 border-emerald-500/20' },
  SYSTEM:           { icon: Info,           color: 'text-purple-400',   bg: 'bg-purple-500/10 border-purple-500/20' },
  ALERT:            { icon: AlertTriangle,  color: 'text-amber-400',    bg: 'bg-amber-500/10 border-amber-500/20' },
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });

  const fetchNotifications = async () => {
    try {
      const params: any = { page: pagination.page, limit: 20 };
      if (filter !== 'all') params.type = filter;
      const res = await api.get('/notifications', { params });
      const data = handleApiResponse<any>(res);
      setNotifications(data.notifications || []);
      setPagination(data.pagination || { page: 1, total: 0, totalPages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, [filter, pagination.page]);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Az önce';
    if (mins < 60) return `${mins}dk önce`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}sa önce`;
    return `${Math.floor(hours / 24)}g önce`;
  };

  const filterTypes = [
    { key: 'all', label: 'Tümü' },
    { key: 'ORDER_NEW', label: 'Yeni Sipariş' },
    { key: 'ORDER_STATUS', label: 'Durum' },
    { key: 'COURIER_ONLINE', label: 'Kurye Aktif' },
    { key: 'COURIER_OFFLINE', label: 'Kurye Pasif' },
    { key: 'SYSTEM', label: 'Sistem' },
    { key: 'ALERT', label: 'Uyarı' },
  ];

  return (
    <div className="space-y-8 animate-fade-up max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            Bildirimler <Bell className="w-8 h-8 text-brand-orange drop-shadow-[0_0_15px_rgba(255,122,0,0.5)]" />
          </h1>
          <p className="text-gray-400 mt-2 font-medium text-lg">Sistem bildirimleri ve uyarıları.</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button onClick={markAllAsRead}
              className="flex items-center gap-2 px-5 py-3 bg-brand-orange/10 border border-brand-orange/20 text-brand-orange rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-orange/20 transition-all">
              <CheckCheck className="w-4 h-4" /> Tümünü Oku
            </button>
          )}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl">
            <Bell className="w-4 h-4 text-brand-orange" />
            <span className="text-white text-sm font-black">{unreadCount}</span>
            <span className="text-gray-500 text-xs">okunmamış</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filterTypes.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
              filter === f.key
                ? 'bg-brand-orange text-white border-brand-orange shadow-[0_0_15px_rgba(255,122,0,0.3)]'
                : 'bg-white/[0.03] text-gray-400 border-white/[0.08] hover:bg-white/[0.06]'
            }`}>{f.label}</button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-10 h-10 border-2 border-white/10 border-t-brand-orange rounded-full animate-spin" /></div>
        ) : notifications.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <Bell className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 font-bold text-lg">Bildirim bulunamadı</p>
            <p className="text-gray-600 text-sm mt-2">Yeni bildirimler burada görünecek.</p>
          </div>
        ) : (
          notifications.map((n, i) => {
            const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.SYSTEM;
            const Icon = config.icon;
            return (
              <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                onClick={() => !n.isRead && markAsRead(n.id)}
                className={`glass-card p-5 flex items-start gap-4 cursor-pointer transition-all hover:border-white/10 ${!n.isRead ? 'border-l-2 border-l-brand-orange bg-brand-orange/[0.02]' : 'opacity-70'}`}>
                <div className={`p-3 rounded-2xl border ${config.bg} shrink-0`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-bold ${!n.isRead ? 'text-white' : 'text-gray-400'}`}>{n.title}</h3>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse shrink-0" />}
                  </div>
                  <p className="text-sm text-gray-400 mt-1 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-2">{timeAgo(n.createdAt)}</p>
                </div>
                {n.isRead && <Check className="w-4 h-4 text-gray-600 shrink-0 mt-1" />}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button key={i} onClick={() => setPagination((p) => ({ ...p, page: i + 1 }))}
              className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${
                pagination.page === i + 1
                  ? 'bg-brand-orange text-white shadow-[0_0_15px_rgba(255,122,0,0.3)]'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}
