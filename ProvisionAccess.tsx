
import React, { useState } from 'react';

interface ProvisionAccessProps {
  onCancel: () => void;
}

export const ProvisionAccess: React.FC<ProvisionAccessProps> = ({ onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'support',
    securityLevel: 'l1'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successTicket, setSuccessTicket] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API provisioning process
    setTimeout(() => {
      const ticketId = `PRV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setSuccessTicket(ticketId);
      setIsSubmitting(false);
    }, 1500);
  };

  if (successTicket) {
    return (
      <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl w-full max-w-md text-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">Request Logged</h2>
        <p className="text-slate-400 text-sm mb-8 font-medium">Your access request has been sent to the system administrator for approval.</p>
        
        <div className="bg-slate-50 p-6 rounded-2xl mb-10 border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Ticket Reference</p>
          <p className="text-lg font-mono font-bold text-indigo-600">{successTicket}</p>
        </div>

        <button 
          onClick={onCancel}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-slate-200 uppercase tracking-widest"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">Provision Access</h1>
        <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">New Operator Onboarding</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
          <input 
            type="text" 
            placeholder="e.g. Alex Rivera" 
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none font-medium text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Work Email</label>
          <input 
            type="email" 
            placeholder="alex@flourish.ai" 
            required
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none font-medium text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Dept.</label>
            <select 
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none font-bold text-xs uppercase appearance-none"
            >
              <option value="support">Support</option>
              <option value="sales">Sales</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Clearance</label>
            <select 
              value={formData.securityLevel}
              onChange={(e) => setFormData({...formData, securityLevel: e.target.value})}
              className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none font-bold text-xs uppercase appearance-none"
            >
              <option value="l1">Level 1</option>
              <option value="l2">Level 2</option>
              <option value="l3">Level 3</option>
            </select>
          </div>
        </div>
        
        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest mt-4 disabled:opacity-50"
        >
          {isSubmitting ? 'Processing...' : 'Request Credentials'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <button 
          onClick={onCancel}
          className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-[0.2em] transition-colors"
        >
          Return to Portal Login
        </button>
      </div>
    </div>
  );
};
