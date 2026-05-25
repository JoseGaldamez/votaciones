import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto selection:bg-indigo-500 selection:text-white">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-slate-900/95 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          {/* Warning Icon Badge */}
          <div className={`p-3.5 rounded-2xl mb-4 ${isDestructive ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}`}>
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>

          <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
          <p className="text-slate-400 text-xs mt-2.5 leading-relaxed px-2">
            {message}
          </p>
        </div>

        {/* Action buttons */}
        <div className="mt-6 pt-4 flex gap-3 border-t border-slate-800/40">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 font-semibold rounded-xl text-slate-300 text-xs transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-3 px-4 text-white font-bold rounded-xl text-xs transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-lg ${
              isDestructive 
                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/10' 
                : 'bg-indigo-500 hover:bg-indigo-650 shadow-indigo-500/10'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
