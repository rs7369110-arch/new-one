
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
    <div className={`space-y-8 animate-fade-in pb-20 ${isDarkMode ? 'text-slate-100' : 'text-[#1e293b]'}`}>
      <header className={`p-8 md:p-12 rounded-[3.5rem] border flex flex-col md:flex-row md:items-center justify-between gap-8 transition-all duration-700 ${
        isDarkMode ? 'bg-[#0f172a] border-emerald-500/10' : 'bg-[#0f172a] text-white border-emerald-950 shadow-2xl shadow-indigo-900/20'
      }`}>
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-20 h-20 bg-emerald-500 text-white rounded-[2.5rem] flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(16,185,129,0.3)]">
             <i className="fa-solid fa-photo-film"></i>
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">Memory Wall</h1>
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mt-3 italic">
              {isSelectMode ? `SELECTION MODE: ${selectedIds.length} Assets Selected` : `Class-Wise Academy Archives • ${gallery.length} Assets`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 relative z-10">
           <div className={`flex p-1.5 rounded-[1.5rem] bg-white/5 border border-white/5 backdrop-blur-md`}>
              {['ALL', 'IMAGE', 'VIDEO'].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f as any)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeFilter === f 
                    ? 'bg-emerald-500 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-emerald-400'
                  }`}
                >
                  {f === 'ALL' ? 'Library' : f === 'IMAGE' ? 'Photos' : 'Clips'}
                </button>
              ))}
           </div>

           <select 
             className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest outline-none focus:border-emerald-500 transition-all"
             value={gradeFilter}
             onChange={e => setGradeFilter(e.target.value)}
           >
              <option value="All">All Classes</option>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n.toString()}>Class {n}</option>)}
           </select>

           {isAdmin && (
             <div className="flex gap-2">
                {isSelectMode ? (
                  <>
                    <button 
                      onClick={handleBulkDelete}
                      disabled={selectedIds.length === 0 || isProcessing}
                      className="px-6 py-4 bg-rose-500 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-rose-400 transition-all disabled:opacity-30"
                    >
                       {isProcessing ? 'Erasing...' : `Erase (${selectedIds.length})`}
                    </button>
                    <button 
                      onClick={() => { setIsSelectMode(false); setSelectedIds([]); }}
                      className="px-6 py-4 bg-white/10 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] border border-white/10"
                    >
                       Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setIsSelectMode(true)}
                      className="w-14 h-14 bg-white/10 text-rose-400 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/5"
                      title="Bulk Delete Mode"
                    >
                       <i className="fa-solid fa-trash-can"></i>
                    </button>
                    <button 
                      onClick={() => setIsAdding(true)}
                      className="px-8 py-4 bg-amber-400 text-amber-950 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-amber-300 transition-all transform hover:scale-105"
                    >
                       <i className="fa-solid fa-cloud-bolt mr-2"></i>
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
        <div className={`p-10 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-4 animate-slide-up relative overflow-hidden ${
          isDarkMode ? 'bg-slate-900 border-emerald-500/20' : 'bg-white border-emerald-50'
        }`}>
           <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl">
                    <i className="fa-solid fa-layer-group"></i>
                 </div>
                 <h2 className={`text-2xl font-black uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-[#0f172a]'}`}>
                    Asset Upload Engine
                 </h2>
              </div>
              <button onClick={() => { setPendingFiles([]); setIsAdding(false); }} className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
                 <i className="fa-solid fa-xmark text-xl"></i>
              </button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                 <div className="space-y-3">
                    <div className="flex justify-between items-center px-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Target Class Registry (Select Multiple)</label>
                      <button onClick={selectAllGrades} className="text-[9px] font-black text-emerald-500 uppercase tracking-widest hover:underline">
                        {uploadGrades.length === 12 ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                       {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                         <button 
                           key={n}
                           onClick={() => toggleUploadGrade(n.toString())}
                           className={`py-3 rounded-xl font-black text-[10px] border transition-all ${
                             uploadGrades.includes(n.toString()) 
                             ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' 
                             : 'bg-transparent border-slate-200 dark:border-white/5 text-slate-400 hover:border-emerald-500'
                           }`}
                         >
                           {n}th
                         </button>
                       ))}
                    </div>
                 </div>

                 <div 
                   onClick={() => fileInputRef.current?.click()}
                   className={`border-4 border-dashed rounded-[3.5rem] p-20 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] group ${
                     isDarkMode ? 'bg-slate-800/40 border-slate-700 hover:border-emerald-500/50' : 'bg-emerald-50/30 border-emerald-100 hover:border-emerald-300'
                   }`}
                 >
                    <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center text-5xl mb-8 shadow-2xl group-hover:rotate-12 transition-transform">
                       <i className="fa-solid fa-plus"></i>
                    </div>
                    <p className={`font-black text-2xl tracking-tighter mb-2 ${isDarkMode ? 'text-white' : 'text-[#0f172a]'}`}>Select Assets</p>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Photos & Videos • Multi-Select Enabled</p>
                    <input type="file" multiple accept="image/*,video/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                 </div>
              </div>

              <div className="flex flex-col h-full">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 px-4">Staging Pipeline ({pendingFiles.length})</h3>
                 <div className={`flex-1 rounded-[3rem] p-8 max-h-[450px] overflow-y-auto custom-scrollbar border-2 ${
                   isDarkMode ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-emerald-100'
                 }`}>
                    {pendingFiles.length > 0 ? (
                      <div className="grid grid-cols-3 gap-6">
                         {pendingFiles.map(f => (
                           <div key={f.id} className="relative aspect-square rounded-3xl overflow-hidden group border-4 border-transparent hover:border-emerald-500 transition-all shadow-2xl">
                              {f.type === 'IMAGE' ? (
                                <img src={f.url} className="w-full h-full object-cover" alt="Pending" />
                              ) : (
                                <div className="w-full h-full bg-[#0f172a] flex items-center justify-center">
                                   <i className="fa-solid fa-video text-white/20 text-2xl"></i>
                                </div>
                              )}
                              <button onClick={() => removePending(f.id)} className="absolute top-2 right-2 w-8 h-8 bg-rose-500 text-white rounded-xl flex items-center justify-center text-xs shadow-lg">
                                 <i className="fa-solid fa-xmark"></i>
                              </button>
                           </div>
                         ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center opacity-10">
                         <i className="fa-solid fa-images text-9xl mb-6"></i>
                         <p className="text-xl font-black uppercase tracking-[0.4em]">Queue Empty</p>
                      </div>
                    )}
                 </div>
                 
                 <div className="mt-8 p-6 bg-emerald-500/5 rounded-[2.5rem] border border-emerald-500/10 flex items-center justify-between">
                    <div className="max-w-[50%]">
                       <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Destinations</p>
                       <p className={`font-black text-xs truncate ${isDarkMode ? 'text-white' : 'text-[#0f172a]'}`}>
                          {uploadGrades.length > 0 ? `Classes: ${uploadGrades.sort((a,b) => parseInt(a) - parseInt(b)).join(', ')}` : 'None'}
                       </p>
                    </div>
                    <button 
                      disabled={pendingFiles.length === 0 || uploadGrades.length === 0}
                      onClick={handleBulkPublish}
                      className="px-12 py-5 bg-emerald-500 text-white rounded-[1.8rem] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-emerald-400 transition-all transform active:scale-95 disabled:opacity-20 text-xs"
                    >
                      Publish
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Main Grid View */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {filteredItems.length > 0 ? filteredItems.slice().reverse().map((item) => (
          <div key={item.id} className="group relative">
            <div 
              className={`rounded-[2.5rem] shadow-xl transition-all duration-500 cursor-pointer overflow-hidden border transform hover:-translate-y-2 hover:scale-[1.03] flex flex-col relative ${
                isDarkMode ? 'bg-[#111827] border-white/5' : 'bg-white border-emerald-50'
              } ${isSelectMode && selectedIds.includes(item.id) ? 'ring-4 ring-emerald-500' : ''}`}
              onClick={() => isSelectMode ? toggleItemSelection(item.id) : setSelectedItem(item)}
            >
               <div className="relative aspect-square bg-slate-900 overflow-hidden">
                  {item.type === 'IMAGE' ? (
                    <img src={item.url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125" alt={item.title} />
                  ) : (
                    <div className="w-full h-full relative">
                       <video className="w-full h-full object-cover">
                          <source src={item.url} />
                       </video>
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-14 h-14 bg-white/90 text-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
                             <i className="fa-solid fa-play ml-1"></i>
                          </div>
                       </div>
                    </div>
                  )}
                  
                  {isSelectMode && (
                    <div className={`absolute inset-0 flex items-center justify-center transition-all ${selectedIds.includes(item.id) ? 'bg-emerald-500/20' : 'bg-black/40 opacity-0 group-hover:opacity-100'}`}>
                       <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl border-4 ${selectedIds.includes(item.id) ? 'bg-emerald-500 border-white text-white' : 'bg-white border-emerald-500 text-emerald-500'}`}>
                          <i className={`fa-solid ${selectedIds.includes(item.id) ? 'fa-check' : 'fa-plus'}`}></i>
                       </div>
                    </div>
                  )}

                  {isAdmin && !isSelectMode && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setItemToDelete(item); }}
                      className="absolute top-4 right-4 w-11 h-11 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-600 hover:rotate-12"
                    >
                       <i className="fa-solid fa-trash-can"></i>
                    </button>
                  )}

                  {!isSelectMode && (
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                       <span className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg bg-indigo-600 text-white border border-white/10`}>
                          Class {item.grade}
                       </span>
                    </div>
                  )}
               </div>

               <div className="p-6">
                  <h3 className={`text-[11px] font-black truncate uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-[#0f172a]'}`}>{item.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                     <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.date}</p>
                  </div>
               </div>
            </div>
          </div>
        )) : (
          <div className={`col-span-full py-40 text-center rounded-[5rem] border-4 border-dashed transition-all ${
            isDarkMode ? 'bg-[#111827]/30 border-white/5' : 'bg-slate-50 border-emerald-100'
          }`}>
             <i className="fa-solid fa-wind text-6xl mb-8 animate-pulse text-indigo-500"></i>
             <p className={`text-4xl font-black uppercase ${isDarkMode ? 'text-white' : 'text-[#0f172a]'}`}>Archives Empty</p>
          </div>
        )}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 md:p-12 lg:p-20">
           <div className="absolute inset-0 bg-[#0a0a0c]/98 backdrop-blur-3xl animate-fade-in" onClick={() => setSelectedItem(null)}></div>
           <div className={`relative max-w-7xl w-full rounded-[4.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] animate-scale-in flex flex-col lg:flex-row max-h-[90vh] border border-white/5 ${isDarkMode ? 'bg-[#111827]' : 'bg-white'}`}>
              <div className="flex-1 bg-black flex items-center justify-center relative min-h-[400px]">
                 {selectedItem.type === 'IMAGE' ? (
                   <img src={selectedItem.url} className="max-w-full max-h-[85vh] object-contain" alt="Viewer" />
                 ) : (
                   <video controls autoPlay className="max-w-full max-h-[85vh]">
                      <source src={selectedItem.url} />
                   </video>
                 )}
                 <button onClick={() => setSelectedItem(null)} className="absolute top-10 left-10 w-16 h-16 bg-white/10 text-white rounded-[2rem] flex items-center justify-center hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all">
                   <i className="fa-solid fa-arrow-left text-2xl"></i>
                 </button>
              </div>
              <div className="w-full lg:w-[450px] p-16 flex flex-col shrink-0">
                 <div className="mb-10">
                    <div className="flex gap-3 mb-6">
                       <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black text-white uppercase tracking-widest ${selectedItem.type === 'IMAGE' ? 'bg-emerald-500' : 'bg-amber-400 text-amber-950'}`}>
                          {selectedItem.type}
                       </span>
                       <span className="px-4 py-1.5 rounded-xl text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10">
                          CLASS {selectedItem.grade}
                       </span>
                    </div>
                    <h2 className={`text-5xl font-black tracking-tighter leading-none mb-4 uppercase ${isDarkMode ? 'text-white' : 'text-[#0f172a]'}`}>{selectedItem.title}</h2>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">{selectedItem.date}</p>
                 </div>
                 <div className={`p-8 rounded-[2.5rem] flex-1 mb-10 overflow-y-auto italic font-medium leading-relaxed text-lg ${
                   isDarkMode ? 'bg-white/5 text-slate-300' : 'bg-slate-50 text-slate-600'
                 }`}>
                    "{selectedItem.description}"
                 </div>
                 <div className="mt-auto pt-10 border-t border-white/5 flex justify-between items-center">
                    <Logo size="sm" className="opacity-30" />
                    <button onClick={() => setSelectedItem(null)} className={`px-12 py-5 rounded-[1.8rem] font-black text-[11px] uppercase tracking-[0.4em] shadow-xl ${isDarkMode ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-slate-500'}`}>Close</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {itemToDelete && isAdmin && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-[#0a0a0c]/95 backdrop-blur-xl animate-fade-in" onClick={() => setItemToDelete(null)}></div>
           <div className={`rounded-[4rem] p-16 max-w-md w-full relative z-10 shadow-2xl animate-scale-in text-center border-t-[20px] border-rose-500 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
              <div className="w-24 h-24 bg-rose-500/10 text-rose-500 rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto mb-10 shadow-inner">
                 <i className="fa-solid fa-trash-can"></i>
              </div>
              <h2 className={`text-4xl font-black mb-3 uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-[#0f172a]'}`}>Erase Asset?</h2>
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-12">Permanently delete this item from archives.</p>
              <div className="grid grid-cols-2 gap-5">
                 <button onClick={() => setItemToDelete(null)} className={`py-6 rounded-[2rem] font-black text-[11px] uppercase transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>Abort</button>
                 <button onClick={confirmDelete} className="py-6 bg-rose-50 text-white rounded-[2rem] font-black text-[11px] uppercase shadow-2xl transition-all">Delete</button>
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
