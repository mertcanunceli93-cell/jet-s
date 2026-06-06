import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, DollarSign, Package, Users, Truck, Zap } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import api, { handleApiResponse } from '../../lib/api';

const COLORS = ['#FF7A00', '#3B82F6', '#10B981', '#F43F5E', '#8B5CF6', '#F59E0B'];

export default function Analytics() {
  const [revenueData, setRevenueData] = useState<any>({ chartData: [], summary: {} });
  const [orderData, setOrderData] = useState<any>({ statusBreakdown: [], vehicleBreakdown: [] });
  const [courierPerf, setCourierPerf] = useState<any[]>([]);
  const [trends, setTrends] = useState<any>({ revenue: {}, orders: {} });
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [revRes, ordRes, couRes, trendRes] = await Promise.all([
          api.get(`/analytics/revenue?period=${period}`),
          api.get('/analytics/orders'),
          api.get('/analytics/couriers'),
          api.get('/analytics/trends'),
        ]);
        setRevenueData(handleApiResponse<any>(revRes));
        setOrderData(handleApiResponse<any>(ordRes));
        setCourierPerf(handleApiResponse<any>(couRes).couriers || []);
        setTrends(handleApiResponse<any>(trendRes).trends || {});
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [period]);

  const statCards = [
    { title: 'Toplam Ciro', value: `₺${(revenueData.summary?.totalRevenue || 0).toLocaleString()}`, change: trends.revenue?.change, icon: DollarSign, color: 'text-green-400' },
    { title: 'Toplam Sipariş', value: (revenueData.summary?.totalOrders || 0).toLocaleString(), change: trends.orders?.change, icon: Package, color: 'text-brand-orange' },
    { title: 'Ort. Sipariş', value: `₺${revenueData.summary?.avgOrderValue || 0}`, change: null, icon: TrendingUp, color: 'text-blue-400' },
    { title: 'Platform Komisyon', value: `₺${(revenueData.summary?.totalCommission || 0).toLocaleString()}`, change: null, icon: Zap, color: 'text-purple-400' },
  ];

  const getStatusLabel = (s: string) => {
    const map: Record<string, string> = { PENDING: 'Bekliyor', PICKED_UP: 'Yolda', DELIVERED: 'Teslim', CANCELLED: 'İptal' };
    return map[s] || s;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-3 border-white/10 border-t-brand-orange rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            Analitik & Raporlar <BarChart3 className="w-8 h-8 text-brand-orange drop-shadow-[0_0_15px_rgba(255,122,0,0.5)]" />
          </h1>
          <p className="text-gray-400 mt-2 font-medium text-lg">Platformun finansal ve operasyonel performansı.</p>
        </div>
        <div className="flex gap-2">
          {[{ key: '7d', label: '7 Gün' }, { key: '30d', label: '30 Gün' }, { key: '90d', label: '90 Gün' }].map((p) => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                period === p.key ? 'bg-brand-orange text-white border-brand-orange shadow-[0_0_15px_rgba(255,122,0,0.3)]' : 'bg-white/[0.03] text-gray-400 border-white/[0.08] hover:bg-white/[0.06]'
              }`}>{p.label}</button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-card p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="absolute -top-10 -right-10 p-4 opacity-[0.03] group-hover:scale-125 group-hover:opacity-[0.08] transition-all duration-500">
                <Icon className="w-32 h-32" />
              </div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest">{stat.title}</h3>
                <div className={`p-2.5 rounded-xl bg-white/[0.04] shadow-inner border border-white/[0.05] ${stat.color}`}><Icon className="w-5 h-5" /></div>
              </div>
              <div className="text-3xl font-black text-white relative z-10">{stat.value}</div>
              {stat.change !== null && stat.change !== undefined && (
                <div className={`mt-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-fit px-2 py-1 rounded-full border ${
                  stat.change >= 0 ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                }`}>{stat.change >= 0 ? '+' : ''}{stat.change}% geçen haftaya göre</div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <div className="glass-card p-8 space-y-6">
        <h2 className="text-xl font-black text-white flex items-center gap-2"><TrendingUp className="w-5 h-5 text-brand-orange" /> Gelir Grafiği</h2>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData.chartData || []}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF7A00" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₺${v}`} />
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#9CA3AF' }} />
              <Area type="monotone" dataKey="revenue" name="Ciro" stroke="#FF7A00" strokeWidth={2.5} fill="url(#colorRevenue)" />
              <Area type="monotone" dataKey="commission" name="Komisyon" stroke="#8B5CF6" strokeWidth={2} fill="url(#colorCommission)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Order Analytics + Courier Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Pie Chart */}
        <div className="glass-card p-8 space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2"><Package className="w-5 h-5 text-brand-orange" /> Sipariş Durumları</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={(orderData.statusBreakdown || []).map((d: any) => ({ ...d, name: getStatusLabel(d.name) }))} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value" label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
                  {(orderData.statusBreakdown || []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Distribution Bar Chart */}
        <div className="glass-card p-8 space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2"><Truck className="w-5 h-5 text-brand-orange" /> Araç Dağılımı</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderData.vehicleBreakdown || []} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: 12 }} />
                <Bar dataKey="value" name="Sipariş" fill="#FF7A00" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Courier Performance Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-8 border-b border-white/5">
          <h2 className="text-xl font-black text-white flex items-center gap-2"><Users className="w-5 h-5 text-brand-orange" /> Kurye Performans Sıralaması</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] text-gray-500 text-[10px] uppercase tracking-widest font-black">
              <tr className="border-b border-white/5">
                <th className="px-8 py-4">#</th>
                <th className="px-8 py-4">Kurye</th>
                <th className="px-8 py-4 text-center">Araç</th>
                <th className="px-8 py-4 text-center">Teslimat</th>
                <th className="px-8 py-4 text-center">Başarı Oranı</th>
                <th className="px-8 py-4 text-right">Toplam Ciro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {courierPerf.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-10 text-center text-gray-500 font-medium">Veri bulunamadı.</td></tr>
              ) : (
                courierPerf.map((c: any, i: number) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-4">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
                        i === 0 ? 'bg-brand-orange/20 text-brand-orange' : i === 1 ? 'bg-blue-500/20 text-blue-400' : i === 2 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-400'
                      }`}>{i + 1}</span>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-orange to-[#ff9d42] flex items-center justify-center text-white font-black text-xs">
                          {c.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{c.name}</div>
                          <div className={`text-[10px] font-black uppercase tracking-widest ${c.isOnline ? 'text-emerald-400' : 'text-gray-500'}`}>
                            {c.isOnline ? '● Aktif' : '● Pasif'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-center text-sm text-gray-300 font-medium">{c.vehicleType}</td>
                    <td className="px-8 py-4 text-center text-white font-black">{c.totalDeliveries}</td>
                    <td className="px-8 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-brand-orange to-emerald-400" style={{ width: `${c.successRate}%` }} />
                        </div>
                        <span className="text-sm font-bold text-white">{c.successRate}%</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right text-brand-orange font-black text-lg">₺{c.totalRevenue.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
