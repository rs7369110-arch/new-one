
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserRole, User, Student, Notice, Homework, AttendanceRecord, TeacherAssignment, FoodItem, MarksRecord, CurriculumItem, SchoolMessage, GalleryItem, AdminActivity, LeaveRequest, FeeStructure, CustomProfileTemplate, Language, FeeTransaction, SchoolBranding, DEFAULT_BRANDING, AccessPermissions, Subject, TimetableEntry } from './types';
import { storage, DB_KEYS } from './db';
import { dbService, supabase } from './services/supabase';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Sidebar, { DEFAULT_MENU_ITEMS } from './components/Sidebar';
import StudentManagement from './components/StudentManagement';
import CancelledStudents from './components/CancelledStudents';
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
import AccessControl from './components/AccessControl';
import SchoolSetup from './components/SchoolSetup';

const DEFAULT_FOOD_CHART: FoodItem[] = [
  { day: 'Monday', breakfast: 'Milk & Poha', breakfastPrice: 20, lunch: 'Dal Fry & Rice', lunchPrice: 40 },
  { day: 'Tuesday', breakfast: 'Banana & Cookies', breakfastPrice: 15, lunch: 'Aloo Paratha & Curd', lunchPrice: 45 },
  { day: 'Wednesday', breakfast: 'Sprouted Salad', breakfastPrice: 25, lunch: 'Mix Veg & Roti', lunchPrice: 40 },
  { day: 'Thursday', breakfast: 'Upma', breakfastPrice: 20, lunch: 'Rajma & Chawal', lunchPrice: 50 },
  { day: 'Friday', breakfast: 'Apple & Toast', breakfastPrice: 30, lunch: 'Paneer Masala & Nan', lunchPrice: 60 },
  { day: 'Saturday', breakfast: 'Idli Sambar', breakfastPrice: 35, lunch: 'Kadhi & Rice', lunchPrice: 40 },
];

const DEFAULT_SUBJECTS = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Computer'];

const DEFAULT_PERMISSIONS: AccessPermissions = {
  [UserRole.TEACHER]: ['attendance', 'students', 'homework', 'exam-entry', 'marksheet', 'leaves', 'messages', 'gallery', 'curriculum', 'food', 'certs'],
  [UserRole.STUDENT]: ['attendance', 'fees', 'notices', 'homework', 'marksheet', 'messages', 'gallery', 'curriculum', 'food'],
  [UserRole.PARENT]: ['attendance', 'fees', 'notices', 'homework', 'marksheet', 'messages', 'gallery', 'curriculum', 'food']
};

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'sync';
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [currentLang, setCurrentLang] = useState<Language>(storage.get(DB_KEYS.LANGUAGE as any, Language.EN));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [schoolBranding, setSchoolBranding] = useState<SchoolBranding>(storage.get(DB_KEYS.SCHOOL_BRANDING, DEFAULT_BRANDING));
  const [permissions, setPermissions] = useState<AccessPermissions>(storage.get(DB_KEYS.ACCESS_PERMISSIONS, DEFAULT_PERMISSIONS));
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
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastViewed, setLastViewed] = useState<Record<string, number>>(storage.get(DB_KEYS.LAST_VIEWED, {}));

  const triggerNotification = useCallback((title: string, message: string, type: Notification['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotif = { id, title, message, type };
    setNotifications(prev => [newNotif, ...prev]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  const addActivity = useCallback(async (actionType: AdminActivity['actionType'], module: string, target: string, details?: string) => {
    if (!currentUser) return;
    const newActivity: AdminActivity = {
      id: Math.random().toString(36).substr(2, 9),
      adminName: currentUser.name,
      actionType,
      module,
      target,
      timestamp: new Date().toLocaleString(),
      details
    };
    setActivities(prev => [...prev, newActivity]);
    try {
      await dbService.upsert('activities', newActivity);
    } catch (err) {
      console.warn("Activity Sync Delayed");
    }
  }, [currentUser]);

  const syncAll = useCallback(async () => {
    try {
      setIsSyncing(true);
      const [
        sData, nData, hData, aData, tData, fData, mData, cData, msgData, galData, lData, fsData, ftData, ctData, subData, brandData, permData, subjData, ttData
      ] = await Promise.all([
        dbService.fetchAll('students'),
        dbService.fetchAll('notices'),
        dbService.fetchAll('homework'),
        dbService.fetchAll('attendance'),
        dbService.fetchAll('teachers'),
        dbService.fetchAll('food_chart'),
        dbService.fetchAll('marks'),
        dbService.fetchAll('curriculum'),
        dbService.fetchAll('messages'),
        dbService.fetchAll('gallery'),
        dbService.fetchAll('leaves'),
        dbService.fetchAll('fee_structures'),
        dbService.fetchAll('fee_transactions'),
        dbService.fetchAll('custom_templates'),
        dbService.fetchAll('subject_list'),
        dbService.fetchAll('school_branding'),
        dbService.fetchAll('access_permissions'),
        dbService.fetchAll('subjects'),
        dbService.fetchAll('timetable')
      ]);

      if (sData.length) { setStudents(sData); storage.set(DB_KEYS.STUDENTS, sData); }
      if (nData.length) { setNotices(nData); storage.set(DB_KEYS.NOTICES, nData); }
      if (hData.length) { setHomeworks(hData); storage.set(DB_KEYS.HOMEWORK, hData); }
      if (aData.length) { setAttendance(aData); storage.set(DB_KEYS.ATTENDANCE, aData); }
      if (tData.length) { setTeachers(tData); storage.set(DB_KEYS.TEACHERS, tData); }
      if (fData.length) { setFoodChart(fData); storage.set(DB_KEYS.FOOD_CHART, fData); }
      if (galData.length) { setGallery(galData); storage.set(DB_KEYS.GALLERY, galData); }
      if (brandData) { setSchoolBranding(brandData as any); storage.set(DB_KEYS.SCHOOL_BRANDING, brandData); }
      if (permData) { setPermissions(permData as any); storage.set(DB_KEYS.ACCESS_PERMISSIONS, permData); }
      if (subjData.length) { setSubjects(subjData); storage.set(DB_KEYS.SUBJECTS, subjData); }
      if (ttData.length) { setTimetable(ttData); storage.set(DB_KEYS.TIMETABLE, ttData); }
      
      setIsSyncing(false);
    } catch (err) {
      console.error("Master Sync Failure:", err);
      setIsSyncing(false);
    }
  }, []);

  // Initial Data Load & Real-time Listeners
  useEffect(() => {
    const savedUser = storage.get<User | null>(DB_KEYS.USER, null);
    if (savedUser) setCurrentUser(savedUser);

    // Initial Load from Cache
    setStudents(storage.get(DB_KEYS.STUDENTS, []));
    setNotices(storage.get(DB_KEYS.NOTICES, []));
    setHomeworks(storage.get(DB_KEYS.HOMEWORK, []));
    setAttendance(storage.get(DB_KEYS.ATTENDANCE, []));
    setTeachers(storage.get(DB_KEYS.TEACHERS, []));
    setGallery(storage.get(DB_KEYS.GALLERY, []));
    setAvailableSubjects(storage.get(DB_KEYS.SUBJECT_LIST, DEFAULT_SUBJECTS));

    // Initial Fetch from Cloud
    syncAll();

    // SETUP REAL-TIME LISTENERS
    const studentSub = dbService.subscribe('students', (p) => { if (p.eventType === 'DELETE') { setStudents(prev => prev.filter(s => s.id !== p.old.id)); } else { syncAll(); } });
    const teacherSub = dbService.subscribe('teachers', (p) => syncAll());
    const noticeSub = dbService.subscribe('notices', (p) => syncAll());
    const homeworkSub = dbService.subscribe('homework', (p) => syncAll());
    const gallerySub = dbService.subscribe('gallery', (p) => syncAll());

    // Auto-Reconnect on Network Recovery
    window.addEventListener('online', syncAll);

    return () => {
      studentSub.unsubscribe();
      teacherSub.unsubscribe();
      noticeSub.unsubscribe();
      homeworkSub.unsubscribe();
      gallerySub.unsubscribe();
      window.removeEventListener('online', syncAll);
    };
  }, [syncAll]);

  const updateViewedStamp = (tab: string) => {
    const newStamps = { ...lastViewed, [tab]: Date.now() };
    setLastViewed(newStamps);
    storage.set(DB_KEYS.LAST_VIEWED, newStamps);
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  // Optimized Sync Helper (Optimistic UI)
  const createSyncUpdate = <T,>(key: string, table: string, setter: React.Dispatch<React.SetStateAction<T>>) => {
    return async (newData: T) => {
      // 1. Update UI & Local Cache immediately
      setter(newData);
      storage.set(key, newData);
      setIsSyncing(true);

      // 2. Fire and Forget (mostly) to Supabase
      try {
        const success = await dbService.upsert(table, newData);
        if (!success) throw new Error("Cloud rejected update");
        setIsSyncing(false);
      } catch (err) {
        setIsSyncing(false);
        triggerNotification('Cloud Sync Delayed', 'Your changes are saved locally but cloud sync failed. We will retry automatically.', 'sync');
      }
    };
  };

  const createSyncDelete = <T,>(key: string, table: string, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    return async (id: string) => {
      // 1. Instant local removal
      setter(prev => prev.filter((item: any) => item.id !== id));
      const currentLocal = storage.get<T[]>(key, []);
      storage.set(key, currentLocal.filter((item: any) => item.id !== id));
      
      setIsSyncing(true);
      try {
        await dbService.delete(table, id);
        setIsSyncing(false);
      } catch (err) {
        setIsSyncing(false);
        console.error("Delete Sync Failed");
      }
    };
  };

  // Master Update Functions
  const updateNotices = createSyncUpdate(DB_KEYS.NOTICES, 'notices', setNotices);
  const updateStudents = createSyncUpdate(DB_KEYS.STUDENTS, 'students', setStudents);
  const updateTeachers = createSyncUpdate(DB_KEYS.TEACHERS, 'teachers', setTeachers);
  const updateFoodChart = createSyncUpdate(DB_KEYS.FOOD_CHART, 'food_chart', setFoodChart);
  const updateMarks = createSyncUpdate(DB_KEYS.MARKS, 'marks', setMarks);
  const updateAvailableSubjects = createSyncUpdate(DB_KEYS.SUBJECT_LIST, 'subject_list', setAvailableSubjects); 
  const updateCurriculum = createSyncUpdate(DB_KEYS.CURRICULUM, 'curriculum', setCurriculum);
  const updateMessages = createSyncUpdate(DB_KEYS.MESSAGES, 'messages', setMessages);
  const updateGallery = createSyncUpdate(DB_KEYS.GALLERY, 'gallery', setGallery);
  const updateLeaves = createSyncUpdate(DB_KEYS.LEAVES, 'leaves', setLeaves);
  const updateAttendance = createSyncUpdate(DB_KEYS.ATTENDANCE, 'attendance', setAttendance);
  const updateHomework = createSyncUpdate(DB_KEYS.HOMEWORK, 'homework', setHomeworks);
  const updateFeeStructures = createSyncUpdate(DB_KEYS.FEE_STRUCTURES, 'fee_structures', setFeeStructures);
  const updateFeeTransactions = createSyncUpdate(DB_KEYS.FEE_TRANSACTIONS, 'fee_transactions', setFeeTransactions);
  const updateCustomTemplates = createSyncUpdate(DB_KEYS.CUSTOM_TEMPLATES, 'custom_templates', setCustomTemplates);
  const updateSchoolBranding = createSyncUpdate(DB_KEYS.SCHOOL_BRANDING, 'school_branding', setSchoolBranding);
  const updatePermissions = createSyncUpdate(DB_KEYS.ACCESS_PERMISSIONS, 'access_permissions', setPermissions);
  const updateSubjects = createSyncUpdate(DB_KEYS.SUBJECTS, 'subjects', setSubjects);
  const updateTimetable = createSyncUpdate(DB_KEYS.TIMETABLE, 'timetable', setTimetable);

  // Deletion Hooks
  const deleteHomework = createSyncDelete(DB_KEYS.HOMEWORK, 'homework', setHomeworks);
  const deleteStudent = createSyncDelete(DB_KEYS.STUDENTS, 'students', setStudents);
  const deleteNotice = createSyncDelete(DB_KEYS.NOTICES, 'notices', setNotices);
  const deleteGalleryItem = createSyncDelete(DB_KEYS.GALLERY, 'gallery', setGallery);
  const deleteTeacher = createSyncDelete(DB_KEYS.TEACHERS, 'teachers', setTeachers);

  if (!currentUser) return <Login onLogin={(user) => { setCurrentUser(user); storage.set(DB_KEYS.USER, user); }} />;

  const renderContent = () => {
    const activeStudents = students.filter(s => s.status !== 'CANCELLED');

    switch (activeTab) {
      case 'dashboard': return <Dashboard user={currentUser} students={activeStudents} notices={notices} onUpdateNotices={updateNotices} homeworks={homeworks} onUpdateHomework={updateHomework} attendance={attendance} teachers={teachers} onUpdateTeachers={updateTeachers} isDarkMode={isDarkMode} lang={currentLang} branding={schoolBranding} onUpdateBranding={updateSchoolBranding} setActiveTab={updateViewedStamp} />;
      case 'school-setup': return <SchoolSetup subjects={subjects} onUpdateSubjects={updateSubjects} timetable={timetable} onUpdateTimetable={updateTimetable} teachers={teachers} onLogActivity={addActivity} />;
      case 'access-control': return <AccessControl permissions={permissions} onUpdatePermissions={updatePermissions} menuItems={DEFAULT_MENU_ITEMS} />;
      case 'fee-reports': return <FeeReports students={activeStudents} transactions={feeTransactions} />;
      case 'custom-builder': return <CustomProfileBuilder templates={customTemplates} onUpdateTemplates={updateCustomTemplates} students={activeStudents} />;
      case 'leaves': return <LeaveManagement user={currentUser} leaves={leaves} onUpdateLeaves={updateLeaves} onLogActivity={addActivity} />;
      case 'messages': return <MessageManager user={currentUser} messages={messages} onUpdateMessages={updateMessages} />;
      case 'gallery': return <GalleryManager user={currentUser} gallery={gallery} onUpdateGallery={updateGallery} onDeleteItem={deleteGalleryItem} isDarkMode={isDarkMode} onLogActivity={addActivity} />;
      case 'students': return <StudentManagement user={currentUser} students={students} setStudents={updateStudents} onDelete={deleteStudent} onLogActivity={addActivity} />;
      case 'cancelled-students': return <CancelledStudents user={currentUser} students={students} onUpdateStudents={updateStudents} onLogActivity={addActivity} />;
      case 'student-reports': return <StudentReports students={activeStudents} attendance={attendance} branding={schoolBranding} teachers={teachers} />;
      case 'exam-entry': return <ExamEntry user={currentUser} students={activeStudents} marks={marks} onUpdateMarks={updateMarks} availableSubjects={availableSubjects} teachers={teachers} />;
      case 'teachers': return <TeacherManagement teachers={teachers} setTeachers={updateTeachers} onLogActivity={addActivity} onDeleteTeacher={deleteTeacher} />;
      case 'food': return <FoodChart user={currentUser} foodChart={foodChart} onUpdateFoodChart={updateFoodChart} />;
      case 'curriculum': return <CurriculumManager user={currentUser} curriculum={curriculum} onUpdateCurriculum={updateCurriculum} onLogActivity={addActivity} />;
      case 'marksheet': return <MarksheetManager user={currentUser} students={activeStudents} marks={marks} onUpdateMarks={updateMarks} availableSubjects={availableSubjects} onUpdateSubjects={updateAvailableSubjects} branding={schoolBranding} />;
      case 'certs': return <CertificateHub students={activeStudents} branding={schoolBranding} />;
      case 'attendance': return <Attendance user={currentUser} students={activeStudents} attendance={attendance} setAttendance={updateAttendance} />;
      case 'notices': return <NoticeBoard user={currentUser} notices={notices} setNotices={updateNotices} students={activeStudents} onLogActivity={addActivity} onDeleteNotice={deleteNotice} />;
      case 'homework': return <HomeworkManager user={currentUser} homeworks={homeworks} setHomeworks={updateHomework} onDelete={deleteHomework} students={activeStudents} onLogActivity={addActivity} />;
      case 'fees': return <FeesManager user={currentUser} students={activeStudents} setStudents={updateStudents} feeStructures={feeStructures} onUpdateFeeStructures={updateFeeStructures} transactions={feeTransactions} onUpdateTransactions={updateFeeTransactions} onLogActivity={addActivity} />;
      case 'fees-setup': return <FeesManager user={currentUser} students={activeStudents} setStudents={updateStudents} feeStructures={feeStructures} onUpdateFeeStructures={updateFeeStructures} transactions={feeTransactions} onUpdateTransactions={updateFeeTransactions} initialMode="SETUP" onLogActivity={addActivity} />;
      case 'icards': return <ICardGenerator students={activeStudents} user={currentUser} branding={schoolBranding} />;
      default: return <Dashboard user={currentUser} students={activeStudents} notices={notices} onUpdateNotices={updateNotices} homeworks={homeworks} onUpdateHomework={updateHomework} attendance={attendance} teachers={teachers} onUpdateTeachers={updateTeachers} isDarkMode={isDarkMode} lang={currentLang} branding={schoolBranding} onUpdateBranding={updateSchoolBranding} setActiveTab={updateViewedStamp} />;
    }
  };

  return (
    <div className={`flex flex-col md:flex-row h-screen h-[100dvh] overflow-hidden relative transition-colors duration-500 ${isDarkMode ? 'bg-[#0a0a0c] text-slate-100' : 'bg-[#f8faff] text-slate-800'}`}>
      {isSyncing && (
        <div className="fixed top-4 right-4 z-[6000] bg-indigo-600 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 animate-pulse border border-indigo-400 scale-75 md:scale-100">
           <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
           <span className="text-[10px] font-black uppercase tracking-widest">Auto Sync</span>
        </div>
      )}

      {/* Notifications Portal */}
      <div className="fixed top-16 right-4 z-[7000] flex flex-col gap-2 w-full max-w-[280px]">
         {notifications.map(n => (
           <div key={n.id} className={`p-4 rounded-2xl shadow-2xl border-l-4 animate-fade-in ${isDarkMode ? 'bg-[#1e293b] border-indigo-500 text-white' : 'bg-white border-indigo-500 text-slate-800 shadow-indigo-900/10'}`}>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{n.title}</p>
              <p className="text-[11px] font-bold mt-1 opacity-80">{n.message}</p>
           </div>
         ))}
      </div>

      {/* Mobile Nav Header */}
      <div className={`md:hidden flex items-center justify-between px-6 py-4 border-b shrink-0 z-[2000] ${isDarkMode ? 'bg-[#0f172a] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
         <div className="flex items-center gap-3">
            <button 
               onClick={() => setIsSidebarOpen(true)}
               className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${isDarkMode ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-600'}`}
            >
               <i className="fa-solid fa-bars-staggered"></i>
            </button>
            <div className="flex flex-col">
               <span className={`font-black text-xs tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{(schoolBranding?.name || 'DIGITAL CORE').toUpperCase()}</span>
               <span className={`text-[7px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Academy Node</span>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${isDarkMode ? 'text-amber-400 bg-amber-400/10' : 'text-indigo-600 bg-indigo-50'}`}>
               <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
         </div>
      </div>

      <Sidebar 
        role={currentUser.role} 
        activeTab={activeTab} 
        setActiveTab={updateViewedStamp} 
        onLogout={() => { setCurrentUser(null); storage.clear(DB_KEYS.USER); }} 
        userName={currentUser.name} 
        isDarkMode={isDarkMode} 
        toggleTheme={() => setIsDarkMode(!isDarkMode)} 
        unreadCounts={{notices:0, messages:0, gallery:0, leaves:0}} 
        currentLang={currentLang} 
        toggleLanguage={() => setCurrentLang(currentLang === Language.EN ? Language.GU : Language.EN)} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        branding={schoolBranding}
        onUpdateBranding={updateSchoolBranding}
        permissions={permissions}
      />
      
      <main className="flex-1 overflow-y-auto mobile-scroll relative z-10 custom-scrollbar p-4 md:p-12">
        <div className="max-w-7xl mx-auto pb-24 md:pb-10">{renderContent()}</div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-[4000] flex items-center justify-around px-4 py-3 border-t backdrop-blur-xl ${isDarkMode ? 'bg-[#0a0a0c]/90 border-white/5' : 'bg-white/90 border-slate-100 shadow-up'}`}>
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 flex-1 ${activeTab === 'dashboard' ? 'text-indigo-500' : 'text-slate-400'}`}>
           <i className="fa-solid fa-house-chimney text-lg"></i>
           <span className="text-[9px] font-black uppercase">Home</span>
        </button>
        <button onClick={() => setActiveTab('attendance')} className={`flex flex-col items-center gap-1 flex-1 ${activeTab === 'attendance' ? 'text-indigo-500' : 'text-slate-400'}`}>
           <i className="fa-solid fa-calendar-check text-lg"></i>
           <span className="text-[9px] font-black uppercase">Attend</span>
        </button>
        <button onClick={() => setActiveTab('students')} className={`flex flex-col items-center gap-1 flex-1 ${activeTab === 'students' ? 'text-indigo-500' : 'text-slate-400'}`}>
           <i className="fa-solid fa-user-plus text-lg"></i>
           <span className="text-[9px] font-black uppercase">Students</span>
        </button>
        <button onClick={() => setIsSidebarOpen(true)} className="flex flex-col items-center gap-1 flex-1 text-slate-400">
           <i className="fa-solid fa-ellipsis text-lg"></i>
           <span className="text-[9px] font-black uppercase">Menu</span>
        </button>
      </div>

      <style>{`
        .shadow-up { box-shadow: 0 -4px 12px rgba(0,0,0,0.05); }
      `}</style>
    </div>
  );
};

export default App;
