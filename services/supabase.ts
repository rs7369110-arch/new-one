
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://vufysvncrrmyheyyyysu.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_sIc1FTJ4veBw0vx6rJkO8w_r4km2EiM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Converts object keys to snake_case and filters out null/undefined values.
 */
const toSnakeCase = (obj: any, allowedColumns?: string[]) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (obj[key] === undefined || obj[key] === null) continue;
      
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      
      // If allowedColumns is provided, only include keys that are in the list
      if (allowedColumns && !allowedColumns.includes(snakeKey)) continue;
      
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
        // Look for ID 1 or the old string ID for backward compatibility
        const settings = data?.find(item => String(item.id) === '1' || item.id === 'current_subjects');
        return settings ? settings.list : [];
      }

      if (table === 'school_branding') {
        const branding = data?.find(item => String(item.id) === '1' || item.id === 'active_brand');
        return branding ? toCamelCase(branding) : null;
      }

      if (table === 'access_permissions') {
        const perms = data?.find(item => String(item.id) === '1' || item.id === 'global_permissions');
        return perms ? perms.data : null;
      }
      
      return (data || []).map(item => toCamelCase(item));
    } catch (err: any) {
      const msg = err.message || JSON.stringify(err);
      console.warn(`Sync Warning [${table}]:`, msg);
      return [];
    }
  },

  async upsert(table: string, payload: any) {
    try {
      let dataToPush: any;
      let allowedColumns: string[] | undefined = undefined;

      // Special table mapping using numeric ID 1 to avoid BigInt issues
      if (table === 'subject_list') {
        dataToPush = { id: 1, list: payload };
      } else if (table === 'school_branding') {
        dataToPush = { ...toSnakeCase(payload), id: 1 };
      } else if (table === 'access_permissions') {
        dataToPush = { id: 1, data: payload };
      } else {
        // Standard tables handling
        if (table === 'students') {
          allowedColumns = [
            'id', 'roll_no', 'admission_no', 'gr_no', 'name', 'dob', 'gender',
            'blood_group', 'aadhar_no', 'photo', 'grade', 'section', 'medium',
            'father_name', 'mother_name', 'guardian_name', 'father_occupation',
            'phone', 'alternate_phone', 'email', 'address', 'city', 'state',
            'pincode', 'permanent_address', 'prev_school_name', 'prev_last_class',
            'tc_no', 'total_fees', 'paid_fees', 'status', 'academic_year',
            'admission_date', 'documents', 'parent_name', 'emergency_contact',
            'emergency_contact_name', 'uid_no', 'pan_no', 'leaving_reason',
            'medical_conditions', 'allergies'
          ];
        }
        if (table === 'teachers') {
          allowedColumns = [
            'id', 'employee_id', 'teacher_name', 'gender', 'dob', 'blood_group',
            'aadhar_no', 'photo', 'phone', 'email', 'address', 'permanent_address',
            'designation', 'subject', 'joining_date', 'employment_type',
            'experience', 'qualification', 'professional_degree', 'university',
            'passing_year', 'assigned_grades', 'assigned_sections', 'is_class_teacher',
            'salary_type', 'basic_salary', 'bank_name', 'account_no', 'ifsc_code', 'status'
          ];
        }

        if (Array.isArray(payload)) {
          dataToPush = payload.map(item => toSnakeCase(item, allowedColumns));
        } else {
          dataToPush = toSnakeCase(payload, allowedColumns);
        }
      }
      
      let onConflict = 'id';
      if (table === 'food_chart') onConflict = 'day';
      if (table === 'fee_structures') onConflict = 'grade';
      if (table === 'attendance') onConflict = 'date,student_id';

      const { error } = await supabase.from(table).upsert(dataToPush, { 
        onConflict,
        ignoreDuplicates: false 
      });
      
      if (error) throw error;
      console.log(`Cloud Sync Success [${table}]`);
    } catch (err: any) {
      const errorMsg = err.message || JSON.stringify(err, null, 2);
      console.error(`Sync Error [${table}]:`, errorMsg);
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
      const errorMsg = err.message || JSON.stringify(err, null, 2);
      console.error(`Delete Error [${table}]:`, errorMsg);
      throw err;
    }
  }
};
