
import React, { useState, useRef, useEffect } from 'react';
import { Student, UserRole, User, SchoolBranding } from '../types';
import Logo from './Logo';
import { storage, DB_KEYS } from '../db';

interface ICardGeneratorProps {
  students: Student[];
  user: User;
  branding: SchoolBranding;
}

// Global settings key for ID card design
const ID_SETTINGS_KEY = 'edu_id_card_custom_settings';

interface IDSettings {
  schoolName: string;
  tagline: string;
  themeColor: string;
  customLogo: string | null;
  signature: string | null;
}

// Declare html2pdf for TypeScript
declare var html2pdf: any;

const ICardGenerator: React.FC<ICardGeneratorProps> = ({ students, user, branding }) => {
  const [selectedId, setSelectedId] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Design State - Merge Global Branding with local overrides if needed
  const [settings, setSettings] = useState<IDSettings>({
    schoolName: branding.name || 'Academy',
    tagline: branding.tagline || 'Excellence Defined',
    themeColor: branding.themeColor || '#1e1b4b',
    customLogo: branding.logo || null,
    // Added type casting to resolve 'signature' property error on empty object
    signature: (storage.get(ID_SETTINGS_KEY, {}) as any).signature || null
  });
  
  // Update settings if global branding changes
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      schoolName: branding.name,
      tagline: branding.tagline,
      customLogo: branding.logo
    }));
  }, [branding]);

  // Student Override State (for temporary card edits)
  const [overrides, setOverrides] = useState<Partial<Student>>({});

  const isAdmin = user.role === UserRole.ADMIN;
  const rawStudent = students.find(s => s.id === selectedId);
  
  // Merged student data
  const student = rawStudent ? { ...rawStudent, ...overrides } : null;

  useEffect(() => {
    // Reset overrides when student changes
    setOverrides({});
  }, [selectedId]);

  const saveSettings = (newSettings: IDSettings) => {
    setSettings(newSettings);
    storage.set(ID_SETTINGS_KEY, newSettings);
  };

  const handleFileUpload = (type: 'logo' | 'signature', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'logo') saveSettings({ ...settings, customLogo: base64 });
        else saveSettings({ ...settings, signature: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('id-card-printable-container');
    if (!element || !student) return;

    setIsDownloading(true);
    
    const opt = {
      margin: 10,
      filename: `${student.name.replace(/\s+/g, '_')}_Official_ID.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { 
        scale: 3, 
        useCORS: true, 
        letterRendering: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to generate ID Card PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-indigo-900 tracking-tighter uppercase">Identity Design Studio</h1>
          <p className="text-gray-500 font-medium italic">Customizing premium security credentials for the Academy. 🪪</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {isAdmin && (
            <button 
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-8 py-4 rounded-[2rem] font-black shadow-xl transition-all flex items-center gap-3 transform hover:scale-105 active:scale-95 ${isEditMode ? 'bg-amber-500 text-white' : 'bg-white text-indigo-600 border border-indigo-100'}`}
            >
              <i className={`fa-solid ${isEditMode ? 'fa-check' : 'fa-wand-magic-sparkles'}`}></i>
              {isEditMode ? 'Finish Designing' : 'Enter Design Studio'}
            </button>
          )}
          {student && (
            <button 
              disabled={isDownloading}
              onClick={handleDownloadPDF}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black shadow-xl transition-all flex items-center gap-3 transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <i className={`fa-solid ${isDownloading ? 'fa-spinner fa-spin' : 'fa-file-pdf'}`}></i>
              {isDownloading ? 'Exporting...' : 'Download ID'}
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR: SELECTION & CUSTOMIZATION */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-indigo-50">
            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mb-6">Hero Selection</h3>
            <select 
              className="w-full px-6 py-4 rounded-2xl bg-indigo-50 border-2 border-transparent focus:bg-white focus:border-indigo-400 outline-none font-bold text-indigo-900 shadow-inner appearance-none transition-all"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">Select a Student...</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.admissionNo})</option>)}
            </select>
          </div>

          {isEditMode && isAdmin && (
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-indigo-50 space-y-8 animate-slide-up">
              <div>
                <h3 className="text-xs font-black text-amber-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                  <i className="fa-solid fa-palette"></i> Card Theme
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Theme HEX Color</label>
                    <div className="flex gap-2">
                      <input 
                        type="color"
                        className="w-12 h-12 rounded-xl border-none cursor-pointer p-0"
                        value={settings.themeColor}
                        onChange={e => saveSettings({...settings, themeColor: e.target.value})}
                      />
                      <input 
                        className="flex-1 px-5 py-3 bg-gray-50 rounded-xl font-bold border-2 border-transparent focus:border-indigo-400 outline-none uppercase"
                        value={settings.themeColor}
                        onChange={e => saveSettings({...settings, themeColor: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <button 
                      onClick={() => document.getElementById('sign-upload')?.click()}
                      className="py-3 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all"
                    >
                      Upload Card Seal
                    </button>
                    <input id="sign-upload" type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload('signature', e)} />
                  </div>
                </div>
              </div>

              {student && (
                <div className="pt-6 border-t border-indigo-50">
                  <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    <i className="fa-solid fa-user-pen"></i> Card Detail Override
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Hero Display Name</label>
                      <input 
                        className="w-full px-5 py-3 bg-gray-50 rounded-xl font-bold border-2 border-transparent focus:border-indigo-400 outline-none"
                        value={student.name}
                        onChange={e => setOverrides({...overrides, name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Grade</label>
                        <input 
                          className="w-full px-5 py-3 bg-gray-50 rounded-xl font-bold border-2 border-transparent focus:border-indigo-400 outline-none"
                          value={student.grade}
                          onChange={e => setOverrides({...overrides, grade: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Roll #</label>
                        <input 
                          className="w-full px-5 py-3 bg-gray-50 rounded-xl font-bold border-2 border-transparent focus:border-indigo-400 outline-none"
                          value={student.rollNo}
                          onChange={e => setOverrides({...overrides, rollNo: e.target.value})}
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => setOverrides({})}
                      className="w-full py-3 text-[9px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-600"
                    >
                      Reset Overrides
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* WORKSPACE: LIVE PREVIEW */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center py-12 bg-gray-100/50 rounded-[4rem] border-4 border-dashed border-gray-200 relative overflow-hidden">
          {student ? (
            <div id="id-card-printable-container" className="flex flex-col items-center gap-12 p-10 bg-transparent animate-slide-up">
              <div id="id-card-printable" className="flex flex-col xl:flex-row gap-12 print:m-0 print:p-0">
                
                {/* FRONT SIDE */}
                <div className="w-[340px] h-[520px] bg-white rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] overflow-hidden relative border-2 border-indigo-50 flex flex-col shrink-0">
                  
                  {/* Background Accents */}
                  <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
                     <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs><pattern id="id-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke={settings.themeColor} strokeWidth="1"/></pattern></defs>
                        <rect width="100%" height="100%" fill="url(#id-grid)" />
                     </svg>
                  </div>

                  <div className="h-44 p-6 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-500" style={{ backgroundColor: settings.themeColor }}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    
                    <div className="bg-white p-2 rounded-2xl border border-white/20 mb-3 relative z-10 shadow-xl overflow-hidden flex items-center justify-center w-14 h-14">
                        {settings.customLogo ? (
                          <img src={settings.customLogo} className="w-full h-full object-contain" alt="Custom Logo" />
                        ) : (
                          <i className="fa-solid fa-graduation-cap text-indigo-900 text-2xl"></i>
                        )}
                    </div>
                    <div className="text-center relative z-10">
                        <h2 className="text-white font-black text-xl leading-none uppercase tracking-tighter">{settings.schoolName}</h2>
                        <p className="text-amber-400 text-[8px] font-black uppercase tracking-[0.4em] mt-2">{settings.tagline}</p>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col items-center px-8 pt-4 pb-6 relative z-10">
                    <div className="relative -mt-20 mb-6">
                       <div className="w-40 h-40 rounded-[2.5rem] bg-white p-2 shadow-2xl relative z-10">
                          <div className="w-full h-full rounded-[1.8rem] bg-gray-50 overflow-hidden border-2 border-indigo-50 flex items-center justify-center group/photo">
                             {student.photo ? (
                               <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                             ) : (
                               <i className="fa-solid fa-user-astronaut text-6xl text-indigo-100"></i>
                             )}
                          </div>
                       </div>
                       <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-500 text-white rounded-2xl border-4 border-white flex items-center justify-center shadow-lg z-20">
                          <i className="fa-solid fa-shield-check"></i>
                       </div>
                    </div>

                    <h3 className="text-2xl font-black text-indigo-950 text-center leading-tight mb-1 uppercase tracking-tighter">{student.name}</h3>
                    <div className="px-5 py-1.5 rounded-full mb-10 border-2" style={{ borderColor: settings.themeColor + '20', backgroundColor: settings.themeColor + '05' }}>
                       <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: settings.themeColor }}>Class {student.grade} • Roll {student.rollNo}</span>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-y-6 gap-x-8 text-[10px] border-t border-indigo-50 pt-8">
                        <div className="space-y-1">
                           <p className="font-black text-gray-400 uppercase tracking-widest">Enrollment #</p>
                           <p className="font-black text-indigo-900">{student.admissionNo}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="font-black text-gray-400 uppercase tracking-widest">Birth Registry</p>
                           <p className="font-black text-indigo-900">{student.dob}</p>
                        </div>
                    </div>
                  </div>

                  <div className="h-20 bg-gray-50 border-t border-gray-100 flex items-center justify-between px-10">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=${student.id}`} className="w-full h-full grayscale" alt="ID QR" />
                         </div>
                         <div className="flex flex-col">
                            <p className="text-[7px] font-black text-gray-400 uppercase leading-none">Status</p>
                            <p className="text-[9px] font-black text-emerald-500 uppercase leading-none mt-1">Authorized</p>
                         </div>
                      </div>
                      <div className="text-right">
                         {settings.signature ? (
                           <img src={settings.signature} className="h-10 mx-auto mix-blend-multiply" alt="Seal" />
                         ) : (
                           <div className="h-1 w-24 bg-gray-200 mb-1"></div>
                         )}
                         <p className="text-[8px] font-black text-indigo-900 uppercase">Academy Seal</p>
                      </div>
                  </div>
                </div>

                {/* BACK SIDE */}
                <div className="w-[340px] h-[520px] rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] overflow-hidden relative p-10 flex flex-col text-white shrink-0 transition-colors duration-500" style={{ backgroundColor: settings.themeColor }}>
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-400"></div>
                  
                  <div className="flex-1 space-y-10 relative z-10 pt-4">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                           <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center border border-white/5"><i className="fa-solid fa-house-chimney-user text-amber-400 text-xs"></i></div>
                           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Parental Identity</h4>
                        </div>
                        <div className="pl-12">
                           <p className="font-black text-xl leading-tight text-white mb-1 uppercase tracking-tighter">{student.parentName}</p>
                           <p className="text-amber-400 text-xs font-bold tracking-widest">+91 {student.phone}</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-3 mb-4">
                           <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center border border-white/5"><i className="fa-solid fa-map-location-dot text-amber-400 text-xs"></i></div>
                           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Residence Address</h4>
                        </div>
                        <p className="pl-12 text-xs font-medium leading-relaxed italic opacity-70 line-clamp-4">
                           {student.address || 'Address verification pending in Academy archives for current academic session.'}
                        </p>
                      </div>

                      <div className="mt-auto bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-md">
                        <div className="flex items-center gap-2 mb-2">
                           <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                           <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-rose-200">Emergency Protocol</h4>
                        </div>
                        <p className="font-black text-2xl text-white tracking-tighter">{student.emergencyContact}</p>
                      </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-between relative z-10 opacity-30">
                      <div className="w-8 h-8 rounded-lg bg-white p-1">
                        {settings.customLogo && <img src={settings.customLogo} className="w-full h-full object-contain grayscale" />}
                      </div>
                      <p className="text-[7px] font-black uppercase tracking-[0.5em]">System ID: {student.id.slice(0,8)}</p>
                  </div>

                  {/* Aesthetic patterns */}
                  <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center opacity-30 py-40 select-none">
              <div className="w-40 h-40 bg-white rounded-[4rem] shadow-inner flex items-center justify-center text-indigo-200 text-8xl mx-auto mb-10 ring-8 ring-white animate-pulse">
                <i className="fa-solid fa-passport"></i>
              </div>
              <p className="text-4xl font-black text-indigo-900 tracking-tighter uppercase">Preview Engine</p>
              <p className="font-bold text-indigo-400 mt-3 italic max-w-sm mx-auto">Initialize a Hero from the registry to start the high-fidelity rendering process.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #id-card-printable, #id-card-printable * { visibility: visible; }
          #id-card-printable { position: absolute; left: 0; top: 0; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 40px; }
          @page { size: auto; margin: 0; }
        }
        .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default ICardGenerator;
