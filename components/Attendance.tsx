
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, UserRole, Student, AttendanceRecord } from '../types';

interface AttendanceProps {
  user: User;
  students: Student[];
  attendance: AttendanceRecord[];
  onUpsertRecord: (record: AttendanceRecord) => Promise<boolean>;
}

type AcademicLevel = 'PRIMARY' | 'SECONDARY' | 'HIGHER_SECONDARY';

const Attendance: React.FC<AttendanceProps> = ({ user, students, attendance, onUpsertRecord }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [viewDate, setViewDate] = useState(new Date());
  
  // Selection States
  const [selectedMedium, setSelectedMedium] = useState<'ENGLISH' | 'GUJARATI'>('ENGLISH');
  const [selectedGender, setSelectedGender] = useState<'MALE' | 'FEMALE'>('FEMALE'); 
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>('PRIMARY');
  const [selectedGrade, setSelectedGrade] = useState('1');
  const [selectedSection, setSelectedSection] = useState('A');
  
  const [rollInput, setRollInput] = useState('');
  const [entryMode, setEntryMode] = useState<'ABSENT' | 'PRESENT'>('ABSENT');
  const [lastProcessed, setLastProcessed] = useState<{name: string, status: string, success: boolean} | null>(null);
  
  const rollInputRef = useRef<HTMLInputElement>(null);

  const isStaff = user.role === UserRole.ADMIN || user.role === UserRole.TEACHER;

  // Calendar Logic
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const startOffset = new Date(year, month, 1).getDay();
    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(year, month, d).toISOString().split('T')[0]);
    }
    return days;
  }, [viewDate]);

  const changeMonth = (offset: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  const availableGrades = useMemo(() => {
    if (academicLevel === 'PRIMARY') return ['1','2','3','4','5','6','7','8'];
    if (academicLevel === 'SECONDARY') return ['9','10'];
    return ['11','12'];
  }, [academicLevel]);

  useEffect(() => {
    if (!availableGrades.includes(selectedGrade)) {
      setSelectedGrade(availableGrades[0]);
    }
    rollInputRef.current?.focus();
  }, [availableGrades, selectedGrade]);

  const getStatus = (studentId: string) => {
    return attendance.find(a => a.studentId === studentId && a.date === selectedDate)?.status || 'NOT_MARKED';
  };

  // Check if any attendance exists for a specific date
  const hasAttendanceData = (dateStr: string) => {
    return attendance.some(a => a.date === dateStr);
  };

  const markStatus = async (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    if (!isStaff) return;
    
    const record: AttendanceRecord = { studentId, date: selectedDate, status };
    const student = students.find(s => s.id === studentId);
    
    const success = await onUpsertRecord(record);
    
    if (student) {
      setLastProcessed({ name: student.name, status, success });
      setTimeout(() => setLastProcessed(null), 3000);
    }
  };

  const filteredStudents = useMemo(() => {
    return students
      .filter(s => 
        s.status !== 'CANCELLED' &&
        s.grade === selectedGrade && 
        s.section === selectedSection && 
        s.medium === selectedMedium && 
        s.gender === selectedGender
      )
      .sort((a, b) => (parseInt(a.rollNo) || 0) - (parseInt(b.rollNo) || 0));
  }, [students, selectedGrade, selectedSection, selectedMedium, selectedGender]);

  const absentStudents = useMemo(() => {
    return students.filter(s => {
      const isCorrectClass = s.grade === selectedGrade && s.section === selectedSection;
      const status = attendance.find(a => a.studentId === s.id && a.date === selectedDate)?.status;
      return s.status !== 'CANCELLED' && isCorrectClass && status === 'ABSENT';
    }).sort((a, b) => (parseInt(a.rollNo) || 0) - (parseInt(b.rollNo) || 0));
  }, [students, attendance, selectedDate, selectedGrade, selectedSection]);

  const handleRollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const roll = rollInput.trim();
    if (!roll) return;
    
    const student = students.find(s => 
      s.status !== 'CANCELLED' &&
      s.grade === selectedGrade && 
      s.section === selectedSection &&
      s.rollNo.toString() === roll
    );

    if (student) {
      markStatus(student.id, entryMode);
      setRollInput('');
      setTimeout(() => rollInputRef.current?.focus(), 10);
    } else {
      alert(`Roll Number ${roll} is not found in Class ${selectedGrade}-${selectedSection}.`);
      setRollInput('');
      rollInputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 md:gap-8 animate-fade-in pb-32">
      
      {/* SIDEBAR NAVIGATION & FILTERS */}
      <aside className="w-full lg:w-80 shrink-0 space-y-6">
        
        {/* ENHANCED CALENDAR HUB */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-indigo-50 overflow-hidden card-3d">
          <div className="p-5 bg-indigo-950 text-white flex items-center justify-between">
             <h2 className="text-[11px] font-black uppercase tracking-widest">
               {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
             </h2>
             <div className="flex gap-2">
                <button onClick={() => changeMonth(-1)} className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[10px] active:scale-90"><i className="fa-solid fa-chevron-left"></i></button>
                <button onClick={() => changeMonth(1)} className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[10px] active:scale-90"><i className="fa-solid fa-chevron-right"></i></button>
             </div>
          </div>
          <div className="p-4 bg-white">
            <div className="grid grid-cols-7 gap-1.5">
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <div key={i} className="text-center text-[9px] font-black text-slate-300 py-1">{d}</div>
              ))}
              {calendarDays.map((dateStr, idx) => {
                if (!dateStr) return <div key={idx}></div>;
                const d = new Date(dateStr).getDate();
                const isSelected = selectedDate === dateStr;
                const isToday = todayStr === dateStr;
                const isPast = dateStr < todayStr;
                const hasData = hasAttendanceData(dateStr);

                let stateClasses = "text-slate-500 hover:bg-slate-50";
                
                // PRIORITY STYLING:
                if (isSelected) {
                    stateClasses = "bg-indigo-600 text-white shadow-xl ring-4 ring-amber-400 z-10 scale-110";
                } else if (isToday) {
                    stateClasses = "bg-violet-100 text-violet-700 border-2 border-violet-300 animate-pulse font-black";
                } else if (isPast && hasData) {
                    // IF PREVIOUS DATA EXISTS: BLACK COLOR
                    stateClasses = "bg-black text-white shadow-md font-black";
                }

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`h-10 rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${stateClasses}`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 px-1">
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-black"></div><span className="text-[8px] font-black text-gray-400 uppercase">Archived</span></div>
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-violet-300"></div><span className="text-[8px] font-black text-gray-400 uppercase">Today</span></div>
            </div>
          </div>
        </div>

        {/* REGISTRY FILTERS */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-indigo-50 space-y-6 card-3d">
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-indigo-300 tracking-widest ml-1">Class</label>
                 <select className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-400 rounded-xl px-4 py-3 text-[11px] font-black text-indigo-900 outline-none shadow-inner" value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)}>
                    {availableGrades.map(g => <option key={g} value={g}>STD {g}</option>)}
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-indigo-300 tracking-widest ml-1">Section</label>
                 <select className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-400 rounded-xl px-4 py-3 text-[11px] font-black text-indigo-900 outline-none shadow-inner" value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
                    {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
              </div>
           </div>

           <div className="space-y-3">
              <div className="flex gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                 <button onClick={() => setSelectedMedium('ENGLISH')} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${selectedMedium === 'ENGLISH' ? 'bg-white shadow-lg text-indigo-600' : 'text-gray-400'}`}>ENG</button>
                 <button onClick={() => setSelectedMedium('GUJARATI')} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${selectedMedium === 'GUJARATI' ? 'bg-white shadow-lg text-indigo-600' : 'text-gray-400'}`}>GUJ</button>
              </div>
              <div className="flex gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                 <button onClick={() => setSelectedGender('MALE')} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${selectedGender === 'MALE' ? 'bg-white shadow-lg text-indigo-600' : 'text-gray-400'}`}>BOYS</button>
                 <button onClick={() => setSelectedGender('FEMALE')} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${selectedGender === 'FEMALE' ? 'bg-white shadow-lg text-indigo-600' : 'text-gray-400'}`}>GIRLS</button>
              </div>
           </div>
        </div>
      </aside>

      {/* MAIN REGISTRY INTERFACE */}
      <main className="flex-1 space-y-8">
        
        {/* RAPID ENTRY & ABSENT BOX */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
           <div className="xl:col-span-5 bg-white p-8 rounded-[3.5rem] shadow-2xl border-4 border-indigo-50 flex flex-col justify-center gap-6 card-3d relative overflow-hidden">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-rose-500/5 rounded-full blur-3xl"></div>
              
              <div className="flex items-center justify-between relative z-10">
                 <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 ${entryMode === 'ABSENT' ? 'bg-rose-600 shadow-rose-200' : 'bg-emerald-600 shadow-emerald-200'} text-white rounded-[1.5rem] flex items-center justify-center text-2xl shadow-lg`}>
                        <i className={`fa-solid ${entryMode === 'ABSENT' ? 'fa-user-xmark' : 'fa-user-check'}`}></i>
                    </div>
                    <h3 className="text-xl font-black text-indigo-950 uppercase tracking-tighter">Attendance Entry</h3>
                 </div>
                 
                 <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner">
                    <button onClick={() => setEntryMode('ABSENT')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${entryMode === 'ABSENT' ? 'bg-rose-500 text-white shadow-md' : 'text-gray-400'}`}>ABSENT</button>
                    <button onClick={() => setEntryMode('PRESENT')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${entryMode === 'PRESENT' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-400'}`}>PRESENT</button>
                 </div>
              </div>

              <form onSubmit={handleRollSubmit} className="relative z-10">
                 <input 
                   ref={rollInputRef}
                   type="text" 
                   inputMode="numeric"
                   placeholder="Enter Roll No..." 
                   className={`w-full bg-slate-50 border-4 border-transparent focus:border-${entryMode === 'ABSENT' ? 'rose' : 'emerald'}-500 rounded-[2rem] px-8 py-5 outline-none text-4xl font-black text-indigo-900 shadow-inner transition-all placeholder:text-slate-300`}
                   value={rollInput}
                   onChange={e => setRollInput(e.target.value.replace(/\D/g, ''))}
                 />
                 <div className="flex justify-center mt-3 h-6">
                    {lastProcessed && (
                      <p className={`text-[10px] font-black uppercase tracking-widest animate-fade-in flex items-center gap-2 ${lastProcessed.success ? 'text-emerald-500' : 'text-rose-500'}`}>
                         <i className={`fa-solid ${lastProcessed.success ? 'fa-cloud-arrow-up' : 'fa-triangle-exclamation'}`}></i>
                         {lastProcessed.name}: {lastProcessed.status} {lastProcessed.success ? '(SAVED)' : '(SYNC FAILED)'}
                      </p>
                    )}
                 </div>
              </form>
           </div>

           {/* REDESIGNED ABSENT VAULT - DETAILED CARDS */}
           <div className="xl:col-span-7 bg-indigo-950 p-8 rounded-[4rem] shadow-2xl relative overflow-hidden flex flex-col min-h-[300px] card-3d border-[6px] border-white">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
              <div className="flex items-center justify-between mb-8 relative z-10">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center shadow-lg"><i className="fa-solid fa-ghost"></i></div>
                    <div>
                       <h4 className="text-xl font-black text-white uppercase tracking-tighter">Absent Student Box</h4>
                       <p className="text-[8px] font-bold text-rose-300 uppercase tracking-widest">{selectedDate}</p>
                    </div>
                 </div>
                 <span className="px-5 py-2 bg-rose-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl ring-4 ring-white/10">
                    {absentStudents.length} Absent Students
                 </span>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[220px] custom-scrollbar relative z-10 pr-2">
                 {absentStudents.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                       {absentStudents.map(s => (
                         <div key={s.id} className="bg-white p-5 rounded-[2.5rem] flex items-center justify-between shadow-2xl animate-scale-in border-l-[12px] border-rose-500 group">
                            <div className="flex items-center gap-6 min-w-0">
                               <div className="w-16 h-16 rounded-[1.5rem] bg-rose-50 flex items-center justify-center font-black text-rose-600 text-3xl shadow-inner shrink-0 group-hover:scale-110 transition-transform">
                                  {s.rollNo}
                               </div>
                               <div className="min-w-0">
                                  <p className="text-lg font-black text-indigo-950 uppercase truncate leading-none mb-2">{s.name}</p>
                                  <div className="flex items-center gap-3">
                                     <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                                        CLASS {s.grade}-{s.section}
                                     </span>
                                     <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">{s.medium} MEDIUM</span>
                                  </div>
                               </div>
                            </div>
                            <button 
                               onClick={() => markStatus(s.id, 'PRESENT')}
                               className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all active:scale-90 shrink-0 shadow-sm"
                               title="Mark Present"
                            >
                               <i className="fa-solid fa-arrow-rotate-left text-xl"></i>
                            </button>
                         </div>
                       ))}
                    </div>
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 text-white text-center">
                       <i className="fa-solid fa-check-double text-6xl mb-4 text-emerald-400"></i>
                       <p className="text-sm font-black uppercase tracking-widest">Registry Perfect - All Students Present</p>
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* FULL REGISTRY VIEW */}
        <div className="bg-white rounded-[3.5rem] shadow-2xl border border-indigo-50 overflow-hidden card-3d">
           <div className="p-8 bg-gray-50/50 border-b border-indigo-50 flex justify-between items-center">
              <h3 className="text-xl font-black text-indigo-950 uppercase tracking-tighter">Class Registry: {selectedGrade}-{selectedSection}</h3>
              <div className="flex gap-3">
                 <button onClick={() => filteredStudents.forEach(s => markStatus(s.id, 'PRESENT'))} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase shadow-sm">Mark All Present</button>
              </div>
           </div>

           <div className="p-6 grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
              {filteredStudents.length > 0 ? filteredStudents.map(s => {
                const status = getStatus(s.id);
                return (
                  <div key={s.id} className={`flex items-center justify-between p-4 bg-white border-2 rounded-[2rem] transition-all hover:shadow-xl ${status === 'ABSENT' ? 'border-rose-200 bg-rose-50/20' : 'border-indigo-50'}`}>
                     
                     <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm border-2 ${
                           status === 'PRESENT' ? 'bg-emerald-500 border-emerald-300 text-white' :
                           status === 'ABSENT' ? 'bg-rose-600 border-rose-400 text-white' :
                           'bg-slate-100 border-slate-200 text-slate-400'
                        }`}>
                           {s.rollNo}
                        </div>
                        <div className="min-w-0">
                           <h4 className="text-sm font-black text-indigo-950 uppercase truncate max-w-[120px]">{s.name}</h4>
                           <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{status === 'NOT_MARKED' ? 'AWAITING' : status}</p>
                        </div>
                     </div>

                     <div className="flex gap-2">
                        <button 
                          onClick={() => markStatus(s.id, 'PRESENT')}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${status === 'PRESENT' ? 'bg-emerald-500 text-white' : 'bg-gray-50 text-slate-300 hover:text-emerald-500'}`}
                        >
                           <i className="fa-solid fa-check"></i>
                        </button>
                        <button 
                          onClick={() => markStatus(s.id, 'ABSENT')}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${status === 'ABSENT' ? 'bg-rose-600 text-white' : 'bg-gray-50 text-slate-300 hover:text-rose-600'}`}
                        >
                           <i className="fa-solid fa-xmark"></i>
                        </button>
                     </div>
                  </div>
                );
              }) : (
                <div className="col-span-full py-24 text-center opacity-30 flex flex-col items-center">
                   <i className="fa-solid fa-user-ninja text-6xl mb-6"></i>
                   <p className="text-2xl font-black uppercase tracking-widest text-indigo-950">No Students Found</p>
                </div>
              )}
           </div>
        </div>
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.3); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Attendance;
