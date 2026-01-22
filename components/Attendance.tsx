
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
  const [selectedGender, setSelectedGender] = useState<'MALE' | 'FEMALE'>('FEMALE'); 
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

  const availableGrades = useMemo(() => {
    if (academicLevel === 'PRIMARY') return ['1','2','3','4','5','6','7','8'];
    if (academicLevel === 'SECONDARY') return ['9','10'];
    return ['11','12'];
  }, [academicLevel]);

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

  const absentStudents = useMemo(() => {
    return filteredStudents.filter(s => getStatus(s.id) === 'ABSENT');
  }, [filteredStudents, attendance, selectedDate]);

  const handleRollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollInput) return;
    const student = filteredStudents.find(s => s.rollNo === rollInput);
    if (student) {
      markStatus(student.id, 'ABSENT');
      setRollInput('');
    } else {
      alert(`Roll #${rollInput} not found.`);
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
    <div className="flex flex-col lg:flex-row gap-6 md:gap-8 animate-fade-in pb-32">
      
      {/* Filters Sidebar */}
      <aside className="w-full lg:w-80 shrink-0 space-y-6">
        
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-indigo-50 overflow-hidden card-3d">
          <div className="p-5 bg-indigo-600 text-white flex items-center justify-between">
             <div className="flex items-center gap-2">
                <h2 className="text-[11px] font-black uppercase tracking-widest">
                  {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
             </div>
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
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`h-10 rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${
                      isSelected ? 'bg-indigo-600 text-white shadow-[0_8px_16px_rgba(79,70,229,0.3)]' : 
                      isToday ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-indigo-50 space-y-6 card-3d">
           <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest ml-1">Academic Medium</label>
              <div className="flex gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                 <button onClick={() => setSelectedMedium('ENGLISH')} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${selectedMedium === 'ENGLISH' ? 'bg-white shadow-lg text-indigo-600 scale-105' : 'text-gray-400'}`}>ENGLISH</button>
                 <button onClick={() => setSelectedMedium('GUJARATI')} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${selectedMedium === 'GUJARATI' ? 'bg-white shadow-lg text-indigo-600 scale-105' : 'text-gray-400'}`}>GUJARATI</button>
              </div>
           </div>

           <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest ml-1">Gender Node</label>
              <div className="flex gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                 <button onClick={() => setSelectedGender('MALE')} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${selectedGender === 'MALE' ? 'bg-white shadow-lg text-blue-600 scale-105' : 'text-gray-400'}`}>BOYS</button>
                 <button onClick={() => setSelectedGender('FEMALE')} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${selectedGender === 'FEMALE' ? 'bg-white shadow-lg text-rose-600 scale-105' : 'text-gray-400'}`}>GIRLS</button>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-indigo-300 tracking-widest ml-1">Class</label>
                 <select className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-400 rounded-xl px-4 py-3 text-[11px] font-black text-indigo-900 outline-none shadow-inner" value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)}>
                    {availableGrades.map(g => <option key={g} value={g}>STD {g}</option>)}
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-indigo-300 tracking-widest ml-1">Sec</label>
                 <select className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-400 rounded-xl px-4 py-3 text-[11px] font-black text-indigo-900 outline-none shadow-inner" value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
                    {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 space-y-6">
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
           <div className="xl:col-span-2 bg-white p-6 md:p-8 rounded-[3rem] shadow-2xl border border-indigo-50 flex flex-col md:flex-row items-center gap-6 card-3d">
              <div className="w-16 h-16 bg-rose-500 text-white rounded-[1.8rem] flex items-center justify-center text-3xl shrink-0 shadow-[0_12px_24px_rgba(244,63,94,0.3)]">
                 <i className="fa-solid fa-user-xmark"></i>
              </div>
              <form onSubmit={handleRollSubmit} className="flex-1 w-full">
                 <input 
                   type="text" 
                   placeholder="Enter Roll # for ABSENT" 
                   className="w-full bg-slate-50 border-4 border-transparent focus:border-rose-500 rounded-[1.8rem] px-8 py-4 outline-none text-2xl font-black text-indigo-900 shadow-inner transition-all"
                   value={rollInput}
                   onChange={e => setRollInput(e.target.value)}
                 />
              </form>
           </div>

           <div className="bg-rose-50 p-6 md:p-8 rounded-[3rem] border-4 border-white shadow-xl relative overflow-hidden flex flex-col min-h-[140px] card-3d">
              <div className="flex items-center justify-between mb-3">
                 <h4 className="text-[11px] font-black text-rose-600 uppercase tracking-widest">Absentees: {absentStudents.length}</h4>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[100px] custom-scrollbar">
                 <div className="flex flex-wrap gap-2.5">
                    {absentStudents.map(s => (
                      <div key={s.id} className="bg-white border-2 border-rose-100 px-3 py-1.5 rounded-xl flex items-center gap-3 shadow-md hover:bg-rose-500 hover:text-white transition-all group/item">
                         <span className="text-[10px] font-black text-rose-600 group-hover/item:text-white">#{s.rollNo}</span>
                         <span className="text-[10px] font-black text-gray-700 truncate max-w-[100px] uppercase group-hover/item:text-white">{s.name}</span>
                         <button onClick={() => markStatus(s.id, 'PRESENT')} className="text-emerald-500 group-hover/item:text-white">
                            <i className="fa-solid fa-circle-check"></i>
                         </button>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        <div className="bg-white rounded-[3.5rem] shadow-2xl border border-indigo-50 overflow-hidden card-3d">
           <div className="p-8 bg-gray-50/50 border-b border-indigo-50 flex justify-between items-center">
              <h3 className="text-xl font-black text-indigo-950 uppercase tracking-tighter">Class Daily Registry</h3>
              <span className="text-[10px] font-black text-indigo-400 uppercase bg-white border border-indigo-100 px-5 py-2 rounded-full shadow-inner">
                 {filteredStudents.length} Profiles Loaded
              </span>
           </div>

           <div className="p-6 space-y-4">
              {filteredStudents.length > 0 ? filteredStudents.map(s => {
                const status = getStatus(s.id);
                return (
                  <div key={s.id} className="flex items-center justify-between p-5 md:p-7 bg-white border border-indigo-50 rounded-[2.5rem] hover:shadow-2xl transition-all group card-3d">
                     
                     <button 
                       onClick={() => markStatus(s.id, 'PRESENT')}
                       className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center border-[6px] transition-all ${
                         status === 'PRESENT' 
                         ? 'bg-emerald-500 border-emerald-300 text-white shadow-[0_10px_20px_rgba(16,185,129,0.3)] scale-110' 
                         : 'bg-white border-emerald-50 text-emerald-500 hover:bg-emerald-50 active:scale-95'
                       }`}
                     >
                        <i className="fa-solid fa-check text-2xl"></i>
                     </button>

                     <div className="flex-1 flex flex-col items-center text-center px-4">
                        <div className="flex items-center gap-3 mb-2">
                           <span className="w-10 h-10 rounded-[1.2rem] bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-sm shadow-inner border border-indigo-100">
                             {s.rollNo}
                           </span>
                           <h4 className="text-base md:text-xl font-black text-indigo-950 uppercase truncate max-w-[150px] md:max-w-none">{s.name}</h4>
                        </div>
                        <div className={`px-5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ${
                           status === 'PRESENT' ? 'bg-emerald-500 text-white' :
                           status === 'ABSENT' ? 'bg-rose-500 text-white' :
                           'bg-slate-100 text-slate-400'
                        }`}>
                           {status === 'NOT_MARKED' ? 'AWAITING' : status}
                        </div>
                     </div>

                     <button 
                       onClick={() => markStatus(s.id, 'ABSENT')}
                       className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center border-[6px] transition-all ${
                         status === 'ABSENT' 
                         ? 'bg-rose-500 border-rose-300 text-white shadow-[0_10px_20px_rgba(244,63,94,0.3)] scale-110' 
                         : 'bg-white border-rose-50 text-rose-500 hover:bg-rose-50 active:scale-95'
                       }`}
                     >
                        <i className="fa-solid fa-xmark text-2xl"></i>
                     </button>
                  </div>
                );
              }) : (
                <div className="py-24 text-center opacity-30 flex flex-col items-center">
                   <i className="fa-solid fa-user-ninja text-6xl mb-6"></i>
                   <p className="text-2xl font-black uppercase tracking-widest text-indigo-950">No Data Points Found</p>
                </div>
              )}
           </div>
        </div>

        {filteredStudents.length > 0 && (
          <div className="bg-white p-8 rounded-[3.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] border-4 border-indigo-50 flex items-center justify-center sticky bottom-24 md:bottom-8 z-40 transform transition-transform hover:scale-[1.02]">
             <button 
                onClick={handleFinalSave}
                disabled={isSaving}
                className={`btn-3d-indigo w-full md:w-auto px-16 md:px-24 py-5 md:py-7 rounded-[2rem] font-black uppercase text-xs md:text-sm tracking-[0.3em] flex items-center justify-center gap-6 border-indigo-950 ${
                  saveSuccess ? 'bg-emerald-500 border-emerald-900' : 'bg-indigo-950 text-white'
                }`}
             >
                <i className={`fa-solid ${isSaving ? 'fa-spinner fa-spin' : saveSuccess ? 'fa-check-double' : 'fa-cloud-arrow-up'} text-2xl`}></i>
                {isSaving ? 'SYNCHRONIZING...' : saveSuccess ? 'REGISTRY SECURED' : 'COMMIT REGISTRY'}
             </button>
          </div>
        )}
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
      `}</style>
    </div>
  );
};

export default Attendance;
