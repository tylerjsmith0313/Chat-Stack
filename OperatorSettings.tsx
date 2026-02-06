
import React from 'react';

interface OperatorSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OperatorSettings: React.FC<OperatorSettingsProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-10">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Preferences</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Global Command Config</p>
            </div>
            <button onClick={onClose} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-colors">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
            </button>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-slate-900 uppercase">AI Smart Replies</p>
                <p className="text-[10px] text-slate-400 font-medium">Enable real-time Gemini suggestions</p>
              </div>
              <div className="w-12 h-6 bg-indigo-600 rounded-full relative p-1 cursor-pointer">
                 <div className="w-4 h-4 bg-white rounded-full absolute right-1"></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-slate-900 uppercase">Sound Notifications</p>
                <p className="text-[10px] text-slate-400 font-medium">Alert on new inbound connections</p>
              </div>
              <div className="w-12 h-6 bg-slate-200 rounded-full relative p-1 cursor-pointer">
                 <div className="w-4 h-4 bg-white rounded-full absolute left-1"></div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">AI Personality Base</label>
              <div className="grid grid-cols-2 gap-4">
                 <button className="p-4 rounded-2xl border-2 border-indigo-600 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">Professional</button>
                 <button className="p-4 rounded-2xl border-2 border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:border-slate-200 transition-all">Friendly</button>
              </div>
            </div>
          </div>

          <div className="mt-12 flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition-all"
            >
              Apply Sync
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
