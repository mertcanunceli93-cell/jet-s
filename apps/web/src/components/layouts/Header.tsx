import { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, X, ChevronDown, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../../store/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

const BREADCRUMB_MAP: Record<string, string> = {
  '/dashboard':             'Genel Bakış',
  '/dashboard/create-order':'Kurye Çağır',
  '/dashboard/history':     'Sipariş Geçmişi',
  '/dashboard/addresses':   'Adreslerim',
  '/dashboard/all-orders':  'Tüm Siparişler',
  '/dashboard/pricing':     'Pricing Engine',
  '/dashboard/users':       'Kullanıcılar',
  '/dashboard/settings':    'Ayarlar',
  '/dashboard/available':   'Mevcut İşler',
  '/dashboard/earnings':    'Kazançlarım',
};

const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'Yeni sipariş alındı',       sub: '#AB12CD · 2 dk önce',   dot: 'bg-brand-orange', unread: true  },
  { id: 2, title: 'Kurye siparişi teslim etti',sub: '#88EF01 · 14 dk önce',  dot: 'bg-green-500',    unread: true  },
  { id: 3, title: 'Ödeme onaylandı',            sub: '₺340 · 1 sa önce',      dot: 'bg-blue-500',     unread: false },
];

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifOpen, setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const notifRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = MOCK_NOTIFICATIONS.filter(n => n.unread).length;
  const breadcrumb  = BREADCRUMB_MAP[location.pathname] ?? 'Panel';

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

      {/* Center: Search */}
      <div className={`flex-1 max-w-sm mx-4 md:mx-8 transition-all duration-300 ${searchFocused ? 'max-w-md' : ''}`}>
        <div className={`relative flex items-center rounded-xl border transition-all duration-300 ${
          searchFocused
            ? 'bg-[#0B1220] border-brand-orange/50 shadow-[0_0_20px_rgba(255,122,0,0.15)]'
            : 'bg-white/[0.04] border-white/[0.06] hover:border-white/10'
        }`}>
          <Search className={`absolute left-3 w-4 h-4 transition-colors ${searchFocused ? 'text-brand-orange' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Sipariş ara..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full bg-transparent pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none"
          />
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
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-orange rounded-full border-2 border-[#111827] flex items-center justify-center text-[9px] font-black text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#111827] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden animate-fade-up z-50">
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                <span className="text-sm font-black text-white">Bildirimler</span>
                <button onClick={() => setNotifOpen(false)} className="p-1 hover:bg-white/5 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {MOCK_NOTIFICATIONS.map(n => (
                  <div key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors cursor-pointer ${n.unread ? '' : 'opacity-60'}`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.dot} ${n.unread ? 'shadow-[0_0_8px_currentColor]' : ''}`} />
                    <div>
                      <p className="text-sm font-semibold text-white">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{n.sub}</p>
                    </div>
                    {n.unread && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-orange mt-1.5 shrink-0" />}
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-white/[0.06]">
                <button className="w-full text-xs text-center text-brand-orange hover:text-white font-bold py-1 transition-colors">
                  Tüm bildirimleri gör
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
