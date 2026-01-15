
import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { AuthForm } from './components/AuthForm';
import { ProfileForm } from './components/ProfileForm';
import { CommentSimulator } from './components/CommentSimulator';
import { ProfileAudit } from './components/ProfileAudit';
import { ExtensionBridge } from './components/ExtensionBridge';
import { LinkedInSync } from './components/LinkedInSync';
import { UserProfile, DashboardStats } from './types';
import { AI_ENABLED } from './services/geminiService';

type ViewState = 'landing' | 'auth' | 'dashboard';
type Tab = 'config' | 'audit' | 'simulator' | 'extension';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [activeTab, setActiveTab] = useState<Tab>('config');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    commentsGenerated: 0,
    profileStrength: 0,
    syncStatus: 'disconnected'
  });

  // Persistent Hydration
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('is_authenticated') === 'true';
    const savedProfile = localStorage.getItem('user_persona');

    if (isAuthenticated) {
      setView('dashboard');
    }

    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed);
        updateStats(parsed);
      } catch (e) {
        console.error("Hydration error", e);
      }
    }
  }, []);

  const updateStats = (p: UserProfile) => {
    let strength = 0;
    if (p.name) strength += 10;
    if (p.expertise) strength += 20;
    if (p.bio?.length > 40) strength += 30;
    if (p.bio?.length > 150) strength += 40;
    
    setStats(prev => ({ 
      ...prev, 
      profileStrength: Math.min(strength, 100),
      syncStatus: p.lastSync ? 'connected' : 'disconnected'
    }));
  };

  const handleLoginSuccess = () => {
    localStorage.setItem('is_authenticated', 'true');
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('is_authenticated');
    // Keeping profile for a better "Demo" feel, but normally you'd clear it
    setView('landing');
  };

  const handleProfileSave = (newProfile: UserProfile) => {
    setProfile(newProfile);
    updateStats(newProfile);
    localStorage.setItem('user_persona', JSON.stringify(newProfile));
  };

  const handleSyncData = (partial: Partial<UserProfile>) => {
    const updated: UserProfile = {
      name: partial.name || profile?.name || '',
      expertise: partial.expertise || profile?.expertise || '',
      bio: partial.bio || profile?.bio || '',
      tone: partial.tone || profile?.tone || 'Professional',
      language: partial.language || profile?.language || 'Spanish',
      linkedInUrl: partial.linkedInUrl || profile?.linkedInUrl,
      lastSync: partial.lastSync || profile?.lastSync,
      email: partial.email || profile?.email,
      phone: partial.phone || profile?.phone,
      skills: partial.skills || profile?.skills,
      experience: partial.experience || profile?.experience,
      education: partial.education || profile?.education
    };
    handleProfileSave(updated);
  };

  const handleDisconnect = () => {
    if (!profile) return;
    const updated: UserProfile = {
      ...profile,
      linkedInUrl: undefined,
      lastSync: undefined
    };
    handleProfileSave(updated);
  };

  if (view === 'landing') return <LandingPage onGetStarted={() => setView('auth')} />;
  if (view === 'auth') return <AuthForm onSuccess={handleLoginSuccess} />;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f9fafb]">
      {/* Premium Vertical Sidebar */}
      <aside className="w-full lg:w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm sticky top-0 h-screen overflow-y-auto z-40">
        <div className="p-10 border-b border-slate-50 flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-slate-200">
            <i className="fas fa-ghost text-xl"></i>
          </div>
          <div>
            <h1 className="font-black text-slate-900 text-xl tracking-tighter leading-none">Ghostwriter</h1>
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em]">IA Strat Lab</span>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-4">
          {[
            { id: 'config', icon: 'fa-user-gear', label: 'Persona AI' },
            { id: 'audit', icon: 'fa-shield-halved', label: 'Auditoría' },
            { id: 'simulator', icon: 'fa-vial-circle-check', label: 'Laboratorio' },
            { id: 'extension', icon: 'fa-puzzle-piece', label: 'LinkedIn Plug' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`w-full flex items-center space-x-4 p-5 rounded-2xl font-black text-sm transition-all duration-300 ${
                activeTab === tab.id 
                ? 'bg-slate-900 text-white shadow-2xl shadow-slate-200 translate-x-1' 
                : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <i className={`fas ${tab.icon} w-6 text-lg`}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8 mt-auto border-t border-slate-50 bg-slate-50/30">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Setup IQ</span>
              <span className={`text-xs font-black ${stats.profileStrength > 70 ? 'text-green-600' : 'text-orange-500'}`}>{stats.profileStrength}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${stats.profileStrength > 70 ? 'bg-green-500' : 'bg-blue-600'}`} 
                style={{ width: `${stats.profileStrength}%` }}
              ></div>
            </div>
            <button onClick={handleLogout} className="w-full py-3 text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors border border-dashed border-slate-200 rounded-xl hover:border-red-200">
               Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main Experience Area */}
      <main className="flex-1 p-6 lg:p-14 overflow-y-auto w-full">
        {!AI_ENABLED && (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900 shadow-sm">
            <p className="text-sm font-semibold">
              ⚠️ IA desactivada: configura <span className="font-black">VITE_OPENAI_API_KEY</span>. La interfaz
              funciona, pero las funciones de IA están deshabilitadas.
            </p>
          </div>
        )}
        <header className="mb-14 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-1">
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter">
              {activeTab === 'config' && 'Tu Identidad AI'}
              {activeTab === 'simulator' && 'Laboratorio de Engagement'}
              {activeTab === 'audit' && 'Auditor de Autoridad'}
              {activeTab === 'extension' && 'Ghostwriter Connect'}
            </h2>
            <p className="text-slate-400 font-bold text-lg">
              {activeTab === 'config' && 'Sincroniza y define quién eres profesionalmente.'}
              {activeTab === 'simulator' && 'Prueba tus respuestas estratégicas antes de publicar.'}
              {activeTab === 'audit' && 'Optimiza tu perfil de LinkedIn sección por sección.'}
              {activeTab === 'extension' && 'Conecta tu Ghostwriter directamente al feed.'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all ${stats.syncStatus === 'connected' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-600'}`}>
                <div className={`w-3 h-3 rounded-full ${stats.syncStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-xs font-black uppercase tracking-widest">
                  {stats.syncStatus === 'connected' ? 'LinkedIn Sincronizado' : 'Sin Sincronizar'}
                </span>
             </div>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 max-w-7xl">
          {activeTab === 'config' && (
            <div className="space-y-12">
               <LinkedInSync isSynced={!!profile?.lastSync} onSync={handleSyncData} onDisconnect={handleDisconnect} />
               <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                  <div className="xl:col-span-2">
                     <ProfileForm onSave={handleProfileSave} />
                  </div>
                  <div className="space-y-8">
                    <div className="bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                      <div className="relative z-10 text-white">
                        <h3 className="font-black text-blue-400 mb-6 uppercase text-[10px] tracking-[0.3em]">IA Strategist</h3>
                        <p className="text-lg font-medium leading-relaxed italic opacity-90">
                          {profile?.name 
                            ? `Hola ${profile.name.split(' ')[0]}, basándome en tu bio, deberías usar un tono '${profile.tone}' para maximizar tus impresiones en LinkedIn. ¿Quieres que auditemos tu titular ahora?` 
                            : 'Hola. Una vez sincronices tu cuenta de LinkedIn, podré darte consejos específicos sobre cómo mejorar tu autoridad online.'}
                        </p>
                      </div>
                      <i className="fas fa-brain absolute right-[-40px] top-[-40px] text-[12rem] text-white/5 group-hover:opacity-10 transition-opacity"></i>
                    </div>
                  </div>
               </div>
            </div>
          )}
          {activeTab === 'simulator' && <CommentSimulator profile={profile} />}
          {activeTab === 'audit' && <ProfileAudit profile={profile} onApplyImprovement={handleSyncData} />}
          {activeTab === 'extension' && <ExtensionBridge />}
        </div>
      </main>
    </div>
  );
};

export default App;
