
import React, { useMemo } from 'react';
import { User, Student, Notice, Homework, AttendanceRecord, TeacherAssignment, Language, UserRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  user: User;
  students: Student[];
  notices: Notice[];
  homeworks: Homework[];
  attendance: AttendanceRecord[];
  teachers: TeacherAssignment[];
  onUpdateTeachers: (teachers: TeacherAssignment[]) => void;
  isDarkMode: boolean;
  lang: Language;
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
    myChild: "My Child"
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
    myChild: "મારું બાળક"
  }
};

const Dashboard: React.FC<DashboardProps> = ({ 
  user, students, notices, homeworks, attendance, teachers, onUpdateTeachers, isDarkMode, lang
}) => {
  const t = translations[lang];
  const isParent = user.role === UserRole.PARENT;
  
  const myChild = useMemo(() => {
    return isParent ? students.find(s => s.id === user.studentId) : null;
  }, [isParent, students, user.studentId]);

  // Calculations for Admin vs Parent
  const stats = useMemo(() => {
    if (isParent && myChild) {
      const childAttendance = attendance.filter(a => a.studentId === myChild.id);
      const presentCount = childAttendance.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
      const attRatio = childAttendance.length > 0 ? (presentCount / childAttendance.length) * 100 : 0;
      const feeRatio = myChild.totalFees > 0 ? (myChild.paidFees / myChild.totalFees) * 100 : 0;

      return [
        { label: t.attendance, value: `${attRatio.toFixed(0)}%`, icon: 'fa-user-check', color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
        { label: t.collection, value: `${feeRatio.toFixed(0)}%`, icon: 'fa-vault', color: 'text-purple-500', bg: 'bg-purple-500/5' },
        { label: 'Homework', value: homeworks.filter(h => h.grade === myChild.grade).length, icon: 'fa-scroll', color: 'text-blue-500', bg: 'bg-blue-500/5' },
        { label: 'Notices', value: notices.filter(n => n.targetGrades.includes('All') || n.targetGrades.includes(myChild.grade)).length, icon: 'fa-tower-broadcast', color: 'text-amber-500', bg: 'bg-amber-500/5' },
      ];
    }

    // Admin Stats
    const totalExpected = students.reduce((acc, s) => acc + s.totalFees, 0);
    const totalPaid = students.reduce((acc, s) => acc + s.paidFees, 0);
    return [
      { label: t.students, value: students.length, icon: 'fa-user-graduate', color: 'text-blue-500', bg: 'bg-blue-500/5' },
      { label: t.presentToday, value: attendance.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'PRESENT').length, icon: 'fa-user-check', color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
      { label: t.liveNotices, value: notices.length, icon: 'fa-tower-broadcast', color: 'text-amber-500', bg: 'bg-amber-500/5' },
      { label: t.collection, value: `${Math.round((totalPaid / (totalExpected || 1)) * 100)}%`, icon: 'fa-vault', color: 'text-purple-500', bg: 'bg-purple-500/5' },
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
  }).slice(-5).reverse();

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
      `}</style>

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
         <div className="flex items-center gap-2">
            <div className={`px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
               <span className="text-[9px] font-black text-indigo-50 uppercase tracking-widest block text-center mb-0.5 bg-indigo-600/20 rounded px-2">{t.registrySync}</span>
               <span className={`text-[10px] font-black block text-center ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>{new Date().toLocaleDateString('en-GB')}</span>
            </div>
         </div>
      </header>

      {/* Child Profile Widget for Parent */}
      {isParent && myChild && (
        <div className="bento-card p-6 rounded-[2.5rem] flex items-center justify-between border-l-8 border-indigo-600">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-3xl text-indigo-600 font-black overflow-hidden border-2 border-white shadow-lg">
                 {myChild.photo ? <img src={myChild.photo} className="w-full h-full object-cover" /> : myChild.name.charAt(0)}
              </div>
              <div>
                 <h2 className={`text-2xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-indigo-950'}`}>{myChild.name}</h2>
                 <div className="flex gap-4 mt-1">
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Adm No: {myChild.admissionNo}</span>
                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Roll No: {myChild.rollNo}</span>
                 </div>
              </div>
           </div>
           <div className="hidden md:flex gap-2">
              <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-center">
                 <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Status</p>
                 <p className="text-xs font-black text-emerald-500 uppercase">Enrolled</p>
              </div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((item) => (
          <div key={item.label} className="bento-card p-4 rounded-2xl flex items-center gap-3">
             <div className={`w-8 h-8 rounded-lg ${item.bg} ${item.color} flex items-center justify-center text-sm`}>
                <i className={`fa-solid ${item.icon}`}></i>
             </div>
             <div>
                <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest leading-tight">{item.label}</p>
                <p className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{item.value}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bento-card p-5 rounded-[2rem]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
               <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[10px]">
                  <i className="fa-solid fa-chart-pie"></i>
               </div>
               <h2 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{isParent ? t.childProgress : t.financeStream}</h2>
            </div>
            <div className="text-[10px] font-bold text-slate-500">{t.analyticsLive}</div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 9, fontWeight: 900}} width={70} />
                <Tooltip contentStyle={{ background: isDarkMode ? '#1e293b' : '#ffffff', borderRadius: '12px', border: 'none', fontSize: '10px', fontWeight: 'bold' }} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bento-card p-5 rounded-[2rem] flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center text-[10px]">
               <i className="fa-solid fa-bolt"></i>
            </div>
            <h2 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t.alertFeed}</h2>
          </div>
          <div className="space-y-2.5 overflow-y-auto max-h-48 pr-2 custom-scrollbar flex-1">
            {recentNotices.length > 0 ? recentNotices.map((n) => (
              <div key={n.id} className={`p-3 rounded-xl border border-transparent transition-all group relative overflow-hidden ${
                isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-white hover:shadow-sm hover:border-slate-100'
              }`}>
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className={`font-black text-[10px] truncate pr-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{n.title}</h3>
                  <span className="text-[7px] font-black uppercase text-slate-400 shrink-0">{n.date.split('/')[0]}/{n.date.split('/')[1]}</span>
                </div>
                <p className={`text-[9px] font-medium line-clamp-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>{n.content}</p>
                <div className="absolute top-0 left-0 w-[2px] h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            )) : <div className="h-full flex items-center justify-center text-[9px] text-slate-500 font-black uppercase tracking-widest opacity-30 italic">{t.registryClean}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
