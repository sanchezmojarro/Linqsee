
import React, { useEffect, useState, useRef } from 'react';
import { AI_ENABLED, parseLinkedInData } from '../services/geminiService';
import { UserProfile } from '../types';

interface LinkedInSyncProps {
  isSynced: boolean;
  onSync: (data: Partial<UserProfile>) => void;
  onDisconnect: () => void;
}

export const LinkedInSync: React.FC<LinkedInSyncProps> = ({ isSynced, onSync, onDisconnect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [syncStep, setSyncStep] = useState<'initial' | 'oauth' | 'loading' | 'success'>('initial');
  const [rawText, setRawText] = useState('');
  const [syncedDataPreview, setSyncedDataPreview] = useState<Partial<UserProfile> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPdfJs = async () => {
    if ((window as any).pdfjsLib) return (window as any).pdfjsLib;
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.min.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('No se pudo cargar PDF.js.'));
      document.head.appendChild(script);
    });
    return (window as any).pdfjsLib;
  };

  const extractPdfText = async (file: File) => {
    const pdfjsLib = await loadPdfJs();
    if (!pdfjsLib) {
      throw new Error("PDF.js no está disponible.");
    }

    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.worker.min.js";
    }

    const arrayBuffer = await file.arrayBuffer();
    let pdf;
    try {
      pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    } catch (error) {
      console.warn("PDF.js worker failed, retrying without worker.", error);
      pdf = await pdfjsLib.getDocument({ data: arrayBuffer, disableWorker: true }).promise;
    }
    let text = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => ("str" in item ? item.str : ""))
        .join(" ");
      text += `${pageText}\n`;
    }

    return text.trim();
  };

  const startOAuthFlow = () => {
    window.location.href = '/api/linkedin/auth';
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const linkedInStatus = params.get('linkedin');
    if (!linkedInStatus) return;

    if (linkedInStatus === 'success') {
      setSyncStep('loading');
      setIsOpen(true);
      fetch('/api/linkedin/me', { credentials: 'include' })
        .then((res) => {
          if (!res.ok) throw new Error('LinkedIn profile fetch failed');
          return res.json();
        })
        .then(async (data) => {
          const baseSynced = {
            name: data.name || '',
            expertise: data.headline || '',
            bio: data.bio || '',
            tone: 'Professional',
            language: 'Spanish',
            linkedInUrl: data.profileUrl,
            lastSync: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          if (AI_ENABLED && (!baseSynced.expertise || !baseSynced.bio)) {
            const rawText = JSON.stringify(data.raw ?? data, null, 2);
            try {
              const aiData = await parseLinkedInData(rawText);
              baseSynced.name = baseSynced.name || aiData.name || '';
              baseSynced.expertise = baseSynced.expertise || aiData.expertise || '';
              baseSynced.bio = baseSynced.bio || aiData.bio || '';
              baseSynced.tone = aiData.tone || baseSynced.tone;
              baseSynced.language = aiData.language || baseSynced.language;
            } catch (error) {
              console.warn('No se pudo enriquecer el perfil con IA.', error);
            }
          }

          setSyncedDataPreview(baseSynced);
          onSync(baseSynced);
          setSyncStep('success');
          setTimeout(() => {
            setIsOpen(false);
            setSyncStep('initial');
            setSyncedDataPreview(null);
          }, 3000);
        })
        .catch(() => {
          alert('No se pudo obtener el perfil de LinkedIn. Inténtalo de nuevo.');
          setSyncStep('initial');
        })
        .finally(() => {
          params.delete('linkedin');
          window.history.replaceState({}, '', window.location.pathname);
        });
    } else if (linkedInStatus === 'error') {
      alert('La conexión con LinkedIn falló. Revisa permisos y vuelve a intentarlo.');
      params.delete('linkedin');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [onSync]);

  const handleManualSync = async () => {
    if (!AI_ENABLED) {
      alert("La IA está desactivada. Configura VITE_OPENAI_API_KEY.");
      return;
    }
    if (!rawText.trim()) return;
    setSyncStep('loading');
    try {
      const data = await parseLinkedInData(rawText);
      const dataWithTimestamp = { ...data, lastSync: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setSyncedDataPreview(dataWithTimestamp);
      onSync(dataWithTimestamp);
      setSyncStep('success');
      setTimeout(() => {
        setIsOpen(false);
        setSyncStep('initial');
        setSyncedDataPreview(null);
      }, 3000);
    } catch (e) {
      alert("Error analizando los datos.");
      setSyncStep('initial');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!AI_ENABLED) {
        alert("La IA está desactivada. Configura VITE_OPENAI_API_KEY.");
        return;
      }
      setSyncStep('loading');
      setIsOpen(true);
      extractPdfText(file)
        .then(async (extractedText) => {
          if (!extractedText.trim()) {
            throw new Error('No text extracted from PDF');
          }
          const data = await parseLinkedInData(extractedText);
          const dataWithTimestamp = {
            ...data,
            lastSync: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setSyncedDataPreview(dataWithTimestamp);
          onSync(dataWithTimestamp);
          setSyncStep('success');
          setTimeout(() => {
            setIsOpen(false);
            setSyncStep('initial');
            setSyncedDataPreview(null);
          }, 3000);
        })
        .catch((error) => {
          console.error('PDF parse failed', error);
          alert('No se pudo procesar el PDF. Inténtalo de nuevo.');
          setSyncStep('initial');
        });
    }
  };

  return (
    <div className="mb-10">
      {!isOpen ? (
        <div className="bg-white p-2 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100 group">
          <div className="flex flex-col md:flex-row items-center justify-between p-6 gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-[#0a66c2] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100 group-hover:scale-105 transition-transform">
                <i className="fab fa-linkedin-in text-3xl"></i>
              </div>
              <div>
                <h3 className="font-black text-xl text-slate-900 tracking-tight">Sincronización con LinkedIn</h3>
                <p className="text-slate-500 text-sm font-medium">Vincula tu cuenta para que la IA aprenda tu voz real.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-50 text-slate-600 px-6 py-3.5 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all flex items-center gap-2 border border-slate-200"
              >
                <i className="fas fa-file-pdf"></i> Subir PDF
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileUpload} />
              {isSynced ? (
                <button
                  onClick={() => {
                    fetch('/api/linkedin/logout', { method: 'POST' }).finally(() => {
                      onDisconnect();
                    });
                  }}
                  className="bg-white text-slate-700 px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all shadow-sm border border-slate-200 flex items-center gap-2"
                >
                  Desvincular
                  <i className="fas fa-unlink text-[10px]"></i>
                </button>
              ) : (
                <button 
                  onClick={() => setIsOpen(true)}
                  className="bg-[#0a66c2] text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-[#004182] transition-all shadow-xl shadow-blue-100 flex items-center gap-2"
                >
                  Vincular LinkedIn
                  <i className="fas fa-lock text-[10px]"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
            {syncStep === 'initial' && (
              <div className="p-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Vincular Cuenta</h3>
                    <p className="text-slate-500 font-medium">Elige cómo quieres que Ghostwriter lea tu perfil.</p>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-slate-500 transition-colors">
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <button 
                    onClick={startOAuthFlow}
                    className="w-full flex items-center gap-5 p-6 rounded-3xl border-2 border-blue-50 hover:border-blue-200 hover:bg-blue-50/50 transition-all group text-left"
                  >
                    <div className="w-14 h-14 bg-[#0a66c2] rounded-xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform">
                      <i className="fab fa-linkedin-in"></i>
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-slate-800">Conexión Directa (OAuth)</p>
                      <p className="text-xs text-slate-500 font-medium italic">Acceso oficial a tu información profesional.</p>
                    </div>
                    <i className="fas fa-chevron-right text-slate-300"></i>
                  </button>

                  <div className="relative group p-6 rounded-3xl border-2 border-dashed border-slate-200 hover:border-blue-200 transition-all text-center">
                    <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} />
                    <div className="space-y-2 pointer-events-none">
                      <i className="fas fa-cloud-upload-alt text-2xl text-slate-300"></i>
                      <p className="font-bold text-slate-700">Importar desde PDF de Perfil</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">LinkedIn → Guardar como PDF</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-4">O pega tu biografía manualmente</p>
                  <textarea 
                    className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    placeholder="Pega aquí el contenido de tu sección 'Acerca de'..."
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                  />
                  <button 
                    disabled={!rawText.trim() || !AI_ENABLED}
                    onClick={handleManualSync}
                    className="w-full mt-4 bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-blue-600 disabled:opacity-30 transition-all"
                  >
                    Sincronizar Texto
                  </button>
                </div>
              </div>
            )}

            {syncStep === 'oauth' && (
              <div className="animate-in slide-in-from-right-4 duration-500">
                <div className="bg-[#0a66c2] p-8 text-white flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <i className="fab fa-linkedin text-3xl"></i>
                      <span className="font-bold tracking-tight">LinkedIn Authorization</span>
                   </div>
                   <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center text-xs">ES</div>
                </div>
                <div className="p-10 space-y-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-6 mb-8">
                      <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-white shadow-lg overflow-hidden flex items-center justify-center">
                         <i className="fas fa-user text-slate-300 text-3xl"></i>
                      </div>
                      <i className="fas fa-exchange-alt text-slate-300 text-xl"></i>
                      <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-2xl shadow-xl">
                        <i className="fas fa-ghost"></i>
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight">GhostwriterAI solicita permisos</h3>
                    <p className="text-slate-500 mt-2 font-medium">Permite que GhostwriterAI acceda a tu información de LinkedIn para configurar tu Persona AI.</p>
                  </div>
                  
                  <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                    <div className="flex items-start gap-3">
                      <i className="fas fa-check-circle text-[#0a66c2] mt-1"></i>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Uso de tu nombre y titular</p>
                        <p className="text-xs text-slate-500">Para personalizar el panel de control.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="fas fa-check-circle text-[#0a66c2] mt-1"></i>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Lectura de Biografía</p>
                        <p className="text-xs text-slate-500">Para entrenar el tono de voz de tus comentarios.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setSyncStep('initial')} className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors">Cancelar</button>
                    <button onClick={startOAuthFlow} className="flex-1 bg-[#0a66c2] text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-[#004182] transition-all">Permitir Acceso</button>
                  </div>
                </div>
              </div>
            )}

            {syncStep === 'loading' && (
              <div className="p-24 text-center space-y-8 animate-in fade-in duration-500">
                <div className="relative w-28 h-28 mx-auto">
                   <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <i className="fab fa-linkedin-in text-4xl text-blue-600"></i>
                   </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Sincronizando identidad...</h3>
                  <p className="text-slate-400 font-medium mt-2 italic">Ghostwriter está aprendiendo de tu perfil profesional.</p>
                </div>
              </div>
            )}

            {syncStep === 'success' && syncedDataPreview && (
              <div className="p-10 space-y-8 animate-in zoom-in-95 duration-500">
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-500 rounded-full mx-auto flex items-center justify-center text-white text-3xl shadow-2xl shadow-green-100 mb-6">
                    <i className="fas fa-check"></i>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">¡Sincronización Exitosa!</h3>
                  <p className="text-slate-500 font-medium">Hemos importado los siguientes datos de tu perfil:</p>
                </div>

                <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-200 space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-white overflow-hidden shadow-sm flex items-center justify-center text-slate-400">
                        <i className="fas fa-user text-2xl"></i>
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-lg">{syncedDataPreview.name}</h4>
                        <p className="text-blue-600 font-bold text-xs uppercase tracking-wider">{syncedDataPreview.expertise}</p>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Biografía Detectada</span>
                      <p className="text-sm text-slate-600 leading-relaxed italic line-clamp-3">"{syncedDataPreview.bio}"</p>
                   </div>
                </div>
                
                <p className="text-center text-xs text-slate-400 animate-pulse font-bold">Cerrando ventana y actualizando panel...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
