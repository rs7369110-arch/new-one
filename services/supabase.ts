
import { createClient } from '@supabase/supabase-js';

// Hardcoding credentials directly to ensure reliable initialization
const supabaseUrl = 'https://exgexggudhobhsoqxndq.supabase.co';
const supabaseAnonKey = 'sb_publishable_GSi-EsAl3iUtTIygfIFsDw_FlkLk3Uh';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utility to convert camelCase to snake_case for Supabase
const toSnakeCase = (obj: any) => {
  if (!obj || typeof obj !== 'object') return obj;
  const result: any = {};
  for (const key in obj) {
    // Only convert actual keys, not inherited properties
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
        
      const { error } = await supabase.from(table).upsert(dataToPush);
      if (error) throw error;
    } catch (err) {
      console.error(`Sync Error [${table}]:`, err);
      throw err;
    }
  },

  async delete(table: string, id: string) {
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error(`Delete Error [${table}]:`, err);
      throw err;
    }
  }
};
