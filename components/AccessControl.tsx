
import React from 'react';
import { UserRole, AccessPermissions } from '../types';

interface AccessControlProps {
  permissions: AccessPermissions;
  onUpdatePermissions: (p: AccessPermissions) => void;
  menuItems: any[];
}

const AccessControl: React.FC<AccessControlProps> = ({ permissions, onUpdatePermissions, menuItems }) => {
  const roles = [UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT];
  
  const togglePermission = (role: string, moduleId: string) => {
    const current = permissions[role] || [];
    const updated = current.includes(moduleId)
      ? current.filter(id => id !== moduleId)
      : [...current, moduleId];
    
    onUpdatePermissions({
      ...permissions,
      [role]: updated
    });
  };

  const getRoleColor = (role: string) => {
    switch(role) {
      case UserRole.TEACHER: return 'text-amber-600 bg-amber-50 border-amber-100';
      case UserRole.STUDENT: return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      case UserRole.PARENT: return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="flex items-center gap-6">
        <div className="w-16 h-16 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center text-3xl shadow-2xl">
          <i className="fa-solid fa-shield-halved"></i>
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Control Tower</h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-2 italic">Role-Based Access Management</p>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {roles.map((role) => (
          <div key={role} className="bg-white rounded-[3.5rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col">
            <div className={`p-8 border-b-2 flex items-center justify-between ${getRoleColor(role)}`}>
               <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter">{role} Access</h3>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Configuring {permissions[role]?.length || 0} Modules</p>
               </div>
               <div className="text-2xl opacity-40">
                  <i className={`fa-solid ${role === UserRole.TEACHER ? 'fa-chalkboard-user' : role === UserRole.STUDENT ? 'fa-user-graduate' : 'fa-house-user'}`}></i>
               </div>
            </div>

            <div className="flex-1 p-6 space-y-2 overflow-y-auto max-h-[500px] custom-scrollbar">
               {menuItems.filter(item => item.id !== 'dashboard').map((item) => {
                 const isEnabled = (permissions[role] || []).includes(item.id);
                 return (
                   <button 
                     key={item.id}
                     onClick={() => togglePermission(role, item.id)}
                     className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border-2 ${
                       isEnabled 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-lg scale-[1.02]' 
                        : 'bg-white border-slate-50 text-slate-400 hover:border-slate-200'
                     }`}
                   >
                     <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${isEnabled ? 'text-white' : 'text-slate-300'}`}>
                           <i className={`fa-solid ${item.icon}`}></i>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">{item.labels.EN}</span>
                     </div>
                     <div className={`w-10 h-5 rounded-full relative transition-all ${isEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isEnabled ? 'right-1' : 'left-1'}`}></div>
                     </div>
                   </button>
                 );
               })}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Settings sync automatically across cloud nodes</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 bg-slate-900 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
         <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl">
               <i className="fa-solid fa-lock-open text-amber-400"></i>
            </div>
            <div>
               <h4 className="text-xl font-black uppercase tracking-tight">Security Protocol Notice</h4>
               <p className="text-slate-400 font-medium italic text-sm">"The Dashboard is always accessible to all roles for core identity verification. All other modules can be toggled on/off to optimize staff workflow and student focus."</p>
            </div>
         </div>
         <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-10"></div>
      </div>
    </div>
  );
};

export default AccessControl;
