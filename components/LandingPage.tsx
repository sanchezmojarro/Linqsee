
import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent blur-3xl pointer-events-none"></div>

      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-2xl">
            <i className="fas fa-ghost"></i>
          </div>
          <span className="font-black text-2xl tracking-tighter text-slate-900 underline decoration-blue-500 decoration-4 underline-offset-4">Ghostwriter</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onGetStarted}
            className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors px-4 py-2"
          >
            Iniciar Sesión
          </button>
          <button 
            onClick={onGetStarted}
            className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-sm font-black hover:bg-blue-600 transition-all shadow-2xl shadow-slate-200"
          >
            Únete ahora
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-10">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-slate-50 border border-slate-100 text-slate-500 text-xs font-black tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              The Future of LinkedIn Engagement
            </div>
            
            <h1 className="text-7xl md:text-9xl font-black text-slate-900 tracking-tighter leading-[0.9]">
              Comenta como un <span className="text-blue-600 italic">expert.</span>
            </h1>
            
            <p className="text-2xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed">
              La primera plataforma de <span className="text-slate-900 font-bold">Ghostwriting Estratégico</span> que sincroniza tu voz real para comentar en posts de otros y generar autoridad masiva.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
              <button 
                onClick={onGetStarted}
                className="w-full sm:w-auto px-12 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all"
              >
                Empezar Gratis <i className="fas fa-arrow-right ml-2 text-sm"></i>
              </button>
              <div className="flex -space-x-3 items-center">
                 {[1,2,3,4].map(i => (
                   <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-12 h-12 rounded-full border-4 border-white shadow-lg" alt="User" />
                 ))}
                 <span className="ml-4 text-sm font-bold text-slate-400">+2,000 profesionales</span>
              </div>
            </div>
          </div>

          <div className="mt-48 grid grid-cols-1 md:grid-cols-3 gap-12">
             {[
               { step: '01', title: 'Sync', desc: 'Importamos tu experiencia real de LinkedIn para que la IA no invente nada.' },
               { step: '02', title: 'Audit', desc: 'Nuestra IA analiza tu perfil y te da los "talking points" para destacar.' },
               { step: '03', title: 'Engage', desc: 'Comenta en posts de otros con aportes de valor que atraen visitas a tu perfil.' }
             ].map((f, i) => (
               <div key={i} className="relative group p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-50 hover:border-blue-200 transition-all overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 text-6xl font-black text-slate-50 opacity-10 group-hover:text-blue-50 transition-colors">
                    {f.step}
                  </div>
                  <h3 className="text-2xl font-black mb-4 text-slate-900">{f.title}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-10">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
              <i className="fas fa-ghost"></i>
            </div>
            <span className="font-black text-xl tracking-tighter">GhostwriterAI</span>
         </div>
         <div className="flex gap-10 text-sm font-bold text-slate-400">
            <a href="#" className="hover:text-blue-600">Twitter</a>
            <a href="#" className="hover:text-blue-600">LinkedIn</a>
            <a href="#" className="hover:text-blue-600">Privacy</a>
         </div>
      </footer>
    </div>
  );
};
