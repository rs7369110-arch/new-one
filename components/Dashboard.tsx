
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
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  students, 
  notices, 
  homeworks, 
  attendance, 
  teachers, 
  onUpdateTeachers,
  isDarkMode
}) => {
  const totalFeesExpected = students.reduce((acc, s) => acc + s.totalFees, 0);
  const totalFeesCollected = students.reduce((acc, s) => acc + s.paidFees, 0);
  
  const chartData = [
    { name: 'COLLECTED', value: totalFeesCollected, color: '#10b981' }, 
    { name: 'PENDING', value: totalFeesExpected - totalFeesCollected, color: isDarkMode ? '#f43f5e' : '#fb7185' }
  ];

  const recentNotices = notices.slice(-3).reverse();

  return (
    <div className="space-y-12 pb-10 overflow-hidden">
      <style>{`
        @keyframes slideInUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .animate-stagger-1 { animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .animate-stagger-2 { animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards; opacity: 0; }
        .animate-stagger-3 { animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; opacity: 0; }
        .animate-stagger-4 { animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; opacity: 0; }
        .animate-stagger-5 { animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards; opacity: 0; }

        .glass-card {
          background: ${isDarkMode ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.7)'};
          backdrop-filter: blur(20px);
          border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
          box-shadow: ${isDarkMode ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 15px 35px -10px rgba(0, 0, 0, 0.03)'};
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .glass-card::before {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.05), transparent);
          transition: 0.5s;
          pointer-events: none;
        }
        .glass-card:hover::before {
          left: 100%;
        }
        .glass-card:hover {
          background: ${isDarkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.9)'};
          transform: translateY(-8px) scale(1.01);
          box-shadow: ${isDarkMode ? '0 40px 80px -20px rgba(79, 70, 229, 0.3)' : '0 30px 60px -15px rgba(0, 0, 0, 0.08)'};
        }
        .floating-icon {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>

      {/* Modern Header */}
      <header className="relative flex flex-col md:flex-row md:items-center justify-between gap-8 p-12 glass-card rounded-[4rem] animate-stagger-1">
         <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500"></div>
         <div className="z-10">
            <h1 className={`text-4xl md:text-6xl font-black tracking-tighter mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
               SYSTEM <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">COMMAND</span>
            </h1>
            <p className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'} font-black text-[10px] uppercase tracking-[0.6em] ml-1 flex items-center gap-2`}>
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               Session Active | {user.name} @ Academy
            </p>
         </div>
         <div className="z-10 flex items-center gap-4">
            <div className={`px-10 py-5 border rounded-[2.5rem] backdrop-blur-3xl shadow-2xl transition-all hover:scale-105 ${
               isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/40 border-slate-200'
            }`}>
               <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 text-center">Calendar Date</p>
               <p className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
            <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center text-3xl shadow-2xl text-white floating-icon ${
               isDarkMode ? 'bg-gradient-to-tr from-indigo-600 to-purple-600' : 'bg-gradient-to-tr from-indigo-500 to-indigo-700'
            }`}>
               <i className="fa-solid fa-rocket"></i>
            </div>
         </div>
         <div className={`absolute top-[-20%] right-[-10%] w-96 h-96 rounded-full blur-[120px] opacity-20 transition-all duration-1000 ${isDarkMode ? 'bg-indigo-500/20' : 'bg-indigo-500/10'}`}></div>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Students', value: students.length, icon: 'fa-user-graduate', color: isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600', stagger: 'animate-stagger-2' },
          { label: 'Attendance', value: attendance.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'PRESENT').length, icon: 'fa-user-check', color: isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600', stagger: 'animate-stagger-3' },
          { label: 'Live Alerts', value: notices.length, icon: 'fa-tower-broadcast', color: isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600', stagger: 'animate-stagger-4' },
          { label: 'Fees Sync', value: `${Math.round((totalFeesCollected / (totalFeesExpected || 1)) * 100)}%`, icon: 'fa-vault', color: isDarkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600', stagger: 'animate-stagger-5' },
        ].map((item, idx) => (
          <div key={item.label} className={`glass-card p-10 rounded-[4rem] relative group ${item.stagger}`}>
             <div className="relative z-10 flex flex-col gap-8">
                <div className={`w-16 h-16 ${item.color} rounded-[1.8rem] flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform duration-500 floating-icon`} style={{ animationDelay: `${idx * 0.5}s` }}>
                   <i className={`fa-solid ${item.icon}`}></i>
                </div>
                <div>
                   <p className={`text-[10px] font-black uppercase tracking-[0.25em] mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{item.label}</p>
                   <p className={`text-5xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{item.value}</p>
                </div>
             </div>
             {isDarkMode && (
               <div className={`absolute -bottom-10 -right-10 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${item.color.includes('blue') ? 'bg-blue-500' : item.color.includes('emerald') ? 'bg-emerald-500' : item.color.includes('amber') ? 'bg-amber-500' : 'bg-purple-500'}`}></div>
             )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="glass-card p-12 rounded-[4.5rem] animate-stagger-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className={`text-2xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-5 inline-flex ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                 <i className="fa-solid fa-chart-line"></i>
               </div>
               Revenue Streams
            </h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#475569' : '#94a3b8', fontSize: 10, fontWeight: 900, letterSpacing: '1.5px'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#475569' : '#94a3b8', fontSize: 10}} />
                <Tooltip 
                    cursor={{fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'}}
                    contentStyle={{ 
                      background: isDarkMode ? '#1e293b' : '#ffffff', 
                      borderRadius: '30px', 
                      border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`, 
                      color: isDarkMode ? '#fff' : '#000', 
                      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', 
                      padding: '20px',
                      fontWeight: 'bold'
                    }}
                />
                <Bar dataKey="value" radius={[15, 15, 15, 15]} barSize={50}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-12 rounded-[4.5rem] animate-stagger-5">
          <div className="flex items-center justify-between mb-12">
            <h2 className={`text-2xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-5 inline-flex ${isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                <i className="fa-solid fa-satellite"></i>
              </div>
              Notice Board
            </h2>
          </div>
          <div className="space-y-6">
            {recentNotices.length > 0 ? recentNotices.map((n, idx) => (
              <div key={n.id} className={`p-8 border rounded-[3rem] transition-all group cursor-default relative overflow-hidden ${
                isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-50 border-slate-100 hover:bg-white'
              }`} style={{ animation: `slideInUp 0.5s ease-out ${0.5 + (idx * 0.1)}s forwards`, opacity: 0 }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-black group-hover:text-amber-400 transition-colors text-lg ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{n.title}</h3>
                  <span className={`text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full ${isDarkMode ? 'bg-white/5 text-slate-500' : 'bg-white text-slate-400'}`}>{n.date}</span>
                </div>
                <p className={`text-sm font-medium leading-relaxed line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{n.content}</p>
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            )) : <div className="py-24 text-center text-slate-600 font-black uppercase tracking-[0.4em] italic opacity-30">No active alerts found.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
