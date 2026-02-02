import React from 'react';

const navigation = [
  'Inicio',
  'Identidad',
  'Tono',
  'Simulador',
  'Auditoría',
  'Extensión',
  'Ajustes',
];

const stats = [
  {
    title: 'Estado del proyecto',
    value: 'Base limpia',
    detail: 'React + Vite funcionando sin errores en blanco.',
  },
  {
    title: 'Integración API',
    value: 'Pendiente',
    detail: 'Configurar VITE_OPENAI_API_KEY al reactivar IA.',
  },
  {
    title: 'Contenido base',
    value: 'Recreado',
    detail: 'Dashboard visual con módulos y checklist inicial.',
  },
];

const rebuildSteps = [
  {
    title: 'Conectar tu cuenta',
    description: 'Define un correo y contraseña para activar el panel privado.',
  },
  {
    title: 'Importar perfil',
    description: 'Añade manualmente tu bio, rol y metas del perfil.',
  },
  {
    title: 'Definir tono',
    description: 'Describe la voz y estilo de la marca personal.',
  },
  {
    title: 'Publicar con confianza',
    description: 'Simula posts y revisa recomendaciones antes de lanzar.',
  },
];

const modules = [
  {
    title: 'Identidad',
    description: 'Centraliza biografía, logros clave y objetivos del perfil.',
    status: 'Listo para configurar',
  },
  {
    title: 'Sincronización LinkedIn',
    description: 'Conecta la cuenta y actualiza métricas en tiempo real.',
    status: 'Conectar más adelante',
  },
  {
    title: 'Simulador de posts',
    description: 'Previsualiza publicaciones y variantes de copy.',
    status: 'Disponible',
  },
  {
    title: 'Auditoría rápida',
    description: 'Checklist visual para evaluar perfil y contenido.',
    status: 'Disponible',
  },
];

const App: React.FC = () => {
  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <span className="brand-dot" />
          <div>
            <p className="brand-title">Linqsee</p>
            <p className="brand-subtitle">Control central de contenido LinkedIn</p>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="button ghost">Ver progreso</button>
          <button className="button primary">Recrear proyecto</button>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-section">
            <p className="sidebar-title">Navegación</p>
            <nav className="sidebar-nav">
              {navigation.map((item) => (
                <button key={item} className="sidebar-item">
                  {item}
                </button>
              ))}
            </nav>
          </div>
          <div className="sidebar-card">
            <p className="sidebar-card-title">Checklist de despliegue</p>
            <ul>
              <li>Repositorio conectado</li>
              <li>Build Vite en dist/</li>
              <li>Variables de entorno listas</li>
            </ul>
          </div>
        </aside>

        <main className="content">
          <section className="hero">
            <div>
              <p className="hero-kicker">Panel reiniciado</p>
              <h1>Reconstruimos Linqsee desde cero, paso a paso.</h1>
              <p className="hero-description">
                Este dashboard confirma que el bundle de React funciona, deja visibles los
                módulos principales y te guía para volver a activar cada parte en Vercel.
              </p>
              <div className="hero-actions">
                <button className="button primary">Empezar configuración</button>
                <button className="button ghost">Ver instrucciones Vercel</button>
              </div>
            </div>
            <div className="hero-card">
              <p className="hero-card-title">Estado rápido</p>
              <div className="hero-card-list">
                {stats.map((stat) => (
                  <div key={stat.title} className="hero-stat">
                    <p className="hero-stat-label">{stat.title}</p>
                    <p className="hero-stat-value">{stat.value}</p>
                    <p className="hero-stat-detail">{stat.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="section">
            <div className="section-header">
              <h2>Módulos esenciales</h2>
              <p>Todo lo necesario para relanzar la plataforma rápidamente.</p>
            </div>
            <div className="module-grid">
              {modules.map((module) => (
                <article key={module.title} className="module-card">
                  <h3>{module.title}</h3>
                  <p>{module.description}</p>
                  <span className="chip">{module.status}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="section split">
            <div className="section-card">
              <h3>Checklist de reconstrucción</h3>
              <p>Guía directa para volver a tener la app funcionando al 100%.</p>
              <ol>
                {rebuildSteps.map((step) => (
                  <li key={step.title}>
                    <strong>{step.title}</strong>
                    <span>{step.description}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="section-card accent">
              <h3>Configuración Vercel</h3>
              <ul>
                <li>Build Command: <code>npm run build</code></li>
                <li>Output Directory: <code>dist</code></li>
                <li>Env: <code>VITE_OPENAI_API_KEY</code></li>
              </ul>
              <p>
                Una vez conectado GitHub, redeploy sin cache para asegurar que el bundle de
                Vite se sirve correctamente.
              </p>
              <button className="button ghost">Copiar pasos</button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default App;
