
import React, { useState, useEffect } from 'react';
import { Lead } from '../types';

interface LeadProfilerProps {
  lead: Lead | null;
  onUpdateLead: (updatedLead: Lead) => void;
}

export const LeadProfiler: React.FC<LeadProfilerProps> = ({ lead, onUpdateLead }) => {
  const [notes, setNotes] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (lead) {
      setNotes(lead.notes || '');
    }
  }, [lead]);

  if (!lead) {
    return (
      <div className="p-8 text-center opacity-50">
        <p className="text-xs text-slate-400 italic">Select a lead to profile.</p>
      </div>
    );
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      const tags = lead.tags || [];
      if (!tags.includes(newTag.trim())) {
        onUpdateLead({ ...lead, tags: [...tags, newTag.trim()] });
      }
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const tags = (lead.tags || []).filter(t => t !== tagToRemove);
    onUpdateLead({ ...lead, tags });
  };

  const handleNotesChange = (val: string) => {
    setNotes(val);
    onUpdateLead({ ...lead, notes: val });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Identity</h3>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold">Full Name</label>
            <p className="text-sm font-bold text-slate-800">{lead.name}</p>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold">Email Address</label>
            <p className="text-sm font-bold text-slate-800">{lead.email}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Segmentation</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {lead.tags?.map(tag => (
            <span key={tag} className="group relative px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border border-indigo-100">
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
        <input 
          type="text" 
          placeholder="Add tag + press Enter" 
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleAddTag}
          className="w-full p-3 bg-slate-100/50 rounded-xl border border-transparent focus:border-slate-200 outline-none text-[11px] font-bold placeholder:text-slate-400"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operator Notes</h3>
        <textarea 
          placeholder="Brief observations about this lead..."
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          className="w-full h-32 p-4 bg-white rounded-2xl border border-slate-200 focus:border-indigo-600 outline-none text-xs font-medium resize-none shadow-sm transition-all"
        />
      </div>

      <div className="pt-6 border-t border-slate-200">
         <div className="bg-slate-900 rounded-2xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Stream Telemetry</span>
            </div>
            <p className="text-[10px] font-mono text-slate-300 break-all leading-relaxed">
               SID: {lead.uid.toUpperCase()}<br/>
               LOC: GMT-08:00<br/>
               SRC: /direct/landing
            </p>
         </div>
      </div>
    </div>
  );
};
