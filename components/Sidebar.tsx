
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
  { id: 'dashboard', label: 'Home', icon: 'fa-house-chimney', color: 'hover:text-amber-400', active: 'from-amber-500/20 to-transparent border-amber-500', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], lightIconColor: 'text-red-500' },
  { id: 'attendance', label: 'Attend', icon: 'fa-calendar-check', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], color: 'hover:text-orange-400', active: 'from-orange-500/20 to-transparent border-orange-500', lightIconColor: 'text-orange-500' },
  { id: 'students', label: 'Students', icon: 'fa-user-plus', color: 'hover:text-emerald-400', active: 'from-emerald-500/20 to-transparent border-emerald-500', roles: [UserRole.ADMIN], lightIconColor: 'text-yellow-500' },
  { id: 'teachers', label: 'Teachers', icon: 'fa-chalkboard-user', color: 'hover:text-rose-400', active: 'from-rose-500/20 to-transparent border-rose-500', roles: [UserRole.ADMIN], lightIconColor: 'text-lime-500' },
  { id: 'fees', label: 'Fees', icon: 'fa-coins', roles: [UserRole.ADMIN, UserRole.PARENT, UserRole.STUDENT], color: 'hover:text-pink-400', active: 'from-pink-500/20 to-transparent border-pink-500', lightIconColor: 'text-emerald-500' },
  { id: 'notices', label: 'Notice', icon: 'fa-bolt-lightning', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], color: 'hover:text-sky-400', active: 'from-sky-500/20 to-transparent border-sky-500', lightIconColor: 'text-cyan-500' },
  { id: 'homework', label: 'H.W.', icon: 'fa-scroll', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], color: 'hover:text-purple-400', active: 'from-purple-500/20 to-transparent border-purple-500', lightIconColor: 'text-sky-500' },
  { id: 'exam-entry', label: 'Marks', icon: 'fa-pen-to-square', color: 'hover:text-blue-400', active: 'from-blue-500/20 to-transparent border-blue-500', roles: [UserRole.ADMIN, UserRole.TEACHER], lightIconColor: 'text-blue-500' },
  { id: 'marksheet', label: 'Report', icon: 'fa-file-invoice', color: 'hover:text-cyan-400', active: 'from-cyan-500/20 to-transparent border-cyan-500', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], lightIconColor: 'text-indigo-500' },
  { id: 'leaves', label: 'Leave', icon: 'fa-envelope-open-text', color: 'hover:text-rose-400', active: 'from-rose-500/20 to-transparent border-rose-500', roles: [UserRole.ADMIN, UserRole.TEACHER], lightIconColor: 'text-violet-500' },
];

const Sidebar: React.FC<SidebarProps> = ({ role, activeTab, setActiveTab, onLogout, userName, isDarkMode, toggleTheme, pendingLeavesCount = 0 }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_MENU_ITEMS);

  useEffect(() => {
    const savedOrder = storage.get<string[]>(DB_KEYS.SIDEBAR_ORDER, []);
    if (savedOrder.length > 0) {
      const sorted = [...DEFAULT_MENU_ITEMS].sort((a, b) => {
        const indexA = savedOrder.indexOf(a.id);
        const indexB = savedOrder.indexOf(b.id);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
      });
      setMenuItems(sorted);
    }
  }, []);

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <div className={`w-16 md:w-80 flex flex-col transition-all duration-500 relative overflow-hidden shrink-0 border-r ${
      isDarkMode ? 'bg-[#0f172a] border-white/5' : 'bg-white border-slate-100 shadow-2xl'
    }`}>
      {!isDarkMode && (
        <div className="absolute top-0 right-0 w-[1px] md:w-[4px] h-full bg-gradient-to-b from-indigo-500 via-purple-500 to-amber-500 opacity-60 z-20"></div>
      )}

      <div className="p-2 md:p-10 flex items-center justify-center md:justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative group">
             <div className={`p-1 md:p-3 rounded-lg md:rounded-2xl shadow-2xl relative ring-1 group-hover:scale-110 transition-transform duration-500 ${
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

      <div className="flex-1 py-2 px-1 md:px-6 space-y-1 relative z-10 overflow-y-auto custom-scrollbar">
        {filteredMenuItems.map((item) => {
          const badgeValue = item.id === 'leaves' ? pendingLeavesCount : 0;
          const isActive = activeTab === item.id;
          
          return (
            <div key={item.id} className="relative">
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex flex-col md:flex-row items-center justify-center md:justify-start gap-0.5 md:gap-5 px-0.5 md:px-6 py-2 md:py-4 rounded-lg md:rounded-[1.8rem] transition-all duration-500 group relative overflow-hidden ${
                  isActive 
                    ? isDarkMode 
                      ? `bg-gradient-to-r ${item.active} text-white shadow-lg scale-[1.02] border-l-2 md:border-l-4`
                      : `bg-slate-50 text-slate-900 shadow-md scale-[1.02] border-l-2 md:border-l-4 border-current`
                    : isDarkMode 
                      ? `text-slate-500 ${item.color} hover:text-slate-200`
                      : `text-slate-400 hover:bg-slate-50`
                }`}
                style={!isDarkMode && isActive ? { borderColor: item.lightIconColor.replace('text-', '') } : {}}
              >
                <div className={`w-4 md:w-8 flex justify-center transition-all duration-500 ${isActive ? 'scale-105 md:scale-125' : 'group-hover:scale-110'} ${
                  !isDarkMode ? (isActive ? item.lightIconColor : 'text-slate-300 group-hover:' + item.lightIconColor) : ''
                }`}>
                  <i className={`fa-solid ${item.icon} text-sm md:text-lg`}></i>
                </div>
                
                <span className={`block font-black tracking-tight md:tracking-widest text-[6px] md:text-[11px] uppercase transition-all duration-500 text-center md:text-left leading-none ${
                  isActive ? 'text-white md:translate-x-1' : isDarkMode ? 'opacity-60' : 'opacity-100 text-slate-400'
                } ${!isDarkMode && isActive ? '!text-slate-800' : ''}`}>
                  {item.label}
                </span>
                
                {badgeValue > 0 && role === UserRole.ADMIN && (
                  <div className="absolute right-0.5 md:right-5 top-0.5 md:top-1/2 md:-translate-y-1/2 w-3 h-3 md:w-6 md:h-6 bg-rose-500 text-white text-[6px] md:text-[10px] font-black rounded-full flex items-center justify-center shadow-lg">
                    {badgeValue}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className={`p-1.5 md:p-6 relative z-10 mt-auto border-t ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-slate-50/50 border-slate-100'}`}>
        <button 
           onClick={toggleTheme}
           className={`md:hidden w-full flex flex-col items-center justify-center py-1.5 mb-1.5 rounded-lg transition-all duration-500 ${
              isDarkMode ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-600 text-white'
           }`}
        >
           <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-[10px] mb-0.5`}></i>
           <span className="text-[5px] font-black uppercase">UI</span>
        </button>

        <div className={`p-2 rounded-xl border mb-2 hidden md:block group transition-all cursor-default ${
          isDarkMode ? 'bg-[#1e293b]/50 border-white/5 hover:bg-[#1e293b]' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-3">
             <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-white shadow-lg text-[10px] ${
               isDarkMode ? 'bg-gradient-to-tr from-indigo-500 to-purple-500' : 'bg-gradient-to-tr from-red-500 via-orange-500 to-yellow-500'
             }`}>
                {userName.charAt(0)}
             </div>
             <div className="min-w-0">
                <p className={`text-[7px] uppercase font-black tracking-widest leading-none mb-0.5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{role}</p>
                <p className={`font-black text-[10px] truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{userName}</p>
             </div>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className={`w-full flex flex-col md:flex-row items-center justify-center md:justify-start gap-0.5 md:gap-4 px-0.5 md:px-5 py-1.5 rounded-lg transition-all duration-500 font-black text-[6px] md:text-[10px] uppercase tracking-tight group ${
            isDarkMode ? 'text-slate-500 hover:bg-rose-500/10 hover:text-rose-400' : 'text-slate-400 hover:bg-rose-50 hover:text-rose-500'
          }`}
        >
          <div className="w-4 md:w-6 flex justify-center group-hover:rotate-[360deg] transition-transform duration-700">
            <i className="fa-solid fa-power-off text-[10px] md:text-sm"></i>
          </div>
          <span className="block">Out</span>
        </button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 1.5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Sidebar;
