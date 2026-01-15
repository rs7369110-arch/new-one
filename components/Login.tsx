
import React, { useState, useEffect } from 'react';
import { UserRole, User, Student } from '../types';
import Logo from './Logo';
import { storage, DB_KEYS } from '../db';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loginMode, setLoginMode] = useState<'STAFF' | 'PARENT'>('STAFF');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [sentOtp, setSentOtp] = useState<string | null>(null);
  const [isOtpStage, setIsOtpStage] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const students: Student[] = storage.get(DB_KEYS.STUDENTS, []);

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const inputUser = email.toLowerCase();
      let matchedUser: User | null = null;

      if (inputUser === 'zuber' && password === 'Zuber@1994') {
        matchedUser = { id: 'admin-1', name: 'Zuber', email: 'zuber@digital.com', role: UserRole.ADMIN };
      } else if (inputUser === 'ayaz' && password === 'Ayaz@1992') {
        matchedUser = { id: 'admin-2', name: 'Ayaz', email: 'ayaz@digital.com', role: UserRole.ADMIN };
      } else if (inputUser === 'demo' && password === 'demo') {
        matchedUser = { id: 'demo-1', name: 'Demo User', email: 'demo@digital.com', role: role };
      }

      if (matchedUser) {
        setIsSuccess(true);
        setTimeout(() => onLogin(matchedUser!), 1500);
      } else {
        setError('Access Denied: Invalid System Credentials');
        setIsLoading(false);
      }
    }, 2000);
  };

  const handleParentOtpRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const matchedStudent = students.find(s => s.phone === mobileNumber);
    
    if (matchedStudent) {
      const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setSentOtp(generatedOtp);
      setIsOtpStage(true);
    } else {
      setError('Identity Mismatch: Mobile not found in registry.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030305] p-6 relative overflow-hidden font-sans">
      {/* QUANTUM BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
        <div className="grid-bg opacity-20 absolute inset-0"></div>
      </div>

      {/* LOGIN CONTAINER */}
      <div className={`w-full max-w-lg relative transition-all duration-1000 transform ${isSuccess ? 'scale-110 opacity-0 blur-2xl' : 'scale-100 opacity-100'}`}>
        
        {/* EXTERNAL GLOW RING */}
        <div className={`absolute -inset-4 rounded-[4rem] blur-3xl opacity-20 transition-colors duration-1000 ${role === UserRole.ADMIN ? 'bg-indigo-500' : 'bg-purple-500'}`}></div>

        <div className="relative bg-[#0d0d12]/90 backdrop-blur-2xl rounded-[3.5rem] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] p-10 md:p-14 overflow-hidden group">
          
          {/* TOP DECORATIVE BAR */}
          <div className="absolute top-0 left-0 w-full h-1.5 overflow-hidden">
             <div className="h-full w-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-scan-fast"></div>
          </div>

          <div className="text-center mb-10">
            <div className="relative inline-block mb-6">
               <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-ping-slow"></div>
               <Logo size="lg" className="relative drop-shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
              Digital <span className="text-indigo-400">Node</span>
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] mt-3 opacity-60">Authentication Protocol</p>
          </div>

          {/* MODE SELECTOR */}
          <div className="flex bg-black/40 p-1.5 rounded-[2rem] mb-10 border border-white/5 relative">
            <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-indigo-600 rounded-[1.5rem] shadow-lg transition-all duration-500 ease-out ${loginMode === 'PARENT' ? 'translate-x-full' : 'translate-x-0'}`}></div>
            <button className={`flex-1 py-4 relative z-10 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${loginMode === 'STAFF' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`} onClick={() => setLoginMode('STAFF')}>Registry Staff</button>
            <button className={`flex-1 py-4 relative z-10 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${loginMode === 'PARENT' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`} onClick={() => setLoginMode('PARENT')}>Parent Access</button>
          </div>

          {error && (
            <div className="mb-8 p-5 bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-4 border border-rose-500/20 animate-shake">
              <i className="fa-solid fa-shield-virus text-sm"></i>
              {error}
            </div>
          )}

          <div className="min-h-[300px]">
            {loginMode === 'STAFF' ? (
              <form onSubmit={handleStaffSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {[UserRole.ADMIN, UserRole.TEACHER].map((r) => (
                    <button 
                      key={r} type="button"
                      className={`py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border ${role === r ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400 shadow-xl' : 'bg-transparent border-white/5 text-slate-600'}`}
                      onClick={() => setRole(r)}
                    >
                      {r === UserRole.ADMIN ? 'Administrator' : 'Master Educator'}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {/* ID INPUT */}
                  <div className="relative group/input">
                    <div className={`absolute -inset-[2px] rounded-[1.8rem] transition-all duration-500 opacity-0 group-focus-within/input:opacity-100 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-border-flow`}></div>
                    <div className="relative bg-[#0a0a0c] rounded-[1.8rem] overflow-hidden">
                       <i className={`fa-solid fa-hashtag absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'id' ? 'text-indigo-400' : 'text-slate-700'}`}></i>
                       <input 
                         type="text" required
                         className="w-full pl-14 pr-6 py-5 bg-transparent border border-white/5 outline-none font-bold text-white text-sm placeholder:text-slate-800 placeholder:uppercase"
                         placeholder="System Identity"
                         value={email}
                         onFocus={() => setFocusedField('id')}
                         onBlur={() => setFocusedField(null)}
                         onChange={(e) => setEmail(e.target.value)}
                       />
                    </div>
                  </div>

                  {/* PASSWORD INPUT */}
                  <div className="relative group/input">
                    <div className={`absolute -inset-[2px] rounded-[1.8rem] transition-all duration-500 opacity-0 group-focus-within/input:opacity-100 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-border-flow`}></div>
                    <div className="relative bg-[#0a0a0c] rounded-[1.8rem] overflow-hidden">
                       <i className={`fa-solid fa-lock absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'pass' ? 'text-indigo-400' : 'text-slate-700'}`}></i>
                       <input 
                         type="password" required
                         className="w-full pl-14 pr-6 py-5 bg-transparent border border-white/5 outline-none font-bold text-white text-sm placeholder:text-slate-800 placeholder:uppercase"
                         placeholder="Master Cipher"
                         value={password}
                         onFocus={() => setFocusedField('pass')}
                         onBlur={() => setFocusedField(null)}
                         onChange={(e) => setPassword(e.target.value)}
                       />
                    </div>
                  </div>
                </div>
                
                <button 
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-6 relative rounded-[2rem] font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-3 mt-10 overflow-hidden ${isLoading ? 'bg-slate-800 text-slate-500 cursor-wait' : 'bg-indigo-600 hover:bg-white hover:text-indigo-950 text-white'}`}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                       <svg className="animate-spin h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                       </svg>
                       <span>Decrypting...</span>
                    </div>
                  ) : (
                    <>
                      <i className="fa-solid fa-bolt-lightning text-amber-400 animate-pulse"></i>
                      <span>Uplink Access</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* PARENT FORM */
              <form onSubmit={isOtpStage ? (e) => e.preventDefault() : handleParentOtpRequest} className="space-y-8 animate-fade-in">
                 <div className="relative group/input">
                    <div className={`absolute -inset-[2px] rounded-[1.8rem] transition-all duration-500 opacity-0 group-focus-within/input:opacity-100 bg-gradient-to-r from-amber-500 to-orange-500 animate-border-flow`}></div>
                    <div className="relative bg-[#0a0a0c] rounded-[2rem] overflow-hidden p-6 flex items-center gap-6">
                       <div className="flex items-center gap-2 border-r border-white/10 pr-4">
                          <img src="https://flagcdn.com/w20/in.png" className="w-5 rounded shadow-sm opacity-60" alt="IN" />
                          <span className="text-slate-500 font-black text-sm">+91</span>
                       </div>
                       <input 
                         type="tel" required maxLength={10}
                         className="flex-1 bg-transparent border-none outline-none font-black text-white tracking-[0.2em] text-2xl placeholder:text-slate-800"
                         placeholder="0000000000"
                         value={mobileNumber}
                         onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                       />
                    </div>
                 </div>
                 
                 <button type="submit" className="w-full py-6 bg-amber-500 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-3">
                   <i className="fa-solid fa-fingerprint"></i> Verify Link
                 </button>
              </form>
            )}
          </div>

          <div className="mt-14 pt-10 border-t border-white/5 flex items-center justify-between opacity-30">
             <div className="flex gap-5 text-sm">
                <i className="fa-brands fa-android hover:text-indigo-400 transition-colors"></i>
                <i className="fa-brands fa-apple hover:text-indigo-400 transition-colors"></i>
                <i className="fa-solid fa-wifi hover:text-emerald-400 transition-colors"></i>
             </div>
             <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">Core v4.5.1</p>
          </div>
        </div>
      </div>

      {/* SUCCESS OVERLAY */}
      {isSuccess && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center pointer-events-none">
           <div className="text-center animate-success-sequence">
              <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white text-5xl mb-6 shadow-[0_0_50px_rgba(16,185,129,0.5)] mx-auto">
                 <i className="fa-solid fa-check"></i>
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-[0.5em]">Identity Cleared</h2>
           </div>
        </div>
      )}

      <style>{`
        .grid-bg {
          background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0);
          background-size: 32px 32px;
        }
        
        @keyframes scan-fast {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-scan-fast { animation: scan-fast 1.5s infinite linear; }

        @keyframes border-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-border-flow {
          background-size: 200% 200%;
          animation: border-flow 3s infinite linear;
        }

        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-ping-slow { animation: ping-slow 3s infinite ease-out; }

        @keyframes success-sequence {
          0% { transform: scale(0.5); opacity: 0; filter: blur(20px); }
          50% { transform: scale(1.1); opacity: 1; filter: blur(0px); }
          100% { transform: scale(1.5); opacity: 0; filter: blur(10px); }
        }
        .animate-success-sequence { animation: success-sequence 1.5s forwards cubic-bezier(0.4, 0, 0.2, 1); }

        @keyframes shake { 
          0%, 100% { transform: translateX(0); } 
          20% { transform: translateX(-10px); } 
          40% { transform: translateX(10px); } 
          60% { transform: translateX(-10px); } 
          80% { transform: translateX(10px); } 
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
};

export default Login;
