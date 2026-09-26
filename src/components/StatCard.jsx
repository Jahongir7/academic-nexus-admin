import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'indigo', badgeText, trend }) => {
  const colorMap = {
    indigo: 'from-indigo-500/20 to-indigo-600/5 text-indigo-400 border-indigo-500/30',
    emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/30',
    amber: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/30',
    cyan: 'from-cyan-500/20 to-cyan-600/5 text-cyan-400 border-cyan-500/30',
    purple: 'from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/30',
    rose: 'from-rose-500/20 to-rose-600/5 text-rose-400 border-rose-500/30',
  };

  return (
    <div className="glass-card p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
          <div className="text-3xl font-bold text-white mt-2 tracking-tight">{value}</div>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br border ${colorMap[color] || colorMap.indigo}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {(badgeText || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          {badgeText && <span className="text-slate-400 font-medium">{badgeText}</span>}
          {trend && (
            <span className={`font-semibold ${trend.startsWith('+') ? 'text-emerald-400' : 'text-slate-400'}`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
