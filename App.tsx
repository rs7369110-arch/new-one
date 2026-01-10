
import React, { useState, useEffect } from 'react';
import { UserRole, User, Student, Notice, Homework, AttendanceRecord, TeacherAssignment, FoodItem, MarksRecord, CurriculumItem, SchoolMessage, GalleryItem, AdminActivity, LeaveRequest, FeeStructure, CustomProfileTemplate, Language, FeeTransaction } from './types';
import { storage, DB_KEYS } from './db';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import StudentManagement from './components/StudentManagement';
import Attendance from './components/Attendance';
import NoticeBoard from './components/NoticeBoard';
import HomeworkManager from './components/HomeworkManager';
import FeesManager from './components/FeesManager';
import ICardGenerator from './components/ICardGenerator';
import TeacherManagement from './components/TeacherManagement';
import FoodChart from './components/FoodChart';
import MarksheetManager from './components/MarksheetManager';
import CurriculumManager from './components/CurriculumManager';
import MessageManager from './components/MessageManager';
import GalleryManager from './components/GalleryManager';
import ActivityReport from './components/ActivityReport';
import LeaveManagement from './components/LeaveManagement';
import CertificateHub from './components/CertificateHub';
import StudentReports from './components/StudentReports';
import ExamEntry from './components/ExamEntry';
import FeeReports from './components/FeeReports';
import CustomProfileBuilder from './components/CustomProfileBuilder';
import Logo from './components/Logo';

const DEFAULT_FOOD_CHART: FoodItem[] = [
  { day: 'Monday', breakfast: 'Milk & Poha', breakfastPrice: 20, lunch: 'Dal Fry & Rice', lunchPrice: 40 },
  { day: 'Tuesday', breakfast: 'Banana & Cookies', breakfastPrice: 15, lunch: 'Aloo Paratha & Curd', lunchPrice: 45 },
  { day: 'Wednesday', breakfast: 'Sprouted Salad', breakfastPrice: 25, lunch: 'Mix Veg & Roti', lunchPrice: 40 },
  { day: 'Thursday', breakfast: 'Upma', breakfastPrice: 20, lunch: 'Rajma & Chawal', lunchPrice: 50 },
  { day: 'Friday', breakfast: 'Apple & Toast', breakfastPrice: 30, lunch: 'Paneer Masala & Nan', lunchPrice: 60 },
  { day: 'Saturday', breakfast: 'Idli Sambar', breakfastPrice: 35, lunch: 'Kadhi & Rice', lunchPrice: 40 },
];

const DEFAULT_SUBJECTS = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Computer'];

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'broadcast' | 'notice' | 'gallery';
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [currentLang, setCurrentLang] = useState<Language>(storage.get(DB_KEYS.LANGUAGE as any, Language.EN));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [teachers, setTeachers] = useState<TeacherAssignment[]>([]);
  const [foodChart, setFoodChart] = useState<FoodItem[]>([]);
  const [marks, setMarks] = useState<MarksRecord[]>([]);
  const [curriculum, setCurriculum] = useState<CurriculumItem[]>([]);
  const [messages, setMessages] = useState<SchoolMessage[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [customTemplates, setCustomTemplates] = useState<CustomProfileTemplate[]>([]);
  const [feeTransactions, setFeeTransactions] = useState<FeeTransaction[]>([]);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastViewed, setLastViewed] = useState<Record<string, number>>(storage.get(DB_KEYS.LAST_VIEWED, {}));

  useEffect(() => {
    const savedUser = storage.get<User | null>(DB_KEYS.USER, null);
    if (savedUser) setCurrentUser(savedUser);

    setStudents(storage.get(DB_KEYS.STUDENTS, []));
    setNotices(storage.get(DB_KEYS.NOTICES, []));
    setHomeworks(storage.get(DB_KEYS.HOMEWORK, []));
    setAttendance(storage.get(DB_KEYS.ATTENDANCE, []));
    setTeachers(storage.get(DB_KEYS.TEACHERS, []));
    setFoodChart(storage.get(DB_KEYS.FOOD_CHART, DEFAULT_FOOD_CHART));
    setMarks(storage.get(DB_KEYS.MARKS, []));
    setCurriculum(storage.get(DB_KEYS.CURRICULUM, []));
    setMessages(storage.get(DB_KEYS.MESSAGES, []));
    setGallery(storage.get(DB_KEYS.GALLERY, []));
    setActivities(storage.get(DB_KEYS.ACTIVITY_LOG, []));
    setAvailableSubjects(storage.get(DB_KEYS.SUBJECT_LIST, DEFAULT_SUBJECTS));
    setLeaves(storage.get(DB_KEYS.LEAVES, []));
    setFeeStructures(storage.get(DB_KEYS.FEE_STRUCTURES, []));
    setCustomTemplates(storage.get(DB_KEYS.CUSTOM_TEMPLATES, []));
    setFeeTransactions(storage.get(DB_KEYS.FEE_TRANSACTIONS, []));
  }, []);

  const triggerNotification = (title: string, message: string, type: Notification['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotif = { id, title, message, type };
    setNotifications(prev => [newNotif, ...prev]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4500);
  };

  const updateViewedStamp = (tab: string) => {
    const newStamps = { ...lastViewed, [tab]: Date.now() };
    setLastViewed(newStamps);
    storage.set(DB_KEYS.LAST_VIEWED, newStamps);
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  const toggleLanguage = () => {
    const nextLang = currentLang === Language.EN ? Language.GU : Language.EN;
    setCurrentLang(nextLang);
    storage.set(DB_KEYS.LANGUAGE as any, nextLang);
    triggerNotification('Language Switched', `System now operating in ${nextLang === Language.EN ? 'English' : 'Gujarati'}.`, 'info');
  };

  const getUnreadCounts = () => {
    return {
      notices: notices.filter(n => new Date(n.date).getTime() > (lastViewed['notices'] || 0)).length,
      messages: messages.filter(m => new Date(m.date).getTime() > (lastViewed['messages'] || 0)).length,
      gallery: gallery.filter(g => new Date(g.date).getTime() > (lastViewed['gallery'] || 0)).length,
      leaves: leaves.filter(l => l.status === 'PENDING').length
    };
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    storage.set(DB_KEYS.USER, user);
    triggerNotification('Access Granted', `Welcome back, ${user.name}!`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    storage.clear(DB_KEYS.USER);
    triggerNotification('Session Terminated', 'You have been logged out securely.', 'info');
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    triggerNotification('System Theme', `${!isDarkMode ? 'Dark' : 'Light'} UI Profile applied.`, 'info');
  };

  const updateNotices = (n: Notice[]) => {
    setNotices(prev => {
      storage.set(DB_KEYS.NOTICES, n);
      if (n.length > prev.length) {
        triggerNotification('Notice Board', 'New official notice has been posted.', 'notice');
      }
      return [...n];
    });
  };

  const updateStudents = (newStudents: Student[]) => { setStudents(newStudents); storage.set(DB_KEYS.STUDENTS, newStudents); };
  const updateTeachers = (newTeachers: TeacherAssignment[]) => { setTeachers(newTeachers); storage.set(DB_KEYS.TEACHERS, newTeachers); };
  const updateFoodChart = (newFoodChart: FoodItem[]) => { setFoodChart(newFoodChart); storage.set(DB_KEYS.FOOD_CHART, newFoodChart); };
  const updateMarks = (newMarks: MarksRecord[]) => { setMarks(newMarks); storage.set(DB_KEYS.MARKS, newMarks); };
  const updateAvailableSubjects = (newSubjects: string[]) => { setAvailableSubjects(newSubjects); storage.set(DB_KEYS.SUBJECT_LIST, newSubjects); };
  const updateCurriculum = (newItems: CurriculumItem[]) => { setCurriculum(newItems); storage.set(DB_KEYS.CURRICULUM, newItems); };
  const updateMessages = (newMsgs: SchoolMessage[]) => { setMessages(newMsgs); storage.set(DB_KEYS.MESSAGES, newMsgs); };
  const updateGallery = (newItems: GalleryItem[]) => { setGallery(newItems); storage.set(DB_KEYS.GALLERY, newItems); };
  const updateGalleryCallback = (items: GalleryItem[]) => { setGallery(items); storage.set(DB_KEYS.GALLERY, items); };
  const updateLeaves = (newLeaves: LeaveRequest[]) => { setLeaves(newLeaves); storage.set(DB_KEYS.LEAVES, newLeaves); };
  const updateAttendance = (a: AttendanceRecord[]) => { setAttendance(a); storage.set(DB_KEYS.ATTENDANCE, a); };
  const updateHomework = (h: Homework[]) => { setHomeworks(h); storage.set(DB_KEYS.HOMEWORK, h); };
  const updateFees = (s: Student[]) => { setStudents(s); storage.set(DB_KEYS.STUDENTS, s); };
  const updateFeeStructures = (structures: FeeStructure[]) => { setFeeStructures(structures); storage.set(DB_KEYS.FEE_STRUCTURES, structures); };
  const updateFeeTransactions = (transactions: FeeTransaction[]) => { setFeeTransactions(transactions); storage.set(DB_KEYS.FEE_TRANSACTIONS, transactions); };
  const updateCustomTemplates = (templates: CustomProfileTemplate[]) => { setCustomTemplates(templates); storage.set(DB_KEYS.CUSTOM_TEMPLATES, templates); };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard user={currentUser} students={students} notices={notices} homeworks={homeworks} attendance={attendance} teachers={teachers} onUpdateTeachers={updateTeachers} isDarkMode={isDarkMode} lang={currentLang} />;
      case 'fee-reports': return <FeeReports students={students} transactions={feeTransactions} />;
      case 'custom-builder': return <CustomProfileBuilder templates={customTemplates} onUpdateTemplates={updateCustomTemplates} students={students} />;
      case 'leaves': return <LeaveManagement user={currentUser} leaves={leaves} onUpdateLeaves={updateLeaves} />;
      case 'messages': return <MessageManager user={currentUser} messages={messages} onUpdateMessages={updateMessages} />;
      case 'gallery': return <GalleryManager user={currentUser} gallery={gallery} onUpdateGallery={updateGalleryCallback} isDarkMode={isDarkMode} />;
      case 'activity': return currentUser.role === UserRole.ADMIN ? <ActivityReport activities={activities} onClearLog={() => { setActivities([]); storage.set(DB_KEYS.ACTIVITY_LOG, []); }} /> : <div className="p-8 text-rose-500 font-black">UNAUTHORIZED ACCESS</div>;
      case 'students': return currentUser.role === UserRole.ADMIN ? <StudentManagement students={students} setStudents={updateStudents} /> : <div className="p-8 text-rose-500 font-black">UNAUTHORIZED ACCESS</div>;
      case 'student-reports': return currentUser.role === UserRole.ADMIN ? <StudentReports students={students} attendance={attendance} /> : <div className="p-8 text-rose-500 font-black">UNAUTHORIZED ACCESS</div>;
      case 'exam-entry': return <ExamEntry user={currentUser} students={students} marks={marks} onUpdateMarks={updateMarks} availableSubjects={availableSubjects} teachers={teachers} />;
      case 'teachers': return currentUser.role === UserRole.ADMIN ? <TeacherManagement teachers={teachers} setTeachers={updateTeachers} /> : <div className="p-8 text-rose-500 font-black">UNAUTHORIZED ACCESS</div>;
      case 'food': return <FoodChart user={currentUser} foodChart={foodChart} onUpdateFoodChart={updateFoodChart} />;
      case 'curriculum': return <CurriculumManager user={currentUser} curriculum={curriculum} onUpdateCurriculum={updateCurriculum} />;
      case 'marksheet': return <MarksheetManager user={currentUser} students={students} marks={marks} onUpdateMarks={updateMarks} availableSubjects={availableSubjects} onUpdateSubjects={updateAvailableSubjects} />;
      case 'certs': return <CertificateHub students={students} />;
      case 'attendance': return <Attendance user={currentUser} students={students} attendance={attendance} setAttendance={updateAttendance} />;
      case 'notices': return <NoticeBoard user={currentUser} notices={notices} setNotices={updateNotices} students={students} />;
      case 'homework': return <HomeworkManager user={currentUser} homeworks={homeworks} setHomeworks={updateHomework} />;
      case 'fees': return <FeesManager user={currentUser} students={students} setStudents={updateFees} feeStructures={feeStructures} onUpdateFeeStructures={updateFeeStructures} transactions={feeTransactions} onUpdateTransactions={updateFeeTransactions} />;
      case 'fees-setup': return currentUser.role === UserRole.ADMIN ? <FeesManager user={currentUser} students={students} setStudents={updateFees} feeStructures={feeStructures} onUpdateFeeStructures={updateFeeStructures} transactions={feeTransactions} onUpdateTransactions={updateFeeTransactions} initialMode="SETUP" /> : <div className="p-8 text-rose-500 font-black">UNAUTHORIZED ACCESS</div>;
      case 'icards': return currentUser.role === UserRole.ADMIN ? <ICardGenerator students={students} /> : <div className="p-8 text-rose-500 font-black">UNAUTHORIZED ACCESS</div>;
      default: return <Dashboard user={currentUser} students={students} notices={notices} homeworks={homeworks} attendance={attendance} teachers={teachers} onUpdateTeachers={updateTeachers} isDarkMode={isDarkMode} lang={currentLang} />;
    }
  };

  const getNotifIcon = (type: Notification['type']) => {
    switch(type) {
      case 'success': return 'fa-circle-check text-emerald-500';
      case 'error': return 'fa-circle-exclamation text-rose-500';
      case 'broadcast': return 'fa-paper-plane text-indigo-500';
      case 'notice': return 'fa-bolt-lightning text-amber-500';
      case 'gallery': return 'fa-images text-pink-500';
      default: return 'fa-bell text-blue-500';
    }
  };

  return (
    <div className={`flex flex-col md:flex-row h-screen overflow-hidden relative font-['Inter'] transition-colors duration-500 ${isDarkMode ? 'bg-[#0a0a0c] text-slate-100' : 'bg-[#f8faff] text-slate-800'}`}>
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className={`absolute top-[-10%] left-[-5%] w-[60%] h-[70%] rounded-full blur-[120px] transition-colors duration-1000 ${isDarkMode ? 'bg-indigo-900/20' : 'bg-indigo-500/10'}`}></div>
         <div className={`absolute bottom-[0%] right-[-5%] w-[50%] h-[60%] rounded-full blur-[100px] transition-colors duration-1000 ${isDarkMode ? 'bg-purple-900/15' : 'bg-purple-500/10'}`}></div>
      </div>

      <div className="fixed top-6 right-6 z-[3000] flex flex-col gap-3 w-80 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className={`pointer-events-auto w-full p-4 rounded-2xl shadow-2xl backdrop-blur-3xl border animate-notif-in flex gap-4 items-start ${
            isDarkMode ? 'bg-white/10 border-white/10' : 'bg-white border-slate-100 shadow-indigo-100'
          }`}>
             <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                <i className={`fa-solid ${getNotifIcon(n.type)} text-lg`}></i>
             </div>
             <div className="flex-1 min-w-0">
                <h4 className={`font-black text-xs uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{n.title}</h4>
                <p className="text-[10px] font-medium text-slate-400 leading-relaxed mt-1">{n.message}</p>
             </div>
             <button onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))} className="text-slate-500 hover:text-white transition-colors">
                <i className="fa-solid fa-xmark text-xs"></i>
             </button>
          </div>
        ))}
      </div>

      <div className={`md:hidden flex items-center justify-between px-6 py-4 sticky top-0 z-[2000] border-b backdrop-blur-xl ${
        isDarkMode ? 'bg-[#0a0a0c]/80 border-white/5' : 'bg-white/80 border-slate-100'
      }`}>
        <button onClick={() => setIsSidebarOpen(true)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
          <i className="fa-solid fa-bars-staggered text-xl"></i>
        </button>
        <div className="flex items-center gap-2">
           <Logo size="sm" />
           <span className={`font-black text-lg tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>DIGITAL EDUCATION</span>
        </div>
        <button onClick={toggleTheme} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isDarkMode ? 'bg-amber-500/10 text-amber-500' : 'bg-amber text-amber-600'}`}>
           <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
        </button>
      </div>

      <Sidebar role={currentUser.role} activeTab={activeTab} setActiveTab={updateViewedStamp} onLogout={handleLogout} userName={currentUser.name} isDarkMode={isDarkMode} toggleTheme={toggleTheme} unreadCounts={getUnreadCounts()} currentLang={currentLang} toggleLanguage={toggleLanguage} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-12 relative z-10 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      <style>{`
        @keyframes notifIn { from { transform: translateX(120%) scale(0.9); opacity: 0; } to { transform: translateX(0) scale(1); opacity: 1; } }
        .animate-notif-in { animation: notifIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}; border-radius: 20px; }
      `}</style>
    </div>
  );
};

export default App;
