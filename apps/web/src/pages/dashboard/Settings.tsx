import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Bell, CreditCard, ChevronRight, Save, LogOut, Zap } from 'lucide-react';
import { useAuth } from '../../store/useAuth';
import api from '../../lib/api';

export default function Settings() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const handleUpdateProfile = async () => {
    try {
      await api.patch('/users/me', { firstName, lastName, phone });
      alert('Profil başarıyla güncellendi.');
    } catch (error) {
      console.error('Failed to update profile', error);
      alert('Profil güncellenirken hata oluştu.');
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profil', icon: User },
    { id: 'security', name: 'Güvenlik', icon: Shield },
    { id: 'notifications', name: 'Bildirimler', icon: Bell },
    { id: 'payment', name: 'Ödeme Yöntemleri', icon: CreditCard },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-up">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
          Ayarlar <Zap className="w-8 h-8 text-brand-orange drop-shadow-[0_0_15px_rgba(255,122,0,0.5)]" />
        </h1>
        <p className="text-gray-400 mt-2 font-medium text-lg">Hesap bilgilerinizi ve tercihlerinizi yönetin.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="space-y-2 relative z-10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-brand-orange to-[#ff9d42] text-white shadow-[0_0_20px_rgba(255,122,0,0.3)]' 
                    : 'text-gray-400 hover:text-white glass-card hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-brand-orange transition-colors'}`} />
                  <span className={`font-bold ${isActive ? 'text-white' : 'text-gray-300'}`}>{tab.name}</span>
                </div>
                {isActive && <ChevronRight className="w-5 h-5 drop-shadow-md" />}
              </button>
            );
          })}
          
          <div className="pt-4 border-t border-white/[0.06] mt-4">
            <button 
              onClick={logout}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-400 hover:text-white glass-card hover:bg-red-500 hover:border-red-500 shadow-[0_0_15px_rgba(239,68,68,0)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all font-bold group"
            >
              <LogOut className="w-5 h-5 text-red-500 group-hover:text-white transition-colors" />
              Çıkış Yap
            </button>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="glass-card p-10 relative overflow-hidden min-h-[500px]">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/10 rounded-full blur-[80px] pointer-events-none" />

            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div 
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8 relative z-10"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 mb-10">
                    <div className="w-28 h-28 bg-gradient-to-br from-brand-orange to-[#ff9d42] rounded-3xl flex items-center justify-center text-white font-black text-4xl shadow-[0_0_30px_rgba(255,122,0,0.4)] relative group cursor-pointer">
                      <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <span className="text-xs tracking-widest uppercase font-black">Değiştir</span>
                      </div>
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white">Profil Resmi</h3>
                      <p className="text-gray-400 text-sm font-medium mt-1 mb-4">Platform genelinde görünecek profil resminiz.</p>
                      <div className="flex gap-3">
                        <button className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest border border-white/10 transition-all">Yükle</button>
                        <button className="px-6 py-2.5 text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300 rounded-xl text-xs font-black uppercase tracking-widest transition-all">Kaldır</button>
                      </div>
                    </div>
                  </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Ad</label>
                        <input 
                          type="text" 
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-orange focus:bg-brand-orange/5 transition-all font-medium" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Soyad</label>
                        <input 
                          type="text" 
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-orange focus:bg-brand-orange/5 transition-all font-medium" 
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Telefon</label>
                        <input 
                          type="tel" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-orange focus:bg-brand-orange/5 transition-all font-medium" 
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">E-posta Adresi</label>
                        <input 
                          type="email" 
                          defaultValue={user?.email}
                          readOnly
                          className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-white opacity-50 cursor-not-allowed focus:outline-none font-medium" 
                        />
                      </div>
                    </div>

                  <div className="pt-6">
                    <button 
                      onClick={handleUpdateProfile}
                      className="px-8 py-4 bg-gradient-to-r from-brand-orange to-[#ff9d42] text-white rounded-2xl font-black hover:shadow-[0_0_30px_rgba(255,122,0,0.5)] transition-all flex items-center gap-3"
                    >
                      <Save className="w-5 h-5" />
                      Değişiklikleri Kaydet
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div 
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8 relative z-10"
                >
                  <h3 className="text-2xl font-black text-white flex items-center gap-3">
                    <Shield className="w-6 h-6 text-brand-orange" /> Şifre Değiştir
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Mevcut Şifre</label>
                      <input type="password" placeholder="••••••••" className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-orange focus:bg-brand-orange/5 transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Yeni Şifre</label>
                      <input type="password" placeholder="••••••••" className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-orange focus:bg-brand-orange/5 transition-all" />
                    </div>
                  </div>
                  <div className="pt-6">
                    <button className="px-8 py-4 bg-white text-black rounded-2xl font-black hover:bg-gray-200 shadow-lg hover:scale-[1.02] transition-all flex items-center gap-3">
                      Şifreyi Güncelle
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div 
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8 relative z-10"
                >
                  <h3 className="text-2xl font-black text-white flex items-center gap-3">
                    <Bell className="w-6 h-6 text-brand-orange" /> Bildirim Tercihleri
                  </h3>
                  <div className="space-y-4">
                    {[
                      { title: 'Sipariş Durumu', desc: 'Siparişiniz yola çıktığında veya teslim edildiğinde bildirim al.', active: true },
                      { title: 'Kampanyalar', desc: 'Yeni indirim ve fırsatlardan haberdar ol.', active: false },
                      { title: 'Sistem Duyuruları', desc: 'Yeni özellikler ve güncellemeler hakkında bilgi al.', active: true },
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-white/[0.02] rounded-3xl border border-white/[0.05] hover:border-white/10 transition-all gap-4">
                        <div>
                          <div className="font-bold text-white text-lg">{item.title}</div>
                          <div className="text-sm text-gray-400 mt-1">{item.desc}</div>
                        </div>
                        <div className={`w-14 h-7 rounded-full relative cursor-pointer transition-colors flex-shrink-0 ${item.active ? 'bg-brand-orange shadow-[0_0_15px_rgba(255,122,0,0.5)]' : 'bg-white/10'}`}>
                          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${item.active ? 'right-1' : 'left-1'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'payment' && (
                <motion.div 
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8 relative z-10"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <h3 className="text-2xl font-black text-white flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-brand-orange" /> Kayıtlı Kartlarım
                      </h3>
                      <button className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">+ Kart Ekle</button>
                  </div>
                  <div className="glass-card p-8 flex flex-col sm:flex-row sm:items-center justify-between group hover:border-brand-orange/30 transition-all gap-6">
                      <div className="flex items-center gap-6">
                          <div className="w-20 h-14 bg-white/10 rounded-xl flex items-center justify-center text-white font-black italic border border-white/20 shadow-inner text-xl">VISA</div>
                          <div>
                              <div className="font-black text-white text-xl tracking-widest drop-shadow-md">•••• •••• •••• 4242</div>
                              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Sertan C. <span className="mx-2 text-white/20">|</span> 12/26</div>
                          </div>
                      </div>
                      <button className="text-red-400 font-black text-xs uppercase tracking-widest hover:text-red-300 transition-colors bg-red-500/10 px-6 py-3 rounded-xl border border-red-500/20 sm:opacity-0 group-hover:opacity-100 self-end sm:self-auto">Sil</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
