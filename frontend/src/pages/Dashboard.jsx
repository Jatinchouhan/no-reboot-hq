import { useEffect, useState, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import websocketService from '../services/websocketService';
import ConfigModal from '../components/ConfigModal';
import HistoryModal from '../components/HistoryModal';
import { LogOut, Plus, Settings, History, Trash2, Edit } from 'lucide-react';

export default function Dashboard() {
  const { currentUser, logout } = useContext(AuthContext);
  const [configs, setConfigs] = useState([]);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);

  const fetchConfigs = useCallback(async () => {
    try {
      const response = await api.get('/configs');
      setConfigs(response.data);
    } catch (error) {
      console.error('Failed to fetch configs', error);
    }
  }, []);

  useEffect(() => {
    fetchConfigs();

    websocketService.connect((updatedConfig) => {
      setConfigs((prev) => {
        const existingIndex = prev.findIndex((c) => c.key === updatedConfig.key);
        if (updatedConfig.isActive === false && !updatedConfig.value) {
            return prev.filter((c) => c.key !== updatedConfig.key);
        }

        if (existingIndex > -1) {
          const newConfigs = [...prev];
          newConfigs[existingIndex] = updatedConfig;
          return newConfigs;
        } else {
          return [...prev, updatedConfig];
        }
      });
    });

    return () => {
      websocketService.disconnect();
    };
  }, [fetchConfigs]);

  const handleDelete = async (key) => {
    if (window.confirm(`Are you sure you want to delete config '${key}'?`)) {
      try {
        await api.delete(`/configs/${key}`);
      } catch (error) {
        console.error('Failed to delete', error);
      }
    }
  };

  const openEdit = (config) => {
    setSelectedConfig(config);
    setIsConfigModalOpen(true);
  };

  const openHistory = (config) => {
    setSelectedConfig(config);
    setIsHistoryModalOpen(true);
  };

  const openCreate = () => {
    setSelectedConfig(null);
    setIsConfigModalOpen(true);
  };

  const canEdit = currentUser?.role === 'ROLE_ADMIN' || currentUser?.role === 'ROLE_DEVELOPER';
  const canDelete = currentUser?.role === 'ROLE_ADMIN';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300">
      <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Settings className="text-blue-500" />
          <h1 className="text-xl font-bold text-white">No Reboot HQ</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm">
            <span className="text-slate-400">Logged in as:</span>{' '}
            <span className="text-white font-medium">{currentUser?.username}</span>{' '}
            <span className="px-2 py-1 bg-slate-700 text-xs rounded-full ml-1">{currentUser?.role?.replace('ROLE_', '')}</span>
          </span>
          <button onClick={logout} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Active Configurations</h2>
            <p className="text-slate-400 text-sm">Real-time updates without server restarts.</p>
          </div>
          {canEdit && (
            <button
              onClick={openCreate}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-500/20"
            >
              <Plus size={18} />
              <span>New Config</span>
            </button>
          )}
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-700">
                <th className="px-6 py-4 text-sm font-semibold text-slate-300">Key</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-300">Value</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-300">Version</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {configs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                    No active configurations found.
                  </td>
                </tr>
              ) : (
                configs.map((config) => (
                  <tr key={config.key} className="hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-4 font-mono text-sm text-blue-400">{config.key}</td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-300">
                      <div className="max-w-md truncate">{config.value}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">v{config.version}</span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {canEdit && (
                        <button onClick={() => openHistory(config)} className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors" title="History & Rollback">
                          <History size={18} />
                        </button>
                      )}
                      {canEdit && (
                        <button onClick={() => openEdit(config)} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors" title="Edit">
                          <Edit size={18} />
                        </button>
                      )}
                      {canDelete && (
                        <button onClick={() => handleDelete(config.key)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {isConfigModalOpen && (
        <ConfigModal
          config={selectedConfig}
          onClose={() => setIsConfigModalOpen(false)}
        />
      )}

      {isHistoryModalOpen && (
        <HistoryModal
          configKey={selectedConfig?.key}
          onClose={() => setIsHistoryModalOpen(false)}
        />
      )}
    </div>
  );
}
