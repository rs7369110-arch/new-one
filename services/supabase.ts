
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://vufysvncrrmyheyyyysu.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_sIc1FTJ4veBw0vx6rJkO8w_r4km2EiM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 40,
    },
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: { 'x-application-name': 'digital-edu' },
  }
});

const toSnakeCase = (obj: any) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (obj[key] === undefined || obj[key] === null) continue;
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
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
      const camelKey = key.replace(/([-_][a-z])/gi, ($1) => $1.toUpperCase().replace('-', '').replace('_', ''));
      result[camelKey] = obj[key];
    }
  }
  return result;
};

export const dbService = {
  async fetchAll(table: string): Promise<any[] | null> {
    if (!navigator.onLine) return null;
    
    try {
      const { data, error } = await supabase.from(table).select('*');
      
      if (error) {
        // Only log serious errors, not standard fetch failures
        if (!error.message.includes('Failed to fetch')) {
          console.debug(`[Sync] ${table} fetch skipped: ${error.message}`);
        }
        return null; 
      }
      
      if (!data) return [];

      if (table === 'subject_list') {
        const settings = data.find(item => item.id === 'current_subjects');
        return settings ? settings.list : [];
      }
      if (table === 'school_branding') {
        const branding = data.find(item => item.id === 'active_brand');
        return branding ? [toCamelCase(branding)] : [];
      }
      if (table === 'access_permissions') {
        const perms = data.find(item => item.id === '1' || item.id === 1);
        return perms ? [perms.data] : [];
      }
      return data.map(item => toCamelCase(item));
    } catch (err: any) {
      // Catch standard TypeError: Failed to fetch silently
      return null;
    }
  },

  async upsert(table: string, payload: any) {
    if (!navigator.onLine) return false;
    try {
      let dataToPush: any;
      if (table === 'subject_list') {
        dataToPush = { id: 'current_subjects', list: payload };
      } else if (table === 'school_branding') {
        dataToPush = { ...toSnakeCase(payload), id: 'active_brand' };
      } else if (table === 'access_permissions') {
        dataToPush = { id: 1, data: payload };
      } else if (Array.isArray(payload)) {
        dataToPush = payload.map(item => toSnakeCase(item));
      } else {
        dataToPush = toSnakeCase(payload);
      }
      
      let onConflict = 'id';
      if (table === 'food_chart') onConflict = 'day';
      if (table === 'fee_structures') onConflict = 'grade';
      if (table === 'attendance') onConflict = 'date,student_id';

      const { error } = await supabase.from(table).upsert(dataToPush, { onConflict });
      if (error) throw error;
      return true;
    } catch (err: any) {
      return false;
    }
  },

  async delete(table: string, id: string) {
    if (!navigator.onLine) return false;
    try {
      let pk = 'id';
      if (table === 'food_chart') pk = 'day';
      if (table === 'fee_structures') pk = 'grade';
      const { error } = await supabase.from(table).delete().eq(pk, id);
      if (error) throw error;
      return true;
    } catch (err: any) {
      return false;
    }
  },

  subscribe(table: string, callback: (payload: any) => void) {
    if (!navigator.onLine) return { unsubscribe: () => {} };
    return supabase
      .channel(`fast-sync:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
        callback(payload);
      })
      .subscribe();
  }
};
