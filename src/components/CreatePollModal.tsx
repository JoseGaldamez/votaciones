import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { createPoll } from '../services/pollService';
import { X, Plus, Trash2 } from 'lucide-react';

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePollModal: React.FC<CreatePollModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!title.trim()) {
      setError('Por favor, ingresa un título para la votación.');
      return;
    }
    const cleanOptions = options.map(opt => opt.trim()).filter(Boolean);
    if (cleanOptions.length < 2) {
      setError('Debes ingresar al menos 2 opciones válidas.');
      return;
    }

    if (!user) {
      setError('Debes iniciar sesión para crear una votación.');
      return;
    }

    setLoading(true);
    try {
      await createPoll(
        title.trim(),
        description.trim(),
        user.uid,
        user.displayName || 'Usuario de Google',
        user.email || '',
        cleanOptions
      );
      
      // Reset form
      setTitle('');
      setDescription('');
      setOptions(['', '']);
      onClose();
    } catch (err) {
      console.error('Error creating poll:', err);
      setError('Ocurrió un error al crear la votación. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto selection:bg-indigo-500 selection:text-white">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-slate-900/95 border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white">Nueva Votación</h3>
          <p className="text-slate-400 text-sm mt-1">Completa los campos para abrir un nuevo debate en tiempo real.</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-2xl animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Título de la votación</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="¿Qué almorzamos hoy? o ¿Qué feature priorizamos?"
              maxLength={100}
              className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white placeholder-slate-500 outline-none transition-colors"
            />
          </div>

          {/* Description input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Descripción (Opcional)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Añade un poco de contexto para guiar a los votantes..."
              rows={3}
              maxLength={250}
              className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white placeholder-slate-500 outline-none resize-none transition-colors"
            />
          </div>

          {/* Options Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Opciones de votación</label>
              <button
                type="button"
                onClick={handleAddOption}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir opción
              </button>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {options.map((option, idx) => (
                <div key={idx} className="flex items-center gap-2 group">
                  <span className="text-xs font-bold text-slate-500 w-4">{idx + 1}.</span>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Opción ${idx + 1}`}
                    maxLength={60}
                    className="flex-1 px-4 py-2.5 bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl text-white placeholder-slate-600 outline-none transition-colors"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-2.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex gap-3 border-t border-slate-800/40">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 font-semibold rounded-2xl text-slate-300 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-650 hover:to-purple-650 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Crear Votación'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
