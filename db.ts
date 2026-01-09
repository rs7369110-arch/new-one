
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
  LANGUAGE: 'edu_app_language'
};

export const storage = {
  get: <T,>(key: string, defaultValue: T): T => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  },
  set: (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  clear: (key: string) => {
    localStorage.removeItem(key);
  }
};

export { DB_KEYS };
