
import React, { useState, useRef } from 'react';
import { Student } from '../types';

interface StudentManagementProps {
  students: Student[];
  setStudents: (students: Student[]) => void;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ students, setStudents }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    rollNo: '',
    admissionNo: '',
    grNo: '',
    dob: '',
    grade: '',
    section: '',
    parentName: '',
    phone: '',
    emergencyContact: '',
    totalFees: 0,
    paidFees: 0,
    photo: '',
    aadharNo: '',
    uidNo: '',
    panNo: '',
    address: ''
  });

  const resetForm = () => {
    setFormData({ 
      name: '', 
      rollNo: '', 
      admissionNo: '', 
      grNo: '',
      dob: '', 
      grade: '', 
      section: '', 
      parentName: '', 
      phone: '', 
      emergencyContact: '', 
      totalFees: 0, 
      paidFees: 0, 
      photo: '',
      aadharNo: '',
      uidNo: '',
      panNo: '',
      address: ''
    });
    setIsAdding(false);
    setEditingStudent(null);
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
    const student: Student = {
      id: Math.random().toString(36).substr(2, 9),
      section: 'A',
      ...formData as Student
    };
    setStudents([...students, student]);
    resetForm();
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    
    const updatedStudents = students.map(s => 
      s.id === editingStudent.id ? { ...s, ...formData } as Student : s
    );
    setStudents(updatedStudents);
    resetForm();
  };

  const startEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData(student);
    setIsAdding(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteStudent = (id: string) => {
    const confirmed = window.confirm('🚨 Are you sure you want to delete this Hero? This cannot be undone!');
    if (confirmed) {
      if (editingStudent && editingStudent.id === id) {
        resetForm();
      }
      const updatedList = students.filter(s => s.id !== id);
      setStudents(updatedList);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-indigo-900">Student Directory</h1>
          <p className="text-indigo-400 font-medium">Manage your school heroes and their profiles.</p>
        </div>
        <button 
          onClick={() => {
            if (isAdding || editingStudent) resetForm();
            else setIsAdding(true);
          }}
          className={`px-6 py-3 text-white rounded-[1.5rem] font-bold shadow-lg transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95 ${
            (isAdding || editingStudent) ? 'bg-rose-500 shadow-rose-100' : 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-indigo-100'
          }`}
        >
          <i className={`fa-solid ${(isAdding || editingStudent) ? 'fa-times' : 'fa-plus'}`}></i>
          {(isAdding || editingStudent) ? 'Cancel Action' : 'Add New Student'}
        </button>
      </div>

      {(isAdding || editingStudent) && (
        <form onSubmit={editingStudent ? handleUpdate : handleAdd} className="bg-white p-8 rounded-[2.5rem] shadow-xl border-4 border-indigo-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
          
          <div className="lg:col-span-3 mb-2 flex items-center justify-between border-b-2 border-indigo-50 pb-4">
            <h2 className="text-xl font-black text-indigo-600 flex items-center gap-2">
              <i className={`fa-solid ${editingStudent ? 'fa-user-pen' : 'fa-user-plus'}`}></i>
              {editingStudent ? `Editing Hero: ${editingStudent.name}` : 'Register New Hero'}
            </h2>
          </div>

          {/* Photo Upload Column */}
          <div className="lg:row-span-3 flex flex-col items-center justify-center p-6 bg-indigo-50/50 rounded-[2rem] border-2 border-dashed border-indigo-200 gap-4">
             <div className="w-40 h-40 rounded-[2rem] bg-white border-4 border-white shadow-lg overflow-hidden flex items-center justify-center relative group">
                {formData.photo ? (
                  <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <i className="fa-solid fa-camera text-4xl text-indigo-200"></i>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                   <i className="fa-solid fa-upload text-white text-2xl"></i>
                </div>
             </div>
             <input 
               type="file" 
               accept="image/*" 
               className="hidden" 
               ref={fileInputRef} 
               onChange={handlePhotoChange} 
             />
             <button 
               type="button" 
               onClick={() => fileInputRef.current?.click()}
               className="text-sm font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest"
             >
               {formData.photo ? 'Change Photo' : 'Upload Photo'}
             </button>
          </div>

          <div className="space-y-1 z-10">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Full Name</label>
            <input 
              required
              className="w-full px-5 py-3 rounded-2xl bg-indigo-50/30 border border-transparent focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold" 
              placeholder="e.g. Rahul Sharma"
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>

          <div className="space-y-1 z-10">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Admission No</label>
            <input 
              required
              className="w-full px-5 py-3 rounded-2xl bg-indigo-50/30 border border-transparent focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold" 
              placeholder="e.g. ADM-2024-001"
              value={formData.admissionNo} 
              onChange={e => setFormData({...formData, admissionNo: e.target.value})} 
            />
          </div>

          <div className="space-y-1 z-10">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">GR Number</label>
            <input 
              className="w-full px-5 py-3 rounded-2xl bg-indigo-50/30 border border-transparent focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold" 
              placeholder="e.g. GR-9982"
              value={formData.grNo} 
              onChange={e => setFormData({...formData, grNo: e.target.value})} 
            />
          </div>

          <div className="space-y-1 z-10">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Roll No</label>
            <input 
              required
              className="w-full px-5 py-3 rounded-2xl bg-indigo-50/30 border border-transparent focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold" 
              placeholder="e.g. 101"
              value={formData.rollNo} 
              onChange={e => setFormData({...formData, rollNo: e.target.value})} 
            />
          </div>

          <div className="space-y-1 z-10">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Date of Birth</label>
            <input 
              required
              type="date"
              className="w-full px-5 py-3 rounded-2xl bg-indigo-50/30 border border-transparent focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold" 
              value={formData.dob} 
              onChange={e => setFormData({...formData, dob: e.target.value})} 
            />
          </div>

          <div className="space-y-1 z-10">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Class / Standard</label>
            <select 
              required
              className="w-full px-5 py-3 rounded-2xl bg-indigo-50/30 border border-transparent focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold appearance-none"
              value={formData.grade}
              onChange={e => setFormData({...formData, grade: e.target.value})}
            >
              <option value="">Select Class</option>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => <option key={num} value={num.toString()}>Class {num}</option>)}
            </select>
          </div>

          <div className="space-y-1 z-10">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Parent Name</label>
            <input 
              required
              className="w-full px-5 py-3 rounded-2xl bg-indigo-50/30 border border-transparent focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold" 
              placeholder="Father's or Mother's Name"
              value={formData.parentName} 
              onChange={e => setFormData({...formData, parentName: e.target.value})} 
            />
          </div>

          <div className="space-y-1 z-10">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Phone Number</label>
            <input 
              required
              type="tel"
              className="w-full px-5 py-3 rounded-2xl bg-indigo-50/30 border border-transparent focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold" 
              placeholder="e.g. 9876543210"
              value={formData.phone} 
              onChange={e => setFormData({...formData, phone: e.target.value})} 
            />
          </div>

          <div className="space-y-1 z-10">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Emergency Contact</label>
            <input 
              required
              type="tel"
              className="w-full px-5 py-3 rounded-2xl bg-indigo-50/30 border border-transparent focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold" 
              placeholder="Alternative number"
              value={formData.emergencyContact} 
              onChange={e => setFormData({...formData, emergencyContact: e.target.value})} 
            />
          </div>

          {/* Identity Section */}
          <div className="lg:col-span-3 pt-4 border-t-2 border-indigo-50 mt-2">
             <h3 className="text-xs font-black text-amber-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <i className="fa-solid fa-id-card"></i> Sensitive Identity Records
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Aadhar Number</label>
                  <input 
                    className="w-full px-5 py-3 rounded-2xl bg-amber-50/30 border border-transparent focus:bg-white focus:border-amber-300 outline-none transition-all font-bold" 
                    placeholder="12 Digit Aadhar"
                    maxLength={12}
                    value={formData.aadharNo} 
                    onChange={e => setFormData({...formData, aadharNo: e.target.value.replace(/\D/g, '')})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">UID Number</label>
                  <input 
                    className="w-full px-5 py-3 rounded-2xl bg-amber-50/30 border border-transparent focus:bg-white focus:border-amber-300 outline-none transition-all font-bold" 
                    placeholder="Unique ID Number"
                    value={formData.uidNo} 
                    onChange={e => setFormData({...formData, uidNo: e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">PAN Number</label>
                  <input 
                    className="w-full px-5 py-3 rounded-2xl bg-amber-50/30 border border-transparent focus:bg-white focus:border-amber-300 outline-none transition-all font-bold uppercase" 
                    placeholder="PAN Card No."
                    value={formData.panNo} 
                    onChange={e => setFormData({...formData, panNo: e.target.value.toUpperCase()})} 
                  />
                </div>
             </div>
          </div>

          <div className="lg:col-span-3 space-y-1">
             <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Permanent Residential Address</label>
             <textarea 
               className="w-full px-5 py-4 rounded-2xl bg-indigo-50/30 border border-transparent focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium h-24"
               placeholder="Enter full address with City and Pin Code..."
               value={formData.address}
               onChange={e => setFormData({...formData, address: e.target.value})}
             />
          </div>

          <div className="lg:col-span-2 space-y-1 z-10">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Annual Fee (₹)</label>
            <input 
              type="number"
              className="w-full px-5 py-3 rounded-2xl bg-indigo-50/30 border border-transparent focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold" 
              value={formData.totalFees} 
              onChange={e => setFormData({...formData, totalFees: Number(e.target.value)})} 
            />
          </div>

          <div className="lg:col-span-3 flex justify-end gap-4 mt-6 pt-6 border-t border-indigo-50">
             <button 
              type="button"
              onClick={resetForm}
              className="px-8 py-4 bg-gray-100 text-gray-600 rounded-[2rem] font-black hover:bg-gray-200 transition-all"
             >
               Cancel
             </button>
             <button 
              type="submit" 
              className={`px-10 py-4 text-white rounded-[2rem] font-black shadow-lg transition-all transform hover:scale-105 ${editingStudent ? 'bg-gradient-to-r from-indigo-500 to-indigo-700 shadow-indigo-100' : 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-100'}`}
             >
               <i className={`fa-solid ${editingStudent ? 'fa-check-double' : 'fa-cloud-arrow-up'} mr-2`}></i>
               {editingStudent ? 'Save Changes' : 'Create Hero Record'}
             </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-[3rem] shadow-xl border border-indigo-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-indigo-50/50">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Adm / GR / Roll</th>
                <th className="px-6 py-5 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Super Hero</th>
                <th className="px-6 py-5 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Identity & Details</th>
                <th className="px-6 py-5 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Address & Parent</th>
                <th className="px-6 py-5 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-50">
              {students.length > 0 ? students.map(s => (
                <tr key={s.id} className={`transition-all group ${editingStudent?.id === s.id ? 'bg-indigo-100/50' : 'hover:bg-indigo-50/20'}`}>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-indigo-300">{s.admissionNo}</span>
                      <span className="text-[10px] font-bold text-amber-500">{s.grNo || 'No GR #'}</span>
                      <span className="font-black text-indigo-600">Roll: {s.rollNo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-100 to-purple-100 flex items-center justify-center font-black text-indigo-600 text-sm shadow-sm group-hover:scale-110 transition-transform overflow-hidden border-2 border-white">
                        {s.photo ? (
                          <img src={s.photo} alt={s.name} className="w-full h-full object-cover" />
                        ) : (
                          s.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-gray-800 block">{s.name}</span>
                        <span className="px-2 py-0.5 w-fit bg-amber-100 text-amber-700 rounded-lg text-[8px] font-black uppercase mt-1 tracking-wider">
                          Class {s.grade}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      {s.aadharNo && (
                        <span className="text-[10px] font-black text-gray-500 flex items-center gap-1">
                           <i className="fa-solid fa-id-card-clip text-amber-400"></i> Aadhar: {s.aadharNo}
                        </span>
                      )}
                      <span className="text-xs font-bold text-gray-400">DOB: {s.dob}</span>
                      {s.panNo && <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">PAN: {s.panNo}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col text-sm max-w-[200px]">
                      <span className="font-semibold text-gray-700 truncate">{s.parentName}</span>
                      <span className="text-gray-400 text-[10px] font-bold truncate mt-0.5">
                        <i className="fa-solid fa-location-dot mr-1"></i> {s.address || 'No Address Logged'}
                      </span>
                      <span className="text-rose-400 text-[10px] font-black flex items-center gap-1 mt-1">
                        <i className="fa-solid fa-phone"></i> {s.phone}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => startEdit(s)}
                        title="Modify Profile"
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all transform active:scale-90 ${editingStudent?.id === s.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-indigo-50 text-indigo-500 hover:bg-indigo-100'}`}
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button 
                        onClick={() => deleteStudent(s.id)}
                        title="Delete Hero Profile"
                        className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all transform active:scale-90 shadow-sm hover:shadow-rose-100 flex items-center justify-center"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                        <i className="fa-solid fa-user-ninja text-6xl text-indigo-200 animate-bounce"></i>
                      </div>
                      <p className="text-indigo-900 font-black text-2xl">No heroes registered!</p>
                      <p className="text-indigo-400 text-sm font-bold mt-2">Start by adding your first student to the academy.</p>
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

export default StudentManagement;
