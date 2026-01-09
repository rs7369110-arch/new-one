
import React, { useState, useMemo } from 'react';
import { Student, AttendanceRecord } from '../types';
import Logo from './Logo';

interface StudentReportsProps {
  students: Student[];
  attendance: AttendanceRecord[];
}

declare var html2pdf: any;

const StudentReports: React.FC<StudentReportsProps> = ({ students, attendance }) => {
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [reportType, setReportType] = useState<'ROSTER' | 'ATTENDANCE' | 'MONTHLY_PERCENTAGE'>('ROSTER');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [showAbsenteesOnly, setShowAbsenteesOnly] = useState(false);

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

  const getDailyStatus = (studentId: string) => {
    const record = attendance.find(a => a.studentId === studentId && a.date === reportDate);
    return record ? record.status : 'NOT MARKED';
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
      margin: [10, 10, 10, 10],
      filename: `Digital_Education_Report_${reportType}_${selectedGrade}_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { 
        scale: 3, // Increased scale for extreme clarity
        useCORS: true, 
        letterRendering: true, 
        backgroundColor: '#ffffff',
        logging: false
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
            <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em] mt-2 italic">Class-Wise Secure Reporting • {filteredStudents.length} Entries</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex p-1.5 bg-white border border-indigo-50 rounded-[1.5rem] shadow-sm">
             {(['ROSTER', 'ATTENDANCE', 'MONTHLY_PERCENTAGE'] as const).map((type) => (
               <button 
                 key={type}
                 onClick={() => setReportType(type)}
                 className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${reportType === type ? 'bg-indigo-950 text-white shadow-lg' : 'text-gray-400 hover:text-indigo-900'}`}
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

          {reportType === 'ATTENDANCE' && (
            <>
              <input 
                type="date"
                className="px-6 py-3 rounded-2xl bg-white border-2 border-indigo-50 outline-none font-black text-[10px] uppercase text-indigo-600 shadow-sm"
                value={reportDate}
                onChange={e => setReportDate(e.target.value)}
              />
              <button 
                onClick={() => setShowAbsenteesOnly(!showAbsenteesOnly)}
                className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${showAbsenteesOnly ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white border-indigo-50 text-gray-400'}`}
              >
                {showAbsenteesOnly ? 'Showing Absentees' : 'All Students'}
              </button>
            </>
          )}

          {reportType === 'MONTHLY_PERCENTAGE' && (
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

          <button 
            disabled={isDownloadingPDF}
            onClick={handleExportPDF}
            className="px-10 py-3.5 bg-indigo-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-black transition-all flex items-center gap-3 disabled:opacity-50"
          >
            <i className={`fa-solid ${isDownloadingPDF ? 'fa-spinner fa-spin' : 'fa-file-pdf'} text-lg text-amber-400`}></i>
            {isDownloadingPDF ? 'Sealing...' : 'Generate Crystal PDF'}
          </button>
        </div>
      </header>

      {/* Printable Area with Typewriter Font */}
      <div 
        className="bg-white rounded-[3rem] shadow-2xl border-4 border-indigo-50 overflow-hidden relative typewriter-report" 
        id="report-printable-area"
        style={{ fontFamily: "'Courier Prime', monospace" }}
      >
        <div className="p-12 border-b-2 border-black flex flex-col md:flex-row md:items-center justify-between gap-8">
           <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-white border-4 border-black flex items-center justify-center p-3 grayscale">
                 <Logo size="md" />
              </div>
              <div>
                 <h3 className="text-4xl font-bold text-black uppercase tracking-tight">
                   {reportType === 'ROSTER' ? 'STUDENT MASTER LEDGER' : 
                    reportType === 'ATTENDANCE' ? (showAbsenteesOnly ? 'DAILY ABSENCE LOG' : 'DAILY ATTENDANCE LOG') : 'MONTHLY ANALYTICS SUMMARY'}
                 </h3>
                 <p className="text-sm font-bold text-black uppercase tracking-widest mt-2">
                   DIGITAL EDUCATION OFFICIAL DOCUMENT • CLASS: {selectedGrade}
                 </p>
                 <p className="text-xs text-black mt-1">
                   PERIOD: {reportType === 'MONTHLY_PERCENTAGE' ? `${monthNames[selectedMonth-1]} ${selectedYear}` : reportDate}
                 </p>
              </div>
           </div>
           
           <div className="border-4 border-black p-6 flex flex-col items-center justify-center min-w-[150px]">
              <p className="text-[10px] font-bold uppercase mb-1">RECORD COUNT</p>
              <p className="text-4xl font-bold">{filteredStudents.length}</p>
           </div>
        </div>

        <div className="overflow-x-auto px-6 py-6">
          <table className="w-full text-left border-collapse border-2 border-black">
            <thead>
              <tr className="bg-black text-white">
                <th className="px-6 py-4 text-xs font-bold uppercase border border-black w-24 text-center">ROLL</th>
                <th className="px-6 py-4 text-xs font-bold uppercase border border-black">STUDENT NAME</th>
                {reportType === 'MONTHLY_PERCENTAGE' ? (
                  <>
                    <th className="px-6 py-4 text-xs font-bold uppercase border border-black text-center">WORKING</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase border border-black text-center">PRESENT</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase border border-black text-center">MERIT %</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-4 text-xs font-bold uppercase border border-black">IDENTITY NO</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase border border-black">CONTACT</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase border border-black text-center">STATUS</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="text-black font-bold">
              {filteredStudents.map((s) => {
                const dailyStatus = getDailyStatus(s.id);
                const monthly = getMonthlyStats(s.id);
                
                return (
                  <tr key={s.id} className="border border-black">
                    <td className="px-6 py-4 border border-black text-center text-lg">{s.rollNo}</td>
                    <td className="px-6 py-4 border border-black text-lg uppercase">{s.name}</td>

                    {reportType === 'MONTHLY_PERCENTAGE' ? (
                      <>
                        <td className="px-6 py-4 border border-black text-center">{monthly.workingDays}</td>
                        <td className="px-6 py-4 border border-black text-center">{monthly.presentDays}</td>
                        <td className="px-6 py-4 border border-black text-center text-lg font-black">
                          {monthly.percentage.toFixed(1)}%
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 border border-black">{s.admissionNo}</td>
                        <td className="px-6 py-4 border border-black">{s.phone}</td>
                        <td className="px-6 py-4 border border-black text-center">
                          {reportType === 'ATTENDANCE' ? (
                            <span className={dailyStatus === 'ABSENT' ? 'text-rose-600 underline decoration-double' : ''}>
                              {dailyStatus}
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
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-2xl opacity-40 uppercase font-black tracking-widest border border-black">
                    NO RECORDS FOUND FOR THIS FILTER
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-10 border-t-2 border-black flex justify-between items-end">
           <div className="text-xs uppercase leading-relaxed">
              * COMPUTER GENERATED RECORD<br/>
              * VERIFIED BY ACADEMY SECRETARIAT<br/>
              * DIGITAL EDUCATION • EST 1994
           </div>
           <div className="text-right">
              <div className="w-48 h-0.5 bg-black mb-2"></div>
              <p className="text-xs font-bold uppercase">OFFICIAL SEAL / SIGNATURE</p>
           </div>
        </div>

        <div className="absolute bottom-4 left-0 w-full text-center text-[8px] uppercase tracking-[0.8em] opacity-20">
           CONFIDENTIAL ARCHIVE RECORD • CONFIDENTIAL ARCHIVE RECORD
        </div>
      </div>

      <div className="p-12 bg-indigo-950 rounded-[4rem] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
         <div className="relative z-10 w-32 h-32 bg-white/10 rounded-[2.5rem] flex items-center justify-center text-6xl shadow-inner border border-white/20 backdrop-blur-xl">
            <i className="fa-solid fa-stamp text-amber-400"></i>
         </div>
         <div className="relative z-10 flex-1 text-center md:text-left">
            <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Crystal Clear Registry</h2>
            <p className="text-indigo-200 text-xl font-medium leading-relaxed italic opacity-80 max-w-2xl">
               "Professional typewriter-style PDF reporting for institutional permanence. Use the Daily Absence Log for immediate administrative follow-up with parent contacts."
            </p>
         </div>
         <div className="absolute top-[-10%] left-[-10%] w-80 h-80 bg-indigo-500 rounded-full blur-[140px] opacity-10"></div>
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
