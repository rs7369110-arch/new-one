
import React, { useState } from 'react';
import { Student } from '../types';
import Logo from './Logo';

interface StudentReportsProps {
  students: Student[];
}

declare var html2pdf: any;

const StudentReports: React.FC<StudentReportsProps> = ({ students }) => {
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  const filteredStudents = selectedGrade === 'All' 
    ? students 
    : students.filter(s => s.grade === selectedGrade);

  const handleExportCSV = () => {
    if (filteredStudents.length === 0) return alert("No data to export!");

    // Define CSV headers
    const headers = ["Admission No", "GR No", "Roll No", "Name", "Grade", "DOB", "Parent Name", "Phone", "Aadhar No", "PAN No", "UID", "Address"];
    
    // Map data to rows
    const rows = filteredStudents.map(s => [
      s.admissionNo,
      s.grNo || 'N/A',
      s.rollNo,
      s.name,
      s.grade,
      s.dob,
      s.parentName,
      s.phone,
      s.aadharNo || 'N/A',
      s.panNo || 'N/A',
      s.uidNo || 'N/A',
      `"${(s.address || '').replace(/"/g, '""')}"` // Handle commas in address
    ]);

    // Build CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Jannat_Academy_Student_Report_Grade_${selectedGrade}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('report-printable-table');
    if (!element || filteredStudents.length === 0) return;

    setIsDownloadingPDF(true);
    
    const opt = {
      margin: 10,
      filename: `Jannat_Academy_Student_Report_Grade_${selectedGrade}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to generate Report PDF.");
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-indigo-900 tracking-tighter">Academy Data Center</h1>
          <p className="text-cyan-600 font-medium italic">Official registry reports & analytical exports. 📊</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select 
            className="px-6 py-4 rounded-2xl bg-white border-2 border-indigo-50 outline-none font-bold text-indigo-900 shadow-sm focus:border-cyan-400 transition-all"
            value={selectedGrade}
            onChange={e => setSelectedGrade(e.target.value)}
          >
            <option value="All">All Grades Registry</option>
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n.toString()}>{n}th Grade</option>)}
          </select>

          <button 
            onClick={handleExportCSV}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[2rem] font-black shadow-xl shadow-emerald-100 transition-all flex items-center gap-3 transform hover:scale-105 active:scale-95"
          >
            <i className="fa-solid fa-file-excel text-xl"></i>
            Export Excel
          </button>

          <button 
            disabled={isDownloadingPDF}
            onClick={handleExportPDF}
            className="px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-[2rem] font-black shadow-xl shadow-rose-100 transition-all flex items-center gap-3 transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <i className={`fa-solid ${isDownloadingPDF ? 'fa-spinner fa-spin' : 'fa-file-pdf'} text-xl`}></i>
            {isDownloadingPDF ? 'Generating...' : 'Export PDF'}
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[3rem] shadow-2xl border border-indigo-50 overflow-hidden relative">
        <div className="p-8 bg-gray-50/50 border-b border-indigo-50 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                 <i className="fa-solid fa-users-viewfinder"></i>
              </div>
              <div>
                 <h3 className="text-xl font-black text-indigo-950">Student Master Roster</h3>
                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Showing {filteredStudents.length} Super Heroes</p>
              </div>
           </div>
           <div className="hidden md:flex gap-2">
              <span className="px-4 py-2 bg-white border border-indigo-100 rounded-xl text-[10px] font-black text-gray-400 uppercase">Verified Data Only</span>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table id="report-printable-table" className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-indigo-950 text-white">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest border-r border-white/10">Adm/GR/Roll</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest border-r border-white/10">Hero Name</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest border-r border-white/10">Identity Details</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest border-r border-white/10">Parent/Contact</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest">Permanent Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-50">
              {filteredStudents.length > 0 ? filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-indigo-50/20 transition-colors group">
                  <td className="px-6 py-5 border-r border-indigo-50">
                    <div className="flex flex-col">
                       <span className="text-xs font-black text-indigo-600">{s.admissionNo}</span>
                       <span className="text-[10px] font-bold text-amber-600">{s.grNo || 'N/A'}</span>
                       <span className="text-[9px] font-black text-gray-400 uppercase">Roll: {s.rollNo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 border-r border-indigo-50">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center font-black text-indigo-400 shadow-inner overflow-hidden border-2 border-white">
                          {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : s.name.charAt(0)}
                       </div>
                       <div>
                          <p className="font-black text-indigo-950 text-sm leading-tight">{s.name}</p>
                          <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mt-1">Class {s.grade}th</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 border-r border-indigo-50">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2">
                          <i className="fa-solid fa-id-card-clip text-cyan-500 text-[10px]"></i>
                          <span className="text-[11px] font-black text-gray-600">{s.aadharNo || '---'}</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <i className="fa-solid fa-cake-candles text-rose-400 text-[10px]"></i>
                          <span className="text-[10px] font-bold text-gray-400">{s.dob}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 border-r border-indigo-50">
                    <div className="flex flex-col">
                       <span className="text-sm font-bold text-gray-700">{s.parentName}</span>
                       <span className="text-xs font-black text-indigo-400 mt-1 flex items-center gap-1">
                          <i className="fa-solid fa-phone-volume"></i> {s.phone}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 max-w-[250px]">
                    <p className="text-xs font-medium text-gray-500 leading-relaxed italic line-clamp-2">
                       {s.address || 'No address logged in registry.'}
                    </p>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-32 text-center">
                    <div className="opacity-20 flex flex-col items-center">
                       <i className="fa-solid fa-magnifying-glass-chart text-8xl mb-6"></i>
                       <p className="text-2xl font-black text-indigo-900">No Hero Registry Found!</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-10 bg-indigo-900 rounded-[4rem] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
         <div className="relative z-10 w-32 h-32 bg-white/10 rounded-full flex items-center justify-center text-6xl shadow-inner group">
            <i className="fa-solid fa-shield-check animate-pulse"></i>
         </div>
         <div className="relative z-10 flex-1 text-center md:text-left">
            <h2 className="text-3xl font-black mb-3">Official Certification Seal</h2>
            <p className="text-indigo-200 text-lg font-medium leading-relaxed italic">
               "This report center provides legally compliant exports for Jannat Academy's institutional records. All downloads are generated in high-fidelity formats ready for filing."
            </p>
         </div>
         <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-cyan-500 rounded-full blur-[100px] opacity-10"></div>
      </div>

      <style>{`
        @media print {
          #report-printable-table { width: 100% !important; border: 1px solid #eee; }
          .divide-y > * + * { border-top: 1px solid #eee !important; }
        }
      `}</style>
    </div>
  );
};

export default StudentReports;
