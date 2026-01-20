
import React, { useState } from 'react';
import { User, UserRole, LeaveRequest } from '../types';

interface LeaveManagementProps {
  user: User;
  leaves: LeaveRequest[];
  onUpdateLeaves: (leaves: LeaveRequest[]) => void;
  onLogActivity: (actionType: 'LEAVE_DECISION', module: string, target: string, details?: string) => void;
}

const LeaveManagement: React.FC<LeaveManagementProps> = ({ user, leaves, onUpdateLeaves, onLogActivity }) => {
  const [isApplying, setIsApplying] = useState(false);
  const [formData, setFormData] = useState<Partial<LeaveRequest>>({
    type: 'Casual',
    reason: '',
    startDate: '',
    endDate: ''
  });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest: LeaveRequest = {
      id: Math.random().toString(36).substr(2, 9),
      teacherId: user.id,
      teacherName: user.name,
      status: 'PENDING',
      appliedDate: new Date().toLocaleDateString(),
      ...(formData as LeaveRequest)
    };
    onUpdateLeaves([...leaves, newRequest]);
    setIsApplying(false);
    setFormData({ type: 'Casual', reason: '', startDate: '', endDate: '' });
  };

  const handleDecision = (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    const targetLeave = leaves.find(l => l.id === requestId);
    if (!targetLeave) return;
    
    const remarks = window.prompt(`Enter formal remarks for this decision (Optional):`);
    const updated = leaves.map(l => 
      l.id === requestId ? { ...l, status, adminRemarks: remarks || '' } : l
    );
    onUpdateLeaves(updated);
    onLogActivity('LEAVE_DECISION', 'Faculty Leave Registry', targetLeave.teacherName, `${status} leave from ${targetLeave.startDate} to ${targetLeave.endDate}. Remarks: ${remarks || 'None'}`);
  };

  const isAdmin = user.role === UserRole.ADMIN;
  const filteredLeaves = isAdmin ? leaves : leaves.filter(l => l.teacherId === user.id);
  
  const teacherStats = {
    pending: leaves.filter(l => l.teacherId === user.id && l.status === 'PENDING').length,
    approved: leaves.filter(l => l.teacherId === user.id && l.status === 'APPROVED').length,
    rejected: leaves.filter(l => l.teacherId === user.id && l.status === 'REJECTED').length
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'APPROVED': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case 'REJECTED': return 'bg-rose-100 text-rose-600 border-rose-200';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-indigo-900 tracking-tighter">
            {isAdmin ? 'Master Leave Registry' : 'My Leave Dashboard'}
          </h1>
          <p className="text-indigo-500 font-medium italic">
            {isAdmin 
              ? 'Reviewing formal absence requests from the Academy Staff.' 
              : 'Submit and track your academic leave requests here.'}
          </p>
        </div>
        {!isAdmin && (
          <button 
            onClick={() => setIsApplying(!isApplying)}
            className={`px-10 py-5 rounded-[2rem] font-black shadow-2xl transition-all flex items-center gap-4 transform hover:scale-105 active:scale-95 ${
              isApplying 
                ? 'bg-rose-500 text-white shadow-rose-200' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-200'
            }`}
          >
            <i className={`fa-solid ${isApplying ? 'fa-xmark' : 'fa-calendar-plus'} text-xl`}></i>
            <span className="text-lg">{isApplying ? 'Cancel Application' : 'Apply for Leave'}</span>
          </button>
        )}
      </header>

      {/* Teacher Stats Dashboard */}
      {!isAdmin && !isApplying && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
           <div className="bg-white p-8 rounded-[3rem] border border-indigo-50 shadow-xl flex items-center gap-6 group hover:border-indigo-200 transition-all">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform">
                 <i className="fa-solid fa-hourglass-half"></i>
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Review</p>
                 <p className="text-3xl font-black text-indigo-950">{teacherStats.pending}</p>
              </div>
           </div>
           <div className="bg-white p-8 rounded-[3rem] border border-indigo-50 shadow-xl flex items-center gap-6 group hover:border-emerald-200 transition-all">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform">
                 <i className="fa-solid fa-circle-check"></i>
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Approved Requests</p>
                 <p className="text-3xl font-black text-indigo-950">{teacherStats.approved}</p>
              </div>
           </div>
           <div className="bg-white p-8 rounded-[3rem] border border-indigo-50 shadow-xl flex items-center gap-6 group hover:border-rose-200 transition-all">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform">
                 <i className="fa-solid fa-circle-xmark"></i>
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rejected / Closed</p>
                 <p className="text-3xl font-black text-indigo-950">{teacherStats.rejected}</p>
              </div>
           </div>
        </div>
      )}

      {isApplying && !isAdmin && (
        <form onSubmit={handleApply} className="bg-white p-10 rounded-[4rem] shadow-2xl border-4 border-indigo-50 animate-slide-up grid grid-cols-1 md:grid-cols-2 gap-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-40"></div>
           
           <div className="md:col-span-2 flex items-center gap-4 mb-4 relative z-10">
              <div className="w-14 h-14 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center text-2xl shadow-xl shadow-indigo-100">
                 <i className="fa-solid fa-file-signature"></i>
              </div>
              <div>
                 <h2 className="text-2xl font-black text-indigo-900 tracking-tight">Formal Leave Application</h2>
                 <p className="text-sm font-bold text-indigo-400 italic">Submit your request for Administrative review.</p>
              </div>
           </div>

           <div className="space-y-2 relative z-10">
              <label className="text-[11px] font-black text-indigo-400 uppercase tracking-widest ml-1">Leave Category</label>
              <select 
                required
                className="w-full px-8 py-5 rounded-[2rem] bg-indigo-50/50 border-4 border-transparent focus:bg-white focus:border-indigo-300 outline-none font-black text-indigo-900 shadow-inner appearance-none"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as any})}
              >
                <option>Casual</option>
                <option>Sick</option>
                <option>Emergency</option>
                <option>Duty</option>
              </select>
           </div>

           <div className="grid grid-cols-2 gap-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-indigo-400 uppercase tracking-widest ml-1">Start Date</label>
                <input required type="date" className="w-full px-6 py-5 rounded-[2rem] bg-indigo-50/50 border-4 border-transparent focus:bg-white focus:border-indigo-300 outline-none font-black text-indigo-900 shadow-inner" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-indigo-400 uppercase tracking-widest ml-1">End Date</label>
                <input required type="date" className="w-full px-6 py-5 rounded-[2rem] bg-indigo-50/50 border-4 border-transparent focus:bg-white focus:border-indigo-300 outline-none font-black text-indigo-900 shadow-inner" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
              </div>
           </div>

           <div className="md:col-span-2 space-y-2 relative z-10">
              <label className="text-[11px] font-black text-indigo-400 uppercase tracking-widest ml-1">Reason & Context</label>
              <textarea required className="w-full px-8 py-6 rounded-[2.5rem] bg-indigo-50/50 border-4 border-transparent focus:bg-white focus:border-indigo-300 outline-none font-medium h-32 shadow-inner" placeholder="Provide details about your leave request..." value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
           </div>

           <div className="md:col-span-2 flex justify-end gap-4 relative z-10 pt-4">
              <button 
                type="button" 
                onClick={() => setIsApplying(false)}
                className="px-10 py-5 bg-gray-100 text-gray-500 rounded-[2rem] font-black hover:bg-gray-200 transition-all"
              >
                Discard
              </button>
              <button 
                type="submit" 
                className="px-14 py-5 bg-indigo-900 text-white rounded-[2rem] font-black shadow-2xl shadow-indigo-100 hover:bg-black transition-all transform hover:scale-105 active:scale-95"
              >
                Send Formal Request
              </button>
           </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredLeaves.slice().reverse().map((req) => (
          <div key={req.id} className="bg-white p-10 rounded-[4rem] shadow-xl border border-indigo-50 relative overflow-hidden group hover:shadow-2xl transition-all flex flex-col min-h-[400px]">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 rounded-[1.5rem] bg-indigo-50 border-2 border-white shadow-sm flex items-center justify-center font-black text-indigo-600 text-lg">
                      {req.teacherName.charAt(0)}
                   </div>
                   <div>
                      <h3 className="font-black text-indigo-950 text-base leading-tight">{req.teacherName}</h3>
                      <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mt-1">Ref ID: {req.id}</p>
                   </div>
                </div>
                <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatusBadge(req.status)}`}>
                   {req.status}
                </div>
             </div>

             <div className="space-y-6 flex-1">
                <div className="p-6 bg-indigo-50/30 rounded-3xl border border-indigo-100 flex items-center justify-between group-hover:bg-white transition-colors">
                   <div>
                      <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1">Duration</p>
                      <p className="text-sm font-black text-indigo-900">
                        {req.startDate} <i className="fa-solid fa-arrow-right-long mx-2 text-indigo-200"></i> {req.endDate}
                      </p>
                   </div>
                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-400 text-lg shadow-sm">
                      <i className="fa-solid fa-calendar-day"></i>
                   </div>
                </div>

                <div className="space-y-2">
                   <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                      <i className="fa-solid fa-message"></i> Request Reason
                   </p>
                   <p className="text-sm text-gray-700 font-bold leading-relaxed italic border-l-4 border-indigo-100 pl-4 py-1">
                      "{req.reason}"
                   </p>
                </div>

                {req.adminRemarks && (
                   <div className="p-6 bg-rose-50/50 rounded-3xl border border-rose-100 animate-fade-in">
                      <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                         <i className="fa-solid fa-shield-halved"></i> Academy Decision Remark
                      </p>
                      <p className="text-xs font-black text-indigo-900 italic">"{req.adminRemarks}"</p>
                   </div>
                )}
             </div>

             <div className="mt-8 pt-8 border-t border-indigo-50 flex items-center justify-between">
                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                   Applied: {req.appliedDate}
                </span>
                
                {isAdmin && req.status === 'PENDING' && (
                  <div className="flex gap-2">
                     <button 
                       onClick={() => handleDecision(req.id, 'APPROVED')}
                       className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                       title="Approve Request"
                     >
                       <i className="fa-solid fa-check"></i>
                     </button>
                     <button 
                       onClick={() => handleDecision(req.id, 'REJECTED')}
                       className="w-11 h-11 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                       title="Reject Request"
                     >
                       <i className="fa-solid fa-xmark"></i>
                     </button>
                  </div>
                )}
             </div>

             <div className="absolute -bottom-10 -right-10 text-indigo-50/30 text-8xl opacity-0 group-hover:opacity-100 transition-opacity transform rotate-12 duration-500">
                <i className={`fa-solid ${req.type === 'Sick' ? 'fa-briefcase-medical' : 'fa-scroll'}`}></i>
             </div>
          </div>
        ))}

        {filteredLeaves.length === 0 && (
          <div className="col-span-full py-40 text-center bg-white/50 rounded-[5rem] border-4 border-dashed border-indigo-50">
             <div className="w-32 h-32 bg-indigo-50 text-indigo-100 rounded-full flex items-center justify-center text-6xl mx-auto mb-8 animate-pulse">
                <i className="fa-solid fa-envelope-open-text"></i>
             </div>
             <p className="text-3xl font-black text-indigo-900 tracking-tighter">No Formal Absence Logged</p>
             <p className="text-indigo-400 font-bold mt-2 italic max-w-sm mx-auto">
               The Registry is currently clean. All Academy Masters are accounted for.
             </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slideUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
};

export default LeaveManagement;
