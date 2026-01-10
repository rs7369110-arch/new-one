
import React, { useState, useEffect } from 'react';
import { UserRole, User, Student, Notice, Homework, AttendanceRecord, TeacherAssignment, Language, FeeTransaction, MarksRecord, GalleryItem, FeeStructure } from './types';
import { storage, DB_KEYS } from './db';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import StudentManagement from './components/StudentManagement';
import TeacherManagement from './components/TeacherManagement';
import Attendance from './components/Attendance';
import NoticeBoard from './components/NoticeBoard';
import HomeworkManager from './components/HomeworkManager';
import FeesManager from './components/FeesManager';
import MarksheetManager from './components/MarksheetManager';
import GalleryManager from './components/GalleryManager';
import ActivityReport from './components/ActivityReport';
import ICardGenerator from './components/ICardGenerator';
import Logo from './components/Logo';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info';
}

const DAILY_THOUGHTS = {
  [Language.EN]: [
    "Education is the most powerful weapon which you can use to change the world.",
    "The beautiful thing about learning is that no one can take it away from you.",
    "Develop a passion for learning. If you do, you will never cease to grow.",
    "The roots of education are bitter, but the fruit is sweet."
  ],
  [Language.HI]: [
    "शिक्षा सबसे शक्तिशाली हथियार है जिसका उपयोग आप दुनिया को बदलने के लिए कर सकते हैं।",
    "सीखने की सबसे खूबसूरत बात यह है कि कोई इसे आपसे छीन नहीं सकता।",
    "सीखने के प्रति जुनून पैदा करें। यदि आप ऐसा करते हैं, तो आप कभी बढ़ना बंद नहीं करेंगे।",
    "शिक्षा की जड़ें कड़वी होती हैं, लेकिन फल मीठा होता है।"
  ],
  [Language.GU]: [
    "શિક્ષણ એ સૌથી શક્તિશાળી શસ્ત્ર છે જેનો ઉપયોગ તમે વિશ્વને બદલવા માટે કરી શકો છો.",
    "શીખવાની સુંદર બાબત એ છે કે કોઈ તેને તમારી પાસેથી છીનવી શકતું નથી.",
    "શીખવા માટે ઉત્સાહ કેળવો. જો તમે તે કરશો, તો તમે ક્યારેય વધવાનું બંધ કરશો નહીં.",
    "શિક્ષણના મૂળ કડવા હોય છે, પણ ફળ મીઠા હોય છે."
  ]
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(storage.get(DB_KEYS.USER, null));
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [currentLang, setCurrentLang] = useState<Language>(storage.get(DB_KEYS.LANGUAGE as any, Language.EN));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [randomThought, setRandomThought] = useState("");
  
  // App States with explicit initialization from storage
  const [students, setStudents] = useState<Student[]>(storage.get(DB_KEYS.STUDENTS, []));
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(storage.get(DB_KEYS.ATTENDANCE, []));
  const [notices, setNotices] = useState<Notice[]>(storage.get(DB_KEYS.NOTICES, []));
  const [homeworks, setHomeworks] = useState<Homework[]>(storage.get(DB_KEYS.HOMEWORK, []));
  const [teachers, setTeachers] = useState<TeacherAssignment[]>(storage.get(DB_KEYS.TEACHERS, []));
  const [marks, setMarks] = useState<MarksRecord[]>(storage.get(DB_KEYS.MARKS, []));
  const [gallery, setGallery] = useState<GalleryItem[]>(storage.get(DB_KEYS.GALLERY, []));
  const [feeTransactions, setFeeTransactions] = useState<FeeTransaction[]>(storage.get(DB_KEYS.FEE_TRANSACTIONS, []));
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>(storage.get(DB_KEYS.FEE_STRUCTURES, []));
  const [availableSubjects, setAvailableSubjects] = useState<string[]>(storage.get(DB_KEYS.SUBJECT_LIST, ['Mathematics', 'Science', 'English', 'Hindi']));

  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Persistent Storage Synchronization Logic
  const syncAndSet = <T,>(setter: React.Dispatch<React.SetStateAction<T>>, key: string, value: T) => {
    setter(value);
    storage.set(key, value);
  };

  const triggerNotification = (title: string, message: string, type: Notification['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [{ id, title, message, type }, ...prev]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  };

  const toggleLanguage = () => {
    let nextLang: Language;
    if (currentLang === Language.EN) nextLang = Language.HI;
    else if (currentLang === Language.HI) nextLang = Language.GU;
    else nextLang = Language.EN;
    syncAndSet(setCurrentLang, DB_KEYS.LANGUAGE, nextLang);
    const langNames = { [Language.EN]: 'English', [Language.GU]: 'ગુજરાતી', [Language.HI]: 'हिन्दी' };
    triggerNotification('System Update', `Language changed to ${langNames[nextLang]}`, 'info');
  };

  const handleLogin = (user: User) => {
    syncAndSet(setCurrentUser, DB_KEYS.USER, user);
    
    // Pick a random thought based on current language
    const thoughts = DAILY_THOUGHTS[currentLang];
    const picked = thoughts[Math.floor(Math.random() * thoughts.length)];
    setRandomThought(picked);
    setShowWelcome(true);
    
    triggerNotification('Authorized', `Welcome back, ${user.name}`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    storage.clear(DB_KEYS.USER);
    setShowWelcome(false);
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Persistence Wrappers for Components
  const updateStudents = (s: Student[]) => syncAndSet(setStudents, DB_KEYS.STUDENTS, s);
  const updateAttendance = (a: AttendanceRecord[]) => syncAndSet(setAttendance, DB_KEYS.ATTENDANCE, a);
  const updateNotices = (n: Notice[]) => syncAndSet(setNotices, DB_KEYS.NOTICES, n);
  const updateTeachers = (t: TeacherAssignment[]) => syncAndSet(setTeachers, DB_KEYS.TEACHERS, t);
  const updateMarks = (m: MarksRecord[]) => syncAndSet(setMarks, DB_KEYS.MARKS, m);
  const updateGallery = (g: GalleryItem[]) => syncAndSet(setGallery, DB_KEYS.GALLERY, g);
  const updateTransactions = (t: FeeTransaction[]) => syncAndSet(setFeeTransactions, DB_KEYS.FEE_TRANSACTIONS, t);

  if (!currentUser) return <Login onLogin={handleLogin} students={students} />;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard user={currentUser} students={students} notices={notices} homeworks={homeworks} attendance={attendance} teachers={teachers} onUpdateTeachers={updateTeachers} isDarkMode={isDarkMode} toggleTheme={toggleTheme} lang={currentLang} toggleLang={toggleLanguage} />;
      case 'attendance': return <Attendance user={currentUser} students={students} attendance={attendance} setAttendance={updateAttendance} />;
      case 'students': return <StudentManagement students={students} setStudents={updateStudents} />;
      case 'teachers': return <TeacherManagement teachers={teachers} setTeachers={updateTeachers} />;
      case 'fees': return <FeesManager user={currentUser} students={students} setStudents={updateStudents} feeStructures={feeStructures} onUpdateFeeStructures={fs => storage.set(DB_KEYS.FEE_STRUCTURES, fs)} transactions={feeTransactions} onUpdateTransactions={updateTransactions} />;
      case 'marksheet': return <MarksheetManager user={currentUser} students={students} marks={marks} onUpdateMarks={updateMarks} availableSubjects={availableSubjects} onUpdateSubjects={s => { setAvailableSubjects(s); storage.set(DB_KEYS.SUBJECT_LIST, s); }} />;
      case 'gallery': return <GalleryManager user={currentUser} gallery={gallery} onUpdateGallery={updateGallery} isDarkMode={isDarkMode} />;
      case 'icards': return <ICardGenerator students={students} />;
      case 'notices': return <NoticeBoard user={currentUser} notices={notices} setNotices={updateNotices} />;
      default: return <Dashboard user={currentUser} students={students} notices={notices} homeworks={homeworks} attendance={attendance} teachers={teachers} onUpdateTeachers={updateTeachers} isDarkMode={isDarkMode} toggleTheme={toggleTheme} lang={currentLang} toggleLang={toggleLanguage} />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-500 ${isDarkMode ? 'bg-[#0a0a0c] text-slate-100' : 'bg-[#fcfdfd] text-emerald-950'}`}>
      <Sidebar 
        role={currentUser.role} 
        activeTab={activeTab} 
        setActiveTab={(t) => { setActiveTab(t); setIsSidebarOpen(false); }} 
        onLogout={handleLogout} 
        userName={currentUser.name} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme} 
        unreadCounts={{ notices: 0, messages: 0, gallery: 0, leaves: 0 }} 
        currentLang={currentLang} 
        toggleLanguage={toggleLanguage} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
        <div className="md:hidden flex items-center justify-between mb-6">
           <Logo size="sm" />
           <button onClick={() => setIsSidebarOpen(true)} className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${isDarkMode ? 'bg-white/5 text-slate-400' : 'bg-emerald-50 text-emerald-600 shadow-md border border-emerald-100'}`}><i className="fa-solid fa-bars-staggered"></i></button>
        </div>
        {renderContent()}
      </main>

      {/* Welcome Popup Modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-fade-in">
          <div className={`max-w-md w-full rounded-[3.5rem] p-10 text-center shadow-2xl relative overflow-hidden animate-scale-in border-t-[12px] border-emerald-500 ${isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-white text-emerald-950'}`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-4xl shadow-inner animate-bounce">
                <i className="fa-solid fa-face-smile-wink"></i>
              </div>
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">
              {currentLang === Language.EN ? 'Welcome Back!' : currentLang === Language.GU ? 'સ્વાગત છે!' : 'आपका स्वागत है!'}
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-8 opacity-80">
              {currentUser.name} • {currentUser.role}
            </p>
            
            <div className={`p-6 rounded-[2rem] border-2 italic font-medium leading-relaxed text-lg mb-10 ${isDarkMode ? 'bg-white/5 border-white/5 text-slate-300' : 'bg-emerald-50/50 border-emerald-100 text-emerald-800'}`}>
              "{randomThought}"
            </div>

            <button 
              onClick={() => setShowWelcome(false)}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all transform active:scale-95"
            >
              {currentLang === Language.EN ? 'Start Session' : currentLang === Language.GU ? 'શરૂ કરો' : 'शुरू करें'}
            </button>
          </div>
        </div>
      )}

      {/* Global Notifications */}
      <div className="fixed bottom-6 right-6 z-[9999] space-y-3 w-80 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className={`p-4 rounded-2xl shadow-2xl border pointer-events-auto animate-slide-up flex items-start gap-4 backdrop-blur-xl ${n.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800/80 border-white/5 text-slate-200'}`}>
             <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0"><i className={`fa-solid ${n.type === 'success' ? 'fa-circle-check' : 'fa-bell'}`}></i></div>
             <div><p className="font-black text-[10px] uppercase tracking-widest">{n.title}</p><p className="text-xs font-medium mt-1 opacity-80">{n.message}</p></div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slideUp 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-in { animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>
    </div>
  );
};

export default App;
