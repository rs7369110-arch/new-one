
import React from 'react';
import { User, Student, Notice, Homework, AttendanceRecord, TeacherAssignment, Language } from '../types';
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
  toggleTheme: () => void;
  lang: Language;
  toggleLang: () => void;
}

const translations = {
  [Language.EN]: {
    commandCenter: "Command Center",
    sysOp: "System Operator",
    students: "Students",
    presentToday: "Present Today",
    liveNotices: "Live Notices",
    collection: "Collection",
    financeStream: "Finance Stream",
    alertFeed: "Alert Feed",
    paid: "PAID",
    due: "DUE",
    switchLang: "English"
  },
  [Language.GU]: {
    commandCenter: "કમાન્ડ સેન્ટર",
    sysOp: "સિસ્ટમ ઓપરેટર",
    students: "વિદ્યાર્થીઓ",
    presentToday: "આજની હાજરી",
    liveNotices: "લાઇવ સૂચનાઓ",
    collection: "ફી વસૂલાત",
    financeStream: "નાણાકીય પ્રવાહ",
    alertFeed: "એલર્ટ ફીડ",
    paid: "ભરેલ",
    due: "બાકી",
    switchLang: "ગુજરાતી"
  },
  [Language.HI]: {
    commandCenter: "कमांड सेंटर",
    sysOp: "सिस्टम ऑपरेटर",
    students: "छात्र",
    presentToday: "आज की उपस्थिति",
    liveNotices: "लाइव सूचनाएं",
    collection: "कुल संग्रह",
    financeStream: "वित्तीय प्रवाह",
    alertFeed: "अलर्ट फ़ीड",
    paid: "भुगतान",
    due: "बकाया",
    switchLang: "हिन्दी"
  }
};

const Dashboard: React.FC<DashboardProps> = ({ 
  user, students, notices, attendance, isDarkMode, toggleTheme, lang, toggleLang
}) => {
  const t = translations[lang];
  const totalFeesExpected = students.reduce((acc, s) => acc + s.totalFees, 0);
  const totalFeesCollected = students.reduce((acc, s) => acc + s.paidFees, 0);
  
  const chartData = [
    { name: t.paid, value: totalFeesCollected, color: '#10b981' }, 
    { name: t.due, value: Math.max(0, totalFeesExpected - totalFeesCollected), color: isDarkMode ? '#f43f5e' : '#fb7185' }
  ];

  const recentNotices = notices.slice(-5).reverse();

  return (
    <div className="space-y-4 pb-6 animate-fade-in">
      <style>{`
        .bento-card {
          background: ${isDarkMode ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 1)'};
          backdrop-filter: blur(12px);
          border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(16, 185, 129, 0.1)'};
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: ${isDarkMode ? 'none' : '0 10px 30px -10px rgba(16, 185, 129, 0.1)'};
        }
        .bento-card:hover { transform: translateY(-2px); border-color: #10b981; }
      `}</style>

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bento-card rounded-3xl">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
               <i className="fa-solid fa-terminal text-sm"></i>
            </div>
            <div>
               <h1 className={`text-xl font-black tracking-tighter uppercase ${isDarkMode ? 'text-white' : 'text-emerald-950'}`}>
                  {t.commandCenter.split(' ')[0]} <span className="text-emerald-500">{t.commandCenter.split(' ')[1] || ''}</span>
               </h1>
               <p className={`text-[8px] font-black uppercase tracking-[0.4em] leading-none mt-1 ${isDarkMode ? 'text-slate-500' : 'text-emerald-400'}`}>
                  {t.sysOp}: {user.name}
               </p>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <button onClick={toggleLang} className={`flex items-center gap-3 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all transform active:scale-95 border ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'}`}>
              <i className="fa-solid fa-language text-sm"></i>
              <span className="hidden md:inline">{t.switchLang}</span>
            </button>
            <button onClick={toggleTheme} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all transform active:scale-95 border ${isDarkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
              <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
            <div className={`px-4 py-2.5 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-emerald-50 border-emerald-100'}`}>
               <span className={`text-[10px] font-black block text-center ${isDarkMode ? 'text-white' : 'text-emerald-900'}`}>{new Date().toLocaleDateString()}</span>
            </div>
         </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t.students, value: students.length, icon: 'fa-user-graduate', color: 'text-emerald-600' },
          { label: t.presentToday, value: attendance.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'PRESENT').length, icon: 'fa-user-check', color: 'text-teal-500' },
          { label: t.liveNotices, value: notices.length, icon: 'fa-tower-broadcast', color: 'text-emerald-400' },
          { label: t.collection, value: `${Math.round((totalFeesCollected / (totalFeesExpected || 1)) * 100)}%`, icon: 'fa-vault', color: 'text-emerald-700' },
        ].map((item) => (
          <div key={item.label} className="bento-card p-4 rounded-2xl flex items-center gap-3">
             <div className={`w-8 h-8 rounded-lg bg-emerald-500/5 ${item.color} flex items-center justify-center text-sm`}><i className={`fa-solid ${item.icon}`}></i></div>
             <div>
                <p className={`text-[8px] font-black uppercase tracking-widest leading-tight ${isDarkMode ? 'text-slate-500' : 'text-emerald-300'}`}>{item.label}</p>
                <p className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-emerald-950'}`}>{item.value}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bento-card p-5 rounded-[2rem]">
          <h2 className={`text-xs font-black uppercase tracking-widest mb-6 ${isDarkMode ? 'text-slate-300' : 'text-emerald-900'}`}>{t.financeStream}</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#64748b' : '#065f46', fontSize: 9, fontWeight: 900}} width={85} />
                <Tooltip contentStyle={{ background: isDarkMode ? '#1e293b' : '#ffffff', borderRadius: '12px', border: isDarkMode ? 'none' : '1px solid #10b981', fontSize: '10px', fontWeight: 'bold' }} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                  {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bento-card p-5 rounded-[2rem] flex flex-col">
          <h2 className={`text-xs font-black uppercase tracking-widest mb-6 ${isDarkMode ? 'text-slate-300' : 'text-emerald-900'}`}>{t.alertFeed}</h2>
          <div className="space-y-2.5 overflow-y-auto max-h-48 pr-2 custom-scrollbar flex-1">
            {recentNotices.length > 0 ? recentNotices.map((n) => (
              <div key={n.id} className={`p-3 rounded-xl border border-transparent transition-all group relative overflow-hidden ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-emerald-50/30 hover:bg-white'}`}>
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className={`font-black text-[10px] truncate pr-4 ${isDarkMode ? 'text-slate-200' : 'text-emerald-900'}`}>{n.title}</h3>
                  <span className={`text-[7px] font-black uppercase shrink-0 ${isDarkMode ? 'text-slate-400' : 'text-emerald-400'}`}>{n.date.split('/')[0]}/{n.date.split('/')[1]}</span>
                </div>
                <p className={`text-[9px] font-medium line-clamp-1 ${isDarkMode ? 'text-slate-500' : 'text-emerald-800/60'}`}>{n.content}</p>
                <div className="absolute top-0 left-0 w-[2px] h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            )) : <div className="h-full flex items-center justify-center text-[9px] text-slate-500 font-black uppercase tracking-widest opacity-30 italic">Registry Clean</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
