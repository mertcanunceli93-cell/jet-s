import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { useAuth } from '../store/useAuth';
import api, { handleApiResponse } from '../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const setAuth  = useAuth(state => state.setAuth);

  useEffect(() => {
    let mounted = true;

    const performAutoLogin = async () => {
      try {
        const response = await api.post('/auth/login', { email: 'root36', password: '68cd1f20' });
        const data = handleApiResponse<any>(response);
        if (mounted) {
          setAuth(data.user, data.token);
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Auto-login failed:', err);
        // If it fails (e.g. backend off), retry in 3 seconds
        if (mounted) {
          setTimeout(performAutoLogin, 3000);
        }
      }
    };

    performAutoLogin();

    return () => { mounted = false; };
  }, [navigate, setAuth]);

  return (
    <div className="min-h-screen bg-[#080D17] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,122,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,122,0,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-orange/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Pulsing Logo */}
        <div className="w-20 h-20 rounded-3xl bg-brand-orange flex items-center justify-center shadow-[0_0_40px_rgba(255,122,0,0.6)] animate-bounce mb-8">
          <Zap className="w-10 h-10 text-white" strokeWidth={2.5} />
        </div>
        
        <h1 className="text-3xl font-black tracking-widest text-white mb-4">JETIS</h1>
        
        <div className="flex items-center gap-3 text-brand-orange font-bold tracking-widest text-sm uppercase">
          <div className="w-4 h-4 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
          Operasyon Merkezi Yükleniyor...
        </div>
      </div>
    </div>
  );
}
