import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuthStore } from '../store/useAuthStore';
import { CreatePollModal } from './CreatePollModal';
import { 
  Vote, LogOut, Plus, Share2, ClipboardCheck, 
  Calendar, CheckCircle, ShieldAlert
} from 'lucide-react';

interface Poll {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  status: 'active' | 'ended';
  createdAt: any;
  endedAt: any | null;
  options: Array<{ id: string; name: string }>;
}

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'ended'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const pollsQuery = query(collection(db, 'polls'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(pollsQuery, (snapshot) => {
      const loadedPolls: Poll[] = [];
      snapshot.forEach((doc) => {
        loadedPolls.push({
          id: doc.id,
          ...doc.data()
        } as Poll);
      });
      setPolls(loadedPolls);
      setLoading(false);
    }, (error) => {
      console.error("Error loading polls:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  const handleShare = (pollId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/#/poll/${pollId}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        showToast('¡Enlace de votación copiado al portapapeles!');
      })
      .catch(() => {
        showToast('Error al copiar el enlace.');
      });
  };

  const handleClosePoll = async (pollId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('¿Estás seguro de que quieres dar por terminada esta votación? Nadie más podrá votar.')) {
      return;
    }
    try {
      const pollRef = doc(db, 'polls', pollId);
      await updateDoc(pollRef, {
        status: 'ended',
        endedAt: serverTimestamp()
      });
      showToast('Votación cerrada con éxito.');
    } catch (error) {
      console.error('Error closing poll:', error);
      showToast('Error al cerrar la votación.');
    }
  };

  const handleNavigateToPoll = (pollId: string) => {
    window.location.hash = `#/poll/${pollId}`;
  };

  // Stats calculation
  const totalPolls = polls.length;
  const activePollsCount = polls.filter(p => p.status === 'active').length;
  const endedPollsCount = polls.filter(p => p.status === 'ended').length;

  // Filtered polls
  const filteredPolls = polls.filter((poll) => {
    if (filter === 'active') return poll.status === 'active';
    if (filter === 'ended') return poll.status === 'ended';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative selection:bg-indigo-500 selection:text-white">
      {/* Background ambient glows */}
      <div className="absolute top-0 left-[20%] w-[40%] h-[30%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-[20%] w-[40%] h-[30%] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-30 px-6 py-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.hash = '#/'}>
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
            onClick={() => logout()}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-rose-400 px-3.5 py-2.5 bg-slate-900/20 hover:bg-rose-500/10 border border-slate-800/40 hover:border-rose-500/20 rounded-2xl transition-all cursor-pointer"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 relative z-10 flex flex-col gap-8">
        
        {/* Top welcome card and creation action */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 bg-gradient-to-br from-slate-900/65 to-slate-950 border border-slate-900 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              ¡Hola, {user?.displayName?.split(' ')[0] || 'Votante'}!
            </h2>
            <p className="text-slate-400 text-sm mt-1.5 leading-relaxed max-w-xl">
              Crea nuevas votaciones con opciones personalizadas o participa de los debates activos. Todo se sincroniza al instante.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="py-3.5 px-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-650 hover:to-purple-650 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center gap-2 shrink-0"
          >
            <Plus className="w-5 h-5" />
            Nueva Votación
          </button>
        </div>

        {/* Dashboard statistics summary cards */}
        <section className="grid grid-cols-3 gap-4">
          <div className="p-5 bg-slate-900/30 border border-slate-900 rounded-2xl flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Creadas</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-white">{totalPolls}</span>
              <span className="text-xs text-slate-400">totales</span>
            </div>
          </div>
          <div className="p-5 bg-slate-900/30 border border-slate-900 rounded-2xl flex flex-col justify-between">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">Activas</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-indigo-400">{activePollsCount}</span>
              <span className="text-xs text-slate-400">abiertas</span>
            </div>
          </div>
          <div className="p-5 bg-slate-900/30 border border-slate-900 rounded-2xl flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Terminadas</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-slate-300">{endedPollsCount}</span>
              <span className="text-xs text-slate-400">cerradas</span>
            </div>
          </div>
        </section>

        {/* Toolbar & Filters */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${filter === 'all' ? 'bg-slate-800 text-white border border-slate-700/60' : 'text-slate-400 hover:text-slate-200 border border-transparent'}`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${filter === 'active' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 border border-transparent'}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Activas ({activePollsCount})
            </button>
            <button
              onClick={() => setFilter('ended')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${filter === 'ended' ? 'bg-slate-800/80 text-slate-300 border border-slate-700/40' : 'text-slate-400 hover:text-slate-200 border border-transparent'}`}
            >
              Terminadas ({endedPollsCount})
            </button>
          </div>
        </div>

        {/* Poll List */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold text-slate-400">Cargando votaciones en tiempo real...</span>
          </div>
        ) : filteredPolls.length === 0 ? (
          <div className="py-20 text-center bg-slate-900/10 border border-dashed border-slate-900 rounded-3xl flex flex-col items-center gap-3">
            <ShieldAlert className="w-10 h-10 text-slate-600" />
            <span className="text-sm font-medium text-slate-400">No hay votaciones registradas en esta categoría.</span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
            >
              Crea la primera votación
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPolls.map((poll) => {
              const isCreator = user?.uid === poll.creatorId;
              const dateObj = poll.createdAt?.seconds ? new Date(poll.createdAt.seconds * 1000) : null;
              
              return (
                <div 
                  key={poll.id}
                  onClick={() => handleNavigateToPoll(poll.id)}
                  className="glass-card hover:border-slate-800 p-6 rounded-2xl flex flex-col justify-between min-h-[220px] shadow-lg group relative hover:scale-[1.01] hover:shadow-indigo-500/[0.02] transition-all duration-300 cursor-pointer"
                >
                  <div>
                    {/* Status badge and Option count */}
                    <div className="flex items-center justify-between mb-4">
                      {poll.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/25">
                          <span className="w-1 h-1 rounded-full bg-indigo-400 animate-ping" />
                          Activa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-400 bg-slate-950 border border-slate-900">
                          Terminada
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                        {poll.options.length} opciones
                      </span>
                    </div>

                    {/* Title & Desc */}
                    <h4 className="text-lg font-bold text-white leading-snug group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {poll.title}
                    </h4>
                    <p className="text-slate-400 text-xs mt-2 leading-relaxed line-clamp-2">
                      {poll.description || 'Sin descripción adicional.'}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-900/60 flex items-center justify-between">
                    {/* Creator / Date Info */}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-slate-500 font-medium">Por {poll.creatorName}</span>
                      {dateObj && (
                        <span className="text-[9px] text-slate-500 flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          {dateObj.toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Actions on Card */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleShare(poll.id, e)}
                        className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-colors cursor-pointer"
                        title="Compartir enlace de votación"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      {isCreator && poll.status === 'active' && (
                        <button
                          onClick={(e) => handleClosePoll(poll.id, e)}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                          title="Cerrar esta votación"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Slide Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 py-3.5 px-6 bg-slate-900 border border-indigo-500/20 text-slate-200 text-xs font-semibold rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <ClipboardCheck className="w-4 h-4 text-indigo-400" />
          {toastMessage}
        </div>
      )}

      {/* Modal create poll */}
      <CreatePollModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
