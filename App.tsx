
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
import StudentDirectory from './components/StudentDirectory';

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
  [UserRole.TEACHER]: ['attendance', 'students', 'homework', 'exam-entry', 'marksheet', 'leaves', 'messages', 'gallery', 'curriculum', 'food', 'certs', 'student-search'],
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [schoolBranding, setSchoolBranding] = useState<SchoolBranding>(storage.get(DB_KEYS.SCHOOL_BRANDING, DEFAULT_BRANDING));
  const [permissions, setPermissions] = useState<AccessPermissions>(storage.get(DB_KEYS.ACCESS_PERMISSIONS, DEFAULT_PERMISSIONS));
  const [students, setStudents] = useState<Student[]>(storage.get(DB_KEYS.STUDENTS, []));
  const [notices, setNotices] = useState<Notice[]>(storage.get(DB_KEYS.NOTICES, []));
  const [homeworks, setHomeworks] = useState<Homework[]>(storage.get(DB_KEYS.HOMEWORK, []));
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(storage.get(DB_KEYS.ATTENDANCE, []));
  const [teachers, setTeachers] = useState<TeacherAssignment[]>(storage.get(DB_KEYS.TEACHERS, []));
  const [foodChart, setFoodChart] = useState<FoodItem[]>(storage.get(DB_KEYS.FOOD_CHART, DEFAULT_FOOD_CHART));
  const [marks, setMarks] = useState<MarksRecord[]>([]);
  const [curriculum, setCurriculum] = useState<CurriculumItem[]>([]);
  const [messages, setMessages] = useState<SchoolMessage[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>(storage.get(DB_KEYS.SUBJECT_LIST, DEFAULT_SUBJECTS));
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [customTemplates, setCustomTemplates] = useState<CustomProfileTemplate[]>([]);
  const [feeTransactions, setFeeTransactions] = useState<FeeTransaction[]>(storage.get(DB_KEYS.FEE_TRANSACTIONS, []));
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastViewed, setLastViewed] = useState<Record<string, number>>(storage.get(DB_KEYS.LAST_VIEWED, {}));

  useEffect(() => {
    storage.clear(DB_KEYS.USER);
  }, []);

  const triggerNotification = useCallback((title: string, message: string, type: Notification['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [{ id, title, message, type }, ...prev]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    storage.clear(DB_KEYS.USER);
  }, []);

  const toCamelCase = (obj: any) => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
    const result: any = {};
    for (const key in obj) {
      const camelKey = key.replace(/([-_][a-z])/gi, ($1) => $1.toUpperCase().replace('-', '').replace('_', ''));
      result[camelKey] = obj[key];
    }
    return result;
  };

  const syncAll = useCallback(async () => {
    if (!navigator.onLine || !currentUser) return;
    
    try {
      setIsSyncing(true);
      const results = await Promise.allSettled([
        dbService.fetchAll('students'), dbService.fetchAll('notices'), dbService.fetchAll('homework'),
        dbService.fetchAll('attendance'), dbService.fetchAll('teachers'), dbService.fetchAll('food_chart'),
        dbService.fetchAll('marks'), dbService.fetchAll('curriculum'), dbService.fetchAll('messages'),
        dbService.fetchAll('gallery'), dbService.fetchAll('leaves'), dbService.fetchAll('fee_structures'),
        dbService.fetchAll('fee_transactions'), dbService.fetchAll('custom_templates'), dbService.fetchAll('subject_list'),
        dbService.fetchAll('school_branding'), dbService.fetchAll('access_permissions'), dbService.fetchAll('master_subjects'),
        dbService.fetchAll('master_timetable'), dbService.fetchAll('activities')
      ]);

      const getValidData = (idx: number) => {
        const res = results[idx];
        return (res.status === 'fulfilled' && res.value !== null) ? res.value : null;
      };

      const sData = getValidData(0); if (sData) { setStudents(sData); storage.set(DB_KEYS.STUDENTS, sData); }
      const nData = getValidData(1); if (nData) { setNotices(nData); storage.set(DB_KEYS.NOTICES, nData); }
      const hData = getValidData(2); if (hData) { setHomeworks(hData); storage.set(DB_KEYS.HOMEWORK, hData); }
      const aData = getValidData(3); if (aData) { setAttendance(aData); storage.set(DB_KEYS.ATTENDANCE, aData); }
      const tData = getValidData(4); if (tData) { setTeachers(tData); storage.set(DB_KEYS.TEACHERS, tData); }
      const fData = getValidData(5); if (fData) { setFoodChart(fData.length ? fData : DEFAULT_FOOD_CHART); storage.set(DB_KEYS.FOOD_CHART, fData); }
      const mData = getValidData(6); if (mData) setMarks(mData);
      const cData = getValidData(7); if (cData) setCurriculum(cData);
      const msgData = getValidData(8); if (msgData) setMessages(msgData);
      const galData = getValidData(9); if (galData) setGallery(galData);
      const lData = getValidData(10); if (lData) setLeaves(lData);
      const fsData = getValidData(11); if (fsData) setFeeStructures(fsData);
      const ftData = getValidData(12); if (ftData) { setFeeTransactions(ftData); storage.set(DB_KEYS.FEE_TRANSACTIONS, ftData); }
      const ctData = getValidData(13); if (ctData) setCustomTemplates(ctData);
      const subData = getValidData(14); if (subData) { setAvailableSubjects(subData.length ? subData : DEFAULT_SUBJECTS); storage.set(DB_KEYS.SUBJECT_LIST, subData); }
      const brandData = getValidData(15); if (brandData && brandData.length) { setSchoolBranding(brandData[0]); storage.set(DB_KEYS.SCHOOL_BRANDING, brandData[0]); }
      const permData = getValidData(16); if (permData && permData.length) { setPermissions(permData[0]); storage.set(DB_KEYS.ACCESS_PERMISSIONS, permData[0]); }
      const subjData = getValidData(17); if (subjData) setSubjects(subjData);
      const ttData = getValidData(18); if (ttData) setTimetable(ttData);
      const actData = getValidData(19); if (actData) setActivities(actData);
      
      setIsSyncing(false);
      setIsOnline(true);
    } catch (err) {
      setIsSyncing(false);
    }
  }, [currentUser]);

  const handleRealtimeUpdate = useCallback((table: string, payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    const item = toCamelCase(newRecord);
    const oldItem = toCamelCase(oldRecord);
    
    const setters: Record<string, [any[], React.Dispatch<React.SetStateAction<any[]>>, string]> = {
      'students': [students, setStudents, DB_KEYS.STUDENTS],
      'notices': [notices, setNotices, DB_KEYS.NOTICES],
      'homework': [homeworks, setHomeworks, DB_KEYS.HOMEWORK],
      'attendance': [attendance, setAttendance, DB_KEYS.ATTENDANCE],
      'teachers': [teachers, setTeachers, DB_KEYS.TEACHERS],
      'messages': [messages, setMessages, DB_KEYS.MESSAGES],
      'gallery': [gallery, setGallery, DB_KEYS.GALLERY],
      'curriculum': [curriculum, setCurriculum, DB_KEYS.CURRICULUM],
      'leaves': [leaves, setLeaves, DB_KEYS.LEAVES],
      'fee_transactions': [feeTransactions, setFeeTransactions, DB_KEYS.FEE_TRANSACTIONS],
      'activities': [activities, setActivities, DB_KEYS.ACTIVITY_LOG]
    };

    if (setters[table]) {
      const [state, setter, storageKey] = setters[table];
      let newState = [...state];

      if (eventType === 'INSERT') {
        newState = [item, ...newState];
      } else if (eventType === 'UPDATE') {
        newState = newState.map(i => {
           if (table === 'attendance') return (i.studentId === item.studentId && i.date === item.date) ? item : i;
           if (table === 'food_chart') return i.day === item.day ? item : i;
           return i.id === item.id ? item : i;
        });
      } else if (eventType === 'DELETE') {
        const oldPk = String(oldItem.id || oldItem.day || oldItem.grade);
        newState = newState.filter(i => {
           const currentPk = String(i.id || i.day || i.grade);
           if (table === 'attendance' && oldItem.studentId) {
             return !(String(i.studentId) === String(oldItem.studentId) && String(i.date) === String(oldItem.date));
           }
           return currentPk !== oldPk;
        });
        triggerNotification('Cloud Node Sync', `Database change updated on this device.`, 'sync');
      }

      setter(newState);
      storage.set(storageKey, newState);
    }
  }, [students, notices, homeworks, attendance, teachers, messages, gallery, curriculum, leaves, feeTransactions, activities, triggerNotification]);

  useEffect(() => {
    if (!currentUser) return;

    syncAll();
    const tables = ['students', 'notices', 'homework', 'attendance', 'teachers', 'messages', 'gallery', 'curriculum', 'leaves', 'activities', 'fee_transactions', 'school_branding', 'access_permissions', 'food_chart', 'subject_list'];
    const subs = tables.map(t => dbService.subscribe(t, (p) => handleRealtimeUpdate(t, p)));
    
    const handleConnectivityChange = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      if (online) syncAll();
    };

    window.addEventListener('online', handleConnectivityChange);
    window.addEventListener('offline', handleConnectivityChange);
    
    return () => {
      subs.forEach(s => s.unsubscribe());
      window.removeEventListener('online', handleConnectivityChange);
      window.removeEventListener('offline', handleConnectivityChange);
    };
  }, [currentUser, syncAll, handleRealtimeUpdate]);

  const addActivity = useCallback(async (actionType: AdminActivity['actionType'], module: string, target: string, details?: string) => {
    if (!currentUser) return;
    const newActivity: AdminActivity = {
      id: Date.now().toString(),
      adminName: currentUser.name, actionType, module, target,
      timestamp: new Date().toLocaleString(), details
    };
    dbService.upsert('activities', newActivity);
  }, [currentUser]);

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
      dbService.upsert(table, newData);
    };
  };

  // Special optimized update for attendance to avoid heavy whole-array upserts
  const upsertAttendanceRecord = async (record: AttendanceRecord) => {
    const updatedAttendance = attendance.map(a => 
      (a.studentId === record.studentId && a.date === record.date) ? record : a
    );
    
    const exists = attendance.some(a => a.studentId === record.studentId && a.date === record.date);
    const finalAttendance = exists ? updatedAttendance : [record, ...attendance];
    
    setAttendance(finalAttendance);
    storage.set(DB_KEYS.ATTENDANCE, finalAttendance);
    return await dbService.upsert('attendance', record); // Only sends ONE record to cloud
  };

  const createSyncDelete = <T,>(key: string, table: string, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    return async (id: string) => {
      setter(prev => prev.filter((item: any) => (String(item.id) !== String(id) && String(item.day) !== String(id))));
      const currentLocal = storage.get<T[]>(key, []);
      storage.set(key, currentLocal.filter((item: any) => (String(item.id) !== String(id) && String(item.day) !== String(id))));
      dbService.delete(table, id);
    };
  };

  const updateNotices = createSyncUpdate(DB_KEYS.NOTICES, 'notices', setNotices);
  const updateStudents = createSyncUpdate(DB_KEYS.STUDENTS, 'students', setStudents);
  const updateTeachers = createSyncUpdate(DB_KEYS.TEACHERS, 'teachers', setTeachers);
  const updateFoodChart = createSyncUpdate(DB_KEYS.FOOD_CHART, 'food_chart', setFoodChart);
  const updateMarks = createSyncUpdate(DB_KEYS.MARKS, 'marks', setMarks);
  const updateCurriculum = createSyncUpdate(DB_KEYS.CURRICULUM, 'curriculum', setCurriculum);
  const updateMessages = createSyncUpdate(DB_KEYS.MESSAGES, 'messages', setMessages);
  const updateGallery = createSyncUpdate(DB_KEYS.GALLERY, 'gallery', setGallery);
  const updateLeaves = createSyncUpdate(DB_KEYS.LEAVES, 'leaves', setLeaves);
  const updateAttendance = createSyncUpdate(DB_KEYS.ATTENDANCE, 'attendance', setAttendance);
  const updateHomework = createSyncUpdate(DB_KEYS.HOMEWORK, 'homework', setHomeworks);
  const updateFeeStructures = createSyncUpdate(DB_KEYS.FEE_STRUCTURES, 'fee_structures', setFeeStructures);
  const updateFeeTransactions = createSyncUpdate(DB_KEYS.FEE_TRANSACTIONS, 'fee_transactions', setFeeTransactions);
  const updateSchoolBranding = createSyncUpdate(DB_KEYS.SCHOOL_BRANDING, 'school_branding', setSchoolBranding);
  const updatePermissions = createSyncUpdate(DB_KEYS.ACCESS_PERMISSIONS, 'access_permissions', setPermissions);
  const updateSubjects = createSyncUpdate(DB_KEYS.SUBJECTS, 'master_subjects', setSubjects);
  const updateTimetable = createSyncUpdate(DB_KEYS.TIMETABLE, 'master_timetable', setTimetable);

  const deleteHomework = createSyncDelete(DB_KEYS.HOMEWORK, 'homework', setHomeworks);
  const deleteStudent = createSyncDelete(DB_KEYS.STUDENTS, 'students', setStudents);
  const deleteNotice = createSyncDelete(DB_KEYS.NOTICES, 'notices', setNotices);
  const deleteGalleryItem = createSyncDelete(DB_KEYS.GALLERY, 'gallery', setGallery);
  const deleteTeacher = createSyncDelete(DB_KEYS.TEACHERS, 'teachers', setTeachers);
  const deleteCurriculum = createSyncDelete(DB_KEYS.CURRICULUM, 'curriculum', setCurriculum);

  if (!currentUser) return <Login onLogin={(user) => { setCurrentUser(user); }} />;

  const renderContent = () => {
    const activeStudents = students.filter(s => s.status !== 'CANCELLED');
    switch (activeTab) {
      case 'dashboard': return <Dashboard user={currentUser} students={activeStudents} notices={notices} onUpdateNotices={updateNotices} homeworks={homeworks} onUpdateHomework={updateHomework} attendance={attendance} teachers={teachers} onUpdateTeachers={updateTeachers} isDarkMode={isDarkMode} lang={currentLang} branding={schoolBranding} onUpdateBranding={updateSchoolBranding} setActiveTab={updateViewedStamp} foodChart={foodChart} />;
      case 'student-search': return <StudentDirectory students={activeStudents} onSelectStudent={() => setActiveTab('students')} />;
      case 'school-setup': return <SchoolSetup subjects={subjects} onUpdateSubjects={updateSubjects} timetable={timetable} onUpdateTimetable={updateTimetable} teachers={teachers} onLogActivity={addActivity} />;
      case 'access-control': return <AccessControl permissions={permissions} onUpdatePermissions={updatePermissions} menuItems={DEFAULT_MENU_ITEMS} />;
      case 'fee-reports': return <FeeReports students={activeStudents} transactions={feeTransactions} />;
      case 'custom-builder': return <CustomProfileBuilder templates={customTemplates} onUpdateTemplates={createSyncUpdate(DB_KEYS.CUSTOM_TEMPLATES, 'custom_templates', setCustomTemplates)} students={activeStudents} />;
      case 'leaves': return <LeaveManagement user={currentUser} leaves={leaves} onUpdateLeaves={updateLeaves} onLogActivity={addActivity} />;
      case 'messages': return <MessageManager user={currentUser} messages={messages} onUpdateMessages={updateMessages} />;
      case 'gallery': return <GalleryManager user={currentUser} gallery={gallery} onUpdateGallery={updateGallery} onDeleteItem={deleteGalleryItem} isDarkMode={isDarkMode} onLogActivity={addActivity} />;
      case 'students': return <StudentManagement user={currentUser} students={students} setStudents={updateStudents} onDelete={deleteStudent} onLogActivity={addActivity} />;
      case 'cancelled-students': return <CancelledStudents user={currentUser} students={students} onUpdateStudents={updateStudents} onLogActivity={addActivity} />;
      case 'student-reports': return <StudentReports students={activeStudents} attendance={attendance} branding={schoolBranding} teachers={teachers} />;
      case 'exam-entry': return <ExamEntry user={currentUser} students={activeStudents} marks={marks} onUpdateMarks={updateMarks} availableSubjects={availableSubjects} teachers={teachers} />;
      case 'teachers': return <TeacherManagement teachers={teachers} setTeachers={updateTeachers} onLogActivity={addActivity} onDeleteTeacher={deleteTeacher} />;
      case 'food': return <FoodChart user={currentUser} foodChart={foodChart} onUpdateFoodChart={updateFoodChart} />;
      case 'curriculum': return <CurriculumManager user={currentUser} curriculum={curriculum} onUpdateCurriculum={updateCurriculum} onDeleteCurriculum={deleteCurriculum} onLogActivity={addActivity} />;
      /* Fixed typo in component name MarkshhetManager to MarksheetManager */
      case 'marksheet': return <MarksheetManager user={currentUser} students={activeStudents} marks={marks} onUpdateMarks={updateMarks} availableSubjects={availableSubjects} onUpdateSubjects={createSyncUpdate(DB_KEYS.SUBJECT_LIST, 'subject_list', setAvailableSubjects)} branding={schoolBranding} />;
      case 'certs': return <CertificateHub students={activeStudents} branding={schoolBranding} />;
      case 'attendance': return <Attendance user={currentUser} students={activeStudents} attendance={attendance} onUpsertRecord={upsertAttendanceRecord} />;
      case 'notices': return <NoticeBoard user={currentUser} notices={notices} setNotices={updateNotices} students={activeStudents} onLogActivity={addActivity} onDeleteNotice={deleteNotice} />;
      case 'homework': return <HomeworkManager user={currentUser} homeworks={homeworks} setHomeworks={updateHomework} onDelete={deleteHomework} students={activeStudents} onLogActivity={addActivity} />;
      case 'fees': return <FeesManager user={currentUser} students={activeStudents} setStudents={updateStudents} feeStructures={feeStructures} onUpdateFeeStructures={updateFeeStructures} transactions={feeTransactions} onUpdateTransactions={updateFeeTransactions} onLogActivity={addActivity} />;
      case 'fees-setup': return <FeesManager user={currentUser} students={activeStudents} setStudents={updateStudents} feeStructures={feeStructures} onUpdateFeeStructures={updateFeeStructures} transactions={feeTransactions} onUpdateTransactions={updateFeeTransactions} initialMode="SETUP" onLogActivity={addActivity} />;
      case 'icards': return <ICardGenerator students={activeStudents} user={currentUser} branding={schoolBranding} />;
      case 'activity': return <ActivityReport user={currentUser} activities={activities} onClearLog={() => { setActivities([]); dbService.delete('activities', 'all'); }} />;
      default: return <Dashboard user={currentUser} students={activeStudents} notices={notices} onUpdateNotices={updateNotices} homeworks={homeworks} onUpdateHomework={updateHomework} attendance={attendance} teachers={teachers} onUpdateTeachers={updateTeachers} isDarkMode={isDarkMode} lang={currentLang} branding={schoolBranding} onUpdateBranding={updateSchoolBranding} setActiveTab={updateViewedStamp} foodChart={foodChart} />;
    }
  };

  return (
    <div className={`flex flex-col md:flex-row h-screen h-[100dvh] overflow-hidden relative transition-colors duration-500 ${isDarkMode ? 'bg-[#0a0a0c] text-slate-100' : 'bg-[#f8faff] text-slate-800'}`}>
      {isSyncing && (
        <div className="fixed top-4 right-4 z-[6000] bg-indigo-600 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 border border-indigo-400 scale-75 md:scale-100 animate-pulse">
           <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
           <span className="text-[10px] font-black uppercase tracking-widest">Master Link Online</span>
        </div>
      )}
      <div className="fixed top-16 right-4 z-[7000] flex flex-col gap-2 w-full max-w-[280px]">
         {notifications.map(n => (
           <div key={n.id} className={`p-4 rounded-2xl shadow-2xl border-l-4 animate-fade-in ${isDarkMode ? 'bg-[#1e293b] border-indigo-500 text-white' : 'bg-white border-indigo-50 text-slate-800 shadow-indigo-900/10'}`}>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{n.title}</p>
              <p className="text-[11px] font-bold mt-1 opacity-80">{n.message}</p>
           </div>
         ))}
      </div>
      <Sidebar role={currentUser?.role || UserRole.STUDENT} activeTab={activeTab} setActiveTab={updateViewedStamp} onLogout={handleLogout} userName={currentUser?.name || ''} isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} unreadCounts={{notices:0, messages:0, gallery:0, leaves:0}} currentLang={currentLang} toggleLanguage={() => setCurrentLang(currentLang === Language.EN ? Language.GU : Language.EN)} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} branding={schoolBranding} onUpdateBranding={updateSchoolBranding} permissions={permissions} onSync={syncAll} isSyncing={isSyncing} />
      <main className="flex-1 overflow-y-auto mobile-scroll relative z-10 custom-scrollbar p-4 md:p-12">
        <div className="max-w-7xl mx-auto pb-24 md:pb-10">{renderContent()}</div>
      </main>
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-[4000] flex items-center justify-around px-4 py-3 border-t backdrop-blur-xl ${isDarkMode ? 'bg-[#0a0a0c]/90 border-white/5' : 'bg-white/90 border-slate-100 shadow-up'}`}>
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 flex-1 ${activeTab === 'dashboard' ? 'text-indigo-50' : 'text-slate-400'}`}>
           <i className="fa-solid fa-house-chimney text-lg"></i>
           <span className="text-[9px] font-black uppercase">Home</span>
        </button>
        <button onClick={() => setActiveTab('attendance')} className={`flex flex-col items-center gap-1 flex-1 ${activeTab === 'attendance' ? 'text-indigo-50' : 'text-slate-400'}`}>
           <i className="fa-solid fa-calendar-check text-lg"></i>
           <span className="text-[9px] font-black uppercase">Attend</span>
        </button>
        <div className="flex flex-col items-center gap-1 flex-1">
           <div className={`w-2 h-2 rounded-full mb-1 ${isOnline ? 'bg-emerald-500 shadow-emerald-500/50 shadow-lg' : 'bg-rose-500'}`}></div>
           <span className={`text-[8px] font-black uppercase ${isOnline ? 'text-emerald-500' : 'text-rose-500'}`}>{isOnline ? 'Cloud' : 'Local'}</span>
        </div>
        <button onClick={handleLogout} className="flex flex-col items-center gap-1 flex-1 text-rose-500">
           <i className="fa-solid fa-power-off text-lg"></i>
           <span className="text-[9px] font-black uppercase">Exit</span>
        </button>
        <button onClick={() => setIsSidebarOpen(true)} className="flex flex-col items-center gap-1 flex-1 text-slate-400">
           <i className="fa-solid fa-ellipsis text-lg"></i>
           <span className="text-[9px] font-black uppercase">Menu</span>
        </button>
      </div>
    </div>
  );
};

export default App;
