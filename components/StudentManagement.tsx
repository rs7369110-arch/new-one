
import React, { useState, useRef } from 'react';
import { Student } from '../types';

interface StudentManagementProps {
  students: Student[];
  setStudents: (students: Student[]) => void;
}

/**
 * InputField moved outside of the main component to prevent focus loss.
 * Defining components inside render causes them to unmount and remount 
 * on every state change (every keystroke), causing the typing problem.
 */
const InputField = ({ label, field, type = 'text', required = false, placeholder = '', options = [], value, onChange }: any) => (
  <div className="space-y-1 w-full">
    <label className="text-[10px] font-black text-teal-500 uppercase tracking-widest ml-1">{label} {required && '*'}</label>
    {type === 'select' ? (
      <select 
        required={required}
        className="w-full px-5 py-3 rounded-2xl bg-teal-50/40 border border-transparent focus:bg-white focus:border-teal-400 outline-none font-bold text-teal-900 transition-all"
        value={value || ''}
        onChange={e => onChange(field, e.target.value)}
      >
        <option value="">Select {label}</option>
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    ) : type === 'textarea' ? (
      <textarea 
        required={required}
        className="w-full px-5 py-3 rounded-2xl bg-teal-50/40 border border-transparent focus:bg-white focus:border-teal-400 outline-none font-bold h-24 text-teal-900 transition-all"
        placeholder={placeholder}
        value={value || ''}
        onChange={e => onChange(field, e.target.value)}
      />
    ) : (
      <input 
        required={required}
        type={type}
        className="w-full px-5 py-3 rounded-2xl bg-teal-50/40 border border-transparent focus:bg-white focus:border-teal-400 outline-none font-bold text-teal-900 transition-all"
        placeholder={placeholder}
        value={value || ''}
        onChange={e => onChange(field, e.target.value)}
      />
    )}
  </div>
);

const StudentManagement: React.FC<StudentManagementProps> = ({ students, setStudents }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const initialForm: Partial<Student> = {
    name: '',
    admissionNo: '',
    admissionDate: new Date().toISOString().split('T')[0],
    grade: '',
    section: 'A',
    rollNo: '',
    academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    dob: '',
    gender: 'MALE',
    bloodGroup: '',
    photo: '',
    fatherName: '',
    motherName: '',
    guardianName: '',
    phone: '',
    alternatePhone: '',
    email: '',
    fatherOccupation: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    permanentAddress: '',
    prevSchoolName: '',
    prevLastClass: '',
    tcNo: '',
    leavingReason: '',
    medicalConditions: '',
    allergies: '',
    emergencyContactName: '',
    emergencyContact: '',
    totalFees: 0,
    paidFees: 0
  };

  const [formData, setFormData] = useState<Partial<Student>>(initialForm);
  const [isPermanentSame, setIsPermanentSame] = useState(false);

  const handlePermanentSameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsPermanentSame(checked);
    if (checked) {
      setFormData(prev => ({ ...prev, permanentAddress: prev.address || '' }));
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setIsPermanentSame(false);
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

  // Centralized change handler to avoid unnecessary complexity in inputs
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getParentName = (data: Partial<Student>) => {
    return data.fatherName || data.guardianName || data.motherName || 'Not Specified';
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const student: Student = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData as Student,
      parentName: getParentName(formData),
      permanentAddress: isPermanentSame ? formData.address! : (formData.permanentAddress || formData.address!)
    };
    setStudents([...students, student]);
    resetForm();
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    const updatedStudents = students.map(s => 
      s.id === editingStudent.id ? { 
        ...s, 
        ...formData, 
        parentName: getParentName(formData),
        permanentAddress: isPermanentSame ? formData.address : (formData.permanentAddress || formData.address) 
      } as Student : s
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
      if (editingStudent && editingStudent.id === id) resetForm();
      setStudents(students.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-teal-900">Student Entry Console</h1>
          <p className="text-teal-500 font-medium">Register and archive academy heroes with precision.</p>
        </div>
        <button 
          onClick={() => {
            if (isAdding || editingStudent) resetForm();
            else setIsAdding(true);
          }}
          className={`px-8 py-4 text-white rounded-[1.8rem] font-bold shadow-xl transition-all flex items-center gap-3 transform hover:scale-105 active:scale-95 ${
            (isAdding || editingStudent) ? 'bg-rose-500' : 'bg-teal-600 shadow-teal-900/10'
          }`}
        >
          <i className={`fa-solid ${(isAdding || editingStudent) ? 'fa-xmark' : 'fa-user-plus'}`}></i>
          {(isAdding || editingStudent) ? 'Cancel Process' : 'Register New Student'}
        </button>
      </div>

      {(isAdding || editingStudent) && (
        <form onSubmit={editingStudent ? handleUpdate : handleAdd} className="bg-white p-10 rounded-[3rem] shadow-2xl border-4 border-teal-50 space-y-12 animate-fade-in relative overflow-hidden">
          
          {/* Section: Student Basics */}
          <div className="space-y-8">
            <h2 className="text-xl font-black text-teal-700 flex items-center gap-3 border-b-2 border-teal-50 pb-4">
               <i className="fa-solid fa-graduation-cap"></i> Student Essentials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="lg:row-span-3 flex flex-col items-center gap-4 p-6 bg-teal-50/20 rounded-[2.5rem] border-2 border-dashed border-teal-100">
                  <div className="w-40 h-40 rounded-[2rem] bg-white shadow-lg overflow-hidden flex items-center justify-center relative group border-4 border-white">
                    {formData.photo ? <img src={formData.photo} className="w-full h-full object-cover" /> : <i className="fa-solid fa-camera text-4xl text-teal-100"></i>}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                       <i className="fa-solid fa-upload text-white text-2xl"></i>
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
                  <p className="text-[10px] font-black text-teal-400 uppercase">Profile Photo</p>
               </div>
               <InputField label="Student Full Name" field="name" required placeholder="Full name" value={formData.name} onChange={handleInputChange} />
               <InputField label="Admission Number" field="admissionNo" required placeholder="ADM-001" value={formData.admissionNo} onChange={handleInputChange} />
               <InputField label="Date of Admission" field="admissionDate" type="date" required value={formData.admissionDate} onChange={handleInputChange} />
               <InputField label="Class / Grade" field="grade" type="select" required options={['1','2','3','4','5','6','7','8','9','10','11','12']} value={formData.grade} onChange={handleInputChange} />
               <InputField label="Section" field="section" type="select" options={['A','B','C','D']} value={formData.section} onChange={handleInputChange} />
               <InputField label="Roll Number" field="rollNo" required placeholder="e.g. 101" value={formData.rollNo} onChange={handleInputChange} />
               <InputField label="Academic Year" field="academicYear" placeholder="2024-2025" value={formData.academicYear} onChange={handleInputChange} />
               <InputField label="Date of Birth" field="dob" type="date" required value={formData.dob} onChange={handleInputChange} />
               <InputField label="Gender" field="gender" type="select" required options={['MALE', 'FEMALE', 'OTHER']} value={formData.gender} onChange={handleInputChange} />
               <InputField label="Blood Group" field="bloodGroup" type="select" options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} value={formData.bloodGroup} onChange={handleInputChange} />
            </div>
          </div>

          {/* Section: Parent Details */}
          <div className="space-y-8">
            <h2 className="text-xl font-black text-teal-700 flex items-center gap-3 border-b-2 border-teal-50 pb-4">
               <i className="fa-solid fa-users"></i> Parent / Guardian Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <InputField label="Father's Name" field="fatherName" required value={formData.fatherName} onChange={handleInputChange} />
               <InputField label="Mother's Name" field="motherName" required value={formData.motherName} onChange={handleInputChange} />
               <InputField label="Guardian Name (Optional)" field="guardianName" value={formData.guardianName} onChange={handleInputChange} />
               <InputField label="Primary Mobile" field="phone" required type="tel" value={formData.phone} onChange={handleInputChange} />
               <InputField label="Alternate Mobile" field="alternatePhone" type="tel" value={formData.alternatePhone} onChange={handleInputChange} />
               <InputField label="Email Address" field="email" type="email" value={formData.email} onChange={handleInputChange} />
               <InputField label="Father's Occupation" field="fatherOccupation" value={formData.fatherOccupation} onChange={handleInputChange} />
            </div>
          </div>

          {/* Section: Address Details */}
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b-2 border-teal-50 pb-4">
               <h2 className="text-xl font-black text-teal-700 flex items-center gap-3">
                  <i className="fa-solid fa-map-location-dot"></i> Residential Protocol
               </h2>
               <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded-lg border-2 border-teal-200 text-teal-600 focus:ring-teal-500" 
                    checked={isPermanentSame}
                    onChange={handlePermanentSameChange}
                  />
                  <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest group-hover:text-teal-600 transition-colors">Permanent Address (Same as current ✔)</span>
               </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="lg:col-span-2">
                 <InputField label="Full Current Address" field="address" type="textarea" required placeholder="Address details..." value={formData.address} onChange={handleInputChange} />
               </div>
               <InputField label="City" field="city" required value={formData.city} onChange={handleInputChange} />
               <InputField label="State" field="state" required value={formData.state} onChange={handleInputChange} />
               <InputField label="Pincode" field="pincode" required value={formData.pincode} onChange={handleInputChange} />
               {!isPermanentSame && (
                 <div className="lg:col-span-4">
                    <InputField label="Permanent Address" field="permanentAddress" type="textarea" placeholder="Enter permanent address..." value={formData.permanentAddress} onChange={handleInputChange} />
                 </div>
               )}
            </div>
          </div>

          {/* Section: Previous School */}
          <div className="space-y-8">
            <h2 className="text-xl font-black text-teal-700 flex items-center gap-3 border-b-2 border-teal-50 pb-4">
               <i className="fa-solid fa-landmark"></i> Academic Heritage
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <InputField label="Previous School Name" field="prevSchoolName" value={formData.prevSchoolName} onChange={handleInputChange} />
               <InputField label="Last Class Passed" field="prevLastClass" value={formData.prevLastClass} onChange={handleInputChange} />
               <InputField label="Transfer Certificate (TC #)" field="tcNo" value={formData.tcNo} onChange={handleInputChange} />
               <InputField label="Reason for Leaving" field="leavingReason" value={formData.leavingReason} onChange={handleInputChange} />
            </div>
          </div>

          {/* Section: Health & Emergency */}
          <div className="space-y-8">
            <h2 className="text-xl font-black text-teal-700 flex items-center gap-3 border-b-2 border-teal-50 pb-4">
               <i className="fa-solid fa-heart-pulse"></i> Vitality & Emergency Protocol
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <InputField label="Medical Conditions" field="medicalConditions" placeholder="None" value={formData.medicalConditions} onChange={handleInputChange} />
               <InputField label="Allergy Details" field="allergies" placeholder="None" value={formData.allergies} onChange={handleInputChange} />
               <InputField label="Emergency Contact Name" field="emergencyContactName" required value={formData.emergencyContactName} onChange={handleInputChange} />
               <InputField label="Emergency Contact Number" field="emergencyContact" required type="tel" value={formData.emergencyContact} onChange={handleInputChange} />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-10 border-t border-teal-50">
             <button type="button" onClick={resetForm} className="px-10 py-5 bg-gray-100 text-gray-500 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all">Discard</button>
             <button type="submit" className="px-16 py-5 bg-teal-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-teal-200 hover:bg-black transition-all transform hover:scale-105">
                {editingStudent ? 'Update Registry' : 'Initialize Hero Record'}
             </button>
          </div>
        </form>
      )}

      {/* Directory Table */}
      <div className="bg-white rounded-[3rem] shadow-xl border border-teal-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-teal-50/50">
              <tr className="text-[10px] font-black text-teal-400 uppercase tracking-widest">
                <th className="px-8 py-5">Hero Profile</th>
                <th className="px-8 py-5">Adm / Roll</th>
                <th className="px-8 py-5">Academic Year</th>
                <th className="px-8 py-5">Emergency Link</th>
                <th className="px-8 py-5 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-50">
              {students.length > 0 ? students.map(s => (
                <tr key={s.id} className="hover:bg-teal-50/20 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm font-black text-teal-600">
                          {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : s.name.charAt(0)}
                       </div>
                       <div>
                          <p className="font-bold text-teal-950">{s.name}</p>
                          <p className="text-[9px] font-black text-teal-400 uppercase mt-0.5">Class {s.grade} • Section {s.section}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-black text-gray-400 text-xs">
                     <p className="text-teal-600">{s.admissionNo}</p>
                     <p className="mt-1">#{s.rollNo}</p>
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-gray-500">{s.academicYear}</td>
                  <td className="px-8 py-5 text-xs font-black text-teal-400">
                     <p>{s.emergencyContactName}</p>
                     <p className="text-rose-500 mt-0.5">{s.emergencyContact}</p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => startEdit(s)} className="w-10 h-10 bg-teal-50 text-teal-500 rounded-xl hover:bg-teal-600 hover:text-white transition-all"><i className="fa-solid fa-pen-nib"></i></button>
                       <button onClick={() => deleteStudent(s.id)} className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><i className="fa-solid fa-trash-can"></i></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-32 text-center opacity-30">
                     <i className="fa-solid fa-users-slash text-6xl mb-6 text-teal-100"></i>
                     <p className="text-2xl font-black uppercase tracking-widest text-teal-200">Registry Clean</p>
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
