import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, PlusCircle, Clock, Settings, MapPin,
  Map, TrendingUp, ChevronLeft, LogOut, Zap
} from 'lucide-react';
import { useAuth } from '../../store/useAuth';

const ROLE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  ADMIN:     { label: 'Yönetici',  color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  CORPORATE: { label: 'Kurumsal',  color: 'text-brand-orange', bg: 'bg-brand-orange/10 border-brand-orange/20' },
  COURIER:   { label: 'Kurye',     color: 'text-green-400',  bg: 'bg-green-500/10  border-green-500/20'  },
  USER:      { label: 'Kullanıcı', color: 'text-blue-400',   bg: 'bg-blue-500/10   border-blue-500/20'   },
};

export default function Sidebar({ mobileOpen, onClose }: { mobileOpen?: boolean; onClose?: () => void }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const getNavItems = () => {
    if (user?.role === 'COURIER') {
      return [
        { name: 'Kurye Paneli', href: '/dashboard',          icon: Home       },
        { name: 'Mevcut İşler', href: '/dashboard/available', icon: Map        },
        { name: 'Kazançlarım',  href: '/dashboard/earnings',  icon: TrendingUp },
        { name: 'Ayarlar',      href: '/dashboard/settings',  icon: Settings   },
      ];
    }
    if (user?.role === 'CORPORATE') {
      return [
        { name: 'Kurumsal Panel', href: '/dashboard',               icon: Home      },
        { name: 'Toplu Gönderi',  href: '/dashboard/create-order',  icon: PlusCircle},
        { name: 'Sipariş Geçmişi',href: '/dashboard/history',       icon: Clock     },
        { name: 'Şubeler / Adresler', href: '/dashboard/addresses', icon: MapPin    },
        { name: 'Fatura & Ayarlar',   href: '/dashboard/settings',  icon: Settings  },
      ];
    }
    return [
      { name: 'Özet',        href: '/dashboard',               icon: Home      },
      { name: 'Kurye Çağır', href: '/dashboard/create-order',  icon: PlusCircle},
      { name: 'Siparişlerim',href: '/dashboard/history',       icon: Clock     },
      { name: 'Adreslerim',  href: '/dashboard/addresses',     icon: MapPin    },
      { name: 'Ayarlar',     href: '/dashboard/settings',      icon: Settings  },
    ];
  };

  const navItems = getNavItems();
  const roleInfo = ROLE_LABELS[user?.role ?? 'USER'] ?? ROLE_LABELS.USER;

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose?.();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          'h-screen flex flex-col z-50 sidebar-transition relative',
          'bg-gradient-to-b from-[#0e1623] via-[#111827] to-[#0d141f]',
          'border-r border-white/[0.06]',
          collapsed ? 'w-[72px]' : 'w-64',
          /* mobile: slide-over */
          'fixed md:relative',
          mobileOpen ? 'translate-x-0 animate-slide-in-left' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        {/* Decorative top glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-orange/40 to-transparent" />

        {/* ── Logo ─────────────────────────── */}
        <div className="h-[70px] flex items-center px-4 border-b border-white/[0.06] shrink-0 relative">
          <Link to="/" className="flex items-center gap-3 group min-w-0" onClick={onClose}>
            <div className="w-9 h-9 rounded-xl bg-brand-orange flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(255,122,0,0.4)] group-hover:shadow-[0_0_30px_rgba(255,122,0,0.6)] transition-shadow">
              <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            {!collapsed && (
              <span className="text-xl font-black tracking-widest text-white transition-all">
                JETIS
              </span>
            )}
          </Link>

          {/* Collapse toggle — desktop only */}
          <button
            onClick={() => setCollapsed(v => !v)}
            className={[
              'hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2',
              'w-6 h-6 rounded-full bg-[#1a2235] border border-white/10',
              'items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-all',
            ].join(' ')}
          >
            <ChevronLeft
              className={`w-3.5 h-3.5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* ── Role Badge ───────────────────── */}
        {!collapsed && (
          <div className="px-4 pt-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-widest w-fit ${roleInfo.bg} ${roleInfo.color}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {roleInfo.label}
            </div>
          </div>
        )}

        {/* ── Nav Items ────────────────────── */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <div key={item.name} className="relative group/item">
                <Link
                  to={item.href}
                  onClick={onClose}
                  className={[
                    'flex items-center gap-3 rounded-xl transition-all duration-200 relative overflow-hidden',
                    collapsed ? 'px-0 py-3 justify-center' : 'px-4 py-3',
                    isActive
                      ? 'bg-gradient-to-r from-brand-orange to-[#ff9d42] text-white shadow-[0_4px_20px_rgba(255,122,0,0.35)]'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.06]',
                  ].join(' ')}
                >
                  {/* Active indicator line */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/40 rounded-r-full" />
                  )}
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : ''}`} />
                  {!collapsed && (
                    <span className="font-semibold text-sm truncate">{item.name}</span>
                  )}
                </Link>

                {/* Tooltip for collapsed mode */}
                {collapsed && (
                  <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 opacity-0 group-hover/item:opacity-100 transition-opacity duration-150">
                    <div className="bg-[#1e293b] border border-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                      {item.name}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* ── Bottom: User Card + Logout ──── */}
        <div className="p-3 border-t border-white/[0.06] space-y-2 shrink-0">
          {/* User info */}
          <div className={`flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-orange to-[#ff9d42] flex items-center justify-center text-white font-black text-sm shrink-0 shadow-[0_0_12px_rgba(255,122,0,0.3)]">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={[
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group/logout',
              collapsed ? 'justify-center' : '',
            ].join(' ')}
          >
            <LogOut className="w-4 h-4 shrink-0 group-hover/logout:rotate-12 transition-transform" />
            {!collapsed && <span className="text-sm font-semibold">Çıkış Yap</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
