
import React, { useState, useEffect } from 'react';
import { UserRole, User, Student } from '../types';
import Logo from './Logo';

interface LoginProps {
  onLogin: (user: User) => void;
  students: Student[];
}

const Login: React.FC<LoginProps> = ({ onLogin, students }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);
  const [error, setError] = useState<string | null>(null);
  
  // OTP Specific States
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [matchedStudent, setMatchedStudent] = useState<Student | null>(null);

  // Reset OTP state when role changes
  useEffect(() => {
    setIsOtpSent(false);
    setOtpValue('');
    setMatchedStudent(null);
    setError(null);
  }, [role]);

  // Helper to strip all non-numeric characters for comparison
  const normalizePhone = (phone: string) => phone.replace(/\D/g, '').slice(-10);

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const phoneInput = normalizePhone(email);
    
    if (phoneInput.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Search students with normalized matching
    const match = students.find(s => 
      normalizePhone(s.phone) === phoneInput || 
      normalizePhone(s.emergencyContact) === phoneInput
    );
    
    if (!match) {
      setError('This mobile number is not registered in our records.');
      return;
    }

    setIsSending(true);
    // Simulate network delay for sending OTP
    setTimeout(() => {
      setMatchedStudent(match);
      setIsOtpSent(true);
      setIsSending(false);
    }, 1200);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue === '123456' && matchedStudent) {
      onLogin({ 
        id: `parent-${matchedStudent.id}`, 
        name: matchedStudent.parentName, 
        email: matchedStudent.phone, 
        role: UserRole.PARENT,
        studentId: matchedStudent.id 
      });
    } else {
      setError('Incorrect OTP. Use 123456 for testing.');
    }
  };

  const handleSubmitStandard = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const inputVal = email.trim().toLowerCase();
    
    // Hardcoded Admin/Teacher/Student Logins
    if (inputVal === 'zuber' && password === 'Zuber@1994') {
      onLogin({ id: 'admin-1', name: 'Zuber', email: 'zuber@digital.com', role: UserRole.ADMIN });
    } else if (inputVal === 'ayaz' && password === 'Ayaz@1992') {
      onLogin({ id: 'admin-2', name: 'Ayaz', email: 'ayaz@digital.com', role: UserRole.ADMIN });
    } else if (inputVal === 'demo' && password === 'demo') {
      onLogin({ id: 'demo-1', name: 'Demo User', email: 'demo@digital.com', role: role });
    } else {
      setError('Invalid identity or security key.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-900/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-900/10 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-3xl rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] border border-white/10 p-10 md:p-14 relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-50"></div>
        
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6 transform hover:scale-110 transition-transform duration-700">
            <Logo size="lg" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Digital <span className="text-emerald-400">Education</span></h1>
          <p className="text-slate-500 mt-2 text-[9px] font-black uppercase tracking-[0.5em]">Terminal Access Port</p>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-2xl mb-8 border border-white/5">
          {[UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT].map((r) => (
            <button 
              key={r}
              className={`py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${role === r ? 'bg-emerald-600 text-white shadow-2xl' : 'text-slate-500 hover:text-slate-300'}`}
              onClick={() => setRole(r)}
            >{r}</button>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-3 border border-rose-500/20 animate-shake">
            <i className="fa-solid fa-triangle-exclamation"></i>
            {error}
          </div>
        )}

        {role === UserRole.PARENT ? (
          <div className="space-y-6 animate-fade-in">
            {!isOtpSent ? (
              <form onSubmit={handleRequestOtp} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Parent Mobile Number</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 font-black">+91</span>
                    <input 
                      type="tel" 
                      required
                      autoFocus
                      className="w-full pl-16 pr-6 py-4 rounded-[1.5rem] bg-black/40 border border-white/5 focus:bg-black/60 focus:border-emerald-500/50 outline-none transition-all font-bold text-white shadow-inner"
                      placeholder="9876543210"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={isSending}
                  className="w-full py-5 bg-emerald-600 hover:bg-white hover:text-emerald-900 text-white rounded-[1.8rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                >
                  {isSending ? (
                    <span className="flex items-center justify-center gap-3">
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      Verifying...
                    </span>
                  ) : 'Send Secure OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6 animate-slide-up">
                <div className="text-center p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 mb-2">
                   <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Code sent to {email}</p>
                   <p className="text-xs font-bold text-slate-300">Enter 6-digit verification code</p>
                   <p className="text-[10px] font-black text-amber-500 mt-2 bg-amber-500/10 py-1 rounded-lg">Demo OTP: 123456</p>
                </div>
                
                <div className="space-y-2">
                  <input 
                    type="text" 
                    required
                    maxLength={6}
                    autoFocus
                    className="w-full px-6 py-5 rounded-[1.5rem] bg-black/40 border border-emerald-500/30 focus:bg-black/60 focus:border-emerald-500 outline-none transition-all font-black text-3xl tracking-[0.5em] text-center text-emerald-400 shadow-inner"
                    placeholder="000000"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsOtpSent(false)}
                    className="flex-1 py-4 bg-white/5 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/5 hover:bg-white/10 transition-all"
                  >
                    Back
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl transform active:scale-95"
                  >
                    Verify & Login
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmitStandard} className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity UID</label>
              <input 
                type="text" 
                required
                className="w-full px-6 py-4 rounded-[1.5rem] bg-black/40 border border-white/5 focus:bg-black/60 focus:border-emerald-500/50 outline-none transition-all font-bold text-white shadow-inner"
                placeholder="Username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Security Key</label>
              <input 
                type="password" 
                required
                className="w-full px-6 py-4 rounded-[1.5rem] bg-black/40 border border-white/5 focus:bg-black/60 focus:border-emerald-500/50 outline-none transition-all font-bold text-white shadow-inner"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit"
              className="w-full py-5 bg-emerald-600 hover:bg-white hover:text-emerald-900 text-white rounded-[1.8rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95 mt-4"
            >
              Authorize Session
            </button>
          </form>
        )}
      </div>

      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-shake { animation: shake 0.2s ease-in-out 2; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes slideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slideUp 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Login;
