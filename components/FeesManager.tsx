
import React, { useState, useEffect } from 'react';
import { User, UserRole, Student, FeeStructure } from '../types';

interface FeesProps {
  user: User;
  students: Student[];
  setStudents: (s: Student[]) => void;
  feeStructures: FeeStructure[];
  onUpdateFeeStructures: (fs: FeeStructure[]) => void;
  initialMode?: 'COLLECTION' | 'SETUP';
}

const FeesManager: React.FC<FeesProps> = ({ user, students, setStudents, feeStructures, onUpdateFeeStructures, initialMode }) => {
  const [viewMode, setViewMode] = useState<'COLLECTION' | 'SETUP'>(initialMode || 'COLLECTION');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [editingGrade, setEditingGrade] = useState<string | null>(null);
  const [gradeFeeForm, setGradeFeeForm] = useState<FeeStructure>({ grade: '', tuitionFee: 0, transportFee: 0, examFee: 0 });

  // Update view mode if initialMode prop changes (e.g. user clicks different sidebar items)
  useEffect(() => {
    if (initialMode) {
      setViewMode(initialMode);
    }
  }, [initialMode]);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const updatedStudents = students.map(s => {
      if (s.id === selectedStudent.id) {
        return { ...s, paidFees: s.paidFees + paymentAmount };
      }
      return s;
    });
    setStudents(updatedStudents);
    setSelectedStudent(null);
    setPaymentAmount(0);
  };

  const handleGradeSetup = (e: React.FormEvent) => {
    e.preventDefault();
    const existingIndex = feeStructures.findIndex(f => f.grade === gradeFeeForm.grade);
    let newStructures = [...feeStructures];
    
    if (existingIndex > -1) {
      newStructures[existingIndex] = gradeFeeForm;
    } else {
      newStructures.push(gradeFeeForm);
    }
    
    onUpdateFeeStructures(newStructures);
    setEditingGrade(null);
  };

  const syncGradeFees = (grade: string) => {
    const structure = feeStructures.find(f => f.grade === grade);
    if (!structure) {
      alert("Please setup the fee structure for this class first!");
      return;
    }

    const confirmed = window.confirm(`Update all Class ${grade} students to a total fee of ₹${structure.tuitionFee + structure.transportFee + structure.examFee}?`);
    if (confirmed) {
      const total = structure.tuitionFee + structure.transportFee + structure.examFee;
      const updatedStudents = students.map(s => 
        s.grade === grade ? { ...s, totalFees: total } : s
      );
      setStudents(updatedStudents);
    }
  };

  const getGradeTotal = (grade: string) => {
    const s = feeStructures.find(f => f.grade === grade);
    return s ? s.tuitionFee + s.transportFee + s.examFee : 0;
  };

  const totalPossible = students.reduce((a, b) => a + b.totalFees, 0);
  const totalReceived = students.reduce((a, b) => a + b.paidFees, 0);
  const collectionPercentage = totalPossible > 0 ? (totalReceived / totalPossible) * 100 : 0;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-indigo-900 tracking-tight">
            {viewMode === 'COLLECTION' ? 'Treasure Chest' : 'Standard Fee Registry'}
          </h1>
          <p className="text-pink-500 font-medium italic">
            {viewMode === 'COLLECTION' 
              ? 'Manage school finance and standard fee registries. 💰' 
              : 'Define standard class-wise fee components for the academy.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {user.role === UserRole.ADMIN && (
            <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-pink-100">
               <button 
                onClick={() => setViewMode('COLLECTION')}
                className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'COLLECTION' ? 'bg-pink-500 text-white shadow-lg' : 'text-gray-400'}`}
               >
                 Collection
               </button>
               <button 
                onClick={() => setViewMode('SETUP')}
                className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'SETUP' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400'}`}
               >
                 Fee Setup
               </button>
            </div>
          )}
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-xl ${
            viewMode === 'COLLECTION' ? 'bg-pink-100 text-pink-600 shadow-pink-50' : 'bg-blue-100 text-blue-600 shadow-blue-50'
          }`}>
            <i className={`fa-solid ${viewMode === 'COLLECTION' ? 'fa-coins' : 'fa-file-invoice-dollar'}`}></i>
          </div>
        </div>
      </header>

      {viewMode === 'COLLECTION' ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
               {/* Financial Summary Card */}
               <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                     <div>
                        <p className="text-indigo-100 text-xs font-black uppercase tracking-widest mb-1">Total Expected Treasure</p>
                        <h2 className="text-5xl font-black tracking-tighter">₹{totalPossible.toLocaleString()}</h2>
                        <div className="flex items-center gap-4 mt-6">
                           <div className="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md">
                              <p className="text-[9px] font-black uppercase text-indigo-200">Received</p>
                              <p className="font-black text-emerald-400">₹{totalReceived.toLocaleString()}</p>
                           </div>
                           <div className="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md">
                              <p className="text-[9px] font-black uppercase text-indigo-200">Pending</p>
                              <p className="font-black text-rose-300">₹{(totalPossible - totalReceived).toLocaleString()}</p>
                           </div>
                        </div>
                     </div>
                     <div className="flex flex-col items-center gap-2">
                        <div className="w-32 h-32 rounded-full border-8 border-white/10 flex items-center justify-center relative">
                           <span className="text-2xl font-black">{Math.round(collectionPercentage)}%</span>
                           <svg className="absolute inset-0 w-full h-full -rotate-90">
                              <circle 
                                cx="64" cy="64" r="56" 
                                fill="none" 
                                stroke="white" 
                                strokeWidth="8" 
                                strokeDasharray="351.8" 
                                strokeDashoffset={351.8 - (351.8 * collectionPercentage / 100)}
                                className="transition-all duration-1000 ease-out"
                              />
                           </svg>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Collection Status</p>
                     </div>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
               </div>

               {/* Student Ledger */}
               <div className="bg-white rounded-[3.5rem] shadow-xl border border-indigo-50 overflow-hidden">
                  <div className="p-8 border-b border-indigo-50 flex items-center justify-between bg-gray-50/50">
                     <h3 className="text-xl font-black text-indigo-900 flex items-center gap-3">
                        <i className="fa-solid fa-file-invoice-dollar"></i>
                        Hero Fee Ledger
                     </h3>
                     <div className="relative">
                        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                        <input className="pl-11 pr-6 py-2 bg-white border-2 border-transparent focus:border-indigo-100 rounded-xl outline-none text-xs font-bold w-48" placeholder="Search Hero..." />
                     </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-indigo-50/30">
                        <tr className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                          <th className="px-8 py-5">Hero Profile</th>
                          <th className="px-8 py-5">Assigned Target</th>
                          <th className="px-8 py-5">Paid</th>
                          <th className="px-8 py-5">Remaining</th>
                          <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-indigo-50">
                        {students.map(s => (
                          <tr key={s.id} className="group hover:bg-indigo-50/10 transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-indigo-50 border-2 border-white shadow-sm flex items-center justify-center font-black text-indigo-400">
                                    {s.name.charAt(0)}
                                 </div>
                                 <div>
                                    <p className="font-black text-gray-800 text-sm leading-tight">{s.name}</p>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Roll {s.rollNo} • Class {s.grade}</p>
                                 </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 font-black text-gray-900 text-sm">₹{s.totalFees.toLocaleString()}</td>
                            <td className="px-8 py-6 font-black text-emerald-600 text-sm">₹{s.paidFees.toLocaleString()}</td>
                            <td className="px-8 py-6 font-black text-rose-500 text-sm">₹{(s.totalFees - s.paidFees).toLocaleString()}</td>
                            <td className="px-8 py-6 text-right">
                              {user.role === UserRole.ADMIN && (
                                <button 
                                  onClick={() => setSelectedStudent(s)}
                                  className="px-4 py-2 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                >
                                  Deposit
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>

            {/* Sidebar Control Panel */}
            <div className="space-y-6">
               {selectedStudent ? (
                 <div className="bg-white p-8 rounded-[3.5rem] shadow-2xl border-4 border-indigo-50 animate-slide-up sticky top-8">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-xl font-black text-indigo-950 flex items-center gap-2">
                          <i className="fa-solid fa-vault"></i>
                          Treasury Deposit
                       </h3>
                       <button onClick={() => setSelectedStudent(null)} className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
                          <i className="fa-solid fa-xmark"></i>
                       </button>
                    </div>

                    <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 mb-8">
                       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Depositing for</p>
                       <p className="text-xl font-black text-indigo-900 tracking-tight">{selectedStudent.name}</p>
                       <div className="mt-4 pt-4 border-t border-indigo-100 flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-400">Pending Amount:</span>
                          <span className="font-black text-rose-600">₹{(selectedStudent.totalFees - selectedStudent.paidFees).toLocaleString()}</span>
                       </div>
                    </div>

                    <form onSubmit={handlePayment} className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deposit Amount (₹)</label>
                          <input 
                            required
                            type="number"
                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-400 outline-none font-black text-indigo-900 shadow-inner" 
                            value={paymentAmount}
                            onChange={e => setPaymentAmount(Number(e.target.value))}
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Payment Channel</label>
                          <select className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-400 outline-none font-black text-indigo-900 shadow-inner appearance-none">
                             <option>Cash Vault</option>
                             <option>UPI Magic</option>
                             <option>Bank Scroll</option>
                             <option>Cheque Leaf</option>
                          </select>
                       </div>
                       <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-[2rem] shadow-xl shadow-indigo-100 transform hover:scale-[1.02] active:scale-95 transition-all">
                          Confirm Secure Deposit
                       </button>
                    </form>
                 </div>
               ) : (
                 <div className="bg-indigo-950 p-10 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10">
                       <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-4xl mb-8 group-hover:rotate-12 transition-transform">
                          <i className="fa-solid fa-qrcode"></i>
                       </div>
                       <h3 className="text-2xl font-black mb-4 tracking-tight leading-tight">Instant Digital<br/>Treasury Receipt</h3>
                       <p className="text-indigo-300 text-sm font-medium leading-relaxed mb-10 italic">"Offline-capable fee tracking with QR support for instant receipts."</p>
                       
                       <div className="bg-white p-3 rounded-3xl shadow-2xl mx-auto w-40 h-40 group-hover:scale-110 transition-transform">
                          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=JannatAcademyTreasury" className="w-full h-full grayscale" alt="QR" />
                       </div>
                       <p className="text-center mt-4 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Scan for Portal</p>
                    </div>
                    <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-indigo-500 rounded-full blur-[80px] opacity-20"></div>
                 </div>
               )}
            </div>
          </div>
        </>
      ) : (
        /* Fee Setup Mode */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-slide-up">
           <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-indigo-50 space-y-8">
              <h2 className="text-2xl font-black text-indigo-950 flex items-center gap-4">
                 <i className="fa-solid fa-screwdriver-wrench text-indigo-500"></i>
                 Define Standard Components
              </h2>
              <form onSubmit={handleGradeSetup} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Class</label>
                       <select 
                         required
                         className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-300 outline-none font-black"
                         value={gradeFeeForm.grade}
                         onChange={e => {
                            const grade = e.target.value;
                            const existing = feeStructures.find(f => f.grade === grade);
                            setGradeFeeForm(existing || { grade, tuitionFee: 0, transportFee: 0, examFee: 0 });
                         }}
                       >
                          <option value="">Choose Class...</option>
                          {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n.toString()}>Class {n}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tuition Fee (₹)</label>
                       <input 
                         required
                         type="number"
                         className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-300 outline-none font-bold"
                         value={gradeFeeForm.tuitionFee}
                         onChange={e => setGradeFeeForm({...gradeFeeForm, tuitionFee: Number(e.target.value)})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Transport Fee (₹)</label>
                       <input 
                         required
                         type="number"
                         className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-300 outline-none font-bold"
                         value={gradeFeeForm.transportFee}
                         onChange={e => setGradeFeeForm({...gradeFeeForm, transportFee: Number(e.target.value)})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Exam & Library Fee (₹)</label>
                       <input 
                         required
                         type="number"
                         className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-300 outline-none font-bold"
                         value={gradeFeeForm.examFee}
                         onChange={e => setGradeFeeForm({...gradeFeeForm, examFee: Number(e.target.value)})}
                       />
                    </div>
                 </div>
                 <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 flex justify-between items-center">
                    <div>
                       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Calculated Total</p>
                       <p className="text-3xl font-black text-indigo-900">₹{(gradeFeeForm.tuitionFee + gradeFeeForm.transportFee + gradeFeeForm.examFee).toLocaleString()}</p>
                    </div>
                    <button type="submit" className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all">
                       Save Registry
                    </button>
                 </div>
              </form>
           </div>

           <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-indigo-50">
              <h2 className="text-2xl font-black text-indigo-950 flex items-center gap-4 mb-8">
                 <i className="fa-solid fa-list-check text-indigo-500"></i>
                 Configured Structures
              </h2>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                 {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => {
                    const grade = n.toString();
                    const struct = feeStructures.find(f => f.grade === grade);
                    return (
                       <div key={grade} className="p-6 rounded-3xl bg-gray-50 border border-transparent hover:border-indigo-100 transition-all flex items-center justify-between group">
                          <div className="flex items-center gap-5">
                             <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-sm">
                                {grade}
                             </div>
                             <div>
                                <p className="font-black text-gray-800 text-sm">₹{getGradeTotal(grade).toLocaleString()}</p>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{struct ? 'Configured' : 'No Structure Set'}</p>
                             </div>
                          </div>
                          {struct && (
                             <button 
                               onClick={() => syncGradeFees(grade)}
                               className="px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                             >
                                Bulk Apply to Students
                             </button>
                          )}
                       </div>
                    );
                 })}
              </div>
           </div>
        </div>
      )}

      <style>{`
        .animate-slide-up { animation: slideUp 0.5s ease-out forwards; }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default FeesManager;
