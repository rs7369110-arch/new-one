
import React, { useMemo, useState, useRef } from 'react';
import { User, Student, Notice, Homework, AttendanceRecord, TeacherAssignment, Language, UserRole, SchoolBranding, DEFAULT_BRANDING, FoodItem } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Logo from './Logo';

interface DashboardProps {
  user: User;
  students: Student[];
  notices: Notice[];
  onUpdateNotices?: (n: Notice[]) => void;
  homeworks: Homework[];
  onUpdateHomework?: (h: Homework[]) => void;
  attendance: AttendanceRecord[];
  teachers: TeacherAssignment[];
  onUpdateTeachers: (teachers: TeacherAssignment[]) => void;
  isDarkMode: boolean;
  lang: Language;
  branding: SchoolBranding;
  onUpdateBranding: (brand: SchoolBranding) => void;
  setActiveTab?: (tab: string) => void;
  foodChart?: FoodItem[];
}

const translations = {
  [Language.EN]: {
    commandCenter: "Command Center",
    parentPortal: "Parent Portal",
    sysOp: "System Operator",
    registrySync: "Registry Sync",
    students: "Students",
    presentToday: "Present Today",
    liveNotices: "Live Notices",
    collection: "Collection",
    financeStream: "Finance Stream",
    childProgress: "Child Progress",
    alertFeed: "Alert Feed",
    paid: "PAID",
    due: "DUE",
    attendance: "ATTENDANCE",
    analyticsLive: "Analytics Live",
    registryClean: "Registry Clean",
    myChild: "My Child",
    accessControl: "Access Tower",
    todaysMenu: "Today's Menu"
  },
  [Language.GU]: {
    commandCenter: "કમાન્ડ સેન્ટર",
    parentPortal: "પેરેન્ટ પોર્ટલ",
    sysOp: "સિસ્ટમ ઓપરેટર",
    registrySync: "રજિસ્ટ્રી સિંક",
    students: "વિદ્યાર્થીઓ",
    presentToday: "આજની હાજરી",
    liveNotices: "લાઇવ સૂચનાઓ",
    collection: "ફી વસૂલાત",
    financeStream: "નાણાકીય પ્રવાહ",
    childProgress: "બાળકની પ્રગતિ",
    alertFeed: "એલર્ટ ફીડ",
    paid: "ભરેલ",
    due: "બાકી",
    attendance: "હાજરી",
    analyticsLive: "લાઇવ વિશ્લેષણ",
    registryClean: "રજિસ્ટ્રી ખાલી છે",
    myChild: "મારું બાળક",
    accessControl: "એક્સેસ ટાવર",
    todaysMenu: "આજનું મેનૂ"
  }
};

const Dashboard: React.FC<DashboardProps> = ({ 
  user, students, notices, onUpdateNotices, homeworks, onUpdateHomework, attendance, teachers, onUpdateTeachers, isDarkMode, lang, branding, onUpdateBranding, setActiveTab, foodChart = []
}) => {
  const t = translations[lang];
  const isParent = user.role === UserRole.PARENT;
  const isStaff = user.role === UserRole.ADMIN || user.role === UserRole.TEACHER;
  const isAdmin = user.role === UserRole.ADMIN;
  
  const [isBrandingOpen, setIsBrandingOpen] = useState(false);
  const [editNotice, setEditNotice] = useState<Notice | null>(null);
  const safeBranding = branding || DEFAULT_BRANDING;
  const [brandForm, setBrandForm] = useState<SchoolBranding>(safeBranding);
  const brandLogoRef = useRef<HTMLInputElement>(null);

  const todaysMenu = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[new Date().getDay()];
    return foodChart.find(f => f.day === currentDay);
  }, [foodChart]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBrandForm({ ...brandForm, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBranding(brandForm);
    setIsBrandingOpen(false);
  };

  const handleDeleteNotice = (id: string, title: string) => {
    if (!onUpdateNotices) return;
    const confirmed = window.confirm(`CONFIRM DELETE: Are you sure you want to permanently remove the notice "${title}" from the Home Feed?`);
    if (confirmed) {
      onUpdateNotices(notices.filter(n => n.id !== id));
    }
  };

  const handleSaveEditedNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNotice || !onUpdateNotices) return;
    const confirmed = window.confirm(`CONFIRM UPDATE: Save the modifications made to "${editNotice.title}"?`);
    if (confirmed) {
      onUpdateNotices(notices.map(n => n.id === editNotice.id ? editNotice : n));
      setEditNotice(null);
    }
  };

  const myChild = useMemo(() => {
    return isParent ? students.find(s => s.id === user.studentId) : null;
  }, [isParent, students, user.studentId]);

  const stats = useMemo(() => {
    if (isParent && myChild) {
      const childAttendance = attendance.filter(a => a.studentId === myChild.id);
      const presentCount = childAttendance.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
      const attRatio = childAttendance.length > 0 ? (presentCount / childAttendance.length) * 100 : 0;
      const feeRatio = myChild.totalFees > 0 ? (myChild.paidFees / myChild.totalFees) * 100 : 0;

      return [
        { id: 'attendance', label: t.attendance, value: `${attRatio.toFixed(0)}%`, icon: 'fa-user-check', color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
        { id: 'fees', label: t.collection, value: `${feeRatio.toFixed(0)}%`, icon: 'fa-vault', color: 'text-purple-500', bg: 'bg-purple-500/5' },
        { id: 'homework', label: 'Homework', value: homeworks.filter(h => h.grade === myChild.grade).length, icon: 'fa-scroll', color: 'text-blue-500', bg: 'bg-blue-500/5' },
        { id: 'notices', label: 'Notices', value: notices.filter(n => n.targetGrades.includes('All') || n.targetGrades.includes(myChild.grade)).length, icon: 'fa-tower-broadcast', color: 'text-amber-500', bg: 'bg-amber-500/5' },
      ];
    }

    const totalExpected = students.reduce((acc, s) => acc + s.totalFees, 0);
    const totalPaid = students.reduce((acc, s) => acc + s.paidFees, 0);
    return [
      { id: 'students', label: t.students, value: students.length, icon: 'fa-user-graduate', color: 'text-blue-500', bg: 'bg-blue-500/5' },
      { id: 'attendance', label: t.presentToday, value: attendance.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'PRESENT').length, icon: 'fa-user-check', color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
      { id: 'notices', label: t.liveNotices, value: notices.length, icon: 'fa-tower-broadcast', color: 'text-amber-500', bg: 'bg-amber-500/5' },
      { id: 'fees', label: t.collection, value: `${Math.round((totalPaid / (totalExpected || 1)) * 100)}%`, icon: 'fa-vault', color: 'text-purple-500', bg: 'bg-purple-500/5' },
    ];
  }, [isParent, myChild, students, attendance, notices, homeworks, t]);

  const chartData = useMemo(() => {
    if (isParent && myChild) {
      return [
        { name: t.paid, value: myChild.paidFees, color: '#10b981' },
        { name: t.due, value: Math.max(0, myChild.totalFees - myChild.paidFees), color: '#f43f5e' }
      ];
    }
    const totalFeesExpected = students.reduce((acc, s) => acc + s.totalFees, 0);
    const totalFeesCollected = students.reduce((acc, s) => acc + s.paidFees, 0);
    return [
      { name: t.paid, value: totalFeesCollected, color: '#10b981' }, 
      { name: t.due, value: Math.max(0, totalFeesExpected - totalFeesCollected), color: isDarkMode ? '#f43f5e' : '#fb7185' }
    ];
  }, [isParent, myChild, students, t, isDarkMode]);

  const recentNotices = notices.filter(n => {
    if (isParent && myChild) return n.targetGrades.includes('All') || n.targetGrades.includes(myChild.grade);
    return true;
  }).slice(-10).reverse();

  return (
    <div className="space-y-4 pb-6 overflow-hidden animate-fade-in">
      <style>{`
        .bento-card {
          background: ${isDarkMode ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.8)'};
          backdrop-filter: blur(12px);
          border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'};
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .bento-card:hover {
          background: ${isDarkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 1)'};
          border-color: ${isDarkMode ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)'};
          transform: translateY(-2px);
        }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>

      {/* ACADEMY IDENTITY CARD */}
      <div className="mb-6 grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className={`lg:col-span-4 p-6 rounded-[3rem] border-2 flex flex-col md:flex-row items-center text-center md:text-left justify-between relative overflow-hidden transition-all shadow-lg ${
           isDarkMode ? 'bg-white/5 border-indigo-500/20' : 'bg-white border-indigo-100 shadow-indigo-900/5'
        }`}>
           <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
              <div className={`w-20 h-20 rounded-[2rem] bg-white p-2 shadow-2xl relative z-10 border-4 border-white flex items-center justify-center overflow-hidden transition-all duration-500`}>
                 {safeBranding.logo ? (
                   <img src={safeBranding.logo} className="w-full h-full object-contain" alt="School Logo" />
                 ) : (
                   <i className="fa-solid fa-graduation-cap text-3xl text-indigo-200"></i>
                 )}
              </div>
              <div>
                <h3 className={`font-black text-2xl uppercase tracking-tighter line-clamp-1 ${isDarkMode ? 'text-white' : 'text-indigo-950'}`}>
                   {(safeBranding.name || 'Academy').toUpperCase()}
                </h3>
                <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mt-1 line-clamp-1">
                   {safeBranding.tagline || 'Excellence in Learning'}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 opacity-60">
                   <span className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5"><i className="fa-solid fa-location-dot text-indigo-500"></i> {safeBranding.address}</span>
                   <span className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5"><i className="fa-solid fa-phone text-indigo-500"></i> {safeBranding.phone}</span>
                </div>
              </div>
           </div>
           
           {isAdmin && (
             <div className="flex flex-wrap gap-3 mt-6 md:mt-0">
               <button 
                 onClick={() => setActiveTab?.('access-control')}
                 className="px-6 py-3 bg-slate-900 hover:bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95 shadow-xl border border-white/10"
               >
                 <i className="fa-solid fa-shield-halved text-emerald-400"></i> {t.accessControl}
               </button>
               <button 
                 onClick={() => { setBrandForm(safeBranding); setIsBrandingOpen(true); }}
                 className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95 shadow-xl"
               >
                 <i className="fa-solid fa-pen-nib"></i> Edit Branding
               </button>
             </div>
           )}
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none"></div>
        </div>
      </div>

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bento-card rounded-3xl">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
               <i className={`fa-solid ${isParent ? 'fa-house-user' : 'fa-terminal'} text-sm`}></i>
            </div>
            <div>
               <h1 className={`text-xl font-black tracking-tighter uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {isParent ? t.parentPortal : t.commandCenter}
               </h1>
               <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">
                  Welcome, {user.name} {isParent && myChild && `(Class ${myChild.grade})`}
               </p>
            </div>
         </div>
         <div className="flex gap-2">
            <button 
                onClick={() => setActiveTab?.('food')}
                className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-black transition-all flex items-center gap-2"
            >
                <i className="fa-solid fa-utensils"></i> {t.todaysMenu}
            </button>
            {isStaff && (
              <button 
                onClick={() => setActiveTab?.('homework')}
                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-black transition-all flex items-center gap-2"
              >
                <i className="fa-solid fa-book-open"></i> Homework Hub
              </button>
            )}
         </div>
      </header>

      {/* TODAY'S FOOD MENU CARD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {stats.map((item) => (
          <button 
            key={item.label} 
            onClick={() => setActiveTab?.(item.id)}
            className="bento-card p-4 rounded-2xl flex items-center gap-3 text-left"
          >
             <div className={`w-8 h-8 rounded-lg ${item.bg} ${item.color} flex items-center justify-center text-sm`}>
                <i className={`fa-solid ${item.icon}`}></i>
             </div>
             <div>
                <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest leading-tight">{item.label}</p>
                <p className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{item.value}</p>
             </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bento-card p-6 rounded-[2rem] min-w-0 overflow-hidden flex flex-col">
           <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[10px]">
                        <i className="fa-solid fa-utensils"></i>
                    </div>
                    <h2 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t.todaysMenu}</h2>
                </div>
                <span className="text-[9px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md">{todaysMenu?.day}</span>
           </div>
           
           {todaysMenu ? (
               <div className="grid grid-cols-2 gap-4 flex-1 items-center">
                    <div className={`p-4 rounded-2xl border-l-4 border-amber-500 ${isDarkMode ? 'bg-white/5' : 'bg-amber-50'}`}>
                        <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mb-1">Morning Kickstart</p>
                        <p className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{todaysMenu.breakfast}</p>
                    </div>
                    <div className={`p-4 rounded-2xl border-l-4 border-emerald-500 ${isDarkMode ? 'bg-white/5' : 'bg-emerald-50'}`}>
                        <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">Afternoon Feast</p>
                        <p className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{todaysMenu.lunch}</p>
                    </div>
               </div>
           ) : (
               <div className="flex-1 flex items-center justify-center opacity-30 italic text-xs">Menu registry empty for today.</div>
           )}

           <div className="mt-6 border-t border-white/5 pt-6 relative" style={{ minHeight: '180px', height: '180px' }}>
                <p className="absolute top-0 left-0 text-[8px] font-black uppercase text-slate-500 tracking-widest">{isParent ? t.childProgress : t.financeStream}</p>
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 30, top: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 900}} width={80} />
                    <Tooltip cursor={{fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'}} contentStyle={{ background: isDarkMode ? '#1e293b' : '#ffffff', borderRadius: '16px', border: 'none', fontSize: '10px', fontWeight: 'bold', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                    <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={24}>
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Bar>
                </BarChart>
                </ResponsiveContainer>
           </div>
        </div>

        <div className="bento-card p-6 rounded-[2rem] flex flex-col min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center text-[10px]">
               <i className="fa-solid fa-bolt"></i>
            </div>
            <h2 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t.alertFeed}</h2>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar flex-1">
            {recentNotices.length > 0 ? recentNotices.map((n) => (
              <div key={n.id} className={`p-4 rounded-2xl border border-transparent transition-all group relative overflow-hidden ${
                isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-white hover:shadow-md hover:border-slate-100'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-black text-xs truncate pr-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{n.title}</h3>
                  <div className="flex items-center gap-2 shrink-0">
                     <span className="text-[7px] font-black uppercase text-slate-400 shrink-0">{n.date}</span>
                     {isStaff && (
                       <div className="flex gap-1.5 ml-1">
                         <button 
                           onClick={(e) => { e.stopPropagation(); setEditNotice(n); }} 
                           className="w-7 h-7 rounded-lg bg-indigo-500 text-white flex items-center justify-center text-[9px] shadow-sm hover:bg-indigo-600 transition-colors"
                           title="Quick Edit"
                         >
                           <i className="fa-solid fa-pen-nib"></i>
                         </button>
                         <button 
                           onClick={(e) => { e.stopPropagation(); handleDeleteNotice(n.id, n.title); }} 
                           className="w-7 h-7 rounded-lg bg-rose-50 text-white flex items-center justify-center text-[9px] shadow-sm hover:bg-rose-600 transition-colors"
                           title="Permanently Remove"
                         >
                           <i className="fa-solid fa-trash-can"></i>
                         </button>
                       </div>
                     )}
                  </div>
                </div>
                <p className={`text-[10px] font-medium line-clamp-2 pr-12 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>{n.content}</p>
                <div className="absolute top-0 left-0 w-[3px] h-full bg-indigo-500 opacity-50"></div>
              </div>
            )) : <div className="h-full flex items-center justify-center text-[10px] text-slate-500 font-black uppercase tracking-widest opacity-30 italic py-10">{t.registryClean}</div>}
          </div>
        </div>
      </div>

      {/* QUICK EDIT NOTICE MODAL */}
      {editNotice && (
          <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
             <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl animate-scale-in text-indigo-950">
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-black uppercase tracking-tighter">Edit Notice</h2>
                   <button onClick={() => setEditNotice(null)} className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 hover:text-rose-500 flex items-center justify-center transition-all"><i className="fa-solid fa-times"></i></button>
                </div>
                <form onSubmit={handleSaveEditedNotice} className="space-y-6">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Headline</label>
                      <input 
                        required 
                        className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold" 
                        value={editNotice.title} 
                        onChange={e => setEditNotice({...editNotice, title: e.target.value})} 
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Context</label>
                      <textarea 
                        required 
                        rows={4} 
                        className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 outline-none font-medium" 
                        value={editNotice.content} 
                        onChange={e => setEditNotice({...editNotice, content: e.target.value})} 
                      />
                   </div>
                   <div className="pt-4 flex gap-3">
                      <button type="button" onClick={() => setEditNotice(null)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px]">Cancel</button>
                      <button type="submit" className="flex-[2] py-4 bg-indigo-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition-all">Update Registry</button>
                   </div>
                </form>
             </div>
          </div>
      )}

      {/* BRANDING MODAL */}
      {isBrandingOpen && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-2xl">
             <div className="bg-white rounded-[3.5rem] p-10 max-w-2xl w-full shadow-2xl animate-scale-in border-t-[15px] border-amber-500 flex flex-col h-[90vh] overflow-hidden text-indigo-950">
                <div className="flex justify-between items-center mb-8 shrink-0">
                   <div>
                      <h2 className="text-3xl font-black uppercase tracking-tighter">School Identity</h2>
                   </div>
                   <button onClick={() => setIsBrandingOpen(false)} className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 hover:text-rose-500 transition-colors flex items-center justify-center"><i className="fa-solid fa-times text-xl"></i></button>
                </div>
                <form onSubmit={handleSaveBranding} className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
                   <div className="flex flex-col items-center gap-6 p-10 bg-indigo-50/50 rounded-[3rem] border-2 border-dashed border-indigo-100">
                      <div className="w-32 h-32 rounded-[2.5rem] bg-white shadow-xl overflow-hidden flex items-center justify-center relative group border-4 border-white">
                         {brandForm.logo ? <img src={brandForm.logo} className="w-full h-full object-contain" /> : <i className="fa-solid fa-camera text-indigo-100 text-4xl"></i>}
                         <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity" onClick={() => brandLogoRef.current?.click()}><i className="fa-solid fa-upload text-white text-2xl"></i></div>
                      </div>
                      <input type="file" ref={brandLogoRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <input required className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-400 outline-none font-bold" placeholder="School Name" value={brandForm.name} onChange={e => setBrandForm({...brandForm, name: e.target.value})} />
                      <input required className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-400 outline-none font-bold" placeholder="Slogan" value={brandForm.tagline} onChange={e => setBrandForm({...brandForm, tagline: e.target.value})} />
                   </div>
                   <textarea required className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-400 outline-none font-medium" rows={2} placeholder="Address" value={brandForm.address} onChange={e => setBrandForm({...brandForm, address: e.target.value})} />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <input required className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-400 outline-none font-bold" placeholder="Phone" value={brandForm.phone} onChange={e => setBrandForm({...brandForm, phone: e.target.value})} />
                      <input required type="email" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-400 outline-none font-bold" placeholder="Email" value={brandForm.email} onChange={e => setBrandForm({...brandForm, email: e.target.value})} />
                   </div>
                   <button type="submit" className="w-full py-5 bg-indigo-900 text-white rounded-3xl font-black shadow-2xl hover:bg-black transition-all uppercase text-[10px] tracking-[0.2em]">Apply Changes</button>
                </form>
             </div>
          </div>
        )}
    </div>
  );
};

export default Dashboard;
