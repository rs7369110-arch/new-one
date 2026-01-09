
import React, { useState } from 'react';
import { UserRole, User } from '../types';
import Logo from './Logo';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const inputUser = email.toLowerCase();
    
    if (inputUser === 'zuber' && password === 'Zuber@1994') {
      onLogin({ id: 'admin-1', name: 'Zuber', email: 'zuber@digital.com', role: UserRole.ADMIN });
    } else if (inputUser === 'ayaz' && password === 'Ayaz@1992') {
      onLogin({ id: 'admin-2', name: 'Ayaz', email: 'ayaz@digital.com', role: UserRole.ADMIN });
    } else if (inputUser === 'demo' && password === 'demo') {
      onLogin({ id: 'demo-1', name: 'Demo User', email: 'demo@digital.com', role: role });
    } else {
      setError('Credentials not found in Academy records.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] p-6 relative overflow-hidden">
      {/* Immersive Dark Nebula Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-900/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-3xl rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] border border-white/10 p-10 md:p-14 relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-50"></div>
        
        <div className="text-center mb-12">
          <div className="flex justify-center mb-8 transform hover:scale-110 transition-transform duration-700">
            <Logo size="lg" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Digital <span className="text-indigo-400">Education</span></h1>
          <p className="text-slate-500 mt-3 text-[10px] font-black uppercase tracking-[0.5em]">Terminal Access Port</p>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-2xl mb-10 border border-white/5">
          {[UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT].map((r) => (
            <button 
              key={r}
              className={`py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${role === r ? 'bg-indigo-600 text-white shadow-2xl' : 'text-slate-500 hover:text-slate-300'}`}
              onClick={() => setRole(r)}
            >{r}</button>
          ))}
        </div>

        {error && (
          <div className="mb-8 p-4 bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-3 border border-rose-500/20 animate-shake">
            <i className="fa-solid fa-shield-halved"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity UID</label>
            <input 
              type="text" required
              className="w-full px-6 py-4 rounded-[1.5rem] bg-black/40 border border-white/5 focus:bg-black/60 focus:border-indigo-500/50 outline-none transition-all font-bold text-white shadow-inner"
              placeholder="Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Security Key</label>
            <input 
              type="password" required
              className="w-full px-6 py-4 rounded-[1.5rem] bg-black/40 border border-white/5 focus:bg-black/60 focus:border-indigo-500/50 outline-none transition-all font-bold text-white shadow-inner"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            className="w-full py-5 bg-indigo-600 hover:bg-white hover:text-indigo-900 text-white rounded-[1.8rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-indigo-900/20 transition-all transform hover:-translate-y-1 active:scale-95 mt-4"
          >
            Authorize Session
          </button>
        </form>
      </div>

      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-shake { animation: shake 0.2s ease-in-out 2; }
      `}</style>
    </div>
  );
};

export default Login;
