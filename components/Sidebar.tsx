
import React, { useState, useEffect, useRef } from 'react';
import { UserRole, Language, SchoolBranding, DEFAULT_BRANDING, AccessPermissions } from '../types';
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
  unreadCounts: {
    notices: number;
    messages: number;
    gallery: number;
    leaves: number;
  };
  currentLang: Language;
  toggleLanguage: () => void;
  isOpen: boolean;
  onClose: () => void;
  branding: SchoolBranding;
  onUpdateBranding: (brand: SchoolBranding) => void;
  permissions: AccessPermissions;
  onSync?: () => void;
  isSyncing?: boolean;
}

export interface MenuItem {
  id: string;
  labels: Record<Language, string>;
  icon: string;
  color: string;
  active: string;
  roles: UserRole[];
  lightIconColor: string;
}

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', labels: { [Language.EN]: 'Dashboard', [Language.GU]: 'ડેશબોર્ડ' }, icon: 'fa-house-chimney', color: 'hover:text-white', active: 'bg-white/10 border-white', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], lightIconColor: 'text-slate-900' },
  { id: 'student-search', labels: { [Language.EN]: 'Search Student', [Language.GU]: 'વિદ્યાર્થી શોધ' }, icon: 'fa-magnifying-glass-chart', roles: [UserRole.ADMIN, UserRole.TEACHER], color: 'hover:text-white', active: 'bg-white/10 border-white', lightIconColor: 'text-slate-900' },
  { id: 'attendance', labels: { [Language.EN]: 'Attendance', [Language.GU]: 'હાજરી' }, icon: 'fa-calendar-check', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], color: 'hover:text-white', active: 'bg-white/10 border-white', lightIconColor: 'text-slate-900' },
  { id: 'students', labels: { [Language.EN]: 'Student Entry', [Language.GU]: 'વિદ્યાર્થી એન્ટ્રી' }, icon: 'fa-user-plus', color: 'hover:text-white', active: 'bg-white/10 border-white', roles: [UserRole.ADMIN, UserRole.TEACHER], lightIconColor: 'text-slate-900' },
  { id: 'cancelled-students', labels: { [Language.EN]: 'Cancelled List', [Language.GU]: 'રદ કરેલ યાદી' }, icon: 'fa-user-slash', color: 'hover:text-white', active: 'bg-white/10 border-white', roles: [UserRole.ADMIN], lightIconColor: 'text-slate-900' },
  { id: 'teachers', labels: { [Language.EN]: 'Teacher Entry', [Language.GU]: 'શિક્ષક એન્ટ્રી' }, icon: 'fa-chalkboard-user', color: 'hover:text-white', active: 'bg-white/10 border-white', roles: [UserRole.ADMIN], lightIconColor: 'text-slate-900' },
  { id: 'school-setup', labels: { [Language.EN]: 'School Setup', [Language.GU]: 'સ્કૂલ સેટઅપ' }, icon: 'fa-building-columns', color: 'hover:text-white', active: 'bg-white/10 border-white', roles: [UserRole.ADMIN], lightIconColor: 'text-slate-900' },
  { id: 'fees', labels: { [Language.EN]: 'Fees Pay', [Language.GU]: 'ફી ભરો' }, icon: 'fa-coins', roles: [UserRole.ADMIN, UserRole.PARENT, UserRole.STUDENT], color: 'hover:text-white', active: 'bg-white/10 border-white', lightIconColor: 'text-slate-900' },
  { id: 'fee-reports', labels: { [Language.EN]: 'Fee Reports', [Language.GU]: 'ફી રિપોર્ટ' }, icon: 'fa-money-bill-trend-up', roles: [UserRole.ADMIN], color: 'hover:text-white', active: 'bg-white/10 border-white', lightIconColor: 'text-slate-900' },
  { id: 'fees-setup', labels: { [Language.EN]: 'Fees Setup', [Language.GU]: 'ફી સેટઅપ' }, icon: 'fa-file-invoice-dollar', roles: [UserRole.ADMIN], color: 'hover:text-white', active: 'bg-white/10 border-white', lightIconColor: 'text-slate-900' },
  { id: 'custom-builder', labels: { [Language.EN]: 'Profile Creator', [Language.GU]: 'પ્રોફાઇલ નિર્માતા' }, icon: 'fa-puzzle-piece', roles: [UserRole.ADMIN], color: 'hover:text-white', active: 'bg-white/10 border-white', lightIconColor: 'text-slate-900' },
  { id: 'notices', labels: { [Language.EN]: 'Notice Board', [Language.GU]: 'નોટિસ બોર્ડ' }, icon: 'fa-bullhorn', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], color: 'hover:text-white', active: 'bg-white/10 border-white', lightIconColor: 'text-slate-900' },
  { id: 'homework', labels: { [Language.EN]: 'Homework Hub', [Language.GU]: 'હોમવર્ક હબ' }, icon: 'fa-book-atlas', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], color: 'hover:text-white', active: 'bg-white/10 border-white', lightIconColor: 'text-slate-900' },
  { id: 'exam-entry', labels: { [Language.EN]: 'Exam Marks', [Language.GU]: 'પરીક્ષા માર્કસ' }, icon: 'fa-pen-to-square', color: 'hover:text-white', active: 'bg-white/10 border-white', roles: [UserRole.ADMIN, UserRole.TEACHER], lightIconColor: 'text-slate-900' },
  { id: 'marksheet', labels: { [Language.EN]: 'Marksheets', [Language.GU]: 'માર્કશીટ' }, icon: 'fa-file-invoice', color: 'hover:text-white', active: 'bg-white/10 border-white', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], lightIconColor: 'text-slate-900' },
  { id: 'leaves', labels: { [Language.EN]: 'Leave Portal', [Language.GU]: 'રજા પોર્ટલ' }, icon: 'fa-envelope-open-text', color: 'hover:text-white', active: 'bg-white/10 border-white', roles: [UserRole.ADMIN, UserRole.TEACHER], lightIconColor: 'text-slate-900' },
  { id: 'messages', labels: { [Language.EN]: 'Broadcast', [Language.GU]: 'બ્રોડકાસ્ટ' }, icon: 'fa-paper-plane', color: 'hover:text-white', active: 'bg-white/10 border-white', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], lightIconColor: 'text-slate-900' },
  { id: 'gallery', labels: { [Language.EN]: 'Gallery', [Language.GU]: 'ગેલેરી' }, icon: 'fa-images', color: 'hover:text-white', active: 'bg-white/10 border-white', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], lightIconColor: 'text-slate-900' },
  { id: 'curriculum', labels: { [Language.EN]: 'Curriculum', [Language.GU]: 'અભ્યાસક્રમ' }, icon: 'fa-book-atlas', color: 'hover:text-white', active: 'bg-white/10 border-white', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], lightIconColor: 'text-slate-900' },
  { id: 'food', labels: { [Language.EN]: 'Food Chart', [Language.GU]: 'ખોરાક ચાર્ટ' }, icon: 'fa-utensils', color: 'hover:text-white', active: 'bg-white/10 border-white', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], lightIconColor: 'text-slate-900' },
  { id: 'certs', labels: { [Language.EN]: 'Certificates', [Language.GU]: 'પ્રમાણપત્રો' }, icon: 'fa-certificate', color: 'hover:text-white', active: 'bg-white/10 border-white', roles: [UserRole.ADMIN, UserRole.TEACHER], lightIconColor: 'text-slate-900' },
  { id: 'icards', labels: { [Language.EN]: 'ID Cards', [Language.GU]: 'ઓળખ કાર્ડ' }, icon: 'fa-id-card-clip', roles: [UserRole.ADMIN], color: 'hover:text-white', active: 'bg-white/10 border-white', lightIconColor: 'text-slate-900' },
  { id: 'student-reports', labels: { [Language.EN]: 'Reports', [Language.GU]: 'રિપોર્ટ્સ' }, icon: 'fa-chart-line', color: 'hover:text-white', active: 'bg-white/10 border-white', roles: [UserRole.ADMIN], lightIconColor: 'text-slate-900' },
  { id: 'access-control', labels: { [Language.EN]: 'Access Hub', [Language.GU]: 'એક્સેસ હબ' }, icon: 'fa-shield-halved', roles: [UserRole.ADMIN], color: 'hover:text-white', active: 'bg-white/10 border-white', lightIconColor: 'text-slate-900' },
  { id: 'activity', labels: { [Language.EN]: 'Admin Log', [Language.GU]: 'એડમિન લોગ' }, icon: 'fa-clock-rotate-left', roles: [UserRole.ADMIN], color: 'hover:text-white', active: 'bg-white/10 border-white', lightIconColor: 'text-slate-900' },
];

const Sidebar: React.FC<SidebarProps> = ({ role, activeTab, setActiveTab, onLogout, userName, isDarkMode, toggleTheme, unreadCounts, currentLang, toggleLanguage, isOpen, onClose, branding, onUpdateBranding, permissions, onSync, isSyncing }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_MENU_ITEMS);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

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

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      alert("Installation ready! Check browser address bar.");
    }
  };

  const handleBackup = () => {
    const data: Record<string, any> = {};
    Object.values(DB_KEYS).forEach(key => {
      data[key] = localStorage.getItem(key);
    });
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_${new Date().toISOString().split('T')[0]}.setup`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRestore = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.setup';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event: any) => {
        try {
          const data = JSON.parse(event.target.result);
          Object.entries(data).forEach(([key, val]) => {
            if (val) localStorage.setItem(key, val as string);
          });
          window.location.reload();
        } catch (err) {
          alert("Invalid File!");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const getBadgeForTab = (tabId: string) => {
    if (tabId === 'notices') return unreadCounts.notices;
    if (tabId === 'messages') return unreadCounts.messages;
    if (tabId === 'gallery') return unreadCounts.gallery;
    if (tabId === 'leaves' && role === UserRole.ADMIN) return unreadCounts.leaves;
    return 0;
  };

  const filteredMenuItems = menuItems.filter(item => {
    if (role === UserRole.ADMIN) return item.roles.includes(UserRole.ADMIN);
    if (item.id === 'dashboard') return true;
    const rolePermissions = permissions[role] || [];
    return rolePermissions.includes(item.id);
  });

  return (
    <>
      <div 
        className={`md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[2500] transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div className={`fixed md:relative inset-y-0 left-0 w-80 flex flex-col transition-all duration-500 ease-in-out z-[3000] shrink-0 border-r ${
        isDarkMode ? 'bg-black border-white/10' : 'bg-white border-slate-100 shadow-2xl'
      } ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        
        {/* TOP HEADER */}
        <div className="p-6 md:p-8 flex items-center justify-between relative z-10 border-b border-white/5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0">
               <div className={`p-1.5 rounded-xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_8px_16px_rgba(0,0,0,0.5)] relative ring-1 overflow-hidden w-10 h-10 flex items-center justify-center ${
                 isDarkMode ? 'bg-white/5 ring-white/10' : 'bg-slate-100 ring-slate-200'
               }`}>
                 <Logo size="sm" />
               </div>
            </div>
            <div className="min-w-0 flex-1">
              <span className={`font-black text-sm tracking-tighter block leading-tight truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                DIGITAL CORE
              </span>
              <span className={`text-[6px] font-black uppercase tracking-[0.3em] truncate block ${
                isDarkMode ? 'text-white/40' : 'text-slate-400'
              }`}>
                V6.1.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
             <button 
                onClick={onSync} 
                disabled={isSyncing}
                title="Master Data Sync"
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all shadow-[0_4px_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none ${
                  isSyncing 
                  ? 'bg-white/20 text-white animate-spin' 
                  : isDarkMode ? 'bg-white/5 text-white/40 hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
             >
                <i className="fa-solid fa-rotate"></i>
             </button>

             <div className="hidden md:flex">
                <button onClick={toggleTheme} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all duration-500 shadow-[0_4px_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
                  <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                </button>
             </div>
             <button onClick={onClose} className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all shadow-lg bg-white/5 text-slate-400">
                <i className="fa-solid fa-xmark"></i>
             </button>
          </div>
        </div>

        <div className="h-4"></div>

        <div className="flex-1 py-1 px-5 space-y-2 relative z-10 overflow-y-auto custom-scrollbar">
          {filteredMenuItems.map((item) => {
            const badgeValue = getBadgeForTab(item.id);
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 transition-all duration-300 group relative overflow-hidden px-5 py-3.5 rounded-[1.4rem] ${
                  isActive 
                    ? isDarkMode 
                      ? `bg-white/10 text-white shadow-[0_8px_20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] scale-[1.02] border-l-4 border-white`
                      : `bg-slate-100 text-slate-900 shadow-[0_8px_20px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.8)] scale-[1.02] border-l-4 border-black`
                    : isDarkMode 
                      ? `text-white/40 hover:text-white hover:bg-white/5`
                      : `text-slate-400 hover:bg-slate-50 hover:text-black`
                }`}
              >
                <div className={`w-6 flex justify-center transition-all duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                  <i className={`fa-solid ${item.icon} text-sm`}></i>
                </div>
                <span className={`font-black tracking-widest uppercase transition-all duration-500 text-[10px] ${isActive ? 'translate-x-0.5' : ''}`}>
                  {item.labels[currentLang]}
                </span>
                {badgeValue > 0 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white block animate-pulse"></span>
                  </div>
                )}
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-white/5 space-y-2">
             <button onClick={handleInstallClick} className="w-full flex items-center gap-4 px-5 py-3 rounded-[1.4rem] transition-all hover:bg-white/10 text-white/40 group active:translate-y-0.5">
                <i className="fa-solid fa-mobile-screen-button w-6 text-center text-sm"></i>
                <span className="font-black tracking-widest text-[9px] uppercase">Install Node</span>
             </button>

             {role === UserRole.ADMIN && (
               <div className="grid grid-cols-2 gap-2 px-1 mt-1 pb-4">
                  <button onClick={handleBackup} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-white/5 text-white/40 border border-white/10 hover:bg-white hover:text-black transition-all shadow-[0_4px_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none">
                     <i className="fa-solid fa-file-export text-xs"></i>
                     <span className="text-[6px] font-black uppercase tracking-widest">Backup</span>
                  </button>
                  <button onClick={handleRestore} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-white/5 text-white/40 border border-white/10 hover:bg-white hover:text-black transition-all shadow-[0_4px_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none">
                     <i className="fa-solid fa-file-import text-xs"></i>
                     <span className="text-[6px] font-black uppercase tracking-widest">Restore</span>
                  </button>
               </div>
             )}
          </div>
        </div>

        <div className={`p-5 relative z-10 mt-auto border-t ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50/50 border-slate-100'}`}>
          <button onClick={onLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-500 font-black text-[9px] uppercase tracking-[0.2em] group text-white/40 hover:bg-rose-500/10 hover:text-rose-400 active:translate-y-0.5">
            <i className="fa-solid fa-power-off text-xs"></i>
            <span>{currentLang === Language.EN ? 'Logout' : 'લોગઆઉટ'}</span>
          </button>
        </div>

        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 3px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        `}</style>
      </div>
    </>
  );
};

export default Sidebar;
