
import React, { useMemo, useState, useRef } from 'react';
import { User, UserRole, Homework, Student } from '../types';

interface HomeworkProps {
  user: User;
  homeworks: Homework[];
  setHomeworks: (h: Homework[]) => void;
  onDelete?: (id: string) => void;
  students?: Student[];
}

const HomeworkManager: React.FC<HomeworkProps> = ({ user, homeworks, setHomeworks, onDelete, students }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hwToDelete, setHwToDelete] = useState<{id: string, title: string} | null>(null);
  
  const [newHw, setNewHw] = useState({ 
    subject: '', 
    title: '', 
    description: '', 
    dueDate: '', 
    grade: '' 
  });
  
  const [attachment, setAttachment] = useState<Homework['attachment'] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isStaff = user.role === UserRole.ADMIN || user.role === UserRole.TEACHER;
  const isParent = user.role === UserRole.PARENT;

  const myChild = useMemo(() => {
    return isParent ? students?.find(s => s.id === user.studentId) : null;
  }, [isParent, students, user.studentId]);

  const displayHomeworks = useMemo(() => {
    if (isParent && myChild) {
      return homeworks.filter(h => h.grade === myChild.grade).slice().reverse();
    }
    return homeworks.slice().reverse();
  }, [homeworks, isParent, myChild]);

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewHw({ subject: '', title: '', description: '', dueDate: '', grade: '' });
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const type = file.type.includes('pdf') ? 'PDF' : 'IMAGE';
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (file.size > maxSize) {
        alert("File too large! Maximum 5MB allowed for academic archives.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment({
          data: reader.result as string,
          name: file.name,
          type: type as any
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStaff) return;

    if (editingId) {
      const updatedHomeworks = homeworks.map(h => 
        h.id === editingId ? { ...h, ...newHw, attachment: attachment || h.attachment } : h
      );
      setHomeworks(updatedHomeworks);
      alert("✅ Homework updated successfully!");
    } else {
      const homework: Homework = {
        id: "HW-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
        ...newHw,
        attachment: attachment || undefined
      };
      setHomeworks([...homeworks, homework]);
      alert("✅ New homework published successfully!");
    }
    resetForm();
  };

  const handleEdit = (h: Homework) => {
    if (!isStaff) return;
    setEditingId(h.id);
    setNewHw({
      subject: h.subject,
      title: h.title,
      description: h.description,
      dueDate: h.dueDate,
      grade: h.grade
    });
    setAttachment(h.attachment || null);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = () => {
    if (!hwToDelete) return;
    if (onDelete) {
      onDelete(hwToDelete.id);
    } else {
      const newList = homeworks.filter(item => item.id !== hwToDelete.id);
      setHomeworks(newList);
    }
    if (editingId === hwToDelete.id) resetForm();
    setHwToDelete(null);
    alert("🗑️ Homework deleted permanently.");
  };

  const openAttachment = (data: string) => {
    const win = window.open();
    if (win) {
      win.document.write(
        `<html><body style="margin:0; background:#111; display:flex; align-items:center; justify-content:center;">
          <iframe src="${data}" frameborder="0" style="border:0; width:100vw; height:100vh;" allowfullscreen></iframe>
        </body></html>`
      );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black text-indigo-950 tracking-tighter uppercase leading-none">
              Homework Hub
           </h1>
           <p className="text-indigo-500 font-bold text-[10px] uppercase tracking-[0.5em] mt-3 italic">
             {isParent ? `Assigned Tasks • Class ${myChild?.grade}` : 'Master Academic Registry Control Panel'}
           </p>
        </div>
        {isStaff && (
          <button 
            onClick={() => isAdding ? resetForm() : setIsAdding(true)}
            className={`px-10 py-5 rounded-[2.5rem] font-black shadow-2xl transition-all flex items-center gap-3 transform hover:scale-105 active:scale-95 ${isAdding ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-indigo-600 text-white shadow-indigo-200'}`}
          >
            <i className={`fa-solid ${isAdding ? 'fa-xmark' : 'fa-plus-circle'} text-xl`}></i>
            <span className="text-sm uppercase tracking-widest">{isAdding ? 'Discard Entry' : 'Post New Lesson'}</span>
          </button>
        )}
      </header>

      {isAdding && isStaff && (
        <form onSubmit={handleSave} className={`bg-white p-12 rounded-[4rem] shadow-2xl border-4 space-y-10 animate-slide-up relative overflow-hidden transition-all duration-500 ${editingId ? 'border-emerald-200 ring-4 ring-emerald-50' : 'border-indigo-50'}`}>
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full -mr-32 -mt-32 opacity-20 ${editingId ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>
          
          <div className="flex items-center gap-5 relative z-10">
             <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-2xl shadow-xl ${editingId ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'}`}>
                <i className={`fa-solid ${editingId ? 'fa-pen-to-square' : 'fa-scroll'}`}></i>
             </div>
             <div>
                <h2 className={`text-3xl font-black uppercase tracking-tight ${editingId ? 'text-emerald-700' : 'text-indigo-950'}`}>
                  {editingId ? 'Update Registry Entry' : 'Initial Lesson Record'}
                </h2>
                {editingId && <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1">Status: Modifying existing academic archive...</p>}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-2">Subject</label>
              <input required className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-4 border-transparent focus:bg-white focus:border-indigo-400 outline-none font-black text-indigo-900 shadow-inner transition-all" value={newHw.subject} onChange={e => setNewHw({...newHw, subject: e.target.value})} placeholder="e.g. Science" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-2">Target Grade</label>
              <select required className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-4 border-transparent focus:bg-white focus:border-indigo-400 outline-none font-black text-indigo-900 shadow-inner transition-all appearance-none" value={newHw.grade} onChange={e => setNewHw({...newHw, grade: e.target.value})}>
                <option value="">Select Grade</option>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n.toString()}>Class {n}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-2">Deadline Date</label>
              <input required type="date" className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-4 border-transparent focus:bg-white focus:border-indigo-400 outline-none font-black text-indigo-900 shadow-inner transition-all" value={newHw.dueDate} onChange={e => setNewHw({...newHw, dueDate: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2 relative z-10">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-2">Topic Title</label>
            <input required className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-4 border-transparent focus:bg-white focus:border-indigo-400 outline-none font-black text-xl text-indigo-950 shadow-inner transition-all" value={newHw.title} onChange={e => setNewHw({...newHw, title: e.target.value})} placeholder="Lesson Heading..." />
          </div>

          <div className="space-y-2 relative z-10">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-2">Detailed Instructions</label>
            <textarea required rows={4} className="w-full px-10 py-8 rounded-[3rem] bg-gray-50 border-4 border-transparent focus:bg-white focus:border-indigo-400 outline-none font-medium text-gray-700 shadow-inner transition-all text-lg leading-relaxed" value={newHw.description} onChange={e => setNewHw({...newHw, description: e.target.value})} placeholder="Explain the assignment tasks..." />
          </div>

          <div className="space-y-3 relative z-10">
             <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-2">Academic Material (PDF/Image)</label>
             <div className="flex flex-wrap items-center gap-6 p-10 bg-indigo-50/50 rounded-[3rem] border-4 border-dashed border-indigo-100 transition-all hover:bg-indigo-50">
                <button 
                   type="button" 
                   onClick={() => fileInputRef.current?.click()}
                   className="px-10 py-5 bg-white border-2 border-indigo-600 text-indigo-600 rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95"
                >
                   <i className="fa-solid fa-file-arrow-up mr-2"></i>
                   {attachment ? 'Replace Document' : 'Attach Material'}
                </button>
                {attachment && (
                  <div className="flex items-center gap-4 bg-emerald-50 text-emerald-600 px-6 py-4 rounded-2xl border border-emerald-100 animate-fade-in">
                     <i className={`fa-solid ${attachment.type === 'PDF' ? 'fa-file-pdf' : 'fa-image'} text-xl`}></i>
                     <span className="text-[10px] font-black truncate max-w-[200px]">{attachment.name}</span>
                     <button type="button" onClick={() => setAttachment(null)} className="text-rose-500 hover:scale-125 transition-transform" title="Remove attachment">
                        <i className="fa-solid fa-circle-xmark"></i>
                     </button>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="application/pdf,image/*" />
             </div>
          </div>

          <div className="flex justify-end gap-5 relative z-10 pt-6">
             <button type="button" onClick={resetForm} className="px-12 py-5 bg-gray-100 text-gray-500 rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all">Abort Entry</button>
             <button type="submit" className={`px-16 py-5 text-white rounded-[2.5rem] font-black shadow-2xl transition-all uppercase text-xs tracking-widest flex items-center gap-4 ${editingId ? 'bg-emerald-600 hover:bg-black shadow-emerald-200' : 'bg-indigo-950 hover:bg-black shadow-indigo-200'}`}>
               <i className={`fa-solid ${editingId ? 'fa-cloud-arrow-up' : 'fa-paper-plane'} text-xl`}></i>
               {editingId ? 'Sync Modification' : 'Commit to Registry'}
             </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-10">
        {displayHomeworks.length > 0 ? displayHomeworks.map(h => (
          <div key={h.id} className="bg-white p-10 rounded-[4.5rem] shadow-xl border-2 border-indigo-50 flex flex-col lg:flex-row gap-10 lg:items-center hover:shadow-2xl transition-all relative overflow-hidden group">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <span className="px-5 py-1.5 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-xl uppercase tracking-widest border border-indigo-100 shadow-sm">{h.subject}</span>
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Master ID: {h.id}</span>
              </div>
              <h3 className="text-3xl font-black text-indigo-950 tracking-tighter mb-4 uppercase group-hover:text-indigo-600 transition-colors">Class {h.grade}: {h.title}</h3>
              <div className="p-8 bg-gray-50 rounded-[3rem] border border-indigo-50/50 mb-6">
                 <p className="text-gray-600 font-medium text-lg leading-relaxed italic line-clamp-3">"{h.description}"</p>
              </div>

              {h.attachment && (
                <button 
                  onClick={() => openAttachment(h.attachment!.data)}
                  className="px-8 py-4 bg-white text-indigo-600 rounded-[1.8rem] flex items-center gap-3 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all border-2 border-indigo-100 shadow-md"
                >
                   <i className={`fa-solid ${h.attachment.type === 'PDF' ? 'fa-file-pdf' : 'fa-file-image'} text-xl`}></i>
                   View Resource ({h.attachment.type})
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-10 lg:border-l-4 lg:pl-12 lg:border-indigo-50 shrink-0">
               <div className="text-center min-w-[120px]">
                 <p className="text-[9px] uppercase font-black text-indigo-300 tracking-[0.3em] mb-2">Registry Due</p>
                 <div className="bg-rose-50 px-4 py-2 rounded-2xl border border-rose-100">
                    <p className="font-black text-rose-600 text-xl">{new Date(h.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                 </div>
               </div>
               
               {isStaff && (
                 <div className="flex flex-col gap-3">
                   <button 
                     onClick={() => handleEdit(h)} 
                     className="w-16 h-16 rounded-[2rem] bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center shadow-lg transform hover:scale-110 active:scale-90"
                     title="Modify Registry Entry"
                   >
                     <i className="fa-solid fa-pen-nib text-xl"></i>
                   </button>
                   <button 
                     onClick={() => setHwToDelete({id: h.id, title: h.title})} 
                     className="w-16 h-16 rounded-[2rem] bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-lg transform hover:scale-110 active:scale-90"
                     title="Permanently Remove"
                   >
                     <i className="fa-solid fa-trash-can text-xl"></i>
                   </button>
                 </div>
               )}
            </div>
            
            <div className="absolute -bottom-10 -left-10 text-indigo-50 opacity-10 text-[12rem] group-hover:rotate-12 transition-transform duration-1000 pointer-events-none">
               <i className="fa-solid fa-graduation-cap"></i>
            </div>
          </div>
        )) : (
          <div className="py-48 text-center bg-white rounded-[6rem] border-8 border-dashed border-indigo-50">
             <div className="w-40 h-40 bg-indigo-50 text-indigo-100 rounded-full flex items-center justify-center text-8xl mx-auto mb-10 animate-pulse">
                <i className="fa-solid fa-wind"></i>
             </div>
             <p className="text-indigo-950 font-black text-4xl tracking-tighter uppercase">Registry Quiet</p>
             <p className="text-indigo-400 font-bold mt-4 italic text-xl max-w-md mx-auto">No assignments are currently recorded in the academic log.</p>
          </div>
        )}
      </div>

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {hwToDelete && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6">
           <div 
             className="absolute inset-0 bg-indigo-950/90 backdrop-blur-xl animate-fade-in" 
             onClick={() => setHwToDelete(null)}
           ></div>
           
           <div className="bg-white rounded-[3.5rem] p-12 max-w-md w-full relative z-10 shadow-2xl border-t-[15px] border-rose-500 animate-scale-in flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2.5rem] flex items-center justify-center text-5xl mb-8 shadow-inner">
                 <i className="fa-solid fa-trash-can"></i>
              </div>
              
              <h2 className="text-3xl font-black text-indigo-950 uppercase tracking-tighter mb-4">Erase Homework?</h2>

              <div className="p-6 bg-gray-50 rounded-2xl w-full mb-10 border border-gray-100">
                 <p className="text-base font-black text-gray-800 line-clamp-2 italic">"{hwToDelete.title}"</p>
              </div>

              <p className="text-sm text-gray-500 font-medium leading-relaxed mb-12">
                 Are you sure you want to delete this homework? This action will remove the record and any attachments from the system forever.
              </p>

              <div className="grid grid-cols-2 gap-4 w-full">
                 <button 
                   onClick={() => setHwToDelete(null)}
                   className="py-5 bg-gray-100 text-gray-500 rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all"
                 >
                    CANCEL
                 </button>
                 <button 
                   onClick={confirmDelete}
                   className="py-5 bg-rose-500 text-white rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-rose-200 hover:bg-rose-600 transition-all"
                 >
                    YES, DELETE
                 </button>
              </div>
           </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { 
          from { transform: translateY(40px); opacity: 0; } 
          to { transform: translateY(0); opacity: 1; } 
        }
        .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-in { animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>
    </div>
  );
};

export default HomeworkManager;
