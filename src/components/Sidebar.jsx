import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  FileText,
  Inbox,
  Newspaper,
  Users,
  Settings,
  GraduationCap,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ pendingCount = 0 }) => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Bosh sahifa', path: '/', icon: LayoutDashboard },
    { label: 'Jurnallar', path: '/journals', icon: BookOpen },
    { label: 'Jildlar & Sonlar', path: '/issues', icon: Layers },
    { label: 'Maqolalar', path: '/articles', icon: FileText },
    {
      label: 'Topshirilgan Maqolalar',
      path: '/submissions',
      icon: Inbox,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    { label: 'Yangiliklar', path: '/news', icon: Newspaper },
    { label: 'Foydalanuvchilar', path: '/users', icon: Users, role: ['admin'] },
    { label: 'Sozlamalar', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 backdrop-blur-md z-30">
      <div>
        {/* Brand header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-white tracking-wide flex items-center gap-1.5">
              Academic Nexus
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Admin
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Ma'mun Universiteti</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            if (item.role && user && !item.role.includes(user.role)) {
              return null;
            }
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User profile section */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-sm shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-slate-400 capitalize truncate">{user?.role || 'admin'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Tizimdan chiqish"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
