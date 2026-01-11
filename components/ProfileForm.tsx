
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { ToneSelector } from './ToneSelector';

interface ProfileFormProps {
  onSave: (profile: UserProfile) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ onSave }) => {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    expertise: '',
    bio: '',
    tone: 'Professional',
    language: 'Spanish'
  });

  useEffect(() => {
    const saved = localStorage.getItem('user_persona');
    if (saved) setProfile(JSON.parse(saved));
  }, []);

  // Listen for storage changes to update form if sync happens in another component logic
  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('user_persona');
      if (saved) setProfile(JSON.parse(saved));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('user_persona', JSON.stringify(profile));
    onSave(profile);
    alert('Identidad actualizada correctamente.');
  };

  const isSynced = !!profile.lastSync;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 md:p-12 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Tu Identidad Profesional</h2>
          <p className="text-slate-500 font-medium">Esta es la base que usa la IA para comentar por ti.</p>
        </div>
        
        {isSynced ? (
          <div className="flex flex-col items-end">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-black uppercase tracking-wider">
              <i className="fas fa-check-circle"></i> Sincronizado
            </div>
            <span className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">Última vez: {profile.lastSync}</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-400 rounded-full text-xs font-black uppercase tracking-wider">
            <i className="fas fa-clock"></i> Pendiente de Sincronización
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2 group">
          <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-blue-600 transition-colors">Nombre Público</label>
          <input
            type="text"
            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all font-semibold"
            placeholder="Ej: Juan Pérez"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2 group">
          <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-blue-600 transition-colors">Sector / Expertise</label>
          <input
            type="text"
            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all font-semibold"
            placeholder="Ej: Marketing Digital, Ventas B2B"
            value={profile.expertise}
            onChange={(e) => setProfile({ ...profile, expertise: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2 group">
        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-blue-600 transition-colors">Tu Bio (Contexto para la IA)</label>
        <textarea
          className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none h-40 transition-all font-medium leading-relaxed"
          placeholder="Cuenta quién eres y qué has logrado para que la IA tenga argumentos..."
          value={profile.bio}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          required
        />
      </div>

      <div className="space-y-4">
        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tono de Voz Deseado</label>
        <ToneSelector
          value={profile.tone}
          onChange={(tone) => setProfile({ ...profile, tone })}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6 pt-4">
        <div className="flex-1 space-y-2">
           <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Idioma de Respuesta</label>
           <select
             className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold appearance-none cursor-pointer"
             value={profile.language}
             onChange={(e) => setProfile({ ...profile, language: e.target.value })}
           >
             <option value="Spanish">Español</option>
             <option value="English">Inglés</option>
             <option value="Portuguese">Portugués</option>
           </select>
        </div>
        
        <div className="flex-1 flex items-end">
          <button
            type="submit"
            className="w-full h-[60px] bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-95"
          >
            Guardar Cambios <i className="fas fa-save text-sm"></i>
          </button>
        </div>
      </div>
    </form>
  );
};
