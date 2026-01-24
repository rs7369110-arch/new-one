
import React, { useState, useRef, useMemo } from 'react';
import { User, UserRole, Notice, Student } from '../types';

interface NoticeBoardProps {
  user: User;
  notices: Notice[];
  setNotices: (notices: Notice[]) => void;
  students?: Student[];
  // Added optional onDeleteNotice to fix Type error in App.tsx
  onDeleteNotice?: (id: string) => void;
  onLogActivity: (actionType: 'CREATE' | 'UPDATE' | 'DELETE', module: string, target: string, details?: string) => void;
}

const CATEGORIES = ['ALL', 'URGENT', 'EXAM', 'HOLIDAY', 'FEE', 'EVENT', 'GENERAL'];
const CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

// Added onDeleteNotice to destructuring
const NoticeBoard: React.FC<NoticeBoardProps> = ({ user, notices, setNotices, students, onLogActivity, onDeleteNotice }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noticeToDelete, setNoticeToDelete] = useState<{id: string, title: string} | null>(null);
  
  const [formData, setFormData] = useState<Partial<Notice>>({
    title: '',
    content: '',
    category: 'GENERAL',
    targetGrades: ['All'],
    isPinned: false
  });
  
  const [attachment, setAttachment] = useState<Notice['attachment'] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user.role === UserRole.ADMIN || user.role === UserRole.TEACHER;
  
  const currentUserGrade = useMemo(() => {
    if (user.role === UserRole.STUDENT || user.role === UserRole.PARENT) {
      if (user.studentId) {
        return students?.find(s => s.id === user.studentId)?.grade;
      }
    }
    return null;
  }, [user, students]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const type = file.type.includes('pdf') ? 'PDF' : 'IMAGE';
      const maxSize = type === 'PDF' ? 5 * 1024 * 1024 : 3 * 1024 * 1024;

      if (file.size > maxSize) {
        alert(`File too large! Maximum ${type === 'PDF' ? '5MB' : '3MB'} allowed.`);
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

  const toggleGrade = (grade: string) => {
    setFormData(prev => {
      let grades = [...(prev.targetGrades || [])];
      if (grade === 'All') {
        grades = ['All'];
      } else {
        grades = grades.filter(g => g !== 'All');
        if (grades.includes(grade)) {
          grades = grades.filter(g => g !== grade);
          if (grades.length === 0) grades = ['All'];
        } else {
          grades.push(grade);
        }
      }
      return { ...prev, targetGrades: grades };
    });
  };

  const selectAllGrades = () => {
    setFormData(prev => {
      const isCurrentlySelectAll = prev.targetGrades?.length === CLASSES.length;
      return { ...prev, targetGrades: isCurrentlySelectAll ? ['All'] : [...CLASSES] };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const finalGrades = (formData.targetGrades && formData.targetGrades.length > 0) ? formData.targetGrades : ['All'];

    if (editingId) {
      const updated = notices.map(n => 
        n.id === editingId ? { ...n, ...formData, targetGrades: finalGrades, attachment: attachment || undefined } : n
      );
      setNotices(updated as Notice[]);
      onLogActivity('UPDATE', 'Notice Board', formData.title || 'Untitled', `Updated announcement for ${finalGrades.join(', ')}`);
    } else {
      const newNotice: Notice = {
        id: "NT-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
        date: new Date().toLocaleDateString('en-GB'),
        ...(formData as Notice),
        targetGrades: finalGrades,
        attachment: attachment || undefined
      };
      setNotices([...notices, newNotice]);
      onLogActivity('CREATE', 'Notice Board', newNotice.title, `Published new official notice for ${finalGrades.join(', ')}`);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', category: 'GENERAL', targetGrades: ['All'], isPinned: false });
    setAttachment(null);
    setEditingId(null);
    setIsAdding(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startEdit = (notice: Notice) => {
    setEditingId(notice.id);
    setFormData(notice);
    setAttachment(notice.attachment || null);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = () => {
    if (!isAdmin || !noticeToDelete) return;
    
    // Use onDeleteNotice if provided (to use central sync delete), else filter locally
    if (onDeleteNotice) {
      onDeleteNotice(noticeToDelete.id);
    } else {
      const newList = notices.filter(n => n.id !== noticeToDelete.id);
      setNotices(newList);
    }
    
    onLogActivity('DELETE', 'Notice Board', noticeToDelete.title, 'Removed announcement from system feed.');
    if (editingId === noticeToDelete.id) resetForm();
    setNoticeToDelete(null);
  };

  const togglePin = (notice: Notice) => {
    if (!isAdmin) return;
    const newStatus = !notice.isPinned;
    setNotices(notices.map(n => n.id === notice.id ? { ...n, isPinned: newStatus } : n));
    onLogActivity('UPDATE', 'Notice Board', notice.title, `${newStatus ? 'Pinned' : 'Unpinned'} announcement for high visibility.`);
  };

  const filteredNotices = useMemo(() => {
    return notices.filter(n => {
      const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           n.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'ALL' || n.category === selectedCategory;
      let matchesGrade = true;
      if (user.role === UserRole.STUDENT || user.role === UserRole.PARENT) {
        matchesGrade = n.targetGrades.includes('All') || (currentUserGrade ? n.targetGrades.includes(currentUserGrade) : false);
      }
      return matchesSearch && matchesCat && matchesGrade;
    }).sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [notices, searchQuery, selectedCategory, currentUserGrade, user.role]);

  const getCategoryStyles = (cat: string) => {
    switch (cat) {
      case 'URGENT': return 'bg-rose-500 text-white';
      case 'EXAM': return 'bg-indigo-600 text-white';
      case 'HOLIDAY': return 'bg-amber-500 text-white';
      case 'FEE': return 'bg-emerald-600 text-white';
      case 'EVENT': return 'bg-purple-600 text-white';
      default: return 'bg-slate-500 text-white';
    }
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
    <div className="space-y-10 animate-fade-in pb-32">
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b-4 border-indigo-50 pb-10">
        <div className="space-y-2">
           <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-900 text-white rounded-[2rem] flex items-center justify-center text-3xl shadow-2xl">
                 <i className="fa-solid fa-bullhorn"></i>
              </div>
              <div>
                <h1 className="text-4xl font-black text-indigo-950 tracking-tighter uppercase leading-none">Academy Feed</h1>
                <p className="text-indigo-400 font-bold text-xs uppercase tracking-[0.4em] mt-2">Official Communications Hub</p>
              </div>
           </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
           <div className="relative group">
              <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-indigo-300 transition-colors group-focus-within:text-indigo-600"></i>
              <input 
                type="text" 
                className="pl-14 pr-6 py-4 bg-white border-2 border-indigo-50 rounded-2xl outline-none focus:border-indigo-400 w-full sm:w-80 font-bold text-sm shadow-sm transition-all"
                placeholder="Search archives..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
           </div>

           {isAdmin && (
             <button 
               onClick={() => isAdding ? resetForm() : setIsAdding(true)}
               className={`px-10 py-5 rounded-[2rem] font-black shadow-2xl transition-all flex items-center gap-3 transform hover:scale-105 active:scale-95 ${isAdding ? 'bg-rose-500 text-white' : 'bg-indigo-900 text-white'}`}
             >
                <i className={`fa-solid ${isAdding ? 'fa-xmark' : 'fa-plus'}`}></i>
                {isAdding ? 'Cancel Entry' : 'Post New Notice'}
             </button>
           )}
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-3">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
              selectedCategory === cat 
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
              : 'bg-white border-indigo-50 text-indigo-300 hover:border-indigo-200 hover:text-indigo-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isAdding && isAdmin && (
        <form onSubmit={handleSave} className="bg-white p-12 rounded-[4.5rem] shadow-2xl border-4 border-indigo-50 space-y-10 animate-slide-up relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.4em] ml-2">Announcement Title</label>
                 <input 
                   required
                   className="w-full px-8 py-5 rounded-[2.5rem] bg-indigo-50/50 border-4 border-transparent focus:bg-white focus:border-indigo-400 outline-none font-black text-xl text-indigo-950 shadow-inner"
                   placeholder="Enter catchy headline..."
                   value={formData.title}
                   onChange={e => setFormData({...formData, title: e.target.value})}
                 />
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.4em] ml-2">Protocol Category</label>
                 <select 
                   required
                   className="w-full px-8 py-5 rounded-[2.5rem] bg-indigo-50/50 border-4 border-transparent focus:bg-white focus:border-indigo-400 outline-none font-black text-indigo-900 shadow-inner appearance-none"
                   value={formData.category}
                   onChange={e => setFormData({...formData, category: e.target.value as any})}
                 >
                   {CATEGORIES.filter(c => c !== 'ALL').map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
              </div>
           </div>

           <div className="space-y-3 relative z-10">
              <div className="flex justify-between items-center px-2">
                 <label className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.4em]">Target Audience (Classes)</label>
                 <button type="button" onClick={selectAllGrades} className="text-[9px] font-black text-indigo-600 uppercase hover:underline">
                    {formData.targetGrades?.length === CLASSES.length ? 'Reset Selection' : 'Select All Classes'}
                 </button>
              </div>
              <div className="flex flex-wrap gap-2 p-6 bg-gray-50 rounded-[2.5rem] border-2 border-indigo-100 shadow-inner">
                 <button 
                   type="button"
                   onClick={() => toggleGrade('All')}
                   className={`px-5 py-3 rounded-xl font-black text-[10px] border transition-all ${
                    formData.targetGrades?.includes('All') 
                    ? 'bg-indigo-900 border-indigo-900 text-white shadow-lg' 
                    : 'bg-white border-indigo-200 text-indigo-400 hover:border-indigo-500'
                   }`}
                 >
                    SCHOOL-WIDE
                 </button>
                 <div className="w-[2px] h-10 bg-indigo-100 mx-2"></div>
                 {CLASSES.map(cls => (
                   <button 
                     key={cls}
                     type="button"
                     onClick={() => toggleGrade(cls)}
                     className={`px-5 py-3 rounded-xl font-black text-[10px] border transition-all ${
                      formData.targetGrades?.includes(cls) 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                      : 'bg-white border-indigo-200 text-indigo-400 hover:border-indigo-500'
                     }`}
                   >
                      CLASS {cls}
                   </button>
                 ))}
              </div>
           </div>

           <div className="space-y-3 relative z-10">
              <label className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.4em] ml-2">Content Details</label>
              <textarea 
                required
                rows={5}
                className="w-full px-10 py-8 rounded-[3rem] bg-indigo-50/50 border-4 border-transparent focus:bg-white focus:border-indigo-400 outline-none font-medium text-gray-700 shadow-inner text-lg leading-relaxed"
                placeholder="Compose your message..."
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})}
              />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.4em] ml-2">Media Attachment (PDF/Image)</label>
                 <div className="flex flex-wrap items-center gap-6 p-6 bg-gray-50 rounded-[2.5rem] border-4 border-dashed border-indigo-100">
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-10 py-5 bg-white border-2 border-indigo-600 rounded-[1.5rem] text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95"
                    >
                       <i className="fa-solid fa-cloud-arrow-up mr-2"></i>
                       {attachment ? 'Swap File' : 'Pick Document'}
                    </button>
                    {attachment && (
                      <div className="flex items-center gap-4 bg-emerald-50 text-emerald-600 px-6 py-4 rounded-2xl border border-emerald-100 animate-fade-in">
                         <i className={`fa-solid ${attachment.type === 'PDF' ? 'fa-file-pdf' : 'fa-image'}`}></i>
                         <span className="text-[10px] font-black truncate max-w-[150px]">{attachment.name}</span>
                         <button type="button" onClick={() => setAttachment(null)} className="text-rose-500 hover:scale-125 transition-transform">
                            <i className="fa-solid fa-circle-xmark"></i>
                         </button>
                      </div>
                    )}
                 </div>
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf" />
              </div>

              <div className="flex items-center gap-6 pt-10">
                 <button 
                   type="button"
                   onClick={() => setFormData({...formData, isPinned: !formData.isPinned})}
                   className={`flex-1 py-6 rounded-[2.5rem] font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-4 ${
                     formData.isPinned ? 'bg-amber-100 text-amber-600 border-2 border-amber-300 shadow-inner' : 'bg-gray-100 text-gray-400 border-2 border-transparent'
                   }`}
                 >
                    <i className="fa-solid fa-thumbtack"></i>
                    {formData.isPinned ? 'Pinned Important' : 'Standard Priority'}
                 </button>
                 
                 {editingId && (
                   <button 
                     type="button"
                     onClick={() => setNoticeToDelete({id: editingId, title: formData.title || 'this notice'})}
                     className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] border-2 border-rose-100 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center text-2xl shadow-lg"
                     title="Delete permanently"
                   >
                      <i className="fa-solid fa-trash-can"></i>
                   </button>
                 )}
              </div>
           </div>

           <div className="flex justify-end gap-6 pt-6 relative z-10">
              <button type="button" onClick={resetForm} className="px-12 py-5 bg-gray-100 text-gray-500 rounded-[2rem] font-black uppercase text-xs tracking-widest">Discard</button>
              <button type="submit" className="px-20 py-5 bg-indigo-950 text-white rounded-[2rem] font-black shadow-2xl hover:bg-black transition-all text-xs uppercase tracking-[0.2em]">
                {editingId ? 'Seal Changes' : 'Publish to Feed'}
              </button>
           </div>
        </form>
      )}

      {/* Main Grid Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {filteredNotices.length > 0 ? filteredNotices.map(n => (
          <div key={n.id} className="bg-white p-10 rounded-[4.5rem] shadow-2xl border-b-[16px] flex flex-col min-h-[520px] transition-all hover:shadow-indigo-900/10 hover:-translate-y-2 relative group" style={{ borderBottomColor: n.category === 'URGENT' ? '#f43f5e' : n.category === 'EXAM' ? '#4f46e5' : n.category === 'HOLIDAY' ? '#f59e0b' : n.category === 'FEE' ? '#10b981' : '#64748b' }}>
            
            {n.isPinned && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-white px-8 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] shadow-xl z-20 flex items-center gap-3">
                 <i className="fa-solid fa-thumbtack"></i> Pinned Official
              </div>
            )}

            <div className="flex justify-between items-start mb-8">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">{n.date}</span>
                  <p className="text-[8px] font-black text-gray-300 uppercase mt-0.5">REF: {n.id}</p>
               </div>
               <span className={`px-5 py-2 rounded-full text-[10px] font-black shadow-xl uppercase tracking-widest ${getCategoryStyles(n.category)}`}>
                  {n.category}
               </span>
            </div>

            <div className="mb-6">
               <h3 className="text-3xl font-black text-indigo-950 leading-tight group-hover:text-indigo-600 transition-colors uppercase line-clamp-2">{n.title}</h3>
               <div className="flex flex-wrap gap-1 mt-3">
                  {n.targetGrades.includes('All') ? (
                    <span className="text-[8px] font-black text-indigo-400 uppercase bg-indigo-50 px-2 py-0.5 rounded-md">Everyone</span>
                  ) : (
                    n.targetGrades.map(tg => (
                      <span key={tg} className="text-[8px] font-black text-indigo-500 uppercase bg-indigo-50 px-2 py-0.5 rounded-md">Grade {tg}</span>
                    ))
                  )}
               </div>
            </div>
            
            <div className="flex-1 bg-gray-50/80 p-8 rounded-[3rem] border border-indigo-50 mb-8 overflow-y-auto custom-scrollbar">
               <p className="text-gray-600 text-base font-medium whitespace-pre-wrap leading-relaxed italic">"{n.content}"</p>
            </div>

            {n.attachment && (
              <button 
                onClick={() => openAttachment(n.attachment!.data)}
                className="mb-8 w-full py-6 bg-indigo-50 text-indigo-600 rounded-[2.5rem] flex items-center justify-center gap-4 font-black text-xs hover:bg-indigo-600 hover:text-white transition-all border-4 border-indigo-100 shadow-sm"
              >
                <i className={`fa-solid ${n.attachment.type === 'PDF' ? 'fa-file-pdf' : 'fa-image'} text-2xl`}></i>
                {n.attachment.type === 'PDF' ? 'VIEW PDF' : 'VIEW IMAGE'}
              </button>
            )}

            {isAdmin && (
              <div className="pt-8 border-t border-gray-100 flex gap-4">
                 <button 
                   onClick={() => startEdit(n)}
                   className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                 >
                    <i className="fa-solid fa-pen-nib"></i>
                 </button>
                 <button 
                   onClick={() => togglePin(n)}
                   className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-all shadow-sm ${n.isPinned ? 'bg-amber-400 text-white shadow-amber-200' : 'bg-gray-50 text-gray-400 hover:bg-amber-50 hover:text-amber-500'}`}
                 >
                    <i className="fa-solid fa-thumbtack"></i>
                 </button>
                 <button 
                   onClick={() => setNoticeToDelete({id: n.id, title: n.title})}
                   className="flex-1 bg-rose-50 text-rose-500 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
                 >
                    <i className="fa-solid fa-trash-can"></i> REMOVE
                 </button>
              </div>
            )}
          </div>
        )) : (
          <div className="col-span-full py-48 text-center bg-white rounded-[6rem] border-8 border-dashed border-indigo-50">
             <div className="w-40 h-40 bg-indigo-50 text-indigo-200 rounded-full flex items-center justify-center text-8xl mx-auto mb-10 animate-pulse">
                <i className="fa-solid fa-wind"></i>
             </div>
             <p className="font-black text-4xl text-indigo-900 uppercase tracking-tighter">Quiet Archive</p>
             <p className="text-indigo-400 font-bold mt-4 italic text-xl">No announcements match your search criteria.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {noticeToDelete && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6">
           <div 
             className="absolute inset-0 bg-indigo-950/90 backdrop-blur-xl animate-fade-in" 
             onClick={() => setNoticeToDelete(null)}
           ></div>
           
           <div className="bg-white rounded-[3.5rem] p-12 max-w-md w-full relative z-10 shadow-2xl border-t-[15px] border-rose-500 animate-scale-in flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2.5rem] flex items-center justify-center text-5xl mb-8 shadow-inner">
                 <i className="fa-solid fa-trash-can"></i>
              </div>
              
              <h2 className="text-3xl font-black text-indigo-950 uppercase tracking-tighter mb-4">Erase Notice?</h2>

              <div className="p-6 bg-gray-50 rounded-2xl w-full mb-10 border border-gray-100">
                 <p className="text-base font-black text-gray-800 line-clamp-2 italic">"{noticeToDelete.title}"</p>
              </div>

              <p className="text-sm text-gray-500 font-medium leading-relaxed mb-12">
                 This action is irreversible. All student and parent dashboards will lose access to this notice immediately.
              </p>

              <div className="grid grid-cols-2 gap-4 w-full">
                 <button 
                   onClick={() => setNoticeToDelete(null)}
                   className="py-5 bg-gray-100 text-gray-500 rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest"
                 >
                    Keep
                 </button>
                 <button 
                   onClick={confirmDelete}
                   className="py-5 bg-rose-500 text-white rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-rose-200"
                 >
                    Delete Now
                 </button>
              </div>
           </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #6366f1; border-radius: 10px; }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-in { animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>
    </div>
  );
};

export default NoticeBoard;
