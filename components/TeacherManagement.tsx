
import React, { useState, useRef, useMemo } from 'react';
import { TeacherAssignment, UserRole } from '../types';

interface TeacherManagementProps {
  teachers: TeacherAssignment[];
  setTeachers: (teachers: TeacherAssignment[]) => void;
  onDeleteTeacher?: (id: string) => Promise<void>;
  onLogActivity: (actionType: 'CREATE' | 'UPDATE' | 'DELETE', module: string, target: string, details?: string) => void;
}

const InputField = ({ label, field, type = 'text', required = false, placeholder = '', options = [], value, onChange }: any) => (
  <div className="space-y-1 w-full">
    <label className="text-[10px] font-black text-rose-600 uppercase tracking-widest ml-1">{label} {required && '*'}</label>
    {type === 'select' ? (
      <select 
        required={required}
        className="w-full px-5 py-3 rounded-2xl bg-rose-50/60 border-2 border-transparent focus:bg-white focus:border-rose-400 outline-none font-bold text-rose-900 transition-all shadow-inner"
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
        className="w-full px-5 py-3 rounded-2xl bg-rose-50/60 border-2 border-transparent focus:bg-white focus:border-rose-400 outline-none font-bold h-24 text-rose-900 transition-all shadow-inner"
        placeholder={placeholder}
        value={value || ''}
        onChange={e => onChange(field, e.target.value)}
      />
    ) : (
      <input 
        required={required}
        type={type}
        className="w-full px-5 py-3 rounded-2xl bg-rose-50/60 border-2 border-transparent focus:bg-white focus:border-rose-400 outline-none font-bold text-rose-900 transition-all shadow-inner"
        placeholder={placeholder}
        value={value || ''}
        onChange={e => onChange(field, e.target.value)}
      />
    )}
  </div>
);

const TeacherManagement: React.FC<TeacherManagementProps> = ({ teachers, setTeachers, onDeleteTeacher, onLogActivity }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherAssignment | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<{id: string, name: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialForm: Partial<TeacherAssignment> = {
    teacherName: '',
    employeeId: '',
    gender: 'MALE',
    dob: '',
    bloodGroup: 'O+',
    aadharNo: '',
    photo: '',
    phone: '',
    email: '',
    address: '',
    permanentAddress: '',
    designation: 'PRT',
    subject: '',
    joiningDate: new Date().toISOString().split('T')[0],
    employmentType: 'PERMANENT',
    experience: '0',
    qualification: '',
    professionalDegree: '',
    university: '',
    passingYear: '',
    assignedGrades: [],
    assignedSections: [],
    isClassTeacher: false,
    salaryType: 'MONTHLY',
    basicSalary: 0,
    bankName: '',
    accountNo: '',
    ifscCode: '',
    status: 'ACTIVE'
  };

  const [formData, setFormData] = useState<Partial<TeacherAssignment>>(initialForm);

  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => 
      t.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.includes(searchQuery) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice().reverse();
  }, [teachers, searchQuery]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setCurrentStep(1);
    setIsAdding(false);
    setEditingTeacher(null);
  };

  const saveToRegistry = () => {
    const empId = formData.employeeId || `EMP-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const teacherData: TeacherAssignment = {
      id: editingTeacher?.id || Math.random().toString(36).substr(2, 9),
      ...formData as TeacherAssignment,
      employeeId: empId
    };

    if (editingTeacher) {
      setTeachers(teachers.map(t => t.id === editingTeacher.id ? teacherData : t));
      onLogActivity('UPDATE', 'Faculty Portal', teacherData.teacherName, `Updated master profile for ID: ${teacherData.employeeId}`);
    } else {
      setTeachers([...teachers, teacherData]);
      onLogActivity('CREATE', 'Faculty Portal', teacherData.teacherName, `Enrolled new Master with ID: ${teacherData.employeeId}`);
    }
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
      return;
    }
    saveToRegistry();
  };

  const startEdit = (teacher: TeacherAssignment) => {
    setEditingTeacher(teacher);
    setFormData({ ...teacher });
    setIsAdding(true);
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = async () => {
    if (!teacherToDelete) return;
    if (onDeleteTeacher) {
      await onDeleteTeacher(teacherToDelete.id);
    } else {
      setTeachers(teachers.filter(t => t.id !== teacherToDelete.id));
    }
    onLogActivity('DELETE', 'Faculty Portal', teacherToDelete.name, 'Formally relieved faculty member from academy registry.');
    setTeacherToDelete(null);
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-12 px-4 max-w-3xl mx-auto">
      {[1, 2, 3, 4, 5, 6].map((step) => (
        <div key={step} className="flex items-center flex-1 last:flex-none">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs transition-all shadow-lg ${
            currentStep === step ? 'bg-rose-600 text-white scale-125 ring-4 ring-rose-100' : 
            currentStep > step ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
          }`}>
            {currentStep > step ? <i className="fa-solid fa-check"></i> : step}
          </div>
          {step < 6 && (
            <div className={`h-1 flex-1 mx-2 rounded-full transition-all ${currentStep > step ? 'bg-orange-500' : 'bg-gray-100'}`}></div>
          )}
        </div>
      ))}
    </div>
  );

  const toggleArrayItem = (field: 'assignedGrades' | 'assignedSections', item: string) => {
    const rawVal = formData[field];
    const current = Array.isArray(rawVal) ? rawVal : [];
    if (current.includes(item)) {
      handleInputChange(field, current.filter(i => i !== item));
    } else {
      handleInputChange(field, [...current, item]);
    }
  };

  return (
    <div className="space-y-8 pb-24 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-3xl text-white shadow-2xl ${editingTeacher ? 'bg-amber-500' : 'bg-rose-600'}`}>
              <i className={`fa-solid ${editingTeacher ? 'fa-user-pen' : 'fa-chalkboard-user'}`}></i>
           </div>
           <div>
             <h1 className="text-4xl font-black text-rose-950 tracking-tighter uppercase leading-none">Masters Portal</h1>
             <p className="text-rose-400 font-bold text-[10px] uppercase tracking-[0.5em] mt-3 italic">Faculty Registry v6.0</p>
           </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="relative group">
             <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-rose-300"></i>
             <input 
               className="pl-14 pr-6 py-4 bg-white border-2 border-rose-50 rounded-[1.8rem] outline-none focus:border-rose-400 w-full md:w-64 font-bold text-sm shadow-sm transition-all"
               placeholder="Search Faculty..."
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
             />
          </div>
          <button 
            onClick={() => isAdding ? resetForm() : setIsAdding(true)}
            className={`px-10 py-4 text-white rounded-[2rem] font-black shadow-xl transition-all flex items-center gap-3 transform hover:scale-105 active:scale-95 ${
              isAdding ? 'bg-rose-400 shadow-rose-100' : 'bg-rose-950 shadow-rose-200'
            }`}
          >
            <i className={`fa-solid ${isAdding ? 'fa-xmark' : 'fa-plus-circle'}`}></i>
            {isAdding ? 'Abort Entry' : 'Enroll Master'}
          </button>
        </div>
      </header>

      {isAdding && (
        <div className={`bg-white p-10 md:p-14 rounded-[4rem] shadow-2xl border-4 animate-slide-up relative overflow-hidden transition-all ${editingTeacher ? 'border-amber-100' : 'border-rose-50'}`}>
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full -mr-32 -mt-32 opacity-20 ${editingTeacher ? 'bg-amber-100' : 'bg-rose-100'}`}></div>
          
          <StepIndicator />

          <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
            {currentStep === 1 && (
              <div className="space-y-10 animate-fade-in">
                 <h2 className="text-2xl font-black text-rose-800 uppercase tracking-tight flex items-center gap-3 border-b-2 border-rose-50 pb-4">
                    <i className="fa-solid fa-id-card"></i> Stage 1: Personal Profile
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="lg:row-span-3 flex flex-col items-center gap-4 p-8 bg-rose-50/40 rounded-[3rem] border-2 border-dashed border-rose-100 group">
                       <div className="w-44 h-44 rounded-[2.5rem] bg-white shadow-xl overflow-hidden flex items-center justify-center relative border-4 border-white transition-all group-hover:scale-105">
                         {formData.photo ? <img src={formData.photo} className="w-full h-full object-cover" /> : <i className="fa-solid fa-camera text-5xl text-rose-100"></i>}
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <i className="fa-solid fa-upload text-white text-2xl"></i>
                         </div>
                       </div>
                       <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => {
                         const file = e.target.files?.[0];
                         if(file) {
                           const reader = new FileReader();
                           reader.onloadend = () => handleInputChange('photo', reader.result);
                           reader.readAsDataURL(file);
                         }
                       }} />
                       <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Biometric Portrait</p>
                    </div>
                    <InputField label="Full Legal Name" field="teacherName" required placeholder="Full Name" value={formData.teacherName} onChange={handleInputChange} />
                    <InputField label="Gender" field="gender" type="select" required options={['MALE', 'FEMALE', 'OTHER']} value={formData.gender} onChange={handleInputChange} />
                    <InputField label="Date of Birth" field="dob" type="date" required value={formData.dob} onChange={handleInputChange} />
                    <InputField label="Blood Group" field="bloodGroup" type="select" options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']} value={formData.bloodGroup} onChange={handleInputChange} />
                    <InputField label="Aadhaar No" field="aadharNo" placeholder="12 Digit No" value={formData.aadharNo} onChange={handleInputChange} />
                 </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-10 animate-fade-in">
                 <h2 className="text-2xl font-black text-rose-800 uppercase tracking-tight flex items-center gap-3 border-b-2 border-rose-50 pb-4">
                    <i className="fa-solid fa-address-book"></i> Stage 2: Contact & Access
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <InputField label="Mobile (Login ID)" field="phone" required type="tel" value={formData.phone} onChange={handleInputChange} />
                    <InputField label="Email Address" field="email" required type="email" value={formData.email} onChange={handleInputChange} />
                    <div className="md:col-span-3">
                       <InputField label="Current Address" field="address" type="textarea" required value={formData.address} onChange={handleInputChange} />
                    </div>
                    <div className="md:col-span-3">
                       <InputField label="Permanent Address" field="permanentAddress" type="textarea" value={formData.permanentAddress} onChange={handleInputChange} />
                    </div>
                 </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-10 animate-fade-in">
                 <h2 className="text-2xl font-black text-rose-800 uppercase tracking-tight flex items-center gap-3 border-b-2 border-rose-50 pb-4">
                    <i className="fa-solid fa-briefcase"></i> Stage 3: Professional Hub
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <InputField label="Employee ID" field="employeeId" placeholder="Auto-gen if empty" value={formData.employeeId} onChange={handleInputChange} />
                    <InputField label="Designation" field="designation" type="select" required options={['PRT', 'TGT', 'PGT', 'Principal', 'Admin Staff']} value={formData.designation} onChange={handleInputChange} />
                    <InputField label="Subject Mastery" field="subject" required placeholder="Expertise" value={formData.subject} onChange={handleInputChange} />
                    <InputField label="Date of Joining" field="joiningDate" type="date" required value={formData.joiningDate} onChange={handleInputChange} />
                    <InputField label="Employment Type" field="employmentType" type="select" required options={['PERMANENT', 'CONTRACT', 'GUEST']} value={formData.employmentType} onChange={handleInputChange} />
                    <InputField label="Exp (Years)" field="experience" type="number" value={formData.experience} onChange={handleInputChange} />
                 </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-10 animate-fade-in">
                 <h2 className="text-2xl font-black text-rose-800 uppercase tracking-tight flex items-center gap-3 border-b-2 border-rose-50 pb-4">
                    <i className="fa-solid fa-user-graduate"></i> Stage 4: Academic Records
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <InputField label="Highest Qualification" field="qualification" required placeholder="e.g. M.Sc, M.A" value={formData.qualification} onChange={handleInputChange} />
                    <InputField label="Professional Degree" field="professionalDegree" placeholder="e.g. B.Ed, M.Ed" value={formData.professionalDegree} onChange={handleInputChange} />
                    <InputField label="University/Board" field="university" value={formData.university} onChange={handleInputChange} />
                    <InputField label="Passing Year" field="passingYear" type="number" value={formData.passingYear} onChange={handleInputChange} />
                 </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-10 animate-fade-in">
                 <h2 className="text-2xl font-black text-rose-800 uppercase tracking-tight flex items-center gap-3 border-b-2 border-rose-50 pb-4">
                    <i className="fa-solid fa-users-rectangle"></i> Stage 5: Room Allocation
                 </h2>
                 <div className="space-y-8">
                    <div className="space-y-4">
                       <label className="text-[11px] font-black text-rose-400 uppercase tracking-widest ml-1">Assigned Classes</label>
                       <div className="flex flex-wrap gap-2">
                          {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => {
                             const grades = Array.isArray(formData.assignedGrades) ? formData.assignedGrades : [];
                             return (
                               <button 
                                  key={n} type="button"
                                  onClick={() => toggleArrayItem('assignedGrades', n.toString())}
                                  className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all border-2 ${
                                     grades.includes(n.toString()) 
                                     ? 'bg-rose-600 border-rose-600 text-white shadow-lg' 
                                     : 'bg-white border-rose-50 text-rose-300 hover:border-rose-300'
                                  }`}
                               >
                                  Class {n}
                               </button>
                             );
                          })}
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[11px] font-black text-rose-400 uppercase tracking-widest ml-1">Assigned Sections</label>
                       <div className="flex flex-wrap gap-2">
                          {['A', 'B', 'C', 'D'].map(s => {
                             const sections = Array.isArray(formData.assignedSections) ? formData.assignedSections : [];
                             return (
                               <button 
                                  key={s} type="button"
                                  onClick={() => toggleArrayItem('assignedSections', s)}
                                  className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all border-2 ${
                                     sections.includes(s) 
                                     ? 'bg-orange-500 border-orange-500 text-white shadow-lg' 
                                     : 'bg-white border-rose-50 text-rose-300 hover:border-rose-300'
                                  }`}
                               >
                                  Section {s}
                               </button>
                             );
                          })}
                       </div>
                    </div>

                    <div className="p-6 bg-rose-50/50 rounded-3xl border-2 border-rose-100 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <i className="fa-solid fa-award text-rose-600"></i>
                          <span className="font-black text-rose-900 text-sm uppercase">Assign as Class Master?</span>
                       </div>
                       <button 
                          type="button"
                          onClick={() => handleInputChange('isClassTeacher', !formData.isClassTeacher)}
                          className={`w-16 h-8 rounded-full relative transition-all duration-500 ${formData.isClassTeacher ? 'bg-emerald-500' : 'bg-gray-300'}`}
                       >
                          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-500 shadow-sm ${formData.isClassTeacher ? 'right-1' : 'left-1'}`}></div>
                       </button>
                    </div>
                 </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-10 animate-fade-in">
                 <h2 className="text-2xl font-black text-rose-800 uppercase tracking-tight flex items-center gap-3 border-b-2 border-rose-50 pb-4">
                    <i className="fa-solid fa-coins"></i> Stage 6: Payroll Control
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <InputField label="Salary Type" field="salaryType" type="select" options={['MONTHLY', 'HOURLY']} value={formData.salaryType} onChange={handleInputChange} />
                    <InputField label="Basic Salary (₹)" field="basicSalary" type="number" value={formData.basicSalary} onChange={handleInputChange} />
                    <InputField label="Bank Name" field="bankName" value={formData.bankName} onChange={handleInputChange} />
                    <InputField label="Account Number" field="accountNo" value={formData.accountNo} onChange={handleInputChange} />
                    <InputField label="IFSC Code" field="ifscCode" value={formData.ifscCode} onChange={handleInputChange} />
                    <InputField label="Active Status" field="status" type="select" options={['ACTIVE', 'INACTIVE']} value={formData.status} onChange={handleInputChange} />
                 </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-10 border-t border-rose-50">
               <button 
                 type="button" 
                 onClick={() => currentStep === 1 ? resetForm() : setCurrentStep(prev => prev + 1)}
                 className="px-10 py-5 bg-gray-100 text-gray-500 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all"
               >
                 {currentStep === 1 ? 'Discard' : 'Previous'}
               </button>
               
               <div className="flex gap-4">
                  {editingTeacher && (
                    <button 
                      type="button" 
                      onClick={saveToRegistry}
                      className="px-12 py-5 bg-amber-500 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-amber-600 transition-all transform hover:scale-105 flex items-center gap-2"
                    >
                      <i className="fa-solid fa-bolt"></i> Quick Save
                    </button>
                  )}
                  
                  <button 
                    type="submit" 
                    className="px-16 py-5 bg-rose-950 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-rose-200 hover:bg-black transition-all transform hover:scale-105 active:scale-95 flex items-center gap-4"
                  >
                    {currentStep === 6 ? (editingTeacher ? 'Update Profile' : 'Finalize Contract') : 'Continue Setup'}
                    <i className="fa-solid fa-arrow-right-long"></i>
                  </button>
               </div>
            </div>
          </form>
        </div>
      )}

      {/* Main Registry List */}
      <div className="bg-white rounded-[4rem] shadow-xl border border-rose-50 overflow-hidden relative">
        <div className="p-10 bg-rose-50/40 border-b border-rose-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border-2 border-rose-100 flex items-center justify-center text-rose-600 shadow-sm"><i className="fa-solid fa-users-gear"></i></div>
              <h3 className="text-xl font-black text-rose-950 uppercase tracking-tighter">Academic Faculty List</h3>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-rose-50/20 text-[10px] font-black text-rose-400 uppercase tracking-widest">
                <th className="px-10 py-6">Master Identity</th>
                <th className="px-10 py-6">Designation & Mastery</th>
                <th className="px-10 py-6">Assignment</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {filteredTeachers.length > 0 ? filteredTeachers.map(t => (
                <tr key={t.id} className="hover:bg-rose-50/10 transition-all group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm font-black text-rose-600 group-hover:scale-110 transition-transform">
                          {t.photo ? <img src={t.photo} className="w-full h-full object-cover" /> : t.teacherName.charAt(0)}
                       </div>
                       <div>
                          <p className="font-black text-rose-950 text-lg uppercase tracking-tight">{t.teacherName}</p>
                          <p className="text-[9px] font-black text-rose-400 uppercase mt-0.5 tracking-widest">ID: {t.employeeId}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                     <div className="space-y-1">
                        <span className="px-3 py-1 rounded-lg bg-orange-50 text-orange-600 font-black text-[9px] uppercase tracking-tighter shadow-sm">{t.designation}</span>
                        <p className="text-[10px] font-black text-rose-700">{t.subject}</p>
                     </div>
                  </td>
                  <td className="px-10 py-6">
                     <div className="flex flex-wrap gap-1">
                        {Array.isArray(t.assignedGrades) && t.assignedGrades.map(g => (
                          <span key={g} className="text-[9px] font-black text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">CLS {g}</span>
                        ))}
                        {t.isClassTeacher && <i className="fa-solid fa-star text-amber-400 text-xs ml-1" title="Class Master"></i>}
                     </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                      t.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
                    }`}>
                        {t.status}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-3">
                       <button 
                         onClick={() => startEdit(t)} 
                         className="w-11 h-11 bg-teal-50 text-teal-600 rounded-[1.2rem] hover:bg-rose-950 hover:text-white transition-all shadow-sm flex items-center justify-center group/edit"
                       >
                         <i className="fa-solid fa-pen-nib group-hover/edit:rotate-12 transition-transform"></i>
                       </button>
                       <button 
                         onClick={() => setTeacherToDelete({id: t.id, name: t.teacherName})} 
                         className="w-11 h-11 bg-rose-50 text-rose-500 rounded-[1.2rem] hover:bg-rose-600 hover:text-white transition-all shadow-sm flex items-center justify-center group/del"
                       >
                         <i className="fa-solid fa-user-minus group-hover/del:scale-110 transition-transform"></i>
                       </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-40 text-center opacity-20">
                     <i className="fa-solid fa-user-secret text-8xl mb-6"></i>
                     <p className="text-3xl font-black uppercase tracking-widest text-rose-900">No Masters Listed</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {teacherToDelete && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-rose-950/80 backdrop-blur-xl animate-fade-in" onClick={() => setTeacherToDelete(null)}></div>
           <div className="bg-white rounded-[4rem] p-12 max-w-md w-full relative z-10 shadow-2xl border-t-[15px] border-rose-500 animate-scale-in text-center">
              <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">
                 <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <h2 className="text-3xl font-black text-rose-950 uppercase tracking-tighter mb-4">Relieve Master?</h2>
              <p className="text-base font-black text-rose-900 italic mb-8">"{teacherToDelete.name}"</p>
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setTeacherToDelete(null)} className="py-5 bg-gray-100 text-gray-500 rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest">Abort</button>
                 <button onClick={confirmDelete} className="py-5 bg-rose-500 text-white rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-rose-200">Yes, Relieve</button>
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

export default TeacherManagement;
