
import React, { useState } from 'react';
import { User, UserRole, Homework } from '../types';

interface HomeworkProps {
  user: User;
  homeworks: Homework[];
  setHomeworks: (h: Homework[]) => void;
}

const HomeworkManager: React.FC<HomeworkProps> = ({ user, homeworks, setHomeworks }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newHw, setNewHw] = useState({ subject: '', title: '', description: '', dueDate: '', grade: '' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const homework: Homework = {
      id: Math.random().toString(36).substr(2, 9),
      ...newHw
    };
    setHomeworks([...homeworks, homework]);
    setIsAdding(false);
    setNewHw({ subject: '', title: '', description: '', dueDate: '', grade: '' });
  };

  const handleDelete = (id: string, title: string) => {
    if (user.role !== UserRole.ADMIN) return;
    const confirmed = window.confirm(`⚠️ DANGER: You are about to delete the assignment "${title}". This will remove the quest for ALL students in the class. Do you wish to proceed?`);
    if (confirmed) {
      setHomeworks(homeworks.filter(item => item.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-black text-indigo-900 tracking-tight flex items-center gap-3">
              <i className="fa-solid fa-scroll text-purple-500"></i>
              Academy Quests
           </h1>
           <p className="text-gray-500 font-medium italic mt-1">Challenge your students with daily academic tasks. 📚</p>
        </div>
        {user.role === UserRole.ADMIN && (
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className={`px-8 py-4 rounded-[1.5rem] font-black shadow-lg transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95 ${isAdding ? 'bg-rose-500 text-white' : 'bg-purple-600 text-white'}`}
          >
            <i className={`fa-solid ${isAdding ? 'fa-times' : 'fa-plus'}`}></i>
            {isAdding ? 'Cancel Quest' : 'Assign New Quest'}
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white p-10 rounded-[3.5rem] shadow-2xl border-4 border-purple-50 space-y-8 animate-slide-up relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest ml-1">Subject</label>
              <input 
                required
                className="w-full px-6 py-4 rounded-2xl bg-purple-50/50 border-2 border-transparent focus:bg-white focus:border-purple-400 outline-none font-black transition-all" 
                value={newHw.subject} 
                onChange={e => setNewHw({...newHw, subject: e.target.value})} 
                placeholder="Maths, Science, etc."
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest ml-1">Class / Standard</label>
              <select 
                required
                className="w-full px-6 py-4 rounded-2xl bg-purple-50/50 border-2 border-transparent focus:bg-white focus:border-purple-400 outline-none font-black transition-all appearance-none"
                value={newHw.grade}
                onChange={e => setNewHw({...newHw, grade: e.target.value})}
              >
                <option value="">Select Class</option>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n.toString()}>Class {n}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest ml-1">Final Submission Date</label>
              <input 
                required
                type="date"
                className="w-full px-6 py-4 rounded-2xl bg-purple-50/50 border-2 border-transparent focus:bg-white focus:border-purple-400 outline-none font-black transition-all" 
                value={newHw.dueDate} 
                onChange={e => setNewHw({...newHw, dueDate: e.target.value})} 
              />
            </div>
          </div>
          <div className="space-y-2 relative z-10">
            <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest ml-1">Quest Title / Topic</label>
            <input 
              required
              className="w-full px-6 py-4 rounded-2xl bg-purple-50/50 border-2 border-transparent focus:bg-white focus:border-purple-400 outline-none font-black transition-all" 
              value={newHw.title} 
              onChange={e => setNewHw({...newHw, title: e.target.value})} 
              placeholder="e.g. Chapter 5: Linear Equations"
            />
          </div>
          <div className="space-y-2 relative z-10">
            <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest ml-1">Task Instructions</label>
            <textarea 
              required
              rows={3}
              className="w-full px-8 py-6 rounded-[2rem] bg-purple-50/50 border-2 border-transparent focus:bg-white focus:border-purple-400 outline-none font-medium text-gray-700 shadow-inner" 
              value={newHw.description} 
              onChange={e => setNewHw({...newHw, description: e.target.value})}
              placeholder="Detailed explanation of the quest..."
            />
          </div>
          <div className="flex justify-end relative z-10">
             <button type="submit" className="px-12 py-5 bg-purple-900 text-white rounded-[2rem] font-black shadow-2xl hover:bg-black transition-all transform hover:scale-105 active:scale-95">
               <i className="fa-solid fa-wand-sparkles mr-2"></i> Deploy Quest
             </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {homeworks.length > 0 ? homeworks.slice().reverse().map(h => (
          <div key={h.id} className="bg-white p-8 rounded-[3.5rem] shadow-xl border border-gray-100 flex flex-col lg:flex-row gap-8 lg:items-center hover:shadow-2xl transition-all relative overflow-hidden group">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-4 py-1.5 bg-purple-50 text-purple-700 text-[10px] font-black rounded-xl uppercase tracking-widest border border-purple-100">{h.subject}</span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Class {h.grade} Registry</span>
              </div>
              <h3 className="text-xl font-black text-indigo-950 tracking-tight mb-2">{h.title}</h3>
              <p className="text-gray-500 font-medium text-sm leading-relaxed line-clamp-2">{h.description}</p>
            </div>
            
            <div className="flex items-center gap-10 lg:border-l lg:pl-10 lg:border-gray-100">
               <div className="text-center min-w-[100px]">
                 <p className="text-[9px] uppercase font-black text-gray-400 tracking-widest mb-1">Quest Deadline</p>
                 <p className="font-black text-rose-500 text-lg">{new Date(h.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
               </div>

               {user.role === UserRole.ADMIN ? (
                 <button 
                  onClick={() => handleDelete(h.id, h.title)}
                  className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
                  title="Remove Quest Permanently"
                 >
                   <i className="fa-solid fa-trash-can text-lg"></i>
                 </button>
               ) : (
                  <button className="px-8 py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100">
                    Submit Quest
                  </button>
               )}
            </div>
            
            <div className="absolute -bottom-6 -left-6 text-purple-50 opacity-10 text-8xl group-hover:rotate-12 transition-transform duration-700">
               <i className="fa-solid fa-book-sparkles"></i>
            </div>
          </div>
        )) : (
          <div className="py-40 text-center bg-white/50 rounded-[5rem] border-4 border-dashed border-gray-100">
             <i className="fa-solid fa-scroll text-gray-200 text-7xl mb-6"></i>
             <p className="text-indigo-900 font-black text-2xl tracking-tighter">No Active Quests</p>
             <p className="text-indigo-400 font-bold mt-2 italic">Enjoy the academy peace! All assignments are cleared.</p>
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

export default HomeworkManager;
