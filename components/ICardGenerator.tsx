
import React, { useState, useRef } from 'react';
import { Student } from '../types';
import Logo from './Logo';

interface ICardGeneratorProps {
  students: Student[];
}

// Declare html2pdf for TypeScript
declare var html2pdf: any;

const ICardGenerator: React.FC<ICardGeneratorProps> = ({ students }) => {
  const [selectedId, setSelectedId] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const student = students.find(s => s.id === selectedId);

  const handlePrint = () => {
    window.print();
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
    <div className="space-y-8 animate-fade-in pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-indigo-900 tracking-tighter">Identity Management</h1>
          <p className="text-gray-500 font-medium italic">Generating premium security credentials for the Academy. 🪪</p>
        </div>
        {student && (
          <div className="flex flex-wrap gap-3">
            <button 
              disabled={isDownloading}
              onClick={handleDownloadPDF}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black shadow-xl shadow-indigo-100 transition-all flex items-center gap-3 transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <i className={`fa-solid ${isDownloading ? 'fa-spinner fa-spin' : 'fa-shield-halved'} text-xl`}></i>
              {isDownloading ? 'Encrypting...' : 'Export High-Res ID'}
            </button>
            <button 
              onClick={handlePrint}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[2rem] font-black shadow-xl shadow-emerald-100 transition-all flex items-center gap-3 transform hover:scale-105 active:scale-95"
            >
              <i className="fa-solid fa-print text-xl"></i>
              Direct Print
            </button>
          </div>
        )}
      </header>

      <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-indigo-50 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-indigo-400 uppercase tracking-widest ml-1">Select Active Student</label>
            <select 
              className="w-full px-6 py-4 rounded-2xl bg-indigo-50 border-2 border-transparent focus:bg-white focus:border-indigo-400 outline-none transition-all font-bold text-indigo-900 shadow-inner appearance-none"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">Choose a Hero...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.admissionNo})</option>
              ))}
            </select>
          </div>

          <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 relative overflow-hidden group">
            <div className="relative z-10">
               <h3 className="font-black text-amber-700 mb-4 flex items-center gap-3">
                 <i className="fa-solid fa-certificate text-xl"></i>
                 ID Standards
               </h3>
               <ul className="text-xs text-amber-800/80 space-y-4 font-bold leading-relaxed">
                 <li className="flex gap-2">
                    <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-[8px] shrink-0">A</span>
                    Vertical format: 54mm x 86mm (ISO/IEC 7810).
                 </li>
                 <li className="flex gap-2">
                    <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-[8px] shrink-0">B</span>
                    Includes dynamic GR Number & QR link.
                 </li>
                 <li className="flex gap-2">
                    <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-[8px] shrink-0">C</span>
                    Security pattern background for anti-forgery.
                 </li>
               </ul>
            </div>
            <i className="fa-solid fa-fingerprint absolute -bottom-6 -right-6 text-amber-100 text-8xl opacity-30 group-hover:scale-110 transition-transform"></i>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col items-center justify-center py-16 bg-gray-50/50 rounded-[4rem] border-4 border-dashed border-gray-100 relative overflow-hidden">
          {student ? (
            <div id="id-card-printable-container" className="flex flex-col items-center gap-12 p-10 bg-transparent animate-slide-up">
              <div id="id-card-printable" className="flex flex-col xl:flex-row gap-12 print:m-0 print:p-0">
                
                {/* PREMIER FRONT SIDE */}
                <div className="w-[340px] h-[520px] bg-white rounded-[2.5rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.15)] overflow-hidden relative border-2 border-indigo-50 flex flex-col shrink-0">
                  
                  {/* Security Wave Pattern Background */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                     <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs><pattern id="wave" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M0 20 Q10 10 20 20 T40 20" fill="none" stroke="#4F46E5" strokeWidth="1"/></pattern></defs>
                        <rect width="100%" height="100%" fill="url(#wave)" />
                     </svg>
                  </div>

                  {/* Header Section */}
                  <div className="h-40 bg-[#1e1b4b] p-6 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
                    
                    <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 mb-3 relative z-10 shadow-lg">
                        <Logo size="sm" className="brightness-200" />
                    </div>
                    <div className="text-center relative z-10">
                        <h2 className="text-white font-black text-xl leading-none uppercase tracking-tighter">Jannat Academy</h2>
                        <div className="flex items-center justify-center gap-2 mt-1">
                           <div className="h-[1px] w-4 bg-amber-400"></div>
                           <p className="text-amber-400 text-[9px] font-black uppercase tracking-[0.3em]">Excellence Defined</p>
                           <div className="h-[1px] w-4 bg-amber-400"></div>
                        </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 flex flex-col items-center px-8 pt-4 pb-6 relative z-10">
                    
                    {/* Floating Profile Photo */}
                    <div className="relative -mt-16 mb-6">
                       <div className="w-36 h-36 rounded-full bg-white p-1.5 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.3)] relative z-10">
                          <div className="w-full h-full rounded-full bg-gray-50 overflow-hidden border-2 border-indigo-50 flex items-center justify-center">
                             {student.photo ? (
                               <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                             ) : (
                               <i className="fa-solid fa-user-ninja text-5xl text-indigo-100"></i>
                             )}
                          </div>
                       </div>
                       {/* Identity Verification Mark */}
                       <div className="absolute bottom-1 right-1 w-10 h-10 bg-emerald-500 text-white rounded-full border-4 border-white flex items-center justify-center text-xs shadow-lg z-20">
                          <i className="fa-solid fa-check"></i>
                       </div>
                    </div>

                    <h3 className="text-2xl font-black text-indigo-950 text-center leading-tight mb-1">{student.name}</h3>
                    <div className="inline-flex items-center bg-indigo-50 px-4 py-1.5 rounded-full mb-8">
                       <span className="text-indigo-600 text-[10px] font-black uppercase tracking-widest">GRADE {student.grade} STANDARD</span>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-y-4 gap-x-6 text-[10px]">
                        <div className="space-y-1">
                           <p className="font-black text-gray-400 uppercase tracking-widest">Admission No</p>
                           <p className="font-black text-indigo-900 border-b border-indigo-100 pb-1">{student.admissionNo}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="font-black text-gray-400 uppercase tracking-widest">Roll Number</p>
                           <p className="font-black text-indigo-900 border-b border-indigo-100 pb-1">{student.rollNo}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="font-black text-gray-400 uppercase tracking-widest">GR Number</p>
                           <p className="font-black text-amber-600 border-b border-amber-100 pb-1">{student.grNo || 'GR-PENDING'}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="font-black text-gray-400 uppercase tracking-widest">DOB</p>
                           <p className="font-black text-indigo-900 border-b border-indigo-100 pb-1">{student.dob}</p>
                        </div>
                    </div>
                  </div>

                  {/* Vertical Aesthetic Barcode Footer */}
                  <div className="h-16 bg-gray-50 border-t border-gray-100 flex items-center justify-between px-8">
                      <div className="flex gap-0.5 items-center">
                         {[1,3,1,2,4,1,3,2,1,4,2].map((w,i) => (
                           <div key={i} className="bg-gray-300 h-6" style={{ width: `${w}px` }}></div>
                         ))}
                         <span className="text-[7px] font-black text-gray-300 ml-2 uppercase">Official Doc</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <div className="text-right">
                            <p className="text-[7px] font-black text-gray-400 uppercase leading-none">Security Issued</p>
                            <p className="text-[8px] font-black text-indigo-900 leading-none mt-0.5">MARCH 2024</p>
                         </div>
                         <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg p-1">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=${student.id}`} className="w-full h-full grayscale" alt="ID QR" />
                         </div>
                      </div>
                  </div>
                </div>

                {/* PREMIER BACK SIDE */}
                <div className="w-[340px] h-[520px] bg-[#1e1b4b] rounded-[2.5rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.15)] overflow-hidden relative p-10 flex flex-col text-white shrink-0">
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-indigo-400 to-purple-400"></div>
                  
                  <div className="flex-1 space-y-8 relative z-10">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                           <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center"><i className="fa-solid fa-users-rays text-amber-400 text-xs"></i></div>
                           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Parental Information</h4>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                           <p className="font-black text-lg leading-tight text-white mb-1">{student.parentName}</p>
                           <p className="text-indigo-300 text-xs font-bold tracking-widest">{student.phone}</p>
                        </div>
                      </div>

                      {student.aadharNo && (
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                             <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center"><i className="fa-solid fa-id-card text-amber-400 text-xs"></i></div>
                             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">UIDAI Registry</h4>
                          </div>
                          <p className="font-black text-xl text-amber-300 tracking-[0.25em] ml-2">{student.aadharNo.match(/.{1,4}/g)?.join(' ')}</p>
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-3 mb-3">
                           <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center"><i className="fa-solid fa-location-dot text-amber-400 text-xs"></i></div>
                           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Official Residence</h4>
                        </div>
                        <p className="text-xs font-medium leading-relaxed italic opacity-80 px-2 line-clamp-3">
                           {student.address || 'Formal address verification is currently pending in Academy archives.'}
                        </p>
                      </div>

                      <div className="bg-rose-500/10 border-l-4 border-rose-500 p-5 rounded-r-2xl">
                        <div className="flex items-center gap-2 mb-2">
                           <i className="fa-solid fa-circle-exclamation text-rose-500 animate-pulse"></i>
                           <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-200">Emergency Protocol</h4>
                        </div>
                        <p className="font-black text-2xl text-white tracking-tighter">{student.emergencyContact}</p>
                      </div>
                  </div>

                  <div className="mt-auto pt-8 border-t border-white/10 flex items-center justify-between relative z-10">
                      <div className="flex flex-col">
                        <div className="h-10 flex items-center justify-start mb-2">
                           <div className="w-24 h-px bg-white/20 mb-2"></div>
                           <p className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-300">ADMIN SEAL</p>
                        </div>
                      </div>
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-2xl relative">
                        <Logo size="sm" className="opacity-80 scale-110" />
                        <div className="absolute inset-0 border-4 border-dashed border-indigo-200 rounded-full animate-spin-slow opacity-20"></div>
                      </div>
                  </div>

                  {/* Decorative Background Mark */}
                  <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
                  <div className="absolute top-[20%] left-[-10%] w-40 h-40 bg-purple-500/5 rounded-full blur-3xl"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center opacity-30 select-none">
              <div className="w-36 h-36 bg-white rounded-[3.5rem] shadow-inner flex items-center justify-center text-gray-200 text-7xl mx-auto mb-10 ring-8 ring-white/50 animate-pulse">
                <i className="fa-solid fa-id-badge"></i>
              </div>
              <p className="text-3xl font-black text-indigo-900 tracking-tighter">Identity Preview</p>
              <p className="font-bold text-indigo-400 mt-2 italic max-w-sm mx-auto">Please select a student hero from the registry to initialize the credential engine.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #id-card-printable, #id-card-printable * { visibility: visible; }
          #id-card-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 40px;
          }
          @page { size: auto; margin: 0; }
        }
        .animate-spin-slow { animation: spin 20s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-slide-up { animation: slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default ICardGenerator;
