
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

  useEffect(() => {
    // Check if system is installed
    const installed = localStorage.getItem('flourish_installed') === 'true';
    setIsInstalled(installed);

    // Initial session check
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

      // Listen for auth changes
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
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('op_auth');
    localStorage.removeItem('op_name');
    setOperator(null);
  };

  const generateEmbedCode = () => {
    const domain = config?.bluehostDomain || 'your-bluehost-domain.com';
    return `
<!-- Flourish Chat Widget -->
<script>
  (function(w,d,s,u) {
    var f=d.getElementsByTagName(s)[0],j=d.createElement(s);
    j.async=true; j.src=u; f.parentNode.insertBefore(j,f);
  })(window,document,'script','https://${domain}/widget-loader.js');
</script>
<!-- Note: Ensure you upload your build to Bluehost public_html -->
    `.trim();
  };

  if (isInstalled === null) return null;

  if (!isInstalled) {
    return <InstallationWizard onComplete={() => setIsInstalled(true)} />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden font-['Plus_Jakarta_Sans']">
      {/* View Switcher */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex bg-white/80 backdrop-blur-md p-1 rounded-full shadow-lg border border-slate-200">
        <button
          onClick={() => setView('portal')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
            view === 'portal' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Portal
        </button>
        <button
          onClick={() => setView('widget_demo')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
            view === 'widget_demo' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Widget Demo
        </button>
      </div>

      {view === 'portal' ? (
        operator ? (
          <OperatorPortal operator={operator} onLogout={handleLogout} />
        ) : (
          <Login onLogin={(name) => setOperator({ username: name, email: '', status: 'online' })} />
        )
      ) : (
        <div className="flex flex-col md:flex-row h-screen bg-slate-900 overflow-hidden">
          {/* Documentation / Snippet Section */}
          <div className="flex-1 p-12 overflow-y-auto text-white flex flex-col justify-center">
            <div className="max-w-xl">
              <h1 className="text-4xl font-black italic tracking-tighter mb-4">WIDGET DEMO</h1>
              <p className="text-slate-400 font-medium mb-10 leading-relaxed">
                This is how the widget appears to your visitors. It connects directly to your Supabase instance, meaning data is persistent and secure.
              </p>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-4">Installation Snippet</h3>
                  <div className="relative group">
                    <pre className="bg-black/50 p-6 rounded-3xl border border-white/10 text-[10px] font-mono text-emerald-400 overflow-x-auto">
                      {generateEmbedCode()}
                    </pre>
                    <button 
                      onClick={() => navigator.clipboard.writeText(generateEmbedCode())}
                      className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase"
                    >
                      Copy Snippet
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Bluehost Deployment</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    1. Upload the <code>dist/</code> contents to <code>public_html</code> on Bluehost.<br/>
                    2. Add the snippet above to your website's <code>&lt;head&gt;</code> or footer.<br/>
                    3. The widget will automatically sync with your portal.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview Section */}
          <div className="w-full md:w-[450px] bg-slate-800/50 flex items-center justify-center p-12 border-l border-white/5 relative">
             <div className="text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                   <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                   </svg>
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Interactive Preview</p>
             </div>
             <ChatWidget />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
