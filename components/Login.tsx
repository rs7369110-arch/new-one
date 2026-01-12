
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
  const [showOtpNotification, setShowOtpNotification] = useState(false);

  // Load students to verify parent mobile numbers
  const students: Student[] = storage.get(DB_KEYS.STUDENTS, []);

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const inputUser = email.toLowerCase();
      if (inputUser === 'zuber' && password === 'Zuber@1994') {
        onLogin({ id: 'admin-1', name: 'Zuber', email: 'zuber@digital.com', role: UserRole.ADMIN });
      } else if (inputUser === 'ayaz' && password === 'Ayaz@1992') {
        onLogin({ id: 'admin-2', name: 'Ayaz', email: 'ayaz@digital.com', role: UserRole.ADMIN });
      } else if (inputUser === 'demo' && password === 'demo') {
        onLogin({ id: 'demo-1', name: 'Demo User', email: 'demo@digital.com', role: role });
      } else {
        setError('Access credentials denied by system.');
        setIsLoading(false);
      }
    }, 1200);
  };

  const handleParentOtpRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (students.length === 0) {
      setError('System Registry Offline. Contact Administrator.');
      return;
    }

    const matchedStudent = students.find(s => s.phone === mobileNumber);
    
    if (matchedStudent) {
      const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setSentOtp(generatedOtp);
      setIsOtpStage(true);
      setShowOtpNotification(true);
      // Auto-hide notification after 10 seconds
      setTimeout(() => setShowOtpNotification(false), 10000);
    } else {
      setError('Mobile number not recognized in encrypted database.');
    }
  };

  const handleParentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp === sentOtp) {
      const matchedStudent = students.find(s => s.phone === mobileNumber);
      if (matchedStudent) {
        setShowOtpNotification(false);
        onLogin({ 
          id: `parent-${matchedStudent.id}`, 
          name: matchedStudent.parentName, 
          email: `${mobileNumber}@parent.com`, 
          role: UserRole.PARENT,
          studentId: matchedStudent.id 
        });
      }
    } else {
      setError('Verification code mismatch. Try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050507] p-6 relative overflow-hidden">
      {/* ADVANCED DYNAMIC BACKGROUND */}
      <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-indigo-600/10 rounded-full blur-[160px] animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[140px] animate-blob animation-delay-2000"></div>
      <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] bg-amber-500/5 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      
      {/* SCANLINE OVERLAY */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }}></div>

      {/* PREMIUM OTP TOAST - HOLOGRAPHIC STYLE */}
      {showOtpNotification && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-[2000] animate-notif-in">
           <div className="bg-white/10 backdrop-blur-3xl p-6 rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] border border-white/20 flex flex-col items-center text-center overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-indigo-500 animate-loading-bar"></div>
              <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-300 mb-4 ring-1 ring-white/10">
                 <i className="fa-solid fa-satellite-dish text-2xl animate-pulse"></i>
              </div>
              <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-1">Satellite Relay Active</h4>
              <p className="text-slate-400 text-[11px] font-bold mb-4">Identity Verification Token:</p>
              <div className="relative">
                 <div className="absolute -inset-4 bg-indigo-500/20 blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                 <div className="bg-black/50 backdrop-blur-md px-10 py-4 rounded-2xl border border-white/10 relative">
                    <span className="text-white font-black text-4xl tracking-[0.5em] drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{sentOtp}</span>
                 </div>
              </div>
              <button onClick={() => setShowOtpNotification(false)} className="mt-6 text-slate-500 hover:text-white text-[9px] font-black uppercase tracking-[0.4em] transition-all">
                Close Transmission
              </button>
           </div>
        </div>
      )}

      {/* MAIN LOGIN CARD */}
      <div className="w-full max-w-lg relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 rounded-[4rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        
        <div className="relative bg-[#0d0d12]/80 backdrop-blur-3xl rounded-[4rem] shadow-[0_80px_160px_-40px_rgba(0,0,0,1)] border border-white/5 p-10 md:p-14 overflow-hidden">
          {/* DECORATIVE ELEMENTS */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>

          <div className="text-center mb-12">
            <div className="inline-block relative mb-8">
               <div className="absolute -inset-4 bg-indigo-500/20 blur-2xl rounded-full"></div>
               <Logo size="lg" className="relative drop-shadow-[0_0_20px_rgba(79,70,229,0.4)]" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
              Access <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Gateway</span>
            </h1>
            <p className="text-slate-500 mt-3 text-[10px] font-black uppercase tracking-[0.5em] opacity-60">Digital Education Infrastructure</p>
          </div>

          {/* MODE SWITCHER */}
          <div className="flex bg-black/60 p-2 rounded-[2rem] mb-10 border border-white/5 relative">
            <div 
              className={`absolute top-2 bottom-2 w-[calc(50%-8px)] bg-indigo-600 rounded-[1.5rem] shadow-2xl transition-all duration-500 ease-out ${loginMode === 'PARENT' ? 'translate-x-full' : 'translate-x-0'}`}
            ></div>
            <button 
              className={`flex-1 py-4 relative z-10 text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${loginMode === 'STAFF' ? 'text-white' : 'text-slate-500'}`}
              onClick={() => { setLoginMode('STAFF'); setError(null); setIsOtpStage(false); setShowOtpNotification(false); }}
            >
              <i className="fa-solid fa-shield-halved"></i>
              Command Staff
            </button>
            <button 
              className={`flex-1 py-4 relative z-10 text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${loginMode === 'PARENT' ? 'text-white' : 'text-slate-500'}`}
              onClick={() => { setLoginMode('PARENT'); setError(null); }}
            >
              <i className="fa-solid fa-users-rays"></i>
              Parent Portal
            </button>
          </div>

          {error && (
            <div className="mb-8 p-5 bg-rose-500/5 text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-3xl flex items-center gap-4 border border-rose-500/20 animate-shake">
              <div className="w-10 h-10 bg-rose-500/10 rounded-2xl flex items-center justify-center shrink-0">
                 <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              {error}
            </div>
          )}

          <div className="min-h-[320px]">
            {loginMode === 'STAFF' ? (
              <form onSubmit={handleStaffSubmit} className="space-y-6 animate-fade-in">
                {/* ROLE PICKER */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {[UserRole.ADMIN, UserRole.TEACHER].map((r) => (
                    <button 
                      key={r} type="button"
                      className={`py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border ${role === r ? 'bg-white/5 border-indigo-500/50 text-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.1)]' : 'bg-transparent border-white/5 text-slate-600'}`}
                      onClick={() => setRole(r)}
                    >
                      {r === UserRole.ADMIN ? 'Administrator' : 'Master Faculty'}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="relative group/input">
                    <input 
                      type="text" required
                      className="w-full pl-14 pr-6 py-5 rounded-[1.8rem] bg-black/40 border border-white/5 focus:border-indigo-500/50 outline-none transition-all font-bold text-white text-sm placeholder:text-slate-700"
                      placeholder="Identifer / Username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <i className="fa-solid fa-at absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within/input:text-indigo-400 transition-colors"></i>
                  </div>
                  <div className="relative group/input">
                    <input 
                      type="password" required
                      className="w-full pl-14 pr-6 py-5 rounded-[1.8rem] bg-black/40 border border-white/5 focus:border-indigo-500/50 outline-none transition-all font-bold text-white text-sm placeholder:text-slate-700"
                      placeholder="Secret Cipher"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <i className="fa-solid fa-lock absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within/input:text-indigo-400 transition-colors"></i>
                  </div>
                </div>
                
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-6 bg-indigo-600 hover:bg-white hover:text-indigo-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(79,70,229,0.3)] transition-all transform active:scale-95 flex items-center justify-center gap-3 mt-8"
                >
                  {isLoading ? (
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                  ) : (
                    <i className="fa-solid fa-bolt-lightning"></i>
                  )}
                  {isLoading ? 'Synchronizing...' : 'Initialize Node'}
                </button>
              </form>
            ) : (
              /* PARENT PORTAL - UNIQUE INPUTS */
              <form onSubmit={isOtpStage ? handleParentLogin : handleParentOtpRequest} className="space-y-8 animate-slide-up">
                {!isOtpStage ? (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] text-center">Identity Registry Link</p>
                      <div className="relative">
                        <div className="absolute left-7 top-1/2 -translate-y-1/2 flex items-center gap-3">
                           <img src="https://flagcdn.com/w20/in.png" className="w-5 rounded shadow-sm opacity-60" alt="IN" />
                           <span className="text-slate-500 font-black text-sm">+91</span>
                        </div>
                        <input 
                          type="tel" required maxLength={10}
                          className="w-full pl-24 pr-8 py-6 rounded-[2rem] bg-black/40 border border-white/5 focus:border-amber-500/50 outline-none transition-all font-black text-white tracking-[0.3em] text-2xl shadow-inner"
                          placeholder="0000000000"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                    </div>
                    
                    <button 
                      type="submit"
                      className="w-full py-6 bg-amber-500 hover:bg-white hover:text-amber-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(245,158,11,0.2)] transition-all transform active:scale-95 flex items-center justify-center gap-3"
                    >
                      <i className="fa-solid fa-fingerprint"></i>
                      Request Token
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8 animate-fade-in">
                    <div className="text-center">
                      <p className="text-emerald-400 text-[11px] font-black uppercase tracking-[0.3em] mb-2 flex items-center justify-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        Relay Linked to +91 {mobileNumber}
                      </p>
                      <button type="button" onClick={() => { setIsOtpStage(false); setShowOtpNotification(false); }} className="text-slate-500 hover:text-indigo-400 text-[9px] font-black uppercase tracking-widest transition-all">Correction Required?</button>
                    </div>

                    <div className="relative px-4">
                      <div className="absolute inset-0 bg-indigo-500/5 blur-3xl opacity-50"></div>
                      <input 
                        type="text" required maxLength={4}
                        className="w-full px-8 py-8 rounded-[2.5rem] bg-black/60 border-2 border-white/5 focus:border-emerald-500/50 outline-none transition-all font-black text-white text-5xl text-center tracking-[0.8em] shadow-[inset_0_20px_40px_rgba(0,0,0,0.5)]"
                        placeholder="----"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-6 bg-emerald-600 hover:bg-white hover:text-emerald-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(16,185,129,0.2)] transition-all transform active:scale-95 flex items-center justify-center gap-3"
                    >
                      <i className="fa-solid fa-shield-check"></i>
                      Confirm Identity
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>

          {/* SYSTEM INFO FOOTER */}
          <div className="mt-14 pt-10 border-t border-white/5 flex items-center justify-between opacity-40">
             <div className="flex gap-4">
                <i className="fa-brands fa-android text-lg"></i>
                <i className="fa-brands fa-apple text-lg"></i>
                <i className="fa-solid fa-cloud-check text-lg"></i>
             </div>
             <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.5em]">Digital Core v4.3.5 • Build Stable</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite alternate; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        
        @keyframes loading-bar {
          0% { width: 0; left: 0; }
          50% { width: 100%; left: 0; }
          100% { width: 0; left: 100%; }
        }
        .animate-loading-bar { animation: loading-bar 3s infinite ease-in-out; }

        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-shake { animation: shake 0.2s ease-in-out 2; }
        
        @keyframes notifIn { 
          from { transform: translate(-50%, -150%); opacity: 0; } 
          to { transform: translate(-50%, 0); opacity: 1; } 
        }
        .animate-notif-in { animation: notifIn 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }

        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slideUp 0.6s ease-out forwards; }
        
        input::placeholder { font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; }
      `}</style>
    </div>
  );
};

export default Login;
