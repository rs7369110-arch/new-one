
import React, { useState, useRef } from 'react';
import { User, UserRole, CurriculumItem } from '../types';

interface CurriculumManagerProps {
  user: User;
  curriculum: CurriculumItem[];
  onUpdateCurriculum: (items: CurriculumItem[]) => void;
}

const CurriculumManager: React.FC<CurriculumManagerProps> = ({ user, curriculum, onUpdateCurriculum }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<CurriculumItem>>({
    grade: '',
    subject: '',
    title: '',
    fileData: '',
    fileType: '',
    fileName: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File too large! Max 5MB allowed for offline storage.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          fileData: reader.result as string,
          fileType: file.type,
          fileName: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFileSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData({ ...formData, fileData: '', fileType: '', fileName: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fileData) return alert("Please upload a PDF or Photo first!");

    const newItem: CurriculumItem = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString(),
      ...(formData as CurriculumItem)
    };
    onUpdateCurriculum([...curriculum, newItem]);
    resetForm();
  };

  const resetForm = () => {
    setIsAdding(false);
    setFormData({ grade: '', subject: '', title: '', fileData: '', fileType: '', fileName: '' });
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      onUpdateCurriculum(curriculum.filter(item => item.id !== itemToDelete));
      setItemToDelete(null);
    }
  };

  const filteredCurriculum = selectedGrade === 'All' 
    ? curriculum 
    : curriculum.filter(item => item.grade === selectedGrade);

  const openFile = (item: CurriculumItem) => {
    const win = window.open();
    if (win) {
      win.document.write(
        `<html><body style="margin:0; background:#111; display:flex; align-items:center; justify-content:center;">
          <iframe src="${item.fileData}" frameborder="0" style="border:0; width:100vw; height:100vh;" allowfullscreen></iframe>
        </body></html>`
      );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-indigo-900 tracking-tight">Academic Curriculum</h1>
          <p className="text-violet-500 font-medium italic">Master the roadmaps of knowledge! 🗺️</p>
        </div>
        <div className="flex items-center gap-4">
           <select 
             className="px-6 py-3 rounded-2xl bg-white border-2 border-indigo-100 outline-none font-bold text-indigo-600 shadow-sm focus:border-violet-400 transition-colors"
             value={selectedGrade}
             onChange={e => setSelectedGrade(e.target.value)}
           >
              <option value="All">All Grades</option>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n.toString()}>{n}th Grade</option>)}
           </select>
           {user.role === UserRole.ADMIN && (
             <button 
               onClick={() => setIsAdding(true)}
               className="px-8 py-3 bg-violet-600 text-white rounded-2xl font-black shadow-lg shadow-violet-100 hover:bg-violet-700 transition-all flex items-center gap-2 transform hover:-translate-y-1 active:scale-95"
             >
                <i className="fa-solid fa-cloud-arrow-up"></i>
                Add New Syllabus
             </button>
           )}
        </div>
      </header>

      {isAdding && (
        <form onSubmit={handleSave} className="bg-white p-8 rounded-[3rem] shadow-2xl border-4 border-violet-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
           <div className="lg:col-span-3 flex justify-between items-center mb-2">
              <h2 className="text-xl font-black text-violet-600 flex items-center gap-2">
                 <i className="fa-solid fa-folder-plus"></i>
                 Upload Curriculum File
              </h2>
              <button type="button" onClick={resetForm} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors">
                <i className="fa-solid fa-times text-xl"></i>
              </button>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest ml-1">Document Title</label>
              <input 
                required
                className="w-full px-5 py-3 rounded-xl bg-violet-50/50 border-2 border-transparent focus:bg-white focus:border-violet-300 outline-none font-bold transition-all"
                placeholder="e.g. Science Yearly Syllabus"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest ml-1">Grade</label>
              <select 
                required
                className="w-full px-5 py-3 rounded-xl bg-violet-50/50 border-2 border-transparent focus:bg-white focus:border-violet-300 outline-none font-bold transition-all"
                value={formData.grade}
                onChange={e => setFormData({...formData, grade: e.target.value})}
              >
                <option value="">Select Grade</option>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n.toString()}>{n}th Grade</option>)}
              </select>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest ml-1">Subject</label>
              <input 
                required
                className="w-full px-5 py-3 rounded-xl bg-violet-50/50 border-2 border-transparent focus:bg-white focus:border-violet-300 outline-none font-bold transition-all"
                placeholder="e.g. Mathematics"
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
              />
           </div>

           <div className="lg:col-span-3">
              <div 
                onClick={() => !formData.fileData && fileInputRef.current?.click()}
                className={`border-4 border-dashed rounded-[2.5rem] p-12 flex flex-col items-center justify-center transition-all group relative overflow-hidden ${
                  formData.fileData 
                  ? 'border-emerald-200 bg-emerald-50/30' 
                  : 'border-violet-100 bg-violet-50/30 hover:bg-violet-50 hover:border-violet-200 cursor-pointer'
                }`}
              >
                 <div className={`w-20 h-20 rounded-3xl shadow-lg flex items-center justify-center text-3xl mb-4 transition-transform ${
                    formData.fileData ? 'bg-emerald-500 text-white' : 'bg-white text-violet-500 group-hover:scale-110'
                 }`}>
                    <i className={formData.fileData ? (formData.fileType.includes('pdf') ? 'fa-solid fa-file-pdf' : 'fa-solid fa-image') : "fa-solid fa-cloud-arrow-up"}></i>
                 </div>
                 
                 {formData.fileName ? (
                   <div className="text-center z-10">
                     <p className="font-black text-gray-800 text-lg mb-1">{formData.fileName}</p>
                     <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Ready to Save</p>
                     <button 
                        type="button"
                        onClick={clearFileSelection}
                        className="mt-4 px-4 py-2 bg-rose-50 text-rose-500 rounded-lg text-xs font-black hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                     >
                       Remove & Pick Another
                     </button>
                   </div>
                 ) : (
                   <div className="text-center">
                    <p className="font-black text-gray-800 text-xl">Upload PDF or Image</p>
                    <p className="text-xs text-gray-400 mt-2 uppercase tracking-widest font-black">Click to browse • Max 5MB</p>
                   </div>
                 )}
                 <input type="file" accept="application/pdf,image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
              </div>
           </div>

           <div className="lg:col-span-3 flex justify-end gap-4 mt-2">
              <button type="button" onClick={resetForm} className="px-8 py-3 bg-gray-100 text-gray-500 rounded-xl font-black hover:bg-gray-200 transition-colors">Cancel</button>
              <button type="submit" className="px-10 py-3 bg-violet-600 text-white rounded-xl font-black shadow-lg hover:shadow-violet-200 transition-all">Save Syllabus</button>
           </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredCurriculum.length > 0 ? filteredCurriculum.map((item) => (
          <div key={item.id} className="bg-white p-8 rounded-[3.5rem] shadow-xl border-2 border-transparent hover:border-violet-100 transition-all group relative overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-5">
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-lg transition-transform group-hover:rotate-6 ${
                    item.fileType.includes('pdf') ? 'bg-rose-500 text-white' : 'bg-blue-500 text-white'
                  }`}>
                    <i className={item.fileType.includes('pdf') ? 'fa-solid fa-file-pdf' : 'fa-solid fa-image'}></i>
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-lg leading-tight group-hover:text-violet-600 transition-colors">{item.title}</h3>
                    <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mt-1">{item.subject} • Class {item.grade}th</p>
                  </div>
               </div>
            </div>

            <div className="flex-1 space-y-4">
               <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-500 truncate w-40">{item.fileName}</span>
                  <span className="text-[9px] font-black text-gray-400 bg-white px-2 py-1 rounded-md">{item.date}</span>
               </div>
               
               <div className="grid grid-cols-2 gap-3 mt-auto">
                  <button 
                    onClick={() => openFile(item)}
                    className="flex items-center justify-center gap-2 py-4 bg-violet-50 text-violet-600 rounded-2xl font-black text-sm hover:bg-violet-600 hover:text-white transition-all shadow-sm"
                  >
                     <i className="fa-solid fa-eye"></i>
                     Open
                  </button>
                  {user.role === UserRole.ADMIN ? (
                    <button 
                      onClick={() => setItemToDelete(item.id)}
                      className="flex items-center justify-center gap-2 py-4 bg-rose-50 text-rose-500 rounded-2xl font-black text-sm hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                    >
                       <i className="fa-solid fa-trash-can"></i>
                       Delete
                    </button>
                  ) : (
                    <a 
                      href={item.fileData} 
                      download={item.fileName}
                      className="flex items-center justify-center gap-2 py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-sm hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                    >
                       <i className="fa-solid fa-download"></i>
                       Download
                    </a>
                  )}
               </div>
            </div>

            {/* Background decoration */}
            <div className="absolute -bottom-10 -right-10 text-violet-50 opacity-10 text-9xl transform rotate-12">
               <i className="fa-solid fa-book-atlas"></i>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-32 text-center bg-white/50 rounded-[4rem] border-4 border-dashed border-gray-100">
             <div className="w-28 h-28 bg-violet-50 text-violet-200 rounded-full flex items-center justify-center text-6xl mx-auto mb-8 animate-pulse">
                <i className="fa-solid fa-book-open"></i>
             </div>
             <p className="text-gray-900 font-black text-2xl tracking-tight">Curriculum Vault Empty</p>
             <p className="text-gray-400 font-bold mt-2 italic max-w-sm mx-auto">Waiting for the Academic Masters to upload school syllabi and roadmaps.</p>
          </div>
        )}
      </div>

      {/* Modern Custom Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-md animate-fade-in" onClick={() => setItemToDelete(null)}></div>
           <div className="bg-white rounded-[3rem] p-10 max-w-md w-full relative z-10 shadow-2xl border-t-[10px] border-rose-500 animate-slide-up text-center">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
                 <i className="fa-solid fa-circle-exclamation"></i>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Delete Document?</h2>
              <p className="text-gray-500 font-medium mb-10 leading-relaxed">
                Are you sure you want to remove this curriculum file? This action cannot be reversed.
              </p>
              <div className="grid grid-cols-2 gap-4">
                 <button 
                  onClick={() => setItemToDelete(null)}
                  className="py-4 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition-colors"
                 >
                   Keep It
                 </button>
                 <button 
                  onClick={confirmDelete}
                  className="py-4 bg-rose-500 text-white rounded-2xl font-black shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all transform hover:scale-105"
                 >
                   Yes, Delete
                 </button>
              </div>
           </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ddd6fe;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default CurriculumManager;
