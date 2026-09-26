import React, { useState, useEffect } from 'react';
import { RefreshCw, Bell, Search, ExternalLink, ShieldCheck } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const Header = ({ title, subtitle, onRefresh }) => {
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    const checkApi = async () => {
      try {
        const res = await axiosClient.get('/');
        if (res.data.status === 'Active') {
          setApiStatus('online');
        } else {
          setApiStatus('offline');
        }
      } catch (err) {
        setApiStatus('offline');
      }
    };
    checkApi();
  }, []);

  return (
    <header className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          {title}
        </h1>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Backend Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-medium">
          <span
            className={`w-2 h-2 rounded-full ${
              apiStatus === 'online'
                ? 'bg-emerald-400 animate-pulse'
                : apiStatus === 'checking'
                ? 'bg-amber-400 animate-ping'
                : 'bg-rose-500'
            }`}
          />
          <span className="text-slate-300">
            {apiStatus === 'online' ? 'API Faol' : apiStatus === 'checking' ? 'Tekshirilmoqda...' : 'API O\'chiq'}
          </span>
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Yangilash"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700/60"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {/* Public platform link */}
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-btn-secondary text-xs py-1.5 px-3"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Saytga o'tish</span>
        </a>
      </div>
    </header>
  );
};

export default Header;
