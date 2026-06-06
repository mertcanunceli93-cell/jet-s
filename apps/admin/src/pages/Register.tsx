import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Zap, AlertCircle, CheckCircle2, User as UserIcon, Phone } from 'lucide-react';
import { useAuth } from '../store/useAuth';
import api, { handleApiResponse } from '../lib/api';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: ''
  });
  
  const [showPass, setShowPass] = useState(false);
  const [showPassConfirm, setShowPassConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const navigate = useNavigate();
  const setAuth = useAuth(state => state.setAuth);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.passwordConfirm) {
      return setError('Şifreler eşleşmiyor.');
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      });
      const data = handleApiResponse<any>(response);
      setSuccess(true);
      setTimeout(() => {
        setAuth(data.user, data.token);
        navigate('/dashboard');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Kayıt işlemi başarısız. Lütfen bilgilerinizi kontrol edin.');
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
        <div className="absolute top-40 right-40 w-[600px] h-[600px] bg-brand-orange/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-purple-500/8 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '7s' }} />
      </div>

      {/* ── Left Panel (decorative – hidden on mobile) ─── */}
      <div className="hidden lg:flex lg:w-[45%] relative items-center justify-center p-16 overflow-hidden bg-gradient-to-br from-[#0a101d] to-[#080D17]">
        {/* Inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/5 via-transparent to-purple-500/5" />
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/[0.07] to-transparent" />

        <div className="relative z-10 max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-16 group w-fit">
            <div className="w-12 h-12 rounded-2xl bg-brand-orange flex items-center justify-center shadow-[0_0_30px_rgba(255,122,0,0.5)] group-hover:shadow-[0_0_50px_rgba(255,122,0,0.7)] transition-shadow">
              <Zap className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-3xl font-black tracking-widest text-white">JETIS</span>
          </Link>

          {/* Headline */}
          <h1 className="text-5xl font-black text-white leading-tight mb-6">
            Aramıza katıl,<br />
            <span className="bg-gradient-to-r from-brand-orange to-[#ffb347] bg-clip-text text-transparent">
              fark yarat.
            </span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed mb-12 font-medium">
            JETIS ağına katılarak hem hızlı kurye çağırabilir hem de kendi filonu yönetebilirsin. Üstelik tamamen ücretsiz başlayabilirsin.
          </p>

          {/* Feature list */}
          <div className="space-y-6">
            {[
              { title: 'Hızlı Kurulum', desc: 'Sadece 2 dakikada hesabını oluştur.' },
              { title: 'Esnek Kullanım', desc: 'İster bireysel, ister kurumsal.' },
              { title: '7/24 Destek', desc: 'İhtiyacın olduğunda her zaman yanındayız.' }
            ].map((feature, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 + 0.3 }}
                key={feature.title} 
                className="flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-brand-orange" />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">{feature.title}</h3>
                  <p className="text-gray-500 text-sm font-medium">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel: Form ─────────────────────── */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 md:p-12 relative z-10 overflow-y-auto">

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
          className="w-full max-w-[480px] my-auto pt-20 lg:pt-0 pb-10"
        >
          {/* Heading */}
          <div className="mb-10">
            <h2 className="text-3xl font-black text-white mb-2">Hesap Oluştur</h2>
            <p className="text-gray-500 font-medium">Dakikalar içinde JETIS platformuna katıl.</p>
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
                  className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-sm text-red-400 overflow-hidden"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* First Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-400">Adınız</label>
                <div className={`relative flex items-center rounded-2xl border transition-all duration-300 ${
                  focusedField === 'firstName'
                    ? 'border-brand-orange/60 bg-brand-orange/5 shadow-[0_0_0_4px_rgba(255,122,0,0.08)]'
                    : 'border-white/[0.08] bg-white/[0.03] hover:border-white/15'
                }`}>
                  <UserIcon className={`absolute left-4 w-5 h-5 transition-colors ${focusedField === 'firstName' ? 'text-brand-orange' : 'text-gray-600'}`} />
                  <input
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('firstName')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Ad"
                    className="w-full bg-transparent pl-12 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-400">Soyadınız</label>
                <div className={`relative flex items-center rounded-2xl border transition-all duration-300 ${
                  focusedField === 'lastName'
                    ? 'border-brand-orange/60 bg-brand-orange/5 shadow-[0_0_0_4px_rgba(255,122,0,0.08)]'
                    : 'border-white/[0.08] bg-white/[0.03] hover:border-white/15'
                }`}>
                  <UserIcon className={`absolute left-4 w-5 h-5 transition-colors ${focusedField === 'lastName' ? 'text-brand-orange' : 'text-gray-600'}`} />
                  <input
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('lastName')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Soyad"
                    className="w-full bg-transparent pl-12 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none text-sm"
                  />
                </div>
              </div>
            </div>

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
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="ornek@sirket.com"
                  className="w-full bg-transparent pl-12 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-400">Telefon Numarası</label>
              <div className={`relative flex items-center rounded-2xl border transition-all duration-300 ${
                focusedField === 'phone'
                  ? 'border-brand-orange/60 bg-brand-orange/5 shadow-[0_0_0_4px_rgba(255,122,0,0.08)]'
                  : 'border-white/[0.08] bg-white/[0.03] hover:border-white/15'
              }`}>
                <Phone className={`absolute left-4 w-5 h-5 transition-colors ${focusedField === 'phone' ? 'text-brand-orange' : 'text-gray-600'}`} />
                <input
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="05XX XXX XX XX"
                  className="w-full bg-transparent pl-12 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-400">Şifre</label>
                <div className={`relative flex items-center rounded-2xl border transition-all duration-300 ${
                  focusedField === 'password'
                    ? 'border-brand-orange/60 bg-brand-orange/5 shadow-[0_0_0_4px_rgba(255,122,0,0.08)]'
                    : 'border-white/[0.08] bg-white/[0.03] hover:border-white/15'
                }`}>
                  <Lock className={`absolute left-4 w-5 h-5 transition-colors ${focusedField === 'password' ? 'text-brand-orange' : 'text-gray-600'}`} />
                  <input
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    className="w-full bg-transparent pl-12 pr-10 py-3.5 text-white placeholder-gray-600 focus:outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 text-gray-600 hover:text-gray-300 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Confirm */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-400">Şifre Tekrar</label>
                <div className={`relative flex items-center rounded-2xl border transition-all duration-300 ${
                  focusedField === 'passwordConfirm'
                    ? 'border-brand-orange/60 bg-brand-orange/5 shadow-[0_0_0_4px_rgba(255,122,0,0.08)]'
                    : 'border-white/[0.08] bg-white/[0.03] hover:border-white/15'
                }`}>
                  <Lock className={`absolute left-4 w-5 h-5 transition-colors ${focusedField === 'passwordConfirm' ? 'text-brand-orange' : 'text-gray-600'}`} />
                  <input
                    name="passwordConfirm"
                    type={showPassConfirm ? 'text' : 'password'}
                    required
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('passwordConfirm')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    className="w-full bg-transparent pl-12 pr-10 py-3.5 text-white placeholder-gray-600 focus:outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassConfirm(v => !v)}
                    className="absolute right-3 text-gray-600 hover:text-gray-300 transition-colors"
                  >
                    {showPassConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading || success}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center justify-center gap-3 py-4 mt-4 rounded-2xl font-black text-sm transition-all duration-300 relative overflow-hidden ${
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
                    Kaydediliyor...
                  </motion.div>
                ) : success ? (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Başarıyla oluşturuldu!
                  </motion.div>
                ) : (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2">
                    Ücretsiz Kayıt Ol
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          {/* Login link */}
          <div className="mt-8 text-center text-sm text-gray-500 font-medium">
            Zaten hesabın var mı?{' '}
            <Link to="/login" className="font-bold text-brand-orange hover:text-[#ff9d42] transition-colors relative inline-block group">
              Giriş Yap
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-brand-orange transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>
          
          {/* Terms */}
          <p className="text-center text-xs text-gray-700 mt-8 font-medium">
            Kayıt olarak{' '}
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
