import React, { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuthStore } from '../store/useAuthStore';
import { 
  ArrowLeft, Vote as VoteIcon, Calendar, CheckCircle2, 
  BarChart2, Users, AlertCircle, Share2, ClipboardCheck 
} from 'lucide-react';

interface Option {
  id: string;
  name: string;
}

interface Poll {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  status: 'active' | 'ended';
  createdAt: any;
  endedAt: any | null;
  options: Option[];
}

interface Vote {
  userId: string;
  userName: string;
  optionId: string;
  votedAt: any;
}

interface PollDetailProps {
  pollId: string;
}

export const PollDetail: React.FC<PollDetailProps> = ({ pollId }) => {
  const { user } = useAuthStore();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [allVotes, setAllVotes] = useState<Vote[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  
  const [loadingPoll, setLoadingPoll] = useState(true);
  const [loadingVote, setLoadingVote] = useState(true);
  const [submittingVote, setSubmittingVote] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const isCreator = user ? poll?.creatorId === user.uid : false;

  // 1. Listen to poll document
  useEffect(() => {
    if (!pollId) return;
    const pollRef = doc(db, 'polls', pollId);
    
    const unsubscribe = onSnapshot(pollRef, (snapshot) => {
      if (snapshot.exists()) {
        setPoll({ id: snapshot.id, ...snapshot.data() } as Poll);
      } else {
        setError('Esta votación no existe o ha sido eliminada.');
      }
      setLoadingPoll(false);
    }, (err) => {
      console.error("Error fetching poll details:", err);
      setError('No tienes permisos para ver esta votación.');
      setLoadingPoll(false);
    });

    return () => unsubscribe();
  }, [pollId]);

  // 2. Listen to user's vote document (to check if already voted)
  useEffect(() => {
    if (!user || !pollId) return;
    const userVoteRef = doc(db, 'polls', pollId, 'votes', user.uid);

    const unsubscribe = onSnapshot(userVoteRef, (snapshot) => {
      if (snapshot.exists()) {
        setHasVoted(true);
        setUserVote(snapshot.data() as Vote);
      } else {
        setHasVoted(false);
        setUserVote(null);
      }
      setLoadingVote(false);
    }, (err) => {
      console.error("Error fetching user vote state:", err);
      setLoadingVote(false);
    });

    return () => unsubscribe();
  }, [pollId, user]);

  // 3. Listen to all votes (ONLY if creator OR has voted)
  useEffect(() => {
    if (!pollId || !user || (!isCreator && !hasVoted)) {
      setAllVotes([]);
      return;
    }

    const votesCollectionRef = collection(db, 'polls', pollId, 'votes');
    const unsubscribe = onSnapshot(votesCollectionRef, (snapshot) => {
      const loadedVotes: Vote[] = [];
      snapshot.forEach((doc) => {
        loadedVotes.push(doc.data() as Vote);
      });
      setAllVotes(loadedVotes);
    }, (err) => {
      // It's expected to fail if user hasn't voted yet due to security rules
      console.log("Real-time results access restricted by security rules until voting." + err.message);
    });

    return () => unsubscribe();
  }, [pollId, user, isCreator, hasVoted]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        showToast('¡Enlace de votación copiado!');
      })
      .catch(() => {
        showToast('Error al copiar el enlace.');
      });
  };

  const handleClosePoll = async () => {
    if (!poll || !isCreator) return;
    if (!window.confirm('¿Quieres cerrar esta votación de forma definitiva?')) {
      return;
    }
    try {
      const pollRef = doc(db, 'polls', poll.id);
      await updateDoc(pollRef, {
        status: 'ended',
        endedAt: serverTimestamp()
      });
      showToast('Votación terminada con éxito.');
    } catch (err) {
      console.error('Error closing poll:', err);
      showToast('Ocurrió un error al cerrar la votación.');
    }
  };

  const handleCastVote = async () => {
    if (!user || !poll || !selectedOptionId || submittingVote || poll.status === 'ended') return;

    setSubmittingVote(true);
    try {
      const userVoteRef = doc(db, 'polls', poll.id, 'votes', user.uid);
      
      const voteData: Vote = {
        userId: user.uid,
        userName: user.displayName || 'Usuario de Google',
        optionId: selectedOptionId,
        votedAt: serverTimestamp(),
      };

      await setDoc(userVoteRef, voteData);
      showToast('¡Tu voto ha sido registrado!');
    } catch (err) {
      console.error('Error casting vote:', err);
      showToast('Ocurrió un error al emitir tu voto.');
    } finally {
      setSubmittingVote(false);
    }
  };

  const handleBack = () => {
    window.location.hash = '#/';
  };

  const isLoading = loadingPoll || loadingVote;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-400">Verificando estado de votación...</span>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 gap-4">
        <AlertCircle className="w-14 h-14 text-rose-500" />
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">Oops...</h2>
          <p className="text-slate-400 text-sm mt-1">{error || 'No se pudo cargar la información de la votación.'}</p>
        </div>
        <button
          onClick={handleBack}
          className="mt-2 py-2 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-2xl transition-colors cursor-pointer flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Dashboard
        </button>
      </div>
    );
  }

  // Vote counting logic
  const totalVotes = allVotes.length;
  const voteCounts = allVotes.reduce((acc, vote) => {
    acc[vote.optionId] = (acc[vote.optionId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const showResults = isCreator || hasVoted;
  const dateObj = poll.createdAt?.seconds ? new Date(poll.createdAt.seconds * 1000) : null;
  const endedDateObj = poll.endedAt?.seconds ? new Date(poll.endedAt.seconds * 1000) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative selection:bg-indigo-500 selection:text-white">
      {/* Background ambient glows */}
      <div className="absolute top-0 left-[20%] w-[40%] h-[30%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-[20%] w-[40%] h-[30%] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-30 px-6 py-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-900/60 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-all cursor-pointer flex items-center gap-2 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Copiar enlace de esta votación"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Compartir</span>
          </button>

          {isCreator && poll.status === 'active' && (
            <button
              onClick={handleClosePoll}
              className="py-2 px-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 hover:border-rose-500/40 text-rose-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Cerrar Votación
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 relative z-10 flex flex-col gap-6">
        
        {/* Banner: ended */}
        {poll.status === 'ended' && (
          <div className="p-4 bg-slate-900 border border-slate-800 text-slate-400 text-sm rounded-2xl flex items-center gap-3 animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-indigo-400" />
            <div>
              <span className="font-bold text-white">Votación Finalizada.</span> Los resultados mostrados a continuación son definitivos y no se admiten más votos.
              {endedDateObj && <span className="text-xs text-slate-500 block mt-0.5">Cerrada el {endedDateObj.toLocaleString()}</span>}
            </div>
          </div>
        )}

        {/* Poll Header Detail */}
        <div className="p-8 bg-gradient-to-br from-slate-900/65 to-slate-950 border border-slate-900 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {poll.status === 'active' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/25">
                  <span className="w-1 h-1 rounded-full bg-indigo-400 animate-ping" />
                  Activa
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold text-slate-400 bg-slate-950 border border-slate-900">
                  Terminada
                </span>
              )}
              {dateObj && (
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Creada el {dateObj.toLocaleDateString()}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 leading-tight">
              {poll.title}
            </h1>
            
            <p className="text-slate-400 text-sm mt-3 leading-relaxed border-t border-slate-900 pt-3">
              {poll.description || 'Sin descripción adicional para esta votación.'}
            </p>

            <div className="flex items-center gap-3 mt-4 text-xs text-slate-500">
              <span>Por <strong className="text-slate-400">{poll.creatorName}</strong></span>
              <span>&bull;</span>
              <span className="flex items-center gap-1 text-indigo-400">
                <Users className="w-3.5 h-3.5" />
                {totalVotes} {totalVotes === 1 ? 'voto registrado' : 'votos registrados'}
              </span>
            </div>
          </div>
        </div>

        {/* Voting Options Panel */}
        <section className="mt-4">
          <div className="flex items-center gap-2 mb-4">
            {showResults ? (
              <BarChart2 className="w-5 h-5 text-indigo-400" />
            ) : (
              <VoteIcon className="w-5 h-5 text-indigo-400" />
            )}
            <h3 className="text-lg font-bold text-white">
              {showResults ? 'Resultados en Tiempo Real' : 'Elige una de las opciones'}
            </h3>
          </div>

          {showResults ? (
            /* RESULTS SCREEN (Creator OR voted user) */
            <div className="space-y-4">
              {poll.options.map((option) => {
                const votes = voteCounts[option.id] || 0;
                const percent = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                const isSelectedByUser = userVote?.optionId === option.id;

                return (
                  <div 
                    key={option.id}
                    className={`p-5 rounded-2xl border transition-all relative overflow-hidden ${isSelectedByUser ? 'bg-indigo-500/5 border-indigo-500/30' : 'bg-slate-900/30 border-slate-900'}`}
                  >
                    {/* Background Progress bar */}
                    <div 
                      className={`absolute top-0 left-0 bottom-0 pointer-events-none opacity-10 transition-all duration-700 ease-out ${isSelectedByUser ? 'bg-indigo-400' : 'bg-slate-400'}`}
                      style={{ width: `${percent}%` }}
                    />

                    {/* Foreground Content */}
                    <div className="relative flex justify-between items-center gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-white">
                          {option.name}
                        </span>
                        {isSelectedByUser && (
                          <span className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[9px] font-bold rounded-md">
                            Tu Elección
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-2 shrink-0">
                        <span className="text-xs text-slate-500">
                          {votes} {votes === 1 ? 'voto' : 'votos'}
                        </span>
                        <span className="text-lg font-black text-indigo-400">
                          {percent}%
                        </span>
                      </div>
                    </div>

                    {/* Small progress meter indicator line */}
                    <div className="w-full bg-slate-950 h-1 rounded-full mt-3 overflow-hidden relative">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ease-out ${isSelectedByUser ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-slate-700'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* VOTING CHOICE SCREEN (Not voted yet) */
            <div className="space-y-3">
              {poll.options.map((option) => {
                const isSelected = selectedOptionId === option.id;

                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedOptionId(option.id)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${isSelected ? 'bg-indigo-500/10 border-indigo-500 text-white' : 'bg-slate-900/40 border-slate-900 hover:border-slate-800 hover:bg-slate-900/60'}`}
                  >
                    <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                      {option.name}
                    </span>

                    {/* Custom Radio Circle */}
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-700 group-hover:border-slate-650'}`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white animate-in zoom-in duration-100" />}
                    </div>
                  </button>
                );
              })}

              <div className="pt-4">
                <button
                  onClick={handleCastVote}
                  disabled={!selectedOptionId || submittingVote || poll.status === 'ended'}
                  className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-650 hover:to-purple-650 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                  {submittingVote ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Confirmar mi Voto'
                  )}
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Slide Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 py-3.5 px-6 bg-slate-900 border border-indigo-500/20 text-slate-200 text-xs font-semibold rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <ClipboardCheck className="w-4 h-4 text-indigo-400" />
          {toastMessage}
        </div>
      )}
    </div>
  );
};
