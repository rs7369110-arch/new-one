
import React, { useState, useRef } from 'react';
import { User, UserRole, GalleryItem } from '../types';
import Logo from './Logo';

interface GalleryManagerProps {
  user: User;
  gallery: GalleryItem[];
  onUpdateGallery: (items: GalleryItem[]) => void;
}

const GalleryManager: React.FC<GalleryManagerProps> = ({ user, gallery, onUpdateGallery }) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'IMAGE' | 'VIDEO'>('ALL');
  const [isAdding, setIsAdding] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = user.role === UserRole.ADMIN;

  const [formData, setFormData] = useState<Partial<GalleryItem>>({
    type: 'IMAGE',
    title: '',
    description: '',
    url: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Memory is precious, but file is too large! Max 2MB for photos.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const extractYouTubeID = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!formData.url) return alert("Please provide an image or video link!");

    const newItem: GalleryItem = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString(),
      ...(formData as GalleryItem)
    };
    onUpdateGallery([...gallery, newItem]);
    resetForm();
  };

  const resetForm = () => {
    setIsAdding(false);
    setFormData({ type: 'IMAGE', title: '', description: '', url: '' });
  };

  const confirmDelete = () => {
    if (!isAdmin || !itemToDelete) return;
    onUpdateGallery(gallery.filter(item => item.id !== itemToDelete));
    setItemToDelete(null);
  };

  const filteredItems = activeFilter === 'ALL' 
    ? gallery 
    : gallery.filter(item => item.type === activeFilter);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <h1 className="text-3xl font-black text-indigo-900 tracking-tight">Memory Wall</h1>
             <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isAdmin ? 'bg-indigo-100 text-indigo-600' : 'bg-pink-100 text-pink-600'}`}>
                {isAdmin ? 'Admin Mode' : 'Explorer Mode'}
             </span>
          </div>
          <p className="text-pink-500 font-medium italic">Preserving the magical moments of Jannat Academy. ✨</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-pink-100">
              {['ALL', 'IMAGE', 'VIDEO'].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f as any)}
                  className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${
                    activeFilter === f 
                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-100' 
                    : 'text-gray-400 hover:bg-pink-50'
                  }`}
                >
                  {f === 'ALL' ? 'All' : f === 'IMAGE' ? 'Snapshots' : 'Cinema'}
                </button>
              ))}
           </div>
           {isAdmin && (
             <button 
               onClick={() => setIsAdding(true)}
               className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2 transform hover:scale-105"
             >
                <i className="fa-solid fa-plus-circle"></i>
                Add Media
             </button>
           )}
        </div>
      </header>

      {isAdding && isAdmin && (
        <form onSubmit={handleSave} className="bg-white p-10 rounded-[3.5rem] shadow-2xl border-4 border-indigo-50 grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up relative">
           <button type="button" onClick={resetForm} className="absolute top-6 right-6 text-gray-400 hover:text-rose-500 transition-colors">
              <i className="fa-solid fa-circle-xmark text-2xl"></i>
           </button>
           
           <div className="lg:col-span-2">
              <h2 className="text-2xl font-black text-indigo-800 flex items-center gap-3">
                 <i className="fa-solid fa-camera-retro"></i>
                 Contribute to Memory Wall
              </h2>
           </div>

           <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Media Category</label>
                <div className="flex gap-4">
                   <button 
                    type="button" 
                    onClick={() => setFormData({...formData, type: 'IMAGE', url: ''})}
                    className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${formData.type === 'IMAGE' ? 'bg-pink-500 text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}
                   >
                     <i className="fa-solid fa-image"></i> Photo
                   </button>
                   <button 
                    type="button" 
                    onClick={() => setFormData({...formData, type: 'VIDEO', url: ''})}
                    className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${formData.type === 'VIDEO' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}
                   >
                     <i className="fa-solid fa-video"></i> Video
                   </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Moment Title</label>
                <input required className="w-full px-5 py-4 rounded-2xl bg-indigo-50/50 border-2 border-transparent focus:bg-white focus:border-indigo-300 outline-none font-bold" placeholder="e.g. Annual Day Celebration" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Short Description</label>
                <textarea className="w-full px-5 py-4 rounded-2xl bg-indigo-50/50 border-2 border-transparent focus:bg-white focus:border-indigo-300 outline-none font-medium h-24" placeholder="What happened in this moment?" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
           </div>

           <div className="flex flex-col">
              {formData.type === 'IMAGE' ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 border-4 border-dashed border-indigo-100 bg-indigo-50/30 rounded-[3rem] flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 transition-all group p-10"
                >
                   {formData.url ? (
                     <div className="relative w-full h-full min-h-[200px] flex items-center justify-center">
                        <img src={formData.url} className="max-h-[250px] rounded-2xl shadow-xl border-4 border-white" alt="Preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                           <span className="text-white font-black">Change Image</span>
                        </div>
                     </div>
                   ) : (
                     <>
                        <div className="w-20 h-20 bg-white shadow-lg rounded-3xl flex items-center justify-center text-indigo-500 text-3xl mb-4 group-hover:scale-110 transition-transform">
                          <i className="fa-solid fa-cloud-arrow-up"></i>
                        </div>
                        <p className="font-black text-indigo-900 text-xl">Snap a Memory</p>
                        <p className="text-xs text-indigo-400 mt-2 font-bold uppercase tracking-widest">Click to browse • Max 2MB</p>
                     </>
                   )}
                   <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                </div>
              ) : (
                <div className="flex-1 bg-indigo-900 rounded-[3rem] p-10 flex flex-col items-center justify-center text-white text-center">
                   <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-rose-500 text-4xl mb-6">
                      <i className="fa-brands fa-youtube"></i>
                   </div>
                   <h4 className="text-xl font-black mb-2 uppercase tracking-tighter">YouTube Link</h4>
                   <p className="text-indigo-200 text-sm mb-8 px-10">Paste the URL of the video recorded during the school event.</p>
                   <input 
                    required 
                    type="url" 
                    className="w-full px-6 py-4 rounded-2xl bg-white/10 border-2 border-white/20 focus:bg-white/20 focus:border-white/40 outline-none font-bold text-white placeholder-white/30" 
                    placeholder="https://www.youtube.com/watch?v=..." 
                    value={formData.url} 
                    onChange={e => setFormData({...formData, url: e.target.value})} 
                   />
                </div>
              )}
              <div className="flex gap-4 mt-8">
                 <button type="button" onClick={resetForm} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black">Discard</button>
                 <button type="submit" className="flex-2 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg px-12">Publish Memory</button>
              </div>
           </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredItems.length > 0 ? filteredItems.map((item) => (
          <div key={item.id} className="group relative">
            <div className={`p-4 bg-white rounded-[2rem] shadow-xl border border-indigo-50 transition-all duration-500 hover:rotate-2 hover:-translate-y-3 cursor-pointer overflow-hidden flex flex-col h-full ${
              item.type === 'IMAGE' ? 'rotate-[-2deg]' : 'rotate-[1deg]'
            }`} onClick={() => setSelectedItem(item)}>
               
               <div className="relative aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-gray-100 flex items-center justify-center shadow-inner">
                  {item.type === 'IMAGE' ? (
                    <img src={item.url} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" alt={item.title} />
                  ) : (
                    <div className="w-full h-full relative">
                       <img src={`https://img.youtube.com/vi/${extractYouTubeID(item.url)}/maxresdefault.jpg`} className="w-full h-full object-cover blur-[2px] opacity-80" alt="Video Preview" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-20 h-20 bg-indigo-600/90 text-white rounded-full flex items-center justify-center text-3xl shadow-2xl group-hover:scale-125 transition-transform">
                             <i className="fa-solid fa-play ml-1"></i>
                          </div>
                       </div>
                    </div>
                  )}
                  {isAdmin && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setItemToDelete(item.id); }}
                      className="absolute top-4 right-4 w-10 h-10 bg-white/90 text-rose-500 rounded-xl flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                    >
                       <i className="fa-solid fa-trash-can"></i>
                    </button>
                  )}
               </div>

               <div className="pt-5 pb-2 px-1 flex-1 flex flex-col">
                  <h3 className="text-lg font-black text-indigo-900 leading-tight mb-2 line-clamp-2">{item.title}</h3>
                  <div className="flex items-center justify-between mt-auto">
                     <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest">{item.date}</span>
                     <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${item.type === 'IMAGE' ? 'bg-pink-50 text-pink-500' : 'bg-indigo-50 text-indigo-500'}`}>
                        <i className={item.type === 'IMAGE' ? 'fa-solid fa-camera' : 'fa-solid fa-video'}></i>
                     </span>
                  </div>
               </div>
            </div>
            
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-12 bg-white/40 backdrop-blur-sm rounded-full opacity-20 group-hover:opacity-0 transition-opacity"></div>
          </div>
        )) : (
          <div className="col-span-full py-40 text-center bg-white/50 rounded-[4rem] border-4 border-dashed border-indigo-100">
             <div className="w-28 h-28 bg-indigo-50 text-indigo-200 rounded-full flex items-center justify-center text-6xl mx-auto mb-8 animate-pulse">
                <i className="fa-solid fa-images"></i>
             </div>
             <p className="text-indigo-950 font-black text-2xl tracking-tight">The Memory Wall is Empty</p>
             <p className="text-indigo-400 font-bold mt-2 italic max-w-sm mx-auto">Waiting for school memories to be posted by the Administrator.</p>
          </div>
        )}
      </div>

      {/* Lightbox Preview */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
           <div className="absolute inset-0 bg-indigo-950/95 backdrop-blur-xl animate-fade-in" onClick={() => setSelectedItem(null)}></div>
           <div className="relative max-w-6xl w-full bg-white rounded-[3.5rem] overflow-hidden shadow-2xl animate-slide-up flex flex-col md:flex-row max-h-[90vh]">
              <div className="flex-1 bg-black flex items-center justify-center relative min-h-[300px]">
                 {selectedItem.type === 'IMAGE' ? (
                   <img src={selectedItem.url} className="max-w-full max-h-[70vh] object-contain" alt="Full View" />
                 ) : (
                   <iframe 
                    className="w-full aspect-video" 
                    src={`https://www.youtube.com/embed/${extractYouTubeID(selectedItem.url)}?autoplay=1`} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                   ></iframe>
                 )}
                 <button onClick={() => setSelectedItem(null)} className="absolute top-6 left-6 w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-all">
                   <i className="fa-solid fa-arrow-left"></i>
                 </button>
              </div>
              <div className="w-full md:w-80 p-10 flex flex-col shrink-0">
                 <span className="text-[10px] font-black text-pink-500 uppercase tracking-[0.3em] mb-3">{selectedItem.type} • {selectedItem.date}</span>
                 <h2 className="text-3xl font-black text-indigo-950 mb-4 tracking-tighter leading-none">{selectedItem.title}</h2>
                 <p className="text-gray-500 font-medium leading-relaxed mb-10 overflow-y-auto">{selectedItem.description || "A magical moment captured at Jannat Academy."}</p>
                 <div className="mt-auto flex justify-between items-center pt-8 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                       <Logo size="sm" />
                       <span className="text-[9px] font-black uppercase text-indigo-300 tracking-widest leading-none">Jannat<br/>Academy</span>
                    </div>
                    <button onClick={() => setSelectedItem(null)} className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Close</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Delete Confirmation (Admin Only) */}
      {itemToDelete && isAdmin && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-indigo-950/60 backdrop-blur-md animate-fade-in" onClick={() => setItemToDelete(null)}></div>
           <div className="bg-white rounded-[3rem] p-10 max-w-md w-full relative z-10 shadow-2xl border-t-[10px] border-rose-500 animate-slide-up text-center">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
                 <i className="fa-solid fa-trash-can"></i>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Erase Memory?</h2>
              <p className="text-gray-500 font-medium mb-10 leading-relaxed">
                Only the Academy Admin can perform this action. Once deleted, this moment will be removed for everyone.
              </p>
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setItemToDelete(null)} className="py-4 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition-colors">No, Keep It</button>
                 <button onClick={confirmDelete} className="py-4 bg-rose-500 text-white rounded-2xl font-black shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all transform hover:scale-105">Yes, Erase</button>
              </div>
           </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #fdfcfb;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default GalleryManager;
