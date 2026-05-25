import React from 'react';
import { type User } from 'firebase/auth';
import { Vote, LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  user: User | null;
  onLogout: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="sticky top-0 z-30 px-6 py-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-900/60 flex items-center justify-between">
      <div 
        className="flex items-center gap-3 cursor-pointer" 
        onClick={() => window.location.hash = '#/'}
      >
        <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl shadow-md">
          <Vote className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-350 bg-clip-text text-transparent">
          VotaReal
        </span>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'Avatar'} 
                className="w-6 h-6 rounded-full border border-slate-700"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                {user.displayName?.charAt(0) || 'U'}
              </div>
            )}
            <span className="text-xs text-slate-300 font-semibold max-w-[120px] truncate">
              {user.displayName || 'Usuario'}
            </span>
          </div>
        )}

        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-rose-400 px-3.5 py-2.5 bg-slate-900/20 hover:bg-rose-500/10 border border-slate-800/40 hover:border-rose-500/20 rounded-2xl transition-all cursor-pointer animate-in fade-in duration-300"
          title="Cerrar sesión"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
};
