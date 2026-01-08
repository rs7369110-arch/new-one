
import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole, SchoolMessage } from '../types';

interface MessageManagerProps {
  user: User;
  messages: SchoolMessage[];
  onUpdateMessages: (msgs: SchoolMessage[]) => void;
}

const MessageManager: React.FC<MessageManagerProps> = ({ user, messages, onUpdateMessages }) => {
  const [text, setText] = useState('');
  const [targetGrade, setTargetGrade] = useState<'All' | string>('All');
  const [attachment, setAttachment] = useState<{ data: string; name: string; type: string } | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File too large! Max 2MB for broadcast messages.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment({
          data: reader.result as string,
          name: file.name,
          type: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !attachment) return;

    if (editingMessageId) {
      const updatedMessages = messages.map(m => 
        m.id === editingMessageId 
          ? { ...m, text: text.trim(), targetGrade, attachment: attachment || m.attachment } 
          : m
      );
      onUpdateMessages(updatedMessages);
      setEditingMessageId(null);
    } else {
      const newMessage: SchoolMessage = {
        id: Math.random().toString(36).substr(2, 9),
        senderName: user.name,
        text: text.trim(),
        date: new Date().toLocaleString(),
        targetGrade,
        attachment: attachment || undefined
      };
      onUpdateMessages([...messages, newMessage]);
    }

    setText('');
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startEditing = (msg: SchoolMessage) => {
    setEditingMessageId(msg.id);
    setText(msg.text);
    setTargetGrade(msg.targetGrade);
    setAttachment(msg.attachment || null);
    // Scroll to the input form
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setText('');
    setTargetGrade('All');
    setAttachment(null);
  };

  const openAttachment = (fileData: string) => {
    const win = window.open();
    if (win) {
      win.document.write(
        `<html><body style="margin:0; background:#111; display:flex; align-items:center; justify-content:center;">
          <iframe src="${fileData}" frameborder="0" style="border:0; width:100vw; height:100vh;" allowfullscreen></iframe>
        </body></html>`
      );
    }
  };

  const confirmDelete = () => {
    if (messageToDelete) {
      onUpdateMessages(messages.filter(m => m.id !== messageToDelete));
      if (editingMessageId === messageToDelete) cancelEditing();
      setMessageToDelete(null);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6 animate-fade-in">
      <header className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-black text-indigo-900 tracking-tight">Broadcast Room</h1>
          <p className="text-indigo-500 font-medium italic">Instant communication across the academy. 🚀</p>
        </div>
        <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
          <i className="fa-solid fa-paper-plane"></i>
        </div>
      </header>

      <div className="flex-1 bg-white rounded-[3rem] shadow-xl border border-indigo-50 flex flex-col overflow-hidden relative">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {messages.length > 0 ? messages.map((m) => {
            const isOwnMessage = m.senderName === user.name;
            const canManage = isOwnMessage || user.role === UserRole.ADMIN;
            
            return (
              <div key={m.id} className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[80%] p-6 rounded-[2rem] shadow-sm relative group transition-all ${
                  isOwnMessage 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                }`}>
                  <div className="flex items-center justify-between mb-2 gap-4">
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                       {m.senderName} • {m.targetGrade === 'All' ? 'School-wide' : `Grade ${m.targetGrade}`}
                     </span>
                     {canManage && (
                       <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         {isOwnMessage && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); startEditing(m); }}
                              className="text-white/60 hover:text-white p-1"
                              title="Edit Message"
                            >
                              <i className="fa-solid fa-pencil text-xs"></i>
                            </button>
                         )}
                         <button 
                           onClick={(e) => { e.stopPropagation(); setMessageToDelete(m.id); }}
                           className={`p-1 transition-colors ${isOwnMessage ? 'text-white/60 hover:text-rose-200' : 'text-rose-400 hover:text-rose-600'}`}
                           title="Delete Message"
                         >
                           <i className="fa-solid fa-trash-can text-xs"></i>
                         </button>
                       </div>
                     )}
                  </div>

                  <p className="font-medium whitespace-pre-wrap">{m.text}</p>

                  {m.attachment && (
                    <div 
                      onClick={() => openAttachment(m.attachment!.data)}
                      className={`mt-4 p-4 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${
                        isOwnMessage ? 'bg-white/10 hover:bg-white/20' : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                         m.attachment.type.includes('pdf') ? 'bg-rose-100 text-rose-500' : 'bg-blue-100 text-blue-500'
                       }`}>
                          <i className={m.attachment.type.includes('pdf') ? 'fa-solid fa-file-pdf' : 'fa-solid fa-image'}></i>
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">{m.attachment.name}</p>
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Click to View</p>
                       </div>
                    </div>
                  )}

                  <span className="block mt-2 text-[9px] font-bold opacity-40 text-right">{m.date}</span>
                </div>
              </div>
            );
          }) : (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
               <i className="fa-solid fa-message text-8xl mb-4"></i>
               <p className="text-2xl font-black">No messages yet</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="p-6 bg-gray-50 border-t border-indigo-50 shrink-0">
          {editingMessageId && (
            <div className="mb-4 flex items-center justify-between bg-amber-50 px-4 py-2 rounded-xl border border-amber-200 animate-slide-up">
              <span className="text-xs font-black text-amber-700 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-pencil"></i> Editing Mode
              </span>
              <button 
                type="button" 
                onClick={cancelEditing} 
                className="text-amber-700 hover:text-rose-500 font-bold text-xs"
              >
                Cancel
              </button>
            </div>
          )}

          {attachment && (
            <div className="mb-4 p-3 bg-white rounded-2xl flex items-center justify-between border-2 border-indigo-100 animate-slide-up">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                    <i className={attachment.type.includes('pdf') ? 'fa-solid fa-file-pdf' : 'fa-solid fa-image'}></i>
                  </div>
                  <span className="text-xs font-bold text-gray-700">{attachment.name}</span>
               </div>
               <button type="button" onClick={() => setAttachment(null)} className="text-rose-500 hover:rotate-90 transition-transform">
                 <i className="fa-solid fa-circle-xmark"></i>
               </button>
            </div>
          )}

          <div className="flex items-end gap-4">
            <div className="flex-1 bg-white rounded-[2rem] p-2 shadow-inner border border-gray-200 flex flex-col">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-50">
                 <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">To:</span>
                 <select 
                   className="text-xs font-bold outline-none bg-transparent"
                   value={targetGrade}
                   onChange={e => setTargetGrade(e.target.value)}
                 >
                   <option value="All">Everyone</option>
                   {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n.toString()}>Class {n}</option>)}
                 </select>
              </div>
              <textarea 
                className="w-full px-6 py-3 bg-transparent outline-none resize-none font-medium text-gray-700"
                rows={2}
                placeholder="Type a message to the academy..."
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 bg-white text-indigo-500 rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-50 transition-colors"
              >
                <i className="fa-solid fa-paperclip"></i>
              </button>
              <button 
                type="submit"
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-110 active:scale-90 ${
                  editingMessageId ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'
                }`}
              >
                <i className={`fa-solid ${editingMessageId ? 'fa-check' : 'fa-arrow-up'}`}></i>
              </button>
            </div>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf" />
        </form>
      </div>

      {/* Custom Confirmation Modal for Deletion */}
      {messageToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
           <div 
             className="absolute inset-0 bg-indigo-950/60 backdrop-blur-md animate-fade-in" 
             onClick={() => setMessageToDelete(null)}
           ></div>
           <div className="bg-white rounded-[3rem] p-10 max-w-md w-full relative z-10 shadow-2xl border-t-[10px] border-rose-500 animate-slide-up text-center">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
                 <i className="fa-solid fa-trash-can"></i>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Delete Broadcast?</h2>
              <p className="text-gray-500 font-medium mb-10 leading-relaxed">
                This message will be permanently removed from the Broadcast Room for all recipients.
              </p>
              <div className="grid grid-cols-2 gap-4">
                 <button 
                   onClick={() => setMessageToDelete(null)} 
                   className="py-4 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition-colors"
                 >
                   Keep It
                 </button>
                 <button 
                   onClick={confirmDelete} 
                   className="py-4 bg-rose-500 text-white rounded-2xl font-black shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all transform hover:scale-105 active:scale-95"
                 >
                   Yes, Delete
                 </button>
              </div>
           </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default MessageManager;
