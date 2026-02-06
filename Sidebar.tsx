
import React, { useState } from 'react';
import { Lead } from '../types';

interface SidebarProps {
  leads: Lead[];
  selectedUid: string | null;
  onSelectLead: (lead: Lead) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ leads, selectedUid, onSelectLead }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    lead.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
      <div className="p-6 border-b border-slate-200 bg-white/50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">Active Leads</h2>
          <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-[10px] font-black">
            {filteredLeads.length}
          </span>
        </div>
        
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search leads..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-3 bg-white rounded-xl border border-slate-200 text-xs font-medium focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all shadow-sm"
          />
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {filteredLeads.length > 0 ? (
          filteredLeads.map((lead) => (
            <div 
              key={lead.uid}
              onClick={() => onSelectLead(lead)}
              className={`p-6 border-b border-slate-100 cursor-pointer transition-all hover:bg-white group relative ${
                selectedUid === lead.uid ? 'bg-white shadow-sm border-l-4 border-l-indigo-600' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-xs font-bold uppercase transition-colors ${
                  selectedUid === lead.uid ? 'text-indigo-600' : 'text-slate-900 group-hover:text-indigo-600'
                }`}>
                  {lead.name || lead.email.split('@')[0]}
                </span>
                <span className="text-[9px] text-slate-400 font-medium">5m</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate font-medium lowercase italic mb-3">{lead.email}</p>
              
              <div className="flex gap-1 flex-wrap">
                {lead.tags?.map(tag => (
                  <span key={tag} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[8px] font-bold uppercase tracking-wider">{tag}</span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-8 8-8-8" />
              </svg>
            </div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Matches Found</p>
          </div>
        )}
      </div>
    </aside>
  );
};
