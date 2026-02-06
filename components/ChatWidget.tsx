
import React, { useState, useEffect, useRef } from 'react';
import { SenderType, Message } from '../types';
import { initSupabase } from '../lib/supabase';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [email, setEmail] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [userUid, setUserUid] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = initSupabase();

  useEffect(() => {
    const savedUid = localStorage.getItem('flourish_client_uid');
    const savedEmail = localStorage.getItem('flourish_client_email');
    if (savedUid && savedEmail) {
      setUserUid(savedUid);
      setEmail(savedEmail);
      setIsRegistered(true);
    }
  }, []);

  // Communicate with the parent window loader
  useEffect(() => {
    const status = isOpen ? 'flourish-widget-opened' : 'flourish-widget-closed';
    window.parent.postMessage(status, '*');
  }, [isOpen]);

  useEffect(() => {
    if (!userUid || !supabase || !isOpen) return;

    const fetchHistory = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', userUid)
        .order('timestamp', { ascending: true });
      if (data) setMessages(data);
    };

    fetchHistory();

    const channel = supabase
      .channel(`chat_${userUid}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `session_id=eq.${userUid}` 
      }, payload => {
        setMessages(prev => {
          if (prev.some(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new as Message];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userUid, isOpen, supabase]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isRegistered]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !supabase) return;

    const newUid = `sf_launch_${Math.random().toString(36).substr(2, 9)}`;
    
    const { error } = await supabase.from('leads').insert([{
      uid: newUid,
      name: email.split('@')[0],
      email,
      created_at: new Date().toISOString()
    }]);

    if (!error) {
      localStorage.setItem('flourish_client_uid', newUid);
      localStorage.setItem('flourish_client_email', email);
      setUserUid(newUid);
      setIsRegistered(true);
      
      await supabase.from('messages').insert([{
        session_id: newUid,
        sender_id: 'system',
        sender_type: SenderType.OPERATOR,
        message_text: `Launch transmission initiated. Priority verification secured for ${email}. Opening secure stream to the main office.`,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !userUid || !supabase) return;
    
    const text = inputText;
    setInputText('');

    await supabase.from('messages').insert([{
      session_id: userUid,
      sender_id: userUid,
      sender_type: SenderType.CLIENT,
      message_text: text,
      timestamp: new Date().toISOString()
    }]);
  };

  return (
    <div className="flex flex-col items-end font-['Plus_Jakarta_Sans'] select-none">
      {isOpen && (
        <div className="w-[360px] h-[550px] bg-slate-900 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden border border-white/10 mb-6 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="p-6 bg-slate-950 text-white flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg">F</div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] leading-none text-indigo-400 mb-1">Launch Office</h3>
                <span className="text-xs text-white font-bold opacity-75">Secure Connection</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/20 hover:text-white transition-colors p-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            {!isRegistered ? (
              <div className="flex-1 p-8 flex flex-col justify-center">
                <div className="mb-10 text-center">
                  <h4 className="text-xl font-black text-white mb-2 uppercase tracking-tighter italic">Verify Launch Partner</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Enter your credentials to secure priority verification for the 03.13 launch transmission.</p>
                </div>
                <form onSubmit={handleRegister} className="space-y-4">
                  <input 
                    type="email" 
                    placeholder="Enter Launch Email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-4 bg-white/5 rounded-2xl border-2 border-transparent focus:border-indigo-600 outline-none text-sm font-medium text-white placeholder:text-slate-600 transition-all"
                  />
                  <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95">
                    Secure Launch Access
                  </button>
                </form>
              </div>
            ) : (
              <>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900 scrollbar-hide">
                  {messages.map((m) => {
                    const isOp = m.sender_type === SenderType.OPERATOR;
                    return (
                      <div key={m.id} className={`flex ${isOp ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[85%] space-y-1`}>
                          <div className={`p-4 rounded-3xl text-sm font-medium leading-relaxed shadow-lg ${
                            isOp 
                              ? 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5' 
                              : 'bg-indigo-600 text-white rounded-tr-none'
                          }`}>
                            {m.message_text}
                          </div>
                          <p className={`text-[8px] font-black uppercase tracking-widest text-slate-600 ${isOp ? 'text-left' : 'text-right'}`}>
                             {isOp ? 'Office' : 'User'} • {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="p-4 bg-slate-950 border-t border-white/5">
                  <form onSubmit={handleSendMessage} className="relative">
                    <input 
                      type="text" 
                      placeholder="Send transmission..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="w-full pl-6 pr-14 py-4 bg-white/5 rounded-2xl border-none outline-none text-sm font-medium text-white placeholder:text-slate-700"
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-500">
                       <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                       </svg>
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-indigo-600 rounded-[1.8rem] flex items-center justify-center text-white shadow-2xl transition-all hover:scale-110 active:scale-95 pointer-events-auto"
      >
        {isOpen ? (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
    </div>
  );
};
