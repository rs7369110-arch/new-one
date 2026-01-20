
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
        className="w-full px-5 py-3 rounded-2xl bg-teal-50/60 border-2 border-transparent focus:bg-white focus:border-teal-400 outline-none font-bold text-teal-900 transition-all shadow-inner"
        placeholder={placeholder}
        value={value || ''}
        onChange={e => onChange(field, e.target.value)}
      />
    )}
  </div>
);

const StudentManagement: React.FC<StudentManagementProps> = ({ user, students, setStudents, onDelete, onLogActivity }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<{id: string, name: string} | null>(null);
  const [studentToCancel, setStudentToCancel] = useState<{id: string, name: string} | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [statusUpdateModal, setStatusUpdateModal] = useState<{id: string, name: string, current: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleStatusChange = (status: 'APPROVED' | 'PENDING' | 'REJECTED') => {
    if (!isAdmin || !statusUpdateModal) return;
    
    const updated = students.map(s => s.id === statusUpdateModal.id ? { ...s, status } : s);
    setStudents(updated as Student[]);
    onLogActivity('UPDATE', 'Student Registry', statusUpdateModal.name, `Changed enrollment status to ${status}`);
    setStatusUpdateModal(null);
  };

  const handleCancelStudent = () => {
    if (!studentToCancel || !isAdmin) return;
    
    const updated = students.map(s => 
      s.id === studentToCancel.id 
        ? { 
            ...s, 
            status: 'CANCELLED', 
            cancelledDate: new Date().toLocaleDateString(), 
            cancelledBy: user.name, 
            cancelReason 
          } 
        : s
    );
    
    setStudents(updated as Student[]);
    onLogActivity('DELETE', 'Student Registry', studentToCancel.name, `Moved student to Cancelled Archive. Reason: ${cancelReason || 'N/A'}`);
    setStudentToCancel(null);
    setCancelReason('');
    alert(`Student ${studentToCancel.name} has been moved to Cancelled Archive.`);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    onLogActivity('DELETE', 'Student Registry', studentToDelete.name, `Permanently erased student record.`);
    await onDelete(studentToDelete.id);
    setStudentToDelete(null);
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-12 px-4 max-w-2xl mx-auto">
      {[1, 2, 3, 4, 5].map((step) => (
        <div key={step} className="flex items-center flex-1 last:flex-none">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs transition-all shadow-lg ${
            currentStep === step ? 'bg-teal-600 text-white scale-125 ring-4 ring-teal-100' : 
            currentStep > step ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
          }`}>
            {currentStep > step ? <i className="fa-solid fa-check"></i> : step}
          </div>
          {step < 5 && (
            <div className={`h-1 flex-1 mx-2 rounded-full transition-all ${currentStep > step ? 'bg-emerald-500' : 'bg-gray-100'}`}></div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className={`w-12 h-12 rounded-[1.2rem] text-white flex items-center justify-center text-xl shadow-xl transition-colors ${editingStudent ? 'bg-amber-500' : 'bg-teal-600'}`}>
                 <i className={`fa-solid ${editingStudent ? 'fa-user-pen' : 'fa-user-plus'}`}></i>
              </div>
              <div>
                <h1 className="text-3xl font-black text-teal-950 tracking-tighter uppercase leading-none">
                  {editingStudent ? 'Modify Registry' : 'Admission Hub'}
                </h1>
                <p className="text-teal-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-2 italic">Student Registry System v4.0</p>
              </div>
           </div>
        </div>
        <div className="flex gap-3">
          <div className="relative group hidden md:block">
             <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-teal-300"></i>
             <input 
               className="pl-12 pr-6 py-4 bg-white border-2 border-teal-50 rounded-[1.5rem] outline-none focus:border-teal-400 w-64 font-bold text-sm shadow-sm transition-all"
               placeholder="Search Registry..."
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
             />
          </div>
          <button 
            onClick={() => isAdding ? resetForm() : setIsAdding(true)}
            className={`px-8 py-4 text-white rounded-[1.8rem] font-black shadow-xl transition-all flex items-center gap-3 transform hover:scale-105 active:scale-95 ${
              isAdding ? 'bg-rose-500 shadow-rose-200' : 'bg-teal-700 shadow-teal-200'
            }`}
          >
            <i className={`fa-solid ${isAdding ? 'fa-xmark' : 'fa-plus'}`}></i>
            {isAdding ? 'Abort Entry' : 'New Enrollment'}
          </button>
        </div>
      </header>

      {isAdding && (
        <div className={`bg-white p-10 md:p-14 rounded-[4rem] shadow-2xl border-4 animate-slide-up relative overflow-hidden transition-all ${editingStudent ? 'border-amber-100' : 'border-teal-50'}`}>
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full -mr-32 -mt-32 opacity-50 ${editingStudent ? 'bg-amber-50' : 'bg-teal-50'}`}></div>
          
          {editingStudent && (
            <div className="absolute top-8 left-8 bg-amber-100 text-amber-700 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-amber-200 shadow-sm z-20">
               <i className="fa-solid fa-shield-halved animate-pulse"></i> Editing Mode: {editingStudent.admissionNo}
            </div>
          )}

          <StepIndicator />

          <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
            {currentStep === 1 && (
              <div className="space-y-10 animate-fade-in">
                 <h2 className="text-2xl font-black text-teal-800 uppercase tracking-tight flex items-center gap-3 border-b-2 border-teal-50 pb-4">
                    <i className="fa-solid fa-id-card-clip"></i> Stage 1: Student Identity
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="lg:row-span-3 flex flex-col items-center gap-4 p-8 bg-teal-50/40 rounded-[3rem] border-2 border-dashed border-teal-100 group">
                       <div className="w-44 h-44 rounded-[2.5rem] bg-white shadow-xl overflow-hidden flex items-center justify-center relative border-4 border-white transition-all group-hover:scale-105">
                         {formData.photo ? <img src={formData.photo} className="w-full h-full object-cover" /> : <i className="fa-solid fa-camera text-5xl text-teal-100"></i>}
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
                       <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Biometric Portrait</p>
                    </div>
                    <InputField label="Full Student Name" field="name" required placeholder="Legal Name" value={formData.name} onChange={handleInputChange} />
                    <InputField label="Admission No" field="admissionNo" required placeholder="Unique ID" value={formData.admissionNo} onChange={handleInputChange} />
                    <InputField label="GR Number" field="grNo" placeholder="General Register No" value={formData.grNo} onChange={handleInputChange} />
                    <InputField label="Date of Birth" field="dob" type="date" required value={formData.dob} onChange={handleInputChange} />
                    <InputField label="Gender" field="gender" type="select" required options={['MALE', 'FEMALE', 'OTHER']} value={formData.gender} onChange={handleInputChange} />
                    <InputField label="Blood Group" field="bloodGroup" type="select" options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']} value={formData.bloodGroup} onChange={handleInputChange} />
                    <InputField label="Standard" field="grade" type="select" required options={['1','2','3','4','5','6','7','8','9','10','11','12']} value={formData.grade} onChange={handleInputChange} />
                    <InputField label="Section" field="section" type="select" options={['A', 'B', 'C', 'D']} value={formData.section} onChange={handleInputChange} />
                 </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-10 animate-fade-in">
                 <h2 className="text-2xl font-black text-teal-800 uppercase tracking-tight flex items-center gap-3 border-b-2 border-teal-50 pb-4">
                    <i className="fa-solid fa-users-viewfinder"></i> Stage 2: Contact Details
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <InputField label="Father's Name" field="fatherName" required value={formData.fatherName} onChange={handleInputChange} />
                    <InputField label="Mother's Name" field="motherName" required value={formData.motherName} onChange={handleInputChange} />
                    <InputField label="Primary Mobile" field="phone" required type="tel" placeholder="10 Digit Mobile" value={formData.phone} onChange={handleInputChange} />
                    <InputField label="Alternate Phone" field="alternatePhone" type="tel" value={formData.alternatePhone} onChange={handleInputChange} />
                    <InputField label="Emergency Contact No" field="emergencyContact" required value={formData.emergencyContact} onChange={handleInputChange} />
                    <InputField label="Aadhaar No" field="aadharNo" placeholder="12 Digit" value={formData.aadharNo} onChange={handleInputChange} />
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
                 <h2 className="text-2xl font-black text-teal-800 uppercase tracking-tight flex items-center gap-3 border-b-2 border-teal-50 pb-4">
                    <i className="fa-solid fa-graduation-cap"></i> Stage 3: Academic Registry
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputField label="Roll Number" field="rollNo" value={formData.rollNo} onChange={handleInputChange} />
                    <InputField label="Medium" field="medium" type="select" required options={['ENGLISH', 'GUJARATI']} value={formData.medium} onChange={handleInputChange} />
                    <InputField label="Previous School" field="prevSchoolName" value={formData.prevSchoolName} onChange={handleInputChange} />
                    <InputField label="Admission Date" field="admissionDate" type="date" value={formData.admissionDate} onChange={handleInputChange} />
                 </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-10 animate-fade-in">
                 <h2 className="text-2xl font-black text-teal-800 uppercase tracking-tight flex items-center gap-3 border-b-2 border-teal-50 pb-4">
                    <i className="fa-solid fa-vault"></i> Stage 4: Documents
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {['aadharCard', 'birthCert', 'transferCert', 'prevMarksheet'].map((doc) => (
                      <div key={doc} className="p-6 bg-teal-50/40 rounded-[2rem] border-2 border-dashed border-teal-100 flex flex-col items-center gap-4 text-center">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-md ${formData.documents?.[doc as keyof typeof formData.documents] ? 'bg-emerald-500 text-white' : 'bg-white text-teal-300'}`}>
                            <i className={`fa-solid ${formData.documents?.[doc as keyof typeof formData.documents] ? 'fa-file-circle-check' : 'fa-file-arrow-up'}`}></i>
                         </div>
                         <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{doc.replace(/([A-Z])/g, ' $1')}</p>
                         <input type="file" className="hidden" id={doc} onChange={(e) => {
                             const file = e.target.files?.[0];
                             if (file) {
                               const reader = new FileReader();
                               reader.onloadend = () => {
                                 setFormData(prev => ({
                                   ...prev,
                                   documents: {
                                     ...prev.documents,
                                     [doc]: reader.result as string
                                   }
                                 }));
                               };
                               reader.readAsDataURL(file);
                             }
                         }} />
                         <label htmlFor={doc} className="px-5 py-2 bg-white text-teal-600 rounded-xl text-[9px] font-black uppercase shadow-sm border border-teal-50 cursor-pointer hover:bg-teal-600 hover:text-white transition-all">
                            {formData.documents?.[doc as keyof typeof formData.documents] ? 'Replace' : 'Upload'}
                         </label>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-10 animate-fade-in">
                 <h2 className="text-2xl font-black text-teal-800 uppercase tracking-tight flex items-center gap-3 border-b-2 border-teal-50 pb-4">
                    <i className="fa-solid fa-coins"></i> Stage 5: Financials
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputField label="Annual Fees (₹)" field="totalFees" type="number" value={formData.totalFees} onChange={handleInputChange} />
                    <InputField label="Fees Collected (₹)" field="paidFees" type="number" value={formData.paidFees} onChange={handleInputChange} />
                 </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-10 border-t border-teal-50">
               <button 
                 type="button" 
                 onClick={() => currentStep === 1 ? resetForm() : setCurrentStep(prev => prev - 1)}
                 className="px-10 py-5 bg-gray-100 text-gray-500 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all"
               >
                 {currentStep === 1 ? 'Discard' : 'Previous'}
               </button>
               
               <div className="flex gap-4">
                  {editingStudent && (
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
                    className="px-16 py-5 bg-teal-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-teal-200 hover:bg-black transition-all transform hover:scale-105 active:scale-95 flex items-center gap-4"
                  >
                    {currentStep === 5 ? (editingStudent ? 'Update Registry' : 'Confirm Admission') : 'Continue Extraction'}
                    <i className="fa-solid fa-arrow-right-long"></i>
                  </button>
               </div>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[4rem] shadow-xl border border-teal-50 overflow-hidden relative">
        <div className="p-10 bg-teal-50/40 border-b border-teal-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white border-2 border-teal-100 flex items-center justify-center text-teal-600 shadow-sm"><i className="fa-solid fa-database"></i></div>
              <h3 className="text-xl font-black text-teal-950 uppercase tracking-tighter">Master Student List</h3>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-teal-50/20 text-[10px] font-black text-teal-400 uppercase tracking-widest">
                <th className="px-10 py-6">Hero Identity</th>
                <th className="px-10 py-6">Admission Details</th>
                <th className="px-10 py-6">Contact Info</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-50">
              {filteredStudents.length > 0 ? filteredStudents.map(s => (
                <tr key={s.id} className="hover:bg-teal-50/10 transition-all group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm font-black text-teal-600 group-hover:scale-110 transition-transform">
                          {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : s.name.charAt(0)}
                       </div>
                       <div>
                          <p className="font-black text-teal-950 text-lg uppercase tracking-tight">{s.name}</p>
                          <p className="text-[9px] font-black text-teal-400 uppercase mt-0.5 tracking-widest">Roll: {s.rollNo || 'N/A'}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                     <div className="space-y-1">
                        <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-500 font-black text-[9px] uppercase tracking-tighter shadow-sm">{s.admissionNo}</span>
                        <p className="text-[10px] font-black text-teal-700">STD {s.grade}-{s.section}</p>
                     </div>
                  </td>
                  <td className="px-10 py-6">
                     <p className="text-xs font-black text-gray-700">{s.phone}</p>
                     <p className="text-[9px] font-bold text-gray-400 italic">Emergency: {s.emergencyContact || '---'}</p>
                  </td>
                  <td className="px-10 py-6">
                    <button 
                      onClick={() => isAdmin && setStatusUpdateModal({id: s.id, name: s.name, current: s.status})}
                      disabled={!isAdmin}
                      className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm transition-all ${
                        s.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' :
                        s.status === 'REJECTED' ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' :
                        'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      } ${isAdmin ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                        {s.status}
                        {isAdmin && <i className="fa-solid fa-chevron-down ml-2 text-[7px] opacity-40"></i>}
                    </button>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-3">
                       <button 
                         onClick={() => startEdit(s)} 
                         className="w-11 h-11 bg-teal-50 text-teal-600 rounded-[1.2rem] hover:bg-teal-700 hover:text-white transition-all shadow-sm flex items-center justify-center group/edit"
                       >
                         <i className="fa-solid fa-pen-nib group-hover/edit:rotate-12 transition-transform"></i>
                       </button>
                       {isAdmin && (
                        <button 
                          onClick={() => setStudentToCancel({id: s.id, name: s.name})} 
                          className="w-11 h-11 bg-rose-50 text-rose-500 rounded-[1.2rem] hover:bg-rose-600 hover:text-white transition-all shadow-sm flex items-center justify-center group/cancel"
                          title="Cancel Student"
                        >
                          <i className="fa-solid fa-user-slash group-hover/cancel:scale-110 transition-transform"></i>
                        </button>
                       )}
                       <button 
                         onClick={() => setStudentToDelete({id: s.id, name: s.name})} 
                         className="w-11 h-11 bg-rose-50 text-rose-500 rounded-[1.2rem] hover:bg-rose-600 hover:text-white transition-all shadow-sm flex items-center justify-center group/del"
                       >
                         <i className="fa-solid fa-trash-can group-hover/del:scale-110 transition-transform"></i>
                       </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-40 text-center opacity-20">
                     <i className="fa-solid fa-database text-8xl mb-6"></i>
                     <p className="text-3xl font-black uppercase tracking-widest text-teal-900">Archives Empty</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CANCEL STUDENT MODAL */}
      {studentToCancel && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-teal-950/80 backdrop-blur-xl animate-fade-in" onClick={() => setStudentToCancel(null)}></div>
           <div className="bg-white rounded-[4rem] p-12 max-w-md w-full relative z-10 shadow-2xl border-t-[15px] border-rose-500 animate-scale-in text-center">
              <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">
                 <i className="fa-solid fa-user-slash"></i>
              </div>
              <h2 className="text-3xl font-black text-teal-950 uppercase tracking-tighter mb-4">Cancel Entry?</h2>
              <p className="text-sm font-bold text-gray-500 leading-relaxed mb-6">
                Are you sure you want to cancel <strong>{studentToCancel.name}</strong>? This student will be moved to the Cancelled Students list and hidden from active modules.
              </p>
              
              <div className="space-y-2 text-left mb-8">
                <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Cancellation Reason (Optional)</label>
                <textarea 
                  className="w-full px-5 py-3 rounded-2xl bg-rose-50/50 border-2 border-transparent focus:bg-white focus:border-rose-400 outline-none font-bold text-rose-900 h-24"
                  placeholder="e.g. Left school, Transfer, etc."
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setStudentToCancel(null)} className="py-5 bg-gray-100 text-gray-500 rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest">Back</button>
                 <button onClick={handleCancelStudent} className="py-5 bg-rose-500 text-white rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-rose-200">Confirm Cancel</button>
              </div>
           </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {studentToDelete && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-teal-950/80 backdrop-blur-xl animate-fade-in" onClick={() => setStudentToDelete(null)}></div>
           <div className="bg-white rounded-[4rem] p-12 max-w-md w-full relative z-10 shadow-2xl border-t-[15px] border-rose-500 animate-scale-in text-center">
              <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">
                 <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <h2 className="text-3xl font-black text-teal-950 uppercase tracking-tighter mb-4">Erase Record?</h2>
              <p className="text-base font-black text-teal-900 italic mb-8">"{studentToDelete.name}"</p>
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setStudentToDelete(null)} className="py-5 bg-gray-100 text-gray-500 rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest">Abort</button>
                 <button onClick={confirmDelete} className="py-5 bg-rose-500 text-white rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-rose-200">Confirm</button>
              </div>
           </div>
        </div>
      )}

      {/* STATUS UPDATE MODAL */}
      {statusUpdateModal && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-teal-950/80 backdrop-blur-xl animate-fade-in" onClick={() => setStatusUpdateModal(null)}></div>
           <div className="bg-white rounded-[4rem] p-12 max-w-md w-full relative z-10 shadow-2xl border-t-[15px] border-teal-600 animate-scale-in text-center">
              <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-[2.5rem] flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
                 <i className="fa-solid fa-user-shield"></i>
              </div>
              <h2 className="text-3xl font-black text-teal-950 uppercase tracking-tighter mb-2">Update Status</h2>
              <p className="text-sm font-bold text-teal-500 italic mb-10">Target: {statusUpdateModal.name}</p>
              
              <div className="space-y-4 mb-10">
                 <button 
                   onClick={() => handleStatusChange('APPROVED')}
                   className="w-full py-5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 rounded-3xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-3 border-2 border-emerald-100"
                 >
                    <i className="fa-solid fa-circle-check"></i> Approve Entry
                 </button>
                 <button 
                   onClick={() => handleStatusChange('PENDING')}
                   className="w-full py-5 bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-700 rounded-3xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-3 border-2 border-amber-100"
                 >
                    <i className="fa-solid fa-hourglass-half"></i> Set Pending
                 </button>
                 <button 
                   onClick={() => handleStatusChange('REJECTED')}
                   className="w-full py-5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 rounded-3xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-3 border-2 border-rose-100"
                 >
                    <i className="fa-solid fa-ban"></i> Reject Entry
                 </button>
              </div>

              <button 
                onClick={() => setStatusUpdateModal(null)}
                className="text-gray-400 font-black uppercase text-[9px] tracking-widest hover:text-gray-600 transition-colors"
              >
                Close Control Panel
              </button>
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
