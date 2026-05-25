import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { CreatePollModal } from './CreatePollModal';
import { DashboardHeader } from './DashboardHeader';
import { DashboardStats } from './DashboardStats';
import { PollCard } from './PollCard';
import { subscribeToPolls, closePoll, type Poll } from '../services/pollService';
import { ConfirmModal } from './ConfirmModal';
import { Plus, ClipboardCheck, ShieldAlert } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'ended'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pollToClose, setPollToClose] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToPolls(
      (loadedPolls) => {
        setPolls(loadedPolls);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading polls:", error);
        setLoading(false);
      }
    );

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

  const handleClosePoll = (pollId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPollToClose(pollId);
    setIsConfirmOpen(true);
  };

  const confirmClosePoll = async () => {
    if (!pollToClose) return;
    try {
      await closePoll(pollToClose);
      showToast('Votación cerrada con éxito.');
    } catch (error) {
      console.error('Error closing poll:', error);
      showToast('Error al cerrar la votación.');
    } finally {
      setPollToClose(null);
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
      <DashboardHeader user={user} onLogout={logout} />

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
            className="py-3.5 px-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-650 hover:to-purple-650 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center gap-2 shrink-0 animate-in fade-in duration-300"
          >
            <Plus className="w-5 h-5" />
            Nueva Votación
          </button>
        </div>

        {/* Dashboard statistics summary cards */}
        <DashboardStats 
          total={totalPolls}
          active={activePollsCount}
          ended={endedPollsCount}
        />

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
          <div className="py-20 text-center bg-slate-900/10 border border-dashed border-slate-900 rounded-3xl flex flex-col items-center gap-3 animate-in fade-in duration-300">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {filteredPolls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                currentUserId={user?.uid}
                onShare={handleShare}
                onClosePoll={handleClosePoll}
                onNavigate={handleNavigateToPoll}
              />
            ))}
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

      {/* Custom Confirm Modal for Closing Poll */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setPollToClose(null);
        }}
        onConfirm={confirmClosePoll}
        title="¿Cerrar Votación?"
        message="¿Estás seguro de que deseas finalizar este debate? Ningún usuario podrá emitir más votos y los resultados actuales pasarán a ser definitivos."
        confirmText="Finalizar"
        cancelText="Cancelar"
        isDestructive={true}
      />
    </div>
  );
};
