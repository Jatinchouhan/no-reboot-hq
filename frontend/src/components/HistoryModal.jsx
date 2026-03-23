import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { X, RotateCcw } from 'lucide-react';

export default function HistoryModal({ configKey, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get(`/configs/history/${configKey}`);
        setHistory(response.data);
      } catch (err) {
        console.error('Failed to load history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [configKey]);

  const handleRollback = async (version) => {
    if (window.confirm(`Rollback '${configKey}' to v${version}?`)) {
      try {
        await api.post(`/configs/rollback/${configKey}/${version}`);
        onClose();
      } catch (err) {
        alert('Rollback failed');
      }
    }
  };

  const canRollback = currentUser?.role === 'ROLE_ADMIN';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-slate-700 px-6 py-4 bg-slate-800/50 shrink-0">
          <h3 className="text-xl font-semibold text-white">
            History: <span className="text-blue-400 font-mono">{configKey}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="text-center text-slate-400 py-8">Loading versions...</div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className={`p-4 rounded-xl border ${item.isActive ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-900/50 border-slate-700'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${item.isActive ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                          v{item.version}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                        {item.isActive && (
                          <span className="text-xs text-blue-400 font-medium">Currently Active</span>
                        )}
                      </div>
                      <pre className="mt-2 text-sm text-slate-300 font-mono whitespace-pre-wrap break-all">
                        {item.value}
                      </pre>
                    </div>
                    {canRollback && !item.isActive && (
                      <button
                        onClick={() => handleRollback(item.version)}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm shrink-0"
                      >
                        <RotateCcw size={14} />
                        <span>Rollback</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {history.length === 0 && (
                <div className="text-center text-slate-500 py-8">No history available.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
