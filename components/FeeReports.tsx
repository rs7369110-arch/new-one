
import React, { useState } from 'react';
import { Student } from '../types';

interface FeeReportsProps {
  students: Student[];
}

declare var html2pdf: any;

const FeeReports: React.FC<FeeReportsProps> = ({ students }) => {
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
    const element = document.getElementById('fee-report-table');
    if (!element) return;
    setIsExporting(true);
    const opt = {
      margin: 10,
      filename: `Academy_Fee_Report_${filter}_${new Date().toLocaleDateString()}.pdf`,
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
          <h1 className="text-3xl font-black text-indigo-900 tracking-tighter">Finance Audit Center</h1>
          <p className="text-emerald-500 font-medium italic">Monitor paid and unpaid treasury records. 📊</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-emerald-100">
            {(['ALL', 'PAID', 'PARTIAL', 'UNPAID'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${filter === f ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-400 hover:bg-emerald-50'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <button 
            disabled={isExporting}
            onClick={handleExportPDF}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black shadow-xl flex items-center gap-3 transition-all transform hover:scale-105"
          >
            <i className={`fa-solid ${isExporting ? 'fa-spinner fa-spin' : 'fa-file-pdf'} text-xl`}></i>
            {isExporting ? 'Generating...' : 'Export Audit PDF'}
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[3.5rem] shadow-2xl border border-emerald-50 overflow-hidden" id="fee-report-table">
        <div className="p-8 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between">
           <h3 className="text-xl font-black text-emerald-900 flex items-center gap-3">
              <i className="fa-solid fa-clipboard-list"></i>
              Treasury Ledger: {filter}
           </h3>
           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Date: {new Date().toLocaleDateString()}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-emerald-900 text-white text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-5">Adm ID</th>
                <th className="px-8 py-5">Hero Name</th>
                <th className="px-8 py-5">Class</th>
                <th className="px-8 py-5">Total target</th>
                <th className="px-8 py-5">Collected</th>
                <th className="px-8 py-5">Outstanding</th>
                <th className="px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50">
              {filteredStudents.map(s => {
                const balance = s.totalFees - s.paidFees;
                return (
                  <tr key={s.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-8 py-6 font-bold text-gray-400">{s.admissionNo}</td>
                    <td className="px-8 py-6 font-black text-indigo-900">{s.name}</td>
                    <td className="px-8 py-6 text-sm font-bold text-gray-500">Class {s.grade}</td>
                    <td className="px-8 py-6 font-bold">₹{s.totalFees.toLocaleString()}</td>
                    <td className="px-8 py-6 font-black text-emerald-600">₹{s.paidFees.toLocaleString()}</td>
                    <td className="px-8 py-6 font-black text-rose-500">₹{balance.toLocaleString()}</td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        balance <= 0 ? 'bg-emerald-100 text-emerald-700' : balance === s.totalFees ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {balance <= 0 ? 'Fully Paid' : balance === s.totalFees ? 'Unpaid' : 'Partial'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeeReports;
