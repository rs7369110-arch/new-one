
import React, { useState, useRef } from 'react';
import { User, UserRole, GalleryItem } from '../types';
import Logo from './Logo';

interface GalleryManagerProps {
  user: User;
  gallery: GalleryItem[];
  onUpdateGallery: (items: GalleryItem[]) => void;
  onDeleteItem: (id: string) => Promise<void>;
  isDarkMode: boolean;
  onLogActivity: (actionType: 'CREATE' | 'DELETE', module: string, target: string, details?: string) => void;
}

interface PendingFile {
  id: string;
  url: string;
  type: 'IMAGE' | 'VIDEO';
  name: string;
}

const GalleryManager: React.FC<GalleryManagerProps> = ({ user, gallery, onUpdateGallery, onDeleteItem, isDarkMode, onLogActivity }) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'IMAGE' | 'VIDEO'>('ALL');
  const [gradeFilter, setGradeFilter] = useState<'All' | string>('All');
  const [isAdding, setIsAdding] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<GalleryItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [uploadGrades, setUploadGrades] = useState<string[]>(['1']);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = user.role === UserRole.ADMIN;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin || !e.target.files) return;
    
    setIsProcessing(true);
    const files = Array.from(e.target.files) as File[];
    const newPending: PendingFile[] = [];

    for (const file of files) {
      const type: 'IMAGE' | 'VIDEO' = file.type.startsWith('video') ? 'VIDEO' : 'IMAGE';
      const maxSize = type === 'VIDEO' ? 8 * 1024 * 1024 : 3 * 1024 * 1024;

      if (file.size > maxSize) {
        alert(`"${file.name}" is too heavy. Max: ${type === 'VIDEO' ? '8MB' : '3MB'}`);
        continue;
      }

      const reader = new FileReader();
      const promise = new Promise<void>((resolve) => {
        reader.onloadend = () => {
          newPending.push({
            id: Math.random().toString(36).substr(2, 9),
            url: reader.result as string,
            type,
            name: file.name
          });
          resolve();
        };
      });
      reader.readAsDataURL(file);
      await promise;
    }

    setPendingFiles(prev => [...prev, ...newPending]);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePending = (id: string) => {
    setPendingFiles(prev => prev.filter(f => f.id !== id));
  };

  const toggleUploadGrade = (grade: string) => {
    setUploadGrades(prev => 
      prev.includes(grade) 
        ? prev.filter(g => g !== grade) 
        : [...prev, grade]
    );
  };

  const selectAllGrades = () => {
    if (uploadGrades.length === 12) {
      setUploadGrades([]);
    } else {
      setUploadGrades(['1','2','3','4','5','6','7','8','9','10','11','12']);
    }
  };

  const handleBulkPublish = () => {
    if (pendingFiles.length === 0 || uploadGrades.length === 0) return;

    const newItems: GalleryItem[] = [];
    pendingFiles.forEach(f => {
      uploadGrades.forEach(grade => {
        newItems.push({
          id: Math.random().toString(36).substr(2, 9),
          type: f.type,
          grade: grade,
          title: f.name.split('.')[0],
          description: `Moment from Class ${grade} • Academic Session 2024`,
          url: f.url,
          date: new Date().toLocaleDateString()
        });
      });
    });

    onUpdateGallery([...gallery, ...newItems]);
    onLogActivity('CREATE', 'Memory Wall', `${pendingFiles.length} Assets`, `Bulk published gallery items to Classes: ${uploadGrades.join(', ')}`);
    setPendingFiles([]);
    setIsAdding(false);
  };

  const confirmDelete = async () => {
    if (!isAdmin || !itemToDelete) return;
    // Explicitly delete from cloud via prop
    await onDeleteItem(itemToDelete.id);
    onLogActivity('DELETE', 'Memory Wall', itemToDelete.title, `Permanently removed asset from Class ${itemToDelete.grade} archives.`);
    setItemToDelete(null);
  };

  const toggleItemSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Permanently erase ${selectedIds.length} selected items from database?`)) {
      const idsToDelete = [...selectedIds];
      setIsProcessing(true);
      for (const id of idsToDelete) {
        await onDeleteItem(id);
      }
      onLogActivity('DELETE', 'Memory Wall', 'Multiple Assets', `Bulk erased ${idsToDelete.length} items from gallery registry.`);
      setSelectedIds([]);
      setIsSelectMode(false);
      setIsProcessing(false);
    }
  };

  const filteredItems = gallery.filter(item => {
    const typeMatch = activeFilter === 'ALL' || item.type === activeFilter;
    const gradeMatch = gradeFilter === 'All' || item.grade === gradeFilter;
    return typeMatch && gradeMatch;
  });

  return (
    <div className={`space-y-6 md:space-y-8 animate-fade-in pb-24 ${isDarkMode ? 'text-slate-100' : 'text-[#1e293b]'}`}>
      <header className={`p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 transition-all duration-700 ${
        isDarkMode ? 'bg-[#0f172a] border-emerald-500/10' : 'bg-[#0f172a] text-white border-emerald-950 shadow-2xl shadow-indigo-900/20'
      }`}>
        <div className="flex items-center gap-4 md:gap-8 relative z-10">
          <div className="w-14 h-14 md:w-20 md:h-20 bg-emerald-500 text-white rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center text-2xl md:text-4xl shadow-[0_0_30px_rgba(16,185,129,0.3)]">
             <i className="fa-solid fa-photo-film"></i>
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-none">Memory Wall</h1>
            <p className="text-[8px] md:text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mt-2 italic">
              {isSelectMode ? `${selectedIds.length} Assets Selected` : `Academy Archives • ${gallery.length} Assets`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
           <div className={`flex p-1 rounded-[1rem] md:p-1.5 md:rounded-[1.5rem] bg-white/5 border border-white/5 backdrop-blur-md`}>
              {['ALL', 'IMAGE', 'VIDEO'].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f as any)}
                  className={`px-3 md:px-6 py-2 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeFilter === f 
                    ? 'bg-emerald-500 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-emerald-400'
                  }`}
                >
                  {f === 'ALL' ? 'ALL' : f === 'IMAGE' ? 'Photos' : 'Clips'}
                </button>
              ))}
           </div>

           <select 
             className="px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[8px] md:text-[10px] uppercase tracking-widest outline-none focus:border-emerald-500 transition-all"
             value={gradeFilter}
             onChange={e => setGradeFilter(e.target.value)}
           >
              <option value="All">All Grades</option>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n.toString()}>Class {n}</option>)}
           </select>

           {isAdmin && (
             <div className="flex gap-2">
                {isSelectMode ? (
                  <>
                    <button 
                      onClick={handleBulkDelete}
                      disabled={selectedIds.length === 0 || isProcessing}
                      className="px-4 py-2 bg-rose-500 text-white rounded-xl font-black text-[8px] uppercase tracking-widest shadow-xl transition-all"
                    >
                       Erase ({selectedIds.length})
                    </button>
                    <button 
                      onClick={() => { setIsSelectMode(false); setSelectedIds([]); }}
                      className="px-4 py-2 bg-white/10 text-white rounded-xl font-black text-[8px] uppercase tracking-widest"
                    >
                       X
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setIsSelectMode(true)}
                      className="w-10 h-10 md:w-14 md:h-14 bg-white/10 text-rose-400 rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/5"
                    >
                       <i className="fa-solid fa-trash-can"></i>
                    </button>
                    <button 
                      onClick={() => setIsAdding(true)}
                      className="px-5 md:px-8 py-3 md:py-4 bg-amber-400 text-amber-950 rounded-xl md:rounded-[1.5rem] font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-2xl transition-all"
                    >
                       Upload
                    </button>
                  </>
                )}
             </div>
           )}
        </div>
        <div className="absolute top-[-20%] right-[-5%] w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]"></div>
      </header>

      {isAdding && isAdmin && (
        <div className={`p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl border-4 animate-slide-up relative overflow-hidden ${
          isDarkMode ? 'bg-slate-900 border-emerald-500/20' : 'bg-white border-emerald-50'
        }`}>
           <div className="flex justify-between items-center mb-8">
              <h2 className={`text-lg md:text-2xl font-black uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-[#0f172a]'}`}>
                Upload Engine
              </h2>
              <button onClick={() => { setPendingFiles([]); setIsAdding(false); }} className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                 <i className="fa-solid fa-xmark"></i>
              </button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              <div className="space-y-6">
                 <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Target Classes</label>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                       {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                         <button 
                           key={n}
                           onClick={() => toggleUploadGrade(n.toString())}
                           className={`py-2 rounded-lg font-black text-[9px] border transition-all ${
                             uploadGrades.includes(n.toString()) 
                             ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' 
                             : 'bg-transparent border-slate-200 dark:border-white/5 text-slate-400'
                           }`}
                         >
                           {n}th
                         </button>
                       ))}
                    </div>
                 </div>

                 <div 
                   onClick={() => fileInputRef.current?.click()}
                   className={`border-4 border-dashed rounded-[2rem] md:rounded-[3.5rem] p-10 md:p-20 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] ${
                     isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-emerald-50/30 border-emerald-100'
                   }`}
                 >
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-emerald-500 text-white rounded-2xl md:rounded-[2rem] flex items-center justify-center text-3xl md:text-5xl mb-6 shadow-2xl">
                       <i className="fa-solid fa-plus"></i>
                    </div>
                    <p className={`font-black text-lg md:text-2xl tracking-tighter mb-1 ${isDarkMode ? 'text-white' : 'text-[#0f172a]'}`}>Select Assets</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Photos & Videos</p>
                    <input type="file" multiple accept="image/*,video/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                 </div>
              </div>

              <div className="flex flex-col h-full">
                 <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Staging Area ({pendingFiles.length})</h3>
                 <div className={`flex-1 rounded-[2rem] md:rounded-[3rem] p-6 max-h-[350px] md:max-h-[450px] overflow-y-auto custom-scrollbar border-2 ${
                   isDarkMode ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-emerald-100'
                 }`}>
                    {pendingFiles.length > 0 ? (
                      <div className="grid grid-cols-3 gap-4 md:gap-6">
                         {pendingFiles.map(f => (
                           <div key={f.id} className="relative aspect-square rounded-2xl overflow-hidden group shadow-xl">
                              {f.type === 'IMAGE' ? (
                                <img src={f.url} className="w-full h-full object-cover" alt="Pending" />
                              ) : (
                                <div className="w-full h-full bg-[#0f172a] flex items-center justify-center">
                                   <i className="fa-solid fa-video text-white/20 text-xl"></i>
                                </div>
                              )}
                              <button onClick={() => removePending(f.id)} className="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-white rounded-lg flex items-center justify-center text-[10px]">
                                 <i className="fa-solid fa-xmark"></i>
                              </button>
                           </div>
                         ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center opacity-10">
                         <i className="fa-solid fa-images text-6xl md:text-9xl mb-4"></i>
                         <p className="text-sm font-black uppercase tracking-widest">Queue Empty</p>
                      </div>
                    )}
                 </div>
                 
                 <div className="mt-6 p-4 md:p-6 bg-emerald-500/5 rounded-[1.5rem] md:rounded-[2.5rem] border border-emerald-500/10 flex items-center justify-between">
                    <div className="max-w-[50%]">
                       <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Destinations</p>
                       <p className={`font-black text-[10px] truncate ${isDarkMode ? 'text-white' : 'text-[#0f172a]'}`}>
                          {uploadGrades.length > 0 ? `Class: ${uploadGrades.join(', ')}` : 'None'}
                       </p>
                    </div>
                    <button 
                      disabled={pendingFiles.length === 0 || uploadGrades.length === 0}
                      onClick={handleBulkPublish}
                      className="px-6 md:px-12 py-3 md:py-5 bg-emerald-500 text-white rounded-xl md:rounded-[1.8rem] font-black uppercase tracking-widest shadow-2xl disabled:opacity-20 text-[10px]"
                    >
                      Publish
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Main Grid View */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
        {filteredItems.length > 0 ? filteredItems.slice().reverse().map((item) => (
          <div key={item.id} className="group relative">
            <div 
              className={`rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl transition-all duration-500 cursor-pointer overflow-hidden border transform hover:-translate-y-2 flex flex-col relative ${
                isDarkMode ? 'bg-[#111827] border-white/5' : 'bg-white border-emerald-50'
              } ${isSelectMode && selectedIds.includes(item.id) ? 'ring-4 ring-emerald-500' : ''}`}
              onClick={() => isSelectMode ? toggleItemSelection(item.id) : setSelectedItem(item)}
            >
               <div className="relative aspect-square bg-slate-900 overflow-hidden">
                  {item.type === 'IMAGE' ? (
                    <img src={item.url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={item.title} />
                  ) : (
                    <div className="w-full h-full relative">
                       <video className="w-full h-full object-cover">
                          <source src={item.url} />
                       </video>
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-10 h-10 md:w-14 md:h-14 bg-white/90 text-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
                             <i className="fa-solid fa-play ml-1"></i>
                          </div>
                       </div>
                    </div>
                  )}
                  
                  {isSelectMode && (
                    <div className={`absolute inset-0 flex items-center justify-center transition-all ${selectedIds.includes(item.id) ? 'bg-emerald-500/20' : 'bg-black/40 opacity-0 group-hover:opacity-100'}`}>
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-2xl border-4 ${selectedIds.includes(item.id) ? 'bg-emerald-500 border-white text-white' : 'bg-white border-emerald-500 text-emerald-500'}`}>
                          <i className={`fa-solid ${selectedIds.includes(item.id) ? 'fa-check' : 'fa-plus'}`}></i>
                       </div>
                    </div>
                  )}

                  {isAdmin && !isSelectMode && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setItemToDelete(item); }}
                      className="absolute top-2 right-2 md:top-4 md:right-4 w-9 h-9 md:w-11 md:h-11 bg-rose-500 text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-all"
                    >
                       <i className="fa-solid fa-trash-can text-sm"></i>
                    </button>
                  )}

                  {!isSelectMode && (
                    <div className="absolute top-2 left-2 md:top-4 md:left-4">
                       <span className={`px-2 md:px-3 py-1 rounded-lg md:rounded-xl text-[7px] md:text-[8px] font-black uppercase tracking-widest shadow-lg bg-indigo-600 text-white border border-white/10`}>
                          Grade {item.grade}
                       </span>
                    </div>
                  )}
               </div>

               <div className="p-4 md:p-6">
                  <h3 className={`text-[9px] md:text-[11px] font-black truncate uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-[#0f172a]'}`}>{item.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                     <p className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.date}</p>
                  </div>
               </div>
            </div>
          </div>
        )) : (
          <div className={`col-span-full py-20 md:py-40 text-center rounded-[3rem] md:rounded-[5rem] border-4 border-dashed transition-all ${
            isDarkMode ? 'bg-[#111827]/30 border-white/5' : 'bg-slate-50 border-emerald-100'
          }`}>
             <i className="fa-solid fa-wind text-4xl md:text-6xl mb-4 md:mb-8 text-indigo-500"></i>
             <p className={`text-xl md:text-4xl font-black uppercase ${isDarkMode ? 'text-white' : 'text-[#0f172a]'}`}>Empty Wall</p>
          </div>
        )}
      </div>

      {/* Viewer Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 md:p-12">
           <div className="absolute inset-0 bg-[#0a0a0c]/98 backdrop-blur-xl animate-fade-in" onClick={() => setSelectedItem(null)}></div>
           <div className={`relative max-w-6xl w-full rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-2xl animate-scale-in flex flex-col lg:flex-row max-h-[90vh] border border-white/5 ${isDarkMode ? 'bg-[#111827]' : 'bg-white'}`}>
              <div className="flex-1 bg-black flex items-center justify-center relative min-h-[300px] md:min-h-[400px]">
                 {selectedItem.type === 'IMAGE' ? (
                   <img src={selectedItem.url} className="max-w-full max-h-[85vh] object-contain" alt="Viewer" />
                 ) : (
                   <video controls autoPlay className="max-w-full max-h-[85vh]">
                      <source src={selectedItem.url} />
                   </video>
                 )}
                 <button onClick={() => setSelectedItem(null)} className="absolute top-4 left-4 md:top-8 md:left-8 w-12 h-12 md:w-16 md:h-16 bg-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all">
                   <i className="fa-solid fa-arrow-left"></i>
                 </button>
              </div>
              <div className="w-full lg:w-[400px] p-8 md:p-12 flex flex-col shrink-0">
                 <div className="mb-6">
                    <div className="flex gap-2 mb-4">
                       <span className={`px-3 py-1 rounded-lg text-[9px] font-black text-white uppercase tracking-widest ${selectedItem.type === 'IMAGE' ? 'bg-emerald-500' : 'bg-amber-400 text-amber-950'}`}>
                          {selectedItem.type}
                       </span>
                    </div>
                    <h2 className={`text-2xl md:text-4xl font-black tracking-tighter leading-none mb-3 uppercase ${isDarkMode ? 'text-white' : 'text-[#0f172a]'}`}>{selectedItem.title}</h2>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{selectedItem.date} • Class {selectedItem.grade}</p>
                 </div>
                 <div className={`p-6 rounded-[1.5rem] md:rounded-[2rem] flex-1 mb-6 overflow-y-auto italic font-medium leading-relaxed ${
                   isDarkMode ? 'bg-white/5 text-slate-300' : 'bg-slate-50 text-slate-600'
                 }`}>
                    "{selectedItem.description}"
                 </div>
                 <div className="mt-auto flex justify-between items-center">
                    <button onClick={() => setSelectedItem(null)} className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl ${isDarkMode ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-slate-500'}`}>Close Gallery</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && isAdmin && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-[#0a0a0c]/95 backdrop-blur-lg animate-fade-in" onClick={() => setItemToDelete(null)}></div>
           <div className={`rounded-[3rem] md:rounded-[4rem] p-10 md:p-16 max-w-md w-full relative z-10 shadow-2xl animate-scale-in text-center border-t-[15px] border-rose-500 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
              <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-8 shadow-inner">
                 <i className="fa-solid fa-trash-can"></i>
              </div>
              <h2 className={`text-2xl md:text-3xl font-black mb-2 uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-[#0f172a]'}`}>Erase Asset?</h2>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-10">This will be permanently removed from Supabase.</p>
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setItemToDelete(null)} className={`py-4 md:py-6 rounded-2xl font-black text-[10px] uppercase transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>Abort</button>
                 <button onClick={confirmDelete} className="py-4 md:py-6 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-2xl transition-all">Delete</button>
              </div>
           </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #10b981; border-radius: 20px; }
        @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes scaleIn { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-in { animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>
    </div>
  );
};

export default GalleryManager;
