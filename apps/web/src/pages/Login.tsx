import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../store/useAuth';
import api, { handleApiResponse } from '../lib/api';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  const navigate = useNavigate();
  const setAuth  = useAuth(state => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const data = handleApiResponse<any>(response);
      setSuccess(true);
      setTimeout(() => {
        setAuth(data.user, data.token);
        navigate('/dashboard');
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Giriş yapılamadı. Lütfen bilgilerini kontrol et.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080D17] flex overflow-hidden relative">

      {/* ── Animated Background ───────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,122,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,122,0,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        {/* Glow blobs */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-brand-orange/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-purple-500/8  rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px]" />
      </div>

      {/* ── Left Panel (decorative – hidden on mobile) ─── */}
      <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center p-16 overflow-hidden">
        {/* Inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/5 via-transparent to-purple-500/5" />
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/[0.07] to-transparent" />

        <div className="relative z-10 max-w-lg">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-16 group w-fit">
            <div className="w-12 h-12 rounded-2xl bg-brand-orange flex items-center justify-center shadow-[0_0_30px_rgba(255,122,0,0.5)] group-hover:shadow-[0_0_50px_rgba(255,122,0,0.7)] transition-shadow">
              <Zap className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-3xl font-black tracking-widest text-white">JETIS</span>
          </Link>

          {/* Headline */}
          <h1 className="text-5xl font-black text-white leading-tight mb-6">
            Teslimatı{' '}
            <span className="bg-gradient-to-r from-brand-orange to-[#ffb347] bg-clip-text text-transparent">
              hızlandır
            </span>
            ,<br />hayatı kolaylaştır.
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed mb-12 font-medium">
            JETIS platformuna hoş geldin. Siparişlerini yönet, kuryelerini takip et ve işini büyüt.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3">
            {['Canlı Kurye Takibi', 'Anlık Bildirimler', 'Dinamik Fiyatlandırma', 'Güvenli Ödeme'].map(f => (
              <span key={f} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.07] text-gray-400 text-sm font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-orange" />
                {f}
              </span>
            ))}
          </div>

          {/* Stats row */}
          <div className="mt-14 grid grid-cols-3 gap-6">
            {[
              { val: '50K+',  label: 'Teslimat' },
              { val: '4.9★', label: 'Ortalama Puan' },
              { val: '< 2dk', label: 'Kurye Atama' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-black text-white mb-1">{s.val}</div>
                <div className="text-xs text-gray-600 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel: Form ─────────────────────── */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 md:p-12 relative z-10">

        {/* Mobile logo */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand-orange flex items-center justify-center shadow-[0_0_20px_rgba(255,122,0,0.4)]">
              <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-black tracking-widest text-white">JETIS</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-[400px]"
        >
          {/* Heading */}
          <div className="mb-10">
            <h2 className="text-3xl font-black text-white mb-2">Giriş Yap</h2>
            <p className="text-gray-500 font-medium">Hesabına erişmek için bilgilerini gir.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-sm text-red-400"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-400">E-posta Adresi</label>
              <div className={`relative flex items-center rounded-2xl border transition-all duration-300 ${
                focusedField === 'email'
                  ? 'border-brand-orange/60 bg-brand-orange/5 shadow-[0_0_0_4px_rgba(255,122,0,0.08)]'
                  : 'border-white/[0.08] bg-white/[0.03] hover:border-white/15'
              }`}>
                <Mail className={`absolute left-4 w-5 h-5 transition-colors ${focusedField === 'email' ? 'text-brand-orange' : 'text-gray-600'}`} />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="ornek@sirket.com"
                  className="w-full bg-transparent pl-12 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-400">Şifre</label>
                <a href="#" className="text-xs font-semibold text-brand-orange hover:text-[#ff9d42] transition-colors">
                  Şifremi Unuttum
                </a>
              </div>
              <div className={`relative flex items-center rounded-2xl border transition-all duration-300 ${
                focusedField === 'password'
                  ? 'border-brand-orange/60 bg-brand-orange/5 shadow-[0_0_0_4px_rgba(255,122,0,0.08)]'
                  : 'border-white/[0.08] bg-white/[0.03] hover:border-white/15'
              }`}>
                <Lock className={`absolute left-4 w-5 h-5 transition-colors ${focusedField === 'password' ? 'text-brand-orange' : 'text-gray-600'}`} />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  className="w-full bg-transparent pl-12 pr-12 py-3.5 text-white placeholder-gray-600 focus:outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-4 text-gray-600 hover:text-gray-300 transition-colors"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading || success}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm transition-all duration-300 relative overflow-hidden ${
                success
                  ? 'bg-green-500 text-white shadow-[0_0_30px_rgba(34,197,94,0.4)]'
                  : 'bg-brand-orange text-white shadow-[0_0_30px_rgba(255,122,0,0.4)] hover:shadow-[0_0_45px_rgba(255,122,0,0.6)] hover:bg-[#ff8a1a] disabled:opacity-60 disabled:cursor-not-allowed'
              }`}
            >
              {/* Shimmer overlay */}
              {!loading && !success && (
                <span className="absolute inset-0 animate-shimmer opacity-0 hover:opacity-100" />
              )}

              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Giriş yapılıyor...
                  </motion.div>
                ) : success ? (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Başarılı! Yönlendiriliyor...
                  </motion.div>
                ) : (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2">
                    Giriş Yap
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-xs text-gray-600 font-semibold">Hesabın yok mu?</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Register link */}
          <Link
            to="/register"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-gray-300 hover:text-white hover:bg-white/[0.06] hover:border-white/15 transition-all text-sm font-semibold group"
          >
            Ücretsiz Hesap Oluştur
            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-brand-orange group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Terms */}
          <p className="text-center text-xs text-gray-700 mt-8 font-medium">
            Giriş yaparak{' '}
            <a href="#" className="text-gray-500 hover:text-white transition-colors">Kullanım Koşulları</a>
            {' '}ve{' '}
            <a href="#" className="text-gray-500 hover:text-white transition-colors">Gizlilik Politikası</a>'nı
            {' '}kabul etmiş olursun.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
