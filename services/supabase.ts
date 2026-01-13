
import { createClient } from '@supabase/supabase-js';

// These are defined in vite.config.ts for deployment stability
const supabaseUrl = process.env.SUPABASE_URL || 'https://exgexggudhobhsoqxndq.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_GSi-EsAl3iUtTIygfIFsDw_FlkLk3Uh';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utility to convert camelCase to snake_case for Supabase
const toSnakeCase = (obj: any) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = obj[key];
    }
  }
  return result;
};

// Utility to convert snake_case to camelCase for Frontend
const toCamelCase = (obj: any) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/([-_][a-z])/gi, ($1) => {
        return $1.toUpperCase().replace('-', '').replace('_', '');
      });
      result[camelKey] = obj[key];
    }
  }
  return result;
};

export const dbService = {
  async fetchAll(table: string) {
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (error) throw error;
      
      if (table === 'subject_list') {
        const settings = data?.find(item => item.id === 'current_subjects');
        return settings ? settings.list : [];
      }
      
      return (data || []).map(item => toCamelCase(item));
    } catch (err) {
      console.warn(`Sync Warning [${table}]:`, err);
      return [];
    }
  },

  async upsert(table: string, payload: any | any[]) {
    try {
      let dataToPush: any;

      if (table === 'subject_list') {
        dataToPush = { id: 'current_subjects', list: payload };
      } else if (Array.isArray(payload)) {
        dataToPush = payload.map(item => toSnakeCase(item));
      } else {
        dataToPush = toSnakeCase(payload);
      }
      
      let onConflict = 'id';
      if (table === 'food_chart') onConflict = 'day';
      if (table === 'fee_structures') onConflict = 'grade';
      // Important: Attendance uses a composite unique key in our SQL
      if (table === 'attendance') onConflict = 'date,student_id';

      const { error } = await supabase.from(table).upsert(dataToPush, { onConflict });
      if (error) throw error;
    } catch (err) {
      console.error(`Sync Error [${table}]:`, err);
      throw err;
    }
  },

  async delete(table: string, id: string) {
    try {
      const pk = (table === 'food_chart') ? 'day' : (table === 'fee_structures' ? 'grade' : 'id');
      const { error } = await supabase.from(table).delete().eq(pk, id);
      if (error) throw error;
    } catch (err) {
      console.error(`Delete Error [${table}]:`, err);
      throw err;
    }
  }
};
