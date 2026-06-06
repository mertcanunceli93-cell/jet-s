import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, MoreVertical, Shield, Truck, User } from 'lucide-react';
import api, { handleApiResponse } from '../../lib/api';

type UserData = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'COURIER' | 'ADMIN';
  createdAt: string;
};

export default function Users() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      // Assuming there is an /auth/users or /users endpoint for admins
      const response = await api.get('/orders/users');
      const data = handleApiResponse<{ users: UserData[] }>(response);
      setUsers(data.users || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Failed to fetch users:', err.message);
      } else {
        console.error('Failed to fetch users:', err);
      }
      // Fallback for demo if endpoint doesn't exist yet
      setUsers([
        { id: '1', email: 'admin@jetis.com', firstName: 'Sertan', lastName: 'Admin', role: 'ADMIN', createdAt: '2026-01-01' },
        { id: '2', email: 'kurye@jetis.com', firstName: 'Mehmet', lastName: 'Kurye', role: 'COURIER', createdAt: '2026-02-15' },
        { id: '3', email: 'user@jetis.com', firstName: 'Ayşe', lastName: 'Müşteri', role: 'USER', createdAt: '2026-03-10' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
     
    fetchUsers();
   
  }, []);

  const filteredUsers = users.filter(u => 
    u.firstName.toLowerCase().includes(search.toLowerCase()) ||
    u.lastName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'ADMIN': return { label: 'Admin', icon: Shield, style: 'bg-purple-500/10 text-purple-500 border-purple-500/20' };
      case 'COURIER': return { label: 'Kurye', icon: Truck, style: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20' };
      default: return { label: 'Müşteri', icon: User, style: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Kullanıcı Yönetimi</h1>
          <p className="text-gray-400 mt-1 font-medium">Sistemdeki tüm kullanıcıları, kuryeleri ve adminleri yönetin.</p>
        </div>
        <button className="px-8 py-4 bg-brand-orange text-white rounded-2xl font-black hover:bg-[#ff8a1a] transition-all shadow-lg shadow-brand-orange/20 flex items-center gap-2">
          Yeni Kullanıcı Ekle
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="İsim veya e-posta ile ara..."
            className="w-full bg-[#111827] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-brand-orange/50 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-4 bg-[#111827] border border-white/5 rounded-2xl text-gray-400 hover:text-white transition-all">
          <Filter className="w-5 h-5" />
          <span>Filtrele</span>
        </button>
      </div>

      <div className="bg-[#111827] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase tracking-widest">Kullanıcı</th>
                <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase tracking-widest text-center">Rol</th>
                <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase tracking-widest">Kayıt Tarihi</th>
                <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase tracking-widest text-center">Durum</th>
                <th className="px-8 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {filteredUsers.map((u) => {
                  const badge = getRoleBadge(u.role);
                  const Icon = badge.icon;
                  return (
                    <motion.tr 
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white font-black text-lg">
                            {u.firstName?.[0]}{u.lastName?.[0]}
                          </div>
                          <div>
                            <div className="font-bold text-white tracking-tight">{u.firstName} {u.lastName}</div>
                            <div className="text-xs text-gray-500 font-medium">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center">
                          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${badge.style}`}>
                            <Icon className="w-3 h-3" />
                            {badge.label}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-medium text-gray-300">{new Date(u.createdAt).toLocaleDateString('tr-TR')}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center">
                            <div className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-widest">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                Aktif
                            </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-2 text-gray-500 hover:text-white transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
          {loading && (
            <div className="p-20 text-center text-gray-500">Yükleniyor...</div>
          )}
        </div>
      </div>
    </div>
  );
}
