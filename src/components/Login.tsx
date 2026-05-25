import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Vote, TrendingUp, ShieldCheck, HelpCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { loginWithGoogle, loading } = useAuthStore();

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      // Errors are already logged in store, could show a toast here if desired
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-radial from-slate-900 via-slate-950 to-black text-slate-100 overflow-hidden relative selection:bg-indigo-500 selection:text-white">
      {/* Background ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      {/* Header / Brand */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-slate-800/40 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/20">
            <Vote className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            VotaReal
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Tiempo Real
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 px-6 py-12 max-w-7xl mx-auto w-full z-10">
        {/* Left Side: Pitch and Visuals */}
        <div className="flex-1 text-center lg:text-left max-w-xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight bg-gradient-to-br from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            La forma más rápida de tomar <span className="text-indigo-400 glow-text">decisiones grupales</span>
          </h1>
          <p className="mt-6 text-lg text-slate-400 leading-relaxed">
            Crea votaciones instantáneas, compártelas con un enlace y visualiza la opinión de tu equipo en tiempo real con total seguridad.
          </p>

          {/* Features list */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-slate-900/40 border border-slate-800/60 rounded-2xl hover:border-slate-800 transition-colors">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-slate-200 text-sm">Tiempo Real</h4>
                <p className="text-xs text-slate-400 mt-0.5">Mira los resultados cambiar segundo a segundo.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-slate-900/40 border border-slate-800/60 rounded-2xl hover:border-slate-800 transition-colors">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-slate-200 text-sm">Privacidad Blindada</h4>
                <p className="text-xs text-slate-400 mt-0.5">Nadie ve los resultados antes de emitir su voto.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Card */}
        <div className="w-full max-w-md">
          <div className="glass-card p-8 rounded-3xl shadow-2xl relative group overflow-hidden">
            {/* Ambient card light */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-colors duration-500" />
            
            <div className="text-center relative">
              <h2 className="text-2xl font-bold tracking-tight text-white">Comienza ahora</h2>
              <p className="text-slate-400 text-sm mt-2">
                Inicia sesión de forma segura y comienza a crear o participar en votaciones.
              </p>
            </div>

            {/* Login Button with Google */}
            <div className="mt-8 relative">
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-4 px-6 bg-white hover:bg-slate-50 text-slate-950 font-semibold rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-white/5 hover:shadow-indigo-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                <span>Continuar con Google</span>
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800/40 text-center">
              <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <HelpCircle className="w-3.5 h-3.5" />
                ¿Necesitas ayuda? Escríbenos a soporte
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-slate-800/30 text-center text-xs text-slate-500 z-10">
        <p>&copy; {new Date().getFullYear()} VotaReal. Todos los derechos reservados. Creado con Firebase & Zustand.</p>
      </footer>
    </div>
  );
};
