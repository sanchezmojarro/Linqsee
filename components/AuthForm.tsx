
import React, { useState } from 'react';

interface AuthFormProps {
  onSuccess: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl">
            <i className="fas fa-ghost text-2xl"></i>
          </div>
          <h2 className="text-3xl font-black text-slate-900">{isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}</h2>
          <p className="text-slate-500 mt-2 font-medium">Empieza a comentar como un experto.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
             <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Nombre Completo</label>
                <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Juan Pérez" />
             </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email Profesional</label>
            <input required type="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="juan@empresa.com" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Contraseña</label>
            <input required type="password" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="••••••••" />
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 mt-4">
            {isLogin ? 'Iniciar Sesión' : 'Registrarse ahora'}
          </button>
        </form>

        <div className="text-center pt-4">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};
