
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
    presentToday: "Present",
    liveNotices: "Notices",
    collection: "Fees",
    financeStream: "Finance Stream",
    childProgress: "Progress",
    alertFeed: "Alerts",
    paid: "PAID",
    due: "DUE",
    attendance: "ATTENDANCE",
    analyticsLive: "Analytics",
    registryClean: "Registry Clean",
    myChild: "My Child",
    accessControl: "Access",
    todaysMenu: "Today's Menu",
    schoolSetup: "Setup",
    searchHero: "Search Student"
  },
  [Language.GU]: {
    commandCenter: "કમાન્ડ સેન્ટર",
    parentPortal: "પેરેન્ટ પોર્ટલ",
    sysOp: "સિસ્ટમ ઓપરેટર",
    registrySync: "રજિસ્ટ્રી સિંક",
    students: "વિદ્યાર્થીઓ",
    presentToday: "હાજરી",
    liveNotices: "સૂચનાઓ",
    collection: "ફી",
    financeStream: "નાણાકીય પ્રવાહ",
    childProgress: "પ્રગતિ",
    alertFeed: "એલર્ટ",
    paid: "ભરેલ",
    due: "બાકી",
    attendance: "હાજરી",
    analyticsLive: "વિશ્લેષણ",
    registryClean: "રજિસ્ટ્રી ખાલી",
    myChild: "મારું બાળક",
    accessControl: "એક્સેસ",
    todaysMenu: "મેનૂ",
    schoolSetup: "સેટઅપ",
    searchHero: "વિદ્યાર્થી શોધ"
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
      if (file.size > 2 * 1024 * 1024) {
        alert("Logo size must be less than 2MB");
        return;
      }
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
    <div className="space-y-4 md:space-y-6 pb-6 overflow-hidden animate-fade-in">
      <style>{`
        .bento-card-3d {
          background: ${isDarkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 1)'};
          backdrop-filter: blur(12px);
          border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'};
          box-shadow: 0 4px 15px -5px rgba(0,0,0,0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .bento-card-3d:hover { transform: translateY(-2px); }
      `}</style>

      {/* COMPACT ACADEMY IDENTITY */}
      <div className={`p-4 md:p-8 rounded-[2rem] md:rounded-[3rem] border-2 flex flex-col md:flex-row items-center text-center md:text-left justify-between relative overflow-hidden transition-all bento-card-3d ${
         isDarkMode ? 'bg-black border-indigo-500/20' : 'bg-white border-indigo-100'
      }`}>
         <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 relative z-10">
            <div className={`w-16 h-16 md:w-24 md:h-24 rounded-[1.5rem] md:rounded-[2.5rem] bg-white p-1 md:p-2 shadow-lg relative z-10 border-2 md:border-4 border-white flex items-center justify-center overflow-hidden transition-all`}>
               {safeBranding.logo ? (
                 <img src={safeBranding.logo} className="w-full h-full object-contain" alt="Logo" />
               ) : (
                 <i className="fa-solid fa-graduation-cap text-2xl md:text-4xl text-indigo-200"></i>
               )}
            </div>
            <div>
              <h3 className={`font-black text-xl md:text-3xl uppercase tracking-tighter line-clamp-1 ${isDarkMode ? 'text-white' : 'text-indigo-950'}`}>
                 {(safeBranding.name || 'Academy').toUpperCase()}
              </h3>
              <p className="text-[10px] md:text-sm font-black text-indigo-400 uppercase tracking-widest mt-0.5 md:mt-1">
                 {safeBranding.tagline || 'Excellence in Learning'}
              </p>
            </div>
         </div>
         
         <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-4 mt-4 md:mt-0 w-full md:w-auto">
           {isStaff && (
             <button onClick={() => setActiveTab?.('student-search')} className="btn-3d-indigo px-3 md:px-8 py-3 md:py-4 bg-indigo-600 text-white rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border-indigo-900">
               <i className="fa-solid fa-magnifying-glass"></i> {t.searchHero}
             </button>
           )}
           {isAdmin && (
             <>
               <button onClick={() => setActiveTab?.('school-setup')} className="btn-3d-emerald px-3 md:px-8 py-3 md:py-4 bg-teal-600 text-white rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border-teal-900">
                 <i className="fa-solid fa-compass-drafting"></i> {t.schoolSetup}
               </button>
               <button onClick={() => setActiveTab?.('access-control')} className="btn-3d-slate px-3 md:px-8 py-3 md:py-4 bg-slate-900 text-white rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                 <i className="fa-solid fa-shield-halved"></i> {t.accessControl}
               </button>
               <button onClick={() => { setBrandForm(safeBranding); setIsBrandingOpen(true); }} className="btn-3d-indigo col-span-2 md:col-span-1 px-3 md:px-8 py-3 md:py-4 bg-amber-500 text-white rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border-amber-700">
                 <i className="fa-solid fa-pen-nib"></i> Identity
               </button>
             </>
           )}
         </div>
      </div>

      <header className="flex items-center justify-between gap-4 p-4 bento-card-3d rounded-2xl md:rounded-3xl">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-indigo-500/30 shadow-lg">
               <i className={`fa-solid ${isParent ? 'fa-house-user' : 'fa-terminal'} text-base md:text-lg`}></i>
            </div>
            <div>
               <h1 className={`text-lg md:text-2xl font-black tracking-tighter uppercase leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {isParent ? t.parentPortal : t.commandCenter}
               </h1>
               <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {user.name} {isParent && myChild && `• Class ${myChild.grade}`}
               </p>
            </div>
         </div>
         <div className="hidden sm:flex gap-2">
            <button onClick={() => setActiveTab?.('food')} className="btn-3d-slate px-4 py-2 bg-black text-white rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-utensils"></i> Menu
            </button>
            {isStaff && (
              <button onClick={() => setActiveTab?.('homework')} className="btn-3d-indigo px-4 py-2 bg-indigo-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-book-open"></i> Homework
              </button>
            )}
         </div>
      </header>

      {/* COMPACT BENTO STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map((item) => (
          <button 
            key={item.label} 
            onClick={() => setActiveTab?.(item.id)}
            className="bento-card-3d p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] flex flex-col items-center gap-2 text-center"
          >
             <div className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl ${item.bg} ${item.color} flex items-center justify-center text-sm md:text-xl shadow-sm`}>
                <i className={`fa-solid ${item.icon}`}></i>
             </div>
             <div>
                <p className="text-[8px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest">{item.label}</p>
                <p className={`text-base md:text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{item.value}</p>
             </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* COMPACT MENU VIEW */}
        <div className="lg:col-span-2 bento-card-3d p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] flex flex-col min-h-[300px]">
           <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-black text-white flex items-center justify-center text-[10px] shadow-md">
                        <i className="fa-solid fa-utensils"></i>
                    </div>
                    <h2 className={`text-xs md:text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t.todaysMenu}</h2>
                </div>
                <span className="text-[8px] md:text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 uppercase tracking-widest">{todaysMenu?.day}</span>
           </div>
           
           {todaysMenu ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 items-center">
                    <div className={`p-4 md:p-6 rounded-2xl md:rounded-[2rem] border-l-4 md:border-l-8 border-slate-300 shadow-sm ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                        <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Morning Breakfast</p>
                        <p className={`text-sm md:text-lg font-black truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{todaysMenu.breakfast}</p>
                    </div>
                    <div className={`p-4 md:p-6 rounded-2xl md:rounded-[2rem] border-l-4 md:border-l-8 border-black shadow-sm ${isDarkMode ? 'bg-white/5' : 'bg-white border border-slate-100'}`}>
                        <p className="text-[8px] md:text-[9px] font-black text-black uppercase tracking-widest mb-1">Afternoon Lunch</p>
                        <p className={`text-sm md:text-lg font-black truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{todaysMenu.lunch}</p>
                    </div>
               </div>
           ) : (
               <div className="flex-1 flex items-center justify-center opacity-30 italic text-xs">Menu empty.</div>
           )}

           <div className="mt-6 border-t border-white/5 pt-6 relative h-[120px] md:h-[180px]">
                <p className="absolute top-0 left-0 text-[8px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest">{isParent ? t.childProgress : t.financeStream}</p>
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 8, fontWeights: 900}} width={60} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20}>
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Bar>
                </BarChart>
                </ResponsiveContainer>
           </div>
        </div>

        {/* ALERTS SECTION */}
        <div className="bento-card-3d p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] flex flex-col">
          <div className="flex items-center gap-2 mb-4 md:mb-8">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center text-[10px] shadow-amber-500/20 shadow-md">
               <i className="fa-solid fa-bolt"></i>
            </div>
            <h2 className={`text-xs md:text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t.alertFeed}</h2>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[250px] md:max-h-[350px] pr-1 custom-scrollbar flex-1">
            {recentNotices.length > 0 ? recentNotices.map((n) => (
              <div key={n.id} className={`p-4 rounded-xl md:rounded-[2rem] border border-transparent transition-all group relative overflow-hidden ${
                isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-white hover:border-slate-100'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-black text-[10px] md:text-xs uppercase truncate pr-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{n.title}</h3>
                  <span className="text-[7px] font-black uppercase text-slate-400 shrink-0">{n.date}</span>
                </div>
                <p className={`text-[9px] md:text-[10px] font-bold line-clamp-1 opacity-60 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>{n.content}</p>
                <div className="absolute top-0 left-0 w-[4px] h-full bg-indigo-500"></div>
              </div>
            )) : <div className="h-full flex items-center justify-center text-[10px] text-slate-500 font-black uppercase tracking-widest opacity-20 py-10">Archive Empty</div>}
          </div>
        </div>
      </div>
      
      {/* BRANDING CONFIG MODAL */}
      {isBrandingOpen && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 md:p-6">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsBrandingOpen(false)}></div>
           <div className={`w-full max-w-xl rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 relative z-10 shadow-2xl animate-scale-in border-t-[8px] md:border-t-[12px] border-indigo-600 overflow-y-auto max-h-[90vh] ${isDarkMode ? 'bg-[#0f172a]' : 'bg-white'}`}>
              <div className="flex justify-between items-start mb-6 md:mb-8">
                 <div>
                    <h2 className={`text-xl md:text-3xl font-black uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-indigo-950'}`}>Academy Identity</h2>
                    <p className="text-[8px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Registry Control Protocol</p>
                 </div>
                 <button onClick={() => setIsBrandingOpen(false)} className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shadow-inner"><i className="fa-solid fa-xmark"></i></button>
              </div>

              <form onSubmit={handleSaveBranding} className="space-y-4 md:space-y-6">
                 <div className="flex flex-col items-center gap-3 mb-4 md:mb-8 p-4 md:p-6 bg-indigo-50/10 rounded-2xl md:rounded-[2.5rem] border border-indigo-500/20">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white shadow-lg overflow-hidden border-4 border-white flex items-center justify-center relative group">
                       {brandForm.logo ? (
                         <img src={brandForm.logo} className="w-full h-full object-contain" />
                       ) : (
                         <i className="fa-solid fa-camera text-2xl text-indigo-100"></i>
                       )}
                       <button type="button" onClick={() => brandLogoRef.current?.click()} className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <i className="fa-solid fa-upload"></i>
                       </button>
                    </div>
                    <input type="file" ref={brandLogoRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    <p className="text-[8px] md:text-[9px] font-black text-indigo-400 uppercase tracking-widest">Seal Update</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1">
                       <label className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Name</label>
                       <input required className={`w-full px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl border-none outline-none font-bold text-sm md:text-base ${isDarkMode ? 'bg-black text-white' : 'bg-slate-50 text-indigo-900'}`} value={brandForm.name} onChange={e => setBrandForm({...brandForm, name: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Tagline</label>
                       <input className={`w-full px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl border-none outline-none font-bold text-sm md:text-base ${isDarkMode ? 'bg-black text-white' : 'bg-slate-50 text-indigo-900'}`} value={brandForm.tagline} onChange={e => setBrandForm({...brandForm, tagline: e.target.value})} />
                    </div>
                 </div>

                 <button type="submit" className="btn-3d-indigo w-full py-4 md:py-5 bg-indigo-600 text-white rounded-xl md:rounded-[1.8rem] font-black text-[10px] md:text-xs uppercase tracking-widest shadow-2xl mt-2">
                    Seal Identity Blueprint
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
