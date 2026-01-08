
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
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-8 rounded-[3rem] shadow-xl border border-indigo-50">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center text-3xl shadow-lg shadow-indigo-100">
             <i className="fa-solid fa-clipboard-user"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-indigo-950 tracking-tight">Class Register</h1>
            <p className="text-indigo-500 font-bold italic flex items-center gap-2">
               <i className="fa-solid fa-book-open"></i>
               Class {selectedGrade} • Roll Number Wise Registry
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
             <input 
               type="date" 
               className="bg-transparent px-4 py-2 outline-none font-black text-sm text-gray-700" 
               value={selectedDate} 
               onChange={e => setSelectedDate(e.target.value)}
             />
          </div>
          
          <select 
            className="bg-indigo-50 px-6 py-3.5 rounded-2xl outline-none font-black text-sm text-indigo-700 border-2 border-transparent focus:border-indigo-300"
            value={selectedGrade}
            onChange={e => setSelectedGrade(e.target.value)}
          >
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n.toString()}>Class {n}</option>)}
          </select>

          {(user.role === UserRole.ADMIN || user.role === UserRole.TEACHER) && (
            <button 
              onClick={markAllPresent}
              className="px-6 py-3.5 bg-emerald-500 text-white text-xs font-black rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2"
            >
              <i className="fa-solid fa-check-double"></i>
              Quick Present All
            </button>
          )}
        </div>
      </header>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-indigo-50 flex items-center gap-4 group">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
               <i className="fa-solid fa-users"></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Students</p>
              <p className="text-2xl font-black text-indigo-950">{stats.total}</p>
            </div>
         </div>
         <div className="bg-emerald-50 p-6 rounded-[2.5rem] border border-emerald-100 flex items-center gap-4 group">
            <div className="w-12 h-12 bg-white text-emerald-500 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
               <i className="fa-solid fa-user-check"></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Present</p>
              <p className="text-2xl font-black text-emerald-700">{stats.present}</p>
            </div>
         </div>
         <div className="bg-rose-50 p-6 rounded-[2.5rem] border border-rose-100 flex items-center gap-4 group">
            <div className="w-12 h-12 bg-white text-rose-500 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
               <i className="fa-solid fa-user-xmark"></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Absent</p>
              <p className="text-2xl font-black text-rose-700">{stats.absent}</p>
            </div>
         </div>
         <div className="bg-amber-50 p-6 rounded-[2.5rem] border border-amber-100 flex items-center gap-4 group">
            <div className="w-12 h-12 bg-white text-amber-500 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
               <i className="fa-solid fa-user-clock"></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Late Arrival</p>
              <p className="text-2xl font-black text-amber-700">{stats.late}</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-[3rem] shadow-xl border border-indigo-50 overflow-hidden">
            <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
               <div className="relative">
                 <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                 <input 
                   type="text" 
                   placeholder="Find Roll Number..." 
                   className="pl-11 pr-6 py-2 bg-white border border-gray-200 rounded-xl outline-none text-xs font-bold w-48 focus:border-indigo-400 transition-all"
                   value={searchRoll}
                   onChange={e => setSearchRoll(e.target.value)}
                 />
               </div>
               <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Registry Ledger</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-indigo-50/30">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-indigo-400 uppercase tracking-widest text-center w-24">Roll #</th>
                    <th className="px-8 py-5 text-[10px] font-black text-indigo-400 uppercase tracking-widest">Student Name</th>
                    <th className="px-8 py-5 text-[10px] font-black text-indigo-400 uppercase tracking-widest text-center">Mark Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-50">
                  {searchedStudents.length > 0 ? searchedStudents.map(s => {
                    const status = getStatus(s.id);
                    return (
                      <tr key={s.id} className="hover:bg-indigo-50/10 transition-colors group">
                        <td className="px-8 py-5">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all ${
                            status === 'PRESENT' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' :
                            status === 'ABSENT' ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' :
                            status === 'LATE' ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' :
                            'bg-gray-100 text-indigo-300'
                          }`}>
                            {s.rollNo}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                             <div className="w-11 h-11 rounded-xl bg-indigo-50 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-indigo-300 font-black">
                                {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : s.name.charAt(0)}
                             </div>
                             <div>
                                <p className="font-black text-gray-800 leading-none mb-1">{s.name}</p>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{s.admissionNo}</p>
                             </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                           <div className="flex justify-center">
                             <button 
                               disabled={user.role !== UserRole.ADMIN && user.role !== UserRole.TEACHER}
                               onClick={() => toggleStatus(s.id)}
                               className={`min-w-[150px] py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all transform active:scale-95 flex items-center justify-center gap-3 ${
                                 status === 'PRESENT' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 
                                 status === 'ABSENT' ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' : 
                                 status === 'LATE' ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' : 
                                 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                               }`}
                             >
                               {status === 'PRESENT' && <i className="fa-solid fa-circle-check text-sm"></i>}
                               {status === 'ABSENT' && <i className="fa-solid fa-circle-xmark text-sm"></i>}
                               {status === 'LATE' && <i className="fa-solid fa-clock text-sm"></i>}
                               {status === 'NOT_MARKED' ? 'Mark Now' : status.replace('_', ' ')}
                             </button>
                           </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={3} className="px-8 py-32 text-center">
                         <div className="opacity-20 flex flex-col items-center">
                            <i className="fa-solid fa-graduation-cap text-8xl mb-6"></i>
                            <p className="font-black text-2xl text-indigo-900">No students found in Class {selectedGrade}!</p>
                            <p className="font-bold text-indigo-400 mt-2">Add students to this class in the Hero Entry tab.</p>
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
           <div className="bg-rose-900 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                   <i className="fa-solid fa-skull-crossbones text-rose-400"></i>
                   Absent Heroes
                </h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                   {absentees.length > 0 ? absentees.map(s => (
                     <div key={s.id} className="p-4 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-between group hover:bg-white/20 transition-all">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center font-black text-xs text-white">
                              {s.rollNo}
                           </div>
                           <span className="font-bold text-sm">{s.name}</span>
                        </div>
                        <a href={`tel:${s.phone}`} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-emerald-500 transition-colors">
                           <i className="fa-solid fa-phone-flip text-[10px]"></i>
                        </a>
                     </div>
                   )) : (
                     <div className="text-center py-10 opacity-40">
                        <i className="fa-solid fa-face-laugh-beam text-5xl mb-4"></i>
                        <p className="font-black text-sm uppercase tracking-widest">Everyone is here!</p>
                     </div>
                   )}
                </div>
                {absentees.length > 0 && (
                   <p className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-rose-300 text-center animate-pulse">
                      Calling parents recommended
                   </p>
                )}
              </div>
              <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-white/5 rounded-full"></div>
           </div>

           <div className="bg-indigo-50 p-8 rounded-[3rem] border-2 border-dashed border-indigo-200">
              <h3 className="font-black text-indigo-900 mb-4 flex items-center gap-2">
                 <i className="fa-solid fa-lightbulb text-amber-500"></i>
                 Register Tips
              </h3>
              <ul className="space-y-3">
                 <li className="flex gap-3 text-xs font-medium text-indigo-700 leading-relaxed">
                    <span className="w-5 h-5 bg-indigo-200 rounded-full flex items-center justify-center text-[10px] shrink-0 font-black">1</span>
                    Switch classes using the top-right menu to manage multiple registers.
                 </li>
                 <li className="flex gap-3 text-xs font-medium text-indigo-700 leading-relaxed">
                    <span className="w-5 h-5 bg-indigo-200 rounded-full flex items-center justify-center text-[10px] shrink-0 font-black">2</span>
                    The Roll Number list is updated instantly as you mark attendance.
                 </li>
                 <li className="flex gap-3 text-xs font-medium text-indigo-700 leading-relaxed">
                    <span className="w-5 h-5 bg-indigo-200 rounded-full flex items-center justify-center text-[10px] shrink-0 font-black">3</span>
                    Offline data is saved automatically on your device.
                 </li>
              </ul>
           </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.2);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default Attendance;
