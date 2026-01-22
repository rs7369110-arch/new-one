
import React, { useState, useMemo } from 'react';
import { Student, User, UserRole } from '../types';

interface CancelledStudentsProps {
  user: User;
  students: Student[];
  onUpdateStudents: (students: Student[]) => void;
  onLogActivity: (actionType: 'UPDATE', module: string, target: string, details?: string) => void;
}

const CancelledStudents: React.FC<CancelledStudentsProps> = ({ user, students, onUpdateStudents, onLogActivity }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [studentToRevert, setStudentToRevert] = useState<Student | null>(null);

  const isAdmin = user.role === UserRole.ADMIN;

  const cancelledList = useMemo(() => {
    return students.filter(s => 
      s.status === 'CANCELLED' && 
      (s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice().reverse();
  }, [students, searchQuery]);

  const handleRevert = () => {
    if (!studentToRevert || !isAdmin) return;
    
    const updated = students.map(s => 
      s.id === studentToRevert.id 
        ? { ...s, status: 'APPROVED', cancelledDate: undefined, cancelledBy: undefined, cancelReason: undefined } 
        : s
    );
    
    onUpdateStudents(updated as Student[]);
    onLogActivity('UPDATE', 'Cancelled Archive', studentToRevert.name, 'Restored student from cancelled status to active.');
    setStudentToRevert(null);
    alert(`Success: ${studentToRevert.name} has been restored to Active status.`);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-[1.2rem] bg-rose-600 text-white flex items-center justify-center text-xl shadow-xl">
                 <i className="fa-solid fa-user-slash"></i>
              </div>
              <div>
                <h1 className="text-3xl font-black text-rose-950 tracking-tighter uppercase leading-none">Cancelled Archive</h1>
                <p className="text-rose-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-2 italic">Official Inactive Student Registry</p>
              </div>
           </div>
        </div>
        <div className="relative group">
           <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-rose-300"></i>
           <input 
             className="pl-12 pr-6 py-4 bg-white border-2 border-rose-50 rounded-[1.5rem] outline-none focus:border-rose-400 w-full md:w-80 font-bold text-sm shadow-sm transition-all"
             placeholder="Search Cancelled Records..."
             value={searchQuery}
             onChange={e => setSearchQuery(e.target.value)}
           />
        </div>
      </header>

      <div className="bg-white rounded-[4rem] shadow-xl border border-rose-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-rose-50/20 text-[10px] font-black text-rose-400 uppercase tracking-widest">
                <th className="px-10 py-6">Hero Profile</th>
                <th className="px-10 py-6">Cancellation Log</th>
                <th className="px-10 py-6">Reason for Removal</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {cancelledList.length > 0 ? cancelledList.map(s => (
                <tr key={s.id} className="hover:bg-rose-50/10 transition-all group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm font-black text-teal-600 grayscale">
                          {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : s.name.charAt(0)}
                       </div>
                       <div>
                          <p className="font-black text-teal-950 text-lg uppercase tracking-tight">{s.name}</p>
                          <p className="text-[9px] font-black text-rose-400 uppercase mt-0.5 tracking-widest">ADM: {s.admissionNo} • STD {s.grade}-{s.section}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                     <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <i className="fa-solid fa-clock text-[10px] text-rose-300"></i>
                           <p className="text-xs font-black text-gray-700">{s.cancelledDate || 'N/A'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                           <i className="fa-solid fa-user-shield text-[10px] text-rose-300"></i>
                           <p className="text-[10px] font-bold text-gray-400 uppercase">By: {s.cancelledBy || 'System'}</p>
                        </div>
                     </div>
                  </td>
                  <td className="px-10 py-6">
                     <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 border-l-4 border-l-rose-500 max-w-xs group-hover:bg-white transition-colors">
                        <p className="text-xs font-bold text-gray-600 italic leading-relaxed">
                           "{s.cancelReason || 'No specific reason recorded in registry.'}"
                        </p>
                     </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button 
                      onClick={() => setStudentToRevert(s)}
                      className="px-6 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                    >
                       <i className="fa-solid fa-rotate-left mr-2"></i>
                       Revert Active
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="py-40 text-center opacity-20">
                     <i className="fa-solid fa-user-check text-8xl mb-6"></i>
                     <p className="text-3xl font-black uppercase tracking-widest text-rose-900">Archives Empty</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {studentToRevert && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-indigo-950/80 backdrop-blur-xl animate-fade-in" onClick={() => setStudentToRevert(null)}></div>
           <div className="bg-white rounded-[4rem] p-12 max-w-md w-full relative z-10 shadow-2xl border-t-[15px] border-emerald-500 animate-scale-in text-center">
              <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">
                 <i className="fa-solid fa-user-check"></i>
              </div>
              <h2 className="text-3xl font-black text-indigo-950 uppercase tracking-tighter mb-4">Restore Student?</h2>
              <p className="text-sm font-bold text-gray-500 leading-relaxed mb-8">
                 Do you want to restore <strong>{studentToRevert.name}</strong> back to Active status? They will reappear in Attendance and Fees modules.
              </p>
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setStudentToRevert(null)} className="py-5 bg-gray-100 text-gray-500 rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest">Abort</button>
                 <button onClick={handleRevert} className="py-5 bg-emerald-500 text-white rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-emerald-200">Confirm Revert</button>
              </div>
           </div>
        </div>
      )}

      <style>{`
        @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-in { animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>
    </div>
  );
};

export default CancelledStudents;
