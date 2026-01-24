
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

const StudentManagement: React.FC<StudentManagementProps> = ({ user, students, setStudents, onDelete, onLogActivity }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<{id: string, name: string} | null>(null);
  const [studentToCancel, setStudentToCancel] = useState<{id: string, name: string} | null>(null);
  const [cancelReason, setCancelReason] = useState('');
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
    paidFees: 0
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
      ...initialForm,
      ...(editingStudent || {}),
      ...formData,
      id: editingStudent?.id || Math.random().toString(36).substr(2, 9),
      parentName: formData.fatherName || formData.motherName || formData.guardianName || 'Guardian',
      status: formData.status || 'PENDING'
    } as Student;

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
    onLogActivity('UPDATE', 'Student Registry', studentToCancel.name, `Admission cancelled. Reason: ${cancelReason}`);
    setStudentToCancel(null);
    setCancelReason('');
    alert("Student moved to Cancelled Archive successfully.");
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
    setFormData({ ...student });
    setIsAdding(true);
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    await onDelete(studentToDelete.id);
    onLogActivity('DELETE', 'Student Registry', studentToDelete.name, `Permanently erased student record.`);
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
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-24">
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
               placeholder="Search registry..."
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
             />
          </div>
          <button 
            onClick={() => isAdding ? resetForm() : setIsAdding(true)}
            className={`w-full sm:w-auto px-8 py-4 text-white rounded-[1.5rem] font-black transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl ${
              isAdding ? 'bg-rose-500' : 'bg-teal-900'
            }`}
          >
            <i className={`fa-solid ${isAdding ? 'fa-xmark' : 'fa-plus'}`}></i>
            <span className="text-xs uppercase">{isAdding ? 'Discard' : 'Enroll New'}</span>
          </button>
        </div>
      </header>

      {isAdding && (
        <div className={`bg-white p-6 md:p-14 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl border-4 animate-slide-up relative overflow-hidden transition-all ${editingStudent ? 'border-amber-100' : 'border-teal-50'}`}>
          <StepIndicator />
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {currentStep === 1 && (
              <div className="space-y-6 md:space-y-10 animate-fade-in">
                 <h2 className="text-lg md:text-2xl font-black text-teal-800 uppercase tracking-tight flex items-center gap-2 border-b-2 border-teal-50 pb-3 md:pb-4"><i className="fa-solid fa-id-card-clip"></i> Identity Profile</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    <div className="lg:row-span-3 flex flex-col items-center gap-3 p-6 md:p-8 bg-teal-50/40 rounded-[2rem] border-2 border-dashed border-teal-100 shadow-inner">
                       <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] bg-white shadow-xl overflow-hidden flex items-center justify-center relative border-4 border-white transition-all">
                         {formData.photo ? <img src={formData.photo} className="w-full h-full object-cover" /> : <i className="fa-solid fa-camera text-4xl text-teal-100"></i>}
                         <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <i className="fa-solid fa-upload text-white text-xl"></i>
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
                       <p className="text-[8px] font-black text-teal-400 uppercase tracking-widest">Biometric Portrait</p>
                    </div>
                    <InputField label="Full Name" field="name" required value={formData.name} onChange={handleInputChange} />
                    <InputField label="Adm No" field="admissionNo" required value={formData.admissionNo} onChange={handleInputChange} />
                    <InputField label="DOB" field="dob" type="date" required value={formData.dob} onChange={handleInputChange} />
                    <InputField label="Grade" field="grade" type="select" required options={['1','2','3','4','5','6','7','8','9','10','11','12']} value={formData.grade} onChange={handleInputChange} />
                    <InputField label="Section" field="section" type="select" options={['A', 'B', 'C', 'D']} value={formData.section} onChange={handleInputChange} />
                    <InputField label="Gender" field="gender" type="select" required options={['MALE', 'FEMALE', 'OTHER']} value={formData.gender} onChange={handleInputChange} />
                 </div>
              </div>
            )}
            {currentStep > 1 && (
               <div className="py-20 text-center text-gray-300 font-bold uppercase tracking-widest italic border-2 border-dashed border-gray-100 rounded-3xl">Entry Stage {currentStep} Processing...</div>
            )}
            <div className="flex justify-between items-center pt-6 border-t border-teal-50">
               <button type="button" onClick={() => currentStep === 1 ? resetForm() : setCurrentStep(prev => prev - 1)} className="px-10 py-4 bg-gray-200 text-gray-600 rounded-2xl font-black uppercase text-[10px]">Back</button>
               <button type="submit" className="px-16 py-4 bg-teal-900 text-white rounded-2xl font-black uppercase text-[10px] shadow-2xl">{currentStep === 5 ? 'Save Record' : 'Next Step'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[3rem] shadow-xl border border-teal-50 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-teal-50/20 text-[10px] font-black text-teal-400 uppercase tracking-widest">
            <tr>
              <th className="px-10 py-6">Hero Profile</th>
              <th className="px-10 py-6">Admission</th>
              <th className="px-10 py-6">Status</th>
              <th className="px-10 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-teal-50">
            {filteredStudents.map(s => (
              <tr key={s.id} className="hover:bg-teal-50/10 group transition-all">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center font-black text-teal-600 overflow-hidden">
                        {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : s.name.charAt(0)}
                     </div>
                     <div><p className="font-black text-slate-900 text-base">{s.name}</p><p className="text-[9px] font-black text-teal-400">STD {s.grade}-{s.section}</p></div>
                  </div>
                </td>
                <td className="px-10 py-6 text-xs font-bold text-slate-600">{s.admissionNo}</td>
                <td className="px-10 py-6">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${s.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{s.status}</span>
                </td>
                <td className="px-10 py-6 text-right">
                  <div className="flex justify-end gap-2">
                     <button onClick={() => startEdit(s)} className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shadow-sm hover:bg-teal-600 hover:text-white transition-all"><i className="fa-solid fa-pen"></i></button>
                     {isAdmin && (
                        <button onClick={() => setStudentToCancel({id: s.id, name: s.name})} className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-sm hover:bg-rose-500 transition-all" title="Cancel Admission"><i className="fa-solid fa-user-slash"></i></button>
                     )}
                     <button onClick={() => setStudentToDelete({id: s.id, name: s.name})} className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center shadow-sm hover:bg-rose-500 hover:text-white transition-all"><i className="fa-solid fa-trash-can"></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CANCELLATION MODAL */}
      {studentToCancel && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setStudentToCancel(null)}></div>
           <div className="bg-white rounded-[3rem] p-10 max-w-md w-full relative z-10 shadow-2xl border-t-[12px] border-rose-500 animate-scale-in">
              <h2 className="text-2xl font-black text-rose-950 uppercase tracking-tighter mb-4 text-center">Admission Cancellation</h2>
              <p className="text-sm font-bold text-slate-500 text-center mb-8 italic">Cancelling "{studentToCancel.name}"</p>
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Official Reason (Mandatory)</label>
                 <textarea 
                   required 
                   className="w-full px-6 py-4 rounded-2xl bg-rose-50 border-2 border-transparent focus:bg-white focus:border-rose-300 outline-none font-bold text-rose-900 shadow-inner h-32" 
                   placeholder="e.g. TC Issued, Long Absenteeism..." 
                   value={cancelReason} 
                   onChange={e => setCancelReason(e.target.value)} 
                 />
                 <div className="grid grid-cols-2 gap-4 pt-4">
                    <button onClick={() => setStudentToCancel(null)} className="py-5 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px]">Abort</button>
                    <button 
                      disabled={!cancelReason.trim()} 
                      onClick={handleCancelStudent} 
                      className="py-5 bg-rose-500 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl disabled:opacity-50"
                    >
                      Confirm Cancel
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {studentToDelete && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setStudentToDelete(null)}></div>
           <div className="bg-white rounded-[3rem] p-10 max-w-md w-full relative z-10 shadow-2xl text-center">
              <i className="fa-solid fa-trash-can text-rose-500 text-5xl mb-6"></i>
              <h2 className="text-2xl font-black text-slate-900 uppercase mb-4">Erase Permanently?</h2>
              <p className="text-sm font-bold text-slate-500 mb-8 italic">"{studentToDelete.name}" - All data will be wiped.</p>
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setStudentToDelete(null)} className="py-5 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px]">Keep Record</button>
                 <button onClick={confirmDelete} className="py-5 bg-rose-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl">Delete Now</button>
              </div>
           </div>
        </div>
      )}

      <style>{`
        @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-in { animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>
    </div>
  );
};

export default StudentManagement;
