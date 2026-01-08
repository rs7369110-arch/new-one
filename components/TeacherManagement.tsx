
import React, { useState, useRef } from 'react';
import { TeacherAssignment } from '../types';

interface TeacherManagementProps {
  teachers: TeacherAssignment[];
  setTeachers: (teachers: TeacherAssignment[]) => void;
}

const TeacherManagement: React.FC<TeacherManagementProps> = ({ teachers, setTeachers }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherAssignment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<TeacherAssignment>>({
    teacherName: '',
    subject: '',
    grade: '',
    phone: '',
    photo: ''
  });

  const resetForm = () => {
    setFormData({ teacherName: '', subject: '', grade: '', phone: '', photo: '' });
    setIsAdding(false);
    setEditingTeacher(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newTeacher: TeacherAssignment = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData as TeacherAssignment
    };
    setTeachers([...teachers, newTeacher]);
    resetForm();
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    const updated = teachers.map(t => t.id === editingTeacher.id ? { ...t, ...formData } as TeacherAssignment : t);
    setTeachers(updated);
    resetForm();
  };

  const deleteTeacher = (id: string) => {
    if (window.confirm('Delete this Master from the Academy?')) {
      setTeachers(teachers.filter(t => t.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-indigo-900">Masters Registry</h1>
          <p className="text-rose-400 font-medium italic">Empowering the educators of Jannat Academy.</p>
        </div>
        <button 
          onClick={() => { if (isAdding || editingTeacher) resetForm(); else setIsAdding(true); }}
          className={`px-6 py-3 text-white rounded-[1.5rem] font-bold shadow-lg transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95 ${
            (isAdding || editingTeacher) ? 'bg-rose-500' : 'bg-gradient-to-r from-rose-500 to-orange-500'
          }`}
        >
          <i className={`fa-solid ${(isAdding || editingTeacher) ? 'fa-times' : 'fa-plus'}`}></i>
          {(isAdding || editingTeacher) ? 'Cancel' : 'Add New Master'}
        </button>
      </div>

      {(isAdding || editingTeacher) && (
        <form onSubmit={editingTeacher ? handleUpdate : handleAdd} className="bg-white p-8 rounded-[2.5rem] shadow-xl border-4 border-rose-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="lg:col-span-3">
             <h2 className="text-xl font-black text-rose-600 flex items-center gap-2">
               <i className="fa-solid fa-chalkboard-user"></i>
               {editingTeacher ? 'Update Master Profile' : 'Enroll New Master'}
             </h2>
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-rose-50/30 rounded-[2rem] border-2 border-dashed border-rose-100 gap-3">
             <div className="w-32 h-32 rounded-[2rem] bg-white border-4 border-white shadow-lg overflow-hidden flex items-center justify-center relative group">
                {formData.photo ? (
                  <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <i className="fa-solid fa-camera text-3xl text-rose-200"></i>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                   <i className="fa-solid fa-upload text-white text-xl"></i>
                </div>
             </div>
             <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handlePhotoChange} />
             <p className="text-[10px] font-black text-rose-400 uppercase">Profile Picture</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Master Name</label>
              <input 
                required
                className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-rose-300 outline-none" 
                placeholder="e.g. Mr. Zuber"
                value={formData.teacherName} 
                onChange={e => setFormData({...formData, teacherName: e.target.value})} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expert Subject</label>
              <input 
                required
                className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-rose-300 outline-none" 
                placeholder="e.g. Quantum Physics"
                value={formData.subject} 
                onChange={e => setFormData({...formData, subject: e.target.value})} 
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned Grade</label>
              <select 
                required
                className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-rose-300 outline-none"
                value={formData.grade}
                onChange={e => setFormData({...formData, grade: e.target.value})}
              >
                <option value="">Select Grade</option>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n.toString()}>{n}th Grade</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Phone</label>
              <input 
                required
                type="tel"
                className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-rose-300 outline-none" 
                placeholder="Mobile Number"
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
              />
            </div>
          </div>

          <div className="lg:col-span-3 flex justify-end gap-3 pt-4">
             <button type="submit" className="px-10 py-3 bg-rose-600 text-white rounded-[1.5rem] font-black shadow-lg hover:bg-rose-700 transition-all">
                {editingTeacher ? 'Update Master' : 'Finalize Enrollment'}
             </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-[3rem] shadow-xl border border-rose-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-rose-50/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-rose-400 uppercase tracking-[0.2em]">Master Profile</th>
                <th className="px-8 py-5 text-[10px] font-black text-rose-400 uppercase tracking-[0.2em]">Subject & Grade</th>
                <th className="px-8 py-5 text-[10px] font-black text-rose-400 uppercase tracking-[0.2em]">Contact</th>
                <th className="px-8 py-5 text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {teachers.map(t => (
                <tr key={t.id} className="hover:bg-rose-50/10 group transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center font-black text-rose-600 overflow-hidden border-2 border-white shadow-sm">
                          {t.photo ? <img src={t.photo} className="w-full h-full object-cover" /> : t.teacherName.charAt(0)}
                       </div>
                       <span className="font-black text-gray-800">{t.teacherName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                       <span className="font-bold text-gray-700">{t.subject}</span>
                       <span className="text-[10px] font-black text-rose-400 bg-rose-50 w-fit px-2 py-0.5 rounded-lg uppercase mt-1">Class {t.grade}th</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-bold text-gray-500 text-sm">
                     <i className="fa-solid fa-phone-volume mr-2 text-rose-300"></i>
                     {t.phone}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                       <button onClick={() => { setEditingTeacher(t); setFormData(t); window.scrollTo({top: 0, behavior:'smooth'}); }} className="w-9 h-9 bg-indigo-50 text-indigo-500 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><i className="fa-solid fa-pen-nib"></i></button>
                       <button onClick={() => deleteTeacher(t.id)} className="w-9 h-9 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all"><i className="fa-solid fa-trash-can"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr>
                   <td colSpan={4} className="px-8 py-20 text-center">
                      <div className="opacity-20 flex flex-col items-center">
                         <i className="fa-solid fa-user-secret text-6xl mb-4"></i>
                         <p className="font-black text-xl">No Masters registered yet!</p>
                      </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherManagement;
