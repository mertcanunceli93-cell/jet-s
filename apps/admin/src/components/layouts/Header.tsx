import { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, X, ChevronDown, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../../store/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { handleApiResponse } from '../../lib/api';

const BREADCRUMB_MAP: Record<string, string> = {
  '/dashboard':              'Genel Bakış',
  '/dashboard/create-order': 'Kurye Çağır',
  '/dashboard/history':      'Sipariş Geçmişi',
  '/dashboard/addresses':    'Adreslerim',
  '/dashboard/all-orders':   'Tüm Siparişler',
  '/dashboard/couriers':     'Kurye Yönetimi',
  '/dashboard/analytics':    'Analitik & Raporlar',
  '/dashboard/pricing':      'Pricing Engine',
  '/dashboard/users':        'Kullanıcılar',
  '/dashboard/notifications':'Bildirimler',
  '/dashboard/audit-log':    'Sistem Günlüğü',
  '/dashboard/settings':     'Ayarlar',
  '/dashboard/available':    'Mevcut İşler',
  '/dashboard/earnings':     'Kazançlarım',
};

type NotifItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

const NOTIF_DOT: Record<string, string> = {
  ORDER_NEW: 'bg-brand-orange',
  ORDER_STATUS: 'bg-blue-500',
  COURIER_OFFLINE: 'bg-rose-500',
  COURIER_ONLINE: 'bg-emerald-500',
  SYSTEM: 'bg-purple-500',
  ALERT: 'bg-amber-500',
};

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifOpen, setNotifOpen]     = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const breadcrumb  = BREADCRUMB_MAP[location.pathname] ?? 'Panel';

  // Fetch unread count
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications/unread-count');
        const data = handleApiResponse<any>(res);
        setUnreadCount(data.count || 0);
      } catch {
        setUnreadCount(0);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (notifOpen) {
      const fetchNotifs = async () => {
        try {
          const res = await api.get('/notifications?limit=5');
          const data = handleApiResponse<any>(res);
          setNotifications(data.notifications || []);
        } catch {
          setNotifications([]);
        }
      };
      fetchNotifs();
    }
  }, [notifOpen]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Az önce';
    if (mins < 60) return `${mins}dk önce`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}sa önce`;
    return `${Math.floor(hours / 24)}g önce`;
  };

  return (
    <header className="h-[70px] bg-gradient-to-r from-[#0e1623] to-[#111827] border-b border-white/[0.06] flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shrink-0">

      {/* Left: Hamburger (mobile) + Breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <p className="text-[11px] text-gray-600 font-semibold uppercase tracking-widest">Panel</p>
          <h2 className="text-base font-black text-white leading-tight">{breadcrumb}</h2>
        </div>
      </div>

      {/* Center: Global Search */}
      <div className={`flex-1 max-w-sm mx-4 md:mx-8 transition-all duration-300 ${searchFocused ? 'max-w-md' : ''}`}>
        <div className={`relative flex items-center rounded-xl border transition-all duration-300 ${
          searchFocused
            ? 'bg-[#0B1220] border-brand-orange/50 shadow-[0_0_20px_rgba(255,122,0,0.15)]'
            : 'bg-white/[0.04] border-white/[0.06] hover:border-white/10'
        }`}>
          <Search className={`absolute left-3 w-4 h-4 transition-colors ${searchFocused ? 'text-brand-orange' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Sipariş, kurye veya müşteri ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full bg-transparent pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none"
          />
          {searchFocused && (
            <kbd className="absolute right-3 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-gray-500 font-mono">⌘K</kbd>
          )}
        </div>
      </div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-2">

        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen(v => !v); setProfileOpen(false); }}
            className={`relative p-2.5 rounded-xl transition-all ${notifOpen ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/[0.06]'}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-brand-orange rounded-full border-2 border-[#111827] flex items-center justify-center text-[9px] font-black text-white animate-pulse shadow-[0_0_8px_rgba(255,122,0,0.5)]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-[#111827] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden animate-fade-up z-50">
              <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
                <span className="text-sm font-black text-white">Bildirimler</span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-brand-orange/20 text-brand-orange text-[10px] font-black rounded-full">{unreadCount} yeni</span>
                  )}
                  <button onClick={() => setNotifOpen(false)} className="p-1 hover:bg-white/5 rounded-lg transition-colors">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="divide-y divide-white/[0.04] max-h-80 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <Bell className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Bildirim yok</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} onClick={() => !n.isRead && markAsRead(n.id)}
                      className={`flex items-start gap-3 px-5 py-3.5 hover:bg-white/[0.03] transition-colors cursor-pointer ${n.isRead ? 'opacity-60' : ''}`}>
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${NOTIF_DOT[n.type] || 'bg-gray-500'} ${!n.isRead ? 'shadow-[0_0_8px_currentColor]' : ''}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{n.message}</p>
                        <p className="text-[10px] text-gray-600 mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.isRead && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-orange mt-1.5 shrink-0 animate-pulse" />}
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2.5 border-t border-white/[0.06]">
                <button onClick={() => { navigate('/dashboard/notifications'); setNotifOpen(false); }}
                  className="w-full text-xs text-center text-brand-orange hover:text-white font-bold py-1 transition-colors">
                  Tüm bildirimleri gör →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-white/[0.08] mx-1" />

        {/* Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => { setProfileOpen(v => !v); setNotifOpen(false); }}
            className={`flex items-center gap-2.5 p-1.5 rounded-xl transition-all ${profileOpen ? 'bg-white/10' : 'hover:bg-white/[0.06]'}`}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-orange to-[#ff9d42] flex items-center justify-center text-white font-black text-xs shadow-[0_0_12px_rgba(255,122,0,0.3)]">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-white leading-tight">{user?.firstName}</p>
              <p className="text-[10px] text-gray-500 leading-tight">{user?.role}</p>
            </div>
            <ChevronDown className={`hidden sm:block w-4 h-4 text-gray-500 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-[#111827] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden animate-fade-up z-50">
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <p className="text-sm font-black text-white">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{user?.email}</p>
              </div>
              <div className="p-2 space-y-1">
                <button
                  onClick={() => { navigate('/dashboard/settings'); setProfileOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                >
                  <User className="w-4 h-4" /> Profilim
                </button>
                <button
                  onClick={() => { navigate('/dashboard/settings'); setProfileOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                >
                  <Settings className="w-4 h-4" /> Ayarlar
                </button>
                <div className="h-px bg-white/[0.06] my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" /> Çıkış Yap
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
