import { Package, Globe, MessageCircle, Share2, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#050810] border-t border-white/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-brand-orange/20 p-2 rounded-xl group-hover:bg-brand-orange/30 transition-colors">
                <Package className="w-6 h-6 text-brand-orange" />
              </div>
              <span className="text-2xl font-bold tracking-wider text-white">JETIS</span>
            </Link>
            <p className="text-gray-400 leading-relaxed">
              Dakikalar içinde güvenli teslimat. İstanbul'un her noktasına 7/24 kesintisiz kurye hizmeti sunuyoruz.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                <Share2 className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Hizmetler</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-400 hover:text-brand-orange transition-colors">Moto Kurye</a></li>
              <li><a href="#" className="text-gray-400 hover:text-brand-orange transition-colors">Araçlı Kurye</a></li>
              <li><a href="#" className="text-gray-400 hover:text-brand-orange transition-colors">VIP Teslimat</a></li>
              <li><a href="#" className="text-gray-400 hover:text-brand-orange transition-colors">E-Ticaret Kurye</a></li>
              <li><a href="#" className="text-gray-400 hover:text-brand-orange transition-colors">Kurumsal Çözümler</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Kurumsal</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-400 hover:text-brand-orange transition-colors">Hakkımızda</a></li>
              <li><a href="#" className="text-gray-400 hover:text-brand-orange transition-colors">Kurye Ol</a></li>
              <li><a href="#" className="text-gray-400 hover:text-brand-orange transition-colors">Kariyer</a></li>
              <li><a href="#" className="text-gray-400 hover:text-brand-orange transition-colors">Basın</a></li>
              <li><a href="#" className="text-gray-400 hover:text-brand-orange transition-colors">İletişim</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-6">İletişim</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-5 h-5 text-brand-orange" />
                <span>Levent, Beşiktaş / İstanbul</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Phone className="w-5 h-5 text-brand-orange" />
                <span>0850 123 45 67</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Mail className="w-5 h-5 text-brand-orange" />
                <span>destek@jetis.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 JETIS. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-gray-500 hover:text-white transition-colors">Gizlilik Politikası</a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">Kullanım Şartları</a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">Çerez Politikası</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
