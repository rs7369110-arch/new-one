
import React, { useState } from 'react';
import { User, UserRole, Notice } from '../types';
import { generateSmartNotice } from '../services/gemini';

interface NoticeBoardProps {
  user: User;
  notices: Notice[];
  setNotices: (notices: Notice[]) => void;
}

const NoticeBoard: React.FC<NoticeBoardProps> = ({ user, notices, setNotices }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', content: '', category: 'GENERAL' as const });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const notice: Notice = {
      id: Math.random().toString(36).substr(2, 9),
      title: newNotice.title,
      content: newNotice.content,
      category: newNotice.category,
      date: new Date().toLocaleDateString()
    };
    setNotices([...notices, notice]);
    setIsAdding(false);
    setNewNotice({ title: '', content: '', category: 'GENERAL' });
  };

  const handleDelete = (id: string, title: string) => {
    if (user.role !== UserRole.ADMIN) return;
    const confirmed = window.confirm(`🚨 WARNING: Are you sure you want to PERMANENTLY delete the notice: "${title}"? This action is irreversible and the record will be erased from the Academy Registry.`);
    if (confirmed) {
      setNotices(notices.filter(item => item.id !== id));
    }
  };

  const useAI = async () => {
    if (!newNotice.title) return alert("Please enter a title for AI to work with.");
    setIsLoading(true);
    try {
      const draft = await generateSmartNotice(newNotice.title);
      setNewNotice({ ...newNotice, title: draft.title, content: draft.content });
    } catch (e) {
      console.error(e);
      alert("Failed to connect to AI. Please check API Key.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-black text-indigo-900 tracking-tight flex items-center gap-3">
              <i className="fa-solid fa-bullhorn text-amber-500"></i>
              Academy News Flash
           </h1>
           <p className="text-gray-500 font-medium italic mt-1">Official announcements and urgent updates. 📢</p>
        </div>
        {user.role === UserRole.ADMIN && (
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className={`px-8 py-4 rounded-[1.5rem] font-black shadow-lg transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95 ${isAdding ? 'bg-rose-500 text-white' : 'bg-indigo-600 text-white'}`}
          >
            <i className={`fa-solid ${isAdding ? 'fa-times' : 'fa-plus'}`}></i>
            {isAdding ? 'Cancel Post' : 'Post New Notice'}
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white p-10 rounded-[3.5rem] shadow-2xl border-4 border-indigo-50 space-y-8 animate-slide-up relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Notice Title / Subject</label>
              <div className="relative">
                <input 
                  required
                  className="w-full px-6 py-4 pr-32 rounded-2xl bg-indigo-50/50 border-2 border-transparent focus:bg-white focus:border-indigo-400 outline-none font-black transition-all" 
                  value={newNotice.title} 
                  onChange={e => setNewNotice({...newNotice, title: e.target.value})} 
                  placeholder="e.g. Annual Sports Meet 2024"
                />
                <button 
                    type="button"
                    disabled={isLoading}
                    onClick={useAI}
                    className="absolute right-2 top-2 px-4 py-2 bg-indigo-600 text-white text-[10px] font-black rounded-xl hover:bg-black flex items-center gap-2 transition-all shadow-md"
                >
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                    {isLoading ? '...' : 'AI Draft'}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Category</label>
              <select 
                className="w-full px-6 py-4 rounded-2xl bg-indigo-50/50 border-2 border-transparent focus:bg-white focus:border-indigo-400 outline-none font-black transition-all appearance-none"
                value={newNotice.category}
                onChange={e => setNewNotice({...newNotice, category: e.target.value as any})}
              >
                <option value="GENERAL">General Notice</option>
                <option value="URGENT">Urgent Announcement</option>
                <option value="EVENT">Academy Event</option>
              </select>
            </div>
          </div>
          <div className="space-y-2 relative z-10">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Notice Details</label>
            <textarea 
              required
              rows={4}
              className="w-full px-8 py-6 rounded-[2rem] bg-indigo-50/50 border-2 border-transparent focus:bg-white focus:border-indigo-400 outline-none font-medium text-gray-700 shadow-inner" 
              value={newNotice.content} 
              onChange={e => setNewNotice({...newNotice, content: e.target.value})}
              placeholder="Provide complete details about the announcement..."
            />
          </div>
          <div className="flex justify-end relative z-10">
             <button type="submit" className="px-12 py-5 bg-indigo-900 text-white rounded-[2rem] font-black shadow-2xl hover:bg-black transition-all transform hover:scale-105 active:scale-95">
               <i className="fa-solid fa-paper-plane mr-2"></i> Publish to Board
             </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {notices.length > 0 ? notices.slice().reverse().map(n => (
          <div key={n.id} className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100 hover:shadow-2xl transition-all relative overflow-hidden group border-t-8 flex flex-col min-h-[300px]" style={{ borderTopColor: n.category === 'URGENT' ? '#f43f5e' : n.category === 'EVENT' ? '#f59e0b' : '#4f46e5' }}>
            <div className={`absolute top-0 right-0 px-4 py-1.5 text-[9px] font-black tracking-widest text-white rounded-bl-2xl ${
              n.category === 'URGENT' ? 'bg-rose-500' : n.category === 'EVENT' ? 'bg-amber-500' : 'bg-indigo-500'
            }`}>
              {n.category}
            </div>
            <div className="text-[10px] font-black text-indigo-300 mb-3 tracking-widest">{n.date}</div>
            <h3 className="text-xl font-black text-indigo-950 mb-4 group-hover:text-indigo-600 transition-colors leading-tight">{n.title}</h3>
            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6 flex-1">{n.content}</p>
            
            {user.role === UserRole.ADMIN && (
              <div className="mt-auto pt-6 border-t border-gray-50 flex justify-between items-center">
                 <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-1">
                    <i className="fa-solid fa-shield-check"></i> Registry Record
                 </span>
                 <button 
                    onClick={() => handleDelete(n.id, n.title)}
                    className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                    title="Delete Entry"
                  >
                    <i className="fa-solid fa-trash-can text-sm"></i>
                  </button>
              </div>
            )}
          </div>
        )) : (
          <div className="col-span-full py-40 text-center bg-white/50 rounded-[4rem] border-4 border-dashed border-gray-200">
             <div className="w-28 h-28 bg-indigo-50 text-indigo-100 rounded-full flex items-center justify-center text-6xl mx-auto mb-8">
               <i className="fa-solid fa-bullhorn animate-pulse"></i>
             </div>
             <p className="text-indigo-900 font-black text-2xl tracking-tighter">No Current Announcements</p>
             <p className="text-indigo-400 font-bold mt-2 italic max-w-sm mx-auto">The notice board is currently clean. All students and staff are informed.</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slideUp 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default NoticeBoard;
