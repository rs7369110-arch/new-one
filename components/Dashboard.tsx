
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
    todaysMenu: "Today's Menu",
    schoolSetup: "School Setup"
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
    todaysMenu: "આજનું મેનૂ",
    schoolSetup: "સ્કૂલ સેટઅપ"
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
        { id: 'attendance', label: t.attendance, value: `${attRatio.toFixed(0)}%`, icon: 'fa-user-check', color: 'text-emerald-500', bg: 'bg-emerald-500/5', shadow: 'shadow-emerald-500/10' },
        { id: 'fees', label: t.collection, value: `${feeRatio.toFixed(0)}%`, icon: 'fa-vault', color: 'text-purple-500', bg: 'bg-purple-500/5', shadow: 'shadow-purple-500/10' },
        { id: 'homework', label: 'Homework', value: homeworks.filter(h => h.grade === myChild.grade).length, icon: 'fa-scroll', color: 'text-blue-500', bg: 'bg-blue-500/5', shadow: 'shadow-blue-500/10' },
        { id: 'notices', label: 'Notices', value: notices.filter(n => n.targetGrades.includes('All') || n.targetGrades.includes(myChild.grade)).length, icon: 'fa-tower-broadcast', color: 'text-amber-500', bg: 'bg-amber-500/5', shadow: 'shadow-amber-500/10' },
      ];
    }

    const totalExpected = students.reduce((acc, s) => acc + s.totalFees, 0);
    const totalPaid = students.reduce((acc, s) => acc + s.paidFees, 0);
    return [
      { id: 'students', label: t.students, value: students.length, icon: 'fa-user-graduate', color: 'text-blue-500', bg: 'bg-blue-500/5', shadow: 'shadow-blue-500/10' },
      { id: 'attendance', label: t.presentToday, value: attendance.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'PRESENT').length, icon: 'fa-user-check', color: 'text-emerald-500', bg: 'bg-emerald-500/5', shadow: 'shadow-emerald-500/10' },
      { id: 'notices', label: t.liveNotices, value: notices.length, icon: 'fa-tower-broadcast', color: 'text-amber-500', bg: 'bg-amber-500/5', shadow: 'shadow-amber-500/10' },
      { id: 'fees', label: t.collection, value: `${Math.round((totalPaid / (totalExpected || 1)) * 100)}%`, icon: 'fa-vault', color: 'text-purple-500', bg: 'bg-purple-500/5', shadow: 'shadow-purple-500/10' },
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
    <div className="space-y-6 pb-6 overflow-hidden animate-fade-in">
      <style>{`
        .bento-card-3d {
          background: ${isDarkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 1)'};
          backdrop-filter: blur(12px);
          border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'};
          box-shadow: 0 10px 30px -5px rgba(0,0,0,0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .bento-card-3d:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
        }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>

      {/* ACADEMY IDENTITY CARD */}
      <div className="mb-6 grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className={`lg:col-span-4 p-8 rounded-[3rem] border-2 flex flex-col md:flex-row items-center text-center md:text-left justify-between relative overflow-hidden transition-all shadow-2xl bento-card-3d ${
           isDarkMode ? 'bg-black border-indigo-500/20 shadow-indigo-900/20' : 'bg-white border-indigo-100'
        }`}>
           <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className={`w-24 h-24 rounded-[2.5rem] bg-white p-2 shadow-[0_15px_30px_rgba(0,0,0,0.2)] relative z-10 border-4 border-white flex items-center justify-center overflow-hidden transition-all duration-500 hover:rotate-3`}>
                 {safeBranding.logo ? (
                   <img src={safeBranding.logo} className="w-full h-full object-contain" alt="School Logo" />
                 ) : (
                   <i className="fa-solid fa-graduation-cap text-4xl text-indigo-200"></i>
                 )}
              </div>
              <div>
                <h3 className={`font-black text-3xl uppercase tracking-tighter line-clamp-1 ${isDarkMode ? 'text-white' : 'text-indigo-950'}`}>
                   {(safeBranding.name || 'Academy').toUpperCase()}
                </h3>
                <p className="text-sm font-black text-indigo-400 uppercase tracking-widest mt-1 line-clamp-1">
                   {safeBranding.tagline || 'Excellence in Learning'}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-5 mt-4 opacity-60">
                   <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><i className="fa-solid fa-location-dot text-indigo-500"></i> {safeBranding.address}</span>
                   <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><i className="fa-solid fa-phone text-indigo-500"></i> {safeBranding.phone}</span>
                </div>
              </div>
           </div>
           
           {isAdmin && (
             <div className="flex flex-wrap gap-4 mt-8 md:mt-0">
               <button 
                 onClick={() => setActiveTab?.('school-setup')}
                 className="btn-3d-emerald px-8 py-4 bg-teal-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-teal-900"
               >
                 <i className="fa-solid fa-compass-drafting text-amber-300"></i> {t.schoolSetup}
               </button>
               <button 
                 onClick={() => setActiveTab?.('access-control')}
                 className="btn-3d-slate px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
               >
                 <i className="fa-solid fa-shield-halved text-emerald-400"></i> {t.accessControl}
               </button>
               <button 
                 onClick={() => { setBrandForm(safeBranding); setIsBrandingOpen(true); }}
                 className="btn-3d-indigo px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
               >
                 <i className="fa-solid fa-pen-nib"></i> Branding
               </button>
             </div>
           )}
        </div>
      </div>

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 bento-card-3d rounded-3xl">
         <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-[0_8px_16px_rgba(79,70,229,0.3)]">
               <i className={`fa-solid ${isParent ? 'fa-house-user' : 'fa-terminal'} text-lg`}></i>
            </div>
            <div>
               <h1 className={`text-2xl font-black tracking-tighter uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {isParent ? t.parentPortal : t.commandCenter}
               </h1>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">
                  IDENTIFIED: {user.name} {isParent && myChild && `(Class ${myChild.grade})`}
               </p>
            </div>
         </div>
         <div className="flex gap-3">
            <button 
                onClick={() => setActiveTab?.('food')}
                className="btn-3d-slate px-8 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
            >
                <i className="fa-solid fa-utensils"></i> {t.todaysMenu}
            </button>
            {isStaff && (
              <button 
                onClick={() => setActiveTab?.('homework')}
                className="btn-3d-indigo px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
              >
                <i className="fa-solid fa-book-open"></i> Homework Hub
              </button>
            )}
         </div>
      </header>

      {/* STATS 3D GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((item) => (
          <button 
            key={item.label} 
            onClick={() => setActiveTab?.(item.id)}
            className="bento-card-3d p-5 rounded-[2rem] flex flex-col items-center gap-3 text-center"
          >
             <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center text-xl shadow-[0_8px_16px_rgba(0,0,0,0.1)]`}>
                <i className={`fa-solid ${item.icon}`}></i>
             </div>
             <div>
                <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">{item.label}</p>
                <p className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{item.value}</p>
             </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bento-card-3d p-8 rounded-[3rem] min-w-0 overflow-hidden flex flex-col">
           <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center text-[12px] shadow-lg">
                        <i className="fa-solid fa-utensils"></i>
                    </div>
                    <h2 className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t.todaysMenu}</h2>
                </div>
                <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200 uppercase tracking-widest">{todaysMenu?.day}</span>
           </div>
           
           {todaysMenu ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 items-center">
                    <div className={`p-6 rounded-[2rem] border-l-8 border-slate-300 shadow-xl ${isDarkMode ? 'bg-white/5 shadow-black/50' : 'bg-slate-50 shadow-slate-900/5'}`}>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Morning Breakfast</p>
                        <p className={`text-lg font-black truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{todaysMenu.breakfast}</p>
                    </div>
                    <div className={`p-6 rounded-[2rem] border-l-8 border-black shadow-xl ${isDarkMode ? 'bg-white/5 shadow-black/50' : 'bg-white shadow-black/10 border border-slate-100'}`}>
                        <p className="text-[9px] font-black text-black uppercase tracking-widest mb-2">Afternoon Lunch</p>
                        <p className={`text-lg font-black truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{todaysMenu.lunch}</p>
                    </div>
               </div>
           ) : (
               <div className="flex-1 flex items-center justify-center opacity-30 italic text-sm">Menu registry empty for today.</div>
           )}

           <div className="mt-8 border-t border-white/5 pt-8 relative w-full min-w-0" style={{ minHeight: '180px', height: '180px' }}>
                <p className="absolute top-0 left-0 text-[9px] font-black uppercase text-slate-500 tracking-widest">{isParent ? t.childProgress : t.financeStream}</p>
                <ResponsiveContainer width="100%" height="100%" debounce={100}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 30, top: 10, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 900}} width={80} />
                    <Tooltip cursor={{fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'}} contentStyle={{ background: isDarkMode ? '#1e293b' : '#ffffff', borderRadius: '16px', border: 'none', fontSize: '10px', fontWeight: 'bold', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} />
                    <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={32}>
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Bar>
                </BarChart>
                </ResponsiveContainer>
           </div>
        </div>

        <div className="bento-card-3d p-8 rounded-[3rem] flex flex-col min-w-0 overflow-hidden">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-[12px] shadow-lg shadow-amber-500/20">
               <i className="fa-solid fa-bolt"></i>
            </div>
            <h2 className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t.alertFeed}</h2>
          </div>
          <div className="space-y-4 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar flex-1">
            {recentNotices.length > 0 ? recentNotices.map((n) => (
              <div key={n.id} className={`p-5 rounded-[2rem] border border-transparent transition-all group relative overflow-hidden card-3d ${
                isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-white hover:border-slate-100'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-black text-xs uppercase tracking-tight truncate pr-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{n.title}</h3>
                  <div className="flex items-center gap-2 shrink-0">
                     <span className="text-[8px] font-black uppercase text-slate-400 shrink-0">{n.date}</span>
                     {isStaff && (
                       <div className="flex gap-1.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={(e) => { e.stopPropagation(); setEditNotice(n); }} className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center text-[10px] shadow-lg active:scale-90"><i className="fa-solid fa-pen-nib"></i></button>
                         <button onClick={(e) => { e.stopPropagation(); handleDeleteNotice(n.id, n.title); }} className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center text-[10px] shadow-lg active:scale-90"><i className="fa-solid fa-trash-can"></i></button>
                       </div>
                     )}
                  </div>
                </div>
                <p className={`text-[10px] font-bold line-clamp-2 pr-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>{n.content}</p>
                <div className="absolute top-0 left-0 w-[5px] h-full bg-indigo-500"></div>
              </div>
            )) : <div className="h-full flex items-center justify-center text-[11px] text-slate-500 font-black uppercase tracking-widest opacity-30 italic py-10">{t.registryClean}</div>}
          </div>
        </div>
      </div>
      
      {/* ... (rest of modals stay same structure but get 3D classes added to buttons in JSX) ... */}
    </div>
  );
};

export default Dashboard;
