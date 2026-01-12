
import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, User, Student, Notice, Homework, AttendanceRecord, TeacherAssignment, FoodItem, MarksRecord, CurriculumItem, SchoolMessage, GalleryItem, AdminActivity, LeaveRequest, FeeStructure, CustomProfileTemplate, Language, FeeTransaction } from './types';
import { storage, DB_KEYS } from './db';
import { dbService } from './services/supabase';
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
  type: 'success' | 'error' | 'info' | 'broadcast' | 'notice' | 'gallery' | 'sync';
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [currentLang, setCurrentLang] = useState<Language>(storage.get(DB_KEYS.LANGUAGE as any, Language.EN));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
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

  const triggerNotification = useCallback((title: string, message: string, type: Notification['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotif = { id, title, message, type };
    setNotifications(prev => [newNotif, ...prev]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4500);
  }, []);

  // INITIAL LOAD & SYNC
  useEffect(() => {
    const savedUser = storage.get<User | null>(DB_KEYS.USER, null);
    if (savedUser) setCurrentUser(savedUser);

    // 1. Load from LocalStorage (Instant UI)
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

    // 2. Fetch from Supabase in Background
    const syncAll = async () => {
      try {
        setIsSyncing(true);
        const [
          sData, nData, hData, aData, tData, fData, mData, cData, msgData, galData, lData, fsData, ftData, ctData, subData, actData
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
          dbService.fetchAll('activities')
        ]);

        if (sData.length) { setStudents(sData); storage.set(DB_KEYS.STUDENTS, sData); }
        if (nData.length) { setNotices(nData); storage.set(DB_KEYS.NOTICES, nData); }
        if (hData.length) { setHomeworks(hData); storage.set(DB_KEYS.HOMEWORK, hData); }
        if (aData.length) { setAttendance(aData); storage.set(DB_KEYS.ATTENDANCE, aData); }
        if (tData.length) { setTeachers(tData); storage.set(DB_KEYS.TEACHERS, tData); }
        if (fData.length) { setFoodChart(fData); storage.set(DB_KEYS.FOOD_CHART, fData); }
        if (mData.length) { setMarks(mData); storage.set(DB_KEYS.MARKS, mData); }
        if (cData.length) { setCurriculum(cData); storage.set(DB_KEYS.CURRICULUM, cData); }
        if (msgData.length) { setMessages(msgData); storage.set(DB_KEYS.MESSAGES, msgData); }
        if (galData.length) { setGallery(galData); storage.set(DB_KEYS.GALLERY, galData); }
        if (lData.length) { setLeaves(lData); storage.set(DB_KEYS.LEAVES, lData); }
        if (fsData.length) { setFeeStructures(fsData); storage.set(DB_KEYS.FEE_STRUCTURES, fsData); }
        if (ftData.length) { setFeeTransactions(ftData); storage.set(DB_KEYS.FEE_TRANSACTIONS, ftData); }
        if (ctData.length) { setCustomTemplates(ctData); storage.set(DB_KEYS.CUSTOM_TEMPLATES, ctData); }
        if (subData.length) { setAvailableSubjects(subData); storage.set(DB_KEYS.SUBJECT_LIST, subData); }
        if (actData.length) { setActivities(actData); storage.set(DB_KEYS.ACTIVITY_LOG, actData); }
        
        setIsSyncing(false);
      } catch (err) {
        console.warn("Sync failed. Using local storage.", err);
        setIsSyncing(false);
      }
    };

    syncAll();
  }, []);

  const updateViewedStamp = (tab: string) => {
    const newStamps = { ...lastViewed, [tab]: Date.now() };
    setLastViewed(newStamps);
    storage.set(DB_KEYS.LAST_VIEWED, newStamps);
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  const createSyncUpdate = <T,>(key: string, table: string, setter: React.Dispatch<React.SetStateAction<T>>) => {
    return async (newData: T) => {
      setter(newData);
      storage.set(key, newData);
      try {
        await dbService.upsert(table, newData);
      } catch (err) {
        console.error(`Sync Error [${table}]:`, err);
        triggerNotification('Sync Delayed', 'Changes saved locally. Cloud sync pending.', 'info');
      }
    };
  };

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
  const updateActivities = createSyncUpdate(DB_KEYS.ACTIVITY_LOG, 'activities', setActivities);

  if (!currentUser) return <Login onLogin={(user) => { setCurrentUser(user); storage.set(DB_KEYS.USER, user); }} />;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard user={currentUser} students={students} notices={notices} homeworks={homeworks} attendance={attendance} teachers={teachers} onUpdateTeachers={updateTeachers} isDarkMode={isDarkMode} lang={currentLang} />;
      case 'fee-reports': return <FeeReports students={students} transactions={feeTransactions} />;
      case 'custom-builder': return <CustomProfileBuilder templates={customTemplates} onUpdateTemplates={updateCustomTemplates} students={students} />;
      case 'leaves': return <LeaveManagement user={currentUser} leaves={leaves} onUpdateLeaves={updateLeaves} />;
      case 'messages': return <MessageManager user={currentUser} messages={messages} onUpdateMessages={updateMessages} />;
      case 'gallery': return <GalleryManager user={currentUser} gallery={gallery} onUpdateGallery={updateGallery} isDarkMode={isDarkMode} />;
      case 'activity': return <ActivityReport activities={activities} onClearLog={() => updateActivities([])} />;
      case 'students': return <StudentManagement students={students} setStudents={updateStudents} />;
      case 'student-reports': return <StudentReports students={students} attendance={attendance} />;
      case 'exam-entry': return <ExamEntry user={currentUser} students={students} marks={marks} onUpdateMarks={updateMarks} availableSubjects={availableSubjects} teachers={teachers} />;
      case 'teachers': return <TeacherManagement teachers={teachers} setTeachers={updateTeachers} />;
      case 'food': return <FoodChart user={currentUser} foodChart={foodChart} onUpdateFoodChart={updateFoodChart} />;
      case 'curriculum': return <CurriculumManager user={currentUser} curriculum={curriculum} onUpdateCurriculum={updateCurriculum} />;
      case 'marksheet': return <MarksheetManager user={currentUser} students={students} marks={marks} onUpdateMarks={updateMarks} availableSubjects={availableSubjects} onUpdateSubjects={updateAvailableSubjects} />;
      case 'certs': return <CertificateHub students={students} />;
      case 'attendance': return <Attendance user={currentUser} students={students} attendance={attendance} setAttendance={updateAttendance} />;
      case 'notices': return <NoticeBoard user={currentUser} notices={notices} setNotices={updateNotices} students={students} />;
      case 'homework': return <HomeworkManager user={currentUser} homeworks={homeworks} setHomeworks={updateHomework} />;
      case 'fees': return <FeesManager user={currentUser} students={students} setStudents={updateStudents} feeStructures={feeStructures} onUpdateFeeStructures={updateFeeStructures} transactions={feeTransactions} onUpdateTransactions={updateFeeTransactions} />;
      case 'fees-setup': return <FeesManager user={currentUser} students={students} setStudents={updateStudents} feeStructures={feeStructures} onUpdateFeeStructures={updateFeeStructures} transactions={feeTransactions} onUpdateTransactions={updateFeeTransactions} initialMode="SETUP" />;
      case 'icards': return <ICardGenerator students={students} user={currentUser} />;
      default: return <Dashboard user={currentUser} students={students} notices={notices} homeworks={homeworks} attendance={attendance} teachers={teachers} onUpdateTeachers={updateTeachers} isDarkMode={isDarkMode} lang={currentLang} />;
    }
  };

  return (
    <div className={`flex flex-col md:flex-row h-screen overflow-hidden relative transition-colors duration-500 ${isDarkMode ? 'bg-[#0a0a0c] text-slate-100' : 'bg-[#f8faff] text-slate-800'}`}>
      {isSyncing && (
        <div className="fixed top-24 right-6 z-[6000] bg-indigo-600 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 animate-bounce border border-indigo-400">
           <i className="fa-solid fa-cloud-arrow-down text-xs"></i>
           <span className="text-[10px] font-black uppercase tracking-widest">Syncing Cloud</span>
        </div>
      )}

      <Sidebar role={currentUser.role} activeTab={activeTab} setActiveTab={updateViewedStamp} onLogout={() => { setCurrentUser(null); storage.clear(DB_KEYS.USER); }} userName={currentUser.name} isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} unreadCounts={{notices:0, messages:0, gallery:0, leaves:0}} currentLang={currentLang} toggleLanguage={() => setCurrentLang(currentLang === Language.EN ? Language.GU : Language.EN)} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-12 relative z-10 custom-scrollbar">
        <div className="max-w-7xl mx-auto">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
