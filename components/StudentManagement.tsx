
import React, { useState, useRef, useMemo } from 'react';
import { Student, User, UserRole } from '../types';

interface StudentManagementProps {
  user: User;
  students: Student[];
  setStudents: (students: Student[]) => void;
  onDelete: (id: string) => Promise<void>;
  onLogActivity: (actionType: 'CREATE' | 'UPDATE' | 'DELETE', module: string, target: string, details?: string) => void;
}

const InputField = ({ label, field, type = 'text', required = false, placeholder = '', options = [], value, onChange }: any) => (
  <div className="space-y-1 w-full">
    <label className="text-[10px] font-black text-teal-600 uppercase tracking-widest ml-1">{label} {required && '*'}</label>
    {type === 'select' ? (
      <select 
        required={required}
        className="w-full px-5 py-3 rounded-2xl bg-teal-50/60 border-2 border-transparent focus:bg-white focus:border-teal-400 outline-none font-bold text-teal-900 transition-all shadow-inner"
        value={value || ''}
        onChange={e => onChange(field, e.target.value)}
      >
        <option value="">Select {label}</option>
        {options.map((opt: any) => (
          <option key={typeof opt === 'object' ? opt.value : opt} value={typeof opt === 'object' ? opt.value : opt}>
            {typeof opt === 'object' ? opt.label : opt}
          </option>
        ))}
      </select>
    ) : type === 'textarea' ? (
      <textarea 
        required={required}
        className="w-full px-5 py-3 rounded-2xl bg-teal-50/60 border-2 border-transparent focus:bg-white focus:border-teal-400 outline-none font-bold h-24 text-teal-900 transition-all shadow-inner"
        placeholder={placeholder}
        value={value || ''}
        onChange={e => onChange(field, e.target.value)}
      />
    ) : (
      <input 
        required={required}
        type={type}
        className="w-full px-5 py-3 rounded-2xl bg-teal-50/60 border-2 border-transparent focus:bg-white focus:border-teal-400 outline-none font-bold text-teal-900 shadow-inner"
        placeholder={placeholder}
        value={value || ''}
        onChange={e => onChange(field, e.target.value)}
      />
    )}
  </div>
);

const PhotoUpload = ({ label, value, onUpload, icon = 'fa-camera' }: any) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col items-center gap-2 group">
      <div 
        className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white shadow-lg overflow-hidden flex items-center justify-center relative border-4 border-white transition-all group-hover:scale-105 cursor-pointer"
        onClick={() => ref.current?.click()}
      >
        {value ? <img src={value} className="w-full h-full object-cover" /> : <i className={`fa-solid ${icon} text-3xl text-teal-100`}></i>}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
           <i className="fa-solid fa-upload text-white text-xl"></i>
        </div>
      </div>
      <input type="file" ref={ref} className="hidden" accept="image/*" onChange={e => {
        const file = e.target.files?.[0];
        if(file) {
          const reader = new FileReader();
          reader.onloadend = () => onUpload(reader.result);
          reader.readAsDataURL(file);
        }
      }} />
      <p className="text-[8px] font-black text-teal-400 uppercase tracking-widest">{label}</p>
    </div>
  );
};

const StudentManagement: React.FC<StudentManagementProps> = ({ user, students, setStudents, onDelete, onLogActivity }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<{id: string, name: string} | null>(null);
  const [studentToCancel, setStudentToCancel] = useState<{id: string, name: string} | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const isAdmin = user.role === UserRole.ADMIN;

  const initialForm: Partial<Student> = {
    name: '',
    admissionNo: '',
    grNo: '',
    admissionDate: new Date().toISOString().split('T')[0],
    grade: '1',
    section: 'A',
    medium: 'ENGLISH',
    rollNo: '',
    academicYear: '2024-25',
    dob: '',
    gender: 'MALE',
    bloodGroup: 'O+',
    photo: '',
    fatherPhoto: '',
    motherPhoto: '',
    aadharNo: '',
    fatherName: '',
    motherName: '',
    guardianName: '',
    phone: '',
    alternatePhone: '',
    email: '',
    emergencyContact: '',
    emergencyContactName: '',
    fatherOccupation: '',
    address: '',
    permanentAddress: '',
    city: '',
    state: '',
    pincode: '',
    prevSchoolName: '',
    prevLastClass: '',
    tcNo: '',
    status: 'PENDING',
    totalFees: 0,
    paidFees: 0,
    documents: {
      aadharCard: '',
      birthCert: '',
      transferCert: '',
      prevMarksheet: ''
    }
  };

  const [formData, setFormData] = useState<Partial<Student>>(initialForm);

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.status !== 'CANCELLED' && (
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.includes(searchQuery)
      )
    ).slice().reverse();
  }, [students, searchQuery]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setCurrentStep(1);
    setIsAdding(false);
    setEditingStudent(null);
  };

  const saveToRegistry = () => {
    const studentData: Student = {
      id: editingStudent?.id || Math.random().toString(36).substr(2, 9),
      ...formData as Student,
      parentName: formData.fatherName || formData.motherName || formData.guardianName || 'Guardian',
      status: formData.status || 'PENDING'
    };

    if (editingStudent) {
      setStudents(students.map(s => s.id === editingStudent.id ? studentData : s));
      onLogActivity('UPDATE', 'Student Registry', studentData.name, `Modified profile for ADM: ${studentData.admissionNo}`);
    } else {
      setStudents([...students, studentData]);
      onLogActivity('CREATE', 'Student Registry', studentData.name, `Enrolled new student in Class ${studentData.grade}`);
    }
    resetForm();
  };

  const handleCancelStudent = () => {
    if (!studentToCancel || !cancelReason.trim()) return;

    const updatedStudents = students.map(s => {
      if (s.id === studentToCancel.id) {
        return {
          ...s,
          status: 'CANCELLED',
          cancelledDate: new Date().toLocaleString(),
          cancelledBy: user.name,
          cancelReason: cancelReason.trim()
        } as Student;
      }
      return s;
    });

    setStudents(updatedStudents);
    onLogActivity('UPDATE', 'Student Registry', studentToCancel.name, `Membership cancelled. Reason: ${cancelReason}`);
    setStudentToCancel(null);
    setCancelReason('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
      return;
    }
    saveToRegistry();
  };

  const startEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      ...initialForm,
      ...student
    });
    setIsAdding(true);
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    onLogActivity('DELETE', 'Student Registry', studentToDelete.name, `Permanently erased student record.`);
    await onDelete(studentToDelete.id);
    setStudentToDelete(null);
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-8 md:mb-12 px-2 md:px-4 max-w-2xl mx-auto overflow-x-auto pb-2">
      {[1, 2, 3, 4, 5].map((step) => (
        <div key={step} className="flex items-center flex-1 last:flex-none">
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-[10px] md:text-xs transition-all shadow-lg shrink-0 ${
            currentStep === step ? 'bg-teal-600 text-white scale-110 ring-4 ring-teal-100' : 
            currentStep > step ? 'bg-emerald-50 text-white' : 'bg-gray-100 text-gray-400'
          }`}>
            {currentStep > step ? <i className="fa-solid fa-check"></i> : step}
          </div>
          {step < 5 && (
            <div className={`h-1 flex-1 mx-1 md:mx-2 rounded-full transition-all ${currentStep > step ? 'bg-emerald-50' : 'bg-gray-100'}`}></div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div>
           <div className="flex items-center gap-3">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-[1rem] text-white flex items-center justify-center text-lg md:text-xl shadow-[0_8px_16px_rgba(0,0,0,0.2)] transition-colors ${editingStudent ? 'bg-amber-500' : 'bg-teal-600'}`}>
                 <i className={`fa-solid ${editingStudent ? 'fa-user-pen' : 'fa-user-plus'}`}></i>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-teal-950 tracking-tighter uppercase leading-none">
                  {editingStudent ? 'Edit Student' : 'Admission Hub'}
                </h1>
                <p className="text-teal-500 font-bold text-[8px] md:text-[10px] uppercase tracking-[0.3em] mt-1 md:mt-2 italic">Registry System</p>
              </div>
           </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative group flex-1">
             <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-teal-300"></i>
             <input 
               className="w-full pl-12 pr-6 py-4 bg-white border-2 border-teal-50 rounded-[1.5rem] outline-none focus:border-teal-400 font-bold text-sm shadow-[0_10px_20px_rgba(0,0,0,0.05)] transition-all"
               placeholder="Search Hero..."
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
             />
          </div>
          <button 
            onClick={() => isAdding ? resetForm() : setIsAdding(true)}
            className={`w-full sm:w-auto px-8 py-4 text-white rounded-[1.5rem] font-black transition-all flex items-center justify-center gap-3 active:scale-95 ${
              isAdding ? 'btn-3d-rose bg-rose-500' : 'btn-3d-indigo bg-teal-900'
            }`}
          >
            <i className={`fa-solid ${isAdding ? 'fa-xmark' : 'fa-plus'}`}></i>
            <span className="text-xs uppercase">{isAdding ? 'Abort' : 'Enroll New'}</span>
          </button>
        </div>
      </header>

      {isAdding && (
        <div className={`bg-white p-6 md:p-14 rounded-[2.5rem] md:rounded-[4rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.15)] border-4 animate-slide-up relative overflow-hidden transition-all ${editingStudent ? 'border-amber-100' : 'border-teal-50'}`}>
          <StepIndicator />
          <form onSubmit={handleSubmit} className="space-y-8 md:space-y-12 relative z-10">
            {currentStep === 1 && (
              <div className="space-y-6 md:space-y-10 animate-fade-in">
                 <h2 className="text-lg md:text-2xl font-black text-teal-800 uppercase tracking-tight flex items-center gap-2 border-b-2 border-teal-50 pb-3 md:pb-4">
                    <i className="fa-solid fa-id-card-clip"></i> Identity Profile
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    <div className="lg:row-span-3 flex flex-col items-center">
                       <PhotoUpload label="Student Portrait" value={formData.photo} onUpload={(data: string) => handleInputChange('photo', data)} icon="fa-user-graduate" />
                    </div>
                    <div className="lg:col-span-2">
                       <InputField label="Full Name" field="name" required placeholder="Legal Name" value={formData.name} onChange={handleInputChange} />
                    </div>
                    <InputField label="Roll No" field="rollNo" required placeholder="Class Roll #" value={formData.rollNo} onChange={handleInputChange} />
                    <InputField label="Adm No" field="admissionNo" required placeholder="Unique ID" value={formData.admissionNo} onChange={handleInputChange} />
                    <InputField label="GR No" field="grNo" placeholder="GR Number" value={formData.grNo} onChange={handleInputChange} />
                    <InputField label="DOB" field="dob" type="date" required value={formData.dob} onChange={handleInputChange} />
                    <InputField label="Gender" field="gender" type="select" required options={['MALE', 'FEMALE', 'OTHER']} value={formData.gender} onChange={handleInputChange} />
                    <InputField label="Blood" field="bloodGroup" type="select" options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']} value={formData.bloodGroup} onChange={handleInputChange} />
                    <InputField label="Grade" field="grade" type="select" required options={['1','2','3','4','5','6','7','8','9','10','11','12']} value={formData.grade} onChange={handleInputChange} />
                    <InputField label="Section" field="section" type="select" options={['A', 'B', 'C', 'D']} value={formData.section} onChange={handleInputChange} />
                 </div>
              </div>
            )}
            
            {currentStep === 2 && (
              <div className="space-y-6 md:space-y-10 animate-fade-in">
                 <h2 className="text-lg md:text-2xl font-black text-teal-800 uppercase tracking-tight flex items-center gap-2 border-b-2 border-teal-50 pb-3 md:pb-4">
                    <i className="fa-solid fa-users-viewfinder"></i> Family & Contact Detail
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                    <div className="p-6 bg-teal-50/40 rounded-[2.5rem] border border-teal-100 flex flex-col md:flex-row items-center gap-6">
                       <PhotoUpload label="Father Photo" value={formData.fatherPhoto} onUpload={(data: string) => handleInputChange('fatherPhoto', data)} icon="fa-user-tie" />
                       <div className="flex-1 w-full space-y-4">
                          <InputField label="Father's Name" field="fatherName" required value={formData.fatherName} onChange={handleInputChange} />
                          <InputField label="Father Occupation" field="fatherOccupation" value={formData.fatherOccupation} onChange={handleInputChange} />
                       </div>
                    </div>

                    <div className="p-6 bg-rose-50/40 rounded-[2.5rem] border border-rose-100 flex flex-col md:flex-row items-center gap-6">
                       <PhotoUpload label="Mother Photo" value={formData.motherPhoto} onUpload={(data: string) => handleInputChange('motherPhoto', data)} icon="fa-user-nurse" />
                       <div className="flex-1 w-full space-y-4">
                          <InputField label="Mother's Name" field="motherName" required value={formData.motherName} onChange={handleInputChange} />
                          <InputField label="Emergency Contact" field="emergencyContact" type="tel" value={formData.emergencyContact} onChange={handleInputChange} />
                       </div>
                    </div>

                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                       <InputField label="Primary Mobile" field="phone" required type="tel" placeholder="10 Digit No" value={formData.phone} onChange={handleInputChange} />
                       <InputField label="Email Address" field="email" type="email" placeholder="Parent Email" value={formData.email} onChange={handleInputChange} />
                    </div>

                    <div className="md:col-span-2">
                       <InputField label="Current Residential Address" field="address" type="textarea" required placeholder="Flat #, Street, Locality, City..." value={formData.address} onChange={handleInputChange} />
                    </div>
                 </div>
              </div>
            )}

            {currentStep >= 3 && (
               <div className="p-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Entry Stages Proceeding... (Documents & Status)</p>
                  <p className="text-[10px] text-gray-400 mt-2">Stage {currentStep} logic active.</p>
               </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-6 border-t border-teal-50">
               <button 
                 type="button" 
                 onClick={() => currentStep === 1 ? resetForm() : setCurrentStep(prev => prev - 1)}
                 className="w-full sm:w-auto px-10 py-4 bg-gray-200 text-gray-600 rounded-[1.2rem] font-black uppercase text-[10px] tracking-widest active:translate-y-1"
               >
                 {currentStep === 1 ? 'Discard' : 'Back'}
               </button>
               
               <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  {editingStudent && (
                    <button 
                      type="button" 
                      onClick={saveToRegistry}
                      className="btn-3d-indigo w-full px-10 py-4 bg-amber-500 text-white rounded-[1.2rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 border-amber-700"
                    >
                      <i className="fa-solid fa-bolt"></i> Quick Save
                    </button>
                  )}
                  <button 
                    type="submit" 
                    className="btn-3d-indigo w-full px-14 py-4 bg-teal-900 text-white rounded-[1.2rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-4 border-teal-950"
                  >
                    {currentStep === 5 ? (editingStudent ? 'Seal Change' : 'Finalize') : 'Next Stage'}
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>
               </div>
            </div>
          </form>
        </div>
      )}

      {/* Registry Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600 shadow-sm"><i className="fa-solid fa-database text-xs"></i></div>
              <h3 className="text-sm font-black text-teal-950 uppercase tracking-tight">Active Registry</h3>
           </div>
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white border border-slate-100 px-3 py-1 rounded-full shadow-sm">{filteredStudents.length} Profiles</span>
        </div>

        <div className="md:hidden space-y-5">
           {filteredStudents.length > 0 ? filteredStudents.map(s => (
              <div key={s.id} className="bg-white p-5 rounded-[2.5rem] shadow-[0_15px_35px_rgba(0,0,0,0.08)] border border-teal-50 space-y-4 animate-fade-in group hover:shadow-[0_25px_50px_rgba(0,0,0,0.12)] transition-all card-3d">
                 <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-[1.8rem] bg-teal-50 border-2 border-white shadow-[0_10px_20px_rgba(0,0,0,0.1)] overflow-hidden shrink-0">
                       {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-teal-600 text-xl">{s.name.charAt(0)}</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                       <h4 className="font-black text-slate-900 text-base uppercase truncate leading-none">{s.name}</h4>
                       <div className="flex items-center gap-2 mt-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-500 font-black text-[8px] uppercase tracking-tighter border border-indigo-100">ADM: {s.admissionNo}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Class {s.grade}-{s.section}</span>
                       </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                       <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-[0_4px_8px_rgba(0,0,0,0.1)] ${
                         s.status === 'APPROVED' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                       }`}>
                          {s.status}
                       </span>
                    </div>
                 </div>

                 <div className="flex items-center justify-between gap-3 pt-2">
                    <div className="flex gap-3">
                       <button onClick={() => startEdit(s)} className="w-11 h-11 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.05)] active:scale-90 transition-all border border-teal-100">
                          <i className="fa-solid fa-pen-nib text-sm"></i>
                       </button>
                       <button onClick={() => setStudentToDelete({id: s.id, name: s.name})} className="w-11 h-11 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.05)] active:scale-90 transition-all border border-rose-100">
                          <i className="fa-solid fa-trash-can text-sm"></i>
                       </button>
                    </div>
                    {isAdmin && (
                       <button onClick={() => setStudentToCancel({id: s.id, name: s.name})} className="btn-3d-slate flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-[1.2rem] text-[9px] font-black uppercase tracking-widest border-black">
                          <i className="fa-solid fa-user-slash text-rose-400"></i> Cancel
                       </button>
                    )}
                 </div>
              </div>
           )) : (
              <div className="py-20 text-center opacity-30">
                 <i className="fa-solid fa-database text-6xl mb-4"></i>
                 <p className="text-xl font-black uppercase tracking-widest">Registry Empty</p>
              </div>
           )}
        </div>

        <div className="hidden md:block bg-white rounded-[3.5rem] shadow-2xl border border-teal-50 overflow-hidden">
           <table className="w-full text-left">
              <thead>
                <tr className="bg-teal-50/20 text-[10px] font-black text-teal-400 uppercase tracking-widest">
                  <th className="px-10 py-6">Hero Identity</th>
                  <th className="px-10 py-6">Admission</th>
                  <th className="px-10 py-6">Contact</th>
                  <th className="px-10 py-6">Status</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-50">
                {filteredStudents.map(s => (
                  <tr key={s.id} className="hover:bg-teal-50/10 group transition-all">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                         <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center overflow-hidden border-2 border-teal-50 shadow-sm font-black text-teal-600 group-hover:scale-110 transition-transform">
                            {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : s.name.charAt(0)}
                         </div>
                         <div><p className="font-black text-slate-800 text-base">{s.name}</p><p className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Roll: {s.rollNo}</p></div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-xs font-black text-slate-600">{s.admissionNo}</td>
                    <td className="px-10 py-6 text-xs font-black text-slate-600">{s.phone}</td>
                    <td className="px-10 py-6">
                      <span className={`px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${s.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{s.status}</span>
                    </td>
                    <td className="px-10 py-6 text-right">
                       <button onClick={() => startEdit(s)} className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl hover:bg-teal-600 hover:text-white transition-all active:scale-90 shadow-sm inline-flex items-center justify-center"><i className="fa-solid fa-pen-nib"></i></button>
                       {isAdmin && (
                         <button onClick={() => setStudentToCancel({id: s.id, name: s.name})} className="w-10 h-10 bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-all active:scale-90 shadow-sm inline-flex items-center justify-center ml-2" title="Cancel Admission"><i className="fa-solid fa-user-slash"></i></button>
                       )}
                       <button onClick={() => setStudentToDelete({id: s.id, name: s.name})} className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-90 shadow-sm inline-flex items-center justify-center ml-2"><i className="fa-solid fa-trash-can"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-rose-950/80 backdrop-blur-xl animate-fade-in" onClick={() => setStudentToDelete(null)}></div>
           <div className="bg-white rounded-[4rem] p-12 max-w-md w-full relative z-10 shadow-2xl border-t-[15px] border-rose-500 animate-scale-in text-center">
              <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">
                 <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <h2 className="text-3xl font-black text-rose-950 uppercase tracking-tighter mb-4">Erase Record?</h2>
              <p className="text-base font-black text-rose-900 italic mb-8">"{studentToDelete.name}"</p>
              <p className="text-xs text-gray-500 mb-8 leading-relaxed">This will permanently remove the student from local storage and the cloud. This action is IRREVERSIBLE.</p>
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setStudentToDelete(null)} className="py-5 bg-gray-100 text-gray-500 rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest">Abort</button>
                 <button onClick={confirmDelete} className="py-5 bg-rose-600 text-white rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-rose-200">Confirm Erase</button>
              </div>
           </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {studentToCancel && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl animate-fade-in" onClick={() => setStudentToCancel(null)}></div>
           <div className="bg-white rounded-[4rem] p-12 max-w-md w-full relative z-10 shadow-2xl border-t-[15px] border-slate-900 animate-scale-in">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-16 h-16 bg-slate-100 text-slate-900 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-inner">
                    <i className="fa-solid fa-user-slash"></i>
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tighter leading-none">Cancel Registry</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-widest">{studentToCancel.name}</p>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason for Cancellation</label>
                    <textarea 
                       required
                       className="w-full px-6 py-4 rounded-3xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-slate-900 outline-none font-bold text-slate-900 shadow-inner h-32"
                       placeholder="e.g. Moved to another city, TC issued, etc."
                       value={cancelReason}
                       onChange={e => setCancelReason(e.target.value)}
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setStudentToCancel(null)} className="py-5 bg-gray-100 text-gray-500 rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest">Discard</button>
                    <button 
                       disabled={!cancelReason.trim()}
                       onClick={handleCancelStudent} 
                       className="py-5 bg-slate-950 text-white rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest shadow-2xl disabled:opacity-30 transition-all"
                    >
                       Mark Cancelled
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-in { animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>
    </div>
  );
};

export default StudentManagement;
