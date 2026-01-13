import React, { useState, useEffect } from 'react';
import { User, UserRole, Student, MarksRecord, TeacherAssignment } from '../types';

interface ExamEntryProps {
  user: User;
  students: Student[];
  marks: MarksRecord[];
  onUpdateMarks: (marks: MarksRecord[]) => void;
  availableSubjects: string[];
  teachers: TeacherAssignment[];
}

const ExamEntry: React.FC<ExamEntryProps> = ({ user, students, marks, onUpdateMarks, availableSubjects, teachers }) => {
  const [selectedGrade, setSelectedGrade] = useState('1');
  const [selectedTerm, setSelectedTerm] = useState('Quarterly Exam');
  
  // Local state for bulk editing the entire class grid
  // Structure: { [studentId]: { [subject]: { theory: 0, practical: 0 } } }
  const [gridData, setGridData] = useState<{ [studentId: string]: { [subject: string]: { theory: number; practical: number } } }>({});

  const filteredStudents = students
    .filter(s => s.grade === selectedGrade)
    .sort((a, b) => (parseInt(a.rollNo) || 0) - (parseInt(b.rollNo) || 0));

  // Sync initial data from parent marks state into local grid
  useEffect(() => {
    const newGrid: typeof gridData = {};
    filteredStudents.forEach(student => {
      const record = marks.find(m => m.studentId === student.id && m.term === selectedTerm);
      newGrid[student.id] = {};
      availableSubjects.forEach(subject => {
        if (record && record.subjects[subject]) {
          newGrid[student.id][subject] = {
            theory: record.subjects[subject].theory || 0,
            practical: record.subjects[subject].practical || 0
          };
        } else {
          newGrid[student.id][subject] = { theory: 0, practical: 0 };
        }
      });
    });
    setGridData(newGrid);
  }, [selectedGrade, selectedTerm, marks, availableSubjects]);

  const handleMarkChange = (studentId: string, subject: string, field: 'theory' | 'practical', value: string) => {
    const numValue = parseInt(value) || 0;
    setGridData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subject]: {
          ...prev[studentId][subject],
          [field]: numValue
        }
      }
    }));
  };

  const handleSaveAll = () => {
    const updatedMarks = [...marks];
    
    // Explicitly iterate over grid data entries and cast values to resolve type errors.
    Object.entries(gridData).forEach(([studentId, subjects]) => {
      const existingIdx = updatedMarks.findIndex(m => m.studentId === studentId && m.term === selectedTerm);
      
      const formattedSubjects: any = {};
      Object.entries(subjects).forEach(([subName, scores]) => {
        // Cast scores to specific structure to ensure property access on theory and practical works correctly.
        const s = scores as { theory: number; practical: number };
        formattedSubjects[subName] = {
          ...s,
          total: (s.theory || 0) + (s.practical || 0),
          isLocked: false // Can be locked by Admin separately
        };
      });

      if (existingIdx > -1) {
        updatedMarks[existingIdx] = {
          ...updatedMarks[existingIdx],
          subjects: formattedSubjects,
          date: new Date().toLocaleDateString()
        };
      } else {
        updatedMarks.push({
          id: Math.random().toString(36).substr(2, 9),
          studentId,
          term: selectedTerm,
          remarks: 'Bulk Grid Entry',
          subjects: formattedSubjects,
          date: new Date().toLocaleDateString()
        });
      }
    });

    onUpdateMarks(updatedMarks);
    alert("✅ Success! All marks for Class " + selectedGrade + " have been saved.");
  };

  const calculateStudentStats = (studentId: string) => {
    const studentSubjects = gridData[studentId] || {};
    let totalObtained = 0;
    // Iterate over subject scores and cast to a concrete type to safely access numeric fields.
    Object.values(studentSubjects).forEach(scores => {
      const s = scores as { theory: number; practical: number };
      totalObtained += (s.theory + s.practical);
    });
    const maxMarks = availableSubjects.length * 100;
    const percentage = maxMarks > 0 ? (totalObtained / maxMarks) * 100 : 0;
    return { totalObtained, percentage };
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-indigo-950 tracking-tight flex items-center gap-3">
             <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-2">
                <i className="fa-solid fa-table-list"></i>
             </div>
             Master Class Marks Grid
          </h1>
          <p className="text-gray-500 font-medium italic mt-1 ml-1">View all students and subjects in a single spreadsheet. 📊</p>
        </div>

        <div className="flex items-center gap-4">
           <button 
             onClick={handleSaveAll}
             className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
           >
              <i className="fa-solid fa-cloud-arrow-up"></i>
              Save Class Record
           </button>
        </div>
      </header>

      {/* Control Panel */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-indigo-50 flex flex-wrap items-center gap-8">
         <div className="flex flex-col gap-1 px-4">
             <label className="text-[9px] font-black uppercase text-indigo-300 tracking-widest">Select Class</label>
             <select 
                className="bg-transparent font-black text-sm uppercase text-indigo-900 outline-none cursor-pointer"
                value={selectedGrade}
                onChange={e => setSelectedGrade(e.target.value)}
              >
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n.toString()}>Class {n}</option>)}
              </select>
          </div>
          <div className="w-px h-10 bg-indigo-100"></div>
          <div className="flex flex-col gap-1 px-4">
             <label className="text-[9px] font-black uppercase text-indigo-300 tracking-widest">Select Term</label>
             <select 
                className="bg-transparent font-black text-sm uppercase text-indigo-900 outline-none cursor-pointer"
                value={selectedTerm}
                onChange={e => setSelectedTerm(e.target.value)}
              >
                <option>Quarterly Exam</option>
                <option>Mid Term</option>
                <option>Final Exam</option>
              </select>
          </div>
          <div className="flex-1 text-right px-6">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Auto-Calculation Active</p>
             <div className="flex items-center justify-end gap-2 text-emerald-500">
                <i className="fa-solid fa-circle-check text-[10px]"></i>
                <span className="text-xs font-bold">Ready for bulk entry</span>
             </div>
          </div>
      </div>

      {/* The Master Grid */}
      <div className="bg-white rounded-[3rem] shadow-2xl border border-indigo-50 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              {/* Main Headers */}
              <tr className="bg-indigo-950 text-white">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center sticky left-0 z-30 bg-indigo-950 border-r border-indigo-900 w-20">Roll</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-left sticky left-20 z-30 bg-indigo-950 border-r border-indigo-900 min-w-[200px]">Student Name</th>
                {availableSubjects.map(sub => (
                  <th key={sub} colSpan={2} className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-center border-r border-indigo-900">
                    {sub}
                  </th>
                ))}
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center bg-indigo-900">Total</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center bg-indigo-900">%</th>
              </tr>
              {/* Sub Headers (Theory/Practical) */}
              <tr className="bg-indigo-900 text-indigo-200">
                <th className="sticky left-0 z-30 bg-indigo-900 border-r border-indigo-800"></th>
                <th className="sticky left-20 z-30 bg-indigo-900 border-r border-indigo-800"></th>
                {availableSubjects.map(sub => (
                  <React.Fragment key={`${sub}-sub`}>
                    <th className="px-2 py-2 text-[8px] font-black uppercase border-r border-indigo-800">Th (70)</th>
                    <th className="px-2 py-2 text-[8px] font-black uppercase border-r border-indigo-800">Pr (30)</th>
                  </React.Fragment>
                ))}
                <th className="bg-indigo-800"></th>
                <th className="bg-indigo-800"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-50">
              {filteredStudents.map(student => {
                const { totalObtained, percentage } = calculateStudentStats(student.id);
                return (
                  <tr key={student.id} className="hover:bg-indigo-50/10 transition-colors group">
                    <td className="px-6 py-4 text-center font-black text-indigo-600 sticky left-0 z-20 bg-white group-hover:bg-indigo-50 border-r border-indigo-50">
                      {student.rollNo}
                    </td>
                    <td className="px-6 py-4 font-black text-gray-800 text-sm sticky left-20 z-20 bg-white group-hover:bg-indigo-50 border-r border-indigo-50">
                      {student.name}
                    </td>
                    {availableSubjects.map(sub => {
                      const marks = gridData[student.id]?.[sub] || { theory: 0, practical: 0 };
                      return (
                        <React.Fragment key={`${student.id}-${sub}`}>
                          <td className="p-1 border-r border-indigo-50">
                            <input 
                              type="number"
                              max={70}
                              className={`w-full bg-gray-50 border-2 rounded-lg py-2 text-center font-black outline-none transition-all text-xs ${marks.theory > 70 ? 'border-rose-400 text-rose-600 animate-pulse' : 'border-transparent focus:bg-white focus:border-indigo-400'}`}
                              value={marks.theory}
                              onChange={e => handleMarkChange(student.id, sub, 'theory', e.target.value)}
                              onFocus={e => e.target.select()}
                            />
                          </td>
                          <td className="p-1 border-r border-indigo-50">
                            <input 
                              type="number"
                              max={30}
                              className={`w-full bg-gray-50 border-2 rounded-lg py-2 text-center font-black outline-none transition-all text-xs ${marks.practical > 30 ? 'border-rose-400 text-rose-600 animate-pulse' : 'border-transparent focus:bg-white focus:border-indigo-400'}`}
                              value={marks.practical}
                              onChange={e => handleMarkChange(student.id, sub, 'practical', e.target.value)}
                              onFocus={e => e.target.select()}
                            />
                          </td>
                        </React.Fragment>
                      );
                    })}
                    <td className="px-4 py-4 text-center font-black text-indigo-900 bg-gray-50/50">{totalObtained}</td>
                    <td className="px-4 py-4 text-center">
                       <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${percentage >= 40 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {percentage.toFixed(0)}%
                       </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredStudents.length === 0 && (
          <div className="p-20 text-center">
             <i className="fa-solid fa-users-slash text-5xl text-gray-200 mb-4"></i>
             <p className="text-xl font-black text-indigo-900">No students registered in Class {selectedGrade}</p>
             <p className="text-gray-400 font-medium">Add students to the directory first to populate the grid.</p>
          </div>
        )}
      </div>

      <div className="bg-indigo-50 p-8 rounded-[3rem] border-2 border-dashed border-indigo-200 flex flex-col md:flex-row items-center gap-8">
         <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-400 text-2xl shadow-sm">
            <i className="fa-solid fa-keyboard"></i>
         </div>
         <div className="flex-1 text-center md:text-left">
            <h4 className="font-black text-indigo-900 mb-1">Grid Mastery Tips</h4>
            <p className="text-xs text-indigo-500 font-bold leading-relaxed italic">
               "This spreadsheet grid is optimized for keyboard input. Use **TAB** to move horizontally through subjects and **ENTER** to move down students. Scores automatically update the total and percentage columns on every keystroke."
            </p>
         </div>
         <div className="flex gap-4">
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 bg-gray-100 border border-indigo-100 rounded"></div>
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Normal</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 bg-rose-100 border border-rose-300 rounded"></div>
               <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Warning (Out of bounds)</span>
            </div>
         </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        input[type=number] { -moz-appearance: textfield; }

        /* Sticky header fix for scroll */
        th.sticky, td.sticky {
          box-shadow: 2px 0 5px rgba(0,0,0,0.02);
        }
      `}</style>
    </div>
  );
};

export default ExamEntry;