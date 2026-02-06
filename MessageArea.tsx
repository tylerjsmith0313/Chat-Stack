
import React, { useState, useEffect, useRef } from 'react';
import { Message, Lead, SenderType } from '../types';

interface MessageAreaProps {
  selectedLead: Lead | null;
  messages: Message[];
  onSendMessage: (text: string) => void;
}

export const MessageArea: React.FC<MessageAreaProps> = ({ selectedLead, messages, onSendMessage }) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  if (!selectedLead) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center opacity-30 select-none">
        <div className="w-24 h-24 bg-slate-200 rounded-[2rem] flex items-center justify-center mb-8">
           <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
           </svg>
        </div>
        <p className="text-[10px] font-black tracking-[0.4em] uppercase text-slate-500">Standby for Session Selection</p>
      </div>
    );
  }

  return (
    <>
      {/* Active Session Header */}
      <div className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-white z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-indigo-600 text-xs">
            {selectedLead.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 leading-none">{selectedLead.name}</h2>
            <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Active Stream</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
           </button>
        </div>
      </div>

      {/* Message List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
        {messages.map((m) => {
          const isOperator = m.sender_type === SenderType.OPERATOR;
          return (
            <div key={m.id} className={`flex ${isOperator ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] space-y-1`}>
                <div className={`px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                  isOperator 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                }`}>
                  {m.message_text}
                </div>
                <p className={`text-[9px] font-bold text-slate-400 uppercase tracking-tighter ${isOperator ? 'text-right' : 'text-left'}`}>
                  {isOperator ? 'Flourish HQ' : selectedLead.name.split(' ')[0]} • {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="relative group">
          <input 
            type="text" 
            placeholder="Direct response to lead..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full pl-6 pr-24 py-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none text-sm font-medium shadow-inner"
          />
          <button 
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-6 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          >
            Transmit
          </button>
        </form>
      </div>
    </>
  );
};
