
const DB_KEYS = {
  STUDENTS: 'edu_students',
  ATTENDANCE: 'edu_attendance',
  NOTICES: 'edu_notices',
  HOMEWORK: 'edu_homework',
  FEES: 'edu_fees',
  USER: 'edu_user',
  TEACHERS: 'edu_teachers',
  FOOD_CHART: 'edu_food_chart',
  MARKS: 'edu_marks',
  CURRICULUM: 'edu_curriculum',
  MESSAGES: 'edu_messages',
  GALLERY: 'edu_gallery',
  ACTIVITY_LOG: 'edu_activity_log',
  SUBJECT_LIST: 'edu_subjects_list',
  LEAVES: 'edu_teacher_leaves',
  FEE_STRUCTURES: 'edu_fee_structures',
  SIDEBAR_ORDER: 'edu_sidebar_menu_order',
  CUSTOM_TEMPLATES: 'edu_custom_templates',
  LAST_VIEWED: 'edu_last_viewed_stamps',
  LANGUAGE: 'edu_app_language',
  FEE_TRANSACTIONS: 'edu_fee_transactions',
  SCHOOL_BRANDING: 'edu_school_branding',
  ACCESS_PERMISSIONS: 'edu_access_permissions',
  SUBJECTS: 'edu_master_subjects',
  TIMETABLE: 'edu_master_timetable'
};

export const storage = {
  get: <T,>(key: string, defaultValue: T): T => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error("Storage Retrieval Error:", e);
      return defaultValue;
    }
  },
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error("Storage Save Error:", e);
      if (e instanceof DOMException && (e.code === 22 || e.code === 1014)) {
        alert("🚨 MEMORY FULL: Mobile storage space for this app is full. Please delete old notices or gallery images to make room.");
      }
      return false;
    }
  },
  clear: (key: string) => {
    localStorage.removeItem(key);
  }
};

export { DB_KEYS };
