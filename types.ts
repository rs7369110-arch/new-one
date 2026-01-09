
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

export interface FeeTransaction {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  mode: PaymentMode;
  method: string; // e.g., 'UPI', 'Cash', 'Card', 'Cheque'
  transactionId: string;
  remarks?: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  password?: string;
  studentId?: string; // For parents/students to link to their records
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
  parentName: string;
  phone: string;
  emergencyContact: string;
  totalFees: number;
  paidFees: number;
  photo?: string;
  aadharNo?: string;
  uidNo?: string;
  panNo?: string;
  address?: string;
}

export interface TeacherAssignment {
  id: string;
  teacherName: string;
  subject: string;
  grade: string;
  phone?: string;
  photo?: string;
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
  date: string;
  studentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'URGENT' | 'GENERAL' | 'EVENT';
}

export interface Homework {
  id: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  grade: string;
}

export interface FeeStructure {
  grade: string;
  tuitionFee: number;
  transportFee: number;
  examFee: number;
}
