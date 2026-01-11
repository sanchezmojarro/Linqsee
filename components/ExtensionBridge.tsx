
import React from 'react';

export const ExtensionBridge: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <i className="fas fa-puzzle-piece text-blue-600"></i>
          Configuración de la Extensión
        </h2>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="text-xs font-bold text-blue-700 uppercase mb-2">Tu Secret Key</div>
              <div className="flex items-center justify-between bg-white p-2 border border-blue-200 rounded font-mono text-sm">
                <span>GHOST-9283-X1L-2025</span>
                <button className="text-blue-600 hover:text-blue-800"><i className="far fa-copy"></i></button>
              </div>
              <p className="text-[10px] text-blue-500 mt-2 italic">Usa esta clave en la extensión de Chrome para sincronizar tu Persona AI.</p>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-gray-800 text-sm">Instrucciones de Instalación:</h3>
              <ol className="text-xs text-gray-600 space-y-2 list-decimal list-inside">
                <li>Descarga el paquete de la extensión <span className="font-bold text-blue-600">(ghostwriter.zip)</span>.</li>
                <li>Ve a <code className="bg-gray-100 px-1">chrome://extensions</code> y activa el "Modo Desarrollador".</li>
                <li>Arrastra el archivo y haz clic en el icono de Ghostwriter.</li>
                <li>Pega tu Secret Key y ¡listo!</li>
              </ol>
            </div>
          </div>

          <div className="flex-1 bg-gray-100 rounded-lg p-4 border border-gray-200 relative min-h-[200px]">
             <div className="absolute top-0 left-0 w-full h-8 bg-[#0a66c2] flex items-center px-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                </div>
                <div className="mx-auto text-[8px] text-white/70">linkedin.com/feed/</div>
             </div>
             
             <div className="mt-10 p-2 space-y-2">
                <div className="h-2 w-2/3 bg-gray-300 rounded"></div>
                <div className="h-2 w-full bg-gray-200 rounded"></div>
                <div className="h-10 w-full bg-white border border-gray-300 rounded-lg p-2 flex items-center justify-between">
                   <span className="text-[10px] text-gray-400">Escribe un comentario...</span>
                   <div className="flex gap-1">
                      <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-[10px] text-white shadow-lg animate-bounce">
                        <i className="fas fa-ghost"></i>
                      </div>
                   </div>
                </div>
             </div>

             <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 hover:opacity-100 transition-opacity">
                <div className="bg-white p-2 rounded shadow-xl border border-gray-100 text-[10px] font-bold text-blue-600">
                  VISTA PREVIA DE LA EXTENSIÓN
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
