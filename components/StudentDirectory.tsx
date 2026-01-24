
import React, { useState, useMemo } from 'react';
import { Student } from '../types';

interface StudentDirectoryProps {
  students: Student[];
  onSelectStudent?: (id: string) => void;
}

const StudentDirectory: React.FC<StudentDirectoryProps> = ({ students, onSelectStudent }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProfile, setActiveProfile] = useState<Student | null>(null);

  const results = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return students.filter(s => 
      s.name.toLowerCase().includes(query) || 
      s.admissionNo.toLowerCase().includes(query)
    ).slice(0, 50);
  }, [students, searchQuery]);

  const InfoRow = ({ label, value, icon }: { label: string, value?: string, icon: string }) => (
    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div>
        <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-sm font-bold text-white uppercase truncate">{value || '---'}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-indigo-950 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-3xl border border-white/20 shadow-xl backdrop-blur-md">
                <i className="fa-solid fa-address-book text-indigo-400"></i>
             </div>
             <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Hero Directory</h1>
          </div>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] italic">Instant Identity Lookup Node</p>
        </div>

        <div className="relative z-10 flex-1 max-w-xl group">
           <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-indigo-300 text-xl group-focus-within:text-white transition-colors"></i>
           <input 
             autoFocus
             className="w-full pl-16 pr-8 py-6 bg-white/5 border-2 border-white/10 rounded-[2.5rem] outline-none focus:bg-white/10 focus:border-indigo-400 font-black text-xl text-white shadow-2xl transition-all placeholder:text-indigo-800"
             placeholder="ENTER NAME OR ADM NO..."
             value={searchQuery}
             onChange={e => setSearchQuery(e.target.value)}
           />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {results.length > 0 ? results.map(s => (
          <div key={s.id} className="bg-white p-8 rounded-[3.5rem] shadow-xl border-b-[12px] border-indigo-600 flex flex-col group hover:shadow-2xl transition-all transform hover:-translate-y-2 card-3d">
             <div className="flex items-start justify-between mb-6">
                <div className="w-20 h-20 rounded-[2rem] bg-indigo-50 border-4 border-white shadow-lg overflow-hidden group-hover:scale-110 transition-transform">
                   {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-indigo-400 text-3xl">{s.name.charAt(0)}</div>}
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Roll Node</p>
                   <p className="text-2xl font-black text-indigo-950">#{s.rollNo}</p>
                </div>
             </div>

             <div className="flex-1">
                <h3 className="text-xl font-black text-indigo-950 leading-tight uppercase mb-4 line-clamp-2">{s.name}</h3>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                   <div className="p-3 bg-gray-50 rounded-2xl border border-indigo-50/50">
                      <p className="text-[8px] font-black text-gray-400 uppercase mb-0.5">Grade</p>
                      <p className="text-xs font-black text-indigo-600">CLASS {s.grade}-{s.section}</p>
                   </div>
                   <div className="p-3 bg-gray-50 rounded-2xl border border-indigo-50/50">
                      <p className="text-[8px] font-black text-gray-400 uppercase mb-0.5">Status</p>
                      <p className={`text-[9px] font-black uppercase ${s.status === 'APPROVED' ? 'text-emerald-500' : 'text-amber-500'}`}>{s.status}</p>
                   </div>
                </div>
             </div>

             <button 
               onClick={() => setActiveProfile(s)}
               className="w-full py-4 bg-indigo-50 text-indigo-600 rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-3 border-2 border-indigo-100"
             >
                <i className="fa-solid fa-id-card"></i>
                View Profile
             </button>
          </div>
        )) : (
          <div className="col-span-full py-40 text-center opacity-30 select-none">
             {searchQuery ? (
               <div className="animate-pulse">
                  <i className="fa-solid fa-user-ninja text-8xl mb-8"></i>
                  <p className="text-3xl font-black uppercase tracking-tighter">No Matches Found</p>
                  <p className="text-lg font-bold italic mt-2">Zero records match "{searchQuery}"</p>
               </div>
             ) : (
               <div>
                  <i className="fa-solid fa-keyboard text-8xl mb-8 text-indigo-200"></i>
                  <p className="text-3xl font-black text-indigo-950 uppercase tracking-tighter">Enter Identity Key</p>
                  <p className="text-lg font-bold text-indigo-400 italic mt-2">Start typing to search across the master academy registry.</p>
               </div>
             )}
          </div>
        )}
      </div>

      {/* FULL STUDENT PROFILE VIEW MODAL */}
      {activeProfile && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-[#0a0a0c]/98 backdrop-blur-3xl animate-fade-in" onClick={() => setActiveProfile(null)}></div>
          
          <div className="relative w-full max-w-6xl h-full max-h-[90vh] bg-indigo-950 rounded-[3rem] md:rounded-[5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/5 animate-scale-in flex flex-col lg:flex-row">
            
            {/* Left Sidebar: Hero Info */}
            <div className="w-full lg:w-[380px] bg-black/40 p-10 flex flex-col items-center shrink-0 border-r border-white/5">
              <div className="relative mb-8 group">
                <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse"></div>
                <div className="w-48 h-48 md:w-56 md:h-56 rounded-[3rem] bg-indigo-900/50 border-4 border-white/10 p-2 shadow-2xl relative z-10 overflow-hidden">
                  {activeProfile.photo ? (
                    <img src={activeProfile.photo} className="w-full h-full object-cover rounded-[2.5rem]" alt="Profile" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-8xl font-black text-indigo-300/20">{activeProfile.name.charAt(0)}</div>
                  )}
                </div>
              </div>

              <div className="text-center space-y-2 mb-10">
                <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none">{activeProfile.name}</h2>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="px-4 py-1 bg-indigo-500 text-white text-[9px] font-black rounded-full uppercase tracking-widest shadow-lg">GRADE {activeProfile.grade}-{activeProfile.section}</span>
                  <span className="px-4 py-1 bg-white/10 text-indigo-300 text-[9px] font-black rounded-full uppercase tracking-widest border border-white/5">ADM: {activeProfile.admissionNo}</span>
                </div>
              </div>

              <div className="w-full space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="p-5 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <i className="fa-solid fa-droplet text-rose-400"></i>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Blood Group</span>
                   </div>
                   <span className="font-black text-white uppercase">{activeProfile.bloodGroup || 'O+'}</span>
                </div>
                <div className="p-5 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <i className="fa-solid fa-venus-mars text-indigo-400"></i>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</span>
                   </div>
                   <span className="font-black text-white uppercase">{activeProfile.gender}</span>
                </div>
                <div className="p-5 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <i className="fa-solid fa-calendar-star text-amber-400"></i>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DOB</span>
                   </div>
                   <span className="font-black text-white uppercase">{activeProfile.dob}</span>
                </div>
              </div>

              <button 
                onClick={() => setActiveProfile(null)}
                className="w-full mt-8 py-5 bg-white/5 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all border border-white/5 active:scale-95"
              >
                Close Discovery
              </button>
            </div>

            {/* Right Main Content: Detailed Grid */}
            <div className="flex-1 p-8 md:p-14 overflow-y-auto custom-scrollbar bg-white/2 space-y-12">
               
               {/* Contact Block */}
               <section className="space-y-6">
                  <div className="flex items-center gap-3 border-l-4 border-indigo-500 pl-4">
                     <h3 className="text-xl font-black text-white uppercase tracking-tighter">Contact Node</h3>
                     <div className="h-px flex-1 bg-white/5"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <InfoRow label="Primary Mobile" value={`+91 ${activeProfile.phone}`} icon="fa-phone" />
                     <InfoRow label="Alt Contact" value={activeProfile.alternatePhone} icon="fa-mobile-retro" />
                     <InfoRow label="Email Identity" value={activeProfile.email} icon="fa-at" />
                     <InfoRow label="Aadhaar Key" value={activeProfile.aadharNo} icon="fa-fingerprint" />
                  </div>
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                     <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-3">Residential Terminal</p>
                     <p className="text-sm font-bold text-slate-300 uppercase leading-relaxed">{activeProfile.address}</p>
                  </div>
               </section>

               {/* Guardian Block */}
               <section className="space-y-6">
                  <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-4">
                     <h3 className="text-xl font-black text-white uppercase tracking-tighter">Guardian Protocol</h3>
                     <div className="h-px flex-1 bg-white/5"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <InfoRow label="Father's Name" value={activeProfile.fatherName} icon="fa-user-tie" />
                     <InfoRow label="Mother's Name" value={activeProfile.motherName} icon="fa-user-nurse" />
                     <InfoRow label="Guardian / Caretaker" value={activeProfile.guardianName} icon="fa-user-shield" />
                     <InfoRow label="Occupation" value={activeProfile.fatherOccupation} icon="fa-briefcase" />
                  </div>
               </section>

               {/* Academic Background */}
               <section className="space-y-6">
                  <div className="flex items-center gap-3 border-l-4 border-amber-500 pl-4">
                     <h3 className="text-xl font-black text-white uppercase tracking-tighter">Academic Registry</h3>
                     <div className="h-px flex-1 bg-white/5"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <InfoRow label="GR Number" value={activeProfile.grNo} icon="fa-database" />
                     <InfoRow label="Roll Number" value={activeProfile.rollNo} icon="fa-list-ol" />
                     <InfoRow label="Medium" value={activeProfile.medium} icon="fa-language" />
                     <InfoRow label="Admission Date" value={activeProfile.admissionDate} icon="fa-calendar-check" />
                     <InfoRow label="Previous School" value={activeProfile.prevSchoolName} icon="fa-school-flag" />
                     <InfoRow label="TC/LC Record" value={activeProfile.tcNo} icon="fa-file-signature" />
                  </div>
               </section>

               {/* Document Verification */}
               <section className="space-y-6">
                  <div className="flex items-center gap-3 border-l-4 border-rose-500 pl-4">
                     <h3 className="text-xl font-black text-white uppercase tracking-tighter">Document Checklist</h3>
                     <div className="h-px flex-1 bg-white/5"></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {['aadharCard', 'birthCert', 'transferCert', 'prevMarksheet'].map(doc => {
                        const isUploaded = activeProfile.documents?.[doc as keyof typeof activeProfile.documents];
                        return (
                          <div key={doc} className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${
                            isUploaded ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/5 border-rose-500/10 text-rose-400'
                          }`}>
                             <i className={`fa-solid ${isUploaded ? 'fa-circle-check' : 'fa-circle-xmark'} text-xl`}></i>
                             <span className="text-[7px] font-black uppercase tracking-widest text-center">{doc.replace(/([A-Z])/g, ' $1')}</span>
                          </div>
                        );
                     })}
                  </div>
               </section>

               {/* Medical / Special Info */}
               {(activeProfile.medicalConditions || activeProfile.allergies) && (
                 <section className="space-y-6">
                    <div className="flex items-center gap-3 border-l-4 border-purple-500 pl-4">
                       <h3 className="text-xl font-black text-white uppercase tracking-tighter">Health Log</h3>
                       <div className="h-px flex-1 bg-white/5"></div>
                    </div>
                    <div className="p-6 bg-rose-500/5 rounded-3xl border border-rose-500/10 space-y-4">
                       {activeProfile.medicalConditions && (
                         <div>
                            <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest mb-1">Conditions</p>
                            <p className="text-sm font-bold text-rose-100">{activeProfile.medicalConditions}</p>
                         </div>
                       )}
                       {activeProfile.allergies && (
                         <div>
                            <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest mb-1">Critical Allergies</p>
                            <p className="text-sm font-bold text-rose-100">{activeProfile.allergies}</p>
                         </div>
                       )}
                    </div>
                 </section>
               )}
            </div>

          </div>
        </div>
      )}

      <style>{`
        .card-3d {
          box-shadow: 0 20px 40px -10px rgba(79, 70, 229, 0.1);
        }
        .animate-scale-in { animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default StudentDirectory;
