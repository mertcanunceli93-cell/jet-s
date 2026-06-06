import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Menu, X, Package } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B1220]/80 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-brand-orange/20 p-2 rounded-xl group-hover:bg-brand-orange/30 transition-colors">
                <Package className="w-6 h-6 text-brand-orange" />
              </div>
              <span className="text-2xl font-bold tracking-wider text-white">JETIS</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#services" className="text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">Hizmetler</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">Nasıl Çalışır?</a>
              <a href="#corporate" className="text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">Kurumsal</a>
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">Giriş Yap</Link>
              <Link to="/register" className="bg-brand-orange text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#ff8a1a] transition-all shadow-[0_0_20px_rgba(255,122,0,0.3)] hover:shadow-[0_0_25px_rgba(255,122,0,0.5)]">
                Kurye Çağır
              </Link>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
            >
              <span className="sr-only">Menüyü aç</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-[#0B1220] border-b border-white/10"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#services" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Hizmetler</a>
            <a href="#how-it-works" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Nasıl Çalışır?</a>
            <a href="#corporate" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Kurumsal</a>
            <Link to="/login" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Giriş Yap</Link>
            <Link to="/register" className="text-brand-orange block px-3 py-2 rounded-md text-base font-medium">Kurye Çağır</Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
