import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScrollText, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import api, { handleApiResponse } from '../../lib/api';

type AuditLogEntry = {
  id: string;
  entity: string;
  entityId: string | null;
  action: string;
  adminId: string;
  beforeJson: string | null;
  afterJson: string | null;
  metadataJson: string | null;
  createdAt: string;
};

const ACTION_STYLES: Record<string, string> = {
  CREATE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  UPDATE: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  DELETE: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  STATUS_CHANGE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  LOGIN: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const ENTITY_LABELS: Record<string, string> = {
  order: 'Sipariş',
  user: 'Kullanıcı',
  courier: 'Kurye',
  pricing: 'Fiyatlandırma',
  settings: 'Ayarlar',
  notification: 'Bildirim',
};

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: any = { page: pagination.page, limit: 30 };
      if (entityFilter) params.entity = entityFilter;
      if (actionFilter) params.action = actionFilter;
      const res = await api.get('/audit-logs', { params });
      const data = handleApiResponse<any>(res);
      setLogs(data.logs || []);
      setPagination(data.pagination || { page: 1, total: 0, totalPages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [pagination.page, entityFilter, actionFilter]);

  const formatDate = (d: string) => {
    const date = new Date(d);
    return `${date.toLocaleDateString('tr-TR')} ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const renderJson = (json: string | null) => {
    if (!json) return <span className="text-gray-600 italic">—</span>;
    try {
      return <pre className="text-xs text-gray-300 bg-black/30 p-3 rounded-xl overflow-x-auto max-h-48 custom-scrollbar">{JSON.stringify(JSON.parse(json), null, 2)}</pre>;
    } catch {
      return <span className="text-gray-400 text-xs">{json}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
          Sistem Günlüğü <ScrollText className="w-8 h-8 text-brand-orange drop-shadow-[0_0_15px_rgba(255,122,0,0.5)]" />
        </h1>
        <p className="text-gray-400 mt-2 font-medium text-lg">Platformda yapılan tüm değişikliklerin kaydı.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select value={entityFilter} onChange={(e) => { setEntityFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            className="bg-white/[0.03] border border-white/[0.08] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-brand-orange appearance-none cursor-pointer">
            <option value="">Tüm Varlıklar</option>
            {Object.entries(ENTITY_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            className="bg-white/[0.03] border border-white/[0.08] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-brand-orange appearance-none cursor-pointer">
            <option value="">Tüm İşlemler</option>
            <option value="CREATE">Oluşturma</option>
            <option value="UPDATE">Güncelleme</option>
            <option value="DELETE">Silme</option>
            <option value="STATUS_CHANGE">Durum Değişikliği</option>
            <option value="LOGIN">Giriş</option>
          </select>
        </div>
        <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
          <span className="text-gray-400 text-sm font-bold">{pagination.total}</span>
          <span className="text-gray-600 text-xs">kayıt</span>
        </div>
      </div>

      {/* Log List */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-10 h-10 border-2 border-white/10 border-t-brand-orange rounded-full animate-spin" /></div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center">
            <ScrollText className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 font-bold text-lg">Kayıt bulunamadı</p>
            <p className="text-gray-600 text-sm mt-2">Sistem üzerindeki aktiviteler burada listelenir.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {logs.map((log, i) => (
              <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                <div
                  onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                  className="px-8 py-5 flex items-center gap-6 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                >
                  <div className="text-[10px] text-gray-500 font-bold w-36 shrink-0">{formatDate(log.createdAt)}</div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shrink-0 ${ACTION_STYLES[log.action] || 'bg-white/5 text-gray-400 border-white/10'}`}>
                    {log.action === 'CREATE' ? 'Oluşturma' : log.action === 'UPDATE' ? 'Güncelleme' : log.action === 'DELETE' ? 'Silme' : log.action === 'STATUS_CHANGE' ? 'Durum' : log.action}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-white/5 text-gray-300 text-xs font-bold shrink-0">
                    {ENTITY_LABELS[log.entity] || log.entity}
                  </span>
                  <div className="text-sm text-gray-400 font-medium truncate flex-1">
                    {log.entityId ? `#${log.entityId.slice(0, 8).toUpperCase()}` : '—'}
                  </div>
                  <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest shrink-0">
                    Admin: {log.adminId.slice(0, 8)}
                  </div>
                </div>
                {expandedLog === log.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="px-8 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-36">
                      <div>
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Önceki Durum</div>
                        {renderJson(log.beforeJson)}
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Sonraki Durum</div>
                        {renderJson(log.afterJson)}
                      </div>
                    </div>
                    {log.metadataJson && (
                      <div className="ml-36 mt-4">
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Metadata</div>
                        {renderJson(log.metadataJson)}
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-3">
          <button onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))} disabled={pagination.page <= 1}
            className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-400 font-bold">Sayfa {pagination.page} / {pagination.totalPages}</span>
          <button onClick={() => setPagination((p) => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))} disabled={pagination.page >= pagination.totalPages}
            className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
