
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://vufysvncrrmyheyyyysu.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_sIc1FTJ4veBw0vx6rJkO8w_r4km2EiM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Converts object keys to snake_case and filters out null/undefined values.
 * Also handles an exclusion list to prevent schema errors.
 */
const toSnakeCase = (obj: any, excludeKeys: string[] = []) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Skip undefined or null values
      if (obj[key] === undefined || obj[key] === null) continue;
      
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      
      // Filter out specifically problematic keys if any
      if (excludeKeys.includes(snakeKey)) continue;
      
      result[snakeKey] = obj[key];
    }
  }
  return result;
};

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

      if (table === 'school_branding') {
        const branding = data?.find(item => item.id === 'active_brand');
        return branding ? toCamelCase(branding) : null;
      }
      
      return (data || []).map(item => toCamelCase(item));
    } catch (err: any) {
      console.warn(`Sync Warning [${table}]:`, err.message || err);
      return [];
    }
  },

  async upsert(table: string, payload: any) {
    try {
      let dataToPush: any;
      // List of columns that definitely don't exist in Supabase even after SQL update
      const exclude: string[] = [];
      
      if (table === 'students') {
        // These are fields that are calculated or not yet added to SQL
        exclude.push('allergies', 'medical_conditions', 'leaving_reason', 'emergency_contact_name');
        // Note: 'city', 'state', 'pincode', 'documents', 'status' are now IN the SQL, so removed from exclude.
      }

      if (table === 'subject_list') {
        dataToPush = { id: 'current_subjects', list: payload };
      } else if (table === 'school_branding') {
        dataToPush = { ...toSnakeCase(payload, exclude), id: 'active_brand' };
      } else if (Array.isArray(payload)) {
        // Handle bulk updates
        dataToPush = payload.map(item => {
          const cleaned = { ...item };
          if (cleaned.id === undefined || cleaned.id === null || cleaned.id === '') {
             delete cleaned.id; 
          }
          return toSnakeCase(cleaned, exclude);
        });
      } else {
        const cleaned = { ...payload };
        if (cleaned.id === undefined || cleaned.id === null || cleaned.id === '') {
          delete cleaned.id;
        }
        dataToPush = toSnakeCase(cleaned, exclude);
      }
      
      let onConflict = 'id';
      if (table === 'food_chart') onConflict = 'day';
      if (table === 'fee_structures') onConflict = 'grade';
      if (table === 'attendance') onConflict = 'date,student_id';
      if (table === 'school_branding') onConflict = 'id';

      const { error } = await supabase.from(table).upsert(dataToPush, { 
        onConflict,
        ignoreDuplicates: false 
      });
      
      if (error) {
        const errDetails = error.details || '';
        const errMsg = error.message || 'Unknown Supabase Error';
        console.error(`Supabase Upsert Error [${table}]:`, errMsg, errDetails);
        throw new Error(`${errMsg}: ${errDetails}`);
      }
      
      console.log(`Cloud Sync Success [${table}]`);
    } catch (err: any) {
      console.error(`Upsert Exception [${table}]:`, err.message || err);
      throw err;
    }
  },

  async delete(table: string, id: string) {
    try {
      let pk = 'id';
      if (table === 'food_chart') pk = 'day';
      if (table === 'fee_structures') pk = 'grade';
      
      const { error } = await supabase.from(table).delete().eq(pk, id);
      if (error) throw error;
      console.log(`Sync Success: Item ${id} deleted from ${table}`);
    } catch (err: any) {
      console.error(`Delete Error [${table}]:`, err.message || err);
      throw err;
    }
  }
};
