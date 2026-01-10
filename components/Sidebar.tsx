
import React, { useState, useEffect } from 'react';
import { UserRole, Language } from '../types';
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
  unreadCounts: { notices: number; messages: number; gallery: number; leaves: number; };
  currentLang: Language;
  toggleLanguage: () => void;
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  id: string;
  labels: Record<Language, string>;
  icon: string;
  roles: UserRole[];
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', labels: { [Language.EN]: 'Dashboard', [Language.GU]: 'ડેશબોર્ડ', [Language.HI]: 'डैशबोर्ड' }, icon: 'fa-house-chimney', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER] },
  { id: 'attendance', labels: { [Language.EN]: 'Attendance', [Language.GU]: 'હાજરી', [Language.HI]: 'उपस्थिति' }, icon: 'fa-calendar-check', roles: [UserRole.ADMIN, UserRole.TEACHER] },
  { id: 'students', labels: { [Language.EN]: 'Student Entry', [Language.GU]: 'વિદ્યાર્થી એન્ટ્રી', [Language.HI]: 'छात्र एंट्री' }, icon: 'fa-user-plus', roles: [UserRole.ADMIN] },
  { id: 'teachers', labels: { [Language.EN]: 'Teacher Entry', [Language.GU]: 'શિક્ષક એન્ટ્રી', [Language.HI]: 'शिक्षक एंट्री' }, icon: 'fa-chalkboard-user', roles: [UserRole.ADMIN] },
  { id: 'fees', labels: { [Language.EN]: 'Fees Pay', [Language.GU]: 'ફી ભરો', [Language.HI]: 'फीस भुगतान' }, icon: 'fa-coins', roles: [UserRole.ADMIN, UserRole.PARENT, UserRole.STUDENT] },
  { id: 'notices', labels: { [Language.EN]: 'Notice Board', [Language.GU]: 'નોટિસ બોર્ડ', [Language.HI]: 'सूचना पटल' }, icon: 'fa-bolt-lightning', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER] },
  { id: 'marksheet', labels: { [Language.EN]: 'Marksheets', [Language.GU]: 'માર્કશીટ', [Language.HI]: 'अंकतालिका' }, icon: 'fa-file-invoice', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER] },
  { id: 'icards', labels: { [Language.EN]: 'ID Cards', [Language.GU]: 'ઓળખ કાર્ડ', [Language.HI]: 'आईडी कार्ड' }, icon: 'fa-id-card-clip', roles: [UserRole.ADMIN] },
  { id: 'gallery', labels: { [Language.EN]: 'Gallery', [Language.GU]: 'ગેલેરી', [Language.HI]: 'गैलरी' }, icon: 'fa-images', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER] },
];

const Sidebar: React.FC<SidebarProps> = ({ role, activeTab, setActiveTab, onLogout, userName, isDarkMode, currentLang, isOpen, onClose }) => {
  const isAdmin = role === UserRole.ADMIN;
  const filteredMenuItems = MENU_ITEMS.filter(item => item.roles.includes(role));

  const handleBackup = () => {
    if (!isAdmin) return;
    const data: Record<string, any> = {};
    Object.values(DB_KEYS).forEach(key => { data[key] = localStorage.getItem(key); });
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `digital_edu_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <>
      <div className={`md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[2500] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed md:relative inset-y-0 left-0 w-80 flex flex-col transition-all duration-500 ease-in-out z-[3000] shrink-0 border-r ${isDarkMode ? 'bg-[#0f172a] border-white/5' : 'bg-white border-emerald-100 shadow-2xl'} ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {!isDarkMode && <div className="absolute top-0 right-0 w-[4px] h-full bg-gradient-to-b from-emerald-400 via-teal-500 to-emerald-700 opacity-60 z-20"></div>}
        <div className="p-8 md:p-10 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl shadow-2xl relative ring-1 ${isDarkMode ? 'bg-[#1e293b] ring-white/10' : 'bg-emerald-50 ring-emerald-100'}`}>
              <Logo size="sm" />
            </div>
            <div>
              <span className={`font-black text-2xl tracking-[-0.05em] block leading-none ${isDarkMode ? 'text-white' : 'text-emerald-950'}`}>DIGITAL</span>
              <span className={`text-[9px] font-black uppercase tracking-[0.6em] ml-1 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>EDUCATION</span>
            </div>
          </div>
          <button onClick={onClose} className={`md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-sm ${isDarkMode ? 'bg-white/5 text-slate-400' : 'bg-emerald-50 text-emerald-600'}`}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="flex-1 py-2 px-6 space-y-2 relative z-10 overflow-y-auto custom-scrollbar">
          {filteredMenuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => { setActiveTab(item.id); }} className={`w-full flex items-center gap-5 px-6 py-4 rounded-[1.8rem] transition-all duration-500 group relative overflow-hidden ${isActive ? (isDarkMode ? `bg-emerald-500/20 text-white border-l-4 border-emerald-500` : `bg-emerald-50 text-emerald-900 shadow-lg scale-[1.02] border-l-4 border-emerald-500`) : (isDarkMode ? `text-slate-500 hover:text-slate-200 hover:bg-white/5` : `text-emerald-800/40 hover:bg-emerald-50/50 hover:text-emerald-600`)}`}>
                <div className={`w-8 flex justify-center transition-all duration-500 ${isActive ? 'scale-125' : 'group-hover:scale-110'} ${!isDarkMode ? (isActive ? 'text-emerald-600' : 'text-emerald-200 group-hover:text-emerald-600') : ''}`}>
                  <i className={`fa-solid ${item.icon} text-lg`}></i>
                </div>
                <span className={`font-black tracking-widest text-[11px] uppercase transition-all duration-500 ${isActive ? 'translate-x-1' : ''} ${isDarkMode ? (isActive ? 'text-white' : 'opacity-80') : (isActive ? 'text-emerald-900' : 'text-emerald-800/40')}`}>
                  {item.labels[currentLang]}
                </span>
              </button>
            );
          })}
          {isAdmin && (
            <div className="pt-6 mt-6 border-t border-emerald-500/10 space-y-2">
              <button onClick={handleBackup} className={`w-full flex items-center gap-5 px-6 py-4 rounded-[1.8rem] transition-all ${isDarkMode ? 'bg-emerald-500/5 text-emerald-400 hover:bg-emerald-600 hover:text-white' : 'bg-emerald-50/50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-100'}`}>
                <i className="fa-solid fa-cloud-arrow-down text-lg w-8 text-center"></i>
                <span className="font-black tracking-widest text-[11px] uppercase">Backup Data</span>
              </button>
            </div>
          )}
        </div>
        <div className={`p-6 relative z-10 mt-auto border-t ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-emerald-50/50 border-emerald-100'}`}>
          <div className={`p-3 rounded-2xl border mb-3 cursor-default ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-emerald-100 shadow-sm'}`}>
            <div className="flex items-center gap-3">
               <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-white shadow-lg ${isDarkMode ? 'bg-emerald-500' : 'bg-emerald-600'}`}>{userName.charAt(0)}</div>
               <div className="min-w-0">
                  <p className={`text-[8px] uppercase font-black tracking-[0.15em] mb-1 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{role}</p>
                  <p className={`font-black text-xs truncate ${isDarkMode ? 'text-slate-100' : 'text-emerald-950'}`}>{userName}</p>
               </div>
            </div>
          </div>
          <button onClick={onLogout} className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl transition-all font-black text-[10px] uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500 hover:bg-rose-500/10 hover:text-rose-400' : 'text-emerald-400 hover:bg-rose-50 hover:text-rose-500'}`}>
            <i className="fa-solid fa-power-off text-sm"></i>
            <span>{currentLang === Language.EN ? 'Logout' : currentLang === Language.GU ? 'લોગઆઉટ' : 'लॉगआउट'}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
