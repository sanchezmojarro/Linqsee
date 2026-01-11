
import React, { useState } from 'react';
import { UserProfile, CommentType } from '../types';
import { generateLinkedInComment } from '../services/geminiService';

interface CommentSimulatorProps {
  profile: UserProfile | null;
}

export const CommentSimulator: React.FC<CommentSimulatorProps> = ({ profile }) => {
  const [postContent, setPostContent] = useState('');
  const [generatedComment, setGeneratedComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeType, setActiveType] = useState<CommentType | null>(null);

  const handleGenerate = async (type: CommentType) => {
    if (!profile) {
      alert('Por favor, configura tu perfil primero.');
      return;
    }
    if (!postContent.trim()) {
      alert('Pega el contenido del post de alguien para responder.');
      return;
    }

    setLoading(true);
    setActiveType(type);
    setGeneratedComment('');

    const comment = await generateLinkedInComment({
      profile,
      postContent,
      type
    });

    setGeneratedComment(comment);
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedComment);
    alert('Comentario copiado. ¡Pégalo en LinkedIn!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-full items-start">
      {/* Input Side */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 space-y-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Post de la otra persona</h2>
          <p className="text-slate-500 text-sm mt-1">Pega el post al que quieres responder.</p>
        </div>

        <div className="space-y-4">
          <textarea
            className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl text-sm focus:ring-4 focus:ring-blue-100 outline-none h-64 resize-none transition-all placeholder:text-slate-300 font-medium"
            placeholder="Ej: 'Hoy me he dado cuenta de que el SEO ha muerto...'"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          />
          
          <div className="space-y-4">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Elige tu respuesta estratégica</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { type: CommentType.QUICK, icon: '⚡', label: 'Rápida' },
                { type: CommentType.SHORT, icon: '💡', label: 'Opinión' },
                { type: CommentType.EXTENSIVE, icon: '💎', label: 'Autoridad' }
              ].map((btn) => (
                <button
                  key={btn.type}
                  onClick={() => handleGenerate(btn.type)}
                  disabled={loading}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all group ${
                    activeType === btn.type && loading 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-2xl mb-2 group-hover:scale-125 transition-transform">{btn.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Output Side */}
      <div className="bg-slate-900 rounded-[2rem] shadow-2xl p-8 text-white min-h-[400px] flex flex-col sticky top-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-xs">
               <i className="fas fa-robot"></i>
             </div>
             <span className="text-xs font-black uppercase tracking-widest text-slate-400">Propuesta de Comentario</span>
          </div>
          {generatedComment && (
            <button 
              onClick={copyToClipboard}
              className="text-blue-400 hover:text-blue-300 text-xs font-black flex items-center gap-2"
            >
              <i className="far fa-copy"></i> COPIAR
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-50">
             <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
             <p className="text-sm font-bold text-blue-400">Pensando como {profile?.name || 'experto'}...</p>
          </div>
        ) : generatedComment ? (
          <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-right-4">
             <textarea
               className="w-full bg-transparent text-xl font-medium leading-relaxed resize-none h-full outline-none text-slate-100 placeholder:text-slate-700 italic"
               value={generatedComment}
               onChange={(e) => setGeneratedComment(e.target.value)}
             />
             <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
               <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Estrategia aplicada</p>
               <p className="text-xs text-slate-300 font-medium">
                 {activeType === CommentType.EXTENSIVE 
                   ? "Aportando valor diferencial basado en tu bio y terminando con pregunta de engagement." 
                   : "Validación rápida de autoridad para mantener presencia constante."}
               </p>
             </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center px-10">
             <p className="text-slate-500 font-medium italic">"Selecciona una estrategia a la izquierda para ver el comentario que yo pondría en LinkedIn."</p>
          </div>
        )}
      </div>
    </div>
  );
};
