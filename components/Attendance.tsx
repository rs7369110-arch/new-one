
import React, { useState } from 'react';
import { User, UserRole, Student, AttendanceRecord } from '../types';

interface AttendanceProps {
  user: User;
  students: Student[];
  attendance: AttendanceRecord[];
  setAttendance: (records: AttendanceRecord[]) => void;
}

const Attendance: React.FC<AttendanceProps> = ({ user, students, attendance, setAttendance }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedGrade, setSelectedGrade] = useState('1');
  const [searchRoll, setSearchRoll] = useState('');
  const [quickRoll, setQuickRoll] = useState('');

  // Sort and filter students
  const filteredStudents = students
    .filter(s => s.grade === selectedGrade)
    .sort((a, b) => (parseInt(a.rollNo) || 0) - (parseInt(b.rollNo) || 0));

  const searchedStudents = searchRoll 
    ? filteredStudents.filter(s => s.rollNo.includes(searchRoll))
    : filteredStudents;

  const toggleStatus = (studentId: string) => {
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.TEACHER) return;

    const existingIndex = attendance.findIndex(a => a.studentId === studentId && a.date === selectedDate);
    const newRecords = [...attendance];

    if (existingIndex > -1) {
      const current = newRecords[existingIndex].status;
      let nextStatus: 'PRESENT' | 'ABSENT' | 'LATE' = 'PRESENT';
      if (current === 'PRESENT') nextStatus = 'ABSENT';
      else if (current === 'ABSENT') nextStatus = 'LATE';
      
      newRecords[existingIndex].status = nextStatus;
    } else {
      newRecords.push({ studentId, date: selectedDate, status: 'PRESENT' });
    }
    setAttendance(newRecords);
  };

  const handleQuickAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickRoll) return;
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.TEACHER) return;

    const student = filteredStudents.find(s => s.rollNo === quickRoll);
    if (student) {
      const existingIndex = attendance.findIndex(a => a.studentId === student.id && a.date === selectedDate);
      const newRecords = [...attendance];
      
      if (existingIndex > -1) {
        newRecords[existingIndex].status = 'PRESENT';
      } else {
        newRecords.push({ studentId: student.id, date: selectedDate, status: 'PRESENT' });
      }
      setAttendance(newRecords);
      setQuickRoll('');
      // Small feedback alert for UX (optional, but good for speed entry)
      console.log(`Roll ${quickRoll} marked Present`);
    } else {
      alert(`Roll No ${quickRoll} not found in Class ${selectedGrade}!`);
    }
  };

  const markAllPresent = () => {
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.TEACHER) return;
    const msg = `Are you sure you want to mark all students in Class ${selectedGrade} as Present for ${selectedDate}?`;
    if (!window.confirm(msg)) return;

    let newRecords = [...attendance];
    filteredStudents.forEach(s => {
      const idx = newRecords.findIndex(a => a.studentId === s.id && a.date === selectedDate);
      if (idx > -1) {
        newRecords[idx].status = 'PRESENT';
      } else {
        newRecords.push({ studentId: s.id, date: selectedDate, status: 'PRESENT' });
      }
    });
    setAttendance(newRecords);
  };

  const getStatus = (studentId: string) => {
    return attendance.find(a => a.studentId === studentId && a.date === selectedDate)?.status || 'NOT_MARKED';
  };

  const stats = {
    present: filteredStudents.filter(s => getStatus(s.id) === 'PRESENT').length,
    absent: filteredStudents.filter(s => getStatus(s.id) === 'ABSENT').length,
    late: filteredStudents.filter(s => getStatus(s.id) === 'LATE').length,
    total: filteredStudents.length
  };

  const absentees = filteredStudents.filter(s => getStatus(s.id) === 'ABSENT');

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] shadow-xl border border-indigo-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-indigo-100">
             <i className="fa-solid fa-clipboard-user"></i>
          </div>
          <div>
            <h1 className="text-2xl font-black text-indigo-950 tracking-tight">Register</h1>
            <p className="text-indigo-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
               Class {selectedGrade} • {selectedDate}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Roll Entry Bar - UNIQUE FEATURE */}
          <form onSubmit={handleQuickAttendance} className="flex bg-indigo-50 p-1 rounded-2xl border border-indigo-100 items-center">
            <input 
              type="text" 
              placeholder="Roll No.." 
              className="bg-transparent px-4 py-2 w-24 outline-none font-black text-xs text-indigo-700" 
              value={quickRoll} 
              onChange={e => setQuickRoll(e.target.value)}
            />
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all">
              Mark Present
            </button>
          </form>

          <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-200">
             <input 
               type="date" 
               className="bg-transparent px-3 py-2 outline-none font-black text-[10px] text-gray-700" 
               value={selectedDate} 
               onChange={e => setSelectedDate(e.target.value)}
             />
          </div>
          
          <select 
            className="bg-gray-50 px-4 py-3 rounded-2xl outline-none font-black text-[10px] uppercase text-indigo-700 border border-gray-200 focus:border-indigo-300"
            value={selectedGrade}
            onChange={e => setSelectedGrade(e.target.value)}
          >
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n.toString()}>Class {n}</option>)}
          </select>

          {(user.role === UserRole.ADMIN || user.role === UserRole.TEACHER) && (
            <button 
              onClick={markAllPresent}
              className="px-5 py-3 bg-emerald-500 text-white text-[10px] font-black rounded-2xl hover:bg-emerald-600 transition-all shadow-lg flex items-center gap-2 uppercase tracking-widest"
            >
              <i className="fa-solid fa-check-double"></i>
              All Present
            </button>
          )}
        </div>
      </header>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
           { label: 'Total', value: stats.total, icon: 'fa-users', color: 'text-indigo-500', bg: 'bg-indigo-50' },
           { label: 'Present', value: stats.present, icon: 'fa-user-check', color: 'text-emerald-500', bg: 'bg-emerald-50' },
           { label: 'Absent', value: stats.absent, icon: 'fa-user-xmark', color: 'text-rose-500', bg: 'bg-rose-50' },
           { label: 'Late', value: stats.late, icon: 'fa-user-clock', color: 'text-amber-500', bg: 'bg-amber-50' },
         ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} p-5 rounded-[2rem] border border-white flex items-center gap-4 shadow-sm`}>
               <div className={`w-10 h-10 bg-white ${stat.color} rounded-xl flex items-center justify-center text-lg shadow-sm`}>
                  <i className={`fa-solid ${stat.icon}`}></i>
               </div>
               <div>
                 <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                 <p className="text-xl font-black text-indigo-950">{stat.value}</p>
               </div>
            </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-indigo-50 overflow-hidden">
            <div className="p-5 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
               <div className="relative">
                 <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]"></i>
                 <input 
                   type="text" 
                   placeholder="Filter list..." 
                   className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl outline-none text-[10px] font-bold w-40 focus:border-indigo-400 transition-all"
                   value={searchRoll}
                   onChange={e => setSearchRoll(e.target.value)}
                 />
               </div>
               <p className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.2em]">Registry Ledger</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-indigo-50/30">
                  <tr>
                    <th className="px-6 py-4 text-[9px] font-black text-indigo-400 uppercase tracking-widest text-center w-20">Roll</th>
                    <th className="px-6 py-4 text-[9px] font-black text-indigo-400 uppercase tracking-widest">Student</th>
                    <th className="px-6 py-4 text-[9px] font-black text-indigo-400 uppercase tracking-widest text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-50">
                  {searchedStudents.length > 0 ? searchedStudents.map(s => {
                    const status = getStatus(s.id);
                    return (
                      <tr key={s.id} className="hover:bg-indigo-50/10 transition-colors group">
                        <td className="px-6 py-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all ${
                            status === 'PRESENT' ? 'bg-emerald-500 text-white shadow-lg' :
                            status === 'ABSENT' ? 'bg-rose-500 text-white shadow-lg' :
                            status === 'LATE' ? 'bg-amber-500 text-white shadow-lg' :
                            'bg-gray-100 text-indigo-300'
                          }`}>
                            {s.rollNo}
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                             <div className="w-9 h-9 rounded-lg bg-indigo-50 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-indigo-300 font-black text-xs">
                                {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : s.name.charAt(0)}
                             </div>
                             <div>
                                <p className="font-black text-gray-800 text-xs">{s.name}</p>
                                <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">{s.admissionNo}</p>
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                           <div className="flex justify-center">
                             <button 
                               disabled={user.role !== UserRole.ADMIN && user.role !== UserRole.TEACHER}
                               onClick={() => toggleStatus(s.id)}
                               className={`min-w-[120px] py-2.5 rounded-xl font-black text-[8px] uppercase tracking-widest transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
                                 status === 'PRESENT' ? 'bg-emerald-500 text-white shadow-md' : 
                                 status === 'ABSENT' ? 'bg-rose-500 text-white shadow-md' : 
                                 status === 'LATE' ? 'bg-amber-500 text-white shadow-md' : 
                                 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                               }`}
                             >
                               {status === 'PRESENT' && <i className="fa-solid fa-circle-check"></i>}
                               {status === 'ABSENT' && <i className="fa-solid fa-circle-xmark"></i>}
                               {status === 'LATE' && <i className="fa-solid fa-clock"></i>}
                               {status === 'NOT_MARKED' ? 'Mark Now' : status.replace('_', ' ')}
                             </button>
                           </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={3} className="px-8 py-24 text-center">
                         <div className="opacity-20 flex flex-col items-center">
                            <i className="fa-solid fa-graduation-cap text-6xl mb-4"></i>
                            <p className="font-black text-lg text-indigo-900 uppercase">No heroes registered!</p>
                         </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Reports */}
        <div className="space-y-6">
           <div className="bg-rose-600 p-6 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-sm font-black mb-4 flex items-center gap-2 uppercase tracking-tighter">
                   <i className="fa-solid fa-user-xmark"></i>
                   Absent Heroes
                </h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                   {absentees.length > 0 ? absentees.map(s => (
                     <div key={s.id} className="p-3 bg-white/10 rounded-xl border border-white/10 flex items-center justify-between group hover:bg-white/20 transition-all">
                        <div className="flex items-center gap-3">
                           <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center font-black text-[10px] text-rose-600">
                              {s.rollNo}
                           </div>
                           <span className="font-bold text-[11px] truncate max-w-[100px]">{s.name}</span>
                        </div>
                        <a href={`tel:${s.phone}`} className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center hover:bg-emerald-500 transition-colors">
                           <i className="fa-solid fa-phone text-[9px]"></i>
                        </a>
                     </div>
                   )) : (
                     <div className="text-center py-6 opacity-40">
                        <p className="font-black text-[10px] uppercase tracking-widest">Everyone Present!</p>
                     </div>
                   )}
                </div>
              </div>
              <div className="absolute top-[-10%] right-[-10%] w-24 h-24 bg-white/5 rounded-full"></div>
           </div>

           <div className="bg-white p-6 rounded-[2.5rem] border border-indigo-50 shadow-sm">
              <h3 className="font-black text-[10px] uppercase tracking-widest text-indigo-900 mb-4 flex items-center gap-2">
                 <i className="fa-solid fa-lightbulb text-amber-500"></i>
                 Quick Tips
              </h3>
              <ul className="space-y-3">
                 <li className="flex gap-2 text-[10px] font-medium text-gray-500 leading-tight">
                    <span className="w-4 h-4 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-[8px] shrink-0 font-black">1</span>
                    Use the 'Quick Roll Entry' to mark presence instantly.
                 </li>
                 <li className="flex gap-2 text-[10px] font-medium text-gray-500 leading-tight">
                    <span className="w-4 h-4 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-[8px] shrink-0 font-black">2</span>
                    Press 'Enter' after typing roll no. for high-speed marking.
                 </li>
              </ul>
           </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default Attendance;
