import React from 'react';

interface DashboardStatsProps {
  total: number;
  active: number;
  ended: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ total, active, ended }) => {
  return (
    <section className="grid grid-cols-3 gap-4">
      {/* Created stats card */}
      <div className="p-5 bg-slate-900/30 border border-slate-900 rounded-2xl flex flex-col justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Creadas</span>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-black text-white">{total}</span>
          <span className="text-xs text-slate-400">totales</span>
        </div>
      </div>

      {/* Active stats card */}
      <div className="p-5 bg-slate-900/30 border border-slate-900 rounded-2xl flex flex-col justify-between">
        <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">Activas</span>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-black text-indigo-400">{active}</span>
          <span className="text-xs text-slate-400">abiertas</span>
        </div>
      </div>

      {/* Ended stats card */}
      <div className="p-5 bg-slate-900/30 border border-slate-900 rounded-2xl flex flex-col justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Terminadas</span>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-black text-slate-300">{ended}</span>
          <span className="text-xs text-slate-400">cerradas</span>
        </div>
      </div>
    </section>
  );
};
