import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Package, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../../store/useAuth';
import api from '../../lib/api';

export default function CorporateDashboard() {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState<any>({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/orders/stats');
        if (response.data?.success) {
          setStatsData(response.data.data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { title: 'Aktif Siparişler', value: statsData.totalOrders ?? '0', icon: Package, color: 'text-brand-orange' },
    { title: 'Aylık Harcama', value: statsData.monthlyRevenue ? `₺${statsData.monthlyRevenue.toLocaleString()}` : '₺0', icon: TrendingUp, color: 'text-green-500' },
    { title: 'Alt Kullanıcılar', value: statsData.totalUsers ?? '0', icon: Users, color: 'text-blue-500' },
    { title: 'Şube Sayısı', value: statsData.totalCouriers ?? '0', icon: Building2, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-10 animate-fade-up">
      {/* ── Header ───────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Kurumsal Panel 👋</h1>
          <p className="text-gray-400 mt-2 text-lg font-medium">Hoş geldin {user?.firstName}. Kurumsal hesabının özeti burada.</p>
        </div>
        <button 
          className="px-8 py-4 bg-gradient-to-r from-brand-orange to-[#ff9d42] text-white rounded-[1.25rem] font-black transition-all shadow-[0_0_30px_rgba(255,122,0,0.4)] hover:shadow-[0_0_50px_rgba(255,122,0,0.6)] flex items-center gap-3 hover:scale-[1.02] active:scale-95"
        >
          Yeni Kurumsal Gönderi
        </button>
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

      {/* ── Placeholder for Future Development ────── */}
      <div className="relative rounded-[2.5rem] overflow-hidden glass-card shadow-2xl h-[400px]">
        <div className="absolute inset-0 bg-[#0B1220]/80 backdrop-blur-sm flex items-center justify-center p-8 text-center z-10">
          <div className="max-w-md">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-brand-orange animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Detaylı Raporlar Çok Yakında</h3>
            <p className="text-gray-400 text-sm font-medium leading-relaxed">
              Bu alan, şirketinizin toplu siparişlerini yönetebileceğiniz, alt kullanıcı yetkilendirmeleri yapabileceğiniz ve detaylı aylık mali raporlar alabileceğiniz kurumsal yönetim modülü olarak geliştirilmektedir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
