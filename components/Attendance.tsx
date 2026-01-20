
import React, { useState, useMemo, useEffect } from 'react';
import { User, UserRole, Student, AttendanceRecord } from '../types';

interface AttendanceProps {
  user: User;
  students: Student[];
  attendance: AttendanceRecord[];
  setAttendance: (records: AttendanceRecord[]) => void;
}

type AcademicLevel = 'PRIMARY' | 'SECONDARY' | 'HIGHER_SECONDARY';

const Attendance: React.FC<AttendanceProps> = ({ user, students, attendance, setAttendance }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [viewDate, setViewDate] = useState(new Date());
  
  // Selection States
  const [selectedMedium, setSelectedMedium] = useState<'ENGLISH' | 'GUJARATI'>('ENGLISH');
  const [selectedGender, setSelectedGender] = useState<'MALE' | 'FEMALE'>('FEMALE'); // Default to Girls
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>('PRIMARY');
  const [selectedGrade, setSelectedGrade] = useState('1');
  const [selectedSection, setSelectedSection] = useState('A');
  
  const [rollInput, setRollInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isStaff = user.role === UserRole.ADMIN || user.role === UserRole.TEACHER;

  // Calendar Logic
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startOffset = startDayOfMonth(year, month);
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

  // Grade Logic Based on Level
  const availableGrades = useMemo(() => {
    if (academicLevel === 'PRIMARY') return ['1','2','3','4','5','6','7','8'];
    if (academicLevel === 'SECONDARY') return ['9','10'];
    return ['11','12'];
  }, [academicLevel]);

  // Update selected grade if it falls out of range
  useEffect(() => {
    if (!availableGrades.includes(selectedGrade)) {
      setSelectedGrade(availableGrades[0]);
    }
  }, [availableGrades, selectedGrade]);

  const getStatus = (studentId: string) => {
    return attendance.find(a => a.studentId === studentId && a.date === selectedDate)?.status || 'NOT_MARKED';
  };

  const markStatus = (studentId: string, status: 'PRESENT' | 'ABSENT') => {
    if (!isStaff) return;
    const existingIndex = attendance.findIndex(a => a.studentId === studentId && a.date === selectedDate);
    const newRecords = [...attendance];
    if (existingIndex > -1) {
      newRecords[existingIndex].status = status;
    } else {
      newRecords.push({ studentId, date: selectedDate, status });
    }
    setAttendance(newRecords);
    setSaveSuccess(false);
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

  // ABSENT LIST LOGIC
  const absentStudents = useMemo(() => {
    return filteredStudents.filter(s => getStatus(s.id) === 'ABSENT');
  }, [filteredStudents, attendance, selectedDate]);

  const handleRollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollInput) return;
    const student = filteredStudents.find(s => s.rollNo === rollInput);
    if (student) {
      markStatus(student.id, 'ABSENT'); // Changed to mark ABSENT as requested
      setRollInput('');
    } else {
      alert(`Roll #${rollInput} not found in this specific filter selection.`);
    }
  };

  const handleFinalSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fade-in pb-24">
      
      {/* LEFT SIDEBAR: CALENDAR & FILTERS */}
      <aside className="w-full lg:w-80 shrink-0 space-y-6">
        
        {/* MONTH WISE CALENDAR */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-indigo-50 overflow-hidden">
          <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
             <div className="flex items-center gap-2">
                <i className="fa-solid fa-calendar-day text-xs"></i>
                <h2 className="text-[10px] font-black uppercase tracking-widest">
                  {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
             </div>
             <div className="flex gap-1">
                <button onClick={() => changeMonth(-1)} className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[10px] hover:bg-white/20 transition-all"><i className="fa-solid fa-chevron-left"></i></button>
                <button onClick={() => changeMonth(1)} className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[10px] hover:bg-white/20 transition-all"><i className="fa-solid fa-chevron-right"></i></button>
             </div>
          </div>
          <div className="p-3 bg-white">
            <div className="grid grid-cols-7 gap-1">
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <div key={i} className="text-center text-[8px] font-black text-slate-300 py-1">{d}</div>
              ))}
              {calendarDays.map((dateStr, idx) => {
                if (!dateStr) return <div key={idx}></div>;
                const d = new Date(dateStr).getDate();
                const isSelected = selectedDate === dateStr;
                const isToday = todayStr === dateStr;
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`h-9 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all ${
                      isSelected ? 'bg-indigo-600 text-white shadow-lg scale-110 z-10' : 
                      isToday ? 'bg-amber-100 text-amber-600 border border-amber-200' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ACADEMY FILTERS */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-indigo-50 space-y-6">
           {/* Medium Toggle */}
           <div className="space-y-3">
              <label className="text-[9px] font-black uppercase text-indigo-400 tracking-widest ml-1">Select Medium</label>
              <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl border border-gray-100">
                 <button onClick={() => setSelectedMedium('ENGLISH')} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${selectedMedium === 'ENGLISH' ? 'bg-white shadow-md text-indigo-600' : 'text-gray-400'}`}>ENGLISH</button>
                 <button onClick={() => setSelectedMedium('GUJARATI')} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${selectedMedium === 'GUJARATI' ? 'bg-white shadow-md text-indigo-600' : 'text-gray-400'}`}>GUJ MED</button>
              </div>
           </div>

           {/* Gender Toggle */}
           <div className="space-y-3">
              <label className="text-[9px] font-black uppercase text-indigo-400 tracking-widest ml-1">Select Gender</label>
              <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl border border-gray-100">
                 <button onClick={() => setSelectedGender('MALE')} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${selectedGender === 'MALE' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'}`}>BOYS</button>
                 <button onClick={() => setSelectedGender('FEMALE')} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${selectedGender === 'FEMALE' ? 'bg-white shadow-md text-rose-600' : 'text-gray-400'}`}>GIRLS</button>
              </div>
           </div>

           {/* Level Toggle */}
           <div className="space-y-3">
              <label className="text-[9px] font-black uppercase text-indigo-400 tracking-widest ml-1">Academic Level</label>
              <div className="grid grid-cols-1 gap-2">
                 <button onClick={() => setAcademicLevel('PRIMARY')} className={`w-full py-3 rounded-xl text-[10px] font-black border-2 transition-all ${academicLevel === 'PRIMARY' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-transparent border-gray-100 text-gray-400'}`}>PRIMARY (1-8)</button>
                 <button onClick={() => setAcademicLevel('SECONDARY')} className={`w-full py-3 rounded-xl text-[10px] font-black border-2 transition-all ${academicLevel === 'SECONDARY' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-transparent border-gray-100 text-gray-400'}`}>SECONDARY (9-10)</button>
                 <button onClick={() => setAcademicLevel('HIGHER_SECONDARY')} className={`w-full py-3 rounded-xl text-[10px] font-black border-2 transition-all ${academicLevel === 'HIGHER_SECONDARY' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-transparent border-gray-100 text-gray-400'}`}>HIGHER SEC (11-12)</button>
              </div>
           </div>

           {/* Grade & Section */}
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-[9px] font-black uppercase text-indigo-300 tracking-widest ml-1">Standard</label>
                 <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-xs font-black text-indigo-900 outline-none" value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)}>
                    {availableGrades.map(g => <option key={g} value={g}>STD {g}</option>)}
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[9px] font-black uppercase text-indigo-300 tracking-widest ml-1">Section</label>
                 <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-xs font-black text-indigo-900 outline-none" value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
                    {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
              </div>
           </div>
        </div>
      </aside>

      {/* RIGHT SIDE: MAIN ATTENDANCE HUB */}
      <main className="flex-1 space-y-6">
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
           {/* QUICK ROLL NUMBER ENTRY */}
           <div className="xl:col-span-2 bg-white p-8 rounded-[3rem] shadow-xl border border-indigo-50 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden h-fit">
              <div className="w-16 h-16 bg-rose-500 text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg shrink-0">
                 <i className="fa-solid fa-user-xmark"></i>
              </div>
              <form onSubmit={handleRollSubmit} className="flex-1 w-full">
                 <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] mb-2">Mark Absent by Roll Number</p>
                 <input 
                   type="text" 
                   placeholder="Roll # + ENTER to mark ABSENT" 
                   className="w-full bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl px-6 py-4 outline-none text-2xl font-black text-indigo-900 transition-all shadow-inner"
                   value={rollInput}
                   onChange={e => setRollInput(e.target.value)}
                   autoFocus
                 />
              </form>
              <div className="hidden md:block text-right">
                 <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Selected</p>
                 <p className="text-xl font-black text-indigo-950 leading-none">STD {selectedGrade}-{selectedSection}</p>
              </div>
           </div>

           {/* ABSENTEE LIST BOX */}
           <div className="bg-rose-50 p-8 rounded-[3rem] shadow-xl border-2 border-rose-100 relative overflow-hidden flex flex-col min-h-[160px]">
              <div className="flex items-center justify-between mb-4 relative z-10">
                 <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-[0.3em]">Absentee Registry</h4>
                 <span className="bg-rose-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md animate-pulse">
                    {absentStudents.length} Total
                 </span>
              </div>
              
              <div className="flex-1 overflow-y-auto max-h-[120px] custom-scrollbar-rose relative z-10">
                 {absentStudents.length > 0 ? (
                   <div className="flex flex-wrap gap-2">
                      {absentStudents.map(s => (
                        <div key={s.id} className="bg-white border border-rose-200 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-sm group">
                           <span className="text-[10px] font-black text-rose-600">#{s.rollNo}</span>
                           <span className="text-[10px] font-bold text-gray-700 truncate max-w-[100px]">{s.name}</span>
                           <button onClick={() => markStatus(s.id, 'PRESENT')} className="opacity-0 group-hover:opacity-100 text-emerald-500 hover:text-emerald-700 transition-opacity">
                              <i className="fa-solid fa-circle-check"></i>
                           </button>
                        </div>
                      ))}
                   </div>
                 ) : (
                   <div className="h-full flex items-center justify-center italic text-rose-300 text-xs font-bold text-center">
                      Registry clear. No absentees logged.
                   </div>
                 )}
              </div>
              <div className="absolute -bottom-6 -right-6 text-rose-200/20 text-8xl pointer-events-none transform -rotate-12">
                 <i className="fa-solid fa-user-slash"></i>
              </div>
           </div>
        </div>

        {/* STUDENT LIST WITH ARROW CONTROLS */}
        <div className="bg-white rounded-[3.5rem] shadow-2xl border border-indigo-50 overflow-hidden">
           <div className="p-8 bg-gray-50/50 border-b border-indigo-50 flex justify-between items-center">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-lg shadow-md">
                    <i className="fa-solid fa-list-check"></i>
                 </div>
                 <h3 className="text-xl font-black text-indigo-950 uppercase tracking-tighter">Class Registry</h3>
              </div>
              <div className="flex items-center gap-4">
                {saveSuccess && (
                  <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest animate-bounce">
                    <i className="fa-solid fa-circle-check"></i> Successfully Saved
                  </div>
                )}
                <span className="text-[10px] font-black text-slate-400 uppercase bg-white border border-slate-200 px-4 py-1 rounded-full">
                   {filteredStudents.length} Students
                </span>
              </div>
           </div>

           <div className="p-4 space-y-4">
              {filteredStudents.length > 0 ? filteredStudents.map(s => {
                const status = getStatus(s.id);
                return (
                  <div key={s.id} className="flex items-center justify-between p-6 bg-white border border-indigo-50 rounded-[2.5rem] hover:shadow-lg transition-all group relative overflow-hidden">
                     
                     {/* LEFT ARROW: PRESENT */}
                     <button 
                       onClick={() => markStatus(s.id, 'PRESENT')}
                       className={`w-16 h-16 rounded-full flex items-center justify-center transition-all transform active:scale-90 border-4 ${
                         status === 'PRESENT' 
                         ? 'bg-emerald-500 border-emerald-300 text-white shadow-lg shadow-emerald-200' 
                         : 'bg-white border-emerald-50 text-emerald-500 hover:bg-emerald-50 hover:scale-105'
                       }`}
                       title="Mark Present"
                     >
                        <i className="fa-solid fa-arrow-left text-2xl"></i>
                     </button>

                     {/* STUDENT IDENTITY (CENTER) */}
                     <div className="flex-1 flex flex-col items-center text-center px-4">
                        <div className="flex items-center gap-3 mb-1">
                           <span className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-sm border border-indigo-100">
                             {s.rollNo}
                           </span>
                           <h4 className="text-lg font-black text-indigo-950 uppercase tracking-tight line-clamp-1">{s.name}</h4>
                        </div>
                        <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm transition-all ${
                           status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                           status === 'ABSENT' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                           'bg-slate-50 text-slate-400 border-slate-100 opacity-40'
                        }`}>
                           {status === 'NOT_MARKED' ? 'Awaiting Input' : status}
                        </div>
                     </div>

                     {/* RIGHT ARROW: ABSENT */}
                     <button 
                       onClick={() => markStatus(s.id, 'ABSENT')}
                       className={`w-16 h-16 rounded-full flex items-center justify-center transition-all transform active:scale-90 border-4 ${
                         status === 'ABSENT' 
                         ? 'bg-rose-500 border-rose-300 text-white shadow-lg shadow-rose-200' 
                         : 'bg-white border-rose-50 text-rose-500 hover:bg-rose-50 hover:scale-105'
                       }`}
                       title="Mark Absent"
                     >
                        <i className="fa-solid fa-arrow-right text-2xl"></i>
                     </button>
                  </div>
                );
              }) : (
                <div className="py-32 text-center opacity-20 flex flex-col items-center">
                   <i className="fa-solid fa-users-viewfinder text-8xl mb-6"></i>
                   <p className="text-2xl font-black uppercase tracking-widest">No Matches</p>
                   <p className="text-sm font-bold mt-2">Adjust the filters on the left to load students.</p>
                </div>
              )}
           </div>
        </div>

        {/* FINAL SAVE ACTION BAR */}
        {filteredStudents.length > 0 && (
          <div className="bg-white p-8 rounded-[3.5rem] shadow-2xl border-4 border-indigo-50 flex items-center justify-between sticky bottom-4 z-40 animate-slide-up">
             <div className="hidden md:block">
                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Attendance Finalization</p>
                <p className="text-sm font-bold text-indigo-950 italic">Saving registry for {selectedDate} • {selectedMedium} ({selectedGender})</p>
             </div>
             <button 
                onClick={handleFinalSave}
                disabled={isSaving}
                className={`px-16 py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-4 ${
                  saveSuccess ? 'bg-emerald-500 text-white' : 'bg-indigo-950 text-white hover:bg-black'
                }`}
             >
                <i className={`fa-solid ${isSaving ? 'fa-spinner fa-spin' : saveSuccess ? 'fa-check-double' : 'fa-cloud-arrow-up'} text-xl`}></i>
                {isSaving ? 'Syncing...' : saveSuccess ? 'Saved' : 'Save Attendance'}
             </button>
          </div>
        )}
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        
        .custom-scrollbar-rose::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar-rose::-webkit-scrollbar-thumb { background: #f43f5e; border-radius: 10px; }
        .custom-scrollbar-rose::-webkit-scrollbar-track { background: rgba(244, 63, 94, 0.05); }
      `}</style>
    </div>
  );
};

export default Attendance;
