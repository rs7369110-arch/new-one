
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
  const [gradeFeeForm, setGradeFeeForm] = useState<FeeStructure>({ grade: '', tuitionFee: 0, transportFee: 0, examFee: 0 });

  useEffect(() => {
    if (initialMode) setViewMode(initialMode);
  }, [initialMode]);

  // Automatically select the student if the user is a Parent or Student
  useEffect(() => {
    if ((user.role === UserRole.PARENT || user.role === UserRole.STUDENT) && user.studentId) {
      const s = students.find(x => x.id === user.studentId);
      if (s) setSelectedStudent(s);
    } else if (!isAdmin && students.length > 0) {
      // For demo purposes, if no studentId is set but role is Parent, pick the first student
      setSelectedStudent(students[0]);
    }
  }, [user, students]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || paymentAmount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setIsProcessing(true);

    // Simulate Online Payment Gateway Delay
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
    alert(`Payment Successful!\nReceipt: ${receiptId}\nAmount: ₹${paymentAmount}\nMode: ${paymentMode}`);
  };

  const isAdmin = user.role === UserRole.ADMIN;
  const studentTransactions = transactions.filter(t => t.studentId === selectedStudent?.id).reverse();

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-indigo-900 tracking-tight uppercase">
            {isAdmin ? (viewMode === 'COLLECTION' ? 'Finance Control' : 'Fee Architecture') : 'My Fee Portal'}
          </h1>
          <p className="text-emerald-500 font-medium italic">
            {isAdmin ? 'Manage school revenue and structures.' : 'Securely pay and track school fees online.'}
          </p>
        </div>
        {isAdmin && (
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-indigo-50">
             <button onClick={() => setViewMode('COLLECTION')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'COLLECTION' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400'}`}>Ledger</button>
             <button onClick={() => setViewMode('SETUP')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'SETUP' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400'}`}>Config</button>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: List or History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[3rem] shadow-xl border border-indigo-50 overflow-hidden">
            <div className="p-8 border-b border-indigo-50 flex items-center justify-between bg-gray-50/50">
               <h3 className="text-xl font-black text-indigo-950 uppercase tracking-tighter">
                  {isAdmin && !showHistory ? 'Student Treasury Registry' : `${selectedStudent?.name || 'Student'}'s History`}
               </h3>
               {selectedStudent && (
                 <button 
                  onClick={() => setShowHistory(!showHistory)} 
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
                 >
                   {showHistory ? 'Show All Students' : 'View This History'}
                 </button>
               )}
            </div>

            <div className="overflow-x-auto min-h-[400px]">
              {isAdmin && !showHistory ? (
                <table className="w-full text-left">
                  <thead className="bg-indigo-50/30">
                    <tr className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                      <th className="px-8 py-5">Super Hero</th>
                      <th className="px-8 py-5">Payable</th>
                      <th className="px-8 py-5">Collected</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-50">
                    {students.map(s => (
                      <tr key={s.id} className="group hover:bg-indigo-50/10">
                        <td className="px-8 py-5">
                           <p className="font-black text-gray-800 text-sm">{s.name}</p>
                           <p className="text-[9px] font-bold text-gray-400 uppercase">Class {s.grade} • Roll {s.rollNo}</p>
                        </td>
                        <td className="px-8 py-5 font-black text-gray-700">₹{s.totalFees}</td>
                        <td className="px-8 py-5 font-black text-emerald-600">₹{s.paidFees}</td>
                        <td className="px-8 py-5 text-right">
                           <button onClick={() => setSelectedStudent(s)} className="px-4 py-2 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-lg shadow-md hover:bg-black transition-all">Record Fee</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 space-y-4">
                  {selectedStudent ? (
                    studentTransactions.length > 0 ? (
                      <div className="space-y-3">
                         {studentTransactions.map(t => (
                           <div key={t.id} className="p-5 rounded-2xl bg-gray-50 border border-indigo-50 flex items-center justify-between group hover:bg-white transition-all hover:shadow-lg border-l-8" style={{ borderLeftColor: t.mode === PaymentMode.ONLINE ? '#10b981' : '#f59e0b' }}>
                              <div className="flex items-center gap-4">
                                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${t.mode === PaymentMode.ONLINE ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                    <i className={`fa-solid ${t.mode === PaymentMode.ONLINE ? 'fa-globe' : 'fa-hand-holding-dollar'}`}></i>
                                 </div>
                                 <div>
                                    <p className="font-black text-gray-800 text-base">₹{t.amount}</p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t.date} • {t.method}</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter mb-1">Receipt ID</p>
                                 <p className="text-[10px] font-bold text-gray-500 font-mono bg-white px-3 py-1 rounded-lg shadow-sm border border-gray-100">{t.transactionId}</p>
                              </div>
                           </div>
                         ))}
                      </div>
                    ) : (
                      <div className="text-center py-20 opacity-30">
                        <i className="fa-solid fa-receipt text-6xl mb-4"></i>
                        <p className="font-black text-lg uppercase tracking-widest">No Transactions Recorded</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-20 opacity-30">
                      <i className="fa-solid fa-user-tag text-6xl mb-4"></i>
                      <p className="font-black text-lg uppercase tracking-widest">Select a student hero to continue</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Payment Form */}
        <div className="space-y-6">
           {selectedStudent ? (
             <div className="bg-indigo-950 p-8 rounded-[3.5rem] shadow-2xl text-white relative overflow-hidden animate-slide-up sticky top-8 border border-white/10">
                <h3 className="text-2xl font-black mb-8 uppercase tracking-tighter flex items-center gap-3">
                   <i className="fa-solid fa-shield-halved text-emerald-400"></i>
                   Secure Payment
                </h3>

                <div className="bg-white/10 rounded-3xl p-6 mb-8 border border-white/5 backdrop-blur-md">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center font-black text-indigo-300">
                         {selectedStudent.name.charAt(0)}
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase text-indigo-300 tracking-widest">Target Profile</p>
                         <p className="text-lg font-black leading-none mt-1">{selectedStudent.name}</p>
                      </div>
                   </div>
                   <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                      <div className="text-center flex-1 border-r border-white/10">
                         <p className="text-[8px] font-black uppercase text-indigo-400">Total Due</p>
                         <p className="font-black text-xl">₹{selectedStudent.totalFees}</p>
                      </div>
                      <div className="text-center flex-1">
                         <p className="text-[8px] font-black uppercase text-rose-400">Pending</p>
                         <p className="font-black text-xl text-rose-400">₹{selectedStudent.totalFees - selectedStudent.paidFees}</p>
                      </div>
                   </div>
                </div>

                <form onSubmit={handlePayment} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-indigo-300 tracking-widest ml-1">Payment Amount (₹)</label>
                      <input 
                        required type="number" 
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 outline-none focus:bg-black/60 focus:border-emerald-500 font-black text-2xl shadow-inner transition-all"
                        value={paymentAmount || ''}
                        onChange={e => setPaymentAmount(Number(e.target.value))}
                        placeholder="0.00"
                        max={selectedStudent.totalFees - selectedStudent.paidFees}
                      />
                   </div>

                   <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase text-indigo-300 tracking-widest ml-1">Payment Protocol</p>
                      <div className="grid grid-cols-2 gap-3">
                         <button 
                            type="button" 
                            onClick={() => { setPaymentMode(PaymentMode.ONLINE); setPaymentMethod('UPI'); }}
                            className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${paymentMode === PaymentMode.ONLINE ? 'bg-emerald-500 border-emerald-400 text-white shadow-xl' : 'bg-white/5 border-white/10 text-gray-500'}`}
                         >
                            <i className="fa-solid fa-wifi mr-2"></i> Online
                         </button>
                         <button 
                            type="button" 
                            onClick={() => { setPaymentMode(PaymentMode.OFFLINE); setPaymentMethod('Cash'); }}
                            className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${paymentMode === PaymentMode.OFFLINE ? 'bg-amber-500 border-amber-400 text-white shadow-xl' : 'bg-white/5 border-white/10 text-gray-500'}`}
                         >
                            <i className="fa-solid fa-vault mr-2"></i> Offline
                         </button>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-indigo-300 tracking-widest ml-1">Payment Method</label>
                      <select 
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-emerald-500 font-black text-sm appearance-none cursor-pointer"
                        value={paymentMethod}
                        onChange={e => setPaymentMethod(e.target.value)}
                      >
                         {paymentMode === PaymentMode.ONLINE ? (
                           <>
                             <option className="bg-indigo-950" value="UPI">GooglePay / PhonePe (UPI)</option>
                             <option className="bg-indigo-950" value="Card">Visa / MasterCard (Debit/Credit)</option>
                             <option className="bg-indigo-950" value="NetBanking">Net Banking</option>
                           </>
                         ) : (
                           <>
                             <option className="bg-indigo-950" value="Cash">Physical Cash</option>
                             <option className="bg-indigo-950" value="Cheque">Bank Cheque</option>
                             <option className="bg-indigo-950" value="Draft">Demand Draft</option>
                           </>
                         )}
                      </select>
                   </div>

                   <button 
                      disabled={isProcessing || (selectedStudent.totalFees - selectedStudent.paidFees <= 0)}
                      type="submit" 
                      className={`w-full py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all transform active:scale-95 disabled:opacity-30 ${
                        paymentMode === PaymentMode.ONLINE ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500'
                      }`}
                   >
                      {isProcessing ? (
                        <span className="flex items-center justify-center gap-3">
                           <i className="fa-solid fa-spinner fa-spin"></i>
                           Connecting Gateway...
                        </span>
                      ) : (
                        (selectedStudent.totalFees - selectedStudent.paidFees <= 0) ? 'Fees Fully Paid' : 'Initialize Payment'
                      )}
                   </button>
                </form>

                {/* Secure Badge */}
                <div className="mt-8 pt-8 border-t border-white/5 text-center flex flex-col items-center">
                   <div className="flex items-center gap-2 text-white/40 mb-2">
                      <i className="fa-solid fa-lock text-[10px]"></i>
                      <p className="text-[8px] font-black uppercase tracking-[0.3em]">AES-256 Encrypted</p>
                   </div>
                   <div className="flex gap-4 opacity-20 grayscale">
                      <i className="fa-brands fa-cc-visa text-xl"></i>
                      <i className="fa-brands fa-cc-mastercard text-xl"></i>
                      <i className="fa-brands fa-google-pay text-xl"></i>
                   </div>
                </div>
             </div>
           ) : (
             <div className="bg-white p-16 rounded-[4rem] text-center border-4 border-dashed border-indigo-50 flex flex-col items-center justify-center opacity-40">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-4xl text-indigo-200 mb-6">
                   <i className="fa-solid fa-credit-card"></i>
                </div>
                <p className="font-black text-indigo-900 uppercase tracking-widest">Select Student Registry</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default FeesManager;
