
import React, { useState, useEffect } from 'react';
import { Lead, Message, Operator, SenderType } from '../types';
import { Sidebar } from './Sidebar';
import { MessageArea } from './MessageArea';
import { SmartReplies } from './SmartReplies';
import { LeadProfiler } from './LeadProfiler';
import { OperatorSettings } from './OperatorSettings';
import { initSupabase } from '../lib/supabase';

interface OperatorPortalProps {
  operator: Operator;
  onLogout: () => void;
}

export const OperatorPortal: React.FC<OperatorPortalProps> = ({ operator, onLogout }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [status, setStatus] = useState<'online' | 'away' | 'busy'>('online');
  const supabase = initSupabase();

  useEffect(() => {
    if (!supabase) return;

    const fetchLeads = async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setLeads(data);
    };

    fetchLeads();

    // Subscribe to new leads
    const leadSubscription = supabase
      .channel('leads_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, payload => {
        fetchLeads();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(leadSubscription);
    };
  }, []);

  useEffect(() => {
    if (!selectedLead || !supabase) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', selectedLead.uid)
        .order('timestamp', { ascending: true });
      
      if (data) setMessages(data);
    };

    fetchMessages();

    const msgSubscription = supabase
      .channel(`msg_${selectedLead.uid}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `session_id=eq.${selectedLead.uid}` }, payload => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(msgSubscription);
    };
  }, [selectedLead?.uid]);

  const handleSendMessage = async (text: string) => {
    if (!selectedLead || !supabase) return;
    
    const { error } = await supabase
      .from('messages')
      .insert([{
        session_id: selectedLead.uid,
        sender_id: 'operator',
        sender_type: SenderType.OPERATOR,
        message_text: text,
        timestamp: new Date().toISOString()
      }]);
    
    if (error) console.error("Send Error:", error);
  };

  const handleUpdateLead = async (updatedLead: Lead) => {
    if (!supabase) return;
    
    const { error } = await supabase
      .from('leads')
      .update({ notes: updatedLead.notes, tags: updatedLead.tags })
      .eq('uid', updatedLead.uid);

    if (!error) {
      setLeads(prev => prev.map(l => l.uid === updatedLead.uid ? updatedLead : l));
      if (selectedLead?.uid === updatedLead.uid) {
        setSelectedLead(updatedLead);
      }
    }
  };

  const statusColors = {
    online: 'bg-emerald-500',
    away: 'bg-amber-500',
    busy: 'bg-red-500'
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden relative font-['Plus_Jakarta_Sans']">
      <OperatorSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xs">F</div>
          <span className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Flourish Command</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-6 border-r border-slate-100 pr-6">
            <div className="relative group">
              <button className="flex items-center gap-3">
                <div className={`w-2 h-2 ${statusColors[status]} rounded-full animate-pulse`}></div>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-tighter">Operator: {operator.username}</span>
                <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 z-50">
                {(['online', 'away', 'busy'] as const).map(s => (
                  <button 
                    key={s}
                    onClick={() => setStatus(s)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl flex items-center gap-3 transition-colors"
                  >
                    <div className={`w-2 h-2 ${statusColors[s]} rounded-full`}></div>
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{s}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          <button 
            onClick={onLogout}
            className="text-[10px] font-black text-red-500 hover:text-red-700 uppercase tracking-widest transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <Sidebar 
          leads={leads} 
          selectedUid={selectedLead?.uid || null} 
          onSelectLead={setSelectedLead} 
        />

        <section className="flex-1 flex flex-col bg-white border-r border-slate-100">
          <MessageArea 
            selectedLead={selectedLead} 
            messages={messages} 
            onSendMessage={handleSendMessage}
          />
        </section>

        <aside className="w-80 hidden lg:flex flex-col bg-slate-50/50 shrink-0 overflow-y-auto">
          <div className="p-8 border-b border-slate-200">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">AI Insight</h3>
            <SmartReplies 
              history={messages} 
              onSelectReply={handleSendMessage}
            />
          </div>
          
          <div className="p-8">
            <LeadProfiler 
              lead={selectedLead} 
              onUpdateLead={handleUpdateLead} 
            />
          </div>
        </aside>
      </main>
    </div>
  );
};
