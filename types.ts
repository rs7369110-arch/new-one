
export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  TEACHER = 'TEACHER'
}

export enum Language {
  EN = 'EN',
  GU = 'GU'
}

export enum PaymentMode {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE'
}

export interface AccessPermissions {
  [role: string]: string[];
}

export interface SchoolBranding {
  id: string;
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  logo: string | null;
  themeColor: string;
}

export const DEFAULT_BRANDING: SchoolBranding = {
  id: 'active_brand',
  name: 'Digital Education',
  tagline: 'Academy of Excellence',
  address: 'System Default Address, Digital Node',
  phone: '0000000000',
  email: 'admin@digitaledu.com',
  logo: null,
  themeColor: '#4f46e5'
};

export interface Subject {
  id: string;
  name: string;
  code: string;
  type: 'THEORY' | 'PRACTICAL' | 'SKILL';
  color: string; // Added for visual timetable
  icon: string;  // Added for visual identity
}

export interface TimetableEntry {
  id: string;
  grade: string;
  section: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  period: number;
  subjectId: string;
  teacherId: string;
  startTime: string;
  endTime: string;
}

export interface FeeTransaction {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  mode: PaymentMode;
  method: string; 
  transactionId: string;
  remarks?: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  password?: string;
  studentId?: string;
}

export interface CustomProfileTemplate {
  id: string;
  name: string;
  columns: string[];
  data: Array<Record<string, string>>;
  createdAt: string;
}

export interface LeaveRequest {
  id: string;
  teacherId: string;
  teacherName: string;
  startDate: string;
  endDate: string;
  type: 'Sick' | 'Casual' | 'Emergency' | 'Duty';
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedDate: string;
  adminRemarks?: string;
}

export interface AdminActivity {
  id: string;
  adminName: string;
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'PAYMENT' | 'LEAVE_DECISION';
  module: string;
  target: string;
  timestamp: string;
  details?: string;
}

export interface Student {
  id: string;
  rollNo: string;
  admissionNo: string;
  grNo?: string;
  name: string;
  dob: string;
  grade: string;
  section: string;
  medium: 'ENGLISH' | 'GUJARATI';
  parentName: string;
  phone: string;
  emergencyContact: string;
  totalFees: number;
  paidFees: number;
  photo?: string;
  fatherPhoto?: string;
  motherPhoto?: string;
  aadharNo?: string;
  uidNo?: string;
  panNo?: string;
  address?: string;
  admissionDate?: string;
  academicYear?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  fatherName?: string;
  motherName?: string;
  guardianName?: string;
  alternatePhone?: string;
  email?: string;
  fatherOccupation?: string;
  city?: string;
  state?: string;
  pincode?: string;
  permanentAddress?: string;
  prevSchoolName?: string;
  prevLastClass?: string;
  tcNo?: string;
  leavingReason?: string;
  medicalConditions?: string;
  allergies?: string;
  emergencyContactName?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  cancelledDate?: string;
  cancelledBy?: string;
  cancelReason?: string;
  documents?: {
    aadharCard?: string;
    birthCert?: string;
    prevMarksheet?: string;
    transferCert?: string;
  }
}

export interface TeacherAssignment {
  id: string;
  employeeId: string;
  teacherName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dob: string;
  bloodGroup?: string;
  aadharNo?: string;
  photo?: string;
  phone: string;
  email: string;
  address: string;
  permanentAddress?: string;
  designation: string; 
  subject: string;
  joiningDate: string;
  employmentType: 'PERMANENT' | 'CONTRACT' | 'GUEST';
  experience: string;
  qualification: string;
  professionalDegree?: string;
  university?: string;
  passingYear?: string;
  assignedGrades: string[];
  assignedSections: string[];
  isClassTeacher: boolean;
  salaryType: 'MONTHLY' | 'HOURLY';
  basicSalary: number;
  bankName?: string;
  accountNo?: string;
  ifscCode?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface FoodItem {
  day: string;
  breakfast: string;
  breakfastPrice: number;
  lunch: string;
  lunchPrice: number;
}

export interface MarksRecord {
  id: string;
  studentId: string;
  term: string;
  subjects: {
    [key: string]: {
      theory: number;
      practical: number;
      total: number;
      isLocked?: boolean;
    };
  };
  remarks: string;
  date: string;
}

export interface CurriculumItem {
  id: string;
  grade: string;
  subject: string;
  title: string;
  fileData: string;
  fileType: string;
  fileName: string;
  date: string;
}

export interface GalleryItem {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  grade: string;
  title: string;
  description: string;
  url: string;
  date: string;
}

export interface SchoolMessage {
  id: string;
  senderName: string;
  text: string;
  date: string;
  attachment?: {
    data: string;
    name: string;
    type: string;
  };
  targetGrade: 'All' | string;
}

export interface AttendanceRecord {
  id?: number;
  date: string;
  studentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'EXAM' | 'HOLIDAY' | 'EVENT' | 'FEE' | 'URGENT' | 'GENERAL';
  targetGrades: string[];
  isPinned?: boolean;
  attachment?: {
    data: string;
    name: string;
    type: 'IMAGE' | 'PDF';
  };
}

export interface Homework {
  id: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  grade: string;
  attachment?: {
    data: string; 
    name: string;
    type: 'IMAGE' | 'PDF';
  };
}

export interface FeeStructure {
  grade: string;
  tuitionFee: number;
  transportFee: number;
  examFee: number;
}

export interface ExamSubjectConfig {
  subjectName: string;
  maxMarks: number;
  passingMarks: number;
  date: string;
  startTime: string;
  endTime: string;
}

export interface Exam {
  id: string;
  name: string;
  financialYear: string;
  term?: 'UNIT_TEST' | 'MID_TERM' | 'FINAL' | 'CUSTOM';
  examType?: 'ONLINE' | 'OFFLINE';
  targetGrades?: string[];
  targetSections?: string[];
  subjects?: ExamSubjectConfig[];
  marksEntryStart?: string;
  marksEntryEnd?: string;
  marksEntryDeadline?: string; 
  isAdminLocked?: boolean;      
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' | 'OPEN' | 'LOCKED';
  gradingSystem?: 'MARKS' | 'GRADE' | 'COMBINED';
  gradeSlabs?: { grade: string; minPercentage: number }[];
  createdAt?: string;
  createdById?: string;
  date?: string;
  maxMarks?: number;
  grade?: string;
  section?: string;
  subject?: string;
}

export interface ExamMark {
  id: string;
  examId: string;
  studentId: string;
  subjectName: string;
  marks: number | 'AB' | 'NE';
  teacherId: string;
  submittedAt: string;
  lastModified?: string;
  isFinal: boolean;
}
