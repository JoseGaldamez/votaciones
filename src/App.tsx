import React, { useState, useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { PollDetail } from './components/PollDetail';
import { Vote } from 'lucide-react';

export const App: React.FC = () => {
  const { user, loading } = useAuthStore();
  const [currentHash, setCurrentHash] = useState(() => window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Full screen loader
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        
        <div className="relative flex flex-col items-center gap-4">
          <div className="p-4 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl shadow-xl shadow-indigo-500/20 animate-bounce">
            <Vote className="w-8 h-8 text-white" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-450 bg-clip-text text-transparent tracking-tight">
              VotaReal
            </span>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-widest animate-pulse mt-1">
              Cargando sesión...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in: Redirect to Login
  if (!user) {
    return <Login />;
  }

  // Simple state HashRouter
  // Supported Routes:
  // - #/poll/:pollId -> PollDetail
  // - everything else -> Dashboard
  if (currentHash.startsWith('#/poll/')) {
    const pollId = currentHash.replace('#/poll/', '');
    if (pollId) {
      return <PollDetail pollId={pollId} />;
    }
  }

  // Default fallback route: Dashboard
  return <Dashboard />;
};

export default App;
