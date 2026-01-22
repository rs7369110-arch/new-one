
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
      <aside className="w-full lg:w-80 shrink-0 space-y-4 md:space-y-6">
        
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-indigo-50 overflow-hidden">
          <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
             <div className="flex items-center gap-2">
                <h2 className="text-[10px] font-black uppercase tracking-widest">
                  {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
             </div>
             <div className="flex gap-1">
                <button onClick={() => changeMonth(-1)} className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[10px]"><i className="fa-solid fa-chevron-left"></i></button>
                <button onClick={() => changeMonth(1)} className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[10px]"><i className="fa-solid fa-chevron-right"></i></button>
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
                    className={`h-8 md:h-9 rounded-xl flex items-center justify-center text-[9px] md:text-[10px] font-bold transition-all ${
                      isSelected ? 'bg-indigo-600 text-white shadow-lg' : 
                      isToday ? 'bg-amber-100 text-amber-600 border border-amber-200' : 'text-slate-500'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-indigo-50 space-y-4 md:space-y-6">
           <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-indigo-400 tracking-widest">Medium</label>
              <div className="flex gap-2 p-1 bg-gray-50 rounded-xl border border-gray-100">
                 <button onClick={() => setSelectedMedium('ENGLISH')} className={`flex-1 py-2 rounded-lg text-[9px] font-black transition-all ${selectedMedium === 'ENGLISH' ? 'bg-white shadow-md text-indigo-600' : 'text-gray-400'}`}>ENG</button>
                 <button onClick={() => setSelectedMedium('GUJARATI')} className={`flex-1 py-2 rounded-lg text-[9px] font-black transition-all ${selectedMedium === 'GUJARATI' ? 'bg-white shadow-md text-indigo-600' : 'text-gray-400'}`}>GUJ</button>
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-indigo-400 tracking-widest">Gender</label>
              <div className="flex gap-2 p-1 bg-gray-50 rounded-xl border border-gray-100">
                 <button onClick={() => setSelectedGender('MALE')} className={`flex-1 py-2 rounded-lg text-[9px] font-black transition-all ${selectedGender === 'MALE' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'}`}>BOYS</button>
                 <button onClick={() => setSelectedGender('FEMALE')} className={`flex-1 py-2 rounded-lg text-[9px] font-black transition-all ${selectedGender === 'FEMALE' ? 'bg-white shadow-md text-rose-600' : 'text-gray-400'}`}>GIRLS</button>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase text-indigo-300 tracking-widest">Grade</label>
                 <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-2 py-2 text-[10px] font-black text-indigo-900 outline-none" value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)}>
                    {availableGrades.map(g => <option key={g} value={g}>STD {g}</option>)}
                 </select>
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase text-indigo-300 tracking-widest">Sec</label>
                 <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-2 py-2 text-[10px] font-black text-indigo-900 outline-none" value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
                    {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 space-y-4 md:space-y-6">
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
           <div className="xl:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-xl border border-indigo-50 flex flex-col md:flex-row items-center gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-rose-500 text-white rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-3xl shrink-0 shadow-lg">
                 <i className="fa-solid fa-user-xmark"></i>
              </div>
              <form onSubmit={handleRollSubmit} className="flex-1 w-full">
                 <input 
                   type="text" 
                   placeholder="Enter Roll # for ABSENT" 
                   className="w-full bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-xl md:rounded-2xl px-5 py-3 md:py-4 outline-none text-xl md:text-2xl font-black text-indigo-900 shadow-inner"
                   value={rollInput}
                   onChange={e => setRollInput(e.target.value)}
                 />
              </form>
           </div>

           <div className="bg-rose-50 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border-2 border-rose-100 relative overflow-hidden flex flex-col min-h-[120px]">
              <div className="flex items-center justify-between mb-2">
                 <h4 className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Absentees: {absentStudents.length}</h4>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                 <div className="flex flex-wrap gap-2">
                    {absentStudents.map(s => (
                      <div key={s.id} className="bg-white border border-rose-200 px-2 py-1 rounded-lg flex items-center gap-2 shadow-sm">
                         <span className="text-[9px] font-black text-rose-600">#{s.rollNo}</span>
                         <span className="text-[9px] font-bold text-gray-700 truncate max-w-[80px]">{s.name}</span>
                         <button onClick={() => markStatus(s.id, 'PRESENT')} className="text-emerald-500">
                            <i className="fa-solid fa-check"></i>
                         </button>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-2xl border border-indigo-50 overflow-hidden">
           <div className="p-6 md:p-8 bg-gray-50/50 border-b border-indigo-50 flex justify-between items-center">
              <h3 className="text-lg md:text-xl font-black text-indigo-950 uppercase tracking-tight">Daily Registry</h3>
              <span className="text-[9px] font-black text-slate-400 uppercase bg-white border border-slate-200 px-3 py-1 rounded-full">
                 {filteredStudents.length} Students
              </span>
           </div>

           <div className="p-4 space-y-3">
              {filteredStudents.length > 0 ? filteredStudents.map(s => {
                const status = getStatus(s.id);
                return (
                  <div key={s.id} className="flex items-center justify-between p-4 md:p-6 bg-white border border-indigo-50 rounded-2xl md:rounded-[2.5rem] hover:shadow-lg transition-all group">
                     
                     <button 
                       onClick={() => markStatus(s.id, 'PRESENT')}
                       className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center border-4 transition-all ${
                         status === 'PRESENT' 
                         ? 'bg-emerald-500 border-emerald-300 text-white shadow-lg' 
                         : 'bg-white border-emerald-50 text-emerald-500 hover:bg-emerald-50'
                       }`}
                     >
                        <i className="fa-solid fa-arrow-left text-lg md:text-2xl"></i>
                     </button>

                     <div className="flex-1 flex flex-col items-center text-center px-2">
                        <div className="flex items-center gap-2 mb-1">
                           <span className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-[10px]">
                             {s.rollNo}
                           </span>
                           <h4 className="text-sm md:text-lg font-black text-indigo-950 uppercase truncate max-w-[120px] md:max-w-none">{s.name}</h4>
                        </div>
                        <div className={`px-3 py-0.5 rounded-full text-[7px] md:text-[8px] font-black uppercase tracking-widest ${
                           status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600' :
                           status === 'ABSENT' ? 'bg-rose-50 text-rose-600' :
                           'bg-slate-100 text-slate-400 opacity-40'
                        }`}>
                           {status === 'NOT_MARKED' ? 'PENDING' : status}
                        </div>
                     </div>

                     <button 
                       onClick={() => markStatus(s.id, 'ABSENT')}
                       className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center border-4 transition-all ${
                         status === 'ABSENT' 
                         ? 'bg-rose-500 border-rose-300 text-white shadow-lg' 
                         : 'bg-white border-rose-50 text-rose-500 hover:bg-rose-50'
                       }`}
                     >
                        <i className="fa-solid fa-arrow-right text-lg md:text-2xl"></i>
                     </button>
                  </div>
                );
              }) : (
                <div className="py-20 text-center opacity-30 flex flex-col items-center">
                   <i className="fa-solid fa-users-viewfinder text-5xl mb-4"></i>
                   <p className="text-lg font-black uppercase">No Students Found</p>
                </div>
              )}
           </div>
        </div>

        {filteredStudents.length > 0 && (
          <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] shadow-2xl border-4 border-indigo-50 flex items-center justify-center sticky bottom-24 md:bottom-4 z-40">
             <button 
                onClick={handleFinalSave}
                disabled={isSaving}
                className={`w-full md:w-auto px-12 md:px-20 py-4 md:py-6 rounded-[1.5rem] md:rounded-[2.5rem] font-black uppercase text-[10px] md:text-xs tracking-widest shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-4 ${
                  saveSuccess ? 'bg-emerald-500 text-white' : 'bg-indigo-950 text-white hover:bg-black'
                }`}
             >
                <i className={`fa-solid ${isSaving ? 'fa-spinner fa-spin' : saveSuccess ? 'fa-check-double' : 'fa-cloud-arrow-up'} text-lg`}></i>
                {isSaving ? 'Syncing...' : saveSuccess ? 'Success' : 'Save Registry'}
             </button>
          </div>
        )}
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
      `}</style>
    </div>
  );
};

export default Attendance;
