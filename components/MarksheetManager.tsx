
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, Student, MarksRecord } from '../types';
import Logo from './Logo';
import { storage } from '../db';

interface MarksheetManagerProps {
  user: User;
  students: Student[];
  marks: MarksRecord[];
  onUpdateMarks: (marks: MarksRecord[]) => void;
  availableSubjects: string[];
  onUpdateSubjects: (subjects: string[]) => void;
}

declare var html2pdf: any;

const SIGN_KEYS = {
  PRINCIPAL: 'digital_sign_principal',
  TEACHER: 'digital_sign_teacher'
};

const MarksheetManager: React.FC<MarksheetManagerProps> = ({ 
  user, students, marks, onUpdateMarks, availableSubjects, onUpdateSubjects
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [term, setTerm] = useState('Quarterly Exam');
  const [remarks, setRemarks] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [previewRecord, setPreviewRecord] = useState<MarksRecord | null>(null);
  const [subjectMarks, setSubjectMarks] = useState<{ [key: string]: { theory: number; practical: number } }>({});
  
  const isParent = user.role === UserRole.PARENT;
  const isAdmin = user.role === UserRole.ADMIN;
  const isStaff = isAdmin || user.role === UserRole.TEACHER;

  const principalSign = storage.get(SIGN_KEYS.PRINCIPAL, '');
  const teacherSign = storage.get(SIGN_KEYS.TEACHER, '');
  
  const printableRef = useRef<HTMLDivElement>(null);
  const principalSignInputRef = useRef<HTMLInputElement>(null);
  const teacherSignInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isParent && user.studentId) {
      setSelectedStudentId(user.studentId);
    }
  }, [isParent, user.studentId]);

  useEffect(() => {
    if (selectedStudentId && term && isStaff) {
      const existingRecord = marks.find(m => m.studentId === selectedStudentId && m.term === term);
      if (existingRecord) {
        const newMarks: typeof subjectMarks = {};
        availableSubjects.forEach(sub => {
          if (existingRecord.subjects[sub]) {
            newMarks[sub] = { theory: existingRecord.subjects[sub].theory, practical: existingRecord.subjects[sub].practical };
          } else {
            newMarks[sub] = { theory: 0, practical: 0 };
          }
        });
        setSubjectMarks(newMarks);
        setRemarks(existingRecord.remarks || '');
      } else {
        const resetMarks: typeof subjectMarks = {};
        availableSubjects.forEach(sub => resetMarks[sub] = { theory: 0, practical: 0 });
        setSubjectMarks(resetMarks);
        setRemarks('');
      }
    }
  }, [selectedStudentId, term, marks, availableSubjects, isStaff]);

  const selectedStudent = students.find(s => s.id === (previewRecord?.studentId || selectedStudentId));

  const handleSignUpload = (role: 'principal' | 'teacher', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isAdmin) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (role === 'principal') storage.set(SIGN_KEYS.PRINCIPAL, base64);
        else storage.set(SIGN_KEYS.TEACHER, base64);
        window.location.reload();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveMarks = () => {
    if (!selectedStudentId || !isStaff) return;
    
    const formattedSubjects = Object.keys(subjectMarks).reduce((acc, sub) => ({
      ...acc,
      [sub]: {
        theory: subjectMarks[sub].theory || 0,
        practical: subjectMarks[sub].practical || 0,
        total: (subjectMarks[sub].theory || 0) + (subjectMarks[sub].practical || 0)
      }
    }), {});

    const newRecord: MarksRecord = {
      id: Math.random().toString(36).substr(2, 9),
      studentId: selectedStudentId,
      term,
      remarks,
      subjects: formattedSubjects,
      date: new Date().toLocaleDateString()
    };

    const updatedMarks = marks.filter(m => !(m.studentId === selectedStudentId && m.term === term));
    onUpdateMarks([...updatedMarks, newRecord]);
    setPreviewRecord(newRecord);
    setIsGenerating(true);
  };

  const handleDownloadPDF = async () => {
    if (!printableRef.current || !selectedStudent) return;
    setIsDownloading(true);
    const element = printableRef.current;
    const opt = {
      margin: 0,
      filename: `${selectedStudent.name}_Report_Card.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 3, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    try {
      await html2pdf().set(opt).from(element).save();
    } finally {
      setIsDownloading(false);
    }
  };

  const calculateGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-emerald-600', feedback: 'Outstanding Achievement!' };
    if (percentage >= 80) return { grade: 'A', color: 'text-emerald-500', feedback: 'Excellent Performance!' };
    if (percentage >= 70) return { grade: 'B', color: 'text-indigo-500', feedback: 'Very Good' };
    if (percentage >= 40) return { grade: 'D', color: 'text-orange-500', feedback: 'Passed' };
    return { grade: 'F', color: 'text-rose-500', feedback: 'Needs Improvement' };
  };

  const renderPrintableMarksheet = (record: MarksRecord, student: Student) => {
    const recordSubjects = Object.keys(record.subjects);
    const totalMax = recordSubjects.length * 100;
    const totalObtained = Object.values(record.subjects).reduce((acc, s) => acc + s.total, 0);
    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
    const result = calculateGrade(percentage);

    return (
      <div ref={printableRef} className="bg-white p-12 w-[210mm] min-h-[297mm] mx-auto border-[16px] border-double border-indigo-100 relative shadow-inner overflow-hidden flex flex-col">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none w-[500px]"><Logo size="lg" className="w-full" /></div>
        <div className="flex items-start justify-between border-b-8 border-indigo-600 pb-10 mb-10 relative z-10">
          <div className="flex gap-8 items-center">
             <Logo size="lg" className="drop-shadow-2xl scale-110" />
             <div>
               <h1 className="text-5xl font-black text-indigo-900 tracking-tighter uppercase mb-2">Digital Education</h1>
               <p className="text-[12px] font-black text-indigo-400 uppercase tracking-[0.4em] bg-indigo-50 px-6 py-2 rounded-full inline-block">Official Transcript</p>
             </div>
          </div>
          <div className="w-44 h-44 border-[8px] border-indigo-50 rounded-[2.5rem] overflow-hidden bg-gray-50 shadow-2xl relative ring-8 ring-white">
             {student.photo ? <img src={student.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-100"><i className="fa-solid fa-user-graduate text-6xl text-indigo-100"></i></div>}
          </div>
        </div>
        <div className="relative z-10 flex-1 flex flex-col">
          <h2 className="text-3xl font-black text-center text-white bg-indigo-900 py-6 rounded-3xl mb-12 shadow-2xl uppercase tracking-[0.5em] border-b-4 border-amber-400">Authorized Report Card</h2>
          <div className="grid grid-cols-2 gap-x-20 gap-y-8 mb-16 px-8">
            <div className="space-y-6">
               <div className="flex items-center border-b-2 border-gray-100 pb-2"><span className="font-black uppercase text-indigo-400 mr-8 text-[10px] w-40">Student:</span> <span className="font-black text-gray-900 text-lg uppercase tracking-tight">{student.name}</span></div>
               <div className="flex items-center border-b-2 border-gray-100 pb-2"><span className="font-black uppercase text-indigo-400 mr-8 text-[10px] w-40">Class:</span> <span className="font-bold text-gray-800 text-lg uppercase">Class {student.grade}</span></div>
            </div>
            <div className="space-y-6">
               <div className="flex items-center border-b-2 border-gray-100 pb-2"><span className="font-black uppercase text-indigo-400 mr-8 text-[10px] w-40">Term:</span> <span className="font-black text-rose-600 text-lg uppercase">{record.term}</span></div>
               <div className="flex items-center border-b-2 border-gray-100 pb-2"><span className="font-black uppercase text-indigo-400 mr-8 text-[10px] w-40">Date:</span> <span className="font-black text-indigo-900 text-lg uppercase">{record.date}</span></div>
            </div>
          </div>
          <table className="w-full mb-16 border-collapse rounded-[2rem] overflow-hidden border border-indigo-100">
            <thead>
              <tr className="bg-indigo-900 text-white text-[11px] font-black uppercase tracking-[0.2em]">
                <th className="p-6 text-left">Subject</th>
                <th className="p-6 text-center">Theory</th>
                <th className="p-6 text-center">Prac</th>
                <th className="p-6 text-center">Total</th>
              </tr>
            </thead>
            <tbody className="text-base font-semibold text-gray-700">
              {Object.entries(record.subjects).map(([name, m], idx) => (
                <tr key={name} className={idx % 2 === 0 ? 'bg-white' : 'bg-indigo-50/20'}>
                  <td className="p-6 border border-gray-100 font-black text-indigo-950 uppercase text-xs">{name}</td>
                  <td className="p-6 border border-gray-100 text-center">{m.theory}</td>
                  <td className="p-6 border border-gray-100 text-center">{m.practical}</td>
                  <td className="p-6 border border-gray-100 text-center font-black text-indigo-900 text-xl">{m.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-indigo-950 text-white font-black">
                <td className="p-8 uppercase text-[12px] tracking-[0.3em]" colSpan={3}>Aggregate Score</td>
                <td className="p-8 text-center text-4xl font-black">{totalObtained} / {totalMax}</td>
              </tr>
            </tfoot>
          </table>
          <div className="grid grid-cols-2 gap-10 mb-20">
            <div className="p-10 rounded-[3.5rem] bg-indigo-50/50 text-center border-4 border-indigo-100/50">
              <p className="text-[12px] font-black uppercase text-indigo-400 mb-3 tracking-widest">Percentage</p>
              <p className="text-5xl font-black text-indigo-900">{percentage.toFixed(1)}%</p>
            </div>
            <div className="p-10 rounded-[3.5rem] bg-amber-50/50 text-center border-4 border-amber-100/50">
              <p className="text-[12px] font-black uppercase text-amber-500 mb-3 tracking-widest">Grade</p>
              <p className={`text-5xl font-black ${result.color}`}>{result.grade}</p>
            </div>
          </div>
          <div className="mt-auto flex justify-between items-end px-16 pb-10">
             <div className="text-center w-72">
               {teacherSign && <img src={teacherSign} className="h-20 mx-auto mix-blend-multiply" />}
               <div className="w-full h-px bg-indigo-900/20 mb-2"></div>
               <p className="font-black text-indigo-900 text-sm">Class Master</p>
             </div>
             <div className="text-center w-72">
               {principalSign && <img src={principalSign} className="h-20 mx-auto mix-blend-multiply" />}
               <div className="w-full h-px bg-indigo-900/20 mb-2"></div>
               <p className="font-black text-indigo-900 text-sm">Principal</p>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const currentRecord = previewRecord || marks.find(m => m.studentId === selectedStudentId && m.term === term);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-indigo-900 tracking-tighter uppercase leading-none">Academic Transcript Vault</h1>
          <p className="text-indigo-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-2 italic">Official Academy Authorized Records</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowSettings(!showSettings)} className={`px-10 py-5 rounded-[2rem] font-black flex items-center gap-3 transition-all border-4 shadow-2xl ${showSettings ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-600 border-indigo-50'}`}>
            <i className={`fa-solid ${showSettings ? 'fa-xmark' : 'fa-signature'}`}></i>
            Config
          </button>
        )}
      </header>

      {showSettings && isAdmin && (
        <div className="bg-white p-12 rounded-[5rem] shadow-2xl border-4 border-indigo-50 animate-slide-up space-y-12">
           <div className="grid grid-cols-2 gap-10">
              <div className="space-y-4">
                 <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest ml-1">Principal Sign</p>
                 <div className="h-44 bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-200 flex items-center justify-center cursor-pointer" onClick={() => principalSignInputRef.current?.click()}>
                    {principalSign ? <img src={principalSign} className="max-h-full p-6 object-contain" /> : <i className="fa-solid fa-cloud-arrow-up text-gray-200 text-5xl"></i>}
                 </div>
                 <input type="file" ref={principalSignInputRef} onChange={e => handleSignUpload('principal', e)} className="hidden" />
              </div>
              <div className="space-y-4">
                 <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest ml-1">Master Sign</p>
                 <div className="h-44 bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-200 flex items-center justify-center cursor-pointer" onClick={() => teacherSignInputRef.current?.click()}>
                    {teacherSign ? <img src={teacherSign} className="max-h-full p-6 object-contain" /> : <i className="fa-solid fa-cloud-arrow-up text-gray-200 text-5xl"></i>}
                 </div>
                 <input type="file" ref={teacherSignInputRef} onChange={e => handleSignUpload('teacher', e)} className="hidden" />
              </div>
           </div>
        </div>
      )}

      {isStaff ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-white p-12 rounded-[4.5rem] shadow-2xl border border-indigo-50 space-y-12">
            <h2 className="text-3xl font-black text-indigo-950 uppercase tracking-tighter">Compile Registry</h2>
            <div className="grid grid-cols-2 gap-10">
               <select className="w-full px-8 py-5 rounded-[2.5rem] bg-gray-50 border-4 border-transparent focus:bg-white focus:border-indigo-400 outline-none font-black" value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)}>
                 <option value="">Select Hero...</option>
                 {students.map(s => <option key={s.id} value={s.id}>{s.name} (Roll: {s.rollNo})</option>)}
               </select>
               <select className="w-full px-8 py-5 rounded-[2.5rem] bg-gray-50 border-4 border-transparent focus:bg-white focus:border-indigo-400 outline-none font-black" value={term} onChange={e => setTerm(e.target.value)}>
                 <option>Quarterly Exam</option><option>Mid Term</option><option>Final Exam</option>
               </select>
            </div>
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-6 custom-scrollbar">
              {availableSubjects.map(sub => (
                <div key={sub} className="grid grid-cols-3 gap-10 items-center p-8 bg-gray-50 rounded-[2.5rem] border-4 border-transparent hover:border-indigo-100 transition-all">
                  <div className="font-black text-gray-800 text-xs uppercase">{sub}</div>
                  <input type="number" className="py-4 rounded-2xl border-2 border-gray-200 text-center font-black" placeholder="Theory" value={subjectMarks[sub]?.theory || 0} onChange={e => setSubjectMarks({...subjectMarks, [sub]: { ...subjectMarks[sub], theory: Number(e.target.value) }})} />
                  <input type="number" className="py-4 rounded-2xl border-2 border-gray-200 text-center font-black" placeholder="Prac" value={subjectMarks[sub]?.practical || 0} onChange={e => setSubjectMarks({...subjectMarks, [sub]: { ...subjectMarks[sub], practical: Number(e.target.value) }})} />
                </div>
              ))}
            </div>
            <button onClick={handleSaveMarks} className="w-full py-8 bg-indigo-900 text-white font-black rounded-[3rem] shadow-2xl text-2xl uppercase">Process High-Fi Transcript</button>
          </div>
          <div className="bg-indigo-950 p-16 rounded-[5.5rem] flex flex-col justify-center text-center text-white">
             <i className="fa-solid fa-graduation-cap text-8xl mb-8 opacity-20"></i>
             <h2 className="text-5xl font-black mb-6 uppercase tracking-tighter">Digital Rendering</h2>
             <p className="text-indigo-200 italic opacity-60">Authorize and generate official transcripts with digital seals instantly.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white p-24 rounded-[6rem] shadow-2xl border border-indigo-50 text-center flex flex-col items-center">
           <div className="w-48 h-48 bg-indigo-50 text-indigo-500 rounded-[4rem] flex items-center justify-center text-8xl mb-12 shadow-inner"><i className="fa-solid fa-certificate"></i></div>
           <h2 className="text-5xl font-black text-indigo-950 mb-10 tracking-tighter uppercase leading-none">My Academic Progress</h2>
           <select className="w-full max-w-lg px-12 py-8 rounded-[3.5rem] bg-indigo-50/50 border-8 border-transparent focus:bg-white focus:border-indigo-400 outline-none font-black text-indigo-900 text-2xl text-center mb-10" value={term} onChange={e => setTerm(e.target.value)}>
              <option>Quarterly Exam</option><option>Mid Term</option><option>Final Exam</option>
           </select>
           {currentRecord ? (
              <button onClick={() => setIsGenerating(true)} className="w-full max-w-lg py-8 bg-indigo-900 text-white font-black rounded-[4rem] shadow-2xl text-3xl uppercase tracking-widest transform hover:scale-105 transition-all">View Official Record</button>
           ) : (
              <div className="p-10 bg-rose-50 text-rose-500 rounded-[3.5rem] font-black text-lg uppercase tracking-widest italic border-4 border-rose-100">Record Awaiting Authorization</div>
           )}
        </div>
      )}

      {isGenerating && selectedStudent && currentRecord && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/98 backdrop-blur-3xl flex flex-col items-center p-6 overflow-y-auto">
           <div className="w-full max-w-[210mm] flex items-center justify-between mb-10 shrink-0 mt-4">
              <div className="flex items-center gap-4 text-white">
                 <Logo size="sm" />
                 <div><h4 className="font-black uppercase tracking-tight">Official Record</h4><p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Digital Seal Applied</p></div>
              </div>
              <div className="flex gap-4">
                 <button onClick={handleDownloadPDF} disabled={isDownloading} className="px-10 py-4 bg-emerald-500 text-white rounded-2xl font-black flex items-center gap-3 shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 uppercase text-xs tracking-widest"><i className={`fa-solid ${isDownloading ? 'fa-spinner fa-spin' : 'fa-file-pdf'}`}></i> {isDownloading ? 'Sealing...' : 'Download PDF'}</button>
                 <button onClick={() => setIsGenerating(false)} className="px-8 py-4 bg-white/10 text-white rounded-2xl font-black backdrop-blur-md hover:bg-rose-500 transition-all border border-white/20 uppercase text-xs tracking-widest">Close</button>
              </div>
           </div>
           <div className="transform scale-[0.6] sm:scale-[0.8] lg:scale-100 origin-top shadow-2xl pb-20">{renderPrintableMarksheet(currentRecord, selectedStudent)}</div>
        </div>
      )}
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 12px; }`}</style>
    </div>
  );
};

export default MarksheetManager;
