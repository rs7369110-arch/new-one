
import React, { useState, useEffect } from 'react';
import { User, UserRole, Student, FeeStructure, FeeTransaction, PaymentMode } from '../types';

interface FeesProps {
  user: User;
  students: Student[];
  setStudents: (s: Student[]) => void;
  feeStructures: FeeStructure[];
  onUpdateFeeStructures: (fs: FeeStructure[]) => void;
  transactions: FeeTransaction[];
  onUpdateTransactions: (t: FeeTransaction[]) => void;
  initialMode?: 'COLLECTION' | 'SETUP';
}

const FeesManager: React.FC<FeesProps> = ({ 
  user, students, setStudents, feeStructures, onUpdateFeeStructures, transactions, onUpdateTransactions, initialMode 
}) => {
  const [viewMode, setViewMode] = useState<'COLLECTION' | 'SETUP'>(initialMode || 'COLLECTION');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(PaymentMode.OFFLINE);
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const isParent = user.role === UserRole.PARENT;
  const isAdmin = user.role === UserRole.ADMIN;

  useEffect(() => {
    if (initialMode) setViewMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (isParent && user.studentId) {
      const s = students.find(x => x.id === user.studentId);
      if (s) {
        setSelectedStudent(s);
        setShowHistory(true);
      }
    }
  }, [user, students, isParent]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isParent) return; // Prevent parents from modifying
    
    if (!selectedStudent || paymentAmount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setIsProcessing(true);
    if (paymentMode === PaymentMode.ONLINE) {
      await new Promise(resolve => setTimeout(resolve, 2500));
    }

    const receiptId = paymentMode === PaymentMode.ONLINE 
      ? `ONL-${Math.random().toString(36).substr(2, 6).toUpperCase()}` 
      : `REC-${Date.now().toString().slice(-6)}`;

    const newTransaction: FeeTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      studentId: selectedStudent.id,
      amount: paymentAmount,
      date: new Date().toLocaleString(),
      mode: paymentMode,
      method: paymentMethod,
      transactionId: receiptId
    };

    const updatedStudents = students.map(s => {
      if (s.id === selectedStudent.id) {
        return { ...s, paidFees: s.paidFees + paymentAmount };
      }
      return s;
    });

    setStudents(updatedStudents);
    onUpdateTransactions([...transactions, newTransaction]);
    setIsProcessing(false);
    setPaymentAmount(0);
    alert(`Payment Successful!\nReceipt: ${receiptId}`);
  };

  const studentTransactions = transactions.filter(t => t.studentId === selectedStudent?.id).reverse();

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-indigo-900 tracking-tighter uppercase leading-none">
            {isParent ? 'Fee Registry' : (viewMode === 'COLLECTION' ? 'Finance Control' : 'Fee Architecture')}
          </h1>
          <p className="text-emerald-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-2 italic">
            {isParent ? `Financial Record for ${selectedStudent?.name}` : 'Administrative Registry Access'}
          </p>
        </div>
        {isAdmin && (
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-indigo-50">
             <button onClick={() => setViewMode('COLLECTION')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'COLLECTION' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400'}`}>Ledger</button>
             <button onClick={() => setViewMode('SETUP')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'SETUP' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400'}`}>Config</button>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[3.5rem] shadow-xl border border-indigo-50 overflow-hidden">
            <div className="p-10 border-b border-indigo-50 flex items-center justify-between bg-gray-50/50">
               <h3 className="text-xl font-black text-indigo-950 uppercase tracking-tighter">
                  {isAdmin && !showHistory ? 'Student Treasury Registry' : 'Transaction History Log'}
               </h3>
               {isAdmin && selectedStudent && (
                 <button 
                  onClick={() => setShowHistory(!showHistory)} 
                  className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all shadow-sm"
                 >
                   {showHistory ? 'Show All Students' : 'View Detail Log'}
                 </button>
               )}
            </div>

            <div className="overflow-x-auto min-h-[400px]">
              {isAdmin && !showHistory ? (
                <table className="w-full text-left">
                  <thead className="bg-indigo-50/30">
                    <tr className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                      <th className="px-10 py-5">Hero Profile</th>
                      <th className="px-10 py-5">Payable</th>
                      <th className="px-10 py-5">Collected</th>
                      <th className="px-10 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-50">
                    {students.map(s => (
                      <tr key={s.id} className="group hover:bg-indigo-50/10">
                        <td className="px-10 py-6">
                           <p className="font-black text-gray-800 text-base">{s.name}</p>
                           <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Class {s.grade} • Roll {s.rollNo}</p>
                        </td>
                        <td className="px-10 py-6 font-black text-gray-600">₹{s.totalFees}</td>
                        <td className="px-10 py-6 font-black text-emerald-600">₹{s.paidFees}</td>
                        <td className="px-10 py-6 text-right">
                           <button onClick={() => {setSelectedStudent(s); setShowHistory(true);}} className="px-6 py-2.5 bg-indigo-950 text-white text-[9px] font-black uppercase rounded-xl shadow-xl hover:bg-indigo-600 transition-all">Record Entry</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-10 space-y-4">
                  {selectedStudent ? (
                    studentTransactions.length > 0 ? (
                      <div className="space-y-4">
                         {studentTransactions.map(t => (
                           <div key={t.id} className="p-6 rounded-[2rem] bg-white border border-indigo-50 flex items-center justify-between group hover:shadow-2xl transition-all border-l-[10px]" style={{ borderLeftColor: t.mode === PaymentMode.ONLINE ? '#10b981' : '#f59e0b' }}>
                              <div className="flex items-center gap-6">
                                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${t.mode === PaymentMode.ONLINE ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                    <i className={`fa-solid ${t.mode === PaymentMode.ONLINE ? 'fa-globe' : 'fa-hand-holding-dollar'}`}></i>
                                 </div>
                                 <div>
                                    <p className="font-black text-gray-800 text-xl tracking-tighter">₹{t.amount}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">{t.date} • {t.method}</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-[8px] font-black text-indigo-300 uppercase tracking-[0.3em] mb-1">Receipt ID</p>
                                 <p className="text-[10px] font-black text-gray-500 font-mono bg-indigo-50 px-4 py-2 rounded-xl shadow-inner">{t.transactionId}</p>
                              </div>
                           </div>
                         ))}
                      </div>
                    ) : (
                      <div className="text-center py-32 opacity-20">
                        <i className="fa-solid fa-receipt text-8xl mb-6"></i>
                        <p className="font-black text-2xl uppercase tracking-widest">No Log Entries</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-32 opacity-20">
                      <i className="fa-solid fa-user-tag text-8xl mb-6"></i>
                      <p className="font-black text-2xl uppercase tracking-widest">Select Profile to View History</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
           {selectedStudent ? (
             <div className="bg-indigo-950 p-10 rounded-[4rem] shadow-2xl text-white relative overflow-hidden animate-slide-up sticky top-8 border border-white/10">
                <h3 className="text-2xl font-black mb-10 uppercase tracking-tighter flex items-center gap-3">
                   <i className="fa-solid fa-shield-halved text-emerald-400"></i>
                   Summary Card
                </h3>

                <div className="bg-white/5 rounded-[2.5rem] p-8 mb-10 border border-white/10 backdrop-blur-md">
                   <div className="flex items-center gap-5 mb-6">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500/20 flex items-center justify-center font-black text-indigo-300 text-2xl">
                         {selectedStudent.name.charAt(0)}
                      </div>
                      <div>
                         <p className="text-[9px] font-black uppercase text-indigo-400 tracking-widest">Identity Linked</p>
                         <p className="text-xl font-black leading-none mt-1 uppercase tracking-tighter">{selectedStudent.name}</p>
                      </div>
                   </div>
                   <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-white/5 rounded-2xl">
                         <p className="text-[8px] font-black uppercase text-indigo-400 tracking-widest mb-1">Target</p>
                         <p className="font-black text-xl">₹{selectedStudent.totalFees}</p>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-2xl">
                         <p className="text-[8px] font-black uppercase text-emerald-400 tracking-widest mb-1">Cleared</p>
                         <p className="font-black text-xl text-emerald-400">₹{selectedStudent.paidFees}</p>
                      </div>
                   </div>
                </div>

                {!isParent ? (
                  <form onSubmit={handlePayment} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest ml-1">Payment Amount (₹)</label>
                        <input 
                          required type="number" 
                          className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 outline-none focus:bg-black/60 focus:border-emerald-500 font-black text-3xl shadow-inner transition-all text-center"
                          value={paymentAmount || ''}
                          onChange={e => setPaymentAmount(Number(e.target.value))}
                          placeholder="0.00"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isProcessing}
                        className="w-full py-6 bg-emerald-600 hover:bg-white hover:text-indigo-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all transform active:scale-95"
                    >
                        {isProcessing ? 'Synchronizing...' : 'Initialize Record'}
                    </button>
                  </form>
                ) : (
                  <div className="p-8 bg-white/5 rounded-[2.5rem] border-2 border-dashed border-white/10 text-center">
                     <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
                        <i className="fa-solid fa-lock"></i>
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Read-Only Secure Portal</p>
                     <p className="text-xs font-bold text-white/60 mt-2 italic">Entry modification is restricted to the Academy Secretariat.</p>
                  </div>
                )}

                <div className="mt-12 pt-8 border-t border-white/5 text-center flex flex-col items-center opacity-40">
                   <div className="flex items-center gap-2 mb-2">
                      <i className="fa-solid fa-fingerprint text-[10px]"></i>
                      <p className="text-[8px] font-black uppercase tracking-[0.3em]">Identity Verified Gateway</p>
                   </div>
                </div>
             </div>
           ) : (
             <div className="bg-white p-24 rounded-[5rem] text-center border-4 border-dashed border-indigo-50 flex flex-col items-center justify-center opacity-20">
                <i className="fa-solid fa-vault text-8xl mb-8"></i>
                <p className="font-black text-2xl uppercase tracking-widest">Vault Awaiting Input</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default FeesManager;
