
import React, { useState, useEffect } from 'react';
import { UserRole, User, Student, Notice, Homework, AttendanceRecord, TeacherAssignment, FoodItem, MarksRecord, CurriculumItem, SchoolMessage, GalleryItem, AdminActivity, LeaveRequest, FeeStructure, CustomProfileTemplate } from './types';
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

const DEFAULT_FOOD_CHART: FoodItem[] = [
  { day: 'Monday', breakfast: 'Milk & Poha', breakfastPrice: 20, lunch: 'Dal Fry & Rice', lunchPrice: 40 },
  { day: 'Tuesday', breakfast: 'Banana & Cookies', breakfastPrice: 15, lunch: 'Aloo Paratha & Curd', lunchPrice: 45 },
  { day: 'Wednesday', breakfast: 'Sprouted Salad', breakfastPrice: 25, lunch: 'Mix Veg & Roti', lunchPrice: 40 },
  { day: 'Thursday', breakfast: 'Upma', breakfastPrice: 20, lunch: 'Rajma & Chawal', lunchPrice: 50 },
  { day: 'Friday', breakfast: 'Apple & Toast', breakfastPrice: 30, lunch: 'Paneer Masala & Nan', lunchPrice: 60 },
  { day: 'Saturday', breakfast: 'Idli Sambar', breakfastPrice: 35, lunch: 'Kadhi & Rice', lunchPrice: 40 },
];

const DEFAULT_SUBJECTS = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Computer'];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
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
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

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
  }, []);

  const notify = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    storage.set(DB_KEYS.USER, user);
    notify(`Welcome, ${user.name}! Access Granted.`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    storage.clear(DB_KEYS.USER);
    notify('Logged out successfully.', 'info');
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    notify(`${!isDarkMode ? 'Dark' : 'Light'} Mode Activated`, 'info');
  };

  const updateCustomTemplates = (templates: CustomProfileTemplate[]) => {
    setCustomTemplates(templates);
    storage.set(DB_KEYS.CUSTOM_TEMPLATES, templates);
    notify('Profiles synced.');
  };

  const updateTeachers = (newTeachers: TeacherAssignment[]) => {
    setTeachers(newTeachers);
    storage.set(DB_KEYS.TEACHERS, newTeachers);
    notify('Teachers updated.');
  };

  const updateFoodChart = (newFoodChart: FoodItem[]) => {
    setFoodChart(newFoodChart);
    storage.set(DB_KEYS.FOOD_CHART, newFoodChart);
    notify('Food chart updated.');
  };

  const updateMarks = (newMarks: MarksRecord[]) => {
    setMarks(newMarks);
    storage.set(DB_KEYS.MARKS, newMarks);
    notify('Marks saved.');
  };

  const updateAvailableSubjects = (newSubjects: string[]) => {
    setAvailableSubjects(newSubjects);
    storage.set(DB_KEYS.SUBJECT_LIST, newSubjects);
    notify('Subjects updated.');
  };

  const updateCurriculum = (newItems: CurriculumItem[]) => {
    setCurriculum(newItems);
    storage.set(DB_KEYS.CURRICULUM, newItems);
    notify('Curriculum updated.');
  };

  const updateMessages = (newMsgs: SchoolMessage[]) => {
    setMessages(newMsgs);
    storage.set(DB_KEYS.MESSAGES, newMsgs);
    notify('Broadcast sent.');
  };

  const updateGallery = (newItems: GalleryItem[]) => {
    setGallery(newItems);
    storage.set(DB_KEYS.GALLERY, newItems);
    notify('Gallery updated.');
  };

  const updateStudents = (newStudents: Student[]) => {
    setStudents(newStudents);
    storage.set(DB_KEYS.STUDENTS, newStudents);
    notify('Students synced.');
  };

  const updateLeaves = (newLeaves: LeaveRequest[]) => {
    setLeaves(newLeaves);
    storage.set(DB_KEYS.LEAVES, newLeaves);
    notify('Leaves processed.');
  };

  const updateAttendance = (a: AttendanceRecord[]) => {
    setAttendance(a);
    storage.set(DB_KEYS.ATTENDANCE, a);
    notify('Attendance synced.');
  };

  const updateNotices = (n: Notice[]) => {
    setNotices(n); 
    storage.set(DB_KEYS.NOTICES, n); 
    notify('Notices refreshed.');
  };

  const updateHomework = (h: Homework[]) => {
    setHomeworks(h); 
    storage.set(DB_KEYS.HOMEWORK, h); 
    notify('Homework updated.');
  };

  const updateFees = (s: Student[]) => {
    setStudents(s); 
    storage.set(DB_KEYS.STUDENTS, s); 
    notify('Fees updated.');
  };

  const updateFeeStructures = (structures: FeeStructure[]) => {
    setFeeStructures(structures);
    storage.set(DB_KEYS.FEE_STRUCTURES, structures);
    notify('Fee structure saved.');
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
          user={currentUser} 
          students={students} 
          notices={notices} 
          homeworks={homeworks} 
          attendance={attendance} 
          teachers={teachers}
          onUpdateTeachers={updateTeachers}
          isDarkMode={isDarkMode}
        />;
      case 'fee-reports':
        return <FeeReports students={students} />;
      case 'custom-builder':
        return <CustomProfileBuilder templates={customTemplates} onUpdateTemplates={updateCustomTemplates} students={students} />;
      case 'leaves':
        return <LeaveManagement user={currentUser} leaves={leaves} onUpdateLeaves={updateLeaves} />;
      case 'messages':
        return <MessageManager user={currentUser} messages={messages} onUpdateMessages={updateMessages} />;
      case 'gallery':
        return <GalleryManager user={currentUser} gallery={gallery} onUpdateGallery={updateGallery} />;
      case 'activity':
        return currentUser.role === UserRole.ADMIN ? <ActivityReport activities={activities} onClearLog={() => { setActivities([]); storage.set(DB_KEYS.ACTIVITY_LOG, []); notify('Audit logs cleared!'); }} /> : <div className="p-8 text-rose-500 font-black">UNAUTHORIZED ACCESS</div>;
      case 'students':
        return currentUser.role === UserRole.ADMIN ? <StudentManagement students={students} setStudents={updateStudents} /> : <div className="p-8 text-rose-500 font-black">UNAUTHORIZED ACCESS</div>;
      case 'student-reports':
        return currentUser.role === UserRole.ADMIN ? <StudentReports students={students} /> : <div className="p-8 text-rose-500 font-black">UNAUTHORIZED ACCESS</div>;
      case 'exam-entry':
        return <ExamEntry user={currentUser} students={students} marks={marks} onUpdateMarks={updateMarks} availableSubjects={availableSubjects} teachers={teachers} />;
      case 'teachers':
        return currentUser.role === UserRole.ADMIN ? <TeacherManagement teachers={teachers} setTeachers={updateTeachers} /> : <div className="p-8 text-rose-500 font-black">UNAUTHORIZED ACCESS</div>;
      case 'food':
        return <FoodChart user={currentUser} foodChart={foodChart} onUpdateFoodChart={updateFoodChart} />;
      case 'curriculum':
        return <CurriculumManager user={currentUser} curriculum={curriculum} onUpdateCurriculum={updateCurriculum} />;
      case 'marksheet':
        return <MarksheetManager user={currentUser} students={students} marks={marks} onUpdateMarks={updateMarks} availableSubjects={availableSubjects} onUpdateSubjects={updateAvailableSubjects} />;
      case 'certs':
        return <CertificateHub students={students} />;
      case 'attendance':
        return <Attendance user={currentUser} students={students} attendance={attendance} setAttendance={updateAttendance} />;
      case 'notices':
        return <NoticeBoard user={currentUser} notices={notices} setNotices={updateNotices} />;
      case 'homework':
        return <HomeworkManager user={currentUser} homeworks={homeworks} setHomeworks={updateHomework} />;
      case 'fees':
        return <FeesManager user={currentUser} students={students} setStudents={updateFees} feeStructures={feeStructures} onUpdateFeeStructures={updateFeeStructures} />;
      case 'fees-setup':
        return currentUser.role === UserRole.ADMIN ? <FeesManager user={currentUser} students={students} setStudents={updateFees} feeStructures={feeStructures} onUpdateFeeStructures={updateFeeStructures} initialMode="SETUP" /> : <div className="p-8 text-rose-500 font-black">UNAUTHORIZED ACCESS</div>;
      case 'icards':
        return currentUser.role === UserRole.ADMIN ? <ICardGenerator students={students} /> : <div className="p-8 text-rose-500 font-black">UNAUTHORIZED ACCESS</div>;
      default:
        return <Dashboard user={currentUser} students={students} notices={notices} homeworks={homeworks} attendance={attendance} teachers={teachers} onUpdateTeachers={updateTeachers} isDarkMode={isDarkMode} />;
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden relative font-['Inter'] transition-colors duration-500 ${isDarkMode ? 'bg-[#0a0a0c] text-slate-100' : 'bg-[#f8faff] text-slate-800'}`}>
      {/* Immersive Background Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className={`absolute top-[-10%] left-[-5%] w-[60%] h-[70%] rounded-full blur-[120px] transition-colors duration-1000 ${isDarkMode ? 'bg-indigo-900/20' : 'bg-indigo-500/10'}`}></div>
         <div className={`absolute bottom-[0%] right-[-5%] w-[50%] h-[60%] rounded-full blur-[100px] transition-colors duration-1000 ${isDarkMode ? 'bg-purple-900/15' : 'bg-purple-500/10'}`}></div>
         <div className={`absolute top-[20%] right-[10%] w-[40%] h-[50%] rounded-full blur-[150px] transition-colors duration-1000 ${isDarkMode ? 'bg-blue-900/10' : 'bg-blue-500/5'}`}></div>
      </div>

      {toast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[2000] animate-toast-in">
          <div className={`flex items-center gap-4 px-10 py-5 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl border border-white/10 ${
            toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 
            toast.type === 'error' ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'
          }`}>
            <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check' : toast.type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-info'} text-xl`}></i>
            <span className="font-black text-xs uppercase tracking-widest">{toast.message}</span>
          </div>
        </div>
      )}

      <Sidebar 
        role={currentUser.role} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        userName={currentUser.name}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        pendingLeavesCount={leaves.filter(l => l.status === 'PENDING').length}
      />
      
      <main className="flex-1 overflow-y-auto p-6 md:p-12 relative z-10 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      <style>{`
        @keyframes toastIn {
          from { transform: translate(-50%, -100px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-toast-in { animation: toastIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}; }
      `}</style>
    </div>
  );
};

export default App;
