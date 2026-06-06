import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Clock, Shield, MapPin, Star, Smartphone, Building, Users, CheckCircle2, ChevronDown, Package, PlayCircle, Zap, Brain, TrendingUp, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import api, { handleApiResponse } from '../lib/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

type DeliveryType = 'STANDARD' | 'EXPRESS' | 'VIP';

interface PriceResult {
  price: number;
  distanceKm: number;
  breakdown: { base: number; distanceFee: number; timeSurcharge: number };
  options: { STANDARD: number; EXPRESS: number; VIP: number };
  ai: { score: number; recommendation: string; note: string };
  fromAddress: string;
  toAddress: string;
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [pickup, setPickup] = useState('');
  const [delivery, setDelivery] = useState('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('STANDARD');
  const [result, setResult] = useState<PriceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [calcError, setCalcError] = useState('');

  const handleCalculate = async () => {
    if (!pickup.trim() || !delivery.trim()) {
      setCalcError('Lütfen her iki adresi de girin.');
      return;
    }
    setLoading(true);
    setCalcError('');
    setResult(null);
    try {
      const response = await api.post('/price/calculate', {
        pickupAddress: pickup,
        deliveryAddress: delivery,
        deliveryType,
      });
      const data = handleApiResponse(response) as any;
      setResult(data as PriceResult);
    } catch (err: any) {
      setCalcError(err.message || 'Fiyat hesaplanamadı. Adresleri kontrol edin.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#0B1220] text-white selection:bg-brand-orange/30">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/hero-bosphorus-white-moto.png" 
              alt="Jetis Bosphorus Delivery" 
              className="w-full h-full object-cover object-center scale-100 animate-slow-zoom"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B1220]/80 via-[#0B1220]/40 to-[#0B1220]" />
            <div className="absolute inset-0 bg-black/30" />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 shadow-xl"
              >
                <span className="flex w-2.5 h-2.5 rounded-full bg-brand-orange animate-pulse" />
                <span className="text-sm font-bold text-white tracking-wide uppercase">İstanbul Boğazı'nda En Hızlı Teslimat</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[1]"
              >
                Kıtalar Arası <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-[#ff9d42] to-brand-orange animate-gradient-x">
                  Hız ve Güven
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-lg"
              >
                JETIS ile İstanbul'un trafiğine takılmadan, iki kıta arasında belgeleriniz ve paketleriniz 30 dakikada kapınızda.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-6"
              >
                <Link 
                  to="/dashboard/create-order"
                  className="w-full sm:w-auto px-10 py-5 bg-brand-orange text-white rounded-full font-black text-xl hover:bg-[#ff8a1a] transition-all shadow-[0_0_50px_rgba(255,122,0,0.5)] hover:shadow-[0_0_70px_rgba(255,122,0,0.7)] hover:scale-105 flex items-center justify-center gap-3 group"
                >
                  Kurye Çağır
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </Link>
                <a 
                  href="#price-calculator" 
                  className="w-full sm:w-auto px-10 py-5 bg-white/10 backdrop-blur-xl text-white border border-white/20 rounded-full font-bold text-xl hover:bg-white/20 transition-all hover:scale-105 flex items-center justify-center gap-3"
                >
                  Hesaplama Yap
                </a>
              </motion.div>

              {/* Floating Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
                {[
                  { icon: <Clock />, text: "30 Dakikada Teslimat" },
                  { icon: <Shield />, text: "Tam Güvenlikli Sigorta" },
                  { icon: <MapPin />, text: "Canlı GPS Takibi" }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + (i * 0.1) }}
                    className="flex items-center justify-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-2xl"
                  >
                    <div className="text-brand-orange">{item.icon}</div>
                    <span className="font-bold text-sm tracking-wide">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
          
          {/* Scroll Indicator */}
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
          >
            <ChevronDown className="w-10 h-10 text-white/30" />
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y border-white/5 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { label: 'Mutlu Müşteri', value: '50B+' },
                { label: 'Aktif Kurye', value: '2.500+' },
                { label: 'Ortalama Süre', value: '28 Dk' },
                { label: 'Kurumsal Ortak', value: '500+' },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-gray-400 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Price Calculator & App Showcase */}
        <section id="price-calculator" className="py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              {/* Calculator Box */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-[#111827] rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Brain className="w-32 h-32 text-brand-orange" />
                </div>
                
                <div className="flex items-center gap-3 mb-8 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-brand-orange/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-brand-orange" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Canlı Fiyat Hesapla</h3>
                    <p className="text-xs text-brand-orange font-medium tracking-widest uppercase">AI Destekli Tahmin</p>
                  </div>
                </div>

                <div className="space-y-5 relative z-10">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Nereden?</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input 
                        type="text" 
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        placeholder="Alış adresini girin (Örn: Beşiktaş)" 
                        className="w-full bg-[#1F2937] border border-gray-700 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Nereye?</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-orange" />
                      <input 
                        type="text" 
                        value={delivery}
                        onChange={(e) => setDelivery(e.target.value)}
                        placeholder="Teslimat adresini girin (Örn: Kadıköy)" 
                        className="w-full bg-[#1F2937] border border-gray-700 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {(['STANDARD', 'EXPRESS', 'VIP'] as DeliveryType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setDeliveryType(type)}
                        className={`py-2 px-1 rounded-lg text-[10px] font-bold border transition-all ${
                          deliveryType === type 
                            ? 'bg-brand-orange/20 border-brand-orange text-brand-orange' 
                            : 'bg-transparent border-gray-700 text-gray-500 hover:border-gray-600'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {calcError && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {calcError}
                      </motion.div>
                    )}

                    {result && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3"
                      >
                        <div className="flex justify-between items-end">
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Tahmini Tutar</div>
                            <div className="text-3xl font-bold text-white flex items-center gap-1">
                              <span className="text-brand-orange">₺</span>{result.price}
                            </div>
                          </div>
                          <div className="text-right text-[10px] text-gray-500">
                            <div className="flex items-center gap-1 justify-end text-brand-orange">
                              <TrendingUp className="w-3 h-3" />
                              <span>{result.distanceKm} km</span>
                            </div>
                            <div className="mt-1">AI Güven Skoru: %{result.ai.score}</div>
                          </div>
                        </div>
                        
                        <div className="pt-2 border-t border-white/5 text-[11px] text-gray-400 italic">
                          <Brain className="w-3 h-3 inline mr-1 text-brand-orange" />
                          {result.ai.note}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="pt-2">
                    <button 
                      onClick={handleCalculate}
                      disabled={loading}
                      className="w-full py-4 bg-brand-orange text-white rounded-xl font-bold hover:bg-[#ff8a1a] transition-all flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(255,122,0,0.2)] disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Analiz Ediliyor...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-5 h-5" />
                          Fiyatı Hesapla
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* App Showcase */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange/10 text-brand-orange font-medium text-sm">
                  <Smartphone className="w-4 h-4" />
                  Mobil Uygulama
                </div>
                <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                  Tüm işlemler <br/> tek bir dokunuşta.
                </h2>
                <p className="text-xl text-gray-400 leading-relaxed">
                  JETIS mobil uygulaması ile kurye çağırmak, sipariş takip etmek ve ödeme yapmak artık çok daha kolay. iOS ve Android için hemen indirin.
                </p>
                <ul className="space-y-4">
                  {[
                    "Tek tıkla kurye çağırma ve favori adresler",
                    "Harita üzerinden saniye saniye canlı takip",
                    "Güvenli ve hızlı cüzdan ödemeleri"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-brand-orange/20 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-brand-orange" />
                      </div>
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-4 pt-4">
                  <button className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center gap-2">
                    App Store
                  </button>
                  <button className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center gap-2">
                    Google Play
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Corporate & Partners */}
        <section id="corporate" className="py-24 bg-white/[0.02] border-y border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Güvenilir İş Ortakları</h2>
              <p className="text-gray-400 text-lg">Türkiye'nin öncü markaları JETIS hızına güveniyor.</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Custom Brands/Names */}
              <div className="text-2xl font-black italic tracking-tighter">Murat<span className="text-brand-orange">Lojistik</span></div>
              <div className="text-2xl font-black tracking-widest uppercase">JETIS<span className="font-light">Kurye</span></div>
              <div className="text-2xl font-black lowercase tracking-tighter">hızlıteslimat</div>
              <div className="text-2xl font-bold uppercase">İstanbul<span className="font-light">Moto</span></div>
              <div className="text-2xl font-bold tracking-tight">VIP<span className="text-brand-orange">Kurye</span></div>
            </div>

            <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <img 
                  src="/delivery-cash-tl.png" 
                  alt="Jetis Premium Delivery Cash" 
                  className="rounded-[40px] shadow-2xl border border-white/10"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <div className="inline-flex items-center gap-2 text-brand-orange font-bold tracking-widest uppercase text-sm">
                  <Shield className="w-5 h-5" /> Neden JETIS?
                </div>
                <h3 className="text-4xl md:text-5xl font-bold">Her Gönderi Bir Güven <span className="text-brand-orange">Sözüdür.</span></h3>
                <p className="text-xl text-gray-400 leading-relaxed">
                  Sadece paket taşımıyoruz; zamanınızı, emeğinizi ve güveninizi taşıyoruz. Her aşamada teknoloji ve insan odağıyla en iyisini sunuyoruz.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { title: "Sıfır Hata", desc: "AI destekli rota optimizasyonu" },
                    { title: "Anında Kanıt", desc: "Dijital imza ve fotoğraflı teslimat" },
                    { title: "7/24 Destek", desc: "Her an yanınızda olan çözüm merkezi" },
                    { title: "Hassas Taşıma", desc: "Kırılabilir ve değerli ürün uzmanlığı" }
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="font-bold text-white mb-1">{item.title}</div>
                      <div className="text-sm text-gray-500">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="mt-24 bg-gradient-to-r from-brand-orange/20 to-transparent border border-brand-orange/20 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 text-brand-orange font-medium mb-4">
                  <Building className="w-5 h-5" /> Kurumsal Çözümler
                </div>
                <h3 className="text-3xl font-bold mb-4">Şirketinize Özel Teslimat Ağı</h3>
                <p className="text-gray-300 max-w-xl text-lg">
                  E-ticaret siteniz, restoranınız veya şirketiniz için API entegrasyonlu, özel fiyatlandırmalı kurumsal kurye çözümleri.
                </p>
              </div>
              <button className="px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors whitespace-nowrap">
                Kurumsal Başvuru
              </button>
            </div>
          </div>
        </section>

        {/* Fleet Section (Replacing old Services) */}
        <section id="fleet" className="py-24 relative border-t border-white/5 bg-[#080d17]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Geniş ve Güçlü Filomuz</h2>
              <p className="text-gray-400 text-lg">İstanbul sokaklarına hakim, her ihtiyaca uygun premium kurye motorları.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  model: "Honda ADV 350",
                  type: "Premium VIP Kurye",
                  desc: "Köprü geçişlerinde ve uzun mesafelerde sarsılmaz stabilite. Zorlu hava koşullarında bile VIP gönderileriniz için en güvenli tercih.",
                  placeholder: "bg-gradient-to-br from-gray-800 to-gray-900"
                },
                {
                  model: "Yamaha XMAX",
                  type: "Hızlı Ekspres",
                  desc: "Geniş bagaj hacmi ve yüksek manevra kabiliyeti ile İstanbul'un yoğun trafiğinde orta ve büyük boy paketler için ideal.",
                  placeholder: "bg-gradient-to-br from-gray-800 to-gray-900"
                },
                {
                  model: "Honda PCX / NMAX",
                  type: "Şehir İçi Çevik",
                  desc: "Dar sokaklarda ve yoğun semt trafiğinde rakipsiz hız. Evrak ve küçük paketlerin anında teslimatı için tasarlandı.",
                  placeholder: "bg-gradient-to-br from-gray-800 to-gray-900"
                }
              ].map((fleet, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden hover:bg-white/[0.04] transition-all group"
                >
                  {/* Abstract Premium Design instead of Image */}
                  <div className={`h-48 w-full ${fleet.placeholder} relative overflow-hidden group-hover:scale-105 transition-transform duration-700`}>
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_120%,rgba(255,122,0,0.8),transparent_70%)] mix-blend-screen" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNykiLz48L3N2Zz4=')] opacity-50" />
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-xl flex items-center justify-center relative">
                        <div className="absolute inset-0 rounded-full border-t border-brand-orange/50 animate-spin-slow" />
                        <Zap className="w-10 h-10 text-brand-orange/70 drop-shadow-[0_0_15px_rgba(255,122,0,0.5)]" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <div className="text-brand-orange text-sm font-bold uppercase tracking-wider mb-2">{fleet.type}</div>
                    <h3 className="text-2xl font-bold mb-3">{fleet.model}</h3>
                    <p className="text-gray-400 leading-relaxed">
                      {fleet.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Photo Album Section */}
        <section className="py-24 relative bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Sahadan Teslimat Anları</h2>
              <p className="text-gray-400 text-lg">Profesyonel kuryelerimizin görev başındaki anları.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { src: "/courier-delivery-office.png", name: "Kurye Murat", desc: "Levent Bölgesi VIP Teslimat" },
                { src: "/courier-city-street.png", name: "Kurye Ahmet", desc: "Boğaziçi Ekspres Dağıtım" },
                { src: "/courier-residential.png", name: "Kurye Can", desc: "Galata Hızlı Teslimat" }
              ].map((img, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 group relative aspect-[4/5]"
                >
                  <img 
                    src={img.src} 
                    alt={img.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220]/90 via-[#0B1220]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                    <h3 className="text-xl font-bold text-white mb-1">{img.name}</h3>
                    <p className="text-brand-orange text-sm font-medium">{img.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 text-brand-orange font-medium mb-4">
                <Users className="w-5 h-5" /> Kullanıcı Yorumları
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">Müşterilerimiz Ne Diyor?</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: "Kemal T.", role: "Kurumsal Müşteri", text: "Murat Bey ve Jetis ekibiyle çalışmaya başladığımızdan beri teslimat sürelerimiz yarı yarıya düştü. Kesinlikle tavsiye ederim.", img: "https://randomuser.me/api/portraits/men/32.jpg" },
                { name: "Ayşe Kaya", role: "Avukat", text: "Önemli evraklarımı güvenle teslim edebildiğim tek adres Jetis Moto Kurye. Hızlı ve çok güvenilirler.", img: "https://randomuser.me/api/portraits/women/44.jpg" },
                { name: "Mehmet Demir", role: "Restoran Sahibi", text: "Kendi kuryemi çalıştırmak yerine Murat Bey'in ekibiyle çalışmak hem maliyeti düşürdü hem de operasyonu hızlandırdı.", img: "https://randomuser.me/api/portraits/men/86.jpg" }
              ].map((t, i) => (
                <div key={i} className="bg-[#111827] p-8 rounded-3xl border border-white/5 relative">
                  <div className="flex gap-1 mb-6">
                    {[1,2,3,4,5].map(star => <Star key={star} className="w-5 h-5 text-brand-orange fill-brand-orange" />)}
                  </div>
                  <p className="text-gray-300 text-lg mb-6 leading-relaxed">"{t.text}"</p>
                  <div className="flex items-center gap-4">
                    <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-brand-orange/50" />
                    <div>
                      <h4 className="font-bold text-white">{t.name}</h4>
                      <p className="text-sm text-gray-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="how-it-works" className="py-24 bg-white/[0.01] border-t border-white/5">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Sıkça Sorulan Sorular</h2>
              <p className="text-gray-400">Aklınıza takılan tüm soruların cevapları burada.</p>
            </div>
            <div className="space-y-4">
              {[
                { q: "Kurye çağırmak ne kadar sürer?", a: "Siparişinizi onayladıktan sonra sistemimiz size en yakın kuryeyi anında yönlendirir. Ortalama 5-10 dakika içinde kuryemiz adresinize ulaşır." },
                { q: "Gönderim sigortalı mı?", a: "Evet, JETIS ile gönderdiğiniz tüm paketler teslimat süresince özel sigortamız kapsamındadır." },
                { q: "Ödemeyi nasıl yapabilirim?", a: "Kredi kartı, banka kartı veya uygulama içi cüzdanınız ile güvenle ödeme yapabilirsiniz." },
                { q: "Şehir dışı teslimatınız var mı?", a: "Şu an için sadece İstanbul genelinde aktif olarak hizmet veriyoruz. Çok yakında diğer büyükşehirlerdeyiz." }
              ].map((faq, idx) => (
                <div key={idx} className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden transition-all">
                  <button 
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between font-medium text-left focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-5 text-gray-400">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      {/* Mobile App Section */}
      <section id="mobile-app" className="py-24 bg-[#0B1220] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-brand-orange/5 rounded-full blur-[120px]" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-block px-4 py-2 bg-brand-orange/10 text-brand-orange rounded-full text-sm font-bold tracking-widest mb-6"
              >
                MOBİL UYGULAMA
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight"
              >
                JETIS Deneyimi <br />
                <span className="text-brand-orange">Cebinizde.</span>
              </motion.h2>
              <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto lg:mx-0">
                Hem kuryeler hem de kullanıcılar için tasarlanmış tek uygulama. Canlı takip, kolay sipariş ve hızlı ödeme artık tek tıkla yanınızda.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
                <a 
                  href="/downloads/jetis-latest.apk" 
                  className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-200 transition-all group"
                >
                  <Smartphone className="w-6 h-6" />
                  Android APK İndir
                </a>
                <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold flex items-center justify-center gap-3 opacity-50 cursor-not-allowed">
                  <PlayCircle className="w-6 h-6" />
                  App Store (Yakında)
                </button>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-8 p-6 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm max-w-md mx-auto lg:mx-0">
                <div className="bg-white p-2 rounded-xl">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://jetis.app/download" alt="QR Code" className="w-20 h-20" />
                </div>
                <div>
                  <div className="text-white font-bold mb-1">Hemen Tara</div>
                  <p className="text-sm text-gray-500">QR kodu okutarak APK'yı telefonuna anında indir.</p>
                </div>
              </div>
            </div>

            <div className="flex-1 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative z-10"
              >
                <div className="w-[300px] h-[600px] mx-auto bg-black rounded-[3rem] border-[8px] border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-gray-800 rounded-b-2xl z-20" />
                  <div className="absolute inset-0 bg-[#1A1F2C] overflow-hidden">
                    {/* Simulated Map Background */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeWidth="0.5" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                        {/* Simulated Roads */}
                        <path d="M-20,100 Q100,50 150,200 T350,150" fill="none" stroke="#ffffff" strokeWidth="4" className="opacity-50" />
                        <path d="M50,-20 Q80,150 250,250 T320,400" fill="none" stroke="#ffffff" strokeWidth="3" className="opacity-30" />
                        
                        {/* Delivery Route */}
                        <path d="M150,200 Q200,225 250,250" fill="none" stroke="#FF7A00" strokeWidth="4" strokeDasharray="6,6" className="animate-[dash_2s_linear_infinite]" />
                        
                        {/* Location Pins */}
                        <circle cx="150" cy="200" r="6" fill="#10B981" className="animate-pulse" /> {/* Pickup */}
                        <circle cx="250" cy="250" r="6" fill="#FF7A00" /> {/* Dropoff */}
                      </svg>
                      <style dangerouslySetInnerHTML={{__html: `
                        @keyframes dash {
                          to { stroke-dashoffset: -12; }
                        }
                      `}} />
                    </div>

                    {/* Top App Bar */}
                    <div className="absolute top-0 inset-x-0 pt-10 pb-4 px-5 bg-gradient-to-b from-[#111827] to-transparent z-10 flex items-center justify-between">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                        <ArrowRight className="w-4 h-4 text-white rotate-180" />
                      </div>
                      <div className="font-bold text-white text-sm">Sipariş Takibi</div>
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                        <AlertCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    {/* Active Courier Marker (Simulated) */}
                    <motion.div 
                      animate={{ x: [0, 40, 80], y: [0, 10, 20] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="absolute top-[180px] left-[140px] z-20"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 bg-brand-orange rounded-full flex items-center justify-center shadow-lg border-2 border-white relative z-10">
                          <Package className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute inset-0 bg-brand-orange rounded-full animate-ping opacity-50" />
                      </div>
                    </motion.div>

                    {/* Bottom Sheet UI */}
                    <div className="absolute bottom-0 inset-x-0 bg-[#111827] rounded-t-3xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-30 p-5 transform transition-transform">
                      <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto mb-5" />
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gray-800 border-2 border-brand-orange overflow-hidden">
                            <img src="https://ui-avatars.com/api/?name=Murat+T&background=1F2937&color=FF7A00" alt="Courier" />
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">Murat T.</div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400">
                              <Star className="w-3 h-3 text-brand-orange fill-brand-orange" />
                              <span className="text-white">4.9</span> (1.2k Teslimat)
                            </div>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-brand-orange/20 flex items-center justify-center">
                          <Smartphone className="w-4 h-4 text-brand-orange" />
                        </div>
                      </div>

                      <div className="bg-[#1F2937] rounded-xl p-3 mb-4 border border-white/5">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-gray-400">Sipariş Durumu</span>
                          <span className="text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded text-uppercase">Yolda</span>
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="font-black text-xl text-white">12 Dk.</div>
                          <div className="text-xs text-gray-400">Tahmini Teslimat: <span className="text-white font-medium">19:45</span></div>
                        </div>
                      </div>

                      <button className="w-full py-3.5 bg-brand-orange text-white rounded-xl font-bold text-sm shadow-[0_5px_15px_rgba(255,122,0,0.3)] flex items-center justify-center gap-2">
                        Canlı Destek
                      </button>
                    </div>
                  </div>
                </div>
                {/* Decorative blobs */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-orange/20 rounded-full blur-[60px]" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-[60px]" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

