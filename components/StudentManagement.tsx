
import React, { useState, useRef, useMemo } from 'react';
import { Student, User, UserRole } from '../types';

interface StudentManagementProps {
  user: User;
  students: Student[];
  setStudents: (students: Student[]) => void;
  onDelete: (id: string) => Promise<void>;
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

const StudentManagement: React.FC<StudentManagementProps> = ({ user, students, setStudents, onDelete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<{id: string, name: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = user.role === UserRole.ADMIN;

  const initialForm: Partial<Student> = {
    name: '',
    admissionNo: '',
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
    fatherOccupation: '',
    address: '',
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
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery)
    ).slice().reverse();
  }, [students, searchQuery]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDocUpload = (docType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          documents: {
            ...prev.documents,
            [docType]: reader.result as string
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setCurrentStep(1);
    setIsAdding(false);
    setEditingStudent(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
      return;
    }

    const studentData: Student = {
      id: editingStudent?.id || Math.random().toString(36).substr(2, 9),
      ...formData as Student,
      parentName: formData.fatherName || formData.motherName || formData.guardianName || 'Guardian',
      status: formData.status || 'PENDING'
    };

    if (editingStudent) {
      setStudents(students.map(s => s.id === editingStudent.id ? studentData : s));
    } else {
      setStudents([...students, studentData]);
    }
    resetForm();
  };

  const startEdit = (student: Student) => {
    const confirmed = window.confirm(`Initiate Data Modification for "${student.name}"?`);
    if (confirmed) {
      setEditingStudent(student);
      setFormData(student);
      setIsAdding(true);
      setCurrentStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStatusChange = (id: string, status: 'APPROVED' | 'REJECTED') => {
    if (!isAdmin) return;
    const updated = students.map(s => s.id === id ? { ...s, status } : s);
    setStudents(updated);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
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
              <div className="w-12 h-12 rounded-[1.2rem] bg-teal-600 text-white flex items-center justify-center text-xl shadow-xl">
                 <i className="fa-solid fa-user-plus"></i>
              </div>
              <div>
                <h1 className="text-3xl font-black text-teal-950 tracking-tighter uppercase leading-none">Admission Hub</h1>
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
        <div className="bg-white p-10 md:p-14 rounded-[4rem] shadow-2xl border-4 border-teal-50 animate-slide-up relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
          
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
                    <InputField label="Date of Birth" field="dob" type="date" required value={formData.dob} onChange={handleInputChange} />
                    <InputField label="Gender" field="gender" type="select" required options={['MALE', 'FEMALE', 'OTHER']} value={formData.gender} onChange={handleInputChange} />
                    <InputField label="Blood Group" field="bloodGroup" type="select" options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']} value={formData.bloodGroup} onChange={handleInputChange} />
                    <InputField label="Aadhaar Number" field="aadharNo" placeholder="12 Digit UIDAI" value={formData.aadharNo} onChange={handleInputChange} />
                    <InputField label="Class of Admission" field="grade" type="select" required options={['1','2','3','4','5','6','7','8','9','10','11','12']} value={formData.grade} onChange={handleInputChange} />
                    <InputField label="Section" field="section" type="select" options={['A', 'B', 'C', 'D']} value={formData.section} onChange={handleInputChange} />
                 </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-10 animate-fade-in">
                 <h2 className="text-2xl font-black text-teal-800 uppercase tracking-tight flex items-center gap-3 border-b-2 border-teal-50 pb-4">
                    <i className="fa-solid fa-users-viewfinder"></i> Stage 2: Parental Identity
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <InputField label="Father's Name" field="fatherName" required value={formData.fatherName} onChange={handleInputChange} />
                    <InputField label="Mother's Name" field="motherName" required value={formData.motherName} onChange={handleInputChange} />
                    <InputField label="Father's Occupation" field="fatherOccupation" value={formData.fatherOccupation} onChange={handleInputChange} />
                    <InputField label="Primary Mobile (OTP Link)" field="phone" required type="tel" placeholder="10 Digit Mobile" value={formData.phone} onChange={handleInputChange} />
                    <InputField label="Email Address" field="email" type="email" placeholder="official@email.com" value={formData.email} onChange={handleInputChange} />
                    <InputField label="Emergency Contact" field="emergencyContact" required value={formData.emergencyContact} onChange={handleInputChange} />
                    <div className="md:col-span-3">
                       <InputField label="Residential Address" field="address" type="textarea" required placeholder="Flat/House No, Street, Landmark" value={formData.address} onChange={handleInputChange} />
                    </div>
                    <InputField label="City" field="city" value={formData.city} onChange={handleInputChange} />
                    <InputField label="State" field="state" value={formData.state} onChange={handleInputChange} />
                    <InputField label="Pincode" field="pincode" value={formData.pincode} onChange={handleInputChange} />
                 </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-10 animate-fade-in">
                 <h2 className="text-2xl font-black text-teal-800 uppercase tracking-tight flex items-center gap-3 border-b-2 border-teal-50 pb-4">
                    <i className="fa-solid fa-graduation-cap"></i> Stage 3: Academic History
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputField label="Previous School Name" field="prevSchoolName" placeholder="Name of last institute" value={formData.prevSchoolName} onChange={handleInputChange} />
                    <InputField label="Last Class Completed" field="prevLastClass" value={formData.prevLastClass} onChange={handleInputChange} />
                    <InputField label="Transfer Certificate (TC) No." field="tcNo" value={formData.tcNo} onChange={handleInputChange} />
                    <InputField label="Academic Session" field="academicYear" placeholder="2024-25" value={formData.academicYear} onChange={handleInputChange} />
                 </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-10 animate-fade-in">
                 <h2 className="text-2xl font-black text-teal-800 uppercase tracking-tight flex items-center gap-3 border-b-2 border-teal-50 pb-4">
                    <i className="fa-solid fa-vault"></i> Stage 4: Document Vault
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {['aadharCard', 'birthCert', 'transferCert', 'prevMarksheet'].map((doc) => (
                      <div key={doc} className="p-6 bg-teal-50/40 rounded-[2rem] border-2 border-dashed border-teal-100 flex flex-col items-center gap-4 text-center">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-md ${formData.documents?.[doc as keyof typeof formData.documents] ? 'bg-emerald-500 text-white' : 'bg-white text-teal-300'}`}>
                            <i className={`fa-solid ${formData.documents?.[doc as keyof typeof formData.documents] ? 'fa-file-circle-check' : 'fa-file-arrow-up'}`}></i>
                         </div>
                         <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{doc.replace(/([A-Z])/g, ' $1')}</p>
                         <input type="file" className="hidden" id={doc} onChange={(e) => handleDocUpload(doc, e)} />
                         <label htmlFor={doc} className="px-5 py-2 bg-white text-teal-600 rounded-xl text-[9px] font-black uppercase shadow-sm border border-teal-50 cursor-pointer hover:bg-teal-600 hover:text-white transition-all">
                            {formData.documents?.[doc as keyof typeof formData.documents] ? 'Replace' : 'Upload PDF/IMG'}
                         </label>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-10 animate-fade-in">
                 <h2 className="text-2xl font-black text-teal-800 uppercase tracking-tight flex items-center gap-3 border-b-2 border-teal-50 pb-4">
                    <i className="fa-solid fa-coins"></i> Stage 5: Enrollment Protocol
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputField label="Initial Admission Fee (₹)" field="totalFees" type="number" value={formData.totalFees} onChange={handleInputChange} />
                    <InputField label="Fee Paid (₹)" field="paidFees" type="number" value={formData.paidFees} onChange={handleInputChange} />
                    <div className="md:col-span-2 p-8 bg-amber-50 rounded-[2.5rem] border-2 border-amber-100 flex items-center gap-6">
                       <div className="w-14 h-14 bg-amber-400 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg animate-pulse">
                          <i className="fa-solid fa-shield-halved"></i>
                       </div>
                       <div>
                          <h4 className="font-black text-amber-800 uppercase text-lg">Identity Verification Consent</h4>
                          <p className="text-xs font-bold text-amber-600 italic mt-1 opacity-80 leading-relaxed">"I hereby verify that all provided biometric and academic strings are authentic to the best of my knowledge."</p>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-10 border-t border-teal-50">
               <button 
                 type="button" 
                 onClick={() => currentStep === 1 ? resetForm() : setCurrentStep(prev => prev - 1)}
                 className="px-10 py-5 bg-gray-100 text-gray-500 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all"
               >
                 {currentStep === 1 ? 'Discard Entry' : 'Backtrack'}
               </button>
               <button 
                 type="submit" 
                 className="px-16 py-5 bg-teal-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-teal-200 hover:bg-black transition-all transform hover:scale-105 active:scale-95 flex items-center gap-4"
               >
                 {currentStep === 5 ? (editingStudent ? 'Seal Modification' : 'Seal Registry') : 'Continue Extraction'}
                 <i className="fa-solid fa-arrow-right-long"></i>
               </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[4rem] shadow-xl border border-teal-50 overflow-hidden relative">
        <div className="p-10 bg-teal-50/40 border-b border-teal-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white border-2 border-teal-100 flex items-center justify-center text-teal-600 shadow-sm"><i className="fa-solid fa-database"></i></div>
              <h3 className="text-xl font-black text-teal-950 uppercase tracking-tighter">Registry Database View</h3>
           </div>
           <div className="md:hidden">
             <input 
               className="w-full px-6 py-3 bg-white border-2 border-teal-50 rounded-2xl outline-none font-bold text-sm"
               placeholder="Search by Name/Phone..."
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
             />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-teal-50/20 text-[10px] font-black text-teal-400 uppercase tracking-widest">
                <th className="px-10 py-6">Hero Profile</th>
                <th className="px-10 py-6">Registry ID</th>
                <th className="px-10 py-6">Class/Contact</th>
                <th className="px-10 py-6">Verification</th>
                <th className="px-10 py-6 text-right">Operations</th>
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
                          <p className="text-[9px] font-black text-teal-400 uppercase mt-0.5 tracking-widest">{s.gender} • ROLL: {s.rollNo}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                     <span className="px-4 py-1.5 rounded-lg bg-indigo-50 text-indigo-500 font-black text-[10px] uppercase shadow-sm">{s.admissionNo}</span>
                     <p className="text-[9px] font-bold text-gray-300 mt-2">SESSION: {s.academicYear}</p>
                  </td>
                  <td className="px-10 py-6">
                     <p className="text-sm font-black text-teal-700">CLASS {s.grade} • {s.section}</p>
                     <p className="text-[10px] font-bold text-gray-500 mt-1 italic">{s.phone}</p>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col gap-2">
                       <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm w-fit ${
                         s.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                         s.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                         'bg-amber-100 text-amber-700'
                       }`}>
                          {s.status}
                       </span>
                       {isAdmin && s.status === 'PENDING' && (
                         <div className="flex gap-1">
                            <button onClick={() => handleStatusChange(s.id, 'APPROVED')} className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center justify-center text-[10px]"><i className="fa-solid fa-check"></i></button>
                            <button onClick={() => handleStatusChange(s.id, 'REJECTED')} className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm flex items-center justify-center text-[10px]"><i className="fa-solid fa-xmark"></i></button>
                         </div>
                       )}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-3">
                       <button 
                         onClick={() => startEdit(s)} 
                         className="w-11 h-11 bg-teal-50 text-teal-600 rounded-[1.2rem] hover:bg-teal-700 hover:text-white transition-all shadow-sm flex items-center justify-center group/edit"
                       >
                         <i className="fa-solid fa-pen-nib group-hover/edit:rotate-12 transition-transform"></i>
                       </button>
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

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-teal-950/80 backdrop-blur-xl animate-fade-in" onClick={() => setStudentToDelete(null)}></div>
           <div className="bg-white rounded-[4rem] p-12 max-w-md w-full relative z-10 shadow-2xl border-t-[15px] border-rose-500 animate-scale-in text-center">
              <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">
                 <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <h2 className="text-3xl font-black text-teal-950 uppercase tracking-tighter mb-4">Erase from Registry?</h2>
              <div className="p-6 bg-teal-50/30 rounded-3xl mb-10 border border-teal-100">
                 <p className="text-base font-black text-teal-900 italic line-clamp-2">"{studentToDelete.name}"</p>
              </div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-12">Action will permanently remove all biometric strings.</p>
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setStudentToDelete(null)} className="py-5 bg-gray-100 text-gray-500 rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest">Abort</button>
                 <button onClick={confirmDelete} className="py-5 bg-rose-500 text-white rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-rose-200">Confirm</button>
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
