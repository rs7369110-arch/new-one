
import React, { useState, useMemo } from 'react';
import { Subject, TimetableEntry, TeacherAssignment } from '../types';

interface SchoolSetupProps {
  subjects: Subject[];
  onUpdateSubjects: (subjects: Subject[]) => void;
  timetable: TimetableEntry[];
  onUpdateTimetable: (timetable: TimetableEntry[]) => void;
  teachers: TeacherAssignment[];
  onLogActivity: (actionType: 'CREATE' | 'UPDATE' | 'DELETE', module: string, target: string, details?: string) => void;
}

const COLORS = [
  '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', 
  '#06b6d4', '#f97316', '#14b8a6', '#6366f1', '#a855f7', '#d946ef'
];

const ICONS = [
  'fa-book', 'fa-vial', 'fa-calculator', 'fa-globe', 'fa-microscope', 
  'fa-paint-brush', 'fa-music', 'fa-dumbbell', 'fa-laptop-code', 'fa-atom'
];

const SchoolSetup: React.FC<SchoolSetupProps> = ({ 
  subjects, onUpdateSubjects, timetable, onUpdateTimetable, teachers, onLogActivity 
}) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'SUBJECTS' | 'TIMETABLE'>('DASHBOARD');
  
  // Subject State
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectForm, setSubjectForm] = useState<Partial<Subject>>({ 
    name: '', code: '', type: 'THEORY', color: COLORS[0], icon: ICONS[0] 
  });

  // Timetable State
  const [selGrade, setSelGrade] = useState('1');
  const [selSection, setSelSection] = useState('A');
  const [isAddingTT, setIsAddingTT] = useState(false);
  const [ttForm, setTTForm] = useState<Partial<TimetableEntry>>({
    day: 'Monday', period: 1, subjectId: '', teacherId: '', startTime: '08:00', endTime: '08:45'
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

  // -- Stats Logic --
  const stats = useMemo(() => ({
    totalSubjects: subjects.length,
    scheduledPeriods: timetable.length,
    theoryCount: subjects.filter(s => s.type === 'THEORY').length,
    pracCount: subjects.filter(s => s.type === 'PRACTICAL').length,
    skillCount: subjects.filter(s => s.type === 'SKILL').length,
  }), [subjects, timetable]);

  // -- Subject Actions --
  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const newSub: Subject = {
      id: editingSubject?.id || `SUB-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      name: subjectForm.name || '',
      code: subjectForm.code || '',
      type: subjectForm.type || 'THEORY',
      color: subjectForm.color || COLORS[0],
      icon: subjectForm.icon || ICONS[0]
    };

    if (editingSubject) {
      onUpdateSubjects(subjects.map(s => s.id === editingSubject.id ? newSub : s));
      onLogActivity('UPDATE', 'School Setup', newSub.name, 'Refined academic discipline node');
    } else {
      onUpdateSubjects([...subjects, newSub]);
      onLogActivity('CREATE', 'School Setup', newSub.name, 'Registered new academic discipline');
    }
    setIsAddingSubject(false);
    setEditingSubject(null);
    setSubjectForm({ name: '', code: '', type: 'THEORY', color: COLORS[0], icon: ICONS[0] });
  };

  const deleteSubject = (id: string, name: string) => {
    if (window.confirm(`ARCHIVE CONFIRMATION: Permanently remove ${name} from academy registry? This may invalidate existing timetables.`)) {
      onUpdateSubjects(subjects.filter(s => s.id !== id));
      onLogActivity('DELETE', 'School Setup', name, 'Discipline formally archived');
    }
  };

  // -- Timetable Grid Logic --
  const currentTT = useMemo(() => {
    return timetable.filter(t => t.grade === selGrade && t.section === selSection);
  }, [timetable, selGrade, selSection]);

  const handleSaveTT = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: TimetableEntry = {
      id: Math.random().toString(36).substr(2, 9),
      grade: selGrade,
      section: selSection,
      day: ttForm.day || 'Monday',
      period: ttForm.period || 1,
      subjectId: ttForm.subjectId || '',
      teacherId: ttForm.teacherId || '',
      startTime: ttForm.startTime || '',
      endTime: ttForm.endTime || ''
    };

    // Replace if period exists on same day
    const filtered = timetable.filter(t => !(t.grade === selGrade && t.section === selSection && t.day === entry.day && t.period === entry.period));
    onUpdateTimetable([...filtered, entry]);
    setIsAddingTT(false);
  };

  const removeTTEntry = (id: string) => {
    if (window.confirm('Delete this period slot from registry?')) {
      onUpdateTimetable(timetable.filter(t => t.id !== id));
      onLogActivity('DELETE', 'School Setup', 'Timetable Entry', 'Removed period node from schedule');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      {/* ARCHITECT HEADER */}
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 bg-indigo-950 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-800/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="flex items-center gap-8 relative z-10">
           <div className="w-20 h-20 bg-white/10 rounded-[2.5rem] flex items-center justify-center text-4xl border border-white/10 shadow-xl backdrop-blur-md">
              <i className="fa-solid fa-compass-drafting text-teal-400"></i>
           </div>
           <div>
             <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Academy Architect</h1>
             <p className="text-[10px] font-black text-teal-400 uppercase tracking-[0.6em] mt-3 italic opacity-80">Infrastructure & Schedule Protocol v6.0</p>
           </div>
        </div>

        <nav className="flex bg-white/5 p-1.5 rounded-[2rem] border border-white/10 backdrop-blur-xl relative z-10">
           {['DASHBOARD', 'SUBJECTS', 'TIMETABLE'].map((tab) => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab as any)}
               className={`px-10 py-3.5 rounded-[1.6rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                 activeTab === tab ? 'bg-teal-600 text-white shadow-xl scale-105' : 'text-teal-300 hover:text-white hover:bg-white/5'
               }`}
             >
                {tab}
             </button>
           ))}
        </nav>
      </header>

      {activeTab === 'DASHBOARD' && (
        <div className="space-y-10">
           {/* CAPACITY BENTO GRID */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-teal-50 hover:border-teal-400 transition-all group">
                 <p className="text-[10px] font-black text-teal-300 uppercase tracking-widest mb-1">Academy Catalog</p>
                 <h4 className="text-4xl font-black text-teal-950">{stats.totalSubjects} Subjects</h4>
                 <div className="flex gap-2 mt-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[8px] font-black rounded-md">{stats.theoryCount} TH</span>
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black rounded-md">{stats.pracCount} PR</span>
                    <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[8px] font-black rounded-md">{stats.skillCount} SK</span>
                 </div>
              </div>
              <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-teal-50 hover:border-emerald-400 transition-all">
                 <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Scheduled Units</p>
                 <h4 className="text-4xl font-black text-teal-950">{stats.scheduledPeriods} Slots</h4>
                 <p className="text-[9px] font-bold text-gray-300 mt-2 italic">Active periods in weekly registry</p>
              </div>
              <div className="md:col-span-2 bg-teal-600 p-8 rounded-[3.5rem] shadow-2xl text-white relative overflow-hidden flex items-center justify-between">
                 <div className="relative z-10">
                    <h4 className="text-2xl font-black uppercase tracking-tighter mb-2">School Status: <span className="text-amber-300">OPTIMIZED</span></h4>
                    <p className="text-xs font-medium text-teal-100 italic opacity-80">"Academy infrastructure is synchronized across all cloud nodes."</p>
                 </div>
                 <i className="fa-solid fa-microchip text-7xl opacity-20 relative z-10 group-hover:rotate-12 transition-transform"></i>
                 <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-transparent"></div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 bg-white p-12 rounded-[4.5rem] shadow-2xl border border-teal-50 flex flex-col justify-center text-center">
                 <div className="w-24 h-24 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-8 shadow-inner ring-8 ring-white">
                    <i className="fa-solid fa-cubes"></i>
                 </div>
                 <h3 className="text-3xl font-black text-teal-950 uppercase tracking-tighter mb-4">Core Infrastructure Engine</h3>
                 <p className="text-gray-500 font-medium italic max-w-lg mx-auto leading-relaxed">
                   The Academy Architect module allows you to define the academic catalog and schedule logic. Use the Subjects tab to register disciplines and the Timetable tab to map teachers to time nodes.
                 </p>
              </div>
              <div className="lg:col-span-4 bg-amber-400 p-12 rounded-[4.5rem] shadow-2xl text-amber-950 flex flex-col items-center justify-center text-center">
                 <i className="fa-solid fa-lightbulb text-6xl mb-6"></i>
                 <h4 className="text-xl font-black uppercase tracking-tight mb-2">Pro Tip</h4>
                 <p className="text-sm font-bold leading-relaxed opacity-70">Assign unique colors to subjects to make your class timetables instantly recognizable and visually appealing.</p>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'SUBJECTS' && (
        <div className="space-y-10 animate-slide-up">
           <div className="bg-white p-10 rounded-[4rem] shadow-2xl border border-teal-50">
              <div className="flex justify-between items-center mb-12">
                 <div>
                    <h2 className="text-2xl font-black text-teal-950 uppercase tracking-tighter">Academic Disciplines</h2>
                    <p className="text-[9px] font-black text-teal-400 uppercase tracking-widest mt-1">Master Registry Catalog</p>
                 </div>
                 <button 
                   onClick={() => setIsAddingSubject(true)}
                   className="btn-3d-emerald px-8 py-4 bg-teal-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl border-teal-900 flex items-center gap-3 active:scale-95"
                 >
                   <i className="fa-solid fa-plus-circle"></i> Register Subject
                 </button>
              </div>

              {isAddingSubject && (
                <form onSubmit={handleSaveSubject} className="mb-12 p-10 bg-gray-50 rounded-[3.5rem] border-4 border-white shadow-2xl animate-scale-in relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                   <button type="button" onClick={() => { setIsAddingSubject(false); setEditingSubject(null); }} className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center text-rose-500 shadow-sm hover:bg-rose-500 hover:text-white transition-all"><i className="fa-solid fa-xmark"></i></button>
                   
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-teal-400 uppercase tracking-widest ml-2">Display Name</label>
                      <input required className="w-full px-6 py-4 rounded-2xl bg-white border-none outline-none font-black text-teal-900 shadow-inner" placeholder="e.g. Physics" value={subjectForm.name} onChange={e => setSubjectForm({...subjectForm, name: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-teal-400 uppercase tracking-widest ml-2">Registry Code</label>
                      <input className="w-full px-6 py-4 rounded-2xl bg-white border-none outline-none font-black text-teal-900 shadow-inner" placeholder="e.g. PHY01" value={subjectForm.code} onChange={e => setSubjectForm({...subjectForm, code: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-teal-400 uppercase tracking-widest ml-2">Pillar Type</label>
                      <select className="w-full px-6 py-4 rounded-2xl bg-white border-none outline-none font-black text-teal-900 shadow-inner appearance-none" value={subjectForm.type} onChange={e => setSubjectForm({...subjectForm, type: e.target.value as any})}>
                         <option value="THEORY">Theory</option>
                         <option value="PRACTICAL">Practical</option>
                         <option value="SKILL">Skill Based</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-teal-400 uppercase tracking-widest ml-2">Visual Color</label>
                      <div className="flex flex-wrap gap-2 p-3 bg-white rounded-2xl shadow-inner h-[60px] overflow-y-auto">
                        {COLORS.map(c => (
                          <button key={c} type="button" onClick={() => setSubjectForm({...subjectForm, color: c})} className={`w-6 h-6 rounded-full transition-all ${subjectForm.color === c ? 'ring-4 ring-teal-200 scale-110' : 'opacity-40'}`} style={{backgroundColor: c}}></button>
                        ))}
                      </div>
                   </div>
                   
                   <div className="lg:col-span-4 space-y-2">
                      <label className="text-[10px] font-black text-teal-400 uppercase tracking-widest ml-2">Module Icon</label>
                      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-[2rem] shadow-inner">
                        {ICONS.map(i => (
                          <button key={i} type="button" onClick={() => setSubjectForm({...subjectForm, icon: i})} className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${subjectForm.icon === i ? 'bg-teal-600 text-white shadow-lg' : 'bg-gray-50 text-gray-300'}`}>
                             <i className={`fa-solid ${i}`}></i>
                          </button>
                        ))}
                      </div>
                   </div>

                   <button type="submit" className="lg:col-span-4 py-5 bg-teal-900 text-white rounded-[1.8rem] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-black transition-all transform active:scale-95">Authenticate Registry Entry</button>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                 {subjects.map(s => (
                   <div key={s.id} className="p-8 rounded-[3rem] bg-gray-50 border-2 border-transparent hover:border-teal-100 hover:bg-white transition-all group relative overflow-hidden flex flex-col h-[280px]">
                      <div className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 opacity-10 group-hover:scale-150 transition-transform" style={{backgroundColor: s.color}}></div>
                      <div className="flex justify-between items-start mb-6">
                         <div className="w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center text-2xl text-white group-hover:rotate-12 transition-transform" style={{backgroundColor: s.color}}>
                            <i className={`fa-solid ${s.icon || 'fa-book'}`}></i>
                         </div>
                         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingSubject(s); setSubjectForm(s); setIsAddingSubject(true); }} className="w-8 h-8 rounded-lg bg-teal-50 text-teal-500 hover:bg-teal-500 hover:text-white transition-all"><i className="fa-solid fa-pen-nib text-[10px]"></i></button>
                            <button onClick={() => deleteSubject(s.id, s.name)} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"><i className="fa-solid fa-trash-can text-[10px]"></i></button>
                         </div>
                      </div>
                      <h4 className="text-xl font-black text-teal-950 uppercase mb-2 leading-tight flex-1">{s.name}</h4>
                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.code}</span>
                        <span className="px-3 py-1 rounded-lg bg-white border border-gray-100 text-[8px] font-black uppercase text-teal-400 shadow-sm">{s.type}</span>
                      </div>
                   </div>
                 ))}
                 {subjects.length === 0 && (
                   <div className="col-span-full py-32 text-center bg-gray-50 rounded-[4rem] border-4 border-dashed border-white">
                      <i className="fa-solid fa-book-medical text-6xl text-teal-100 mb-6"></i>
                      <p className="text-2xl font-black text-teal-900 uppercase tracking-tighter opacity-30">Academic Catalog is Empty</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'TIMETABLE' && (
        <div className="space-y-8 animate-slide-up">
           <div className="bg-white p-8 rounded-[4rem] shadow-xl border border-teal-50 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex items-center gap-8">
                 <div className="w-16 h-16 bg-teal-600 text-white rounded-[2rem] flex items-center justify-center text-3xl shadow-xl">
                    <i className="fa-solid fa-clock"></i>
                 </div>
                 <div className="flex gap-4">
                    <div className="space-y-1">
                       <label className="text-[8px] font-black uppercase text-teal-300 ml-1">Target Grade</label>
                       <select className="bg-teal-50/50 px-6 py-3 rounded-2xl font-black text-sm text-teal-950 outline-none border-none shadow-inner" value={selGrade} onChange={e => setSelGrade(e.target.value)}>
                          {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n.toString()}>Grade {n}</option>)}
                       </select>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[8px] font-black uppercase text-teal-300 ml-1">Section</label>
                       <select className="bg-teal-50/50 px-6 py-3 rounded-2xl font-black text-sm text-teal-950 outline-none border-none shadow-inner" value={selSection} onChange={e => setSelSection(e.target.value)}>
                          {['A','B','C','D'].map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                    </div>
                 </div>
              </div>
              <button 
                onClick={() => setIsAddingTT(true)}
                className="btn-3d-emerald px-10 py-5 bg-teal-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl border-teal-900 flex items-center gap-3"
              >
                 <i className="fa-solid fa-calendar-plus text-xl text-amber-300"></i> Assign Period Slot
              </button>
           </div>

           {isAddingTT && (
             <form onSubmit={handleSaveTT} className="p-12 bg-white rounded-[4.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-4 border-teal-50 animate-scale-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-teal-50 rounded-full -mr-24 -mt-24"></div>
                <button type="button" onClick={() => setIsAddingTT(false)} className="absolute top-6 right-6 text-gray-300 hover:text-rose-500 transition-colors"><i className="fa-solid fa-circle-xmark text-3xl"></i></button>
                
                <h3 className="lg:col-span-3 text-2xl font-black text-teal-900 uppercase tracking-tighter mb-4 flex items-center gap-3">
                   <i className="fa-solid fa-stopwatch text-teal-400"></i> Scheduling Registry Node
                </h3>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-teal-400 uppercase tracking-widest ml-2">Active Day</label>
                   <select required className="w-full px-8 py-5 rounded-[2rem] bg-teal-50/50 border-none outline-none font-black text-teal-900 shadow-inner appearance-none" value={ttForm.day} onChange={e => setTTForm({...ttForm, day: e.target.value as any})}>
                      {days.map(d => <option key={d} value={d}>{d}</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-teal-400 uppercase tracking-widest ml-2">Period Seq #</label>
                   <input required type="number" min="1" max="12" className="w-full px-8 py-5 rounded-[2rem] bg-teal-50/50 border-none outline-none font-black text-teal-900 shadow-inner" value={ttForm.period} onChange={e => setTTForm({...ttForm, period: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-teal-400 uppercase tracking-widest ml-2">Discipline (Subject)</label>
                   <select required className="w-full px-8 py-5 rounded-[2rem] bg-teal-50/50 border-none outline-none font-black text-teal-900 shadow-inner appearance-none" value={ttForm.subjectId} onChange={e => setTTForm({...ttForm, subjectId: e.target.value})}>
                      <option value="">Choose Subject...</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-teal-400 uppercase tracking-widest ml-2">Faculty Assigned</label>
                   <select required className="w-full px-8 py-5 rounded-[2rem] bg-teal-50/50 border-none outline-none font-black text-teal-900 shadow-inner appearance-none" value={ttForm.teacherId} onChange={e => setTTForm({...ttForm, teacherId: e.target.value})}>
                      <option value="">Choose Teacher...</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.teacherName} ({t.employeeId})</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-teal-400 uppercase tracking-widest ml-1">Session Timing</label>
                   <div className="flex gap-2">
                      <input required type="time" className="flex-1 px-4 py-5 rounded-2xl bg-teal-50/50 font-black text-teal-900 border-none outline-none" value={ttForm.startTime} onChange={e => setTTForm({...ttForm, startTime: e.target.value})} />
                      <input required type="time" className="flex-1 px-4 py-5 rounded-2xl bg-teal-50/50 font-black text-teal-900 border-none outline-none" value={ttForm.endTime} onChange={e => setTTForm({...ttForm, endTime: e.target.value})} />
                   </div>
                </div>

                <button type="submit" className="btn-3d-emerald lg:col-span-3 py-6 bg-teal-600 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl border-teal-900 hover:bg-black transition-all">Lock Schedule Node</button>
             </form>
           )}

           <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
              {days.map(day => {
                const dayEntries = currentTT.filter(t => t.day === day).sort((a,b) => a.period - b.period);
                return (
                  <div key={day} className="bg-white rounded-[3rem] shadow-xl border border-teal-50 flex flex-col h-full overflow-hidden transition-all hover:shadow-teal-900/5">
                     <div className="bg-teal-900 text-white py-6 text-center font-black text-[10px] uppercase tracking-[0.4em] shrink-0">
                        {day}
                     </div>
                     <div className="flex-1 p-5 space-y-5 custom-scrollbar overflow-y-auto">
                        {dayEntries.length > 0 ? dayEntries.map(e => {
                          const sub = subjects.find(s => s.id === e.subjectId);
                          const teach = teachers.find(t => t.id === e.teacherId);
                          return (
                            <div key={e.id} className="p-6 rounded-[2rem] border-2 border-transparent transition-all group relative flex flex-col" style={{ backgroundColor: sub?.color + '10', borderColor: sub?.color + '20' }}>
                               <div className="flex items-center justify-between mb-4">
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-lg" style={{backgroundColor: sub?.color}}>
                                     <i className={`fa-solid ${sub?.icon || 'fa-book'} text-[10px]`}></i>
                                  </div>
                                  <button onClick={() => removeTTEntry(e.id)} className="w-7 h-7 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white transition-all"><i className="fa-solid fa-trash-can text-[10px]"></i></button>
                               </div>
                               <p className="text-[8px] font-black uppercase tracking-widest mb-1 opacity-60" style={{color: sub?.color}}>P-{e.period} • {e.startTime}-{e.endTime}</p>
                               <h5 className="font-black text-teal-950 text-xs uppercase leading-tight mb-3">{sub?.name || 'Unknown'}</h5>
                               
                               <div className="mt-auto flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center font-black text-[8px] text-teal-400 border border-gray-100 shadow-sm uppercase">{teach?.teacherName.charAt(0)}</div>
                                  <p className="text-[9px] font-bold text-gray-400 truncate">{teach?.teacherName || 'NOT ASSIGNED'}</p>
                               </div>
                            </div>
                          );
                        }) : (
                          <div className="h-64 flex flex-col items-center justify-center opacity-20 text-center px-4">
                             <i className="fa-solid fa-calendar-xmark text-4xl mb-4"></i>
                             <p className="text-[10px] font-black uppercase tracking-widest">No Registry Found</p>
                          </div>
                        )}
                     </div>
                  </div>
                );
              })}
           </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-in { animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(20, 184, 166, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default SchoolSetup;
