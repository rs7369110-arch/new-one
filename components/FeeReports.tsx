
import React, { useState } from 'react';
import { Student, FeeTransaction, PaymentMode } from '../types';

interface FeeReportsProps {
  students: Student[];
  transactions: FeeTransaction[];
}

declare var html2pdf: any;

const FeeReports: React.FC<FeeReportsProps> = ({ students, transactions }) => {
  const [filter, setFilter] = useState<'ALL' | 'PAID' | 'UNPAID' | 'PARTIAL'>('ALL');
  const [isExporting, setIsExporting] = useState(false);

  const filteredStudents = students.filter(s => {
    const balance = s.totalFees - s.paidFees;
    if (filter === 'PAID') return balance <= 0 && s.totalFees > 0;
    if (filter === 'UNPAID') return s.paidFees === 0 && s.totalFees > 0;
    if (filter === 'PARTIAL') return s.paidFees > 0 && balance > 0;
    return true;
  });

  const handleExportPDF = async () => {
    const element = document.getElementById('fee-audit-report');
    if (!element) return;
    setIsExporting(true);
    const opt = {
      margin: 10,
      filename: `Academy_Treasury_Audit_${filter}_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    try {
      await html2pdf().set(opt).from(element).save();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-indigo-900 tracking-tighter uppercase leading-none">Financial Audit Log</h1>
          <p className="text-emerald-500 font-medium italic mt-2">Class-wise treasury status tracking. 📊</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-indigo-50">
            {(['ALL', 'PAID', 'PARTIAL', 'UNPAID'] as const).map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)} 
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === f ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-indigo-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button 
            disabled={isExporting}
            onClick={handleExportPDF}
            className="px-8 py-4 bg-indigo-950 text-white rounded-[2rem] font-black shadow-2xl flex items-center gap-3 transition-all hover:bg-black disabled:opacity-50"
          >
            <i className={`fa-solid ${isExporting ? 'fa-spinner fa-spin' : 'fa-file-invoice-dollar'} text-lg`}></i>
            Export Audit
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[3.5rem] shadow-2xl border border-indigo-50 overflow-hidden" id="fee-audit-report">
        <div className="p-8 bg-indigo-50/30 border-b border-indigo-100 flex items-center justify-between">
           <h3 className="text-xl font-black text-indigo-950 uppercase tracking-tighter">Treasury Summary: {filter}</h3>
           <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Official Academy Audit Record</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-indigo-950 text-white text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-5">Hero Profile</th>
                <th className="px-8 py-5">Target (₹)</th>
                <th className="px-8 py-5">Recovered (₹)</th>
                <th className="px-8 py-5">Outstanding (₹)</th>
                <th className="px-8 py-5">Latest Payment Mode</th>
                <th className="px-8 py-5 text-right">Registry Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-50">
              {filteredStudents.map(s => {
                const balance = s.totalFees - s.paidFees;
                const lastTxn = transactions.filter(t => t.studentId === s.id).pop();
                
                return (
                  <tr key={s.id} className="hover:bg-indigo-50/10 group transition-all">
                    <td className="px-8 py-6">
                       <p className="font-black text-gray-800">{s.name}</p>
                       <p className="text-[9px] font-bold text-gray-400 uppercase">Class {s.grade} • Roll {s.rollNo}</p>
                    </td>
                    <td className="px-8 py-6 font-bold text-gray-600">₹{s.totalFees}</td>
                    <td className="px-8 py-6 font-black text-emerald-600">₹{s.paidFees}</td>
                    <td className="px-8 py-6 font-black text-rose-500">₹{balance}</td>
                    <td className="px-8 py-6">
                       {lastTxn ? (
                         <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-sm border ${
                              lastTxn.mode === PaymentMode.ONLINE ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>
                               {lastTxn.mode}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 italic">via {lastTxn.method}</span>
                         </div>
                       ) : (
                         <span className="text-[10px] font-bold text-gray-300 italic">No Registry Data</span>
                       )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${
                        balance <= 0 ? 'bg-emerald-100 text-emerald-700' : balance === s.totalFees ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {balance <= 0 ? 'CLEARED' : balance === s.totalFees ? 'OVERDUE' : 'PARTIAL'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center opacity-30">
                    <p className="font-black text-2xl uppercase tracking-widest">Registry Clean</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeeReports;
