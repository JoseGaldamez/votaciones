import React from 'react';
import { Share2, CheckCircle, Calendar } from 'lucide-react';
import { type Poll } from '../services/pollService';

interface PollCardProps {
  poll: Poll;
  currentUserId: string | undefined;
  onShare: (pollId: string, e: React.MouseEvent) => void;
  onClosePoll: (pollId: string, e: React.MouseEvent) => void;
  onNavigate: (pollId: string) => void;
}

export const PollCard: React.FC<PollCardProps> = ({
  poll,
  currentUserId,
  onShare,
  onClosePoll,
  onNavigate,
}) => {
  const isCreator = currentUserId === poll.creatorId;
  const dateObj = poll.createdAt?.seconds ? new Date(poll.createdAt.seconds * 1000) : null;

  return (
    <div 
      onClick={() => onNavigate(poll.id)}
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
            onClick={(e) => onShare(poll.id, e)}
            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-colors cursor-pointer"
            title="Compartir enlace de votación"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {isCreator && poll.status === 'active' && (
            <button
              onClick={(e) => onClosePoll(poll.id, e)}
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
};
