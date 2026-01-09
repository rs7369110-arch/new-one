
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
  user, 
  students, 
  marks, 
  onUpdateMarks,
  availableSubjects,
  onUpdateSubjects
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
  
  // Signature States
  const [principalSign, setPrincipalSign] = useState<string>(storage.get(SIGN_KEYS.PRINCIPAL, ''));
  const [teacherSign, setTeacherSign] = useState<string>(storage.get(SIGN_KEYS.TEACHER, ''));
  
  const printableRef = useRef<HTMLDivElement>(null);
  const principalSignInputRef = useRef<HTMLInputElement>(null);
  const teacherSignInputRef = useRef<HTMLInputElement>(null);

  // CRITICAL: Automatic Sync Logic
  useEffect(() => {
    if (selectedStudentId && term) {
      const existingRecord = marks.find(m => m.studentId === selectedStudentId && m.term === term);
      if (existingRecord) {
        const newMarks: typeof subjectMarks = {};
        availableSubjects.forEach(sub => {
          if (existingRecord.subjects[sub]) {
            newMarks[sub] = { 
              theory: existingRecord.subjects[sub].theory, 
              practical: existingRecord.subjects[sub].practical 
            };
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
  }, [selectedStudentId, term, marks, availableSubjects]);

  const selectedStudent = students.find(s => s.id === (previewRecord?.studentId || selectedStudentId));

  const handleSignUpload = (role: 'principal' | 'teacher', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (role === 'principal') {
          setPrincipalSign(base64);
          storage.set(SIGN_KEYS.PRINCIPAL, base64);
        } else {
          setTeacherSign(base64);
          storage.set(SIGN_KEYS.TEACHER, base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveMarks = () => {
    if (!selectedStudentId) {
      alert("Please select a student first!");
      return;
    }
    
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
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to generate PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  const calculateGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-emerald-600', feedback: 'Outstanding Achievement!' };
    if (percentage >= 80) return { grade: 'A', color: 'text-emerald-500', feedback: 'Excellent Performance!' };
    if (percentage >= 70) return { grade: 'B', color: 'text-indigo-500', feedback: 'Very Good' };
    if (percentage >= 60) return { grade: 'C', color: 'text-amber-500', feedback: 'Good Effort' };
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
      <div 
        ref={printableRef}
        className="bg-white p-12 w-[210mm] min-h-[297mm] mx-auto border-[16px] border-double border-indigo-100 relative shadow-inner overflow-hidden flex flex-col"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none w-[500px]">
           <Logo size="lg" className="w-full" />
        </div>

        <div className="flex items-start justify-between border-b-8 border-indigo-600 pb-10 mb-10 relative z-10">
          <div className="flex gap-8 items-center">
             <Logo size="lg" className="drop-shadow-2xl scale-110" />
             <div>
               <h1 className="text-5xl font-black text-indigo-900 tracking-tighter uppercase mb-2">Digital Education</h1>
               <p className="text-[12px] font-black text-indigo-400 uppercase tracking-[0.4em] bg-indigo-50 px-6 py-2 rounded-full inline-block">Center of Academic Excellence</p>
               <p className="text-base font-bold text-gray-400 mt-3 italic tracking-wide">Educating the Leaders of Tomorrow.</p>
             </div>
          </div>
          
          <div className="flex flex-col items-center">
             <div className="w-44 h-44 border-[8px] border-indigo-50 rounded-[2.5rem] overflow-hidden bg-gray-50 shadow-2xl relative ring-8 ring-white">
                {student.photo ? (
                  <img src={student.photo} className="w-full h-full object-cover" alt="Student Photo" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-indigo-100 bg-gray-100">
                     <i className="fa-solid fa-user-graduate text-6xl"></i>
                  </div>
                )}
             </div>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col">
          <h2 className="text-3xl font-black text-center text-white bg-indigo-900 py-6 rounded-3xl mb-12 shadow-2xl uppercase tracking-[0.5em] border-b-4 border-amber-400">Official Report Card</h2>

          <div className="grid grid-cols-2 gap-x-20 gap-y-8 mb-16 text-sm px-8">
            <div className="space-y-6">
               <div className="flex items-center border-b-2 border-gray-100 pb-2"><span className="font-black uppercase text-indigo-400 mr-8 text-[10px] w-40">Student Name:</span> <span className="font-black text-gray-900 text-lg uppercase tracking-tight">{student.name}</span></div>
               <div className="flex items-center border-b-2 border-gray-100 pb-2"><span className="font-black uppercase text-indigo-400 mr-8 text-[10px] w-40">Admission ID:</span> <span className="font-black text-indigo-600 text-lg">{student.admissionNo}</span></div>
            </div>
            <div className="space-y-6">
               <div className="flex items-center border-b-2 border-gray-100 pb-2"><span className="font-black uppercase text-indigo-400 mr-8 text-[10px] w-40">Class / Standard:</span> <span className="font-bold text-gray-800 text-lg uppercase">Class {student.grade}</span></div>
               <div className="flex items-center border-b-2 border-gray-100 pb-2"><span className="font-black uppercase text-indigo-400 mr-8 text-[10px] w-40">Exam Term:</span> <span className="font-black text-rose-600 text-lg uppercase">{record.term}</span></div>
            </div>
          </div>

          <table className="w-full mb-16 border-collapse rounded-[2rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-indigo-100">
            <thead>
              <tr className="bg-indigo-900 text-white text-[11px] font-black uppercase tracking-[0.2em]">
                <th className="p-6 border-r border-white/10 text-left">Subject Components</th>
                <th className="p-6 border-r border-white/10 text-center">Theory (70)</th>
                <th className="p-6 border-r border-white/10 text-center">Prac (30)</th>
                <th className="p-6 border-r border-white/10 text-center">Total (100)</th>
                <th className="p-6 text-center">Grade Point</th>
              </tr>
            </thead>
            <tbody className="text-base font-semibold text-gray-700">
              {Object.entries(record.subjects).map(([name, m], idx) => (
                <tr key={name} className={idx % 2 === 0 ? 'bg-white' : 'bg-indigo-50/20'}>
                  <td className="p-6 border border-gray-100 font-black text-indigo-950 uppercase text-xs tracking-wider">{name}</td>
                  <td className="p-6 border border-gray-100 text-center font-bold">{m.theory}</td>
                  <td className="p-6 border border-gray-100 text-center font-bold">{m.practical}</td>
                  <td className="p-6 border border-gray-100 text-center font-black text-indigo-900 text-xl">{m.total}</td>
                  <td className="p-6 border border-gray-100 text-center font-black text-sm">
                    {m.total >= 80 ? 'EX' : m.total >= 60 ? 'VG' : m.total >= 40 ? 'G' : 'NI'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-indigo-950 text-white font-black">
                <td className="p-8 uppercase text-[12px] tracking-[0.3em]" colSpan={3}>Aggregate Performance Score</td>
                <td className="p-8 text-center text-4xl font-black">{totalObtained} / {totalMax}</td>
                <td className="p-8 text-center">
                   <span className={`px-8 py-3 rounded-2xl text-[12px] shadow-xl ${percentage >= 40 ? 'bg-emerald-500' : 'bg-rose-500'} text-white`}>
                      {percentage >= 40 ? 'QUALIFIED' : 'RE-APPEAR'}
                   </span>
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="grid grid-cols-3 gap-10 mb-20">
            <div className="p-10 rounded-[3.5rem] bg-indigo-50/50 text-center border-4 border-indigo-100/50">
              <p className="text-[12px] font-black uppercase text-indigo-400 mb-3 tracking-widest">Final Percentage</p>
              <p className="text-5xl font-black text-indigo-900">{percentage.toFixed(1)}%</p>
            </div>
            <div className="p-10 rounded-[3.5rem] bg-amber-50/50 text-center border-4 border-amber-100/50">
              <p className="text-[12px] font-black uppercase text-amber-500 mb-3 tracking-widest">Merit Grade</p>
              <p className={`text-5xl font-black ${result.color}`}>{result.grade}</p>
            </div>
            <div className="p-10 rounded-[3.5rem] bg-emerald-50/50 text-center border-4 border-emerald-100/50">
              <p className="text-[12px] font-black uppercase text-emerald-500 mb-3 tracking-widest">Academic Status</p>
              <p className={`text-2xl font-black ${percentage >= 40 ? 'text-emerald-700' : 'text-rose-700'}`}>{percentage >= 40 ? 'PROMOTED' : 'DETAINED'}</p>
            </div>
          </div>

          <div className="mb-20">
             <div className="p-10 bg-gray-50/80 rounded-[3rem] border-4 border-dashed border-gray-200 relative">
                <p className="text-[11px] font-black uppercase text-indigo-300 absolute -top-4 left-10 bg-white px-4">Dean's Formal Assessment</p>
                <p className="text-gray-700 font-black italic text-xl leading-relaxed text-center">"{record.remarks || result.feedback}"</p>
             </div>
          </div>

          <div className="mt-auto flex justify-between items-end px-16 pb-10">
             <div className="text-center w-72">
               <div className="h-28 flex items-center justify-center mb-6 relative overflow-hidden group">
                  {teacherSign ? (
                    <img src={teacherSign} className="max-h-full max-w-full object-contain mix-blend-multiply scale-125" alt="Teacher Sign" />
                  ) : <div className="text-[10px] font-black text-gray-300">Class Master Sign</div>}
               </div>
               <div className="w-full h-1 bg-indigo-900/10 mb-3 rounded-full"></div>
               <p className="text-base font-black text-indigo-900 tracking-tight">Class Instructor</p>
               <p className="text-[9px] font-black text-indigo-300 uppercase tracking-[0.4em] mt-1 italic">Verified Grade Master</p>
             </div>

             <div className="text-center">
                <div className="w-40 h-40 rounded-full border-[10px] border-indigo-100/20 flex items-center justify-center relative p-8 group mb-4">
                   <Logo size="sm" className="opacity-20 grayscale" />
                   <div className="absolute inset-0 border-4 border-dashed border-indigo-200/40 rounded-full animate-spin-slow"></div>
                </div>
                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.5em]">Seal of Auth</p>
             </div>

             <div className="text-center w-72">
               <div className="h-28 flex items-center justify-center mb-6 relative overflow-hidden group">
                  {principalSign ? (
                    <img src={principalSign} className="max-h-full max-w-full object-contain mix-blend-multiply scale-125" alt="Principal Sign" />
                  ) : <div className="text-[10px] font-black text-gray-300">Principal Sign</div>}
               </div>
               <div className="w-full h-1 bg-indigo-900/10 mb-3 rounded-full"></div>
               <p className="text-base font-black text-indigo-900 tracking-tight">Principal Seal</p>
               <p className="text-[9px] font-black text-indigo-300 uppercase tracking-[0.4em] mt-1 italic">Authorized Registry</p>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const currentRecord = previewRecord || marks.find(m => m.studentId === (user.studentId || selectedStudentId) && m.term === term);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-indigo-900 tracking-tighter uppercase">Academic Transcript Vault</h1>
          <p className="text-indigo-500 font-medium italic">Securely manage and publish official high-fidelity student transcripts.</p>
        </div>
        <div className="flex items-center gap-4">
          {user.role === UserRole.ADMIN && (
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`px-10 py-5 rounded-[2rem] font-black flex items-center gap-3 transition-all border-4 shadow-2xl ${showSettings ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-600 border-indigo-50 hover:bg-indigo-50'}`}
            >
              <i className={`fa-solid ${showSettings ? 'fa-xmark' : 'fa-signature'}`}></i>
              {showSettings ? 'Close Config' : 'Transcript Setup'}
            </button>
          )}
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-[2.5rem] flex items-center justify-center text-4xl shadow-2xl ring-8 ring-white">
            <i className="fa-solid fa-file-invoice"></i>
          </div>
        </div>
      </header>

      {showSettings && user.role === UserRole.ADMIN && (
        <div className="bg-white p-12 rounded-[5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border-4 border-indigo-50 animate-slide-up space-y-12">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="space-y-8">
                 <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-4 mb-8">
                    <i className="fa-solid fa-book-open"></i> Subject Configuration
                 </h3>
                 <form onSubmit={(e) => { e.preventDefault(); if (newSubjectName.trim()) { onUpdateSubjects([...availableSubjects, newSubjectName.trim()]); setNewSubjectName(''); } }} className="flex gap-4">
                    <input 
                      required
                      className="flex-1 px-8 py-5 rounded-3xl bg-gray-50 border-4 border-transparent focus:bg-white focus:border-indigo-400 outline-none font-bold shadow-inner"
                      placeholder="e.g. Robotics, Arts..."
                      value={newSubjectName}
                      onChange={e => setNewSubjectName(e.target.value)}
                    />
                    <button type="submit" className="px-10 py-5 bg-indigo-600 text-white rounded-3xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all">Add Subject</button>
                 </form>
                 <div className="flex flex-wrap gap-3">
                    {availableSubjects.map(sub => (
                      <div key={sub} className="px-5 py-3 bg-indigo-50 text-indigo-700 rounded-2xl font-black text-[11px] flex items-center gap-4 group border border-indigo-100 uppercase tracking-widest">
                        {sub}
                        <button onClick={() => onUpdateSubjects(availableSubjects.filter(s => s !== sub))} className="text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"><i className="fa-solid fa-xmark"></i></button>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="space-y-8">
                 <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-4 mb-8">
                    <i className="fa-solid fa-file-signature"></i> Signature Registry
                 </h3>
                 <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest ml-1">Principal Official Seal</p>
                       <div className="h-44 bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-200 flex items-center justify-center relative group overflow-hidden shadow-inner cursor-pointer" onClick={() => principalSignInputRef.current?.click()}>
                          {principalSign ? <img src={principalSign} className="max-h-full p-6 object-contain mix-blend-multiply" alt="Principal Sign" /> : <i className="fa-solid fa-cloud-arrow-up text-gray-200 text-5xl"></i>}
                          <div className="absolute inset-0 bg-indigo-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <span className="text-white text-[10px] font-black uppercase tracking-widest">Update Principal Sign</span>
                          </div>
                       </div>
                       <input type="file" accept="image/*" className="hidden" ref={principalSignInputRef} onChange={e => handleSignUpload('principal', e)} />
                    </div>
                    <div className="space-y-4">
                       <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest ml-1">Master Teacher Sign</p>
                       <div className="h-44 bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-200 flex items-center justify-center relative group overflow-hidden shadow-inner cursor-pointer" onClick={() => teacherSignInputRef.current?.click()}>
                          {teacherSign ? <img src={teacherSign} className="max-h-full p-6 object-contain mix-blend-multiply" alt="Teacher Sign" /> : <i className="fa-solid fa-cloud-arrow-up text-gray-200 text-5xl"></i>}
                          <div className="absolute inset-0 bg-indigo-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <span className="text-white text-[10px] font-black uppercase tracking-widest">Update Master Sign</span>
                          </div>
                       </div>
                       <input type="file" accept="image/*" className="hidden" ref={teacherSignInputRef} onChange={e => handleSignUpload('teacher', e)} />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {user.role === UserRole.ADMIN || user.role === UserRole.TEACHER ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-white p-12 rounded-[4.5rem] shadow-2xl border border-indigo-50 space-y-12">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black text-indigo-950 flex items-center gap-4">
                 <i className="fa-solid fa-pen-fancy text-indigo-500"></i>
                 Compile Registry
              </h2>
              {marks.some(m => m.studentId === selectedStudentId && m.term === term) && (
                <div className="px-6 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border border-emerald-100 animate-pulse">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                   Synced from Grid
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-10">
               <div className="space-y-4">
                  <label className="text-[11px] font-black text-indigo-300 uppercase tracking-widest ml-2">Select Student</label>
                  <select 
                    className="w-full px-8 py-5 rounded-[2.5rem] bg-gray-50 border-4 border-transparent focus:bg-white focus:border-indigo-400 outline-none font-black text-indigo-950 shadow-inner appearance-none"
                    value={selectedStudentId}
                    onChange={e => setSelectedStudentId(e.target.value)}
                  >
                    <option value="">Choose Registry Hero...</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name} (Roll: {s.rollNo})</option>)}
                  </select>
               </div>
               <div className="space-y-4">
                  <label className="text-[11px] font-black text-indigo-300 uppercase tracking-widest ml-2">Academic Term</label>
                  <select 
                    className="w-full px-8 py-5 rounded-[2.5rem] bg-gray-50 border-4 border-transparent focus:bg-white focus:border-indigo-400 outline-none font-black text-indigo-950 shadow-inner appearance-none"
                    value={term}
                    onChange={e => setTerm(e.target.value)}
                  >
                    <option>Quarterly Exam</option>
                    <option>Mid Term</option>
                    <option>Final Exam</option>
                  </select>
               </div>
            </div>

            <div className="space-y-6 max-h-[450px] overflow-y-auto pr-6 custom-scrollbar">
              {availableSubjects.map(sub => (
                <div key={sub} className="grid grid-cols-4 gap-10 items-center p-8 bg-gray-50 rounded-[2.5rem] border-4 border-transparent hover:border-indigo-100 transition-all group">
                  <div className="col-span-2 font-black text-gray-800 tracking-tight uppercase text-xs">{sub}</div>
                  <div className="relative">
                    <p className="text-[9px] font-black text-indigo-300 absolute -top-5 left-1 uppercase">Theory</p>
                    <input 
                      type="number" 
                      className="w-full text-center py-4 rounded-2xl border-2 border-gray-200 outline-none focus:border-indigo-400 font-black shadow-inner"
                      value={subjectMarks[sub]?.theory || 0}
                      onChange={e => setSubjectMarks({...subjectMarks, [sub]: { ...subjectMarks[sub], theory: Number(e.target.value) }})}
                    />
                  </div>
                  <div className="relative">
                    <p className="text-[9px] font-black text-indigo-300 absolute -top-5 left-1 uppercase">Prac</p>
                    <input 
                      type="number" 
                      className="w-full text-center py-4 rounded-2xl border-2 border-gray-200 outline-none focus:border-indigo-400 font-black shadow-inner"
                      value={subjectMarks[sub]?.practical || 0}
                      onChange={e => setSubjectMarks({...subjectMarks, [sub]: { ...subjectMarks[sub], practical: Number(e.target.value) }})}
                    />
                  </div>
                </div>
              ))}
            </div>

            <textarea 
              className="w-full px-10 py-8 rounded-[3rem] bg-gray-50 border-4 border-transparent focus:bg-white focus:border-indigo-400 outline-none font-bold h-40 shadow-inner"
              placeholder="Formal Principal's Remark: Outstanding performance, needs consistent effort..."
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
            />

            <button 
              onClick={handleSaveMarks}
              className="w-full py-8 bg-indigo-900 hover:bg-black text-white font-black rounded-[3rem] shadow-2xl transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-6 text-2xl uppercase tracking-widest"
            >
              <i className="fa-solid fa-wand-magic-sparkles"></i>
              Compile High-Fi Transcript
            </button>
          </div>

          <div className="bg-indigo-950 p-16 rounded-[5.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-center text-center">
             <div className="relative z-10">
                <div className="w-40 h-40 bg-white/10 rounded-[3.5rem] flex items-center justify-center text-7xl mx-auto mb-12 shadow-inner ring-12 ring-white/5 animate-float">
                   <i className="fa-solid fa-graduation-cap"></i>
                </div>
                <h2 className="text-5xl font-black mb-8 tracking-tighter leading-tight uppercase">High-Fidelity<br/>Digital Rendering</h2>
                <p className="text-indigo-200 text-xl font-medium leading-relaxed max-w-sm mx-auto mb-16 italic opacity-80">
                   "Compile student records into professional-grade digital transcripts instantly with integrated class teacher and principal credentials."
                </p>
                <div className="grid grid-cols-2 gap-10">
                   <div className="bg-white/5 p-10 rounded-[3.5rem] border border-white/10 group hover:bg-white/10 transition-colors">
                      <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-2xl shadow-emerald-500/20"><i className="fa-solid fa-check-double text-2xl"></i></div>
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-300">Auto-Calculated</p>
                   </div>
                   <div className="bg-white/5 p-10 rounded-[3.5rem] border border-white/10 group hover:bg-white/10 transition-colors">
                      <div className="w-16 h-16 bg-rose-500 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-2xl shadow-rose-500/20"><i className="fa-solid fa-file-pdf text-2xl"></i></div>
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-300">Ready to Export</p>
                   </div>
                </div>
             </div>
             <div className="absolute top-[-15%] right-[-15%] w-96 h-96 bg-indigo-500 rounded-full blur-[140px] opacity-20"></div>
          </div>
        </div>
      ) : (
        /* Student Portal View */
        <div className="bg-white p-24 rounded-[6rem] shadow-2xl border border-indigo-50 text-center relative overflow-hidden flex flex-col items-center">
           <div className="w-48 h-48 bg-indigo-50 text-indigo-500 rounded-[4rem] flex items-center justify-center text-8xl mb-12 shadow-inner transform -rotate-12 ring-12 ring-white animate-float">
              <i className="fa-solid fa-certificate"></i>
           </div>
           <h2 className="text-5xl font-black text-indigo-950 mb-6 tracking-tighter uppercase">My Academic Progress</h2>
           <p className="text-gray-400 max-w-lg mx-auto mb-20 font-bold text-2xl leading-relaxed italic">Download your authorized Academy transcript instantly.</p>
           
           <div className="max-w-lg w-full space-y-10">
              <select 
                className="w-full px-12 py-8 rounded-[3.5rem] bg-indigo-50/50 border-8 border-transparent focus:bg-white focus:border-indigo-400 outline-none font-black text-indigo-900 shadow-inner text-2xl text-center appearance-none"
                value={term}
                onChange={e => setTerm(e.target.value)}
              >
                <option>Quarterly Exam</option>
                <option>Mid Term</option>
                <option>Final Exam</option>
              </select>
              {marks.some(m => m.studentId === user.studentId && m.term === term) ? (
                 <button 
                  onClick={() => { setPreviewRecord(null); setIsGenerating(true); }}
                  className="w-full py-8 bg-indigo-900 hover:bg-black text-white font-black rounded-[4rem] shadow-[0_30px_90px_-20px_rgba(49,46,129,0.5)] transition-all transform hover:scale-105 active:scale-95 text-3xl uppercase tracking-widest"
                 >
                   Open Official Record
                 </button>
              ) : (
                 <div className="p-10 bg-rose-50 text-rose-500 rounded-[3.5rem] font-black text-lg uppercase tracking-widest border-4 border-rose-100 italic">
                    Records Awaiting Authorization
                 </div>
              )}
           </div>
           <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-indigo-50 rounded-full opacity-30"></div>
        </div>
      )}

      {/* Immersive Full-Screen Theatre Preview Modal */}
      {isGenerating && selectedStudent && currentRecord && (
        <div className="fixed inset-0 z-[1000] bg-slate-900 flex flex-col items-center p-6 overflow-y-auto theatre-scroll">
           {/* Top Control Bar */}
           <div className="w-full max-w-[210mm] flex items-center justify-between mb-10 shrink-0 mt-4 px-2">
              <div className="flex items-center gap-4 text-white">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                    <Logo size="sm" />
                 </div>
                 <div>
                    <h4 className="font-black text-lg tracking-tight uppercase">Transcript Viewer</h4>
                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Digital Seal Applied</p>
                 </div>
              </div>
              <div className="flex gap-6">
                 <button 
                  disabled={isDownloading}
                  onClick={handleDownloadPDF}
                  className="px-12 py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[2rem] font-black flex items-center gap-4 shadow-2xl transition-all transform hover:scale-110 active:scale-95 disabled:opacity-50 text-base uppercase tracking-widest"
                 >
                   <i className={`fa-solid ${isDownloading ? 'fa-spinner fa-spin' : 'fa-file-pdf'} text-xl`}></i>
                   {isDownloading ? 'Finalizing...' : 'Download PDF'}
                 </button>
                 <button 
                  onClick={() => { setIsGenerating(false); setPreviewRecord(null); }}
                  className="px-8 py-5 bg-white/10 text-white rounded-[2rem] font-black backdrop-blur-md hover:bg-rose-500 hover:text-white transition-all shadow-xl border border-white/20 flex items-center gap-3 text-base"
                 >
                   <i className="fa-solid fa-circle-xmark text-xl"></i> Close
                 </button>
              </div>
           </div>

           {/* Full Page Scaling Container */}
           <div className="marksheet-theatre-wrapper flex-1 flex justify-center items-start pb-20">
              <div className="marksheet-scale-anchor shadow-[0_50px_200px_-50px_rgba(0,0,0,1)]">
                 {renderPrintableMarksheet(currentRecord, selectedStudent)}
              </div>
           </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 12px; }
        .theatre-scroll::-webkit-scrollbar { width: 0; } /* Hide for theatre mode */
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        
        .marksheet-scale-anchor {
           transform-origin: top center;
           /* Auto scale based on height of screen */
           transform: scale(min(1, calc((100vh - 200px) / 297mm)));
        }

        @media (max-width: 640px) {
           .marksheet-scale-anchor {
              transform: scale(calc(100vw / 220mm));
           }
        }
        
        .animate-spin-slow { animation: spin 15s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default MarksheetManager;
