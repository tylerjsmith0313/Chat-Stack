
import React, { useState } from 'react';
import { ProvisionAccess } from './ProvisionAccess';
import { initSupabase } from '../lib/supabase';

interface LoginProps {
  onLogin: (name: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const supabase = initSupabase();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('System configuration missing. Please restart installation.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
      } else if (data.user) {
        // Successfully authenticated with Supabase
        const username = data.user.email?.split('@')[0] || 'Operator';
        localStorage.setItem('op_auth', 'true');
        localStorage.setItem('op_name', username);
        onLogin(username);
      }
    } catch (err) {
      setError('An unexpected error occurred during authentication.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-6 font-['Plus_Jakarta_Sans']">
      {isProvisioning ? (
        <ProvisionAccess onCancel={() => setIsProvisioning(false)} />
      ) : (
        <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl w-full max-w-md text-center animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-10 shadow-xl shadow-indigo-100">
            F
          </div>
          <h1 className="text-2xl font-black mb-2 text-slate-900 uppercase tracking-tighter">Command Center</h1>
          <p className="text-slate-400 text-sm mb-10 font-medium uppercase tracking-widest">Operator Authentication</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <input 
                type="email" 
                placeholder="Operator Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none text-center font-medium"
                required
              />
            </div>
            <div className="space-y-1">
              <input 
                type="password" 
                placeholder="Secure Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none text-center font-medium"
                required
              />
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-slate-200 uppercase tracking-widest disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Initialize Session'}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl">
              <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
            </div>
          )}
          
          <div className="mt-10 pt-10 border-t border-slate-100">
            <button 
              onClick={() => setIsProvisioning(true)}
              className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-[0.2em] transition-colors"
            >
              Provision New Access
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
