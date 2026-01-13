
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { AI_ENABLED, auditProfile, EnhancedAuditResult } from '../services/geminiService';

interface ProfileAuditProps {
  profile: UserProfile | null;
  onApplyImprovement: (data: Partial<UserProfile>) => void;
}

export const ProfileAudit: React.FC<ProfileAuditProps> = ({ profile, onApplyImprovement }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EnhancedAuditResult | null>(null);

  const runAudit = async () => {
    if (!profile) return;
    if (!AI_ENABLED) {
      alert("La IA está desactivada. Configura VITE_OPENAI_API_KEY o VITE_GEMINI_API_KEY.");
      return;
    }
    setLoading(true);
    try {
      const data = await auditProfile(profile);
      setResult(data);
    } catch (e) {
      console.error("Audit failed:", e);
      alert("Error auditando el perfil. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string | undefined) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert("Texto copiado al portapapeles. ¡Pégalo en LinkedIn!");
  };

  const applyToPersona = (field: 'expertise' | 'bio', value: string | undefined) => {
    if (!value) return;
    onApplyImprovement({ [field]: value });
    alert(`Se ha actualizado tu ${field === 'expertise' ? 'Titular' : 'Biografía'} en Ghostwriter.`);
  };

  if (!profile) return (
    <div className="p-12 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4 text-2xl">
        <i className="fas fa-id-card"></i>
      </div>
      <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Configura tu perfil para activar el auditor</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Audit Control Card */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-50 overflow-hidden relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">AI Auditor de Autoridad</h2>
            <p className="text-slate-500 font-medium">Analizamos tu perfil y generamos mejoras directas para tu SEO y Marca Personal.</p>
          </div>
          <button 
            onClick={runAudit}
            disabled={loading || !AI_ENABLED}
            className="w-full md:w-auto bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-blue-600 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 shadow-xl shadow-slate-200"
          >
            {loading ? (
              <><div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div> Analizando...</>
            ) : (
              <>Escanear Perfil Real <i className="fas fa-bolt text-yellow-400"></i></>
            )}
          </button>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
      </div>

      {result && (
        <div className="mt-12 space-y-12 animate-in fade-in slide-in-from-top-4 duration-700">
          {/* Dashboard of results */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="bg-slate-950 p-10 rounded-[2.5rem] text-white relative overflow-hidden group">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Social Selling Index (Est.)</span>
                <div className="text-7xl font-black tracking-tighter group-hover:text-blue-400 transition-colors">{result.score}%</div>
                <div className="mt-6 w-full bg-white/10 h-2 rounded-full overflow-hidden">
                   <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${result.score}%` }}></div>
                </div>
                <i className="fas fa-medal absolute right-[-20px] bottom-[-20px] text-9xl text-white/5 group-hover:rotate-12 transition-transform"></i>
             </div>
             
             <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-8 bg-green-50/50 rounded-[2rem] border border-green-100">
                  <h4 className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-4">Fortalezas Identificadas</h4>
                  <ul className="space-y-3">
                    {result.strengths?.map((s, i) => (
                      <li key={i} className="text-sm font-bold text-slate-700 flex gap-2">
                        <i className="fas fa-check-circle text-green-500 mt-0.5"></i> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-8 bg-orange-50/50 rounded-[2rem] border border-orange-100">
                  <h4 className="text-[10px] font-black text-orange-700 uppercase tracking-widest mb-4">Áreas Críticas</h4>
                  <ul className="space-y-3">
                    {result.weaknesses?.map((w, i) => (
                      <li key={i} className="text-sm font-bold text-slate-700 flex gap-2">
                        <i className="fas fa-exclamation-triangle text-orange-500 mt-0.5"></i> {w}
                      </li>
                    ))}
                  </ul>
                </div>
             </div>
          </div>

          {/* Section Editors */}
          <div className="space-y-10">
            <h3 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-3">
              <i className="fas fa-wand-magic-sparkles text-blue-600"></i>
              Optimización por Secciones
            </h3>

            {[
              { id: 'headline', label: 'Titular de LinkedIn (Headline)', data: result.headline, field: 'expertise' as const },
              { id: 'about', label: 'Biografía / Acerca de (About)', data: result.about, field: 'bio' as const },
              { id: 'experience', label: 'Resumen de Experiencia', data: result.experience, field: undefined }
            ].map((section) => (
              <div key={section.id} className="space-y-5 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{section.label}</span>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button 
                      onClick={() => copyToClipboard(section.data?.suggested)}
                      className="flex-1 md:flex-none text-xs font-black text-blue-600 bg-blue-50 px-5 py-2.5 rounded-xl hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                    >
                      <i className="far fa-copy"></i> COPIAR PARA LINKEDIN
                    </button>
                    {section.field && section.data?.suggested && (
                      <button 
                        onClick={() => applyToPersona(section.field, section.data?.suggested)}
                        className="flex-1 md:flex-none text-xs font-black text-green-600 bg-green-50 px-5 py-2.5 rounded-xl hover:bg-green-100 transition-all flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-magic"></i> USAR EN GHOSTWRITER
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                  {/* Current State */}
                  <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-200 opacity-60 flex flex-col relative group">
                    <span className="text-[9px] font-black text-slate-400 uppercase mb-3 block">Estado Actual</span>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed italic flex-1">
                      {section.data?.current || 'No se detectó información previa.'}
                    </p>
                  </div>
                  
                  {/* AI Recommendation */}
                  <div className="p-8 rounded-[2rem] border-2 border-blue-600 bg-white shadow-2xl shadow-blue-50 relative flex flex-col animate-in slide-in-from-bottom-2">
                    <div className="absolute top-0 right-0 px-5 py-2 bg-blue-600 text-white font-black text-[10px] uppercase rounded-bl-[1.5rem] tracking-widest">PROPUESTA OPTIMIZADA</div>
                    <span className="text-[9px] font-black text-blue-400 uppercase mb-4 block">Versión Sugerida</span>
                    <div className="text-sm font-black text-slate-900 leading-relaxed whitespace-pre-wrap flex-1">
                      {section.data?.suggested || 'Analizando...'}
                    </div>
                    
                    <div className="mt-8 pt-8 border-t border-slate-100">
                       <div className="space-y-6">
                          <div>
                             <span className="text-[9px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Análisis de Estrategia</span>
                             <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{section.data?.why || 'Nuestra IA está determinando los puntos clave de autoridad.'}</p>
                          </div>
                          <div className="p-4 bg-slate-900 rounded-2xl">
                             <span className="text-[9px] font-black text-blue-400 uppercase block mb-1 tracking-widest">Dónde pegar esto</span>
                             <p className="text-[11px] text-white font-medium italic">{section.data?.howToApply || 'Copia el texto arriba y pégalo en tu perfil de LinkedIn.'}</p>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Strategic Roadmap */}
          <div className="bg-slate-900 p-12 rounded-[3rem] text-white relative overflow-hidden">
            <div className="relative z-10">
               <h3 className="text-3xl font-black mb-10 tracking-tight">Hoja de Ruta de Autoridad</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {result.suggestions?.map((s, i) => (
                   <div key={i} className="flex gap-6 p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-default group">
                     <div className="w-14 h-14 rounded-2xl bg-blue-600 flex-shrink-0 flex items-center justify-center font-black text-xl group-hover:rotate-12 transition-transform shadow-xl shadow-blue-900/40">
                       {i+1}
                     </div>
                     <div>
                       <h5 className="font-black text-lg mb-2 text-blue-400">{s.title}</h5>
                       <p className="text-sm text-slate-400 font-medium leading-relaxed">{s.description}</p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
            <i className="fas fa-rocket absolute right-[-50px] bottom-[-50px] text-[15rem] text-white/5 -rotate-12"></i>
          </div>
        </div>
      )}

      {!result && !loading && (
        <div className="py-32 text-center space-y-6 opacity-30">
          <div className="w-24 h-24 bg-slate-50 rounded-full mx-auto flex items-center justify-center text-4xl">
            <i className="fas fa-brain"></i>
          </div>
          <p className="font-black uppercase tracking-[0.3em] text-slate-500 text-sm">IA Lista para Escanear</p>
        </div>
      )}
    </div>
  );
};
