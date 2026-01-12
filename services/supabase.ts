
import { createClient } from '@supabase/supabase-js';

// Credentials for Digital Education Academy
const supabaseUrl = 'https://exgexggudhobhsoqxndq.supabase.co';
const supabaseAnonKey = 'sb_publishable_GSi-EsAl3iUtTIygfIFsDw_FlkLk3Uh';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utility to convert camelCase to snake_case for Supabase
const toSnakeCase = (obj: any) => {
  if (!obj || typeof obj !== 'object') return obj;
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
  if (!obj || typeof obj !== 'object') return obj;
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
      return (data || []).map(item => toCamelCase(item));
    } catch (err) {
      console.warn(`Sync Warning [${table}]:`, err);
      return [];
    }
  },

  async upsert(table: string, payload: any | any[]) {
    try {
      const dataToPush = Array.isArray(payload) 
        ? payload.map(item => toSnakeCase(item)) 
        : toSnakeCase(payload);
      
      // Determine which column to use for handling conflicts based on the table
      let onConflict = 'id';
      if (table === 'food_chart') onConflict = 'day';
      if (table === 'fee_structures') onConflict = 'grade';
      if (table === 'attendance') onConflict = 'date,student_id'; // Matching our UNIQUE constraint in SQL

      const { error } = await supabase.from(table).upsert(dataToPush, { onConflict });
      if (error) throw error;
    } catch (err) {
      console.error(`Sync Error [${table}]:`, err);
      throw err;
    }
  },

  async delete(table: string, id: string) {
    try {
      // For most tables, PK is 'id'. For special ones, it might be different.
      const pk = (table === 'food_chart') ? 'day' : (table === 'fee_structures' ? 'grade' : 'id');
      const { error } = await supabase.from(table).delete().eq(pk, id);
      if (error) throw error;
    } catch (err) {
      console.error(`Delete Error [${table}]:`, err);
      throw err;
    }
  }
};
