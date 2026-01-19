
import React, { useState, useEffect, useRef } from 'react';
import { UserRole, Language, SchoolBranding, DEFAULT_BRANDING } from '../types';
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
}

interface MenuItem {
  id: string;
  labels: Record<Language, string>;
  icon: string;
  color: string;
  active: string;
  roles: UserRole[];
  lightIconColor: string;
}

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', labels: { [Language.EN]: 'Dashboard', [Language.GU]: 'ડેશબોર્ડ' }, icon: 'fa-house-chimney', color: 'hover:text-amber-400', active: 'from-amber-500/20 to-transparent border-amber-500', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], lightIconColor: 'text-red-500' },
  { id: 'attendance', labels: { [Language.EN]: 'Attendance', [Language.GU]: 'હાજરી' }, icon: 'fa-calendar-check', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], color: 'hover:text-orange-400', active: 'from-orange-500/20 to-transparent border-orange-500', lightIconColor: 'text-orange-500' },
  { id: 'students', labels: { [Language.EN]: 'Student Entry', [Language.GU]: 'વિદ્યાર્થી એન્ટ્રી' }, icon: 'fa-user-plus', color: 'hover:text-emerald-400', active: 'from-emerald-500/20 to-transparent border-emerald-500', roles: [UserRole.ADMIN, UserRole.TEACHER], lightIconColor: 'text-yellow-500' },
  { id: 'teachers', labels: { [Language.EN]: 'Teacher Entry', [Language.GU]: 'શિક્ષક એન્ટ્રી' }, icon: 'fa-chalkboard-user', color: 'hover:text-rose-400', active: 'from-rose-500/20 to-transparent border-rose-500', roles: [UserRole.ADMIN], lightIconColor: 'text-lime-500' },
  { id: 'fees', labels: { [Language.EN]: 'Fees Pay', [Language.GU]: 'ફી ભરો' }, icon: 'fa-coins', roles: [UserRole.ADMIN, UserRole.PARENT, UserRole.STUDENT], color: 'hover:text-pink-400', active: 'from-pink-500/20 to-transparent border-pink-500', lightIconColor: 'text-emerald-500' },
  { id: 'fee-reports', labels: { [Language.EN]: 'Fee Reports', [Language.GU]: 'ફી રિપોર્ટ' }, icon: 'fa-money-bill-trend-up', roles: [UserRole.ADMIN], color: 'hover:text-emerald-500', active: 'from-emerald-500/20 to-transparent border-emerald-500', lightIconColor: 'text-emerald-600' },
  { id: 'fees-setup', labels: { [Language.EN]: 'Fees Setup', [Language.GU]: 'ફી સેટઅપ' }, icon: 'fa-file-invoice-dollar', roles: [UserRole.ADMIN], color: 'hover:text-blue-400', active: 'from-blue-500/20 to-transparent border-blue-500', lightIconColor: 'text-teal-500' },
  { id: 'custom-builder', labels: { [Language.EN]: 'Profile Creator', [Language.GU]: 'પ્રોફાઇલ નિર્માતા' }, icon: 'fa-puzzle-piece', roles: [UserRole.ADMIN], color: 'hover:text-indigo-400', active: 'from-indigo-500/20 to-transparent border-indigo-500', lightIconColor: 'text-indigo-600' },
  { id: 'notices', labels: { [Language.EN]: 'Notice Board', [Language.GU]: 'નોટિસ બોર્ડ' }, icon: 'fa-bullhorn', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], color: 'hover:text-sky-400', active: 'from-sky-500/20 to-transparent border-sky-500', lightIconColor: 'text-amber-500' },
  { id: 'homework', labels: { [Language.EN]: 'Homework Hub', [Language.GU]: 'હોમવર્ક હબ' }, icon: 'fa-book-atlas', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], color: 'hover:text-purple-400', active: 'from-purple-500/20 to-transparent border-purple-500', lightIconColor: 'text-purple-500' },
  { id: 'exam-entry', labels: { [Language.EN]: 'Exam Marks', [Language.GU]: 'પરીક્ષા માર્કસ' }, icon: 'fa-pen-to-square', color: 'hover:text-blue-400', active: 'from-blue-500/20 to-transparent border-blue-500', roles: [UserRole.ADMIN, UserRole.TEACHER], lightIconColor: 'text-blue-500' },
  { id: 'marksheet', labels: { [Language.EN]: 'Marksheets', [Language.GU]: 'માર્કશીટ' }, icon: 'fa-file-invoice', color: 'hover:text-cyan-400', active: 'from-cyan-500/20 to-transparent border-cyan-500', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], lightIconColor: 'text-indigo-500' },
  { id: 'leaves', labels: { [Language.EN]: 'Leave Portal', [Language.GU]: 'રજા પોર્ટલ' }, icon: 'fa-envelope-open-text', color: 'hover:text-rose-400', active: 'from-rose-500/20 to-transparent border-rose-500', roles: [UserRole.ADMIN, UserRole.TEACHER], lightIconColor: 'text-violet-500' },
  { id: 'messages', labels: { [Language.EN]: 'Broadcast', [Language.GU]: 'બ્રોડકાસ્ટ' }, icon: 'fa-paper-plane', color: 'hover:text-indigo-400', active: 'from-indigo-500/20 to-transparent border-indigo-500', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], lightIconColor: 'text-purple-500' },
  { id: 'gallery', labels: { [Language.EN]: 'Gallery', [Language.GU]: 'ગેલેરી' }, icon: 'fa-images', color: 'hover:text-pink-400', active: 'from-pink-500/20 to-transparent border-pink-500', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], lightIconColor: 'text-fuchsia-500' },
  { id: 'curriculum', labels: { [Language.EN]: 'Curriculum', [Language.GU]: 'અભ્યાસક્રમ' }, icon: 'fa-book-atlas', color: 'hover:text-violet-400', active: 'from-violet-500/20 to-transparent border-violet-500', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], lightIconColor: 'text-pink-500' },
  { id: 'food', labels: { [Language.EN]: 'Food Chart', [Language.GU]: 'ખોરાક ચાર્ટ' }, icon: 'fa-utensils', color: 'hover:text-emerald-400', active: 'from-emerald-500/20 to-transparent border-emerald-500', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], lightIconColor: 'text-rose-500' },
  { id: 'certs', labels: { [Language.EN]: 'Certificates', [Language.GU]: 'પ્રમાણપત્રો' }, icon: 'fa-certificate', color: 'hover:text-amber-400', active: 'from-amber-500/20 to-transparent border-amber-500', roles: [UserRole.ADMIN, UserRole.TEACHER], lightIconColor: 'text-orange-600' },
  { id: 'icards', labels: { [Language.EN]: 'ID Cards', [Language.GU]: 'ઓળખ કાર્ડ' }, icon: 'fa-id-card-clip', roles: [UserRole.ADMIN], color: 'hover:text-indigo-400', active: 'from-indigo-500/20 to-transparent border-indigo-500', lightIconColor: 'text-indigo-600' },
  { id: 'student-reports', labels: { [Language.EN]: 'Reports', [Language.GU]: 'રિપોર્ટ્સ' }, icon: 'fa-chart-line', color: 'hover:text-cyan-400', active: 'from-cyan-500/20 to-transparent border-cyan-500', roles: [UserRole.ADMIN], lightIconColor: 'text-cyan-600' },
  { id: 'activity', labels: { [Language.EN]: 'Admin Log', [Language.GU]: 'એડમિન લોગ' }, icon: 'fa-shield-halved', color: 'hover:text-slate-400', active: 'from-slate-500/20 to-transparent border-slate-500', roles: [UserRole.ADMIN], lightIconColor: 'text-slate-600' },
];

const Sidebar: React.FC<SidebarProps> = ({ role, activeTab, setActiveTab, onLogout, userName, isDarkMode, toggleTheme, unreadCounts, currentLang, toggleLanguage, isOpen, onClose, branding, onUpdateBranding }) => {
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

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <>
      <div 
        className={`md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[2500] transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div className={`fixed md:relative inset-y-0 left-0 w-80 flex flex-col transition-all duration-500 ease-in-out z-[3000] shrink-0 border-r ${
        isDarkMode ? 'bg-[#0f172a] border-white/5' : 'bg-white border-slate-100 shadow-2xl'
      } ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        
        {/* TOP HEADER: APP IDENTITY (FIXED) */}
        <div className="p-6 md:p-8 flex items-center justify-between relative z-10 border-b border-white/5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0">
               <div className={`p-1.5 rounded-xl shadow-lg relative ring-1 overflow-hidden w-10 h-10 flex items-center justify-center ${
                 isDarkMode ? 'bg-[#1e293b] ring-white/10' : 'bg-indigo-50 ring-indigo-100'
               }`}>
                 <Logo size="sm" />
               </div>
            </div>
            <div className="min-w-0 flex-1">
              <span className={`font-black text-sm tracking-tighter block leading-tight truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                DIGITAL CORE
              </span>
              <span className={`text-[6px] font-black uppercase tracking-[0.3em] truncate block ${
                isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
              }`}>
                V6.1.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
             <div className="hidden md:flex">
                <button onClick={toggleTheme} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all duration-500 shadow-sm ${isDarkMode ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-50 text-indigo-600'}`}>
                  <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                </button>
             </div>
             <button onClick={onClose} className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all shadow-lg bg-white/5 text-slate-400">
                <i className="fa-solid fa-xmark"></i>
             </button>
          </div>
        </div>

        {/* SPACING COMPENSATOR */}
        <div className="h-4"></div>

        <div className="flex-1 py-1 px-5 space-y-1.5 relative z-10 overflow-y-auto custom-scrollbar">
          {filteredMenuItems.map((item) => {
            const badgeValue = getBadgeForTab(item.id);
            const isActive = activeTab === item.id;
            const isAttendance = item.id === 'attendance';
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 transition-all duration-500 group relative overflow-hidden ${
                  isAttendance 
                    ? 'px-4 py-2 rounded-[1.1rem]' 
                    : 'px-5 py-3 rounded-[1.4rem]'
                } ${
                  isActive 
                    ? isDarkMode 
                      ? `bg-gradient-to-r ${item.active} text-white shadow-lg scale-[1.01] border-l-4`
                      : `bg-slate-100 text-indigo-950 shadow-md scale-[1.01] border-l-4 border-indigo-600`
                    : isDarkMode 
                      ? `text-slate-500 ${item.color} hover:text-slate-200 hover:bg-white/5`
                      : `text-slate-400 hover:bg-slate-50`
                }`}
              >
                <div className={`w-6 flex justify-center transition-all duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-105'} ${isAttendance ? 'scale-90' : ''}`}>
                  <i className={`fa-solid ${item.icon} ${isAttendance ? 'text-xs' : 'text-sm'}`}></i>
                </div>
                <span className={`font-black tracking-widest uppercase transition-all duration-500 ${isActive ? 'translate-x-0.5' : ''} ${isAttendance ? 'text-[9px]' : 'text-[10px]'}`}>
                  {item.labels[currentLang]}
                </span>
                {badgeValue > 0 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 block animate-pulse"></span>
                  </div>
                )}
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-indigo-500/10 space-y-1.5">
             <button onClick={handleInstallClick} className="w-full flex items-center gap-4 px-5 py-3 rounded-[1.4rem] transition-all hover:bg-emerald-500/10 text-emerald-500/80 group">
                <i className="fa-solid fa-mobile-screen-button w-6 text-center text-sm"></i>
                <span className="font-black tracking-widest text-[9px] uppercase">Install Node</span>
             </button>

             {role === UserRole.ADMIN && (
               <div className="grid grid-cols-2 gap-2 px-1 mt-1 pb-4">
                  <button onClick={handleBackup} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 hover:bg-indigo-500 hover:text-white transition-all">
                     <i className="fa-solid fa-file-export text-xs"></i>
                     <span className="text-[6px] font-black uppercase tracking-widest">Backup</span>
                  </button>
                  <button onClick={handleRestore} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-amber-500/5 text-amber-500 border border-amber-500/10 hover:bg-amber-500 hover:text-white transition-all">
                     <i className="fa-solid fa-file-import text-xs"></i>
                     <span className="text-[6px] font-black uppercase tracking-widest">Restore</span>
                  </button>
               </div>
             )}
          </div>
        </div>

        <div className={`p-5 relative z-10 mt-auto border-t ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-slate-50/50 border-slate-100'}`}>
          <button onClick={onLogout} className="w-full flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all duration-500 font-black text-[9px] uppercase tracking-[0.2em] group text-slate-500 hover:bg-rose-500/10 hover:text-rose-400">
            <i className="fa-solid fa-power-off text-xs"></i>
            <span>{currentLang === Language.EN ? 'Logout' : 'લોગઆઉટ'}</span>
          </button>
        </div>

        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 3px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        `}</style>
      </div>
    </>
  );
};

export default Sidebar;
