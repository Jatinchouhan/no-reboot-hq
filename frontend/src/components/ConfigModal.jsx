import { useState, useEffect } from 'react';
import api from '../services/api';
import { X } from 'lucide-react';

export default function ConfigModal({ config, onClose }) {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!config;

  useEffect(() => {
    if (config) {
      setKey(config.key);
      setValue(config.value);
    }
  }, [config]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        await api.put(`/configs/${key}`, { key, value });
      } else {
        await api.post('/configs', { key, value });
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center border-b border-slate-700 px-6 py-4 bg-slate-800/50">
          <h3 className="text-xl font-semibold text-white">
            {isEdit ? 'Update Configuration' : 'New Configuration'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm border border-red-500/50">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Key</label>
            <input
              type="text"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              disabled={isEdit}
              required
              placeholder="e.g., max_api_limits"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Value</label>
            <textarea
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 min-h-[120px]"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
              placeholder="e.g., 100"
            />
          </div>
          
          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
