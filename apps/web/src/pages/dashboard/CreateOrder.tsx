import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Package, Clock, Shield, ArrowRight, ArrowLeft, CheckCircle2, Info, Zap } from 'lucide-react';
import { useAuth } from '../../store/useAuth';
import api, { handleApiResponse } from '../../lib/api';

type DeliveryType = 'STANDARD' | 'EXPRESS' | 'VIP';

type QuoteResponse = {
  quoteId: string;
  expiresAt: string;
  price: number;
  quote: {
    totalPrice: number;
  };
};

export default function CreateOrder() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    pickupAddress: '',
    deliveryAddress: '',
    packageDetails: '',
    packageCategory: 'DOCUMENT',
    deliveryType: 'STANDARD' as DeliveryType | 'SCHEDULED',
    vehicleType: 'MOTO',
    scheduledFor: '',
    price: 0,
    quoteId: '',
    quoteExpiresAt: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [loadingPrice, setLoadingPrice] = useState(false);
  const navigate = useNavigate();
  const token = useAuth((state) => state.token);
  const refreshTimerRef = useRef<number | null>(null);

  const deliveryTypes = [
    { id: 'STANDARD' as const, name: 'Standart', icon: Package, time: '60-90 dk' },
    { id: 'EXPRESS' as const, name: 'Express', icon: Clock, time: '30-45 dk' },
    { id: 'VIP' as const, name: 'VIP', icon: Shield, time: 'Anında' },
    { id: 'SCHEDULED' as const, name: 'Zamanlanmış', icon: Clock, time: 'Belirlenen Saatte' },
  ];

  const packageCategories = [
    { id: 'DOCUMENT', name: 'Evrak/Dosya' },
    { id: 'FOOD', name: 'Yemek/Tatlı' },
    { id: 'FLOWER', name: 'Çiçek/Hediye' },
    { id: 'MEDICAL', name: 'İlaç/Medikal' },
    { id: 'ELECTRONICS', name: 'Elektronik' },
    { id: 'TEXTILE', name: 'Tekstil' },
  ];

  const vehicleTypes = [
    { id: 'MOTO', name: 'Motor Kurye' },
    { id: 'CAR', name: 'Sedan Araç' },
    { id: 'TAXI', name: 'Taksi Kurye' },
    { id: 'PANELVAN', name: 'Panelvan (Ağır Yük)' },
  ];

  const canQuote = useMemo(
    () => formData.pickupAddress.trim().length > 0 && formData.deliveryAddress.trim().length > 0,
    [formData.pickupAddress, formData.deliveryAddress]
  );

  const calculatePrice = async (): Promise<QuoteResponse | null> => {
    if (!canQuote) {
      setPriceError('Her iki adresi de giriniz.');
      return null;
    }
    setLoadingPrice(true);
    setPriceError('');
    try {
      const response = await api.post('/pricing/calculate', {
        pickupAddress: formData.pickupAddress,
        deliveryAddress: formData.deliveryAddress,
        deliveryType: formData.deliveryType,
        vehicleType: formData.vehicleType,
      });
      const payload = handleApiResponse<QuoteResponse>(response);
      setFormData((prev) => ({
        ...prev,
        price: payload.price,
        quoteId: payload.quoteId,
        quoteExpiresAt: payload.expiresAt,
      }));
      return payload;
    } catch (err: any) {
      setPriceError(err.message || 'Fiyat hesaplanamadı.');
      return null;
    } finally {
      setLoadingPrice(false);
    }
  };

  useEffect(() => {
    if (!formData.quoteExpiresAt) return;
    if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);

    const expiresAt = new Date(formData.quoteExpiresAt).getTime();
    const refreshAtMs = Math.max(expiresAt - Date.now() - 60000, 0);
    refreshTimerRef.current = window.setTimeout(() => {
      void calculatePrice();
    }, refreshAtMs);

    return () => {
      if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
    };
  }, [formData.quoteExpiresAt, formData.pickupAddress, formData.deliveryAddress, formData.deliveryType]);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    if (!formData.quoteId) {
      setError('Önce geçerli bir fiyat teklifi alın.');
      return;
    }
    const now = Date.now();
    if (!formData.quoteExpiresAt || new Date(formData.quoteExpiresAt).getTime() <= now) {
      const refreshed = await calculatePrice();
      if (!refreshed) {
        setError('Teklif yenilenemedi, lütfen tekrar deneyin.');
        return;
      }
    }

    setLoading(true);
    setError('');
    try {
      await api.post(
        '/orders',
        {
          pickupAddress: formData.pickupAddress,
          deliveryAddress: formData.deliveryAddress,
          packageDetails: formData.packageDetails,
          packageCategory: formData.packageCategory,
          scheduledFor: formData.deliveryType === 'SCHEDULED' ? formData.scheduledFor : undefined,
          deliveryType: formData.deliveryType,
          vehicleType: formData.vehicleType,
          quoteId: formData.quoteId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Idempotency-Key': crypto.randomUUID(),
          },
        }
      );
      setStep(4);
    } catch (err: any) {
      setError(err.message || 'Sipariş oluşturulamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-up relative">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="mb-12 relative z-10">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
          Yeni Kurye Çağır <Zap className="w-8 h-8 text-brand-orange drop-shadow-[0_0_15px_rgba(255,122,0,0.5)]" />
        </h1>
        <p className="text-gray-400 font-medium text-lg">Gönderi detaylarını belirleyin ve kuryenizi anında çağırın.</p>
      </div>

      {/* Progress Bar */}
      {step < 4 && (
        <div className="mb-12 relative z-10">
          <div className="h-1 bg-white/[0.05] rounded-full w-full absolute top-1/2 -translate-y-1/2" />
          <motion.div 
            className="h-1 bg-gradient-to-r from-brand-orange to-[#ff9d42] rounded-full absolute top-1/2 -translate-y-1/2 z-10 shadow-[0_0_15px_rgba(255,122,0,0.5)]"
            animate={{ width: `${(step - 1) * 50}%` }}
          />
          <div className="relative z-20 flex justify-between">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-[3px] transition-all duration-300 ${
                  step >= s 
                    ? 'bg-brand-orange border-brand-orange text-white shadow-[0_0_20px_rgba(255,122,0,0.4)]' 
                    : 'bg-[#0B1220] border-white/10 text-gray-500'
                }`}
              >
                {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 px-2">
            <span className={`text-xs font-black uppercase tracking-widest ${step >= 1 ? 'text-white' : 'text-gray-600'}`}>Adresler</span>
            <span className={`text-xs font-black uppercase tracking-widest ${step >= 2 ? 'text-white' : 'text-gray-600'}`}>Detaylar</span>
            <span className={`text-xs font-black uppercase tracking-widest ${step >= 3 ? 'text-white' : 'text-gray-600'}`}>Onay</span>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 relative z-10"
          >
            <div className="glass-card p-8 space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-bl-full group-hover:bg-brand-orange/10 transition-colors" />
              
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Nereden Alınacak? (Alış Adresi)</label>
                <div className="relative group/input">
                  <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-500 group-focus-within/input:text-brand-orange transition-colors" />
                  <textarea 
                    rows={3}
                    placeholder="Mahalle, sokak, bina ve kapı no..."
                    className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-orange focus:bg-brand-orange/5 transition-all custom-scrollbar"
                    value={formData.pickupAddress}
                    onChange={e => setFormData({...formData, pickupAddress: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute left-6 -top-8 bottom-0 w-0.5 bg-white/5 border-dashed border-l z-[-1]" />
                <label className="block text-xs font-black uppercase tracking-widest text-brand-orange mb-3">Nereye Teslim Edilecek? (Varış Adresi)</label>
                <div className="relative group/input">
                  <MapPin className="absolute left-4 top-4 w-5 h-5 text-brand-orange drop-shadow-[0_0_10px_rgba(255,122,0,0.5)]" />
                  <textarea 
                    rows={3}
                    placeholder="Mahalle, sokak, bina ve kapı no..."
                    className="w-full bg-white/[0.02] border border-white/10 hover:border-brand-orange/30 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-orange focus:bg-brand-orange/5 transition-all custom-scrollbar"
                    value={formData.deliveryAddress}
                    onChange={e => setFormData({...formData, deliveryAddress: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end items-center gap-4">
                <div className="flex-1 w-full text-left sm:text-right">
                  {priceError && <p className="text-red-400 text-sm font-medium">{priceError}</p>}
                  {formData.price > 0 && (
                    <p className="text-white text-lg font-bold">
                      Tahmini Tutar: <span className="text-brand-orange text-2xl font-black drop-shadow-[0_0_10px_rgba(255,122,0,0.5)]">₺{formData.price}</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={calculatePrice}
                  disabled={loadingPrice || !formData.pickupAddress || !formData.deliveryAddress}
                  className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loadingPrice ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Fiyat Hesapla'}
                </button>
                <button
                  onClick={nextStep}
                  disabled={!formData.pickupAddress || !formData.deliveryAddress || !formData.quoteId}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-brand-orange to-[#ff9d42] text-white rounded-2xl font-black hover:shadow-[0_0_30px_rgba(255,122,0,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  İlerle
                  <ArrowRight className="w-5 h-5" />
                </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 relative z-10"
          >
            <div className="glass-card p-8 space-y-8">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-5">Gönderi Tipi</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {deliveryTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = formData.deliveryType === type.id;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setFormData({ ...formData, deliveryType: type.id })}
                        className={`p-6 rounded-2xl border-2 text-left transition-all group relative overflow-hidden ${
                          isSelected 
                            ? 'border-brand-orange bg-brand-orange/10 shadow-[0_0_30px_rgba(255,122,0,0.2)]' 
                            : 'border-white/5 bg-white/[0.02] hover:border-white/20'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-0 right-0 w-20 h-20 bg-brand-orange/20 rounded-bl-full blur-xl" />
                        )}
                        <Icon className={`w-8 h-8 mb-5 transition-colors ${isSelected ? 'text-brand-orange drop-shadow-[0_0_10px_rgba(255,122,0,0.5)]' : 'text-gray-500 group-hover:text-gray-300'}`} />
                        <div className={`font-black text-xl mb-1 ${isSelected ? 'text-white' : 'text-gray-300'}`}>{type.name}</div>
                        <div className="text-sm font-medium text-gray-500">{type.time}</div>
                        <div className={`text-xs font-bold mt-4 uppercase tracking-widest ${isSelected ? 'text-brand-orange' : 'text-gray-600'}`}>Dinamik Fiyat</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-5">Araç Tipi</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {vehicleTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setFormData({ ...formData, vehicleType: type.id })}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        formData.vehicleType === type.id
                          ? 'border-brand-orange bg-brand-orange/10 text-white shadow-[0_0_15px_rgba(255,122,0,0.2)]'
                          : 'border-white/5 bg-white/[0.02] text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <div className="font-bold text-sm">{type.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {formData.deliveryType === 'SCHEDULED' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Teslimat Zamanı</label>
                  <input
                    type="datetime-local"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-brand-orange"
                    value={formData.scheduledFor}
                    onChange={e => setFormData({ ...formData, scheduledFor: e.target.value })}
                  />
                </motion.div>
              )}

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Gönderi Kategorisi</label>
                <div className="flex flex-wrap gap-3 mb-4">
                  {packageCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setFormData({ ...formData, packageCategory: cat.id })}
                      className={`px-4 py-2 rounded-full border text-sm font-semibold transition-all ${
                        formData.packageCategory === cat.id
                          ? 'bg-brand-orange border-brand-orange text-white'
                          : 'bg-transparent border-white/10 text-gray-400 hover:border-white/30'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Paket İçeriği Notu</label>
                <input 
                  type="text" 
                  placeholder="Örn: Hassas evrak, Yemek paketi, vb."
                  className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-brand-orange focus:bg-brand-orange/5 transition-all"
                  value={formData.packageDetails}
                  onChange={e => setFormData({...formData, packageDetails: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-between">
              <button 
                onClick={prevStep}
                className="px-8 py-4 bg-white/[0.05] border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Geri
              </button>
              <button 
                onClick={nextStep}
                className="px-8 py-4 bg-gradient-to-r from-brand-orange to-[#ff9d42] text-white rounded-2xl font-black hover:shadow-[0_0_30px_rgba(255,122,0,0.4)] transition-all flex items-center gap-2"
              >
                Son Adıma Geç
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 relative z-10"
          >
            <div className="glass-card p-8 relative overflow-hidden group">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-orange/10 rounded-full blur-[80px]" />
              
              <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                Sipariş Özeti <Package className="w-6 h-6 text-brand-orange" />
              </h3>
              
              <div className="space-y-2 relative z-10">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center py-5 border-b border-white/5 gap-2">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Alış Adresi</span>
                  <span className="text-white text-sm font-medium text-left sm:text-right max-w-sm">{formData.pickupAddress}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center py-5 border-b border-white/5 gap-2">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Teslimat Adresi</span>
                  <span className="text-white text-sm font-medium text-left sm:text-right max-w-sm">{formData.deliveryAddress}</span>
                </div>
                <div className="flex justify-between items-center py-5 border-b border-white/5">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Teslimat Tipi</span>
                  <span className="text-brand-orange font-black px-3 py-1 bg-brand-orange/10 rounded-full text-xs border border-brand-orange/20">
                    {formData.deliveryType}
                  </span>
                </div>
                <div className="flex justify-between items-end pt-8">
                  <span className="text-xl font-black text-white">Toplam Tutar</span>
                  <div className="text-right">
                    <span className="text-4xl font-black text-brand-orange drop-shadow-[0_0_15px_rgba(255,122,0,0.4)]">₺{formData.price || '-'}</span>
                    {formData.quoteExpiresAt && (
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-2 font-bold">
                        Teklif geçerlilik: {new Date(formData.quoteExpiresAt).toLocaleTimeString('tr-TR')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-10 p-5 bg-white/[0.03] rounded-2xl border border-white/10 flex items-start gap-4 relative z-10 hover:border-brand-orange/30 transition-colors">
                <Info className="w-6 h-6 text-brand-orange shrink-0 mt-0.5" />
                <p className="text-sm text-gray-400 font-medium leading-relaxed">
                  Siparişi onayladığınızda en yakın kuryemiz size yönlendirilecektir. Ödeme kurye teslimatında veya online olarak yapılabilir.
                </p>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-bold flex justify-center items-center gap-2"
                >
                  <Info className="w-4 h-4" /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between">
              <button 
                onClick={prevStep}
                disabled={loading}
                className="px-8 py-4 bg-white/[0.05] border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <ArrowLeft className="w-5 h-5" />
                Geri
              </button>
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 sm:px-12 py-4 bg-gradient-to-r from-brand-orange to-[#ff9d42] text-white rounded-2xl font-black hover:shadow-[0_0_30px_rgba(255,122,0,0.4)] transition-all flex items-center gap-3 disabled:opacity-50"
              >
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> İşleniyor...</>
                ) : (
                  <>Siparişi Onayla ve Çağır <Zap className="w-5 h-5" /></>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 glass-card relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-green-500/5 to-transparent" />
            
            <div className="relative z-10">
              <div className="w-28 h-28 bg-green-500/10 border border-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
                <CheckCircle2 className="w-14 h-14 relative z-10" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Sipariş Başarıyla Alındı!</h2>
              <p className="text-lg text-gray-400 mb-12 max-w-lg mx-auto leading-relaxed font-medium">
                Kuryeniz atanmak üzere sisteme iletildi. Canlı takip ekranından kuryenizin anlık konumunu izleyebilirsiniz.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all"
                >
                  Dashboard'a Dön
                </button>
                <button 
                  onClick={() => navigate('/dashboard/history')}
                  className="px-8 py-4 bg-gradient-to-r from-brand-orange to-[#ff9d42] text-white rounded-2xl font-black hover:shadow-[0_0_30px_rgba(255,122,0,0.4)] transition-all flex items-center justify-center gap-2"
                >
                  <MapPin className="w-5 h-5" /> Siparişimi Takip Et
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
