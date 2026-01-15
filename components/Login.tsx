
import React, { useState, useEffect, useRef } from 'react';
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
  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  const students: Student[] = storage.get(DB_KEYS.STUDENTS, []);

  // Neural Mesh Animation Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = 60;

    class Particle {
      x: number; y: number; vx: number; vy: number; size: number;
      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas!.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas!.height) this.vy *= -1;

        // Mouse interaction
        const dx = mouseRef.current.x - this.x;
        const dy = mouseRef.current.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 150) {
          this.x -= dx * 0.01;
          this.y -= dy * 0.01;
        }
      }
      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fillStyle = 'rgba(99, 102, 241, 0.5)';
        ctx!.fill();
      }
    }

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < particleCount; i++) particles.push(new Particle());
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.update();
        p.draw();
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x;
          const dy = p.y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.2 - distance / 600})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', init);
    window.addEventListener('mousemove', (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    });

    init();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', init);
    };
  }, []);

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
        setError('SEC_ERROR: Identification strings failed decryption');
        setIsLoading(false);
      }
    }, 2800);
  };

  const handleParentOtpRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const matchedStudent = students.find(s => s.phone === mobileNumber);
    if (matchedStudent) {
      alert(`System Notice: OTP Protocol triggered for ${mobileNumber}`);
    } else {
      setError('ID_ERROR: Mobile string not found in master registry');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020205] p-6 relative overflow-hidden font-sans">
      {/* CANVAS BACKGROUND */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />
      
      {/* SCANLINE OVERLAY */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.05]" style={{ background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 3px, 3px 100%' }}></div>

      <div className={`w-full max-w-lg relative z-20 transition-all duration-1000 ${isSuccess ? 'scale-[2.5] opacity-0 blur-3xl' : 'scale-100 opacity-100'}`}>
        
        {/* HOLOGRAPHIC GLOW */}
        <div className={`absolute -inset-2 rounded-[3.5rem] blur-3xl transition-all duration-1000 ${focusedField ? 'opacity-40' : 'opacity-10'} ${role === UserRole.ADMIN ? 'bg-indigo-500' : 'bg-purple-500'}`}></div>

        <div className={`relative bg-[#0a0a0f]/80 backdrop-blur-3xl rounded-[3rem] border border-white/5 shadow-[0_0_100px_rgba(0,0,0,1)] p-10 md:p-14 overflow-hidden group ${isLoading ? 'pointer-events-none' : ''}`}>
          
          {/* DECRYPTION LOADER OVERLAY */}
          {isLoading && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0f]/95 animate-fade-in backdrop-blur-lg">
               <div className="relative w-40 h-40">
                  <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-t-4 border-indigo-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-4 border-4 border-cyan-500/20 rounded-full"></div>
                  <div className="absolute inset-4 border-b-4 border-cyan-500 rounded-full animate-spin-reverse"></div>
                  <div className="absolute inset-8 flex flex-col items-center justify-center text-center">
                     <span className="text-[10px] font-black text-indigo-400 animate-pulse">DECRYPTING</span>
                     <span className="text-[8px] font-mono text-cyan-500/60 font-bold mt-1">0x{Math.floor(Math.random()*9999).toString(16)}</span>
                  </div>
               </div>
               <div className="mt-8 text-center space-y-2">
                  <p className="text-[10px] font-black text-white uppercase tracking-[0.5em] animate-pulse">Verifying Neural Signature</p>
                  <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mx-auto">
                     <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 animate-loading-bar"></div>
                  </div>
               </div>
            </div>
          )}

          <div className="text-center mb-10">
            <div className="relative inline-block mb-6 group-hover:scale-110 transition-transform duration-700">
               <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse"></div>
               <Logo size="lg" className="relative drop-shadow-[0_0_20px_rgba(99,102,241,0.6)]" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none font-orbitron">
              Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Core</span>
            </h1>
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.6em] mt-4">Academy Security Node</p>
          </div>

          <div className="flex bg-black/50 p-1 rounded-[1.8rem] mb-10 border border-white/5 relative">
            <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-indigo-600 rounded-[1.4rem] shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${loginMode === 'PARENT' ? 'translate-x-full' : 'translate-x-0'}`}></div>
            <button className={`flex-1 py-3.5 relative z-10 text-[10px] font-black uppercase tracking-widest transition-all ${loginMode === 'STAFF' ? 'text-white' : 'text-slate-500'}`} onClick={() => setLoginMode('STAFF')}>Academy Staff</button>
            <button className={`flex-1 py-3.5 relative z-10 text-[10px] font-black uppercase tracking-widest transition-all ${loginMode === 'PARENT' ? 'text-white' : 'text-slate-500'}`} onClick={() => setLoginMode('PARENT')}>Parent Link</button>
          </div>

          {error && (
            <div className="mb-8 p-5 bg-rose-500/10 text-rose-400 text-[9px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-4 border border-rose-500/20 animate-shake">
              <i className="fa-solid fa-triangle-exclamation text-base"></i>
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
                      className={`py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 ${role === r ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400' : 'bg-transparent border-white/5 text-slate-700'}`}
                      onClick={() => setRole(r)}
                    >
                      {r === UserRole.ADMIN ? 'Administrator' : 'Master Educator'}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className={`relative transition-all duration-500 ${focusedField === 'id' ? 'scale-[1.02] -translate-y-1' : ''}`}>
                    <div className="relative bg-black/40 rounded-[1.5rem] overflow-hidden border border-white/5 group-focus-within:border-indigo-500/30">
                       <i className={`fa-solid fa-at absolute left-6 top-1/2 -translate-y-1/2 text-sm transition-colors ${focusedField === 'id' ? 'text-indigo-400' : 'text-slate-700'}`}></i>
                       <input 
                         type="text" required
                         className="w-full pl-14 pr-6 py-5 bg-transparent outline-none font-bold text-white text-sm placeholder:text-slate-800 placeholder:uppercase"
                         placeholder="Master ID"
                         value={email}
                         onFocus={() => setFocusedField('id')}
                         onBlur={() => setFocusedField(null)}
                         onChange={(e) => setEmail(e.target.value)}
                       />
                       {focusedField === 'id' && <div className="absolute right-6 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></div>}
                    </div>
                  </div>

                  <div className={`relative transition-all duration-500 ${focusedField === 'pass' ? 'scale-[1.02] -translate-y-1' : ''}`}>
                    <div className="relative bg-black/40 rounded-[1.5rem] overflow-hidden border border-white/5 group-focus-within:border-indigo-500/30">
                       <i className={`fa-solid fa-shield-halved absolute left-6 top-1/2 -translate-y-1/2 text-sm transition-colors ${focusedField === 'pass' ? 'text-indigo-400' : 'text-slate-700'}`}></i>
                       <input 
                         type="password" required
                         className="w-full pl-14 pr-6 py-5 bg-transparent outline-none font-bold text-white text-sm placeholder:text-slate-800 placeholder:uppercase"
                         placeholder="Security Cipher"
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
                  className="w-full py-6 relative rounded-[2rem] bg-indigo-600 hover:bg-white hover:text-indigo-950 text-white font-black text-[11px] uppercase tracking-[0.5em] shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-4 mt-12 overflow-hidden group/btn"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 opacity-0 group-hover/btn:opacity-10 transition-opacity"></div>
                  <i className="fa-solid fa-bolt text-amber-400"></i>
                  <span>Initiate Uplink</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleParentOtpRequest} className="space-y-8 animate-fade-in">
                 <div className="relative bg-black/40 rounded-[2rem] overflow-hidden p-8 border border-white/5 flex items-center gap-8 shadow-inner">
                    <div className="flex items-center gap-3 border-r border-white/10 pr-6 shrink-0">
                       <img src="https://flagcdn.com/w20/in.png" className="w-6 rounded-sm opacity-60" alt="IN" />
                       <span className="text-slate-400 font-black text-lg">+91</span>
                    </div>
                    <input 
                      type="tel" required maxLength={10}
                      className="flex-1 bg-transparent border-none outline-none font-black text-white tracking-[0.3em] text-3xl placeholder:text-slate-900"
                      placeholder="0000000000"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    />
                 </div>
                 <button type="submit" className="w-full py-7 bg-amber-500 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4">
                   <i className="fa-solid fa-fingerprint text-xl"></i> Secure Access
                 </button>
              </form>
            )}
          </div>

          <div className="mt-16 pt-10 border-t border-white/5 flex items-center justify-between opacity-30">
             <div className="flex gap-6 text-sm">
                <i className="fa-brands fa-android hover:text-indigo-400 transition-colors"></i>
                <i className="fa-brands fa-apple hover:text-indigo-400 transition-colors"></i>
                <i className="fa-solid fa-wifi hover:text-emerald-400 transition-colors"></i>
             </div>
             <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em] font-orbitron">Engine v6.1.0</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        .animate-loading-bar {
          width: 100%;
          animation: loading-bar 2s infinite ease-in-out;
        }
        @keyframes spin-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-reverse {
          animation: spin-reverse 1.5s linear infinite;
        }
        @keyframes shake { 
          0%, 100% { transform: translateX(0); } 
          20% { transform: translateX(-8px); } 
          40% { transform: translateX(8px); } 
          60% { transform: translateX(-8px); } 
          80% { transform: translateX(8px); } 
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        
        .font-orbitron { font-family: 'Orbitron', sans-serif; }
      `}</style>
    </div>
  );
};

export default Login;
