
import React, { useState, useEffect } from 'react';
import { OperatorPortal } from './components/OperatorPortal';
import { ChatWidget } from './components/ChatWidget';
import { Login } from './components/Login';
import { InstallationWizard } from './components/InstallationWizard';
import { Operator } from './types';
import { initSupabase, getSupabaseConfig } from './lib/supabase';

const App: React.FC = () => {
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [view, setView] = useState<'portal' | 'widget_demo'>('portal');
  const supabase = initSupabase();
  const config = getSupabaseConfig();

  const searchParams = new URLSearchParams(window.location.search);
  const isWidgetMode = searchParams.get('mode') === 'widget';

  useEffect(() => {
    const installed = localStorage.getItem('flourish_installed') === 'true';
    setIsInstalled(installed);

    if (isWidgetMode) return;

    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setOperator({ 
            username: session.user.email?.split('@')[0] || 'Operator', 
            email: session.user.email || '', 
            status: 'online' 
          });
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setOperator({ 
            username: session.user.email?.split('@')[0] || 'Operator', 
            email: session.user.email || '', 
            status: 'online' 
          });
        } else if (event === 'SIGNED_OUT') {
          setOperator(null);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [isWidgetMode]);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('op_auth');
    localStorage.removeItem('op_name');
    setOperator(null);
  };

  const generateEmbedCode = () => {
    const host = window.location.origin;
    return `<script src="${host}/widget-loader.js" async></script>`;
  };

  if (isWidgetMode) {
    return (
      <div className="fixed inset-0 flex items-end justify-end p-4 pointer-events-none">
        <div className="pointer-events-auto">
          <ChatWidget />
        </div>
      </div>
    );
  }

  if (isInstalled === null) return null;

  if (!isInstalled) {
    return <InstallationWizard onComplete={() => setIsInstalled(true)} />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden font-['Plus_Jakarta_Sans'] bg-slate-50">
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex bg-white/90 backdrop-blur-xl p-1 rounded-full shadow-2xl border border-slate-200">
        <button
          onClick={() => setView('portal')}
          className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
            view === 'portal' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'
          }`}
        >
          Portal
        </button>
        <button
          onClick={() => setView('widget_demo')}
          className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
            view === 'widget_demo' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'
          }`}
        >
          Launch Setup
        </button>
      </div>

      {view === 'portal' ? (
        operator ? (
          <OperatorPortal operator={operator} onLogout={handleLogout} />
        ) : (
          <Login onLogin={(name) => setOperator({ username: name, email: '', status: 'online' })} />
        )
      ) : (
        <div className="flex flex-col md:flex-row h-screen bg-slate-950 overflow-hidden">
          <div className="flex-1 p-12 overflow-y-auto text-white flex flex-col justify-center">
            <div className="max-w-2xl">
              <h1 className="text-6xl font-black italic tracking-tighter mb-4 text-indigo-500 uppercase">Connect Site</h1>
              <p className="text-slate-400 font-medium mb-12 leading-relaxed text-lg max-w-lg">
                Your backend is synced to Simply Flourish Space. Add the transmission line to your site to begin priority partner verification.
              </p>
              
              <div className="space-y-10">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-4">Production Snippet</h3>
                  <div className="relative group">
                    <pre className="bg-black p-8 rounded-[2rem] border border-white/10 text-sm font-mono text-emerald-400 overflow-x-auto shadow-2xl leading-relaxed">
                      {generateEmbedCode()}
                    </pre>
                    <button 
                      onClick={() => navigator.clipboard.writeText(generateEmbedCode())}
                      className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase backdrop-blur-md transition-all active:scale-95"
                    >
                      Copy Script
                    </button>
                  </div>
                </div>

                <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4">Critical Deployment Step</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Ensure the <strong>widget-loader.js</strong> file is located in your project's <code>/public</code> folder. This allows your landing page to find the script at <code>{window.location.origin}/widget-loader.js</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-[550px] bg-slate-900 flex items-center justify-center p-12 border-l border-white/5 relative bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950">
             <ChatWidget />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
