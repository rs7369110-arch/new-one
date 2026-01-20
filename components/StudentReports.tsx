
import React, { useState, useMemo, useRef } from 'react';
import { Student, AttendanceRecord, SchoolBranding, TeacherAssignment } from '../types';
import Logo from './Logo';

interface StudentReportsProps {
  students: Student[];
  attendance: AttendanceRecord[];
  branding: SchoolBranding;
  teachers: TeacherAssignment[];
}

declare var html2pdf: any;

const StudentReports: React.FC<StudentReportsProps> = ({ students, attendance, branding, teachers }) => {
  const [selectedGrade, setSelectedGrade] = useState('1');
  const [reportType, setReportType] = useState<'ROSTER' | 'ATTENDANCE' | 'MONTHLY_PERCENTAGE' | 'MONTHLY_REGISTER' | 'TEACHER_JOINING' | 'TEACHER_BLANK_FORM'>('ROSTER');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [showAbsenteesOnly, setShowAbsenteesOnly] = useState(false);

  const printableRef = useRef<HTMLDivElement>(null);

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

  const selectedTeacher = useMemo(() => teachers.find(t => t.id === selectedTeacherId), [teachers, selectedTeacherId]);

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
    if (!element) return;

    if (reportType === 'TEACHER_JOINING' && !selectedTeacher) {
      alert("Please select a teacher first!");
      return;
    }

    setIsDownloadingPDF(true);
    const isPortrait = reportType === 'TEACHER_JOINING' || reportType === 'TEACHER_BLANK_FORM';
    
    const opt = {
      margin: isPortrait ? [10, 10, 10, 10] : [5, 5, 5, 5],
      filename: reportType === 'TEACHER_BLANK_FORM' 
        ? `Blank_Teacher_Joining_Form.pdf`
        : reportType === 'TEACHER_JOINING'
          ? `Teacher_Joining_Form_${selectedTeacher?.teacherName.replace(/\s+/g, '_')}.pdf`
          : `${branding.name || 'Academy'}_Report_${reportType}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { 
        scale: 2.5, 
        useCORS: true, 
        letterRendering: true, 
        backgroundColor: '#ffffff',
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: isPortrait ? 'portrait' : 'landscape' 
      }
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
            <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em] mt-2 italic">Official Academy Reporting Node</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex p-1.5 bg-white border border-indigo-50 rounded-[1.5rem] shadow-sm overflow-x-auto max-w-full">
             {(['ROSTER', 'ATTENDANCE', 'MONTHLY_PERCENTAGE', 'MONTHLY_REGISTER', 'TEACHER_JOINING', 'TEACHER_BLANK_FORM'] as const).map((type) => (
               <button 
                 key={type}
                 onClick={() => setReportType(type)}
                 className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0 ${reportType === type ? 'bg-indigo-950 text-white shadow-lg' : 'text-gray-400 hover:text-indigo-900'}`}
               >
                  {type.replace(/_/g, ' ')}
               </button>
             ))}
          </div>

          {reportType !== 'TEACHER_JOINING' && reportType !== 'TEACHER_BLANK_FORM' && (
            <select 
              className="px-6 py-3.5 rounded-2xl bg-white border-2 border-indigo-50 outline-none font-black text-[10px] uppercase text-indigo-900 shadow-sm focus:border-indigo-400 transition-all cursor-pointer"
              value={selectedGrade}
              onChange={e => setSelectedGrade(e.target.value)}
            >
              <option value="All">All Classes</option>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n.toString()}>Class {n}</option>)}
            </select>
          )}

          {reportType === 'TEACHER_JOINING' && (
            <select 
              className="px-6 py-3.5 rounded-2xl bg-white border-2 border-indigo-50 outline-none font-black text-[10px] uppercase text-indigo-900 shadow-sm focus:border-indigo-400 transition-all cursor-pointer"
              value={selectedTeacherId}
              onChange={e => setSelectedTeacherId(e.target.value)}
            >
              <option value="">Select Teacher...</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.teacherName} ({t.employeeId})</option>)}
            </select>
          )}

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
            {isDownloadingPDF ? 'Sealing...' : (reportType === 'TEACHER_BLANK_FORM' ? 'Print Blank Form' : 'Download Register')}
          </button>
        </div>
      </header>

      {/* Printable Area */}
      <div 
        className="bg-white rounded-[3rem] shadow-2xl border-4 border-indigo-50 overflow-hidden relative typewriter-report" 
        id="report-printable-area"
        style={{ fontFamily: (reportType === 'TEACHER_JOINING' || reportType === 'TEACHER_BLANK_FORM') ? "'Inter', sans-serif" : "'Courier Prime', monospace" }}
      >
        {reportType === 'TEACHER_BLANK_FORM' ? (
          /* BLANK TEACHER JOINING FORM TEMPLATE FOR PRINT */
          <div className="p-12 md:p-16 max-w-[210mm] mx-auto bg-white min-h-[297mm] flex flex-col text-indigo-950">
             {/* Letterhead */}
             <div className="flex items-center justify-between border-b-4 border-indigo-950 pb-8 mb-8">
                <div className="flex items-center gap-6">
                   <div className="w-20 h-20 bg-white border-2 border-indigo-50 rounded-2xl flex items-center justify-center p-2 shadow-sm overflow-hidden grayscale">
                      {branding.logo ? <img src={branding.logo} className="w-full h-full object-contain" /> : <Logo size="md" />}
                   </div>
                   <div>
                      <h2 className="text-3xl font-black uppercase tracking-tighter">{branding.name || 'ACADEMY'}</h2>
                      <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">{branding.tagline || 'OFFICIAL FACULTY REGISTRY'}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black uppercase text-gray-400">Printable Template</p>
                   <p className="text-[9px] font-bold text-gray-400 mt-1">Ref: {new Date().getFullYear()}/JOIN/01</p>
                </div>
             </div>

             <div className="flex-1">
                <h3 className="text-xl font-black text-center text-white bg-indigo-950 py-3 rounded-xl mb-10 uppercase tracking-[0.3em]">Faculty Appointment Form</h3>

                <div className="flex justify-end mb-8">
                   <div className="w-32 h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-center p-4">
                      <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest leading-relaxed">PASTE RECENT<br/>PASSPORT SIZE<br/>PHOTOGRAPH</p>
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="grid grid-cols-1 gap-6">
                      <div className="flex items-end gap-3 w-full">
                         <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">1. Full Name of Candidate:</span>
                         <div className="flex-1 border-b-2 border-gray-100 min-h-[24px]"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-10">
                        <div className="flex items-end gap-3">
                           <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">2. Date of Birth:</span>
                           <div className="flex-1 border-b-2 border-gray-100 min-h-[24px]"></div>
                        </div>
                        <div className="flex items-end gap-3">
                           <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">3. Gender:</span>
                           <div className="flex-1 border-b-2 border-gray-100 min-h-[24px]"></div>
                        </div>
                      </div>
                      <div className="flex items-end gap-3">
                         <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">4. Father's / Husband's Name:</span>
                         <div className="flex-1 border-b-2 border-gray-100 min-h-[24px]"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-10">
                        <div className="flex items-end gap-3">
                           <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">5. Mobile Number:</span>
                           <div className="flex-1 border-b-2 border-gray-100 min-h-[24px]"></div>
                        </div>
                        <div className="flex items-end gap-3">
                           <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">6. Email Address:</span>
                           <div className="flex-1 border-b-2 border-gray-100 min-h-[24px]"></div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                         <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap mt-1">7. Residential Address:</span>
                         <div className="flex-1 border-b-2 border-gray-100 min-h-[50px]"></div>
                      </div>
                      <div className="flex items-end gap-3">
                         <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">8. Aadhaar Card Number:</span>
                         <div className="flex-1 border-b-2 border-gray-100 min-h-[24px]"></div>
                      </div>
                   </div>

                   <div className="pt-4">
                      <h4 className="text-xs font-black uppercase tracking-widest mb-4 border-l-4 border-indigo-900 pl-3">Academic Qualifications</h4>
                      <table className="w-full border-collapse">
                         <thead>
                            <tr className="bg-gray-50">
                               <th className="border-2 border-gray-200 p-2 text-[9px] font-black uppercase">Degree/Diploma</th>
                               <th className="border-2 border-gray-200 p-2 text-[9px] font-black uppercase">Board / University</th>
                               <th className="border-2 border-gray-200 p-2 text-[9px] font-black uppercase">Passing Year</th>
                               <th className="border-2 border-gray-200 p-2 text-[9px] font-black uppercase">Percentage (%)</th>
                            </tr>
                         </thead>
                         <tbody>
                            {[1, 2, 3, 4].map((i) => (
                               <tr key={i}>
                                  <td className="border-2 border-gray-200 p-4"></td>
                                  <td className="border-2 border-gray-200 p-4"></td>
                                  <td className="border-2 border-gray-200 p-4"></td>
                                  <td className="border-2 border-gray-200 p-4"></td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>

                   <div className="grid grid-cols-1 gap-6 pt-4">
                      <h4 className="text-xs font-black uppercase tracking-widest mb-2 border-l-4 border-indigo-900 pl-3">Appointment Details</h4>
                      <div className="grid grid-cols-2 gap-10">
                        <div className="flex items-end gap-3">
                           <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">9. Post Applied For:</span>
                           <div className="flex-1 border-b-2 border-gray-100 min-h-[24px]"></div>
                        </div>
                        <div className="flex items-end gap-3">
                           <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">10. Subject Mastery:</span>
                           <div className="flex-1 border-b-2 border-gray-100 min-h-[24px]"></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-10">
                        <div className="flex items-end gap-3">
                           <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">11. Expected Salary (₹):</span>
                           <div className="flex-1 border-b-2 border-gray-100 min-h-[24px]"></div>
                        </div>
                        <div className="flex items-end gap-3">
                           <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">12. Experience (Years):</span>
                           <div className="flex-1 border-b-2 border-gray-100 min-h-[24px]"></div>
                        </div>
                      </div>
                   </div>

                   <div className="pt-4">
                      <h4 className="text-xs font-black uppercase tracking-widest mb-4 border-l-4 border-indigo-900 pl-3">Bank Details for Payroll</h4>
                      <div className="grid grid-cols-2 gap-10 gap-y-6">
                        <div className="flex items-end gap-3">
                           <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Bank Name:</span>
                           <div className="flex-1 border-b-2 border-gray-100 min-h-[24px]"></div>
                        </div>
                        <div className="flex items-end gap-3">
                           <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Account Number:</span>
                           <div className="flex-1 border-b-2 border-gray-100 min-h-[24px]"></div>
                        </div>
                        <div className="flex items-end gap-3">
                           <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">IFSC Code:</span>
                           <div className="flex-1 border-b-2 border-gray-100 min-h-[24px]"></div>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="mt-12 p-6 border-2 border-indigo-50 rounded-2xl">
                   <p className="text-[10px] font-black uppercase tracking-widest mb-3">Declaration:</p>
                   <p className="text-[11px] text-gray-500 leading-relaxed text-justify italic">
                      "I hereby declare that all the information provided by me in this application form is true, complete and correct to the best of my knowledge and belief. I understand that in the event of any information being found false or incorrect at any stage, my candidature/appointment shall be liable to cancellation/termination without any notice."
                   </p>
                </div>
             </div>

             <div className="mt-20 flex justify-between items-end px-4 pb-10">
                <div className="text-center w-64">
                   <div className="h-10"></div>
                   <div className="w-full h-px bg-gray-900 mb-2"></div>
                   <p className="text-xs font-black uppercase">Signature of Candidate</p>
                   <p className="text-[8px] font-bold text-gray-400 mt-1">Date: ____/____/20____</p>
                </div>

                <div className="text-center w-64">
                   <div className="h-10"></div>
                   <div className="w-full h-px bg-indigo-900 mb-2"></div>
                   <p className="text-xs font-black uppercase text-indigo-900">Principal / Director Seal</p>
                   <p className="text-[8px] font-bold text-gray-400 mt-1">Official Academy Approval</p>
                </div>
             </div>

             <div className="mt-auto pt-6 text-center opacity-20 border-t border-gray-100">
                <p className="text-[7px] font-black uppercase tracking-[1em]">Academy HR Document • Form ID: BL-JO-2024</p>
             </div>
          </div>
        ) : reportType === 'TEACHER_JOINING' ? (
          /* PRE-FILLED TEACHER JOINING FORM */
          selectedTeacher ? (
            <div className="p-12 md:p-16 max-w-[210mm] mx-auto bg-white min-h-[297mm] flex flex-col">
               {/* Letterhead */}
               <div className="flex items-center justify-between border-b-4 border-indigo-950 pb-8 mb-10">
                  <div className="flex items-center gap-6">
                     <div className="w-20 h-20 bg-white border-2 border-indigo-50 rounded-2xl flex items-center justify-center p-2 shadow-sm overflow-hidden">
                        {branding.logo ? <img src={branding.logo} className="w-full h-full object-contain" /> : <Logo size="md" />}
                     </div>
                     <div>
                        <h2 className="text-3xl font-black text-indigo-950 uppercase tracking-tighter">{branding.name || 'ACADEMY'}</h2>
                        <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">{branding.tagline || 'EXCELLENCE IN EDUCATION'}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black uppercase text-gray-400">Office of Secretariat</p>
                     <p className="text-xs font-bold text-indigo-900 mt-1">{branding.phone}</p>
                  </div>
               </div>

               <div className="flex-1">
                  <h3 className="text-2xl font-black text-center text-white bg-indigo-950 py-4 rounded-2xl mb-12 uppercase tracking-[0.4em] shadow-xl">Appointment & Joining Report</h3>

                  <div className="grid grid-cols-12 gap-10 mb-12">
                     <div className="col-span-8 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Full Legal Name</p>
                              <p className="text-lg font-black text-gray-900 border-b-2 border-gray-100 pb-1">{selectedTeacher.teacherName}</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Employee Identity Code</p>
                              <p className="text-lg font-black text-indigo-950 border-b-2 border-gray-100 pb-1">{selectedTeacher.employeeId}</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Designation</p>
                              <p className="text-base font-bold text-gray-800 border-b-2 border-gray-100 pb-1">{selectedTeacher.designation}</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Subject Mastery</p>
                              <p className="text-base font-bold text-gray-800 border-b-2 border-gray-100 pb-1">{selectedTeacher.subject}</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Contact Phone</p>
                              <p className="text-base font-bold text-gray-800 border-b-2 border-gray-100 pb-1">+91 {selectedTeacher.phone}</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Email Address</p>
                              <p className="text-base font-bold text-gray-800 border-b-2 border-gray-100 pb-1">{selectedTeacher.email}</p>
                           </div>
                        </div>
                     </div>

                     <div className="col-span-4 flex flex-col items-center">
                        <div className="w-40 h-48 border-4 border-gray-100 rounded-[2rem] bg-gray-50 overflow-hidden shadow-inner relative flex items-center justify-center">
                           {selectedTeacher.photo ? (
                             <img src={selectedTeacher.photo} className="w-full h-full object-cover" />
                           ) : (
                             <i className="fa-solid fa-user-tie text-6xl text-gray-200"></i>
                           )}
                           <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                        </div>
                        <p className="text-[8px] font-black text-gray-300 uppercase mt-4 tracking-[0.4em]">Official Portrait</p>
                     </div>
                  </div>

                  <div className="space-y-10">
                     <div className="p-8 bg-indigo-50/50 rounded-[2.5rem] border-2 border-indigo-100/50">
                        <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                           <i className="fa-solid fa-graduation-cap"></i> Academic & Professional Background
                        </h4>
                        <div className="grid grid-cols-2 gap-8">
                           <div className="space-y-4">
                              <div className="flex justify-between border-b border-indigo-100 pb-2">
                                 <span className="text-[10px] font-bold text-indigo-400 uppercase">Qualification</span>
                                 <span className="text-sm font-black text-indigo-950">{selectedTeacher.qualification}</span>
                              </div>
                              <div className="flex justify-between border-b border-indigo-100 pb-2">
                                 <span className="text-[10px] font-bold text-indigo-400 uppercase">Degree</span>
                                 <span className="text-sm font-black text-indigo-950">{selectedTeacher.professionalDegree || 'N/A'}</span>
                              </div>
                           </div>
                           <div className="space-y-4">
                              <div className="flex justify-between border-b border-indigo-100 pb-2">
                                 <span className="text-[10px] font-bold text-indigo-400 uppercase">Experience</span>
                                 <span className="text-sm font-black text-indigo-950">{selectedTeacher.experience} Years</span>
                              </div>
                              <div className="flex justify-between border-b border-indigo-100 pb-2">
                                 <span className="text-[10px] font-bold text-indigo-400 uppercase">University</span>
                                 <span className="text-sm font-black text-indigo-950">{selectedTeacher.university || 'N/A'}</span>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="p-8 bg-emerald-50/30 rounded-[2.5rem] border-2 border-emerald-100/50">
                        <h4 className="text-xs font-black text-emerald-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                           <i className="fa-solid fa-handshake"></i> Employment Terms & Payroll
                        </h4>
                        <div className="grid grid-cols-3 gap-8">
                           <div className="text-center p-4 bg-white rounded-2xl shadow-sm border border-emerald-50">
                              <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Joining Date</p>
                              <p className="text-sm font-black text-indigo-950">{selectedTeacher.joiningDate}</p>
                           </div>
                           <div className="text-center p-4 bg-white rounded-2xl shadow-sm border border-emerald-50">
                              <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Contract Type</p>
                              <p className="text-sm font-black text-indigo-950">{selectedTeacher.employmentType}</p>
                           </div>
                           <div className="text-center p-4 bg-white rounded-2xl shadow-sm border border-emerald-50">
                              <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Basic Salary (₹)</p>
                              <p className="text-sm font-black text-emerald-600">₹ {selectedTeacher.basicSalary.toLocaleString()}</p>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-10 mt-10">
                        <div className="space-y-1">
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Permanent Residence</p>
                           <p className="text-xs font-bold text-gray-600 italic leading-relaxed">{selectedTeacher.permanentAddress || selectedTeacher.address}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Academic Assignment</p>
                           <p className="text-xs font-bold text-gray-600">
                             Assigned Classes: {Array.isArray(selectedTeacher.assignedGrades) ? selectedTeacher.assignedGrades.join(', ') : 'N/A'} <br/>
                             Class Teacher: {selectedTeacher.isClassTeacher ? 'YES' : 'NO'}
                           </p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="mt-20 pt-16 border-t border-gray-100 flex justify-between items-end">
                  <div className="text-center w-64">
                     <div className="h-20 flex items-center justify-center italic text-gray-300 text-[10px] uppercase font-black tracking-widest">
                        Handwritten Signature Required
                     </div>
                     <div className="w-full h-0.5 bg-gray-200 mb-2"></div>
                     <p className="text-xs font-black text-indigo-950 uppercase">Faculty Signature</p>
                     <p className="text-[8px] font-bold text-gray-400 mt-1">Acceptance of Terms</p>
                  </div>

                  <div className="text-center w-64">
                     <div className="h-20 flex items-center justify-center">
                        <i className="fa-solid fa-stamp text-gray-100 text-5xl"></i>
                     </div>
                     <div className="w-full h-0.5 bg-indigo-900 mb-2"></div>
                     <p className="text-xs font-black text-indigo-950 uppercase">Principal / Director</p>
                     <p className="text-[8px] font-bold text-gray-400 mt-1">Official Academy Authorization</p>
                  </div>
               </div>

               <div className="mt-auto pt-10 text-center opacity-30">
                  <p className="text-[7px] font-black uppercase tracking-[1em]">Official Academic Registry Document • Confidential</p>
               </div>
            </div>
          ) : (
            <div className="py-48 text-center bg-white/50 border-8 border-dashed border-indigo-50 rounded-[4rem] mx-8 my-8">
               <i className="fa-solid fa-user-tie text-8xl mb-8 opacity-20 text-indigo-200"></i>
               <h3 className="text-3xl font-black text-indigo-900 uppercase">Select Teacher</h3>
               <p className="text-gray-400 font-medium italic mt-2">Initialize a faculty profile to generate the joining form.</p>
            </div>
          )
        ) : (
          /* STANDARD STUDENT REPORTS TABLE */
          <>
            <div className="p-10 border-b-2 border-black flex flex-col md:flex-row md:items-center justify-between gap-8">
               <div className="flex items-center gap-8">
                  <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center p-1 grayscale">
                     {branding.logo ? <img src={branding.logo} className="w-full h-full object-contain" /> : <i className="fa-solid fa-graduation-cap"></i>}
                  </div>
                  <div>
                     <h3 className="text-3xl font-bold text-black uppercase tracking-tight leading-none">
                       {reportType === 'ROSTER' ? 'STUDENT MASTER LEDGER' : 
                        reportType === 'ATTENDANCE' ? 'DAILY ATTENDANCE LOG' : 
                        reportType === 'MONTHLY_PERCENTAGE' ? 'MONTHLY ANALYTICS SUMMARY' : 'MONTHLY ATTENDANCE REGISTER'}
                     </h3>
                     <p className="text-[10px] font-bold text-black uppercase tracking-widest mt-2">
                       {(branding.name || 'ACADEMY').toUpperCase()} OFFICIAL • CLASS: {selectedGrade} • {monthNames[selectedMonth-1].toUpperCase()} {selectedYear}
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
                  * {branding.name?.toUpperCase() || 'ACADEMY SECRETARIAT'}
               </div>
               <div className="text-right">
                  <div className="w-40 h-0.5 bg-black mb-1"></div>
                  <p className="text-[9px] font-bold uppercase">SECRETARY / SEAL</p>
               </div>
            </div>
          </>
        )}
      </div>

      {reportType !== 'TEACHER_JOINING' && reportType !== 'TEACHER_BLANK_FORM' && (
        <div className="p-8 bg-indigo-950 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
           <div className="relative z-10 w-24 h-24 bg-white/10 rounded-[2rem] flex items-center justify-center text-5xl shadow-inner border border-white/20 backdrop-blur-xl">
              <i className="fa-solid fa-stamp text-amber-400"></i>
           </div>
           <div className="relative z-10 flex-1 text-center md:text-left">
              <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter">High-Resolution Analytics</h2>
              <p className="text-indigo-200 text-lg font-medium leading-relaxed italic opacity-80 max-w-2xl">
                 "The Monthly Register generates a precision matrix of your entire class history. Export it to PDF to maintain permanent academic audit trails."
              </p>
           </div>
           <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-10"></div>
        </div>
      )}

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
