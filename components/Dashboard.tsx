
import React from 'react';
import { User, Student, Notice, Homework, AttendanceRecord, TeacherAssignment } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  user: User;
  students: Student[];
  notices: Notice[];
  homeworks: Homework[];
  attendance: AttendanceRecord[];
  teachers: TeacherAssignment[];
  onUpdateTeachers: (teachers: TeacherAssignment[]) => void;
  isDarkMode: boolean;
  isOnline?: boolean;
  isSyncing?: boolean;
  onForceSync?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  students, 
  notices, 
  homeworks, 
  attendance, 
  teachers, 
  onUpdateTeachers,
  isDarkMode,
  isOnline = true,
  isSyncing = false,
  onForceSync
}) => {
  const totalFeesExpected = students.reduce((acc, s) => acc + s.totalFees, 0);
  const totalFeesCollected = students.reduce((acc, s) => acc + s.paidFees, 0);
  
  const chartData = [
    { name: 'PAID', value: totalFeesCollected, color: '#10b981' }, 
    { name: 'DUE', value: totalFeesExpected - totalFeesCollected, color: isDarkMode ? '#f43f5e' : '#fb7185' }
  ];

  const recentNotices = notices.slice(-3).reverse();

  return (
    <div className="space-y-3 md:space-y-12 pb-10 overflow-hidden">
      <style>{`
        @keyframes slideInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .animate-stagger-1 { animation: slideInUp 0.5s ease-out forwards; opacity: 0; }
        .animate-stagger-2 { animation: slideInUp 0.5s ease-out 0.1s forwards; opacity: 0; }
        .animate-stagger-3 { animation: slideInUp 0.5s ease-out 0.2s forwards; opacity: 0; }
        .glass-card {
          background: ${isDarkMode ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.7)'};
          backdrop-filter: blur(15px);
          border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
          box-shadow: ${isDarkMode ? '0 10px 20px -5px rgba(0, 0, 0, 0.3)' : '0 8px 15px -5px rgba(0, 0, 0, 0.02)'};
        }
        .floating-icon { animation: float 4s ease-in-out infinite; }
      `}</style>

      {/* Ultra Compact Header with Online Status & Sync */}
      <header className="relative flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 md:p-12 glass-card rounded-[1rem] md:rounded-[4rem] animate-stagger-1">
         <div className="absolute top-0 left-0 w-full h-[2px] md:h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500"></div>
         <div className="z-10 flex justify-between items-center w-full md:w-auto">
            <div>
               <h1 className={`text-lg md:text-6xl font-black tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  DASH<span className="text-indigo-400">BOARD</span>
               </h1>
               <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-rose-500'} ${isOnline && 'animate-pulse'}`}></span>
                  <p className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'} font-black text-[7px] md:text-[10px] uppercase tracking-[0.2em]`}>
                     {isOnline ? 'Network Healthy' : 'Offline Mode'} | {user.name}
                  </p>
               </div>
            </div>
            {/* Sync Button & Network Label */}
            <div className="flex items-center gap-2">
               <button 
                  onClick={onForceSync}
                  disabled={!isOnline || isSyncing}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                     isSyncing ? 'bg-indigo-600 text-white animate-spin' : 
                     isOnline ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 active:scale-90' : 
                     'bg-gray-500/10 text-gray-500 opacity-50'
                  }`}
               >
                  <i className={`fa-solid ${isSyncing ? 'fa-rotate' : 'fa-cloud-arrow-up'} text-xs`}></i>
               </button>
               <div className="md:hidden flex items-center gap-2 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20">
                  <span className="text-[9px] font-black text-indigo-400">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
               </div>
            </div>
         </div>
         
         <div className="z-10 hidden md:flex items-center justify-between md:justify-end gap-2 md:gap-4">
            <div className={`flex-1 md:flex-none px-4 md:px-10 py-2 md:py-5 border rounded-xl md:rounded-[2.5rem] backdrop-blur-3xl transition-all ${
               isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/40 border-slate-200'
            }`}>
               <p className="text-[7px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest text-center">Sync Status</p>
               <p className={`text-xs md:text-lg font-black text-center ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
                  {isSyncing ? 'SYNCING...' : isOnline ? 'CLOUD ACTIVE' : 'LOCAL SAVING'}
               </p>
            </div>
         </div>
      </header>

      {/* KPI Grid - Compact for Mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-8">
        {[
          { label: 'Students', value: students.length, icon: 'fa-user-graduate', color: isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600' },
          { label: 'Present', value: attendance.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'PRESENT').length, icon: 'fa-user-check', color: isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600' },
          { label: 'Alerts', value: notices.length, icon: 'fa-tower-broadcast', color: isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600' },
          { label: 'Fees %', value: `${Math.round((totalFeesCollected / (totalFeesExpected || 1)) * 100)}%`, icon: 'fa-vault', color: isDarkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600' },
        ].map((item, idx) => (
          <div key={item.label} className={`glass-card p-2 md:p-10 rounded-xl md:rounded-[4rem] animate-stagger-2`}>
             <div className="relative z-10 flex items-center md:flex-col gap-2 md:gap-8">
                <div className={`w-7 h-7 md:w-16 md:h-16 shrink-0 ${item.color} rounded-lg md:rounded-[1.8rem] flex items-center justify-center text-xs md:text-3xl shadow-inner floating-icon`} style={{ animationDelay: `${idx * 0.5}s` }}>
                   <i className={`fa-solid ${item.icon}`}></i>
                </div>
                <div>
                   <p className={`text-[6px] md:text-[10px] font-black uppercase tracking-wider md:tracking-widest mb-0 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{item.label}</p>
                   <p className={`text-lg md:text-5xl font-black leading-none ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{item.value}</p>
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-10">
        <div className="glass-card p-3 md:p-12 rounded-[1rem] md:rounded-[4.5rem] animate-stagger-3">
          <div className="flex items-center justify-between mb-3 md:mb-12">
            <h2 className={`text-xs md:text-2xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
               <div className={`w-5 h-5 md:w-12 md:h-12 rounded-md md:rounded-2xl flex items-center justify-center mr-2 md:mr-5 inline-flex ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                 <i className="fa-solid fa-chart-line text-[8px] md:text-base"></i>
               </div>
               Revenue
            </h2>
          </div>
          <div className="h-32 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#475569' : '#94a3b8', fontSize: 6, fontWeight: 900}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#475569' : '#94a3b8', fontSize: 6}} />
                <Tooltip 
                    cursor={{fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'}}
                    contentStyle={{ background: isDarkMode ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none', fontSize: '7px', padding: '6px' }}
                />
                <Bar dataKey="value" radius={[3, 3, 3, 3]} barSize={15}>
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-3 md:p-12 rounded-[1rem] md:rounded-[4.5rem] animate-stagger-3">
          <div className="flex items-center justify-between mb-3 md:mb-12">
            <h2 className={`text-xs md:text-2xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              <div className={`w-5 h-5 md:w-12 md:h-12 rounded-md md:rounded-2xl flex items-center justify-center mr-2 md:mr-5 inline-flex ${isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                <i className="fa-solid fa-satellite text-[8px] md:text-base"></i>
              </div>
              Alerts
            </h2>
          </div>
          <div className="space-y-2 md:space-y-6">
            {recentNotices.length > 0 ? recentNotices.map((n, idx) => (
              <div key={n.id} className={`p-2 md:p-8 border rounded-lg md:rounded-[3rem] transition-all relative overflow-hidden ${
                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'
              }`}>
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className={`font-black text-[9px] md:text-lg truncate max-w-[70%] ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{n.title}</h3>
                  <span className="text-[6px] font-black uppercase opacity-40">{n.date}</span>
                </div>
                <p className={`text-[8px] md:text-sm font-medium leading-tight line-clamp-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{n.content}</p>
              </div>
            )) : <div className="py-4 text-center text-slate-600 font-black uppercase tracking-widest opacity-30 text-[7px]">Registry clear.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;