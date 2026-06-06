import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Trash2, Home, Briefcase, Star, Search, MoreHorizontal, Zap } from 'lucide-react';

export default function Addresses() {
  const [addresses, setAddresses] = useState([
    { id: '1', title: 'Ev', address: 'Teşvikiye Mah. Av. Süreyya Ağaoğlu Sk. No:12 D:4 Şişli/İstanbul', icon: Home, type: 'HOME' },
    { id: '2', title: 'İş', address: 'Levent Mah. Büyükdere Cad. Kanyon Ofis Blok No:185 Beşiktaş/İstanbul', icon: Briefcase, type: 'WORK' },
    { id: '3', title: 'Spor Salonu', address: 'Etiler Mah. Nispetiye Cad. No:56 Beşiktaş/İstanbul', icon: Star, type: 'OTHER' },
  ]);

  const removeAddress = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            Adreslerim <Zap className="w-8 h-8 text-brand-orange drop-shadow-[0_0_15px_rgba(255,122,0,0.5)]" />
          </h1>
          <p className="text-gray-400 mt-2 text-lg font-medium">Sık kullandığınız konumları kaydederek daha hızlı kurye çağırın.</p>
        </div>
        <button className="px-8 py-4 bg-gradient-to-r from-brand-orange to-[#ff9d42] text-white rounded-2xl font-black hover:shadow-[0_0_30px_rgba(255,122,0,0.4)] transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-95 group">
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Yeni Adres Ekle
        </button>
      </div>

      <div className="relative mb-10 group/search">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/search:text-brand-orange transition-colors" />
        <input 
          type="text" 
          placeholder="Kaydedilen adreslerde ara..." 
          className="w-full glass-card border-white/[0.08] rounded-2xl py-5 pl-14 pr-4 text-white focus:outline-none focus:border-brand-orange/50 focus:bg-white/[0.04] transition-all font-medium text-lg placeholder-gray-600 shadow-inner"
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        <AnimatePresence mode="popLayout">
          {addresses.map((addr) => {
            const Icon = addr.icon;
            return (
              <motion.div
                key={addr.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-card p-8 group hover:border-brand-orange/40 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-orange/5 rounded-bl-full group-hover:bg-brand-orange/10 transition-colors z-0" />

                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button className="p-2 text-gray-500 hover:text-white bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-all">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>

                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-orange/10 group-hover:text-brand-orange group-hover:border-brand-orange/20 transition-all shadow-inner relative z-10">
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-xl font-black text-white mb-2 relative z-10">{addr.title}</h3>
                <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8 line-clamp-3 relative z-10 h-16">
                  {addr.address}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-white/[0.06] relative z-10">
                  <button className="text-[10px] font-black text-brand-orange uppercase tracking-widest hover:underline hover:text-[#ff9d42] transition-colors">Düzenle</button>
                  <button 
                    onClick={() => removeAddress(addr.id)}
                    className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:text-white hover:bg-red-500 transition-all group-hover:opacity-100 opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <button className="glass-card border-dashed p-8 flex flex-col items-center justify-center text-gray-500 hover:text-brand-orange hover:bg-white/[0.04] hover:border-brand-orange/30 transition-all group min-h-[300px]">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-orange/10 transition-transform">
                <Plus className="w-8 h-8" />
            </div>
            <span className="font-bold text-lg">Yeni Konum Ekle</span>
        </button>
      </div>

      <div className="glass-card p-10 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden group">
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-brand-orange/10 rounded-full blur-[80px] group-hover:bg-brand-orange/20 transition-colors" />
        
        <div className="w-32 h-32 bg-brand-orange/10 border border-brand-orange/20 rounded-full flex items-center justify-center text-brand-orange shadow-inner shrink-0 relative z-10 animate-glow-pulse">
            <MapPin className="w-12 h-12" />
        </div>
        <div className="flex-1 text-center md:text-left relative z-10">
            <h3 className="text-2xl font-black text-white mb-3">Akıllı Adres Algılama</h3>
            <p className="text-gray-400 font-medium leading-relaxed max-w-2xl">
                JETIS, sıkça kullandığınız adresleri otomatik olarak analiz eder ve size öneriler sunar. 
                Bu sayede adres yazmanıza gerek kalmadan tek tıkla kurye çağırabilirsiniz.
            </p>
        </div>
        <button className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-white/10 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] relative z-10 whitespace-nowrap">
            Özelliği Aç
        </button>
      </div>
    </div>
  );
}
