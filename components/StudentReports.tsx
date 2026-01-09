
import React, { useState, useMemo } from 'react';
import { Student, AttendanceRecord } from '../types';
import Logo from './Logo';

interface StudentReportsProps {
  students: Student[];
  attendance: AttendanceRecord[];
}

declare var html2pdf: any;

const StudentReports: React.FC<StudentReportsProps> = ({ students, attendance }) => {
  const [selectedGrade, setSelectedGrade] = useState('1');
  const [reportType, setReportType] = useState<'ROSTER' | 'ATTENDANCE' | 'MONTHLY_PERCENTAGE' | 'MONTHLY_REGISTER'>('ROSTER');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [showAbsenteesOnly, setShowAbsenteesOnly] = useState(false);

  // Helper to get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const daysArray = useMemo(() => {
    const count = getDaysInMonth(selectedYear, selectedMonth);
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [selectedYear, selectedMonth]);

  const filteredStudents = useMemo(() => {
    let list = selectedGrade === 'All' 
      ? students 
      : students.filter(s => s.grade === selectedGrade);

    if (reportType === 'ATTENDANCE' && showAbsenteesOnly) {
      list = list.filter(s => {
        const record = attendance.find(a => a.studentId === s.id && a.date === reportDate);
        return record?.status === 'ABSENT';
      });
    }

    return list.sort((a, b) => (parseInt(a.rollNo) || 0) - (parseInt(b.rollNo) || 0));
  }, [students, selectedGrade, reportType, showAbsenteesOnly, attendance, reportDate]);

  const getDailyStatus = (studentId: string, dateStr: string) => {
    const record = attendance.find(a => a.studentId === studentId && a.date === dateStr);
    if (!record) return '-';
    if (record.status === 'PRESENT') return 'P';
    if (record.status === 'ABSENT') return 'A';
    if (record.status === 'LATE') return 'L';
    return '-';
  };

  const getMonthlyStats = (studentId: string) => {
    const monthStr = selectedMonth.toString().padStart(2, '0');
    const prefix = `${selectedYear}-${monthStr}`;
    const studentMonthRecords = attendance.filter(a => a.studentId === studentId && a.date.startsWith(prefix));
    const workingDaysCount = Array.from(new Set(attendance.filter(a => a.date.startsWith(prefix)).map(a => a.date))).length;
    const presentDays = studentMonthRecords.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
    const percentage = workingDaysCount > 0 ? (presentDays / workingDaysCount) * 100 : 0;
    return { presentDays, workingDays: workingDaysCount, percentage };
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('report-printable-area');
    if (!element || filteredStudents.length === 0) return;

    setIsDownloadingPDF(true);
    const opt = {
      margin: [5, 5, 5, 5],
      filename: `Academy_Report_${reportType}_Class${selectedGrade}_${selectedMonth}_${selectedYear}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { 
        scale: 2.5, 
        useCORS: true, 
        letterRendering: true, 
        backgroundColor: '#ffffff',
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error(err);
      alert("PDF generation failed.");
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-900 text-white rounded-[2rem] flex items-center justify-center text-3xl shadow-2xl">
             <i className="fa-solid fa-file-contract"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-indigo-900 tracking-tighter uppercase leading-none">Registry Archives</h1>
            <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em] mt-2 italic">Class-Wise Secure Reporting • {filteredStudents.length} Records</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex p-1.5 bg-white border border-indigo-50 rounded-[1.5rem] shadow-sm overflow-x-auto max-w-full">
             {(['ROSTER', 'ATTENDANCE', 'MONTHLY_PERCENTAGE', 'MONTHLY_REGISTER'] as const).map((type) => (
               <button 
                 key={type}
                 onClick={() => setReportType(type)}
                 className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0 ${reportType === type ? 'bg-indigo-950 text-white shadow-lg' : 'text-gray-400 hover:text-indigo-900'}`}
               >
                  {type.replace('_', ' ')}
               </button>
             ))}
          </div>

          <select 
            className="px-6 py-3.5 rounded-2xl bg-white border-2 border-indigo-50 outline-none font-black text-[10px] uppercase text-indigo-900 shadow-sm focus:border-indigo-400 transition-all cursor-pointer"
            value={selectedGrade}
            onChange={e => setSelectedGrade(e.target.value)}
          >
            <option value="All">All Classes</option>
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n.toString()}>Class {n}</option>)}
          </select>

          {(reportType === 'MONTHLY_PERCENTAGE' || reportType === 'MONTHLY_REGISTER') && (
            <div className="flex gap-2">
               <select 
                 className="px-4 py-3 rounded-2xl bg-white border-2 border-indigo-50 outline-none font-black text-[10px] uppercase text-indigo-900 shadow-sm"
                 value={selectedMonth}
                 onChange={e => setSelectedMonth(Number(e.target.value))}
               >
                 {monthNames.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
               </select>
               <select 
                 className="px-4 py-3 rounded-2xl bg-white border-2 border-indigo-50 outline-none font-black text-[10px] uppercase text-indigo-900 shadow-sm"
                 value={selectedYear}
                 onChange={e => setSelectedYear(Number(e.target.value))}
               >
                 {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
               </select>
            </div>
          )}

          {reportType === 'ATTENDANCE' && (
            <input 
              type="date"
              className="px-6 py-3 rounded-2xl bg-white border-2 border-indigo-50 outline-none font-black text-[10px] uppercase text-indigo-600 shadow-sm"
              value={reportDate}
              onChange={e => setReportDate(e.target.value)}
            />
          )}

          <button 
            disabled={isDownloadingPDF}
            onClick={handleExportPDF}
            className="px-10 py-3.5 bg-indigo-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-black transition-all flex items-center gap-3 disabled:opacity-50"
          >
            <i className={`fa-solid ${isDownloadingPDF ? 'fa-spinner fa-spin' : 'fa-file-pdf'} text-lg text-amber-400`}></i>
            {isDownloadingPDF ? 'Sealing...' : 'Download Register'}
          </button>
        </div>
      </header>

      {/* Printable Area */}
      <div 
        className="bg-white rounded-[3rem] shadow-2xl border-4 border-indigo-50 overflow-hidden relative typewriter-report" 
        id="report-printable-area"
        style={{ fontFamily: "'Courier Prime', monospace" }}
      >
        <div className="p-10 border-b-2 border-black flex flex-col md:flex-row md:items-center justify-between gap-8">
           <div className="flex items-center gap-8">
              <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center p-2 grayscale">
                 <Logo size="md" />
              </div>
              <div>
                 <h3 className="text-3xl font-bold text-black uppercase tracking-tight leading-none">
                   {reportType === 'ROSTER' ? 'STUDENT MASTER LEDGER' : 
                    reportType === 'ATTENDANCE' ? 'DAILY ATTENDANCE LOG' : 
                    reportType === 'MONTHLY_PERCENTAGE' ? 'MONTHLY ANALYTICS SUMMARY' : 'MONTHLY ATTENDANCE REGISTER'}
                 </h3>
                 <p className="text-[10px] font-bold text-black uppercase tracking-widest mt-2">
                   DIGITAL EDUCATION OFFICIAL • CLASS: {selectedGrade} • {monthNames[selectedMonth-1].toUpperCase()} {selectedYear}
                 </p>
              </div>
           </div>
           <div className="text-right text-[10px] font-bold">
              PRINTED: {new Date().toLocaleString()}<br/>
              RECORDS: {filteredStudents.length} ACTIVE HEROES
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border-b-2 border-black">
            <thead>
              <tr className="bg-black text-white">
                <th className="px-4 py-3 text-[10px] font-bold uppercase border border-black text-center w-12">RL</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase border border-black min-w-[150px]">STUDENT NAME</th>
                
                {reportType === 'MONTHLY_REGISTER' ? (
                  daysArray.map(day => (
                    <th key={day} className="px-1 py-3 text-[8px] font-bold uppercase border border-black text-center w-6">{day}</th>
                  ))
                ) : reportType === 'MONTHLY_PERCENTAGE' ? (
                  <>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase border border-black text-center">WORKING</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase border border-black text-center">PRESENT</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase border border-black text-center">PERCENT %</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase border border-black">IDENTITY NO</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase border border-black">CONTACT</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase border border-black text-center">STATUS</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="text-black font-bold">
              {filteredStudents.map((s) => {
                const monthly = getMonthlyStats(s.id);
                
                return (
                  <tr key={s.id} className="border border-black">
                    <td className="px-2 py-2 border border-black text-center text-xs">{s.rollNo}</td>
                    <td className="px-4 py-2 border border-black text-xs uppercase truncate max-w-[150px]">{s.name}</td>

                    {reportType === 'MONTHLY_REGISTER' ? (
                      daysArray.map(day => {
                        const dateStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                        const status = getDailyStatus(s.id, dateStr);
                        return (
                          <td key={day} className={`px-0 py-2 border border-black text-center text-[9px] ${
                            status === 'A' ? 'text-rose-600 underline' : 
                            status === 'P' ? 'text-emerald-600' : 
                            status === 'L' ? 'text-amber-500' : 'text-gray-200'
                          }`}>
                            {status === '-' ? '·' : status}
                          </td>
                        );
                      })
                    ) : reportType === 'MONTHLY_PERCENTAGE' ? (
                      <>
                        <td className="px-4 py-2 border border-black text-center text-xs">{monthly.workingDays}</td>
                        <td className="px-4 py-2 border border-black text-center text-xs">{monthly.presentDays}</td>
                        <td className="px-4 py-2 border border-black text-center text-sm font-black">
                          {monthly.percentage.toFixed(1)}%
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-2 border border-black text-xs">{s.admissionNo}</td>
                        <td className="px-4 py-2 border border-black text-xs">{s.phone}</td>
                        <td className="px-4 py-2 border border-black text-center text-xs">
                          {reportType === 'ATTENDANCE' ? (
                            <span className={getDailyStatus(s.id, reportDate) === 'A' ? 'text-rose-600 underline' : ''}>
                              {attendance.find(a => a.studentId === s.id && a.date === reportDate)?.status || 'NONE'}
                            </span>
                          ) : (
                            <span>ACTIVE</span>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="p-8 flex justify-between items-end">
           <div className="text-[10px] uppercase leading-relaxed font-bold">
              LEGEND: (P) PRESENT | (A) ABSENT | (L) LATE<br/>
              * COMPUTER GENERATED ARCHIVE<br/>
              * DIGITAL EDUCATION SECRETARIAT
           </div>
           <div className="text-right">
              <div className="w-40 h-0.5 bg-black mb-1"></div>
              <p className="text-[9px] font-bold uppercase">SECRETARY / SEAL</p>
           </div>
        </div>

        <div className="absolute bottom-2 left-0 w-full text-center text-[7px] uppercase tracking-[1em] opacity-30">
           CONFIDENTIAL OFFICIAL RECORD • EST 1994
        </div>
      </div>

      <div className="p-8 bg-indigo-950 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
         <div className="relative z-10 w-24 h-24 bg-white/10 rounded-[2rem] flex items-center justify-center text-5xl shadow-inner border border-white/20 backdrop-blur-xl">
            <i className="fa-solid fa-stamp text-amber-400"></i>
         </div>
         <div className="relative z-10 flex-1 text-center md:text-left">
            <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter">High-Resolution Analytics</h2>
            <p className="text-indigo-200 text-lg font-medium leading-relaxed italic opacity-80 max-w-2xl">
               "The Monthly Register generates a precision matrix of your entire class history. Export it to PDF to maintain permanent academic audit trails for parent verification."
            </p>
         </div>
         <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-10"></div>
      </div>

      <style>{`
        .typewriter-report table, .typewriter-report td, .typewriter-report th {
          border: 1px solid black !important;
        }
        @media print {
          body { background: white !important; }
          #report-printable-area { border: 2px solid black !important; box-shadow: none !important; margin: 0 !important; width: 100% !important; }
        }
      `}</style>
    </div>
  );
};

export default StudentReports;
