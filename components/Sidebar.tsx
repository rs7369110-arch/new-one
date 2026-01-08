
import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import Logo from './Logo';
import { storage, DB_KEYS } from '../db';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  userName: string;
  isDarkMode: boolean;
  toggleTheme: () => void;
  pendingLeavesCount?: number;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  color: string;
  active: string;
  roles: UserRole[];
  badge?: number;
  lightIconColor: string;
}

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'fa-house-chimney', color: 'hover:text-amber-400', active: 'from-amber-500/20 to-transparent border-amber-500', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], lightIconColor: 'text-red-500' },
  { id: 'attendance', label: 'Attendance', icon: 'fa-calendar-check', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], color: 'hover:text-orange-400', active: 'from-orange-500/20 to-transparent border-orange-500', lightIconColor: 'text-orange-500' },
  { id: 'students', label: 'Student Entry', icon: 'fa-user-plus', color: 'hover:text-emerald-400', active: 'from-emerald-500/20 to-transparent border-emerald-500', roles: [UserRole.ADMIN], lightIconColor: 'text-yellow-500' },
  { id: 'teachers', label: 'Teacher Entry', icon: 'fa-chalkboard-user', color: 'hover:text-rose-400', active: 'from-rose-500/20 to-transparent border-rose-500', roles: [UserRole.ADMIN], lightIconColor: 'text-lime-500' },
  { id: 'fees', label: 'Fees Pay', icon: 'fa-coins', roles: [UserRole.ADMIN, UserRole.PARENT, UserRole.STUDENT], color: 'hover:text-pink-400', active: 'from-pink-500/20 to-transparent border-pink-500', lightIconColor: 'text-emerald-500' },
  { id: 'fee-reports', label: 'Fee Reports', icon: 'fa-money-bill-trend-up', roles: [UserRole.ADMIN], color: 'hover:text-emerald-500', active: 'from-emerald-500/20 to-transparent border-emerald-500', lightIconColor: 'text-emerald-600' },
  { id: 'fees-setup', label: 'Fees Setup', icon: 'fa-file-invoice-dollar', roles: [UserRole.ADMIN], color: 'hover:text-blue-400', active: 'from-blue-500/20 to-transparent border-blue-500', lightIconColor: 'text-teal-500' },
  { id: 'custom-builder', label: 'Profile Creator', icon: 'fa-puzzle-piece', roles: [UserRole.ADMIN], color: 'hover:text-indigo-400', active: 'from-indigo-500/20 to-transparent border-indigo-500', lightIconColor: 'text-indigo-600' },
  { id: 'notices', label: 'Notice Board', icon: 'fa-bolt-lightning', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], color: 'hover:text-sky-400', active: 'from-sky-500/20 to-transparent border-sky-500', lightIconColor: 'text-cyan-500' },
  { id: 'homework', label: 'Homework', icon: 'fa-scroll', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], color: 'hover:text-purple-400', active: 'from-purple-500/20 to-transparent border-purple-500', lightIconColor: 'text-sky-500' },
  { id: 'exam-entry', label: 'Exam Marks', icon: 'fa-pen-to-square', color: 'hover:text-blue-400', active: 'from-blue-500/20 to-transparent border-blue-500', roles: [UserRole.ADMIN, UserRole.TEACHER], lightIconColor: 'text-blue-500' },
  { id: 'marksheet', label: 'Marksheets', icon: 'fa-file-invoice', color: 'hover:text-cyan-400', active: 'from-cyan-500/20 to-transparent border-cyan-500', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], lightIconColor: 'text-indigo-500' },
  { id: 'leaves', label: 'Leave Portal', icon: 'fa-envelope-open-text', color: 'hover:text-rose-400', active: 'from-rose-500/20 to-transparent border-rose-500', roles: [UserRole.ADMIN, UserRole.TEACHER], lightIconColor: 'text-violet-500' },
  { id: 'messages', label: 'Broadcast', icon: 'fa-paper-plane', color: 'hover:text-indigo-400', active: 'from-indigo-500/20 to-transparent border-indigo-500', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], lightIconColor: 'text-purple-500' },
  { id: 'gallery', label: 'Gallery', icon: 'fa-images', color: 'hover:text-pink-400', active: 'from-pink-500/20 to-transparent border-pink-500', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], lightIconColor: 'text-fuchsia-500' },
  { id: 'curriculum', label: 'Curriculum', icon: 'fa-book-atlas', color: 'hover:text-violet-400', active: 'from-violet-500/20 to-transparent border-violet-500', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], lightIconColor: 'text-pink-500' },
  { id: 'food', label: 'Food Chart', icon: 'fa-utensils', color: 'hover:text-emerald-400', active: 'from-emerald-500/20 to-transparent border-emerald-500', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], lightIconColor: 'text-rose-500' },
  { id: 'certs', label: 'Certificates', icon: 'fa-certificate', color: 'hover:text-amber-400', active: 'from-amber-500/20 to-transparent border-amber-500', roles: [UserRole.ADMIN, UserRole.TEACHER], lightIconColor: 'text-orange-600' },
  { id: 'icards', label: 'ID Cards', icon: 'fa-id-card-clip', roles: [UserRole.ADMIN], color: 'hover:text-indigo-400', active: 'from-indigo-500/20 to-transparent border-indigo-500', lightIconColor: 'text-indigo-600' },
  { id: 'student-reports', label: 'Reports', icon: 'fa-chart-line', color: 'hover:text-cyan-400', active: 'from-cyan-500/20 to-transparent border-cyan-500', roles: [UserRole.ADMIN], lightIconColor: 'text-cyan-600' },
  { id: 'activity', label: 'Admin Log', icon: 'fa-shield-halved', color: 'hover:text-slate-400', active: 'from-slate-500/20 to-transparent border-slate-500', roles: [UserRole.ADMIN], lightIconColor: 'text-slate-600' },
];

const Sidebar: React.FC<SidebarProps> = ({ role, activeTab, setActiveTab, onLogout, userName, isDarkMode, toggleTheme, pendingLeavesCount = 0 }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_MENU_ITEMS);

  useEffect(() => {
    const savedOrder = storage.get<string[]>(DB_KEYS.SIDEBAR_ORDER, []);
    if (savedOrder.length > 0) {
      const sorted = [...DEFAULT_MENU_ITEMS].sort((a, b) => {
        const indexA = savedOrder.indexOf(a.id);
        const indexB = savedOrder.indexOf(b.id);
        const finalA = indexA === -1 ? 999 : indexA;
        const finalB = indexB === -1 ? 999 : indexB;
        return finalA - finalB;
      });
      setMenuItems(sorted);
    }
  }, []);

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <div className={`w-20 md:w-80 flex flex-col transition-all duration-700 relative overflow-hidden shrink-0 border-r ${
      isDarkMode ? 'bg-[#0f172a] border-white/5' : 'bg-white border-slate-100 shadow-2xl'
    }`}>
      {/* Decorative Rainbow Line for Light Mode */}
      {!isDarkMode && (
        <div className="absolute top-0 right-0 w-[4px] h-full bg-gradient-to-b from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500 opacity-60 z-20"></div>
      )}

      <div className="p-8 md:p-10 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative group">
             <div className={`absolute -inset-2 rounded-2xl blur opacity-20 transition duration-1000 group-hover:opacity-40 ${
               isDarkMode 
               ? 'bg-gradient-to-tr from-indigo-500 to-purple-500' 
               : 'bg-gradient-to-tr from-red-500 via-green-500 to-blue-500 animate-pulse'
             }`}></div>
             <div className={`p-3 rounded-2xl shadow-2xl relative ring-1 group-hover:scale-110 transition-transform duration-500 ${
               isDarkMode ? 'bg-[#1e293b] ring-white/10' : 'bg-white ring-slate-100'
             }`}>
               <Logo size="sm" />
             </div>
          </div>
          <div className="hidden md:block">
            <span className={`font-black text-2xl tracking-[-0.05em] block leading-none ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>JANNAT</span>
            <span className={`text-[9px] font-black uppercase tracking-[0.6em] ml-1 ${
              isDarkMode ? 'text-indigo-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-green-500 to-purple-500'
            }`}>ACADEMY</span>
          </div>
        </div>

        {/* Dynamic Theme Toggle in Sidebar */}
        <button 
           onClick={toggleTheme}
           className={`hidden md:flex w-10 h-10 rounded-xl items-center justify-center text-sm transition-all duration-500 shadow-lg ${
              isDarkMode 
              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
              : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white hover:scale-110'
           }`}
        >
           <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
        </button>
      </div>

      <div className="flex-1 py-4 px-6 space-y-2 relative z-10 overflow-y-auto custom-scrollbar">
        {filteredMenuItems.map((item) => {
          const badgeValue = item.id === 'leaves' ? pendingLeavesCount : 0;
          const isActive = activeTab === item.id;
          
          return (
            <div key={item.id} className="relative">
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-5 px-6 py-4 rounded-[1.8rem] transition-all duration-500 group relative overflow-hidden ${
                  isActive 
                    ? isDarkMode 
                      ? `bg-gradient-to-r ${item.active} text-white shadow-2xl scale-[1.02] border-l-4`
                      : `bg-slate-50 text-slate-900 shadow-lg scale-[1.02] border-l-4 border-current`
                    : isDarkMode 
                      ? `text-slate-500 ${item.color} hover:text-slate-200 hover:bg-white/5`
                      : `text-slate-400 hover:bg-slate-50`
                }`}
                style={!isDarkMode && isActive ? { borderColor: item.lightIconColor.replace('text-', '') } : {}}
              >
                <div className={`w-8 flex justify-center transition-all duration-500 ${isActive ? 'scale-125' : 'group-hover:scale-110'} ${
                  !isDarkMode ? (isActive ? item.lightIconColor : 'text-slate-300 group-hover:' + item.lightIconColor) : ''
                }`}>
                  <i className={`fa-solid ${item.icon} text-lg`}></i>
                </div>
                
                <span className={`hidden md:block font-black tracking-widest text-[11px] uppercase transition-all duration-500 ${
                  isActive 
                    ? 'text-white translate-x-1' 
                    : isDarkMode ? 'opacity-80' : 'opacity-100 text-slate-400'
                } ${!isDarkMode && isActive ? '!text-slate-800' : ''}`}>
                  {item.label}
                </span>
                
                {badgeValue > 0 && role === UserRole.ADMIN && (
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce shadow-lg">
                    {badgeValue}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className={`p-6 relative z-10 mt-auto border-t ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-slate-50/50 border-slate-100'}`}>
        {/* Mobile Toggle Button (Visible when sidebar is collapsed) */}
        <button 
           onClick={toggleTheme}
           className={`md:hidden w-full flex items-center justify-center py-4 mb-4 rounded-2xl transition-all duration-500 ${
              isDarkMode ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-600 text-white'
           }`}
        >
           <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
        </button>

        {/* Compact Admin Card */}
        <div className={`p-3 rounded-2xl border mb-3 hidden md:block group transition-all cursor-default ${
          isDarkMode ? 'bg-[#1e293b]/50 border-white/5 hover:bg-[#1e293b]' : 'bg-white border-slate-200 hover:border-indigo-100 shadow-sm'
        }`}>
          <div className="flex items-center gap-3">
             <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-white shadow-lg transition-transform group-hover:rotate-6 text-xs ${
               isDarkMode ? 'bg-gradient-to-tr from-indigo-500 to-purple-500' : 'bg-gradient-to-tr from-red-500 via-orange-500 to-yellow-500'
             }`}>
                {userName.charAt(0)}
             </div>
             <div className="min-w-0">
                <p className={`text-[8px] uppercase font-black tracking-[0.15em] leading-none mb-1 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{role}</p>
                <p className={`font-black text-xs truncate tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{userName}</p>
             </div>
          </div>
        </div>
        
        {/* Compact Logout Button */}
        <button 
          onClick={onLogout}
          className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl transition-all duration-500 font-black text-[10px] uppercase tracking-[0.2em] group ${
            isDarkMode ? 'text-slate-500 hover:bg-rose-500/10 hover:text-rose-400' : 'text-slate-400 hover:bg-rose-50 hover:text-rose-500'
          }`}
        >
          <div className="w-6 flex justify-center group-hover:rotate-[360deg] transition-transform duration-700">
            <i className="fa-solid fa-power-off text-sm"></i>
          </div>
          <span className="hidden md:block">Logout</span>
        </button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Sidebar;
