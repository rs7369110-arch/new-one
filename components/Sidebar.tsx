
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
  { id: 'students', labels: { [Language.EN]: 'Student Entry', [Language.GU]: 'વિદ્યાર્થી એન્ટ્રી' }, icon: 'fa-user-plus', color: 'hover:text-emerald-400', active: 'from-emerald-500/20 to-transparent border-emerald-500', roles: [UserRole.ADMIN], lightIconColor: 'text-yellow-500' },
  { id: 'teachers', labels: { [Language.EN]: 'Teacher Entry', [Language.GU]: 'શિક્ષક એન્ટ્રી' }, icon: 'fa-chalkboard-user', color: 'hover:text-rose-400', active: 'from-rose-500/20 to-transparent border-rose-500', roles: [UserRole.ADMIN], lightIconColor: 'text-lime-500' },
  { id: 'fees', labels: { [Language.EN]: 'Fees Pay', [Language.GU]: 'ફી ભરો' }, icon: 'fa-coins', roles: [UserRole.ADMIN, UserRole.PARENT, UserRole.STUDENT], color: 'hover:text-pink-400', active: 'from-pink-500/20 to-transparent border-pink-500', lightIconColor: 'text-emerald-500' },
  { id: 'fee-reports', labels: { [Language.EN]: 'Fee Reports', [Language.GU]: 'ફી રિપોર્ટ' }, icon: 'fa-money-bill-trend-up', roles: [UserRole.ADMIN], color: 'hover:text-emerald-500', active: 'from-emerald-500/20 to-transparent border-emerald-500', lightIconColor: 'text-emerald-600' },
  { id: 'fees-setup', labels: { [Language.EN]: 'Fees Setup', [Language.GU]: 'ફી સેટઅપ' }, icon: 'fa-file-invoice-dollar', roles: [UserRole.ADMIN], color: 'hover:text-blue-400', active: 'from-blue-500/20 to-transparent border-blue-500', lightIconColor: 'text-teal-500' },
  { id: 'custom-builder', labels: { [Language.EN]: 'Profile Creator', [Language.GU]: 'પ્રોફાઇલ નિર્માતા' }, icon: 'fa-puzzle-piece', roles: [UserRole.ADMIN], color: 'hover:text-indigo-400', active: 'from-indigo-500/20 to-transparent border-indigo-500', lightIconColor: 'text-indigo-600' },
  { id: 'notices', labels: { [Language.EN]: 'Notice Board', [Language.GU]: 'નોટિસ બોર્ડ' }, icon: 'fa-bolt-lightning', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], color: 'hover:text-sky-400', active: 'from-sky-500/20 to-transparent border-sky-500', lightIconColor: 'text-cyan-500' },
  { id: 'homework', labels: { [Language.EN]: 'Homework', [Language.GU]: 'લેસન' }, icon: 'fa-scroll', roles: [UserRole.ADMIN, UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER], color: 'hover:text-purple-400', active: 'from-purple-500/20 to-transparent border-purple-500', lightIconColor: 'text-sky-500' },
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

const Sidebar: React.FC<SidebarProps> = ({ role, activeTab, setActiveTab, onLogout, userName, isDarkMode, toggleTheme, unreadCounts, currentLang, toggleLanguage, isOpen, onClose }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_MENU_ITEMS);
  const [isSorting, setIsSorting] = useState(false);
  const [sortList, setSortList] = useState<MenuItem[]>([]);

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

  const openSortModal = () => {
    setSortList([...menuItems]);
    setIsSorting(true);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newList = [...sortList];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newList.length) return;
    
    [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];
    setSortList(newList);
  };

  const saveOrder = () => {
    const newOrderIds = sortList.map(item => item.id);
    storage.set(DB_KEYS.SIDEBAR_ORDER, newOrderIds);
    setMenuItems([...sortList]);
    setIsSorting(false);
    alert("🚀 Sidebar sequence updated successfully!");
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
      {/* Mobile Backdrop */}
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
            <div>
              <span className={`font-black text-2xl tracking-[-0.05em] block leading-none ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>DIGITAL</span>
              <span className={`text-[9px] font-black uppercase tracking-[0.6em] ml-1 ${
                isDarkMode ? 'text-indigo-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-green-500 to-purple-500'
              }`}>EDUCATION</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
             <button 
                onClick={onClose}
                className={`md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-sm transition-all shadow-lg ${
                    isDarkMode ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-600'
                }`}
             >
                <i className="fa-solid fa-xmark"></i>
             </button>
             <div className="hidden md:flex flex-col gap-2">
                <button 
                  onClick={toggleTheme}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm transition-all duration-500 shadow-lg ${
                      isDarkMode 
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                      : 'bg-indigo-100 text-indigo-600 hover:scale-110'
                  }`}
                >
                  <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                </button>
                <button 
                  onClick={toggleLanguage}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-[9px] font-black transition-all duration-500 shadow-lg ${
                      isDarkMode 
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                      : 'bg-emerald-100 text-emerald-600 hover:scale-110'
                  }`}
                >
                  {currentLang === Language.EN ? 'EN' : 'GU'}
                </button>
             </div>
          </div>
        </div>

        <div className="flex-1 py-2 px-6 space-y-2 relative z-10 overflow-y-auto custom-scrollbar">
          {filteredMenuItems.map((item) => {
            const badgeValue = getBadgeForTab(item.id);
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
                  
                  <span className={`font-black tracking-widest text-[11px] uppercase transition-all duration-500 ${
                    isActive 
                      ? 'text-white translate-x-1' 
                      : isDarkMode ? 'opacity-80' : 'opacity-100 text-slate-400'
                  } ${!isDarkMode && isActive ? '!text-slate-800' : ''}`}>
                    {item.labels[currentLang]}
                  </span>
                  
                  {badgeValue > 0 && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                      <span className="animate-pulse-slow w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]"></span>
                      <span className="px-2 py-0.5 rounded-lg bg-rose-500 text-white text-[7px] font-black uppercase tracking-tighter shadow-lg">New</span>
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className={`p-6 relative z-10 mt-auto border-t ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-slate-50/50 border-slate-100'}`}>
          
          {role === UserRole.ADMIN && (
            <button 
              onClick={openSortModal}
              className={`w-full flex items-center justify-center gap-3 py-3 mb-4 rounded-2xl transition-all duration-500 font-black text-[10px] uppercase tracking-[0.1em] shadow-sm border ${
                isDarkMode 
                ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white' 
                : 'bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white'
              }`}
            >
              <i className="fa-solid fa-sliders"></i>
              <span>{currentLang === Language.EN ? 'Customize Sidebar' : 'સાઇડબાર કસ્ટમાઇઝ'}</span>
            </button>
          )}

          <div className="p-3 rounded-2xl border mb-3 group transition-all cursor-default ${
            isDarkMode ? 'bg-[#1e293b]/50 border-white/5 hover:bg-[#1e293b]' : 'bg-white border-slate-200 hover:border-indigo-100 shadow-sm'
          }">
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
          
          <button 
            onClick={onLogout}
            className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl transition-all duration-500 font-black text-[10px] uppercase tracking-[0.2em] group ${
              isDarkMode ? 'text-slate-500 hover:bg-rose-500/10 hover:text-rose-400' : 'text-slate-400 hover:bg-rose-50 hover:text-rose-500'
            }`}
          >
            <div className="w-6 flex justify-center group-hover:rotate-[360deg] transition-transform duration-700">
              <i className="fa-solid fa-power-off text-sm"></i>
            </div>
            <span>{currentLang === Language.EN ? 'Logout' : 'લોગઆઉટ'}</span>
          </button>
        </div>

        {isSorting && (
          <div className="fixed inset-0 z-[4000] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-xl">
             <div className="bg-white rounded-[3.5rem] p-10 max-w-xl w-full shadow-2xl animate-scale-in border-t-[15px] border-indigo-600 flex flex-col h-[80vh]">
                <div className="flex justify-between items-center mb-8 shrink-0">
                   <div>
                      <h2 className="text-3xl font-black text-indigo-950 uppercase tracking-tighter">Menu Architect</h2>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Reorder your workspace dashboard</p>
                   </div>
                   <button onClick={() => setIsSorting(false)} className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 hover:text-rose-500 transition-colors">
                      <i className="fa-solid fa-times text-xl"></i>
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                   {sortList.map((item, idx) => (
                      <div key={item.id} className="p-4 bg-gray-50 border border-indigo-50 rounded-[1.5rem] flex items-center justify-between group hover:bg-indigo-50 transition-all">
                         <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm ${item.lightIconColor}`}>
                               <i className={`fa-solid ${item.icon}`}></i>
                            </div>
                            <span className="font-black text-xs uppercase tracking-widest text-indigo-900">{item.labels[currentLang]}</span>
                         </div>
                         <div className="flex gap-2">
                            <button 
                              disabled={idx === 0}
                              onClick={() => moveItem(idx, 'up')}
                              className="w-8 h-8 rounded-lg bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 disabled:opacity-30 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                            >
                              <i className="fa-solid fa-chevron-up text-[10px]"></i>
                            </button>
                            <button 
                              disabled={idx === sortList.length - 1}
                              onClick={() => moveItem(idx, 'down')}
                              className="w-8 h-8 rounded-lg bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 disabled:opacity-30 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                            >
                              <i className="fa-solid fa-chevron-down text-[10px]"></i>
                            </button>
                         </div>
                      </div>
                   ))}
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100 shrink-0">
                   <button 
                     onClick={saveOrder}
                     className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl transform hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-widest"
                   >
                      Apply New Sequence
                   </button>
                </div>
             </div>
          </div>
        )}

        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 3px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}; border-radius: 10px; }
          @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
          @keyframes pulseSlow {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.2); }
          }
          .animate-pulse-slow { animation: pulseSlow 2s infinite ease-in-out; }
        `}</style>
      </div>
    </>
  );
};

export default Sidebar;
