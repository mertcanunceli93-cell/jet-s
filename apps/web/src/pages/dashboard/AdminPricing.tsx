import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Zap, 
  CloudRain, 
  Map as MapIcon, 
  Settings as SettingsIcon, 
  Tag, 
  History, 
  Save, 
  Plus, 
  Trash2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import api, { handleApiResponse } from '../../lib/api';

type TabType = 'rules' | 'surge' | 'weather' | 'zones' | 'coupons' | 'settings' | 'logs';

export default function AdminPricing() {
  const [activeTab, setActiveTab] = useState<TabType>('rules');
  const [loading, setLoading] = useState(true);
  const [, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [data, setData] = useState<{
    rules: any[];
    surge: any[];
    weather: any[];
    zones: any[];
    coupons: any[];
    settings: any[];
    logs: any[];
  }>({
    rules: [],
    surge: [],
    weather: [],
    zones: [],
    coupons: [],
    settings: [],
    logs: []
  });

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [configRes, logsRes] = await Promise.all([
        api.get('/pricing/admin/config'),
        api.get('/pricing/admin/audit-logs')
      ]);
      
      const config = handleApiResponse<any>(configRes);
      const logs = handleApiResponse<any>(logsRes);

      // Fetch other entities
      const [surgeRes, weatherRes, zonesRes, couponsRes] = await Promise.all([
        api.get('/pricing/admin/surge-pricing'),
        api.get('/pricing/admin/weather-pricing'),
        api.get('/pricing/admin/zones'),
        api.get('/pricing/admin/coupons')
      ]);

      setData({
        rules: config.pricingRules || [],
        surge: handleApiResponse<any>(surgeRes).items || [],
        weather: handleApiResponse<any>(weatherRes).items || [],
        zones: handleApiResponse<any>(zonesRes).items || [],
        coupons: handleApiResponse<any>(couponsRes).items || [],
        settings: config.settings || [],
        logs: logs.logs || []
      });
    } catch (err: any) {
      console.error('Fetch failed:', err.message);
      setMessage({ type: 'error', text: 'Veriler yüklenirken hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleUpdate = async (entity: string, id: string, patch: any) => {
    setSaving(true);
    try {
      await api.patch(`/pricing/admin/${entity}/${id}`, patch);
      setMessage({ type: 'success', text: 'Güncelleme başarılı.' });
      fetchAllData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Güncelleme başarısız.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const tabs: { id: TabType; name: string; icon: any }[] = [
    { id: 'rules', name: 'Fiyat Kuralları', icon: TrendingUp },
    { id: 'surge', name: 'Dinamik Artış', icon: Zap },
    { id: 'weather', name: 'Hava Durumu', icon: CloudRain },
    { id: 'zones', name: 'Bölgeler', icon: MapIcon },
    { id: 'coupons', name: 'Kuponlar', icon: Tag },
    { id: 'settings', name: 'Genel Ayarlar', icon: SettingsIcon },
    { id: 'logs', name: 'İşlem Geçmişi', icon: History },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Pricing Engine</h1>
          <p className="text-gray-400 mt-2 text-lg">SaaS altyapısı fiyatlandırma ve kural yönetimi.</p>
        </div>
        
        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className={`px-6 py-3 rounded-2xl border flex items-center gap-3 shadow-xl ${
                message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
              }`}
            >
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="font-bold">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.name}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Rules Tab */}
        {activeTab === 'rules' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.rules.map((rule) => (
                <motion.div 
                  layout
                  key={rule.id} 
                  className="bg-[#111827] border border-white/5 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <TrendingUp className="w-24 h-24 text-brand-orange" />
                  </div>
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <div className="text-brand-orange text-xs font-black uppercase tracking-widest mb-1">{rule.deliveryType}</div>
                      <h3 className="text-2xl font-bold text-white">{rule.vehicleType}</h3>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${rule.isActive ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                      {rule.isActive ? 'AKTİF' : 'PASİF'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Taban Fiyat</label>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">₺</span>
                        <input 
                          type="number"
                          className="bg-transparent border-b border-white/10 focus:border-brand-orange outline-none text-white font-bold w-full"
                          defaultValue={rule.basePrice}
                          onBlur={(e) => handleUpdate('pricing-rules', rule.id, { basePrice: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Km Ücreti</label>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">₺</span>
                        <input 
                          type="number"
                          className="bg-transparent border-b border-white/10 focus:border-brand-orange outline-none text-white font-bold w-full"
                          defaultValue={rule.perKmPrice}
                          onBlur={(e) => handleUpdate('pricing-rules', rule.id, { perKmPrice: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Surge Tab */}
        {activeTab === 'surge' && (
          <div className="bg-[#111827] border border-white/5 rounded-[2.5rem] p-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-orange/20 rounded-2xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-brand-orange" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Dinamik Artış Yönetimi</h2>
                  <p className="text-gray-500">Yoğun saatlerde uygulanacak çarpan değerleri.</p>
                </div>
              </div>
              <button className="bg-brand-orange text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all">
                <Plus className="w-5 h-5" /> Yeni Ekle
              </button>
            </div>

            <div className="space-y-4">
              {data.surge.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all">
                  <div className="flex-1 grid grid-cols-4 gap-8">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Kural Adı</div>
                      <div className="font-bold text-white">{item.name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Çarpan</div>
                      <div className="font-black text-brand-orange text-lg">x{item.multiplier}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Saat Aralığı</div>
                      <div className="text-gray-300 font-medium">{item.startTime} - {item.endTime}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Günler</div>
                      <div className="text-gray-300 text-xs truncate">{item.daysOfWeek || 'Tüm Günler'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="p-3 text-gray-500 hover:text-white transition-colors"><SettingsIcon className="w-5 h-5" /></button>
                    <button className="p-3 text-red-500/50 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-[#111827] border border-white/5 rounded-[2.5rem] p-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <SettingsIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Sistem Parametreleri</h2>
                <p className="text-gray-500">Global vergi, komisyon ve gece tarifesi ayarları.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {data.settings.map((setting) => (
                <div key={setting.key} className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-lg">{setting.key}</h4>
                      <p className="text-sm text-gray-500">{setting.description}</p>
                    </div>
                    <div className="bg-brand-orange/10 p-2 rounded-xl">
                      <Save className="w-5 h-5 text-brand-orange cursor-pointer hover:scale-110 transition-all" />
                    </div>
                  </div>
                  <input 
                    type="text"
                    className="w-full bg-[#0B1220] border border-gray-800 rounded-2xl py-4 px-6 text-white font-black text-xl focus:border-brand-orange outline-none transition-all"
                    defaultValue={setting.value}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="bg-[#111827] border border-white/5 rounded-[2.5rem] overflow-hidden">
            <div className="p-10 border-b border-white/5">
              <h2 className="text-2xl font-bold text-white">Denetim Günlükleri</h2>
              <p className="text-gray-500">Fiyatlandırma motorunda yapılan tüm değişikliklerin dökümü.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="px-10 py-6">İşlem</th>
                    <th className="px-10 py-6">Varlık</th>
                    <th className="px-10 py-6">Admin ID</th>
                    <th className="px-10 py-6">Tarih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-all">
                      <td className="px-10 py-6 font-bold text-brand-orange">{log.action}</td>
                      <td className="px-10 py-6 text-gray-300">{log.entity}</td>
                      <td className="px-10 py-6 text-xs text-gray-500 font-mono">{log.adminId}</td>
                      <td className="px-10 py-6 text-sm text-gray-400">{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

