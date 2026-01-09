
import React, { useState, useRef } from 'react';
import { Student } from '../types';
import Logo from './Logo';
import { storage } from '../db';

interface CertificateHubProps {
  students: Student[];
}

type CertType = 'BONAFIDE' | 'CHARACTER' | 'ATTEMPT' | null;

// Declare html2pdf for TypeScript
declare var html2pdf: any;

const SIGN_KEYS = {
  PRINCIPAL: 'digital_sign_principal',
  TEACHER: 'digital_sign_teacher'
};

const CertificateHub: React.FC<CertificateHubProps> = ({ students }) => {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [activeCert, setActiveCert] = useState<CertType>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const principalSign = storage.get(SIGN_KEYS.PRINCIPAL, '');
  const printableRef = useRef<HTMLDivElement>(null);

  const student = students.find(s => s.id === selectedStudentId);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!printableRef.current || !student || !activeCert) return;

    setIsDownloading(true);
    const element = printableRef.current;
    
    const opt = {
      margin: 0,
      filename: `${student.name.replace(/\s+/g, '_')}_${activeCert}_Certificate.pdf`,
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
      // Execute PDF generation
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const renderCertTemplate = () => {
    if (!student || !activeCert) return null;

    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const currentYear = new Date().getFullYear();
    const sessionRange = `${currentYear - 1}-${currentYear}`;

    let title = "";
    let content = null;

    switch (activeCert) {
      case 'BONAFIDE':
        title = "Bonafide Certificate";
        content = (
          <div className="text-xl leading-[2.5] text-gray-800 text-justify px-10">
            This is to certify that Master/Miss <strong className="text-indigo-900 border-b-2 border-indigo-200 pb-1 px-2">{student.name}</strong>, 
            Son/Daughter of <strong className="text-indigo-900 border-b-2 border-indigo-200 pb-1 px-2">{student.parentName}</strong>, 
            bearing Admission No. <strong className="text-indigo-900 border-b-2 border-indigo-200 pb-1 px-2">{student.admissionNo}</strong> 
            and GR Number <strong className="text-amber-600 border-b-2 border-amber-200 pb-1 px-2">{student.grNo || '---'}</strong>, 
            is a bonafide student of <strong className="text-indigo-900 uppercase">Digital Education</strong>. 
            He/She is currently studying in Grade <strong className="text-indigo-900 border-b-2 border-indigo-200 pb-1 px-2">{student.grade}th</strong> 
            during the Academic Session <strong className="text-indigo-900">{sessionRange}</strong>.
            <br /><br />
            To the best of our knowledge, his/her date of birth as per school records is <strong className="text-indigo-900 border-b-2 border-indigo-200 pb-1 px-2">{student.dob}</strong>.
          </div>
        );
        break;
      case 'CHARACTER':
        title = "Character Certificate";
        content = (
          <div className="text-xl leading-[2.5] text-gray-800 text-justify px-10">
            Certified that Master/Miss <strong className="text-indigo-900 border-b-2 border-indigo-200 pb-1 px-2">{student.name}</strong>, 
            GR No. <strong className="text-amber-600 border-b-2 border-amber-200 pb-1 px-2">{student.grNo || '---'}</strong>, 
            has been a regular student of this Academy from Grade 1 to <strong className="text-indigo-900 border-b-2 border-indigo-200 pb-1 px-2">{student.grade}th</strong>. 
            During his/her tenure at <strong className="text-indigo-900">Digital Education</strong>, 
            his/her conduct and character have been found to be <strong className="text-emerald-600 border-b-2 border-emerald-200 pb-1 px-2">EXCELLENT</strong>.
            <br /><br />
            He/She bears a good moral character and possesses a disciplined academic attitude. We wish him/her a very bright and prosperous future in all upcoming endeavors.
          </div>
        );
        break;
      case 'ATTEMPT':
        title = "Attempt Certificate";
        content = (
          <div className="text-xl leading-[2.5] text-gray-800 text-justify px-10">
            This is to certify that Master/Miss <strong className="text-indigo-900 border-b-2 border-indigo-200 pb-1 px-2">{student.name}</strong>, 
            GR No. <strong className="text-amber-600 border-b-2 border-amber-200 pb-1 px-2">{student.grNo || '---'}</strong>, 
            Roll No. <strong className="text-indigo-900 border-b-2 border-indigo-200 pb-1 px-2">{student.rollNo}</strong>, 
            has successfully attempted and passed the Grade <strong className="text-indigo-900 border-b-2 border-indigo-200 pb-1 px-2">{student.grade}th</strong> Examination 
            held in March <strong className="text-indigo-900">{currentYear}</strong> in his/her <strong className="text-indigo-900">FIRST ATTEMPT</strong>.
            <br /><br />
            He/She has secured a satisfactory aggregate score as per the Academy's grading standards and is eligible for promotion to the next academic level.
          </div>
        );
        break;
    }

    return (
      <div 
        id="certs-hub-printable"
        ref={printableRef}
        className="bg-white w-[210mm] min-h-[297mm] mx-auto p-12 relative shadow-2xl overflow-hidden border-[15px] border-double border-indigo-100"
      >
        {/* Certificate Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none w-[500px]">
           <Logo size="lg" className="w-full" />
        </div>

        {/* Ornate Corner Decorations */}
        <div className="absolute top-5 left-5 w-24 h-24 border-t-4 border-l-4 border-amber-400 opacity-20"></div>
        <div className="absolute top-5 right-5 w-24 h-24 border-t-4 border-r-4 border-amber-400 opacity-20"></div>
        <div className="absolute bottom-5 left-5 w-24 h-24 border-b-4 border-l-4 border-amber-400 opacity-20"></div>
        <div className="absolute bottom-5 right-5 w-24 h-24 border-b-4 border-r-4 border-amber-400 opacity-20"></div>

        <div className="relative z-10 flex flex-col items-center">
           <Logo size="lg" className="mb-6 drop-shadow-xl" />
           <h1 className="text-5xl font-black text-indigo-900 tracking-tighter uppercase mb-2">Digital Education</h1>
           <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em] bg-indigo-50 px-8 py-2 rounded-full mb-10">Official Academic Secretariat</p>
           
           <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-16"></div>

           <h2 className="text-4xl font-serif text-amber-600 italic mb-16 underline underline-offset-8 decoration-amber-200">{title}</h2>

           {content}

           <div className="w-full grid grid-cols-2 mt-40 px-10">
              <div className="text-left">
                 <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Date of Issue</p>
                 <p className="font-bold text-gray-800 text-lg border-b border-gray-100 pb-2 w-fit pr-10">{today}</p>
                 <div className="mt-8 flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-100/30 flex items-center justify-center p-3 grayscale opacity-30">
                       <Logo size="sm" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-gray-300 tracking-[0.3em]">Office of<br/>Secretariat</p>
                 </div>
              </div>

              <div className="text-right flex flex-col items-end">
                 <div className="h-24 flex items-center justify-center mb-4 overflow-hidden relative w-64">
                    {principalSign ? (
                      <img src={principalSign} className="max-h-full mix-blend-multiply" alt="Principal Sign" />
                    ) : (
                      <div className="text-gray-300 italic text-xs font-black uppercase tracking-widest">Awaiting Principal Seal</div>
                    )}
                 </div>
                 <div className="w-64 h-0.5 bg-indigo-900 mb-2"></div>
                 <p className="text-lg font-black text-indigo-950 uppercase tracking-tighter">Authorized Signature</p>
                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mt-1">Principal Office</p>
              </div>
           </div>
        </div>

        {/* Anti-Forgery Hologram Dot */}
        <div className="absolute bottom-10 left-10 w-12 h-12 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full opacity-40 shadow-xl flex items-center justify-center text-white text-[8px] font-black text-center p-1">
           GENUINE<br/>DOC
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-indigo-900 tracking-tighter">Certificate Factory</h1>
          <p className="text-amber-600 font-medium italic">Generate formal certifications for your students. 📜</p>
        </div>
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center text-3xl shadow-xl shadow-amber-50">
          <i className="fa-solid fa-award"></i>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-indigo-50">
              <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                 <i className="fa-solid fa-user-graduate"></i> Step 1: Select Student
              </h3>
              <select 
                className="w-full px-6 py-4 rounded-2xl bg-indigo-50 border-2 border-transparent focus:bg-white focus:border-indigo-400 outline-none font-bold text-indigo-900 transition-all shadow-inner"
                value={selectedStudentId}
                onChange={(e) => { setSelectedStudentId(e.target.value); setActiveCert(null); }}
              >
                <option value="">Search Hero Registry...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.admissionNo})</option>)}
              </select>
           </div>

           {selectedStudentId && (
              <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-indigo-50 animate-slide-up">
                 <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                    <i className="fa-solid fa-scroll"></i> Step 2: Choose Document
                 </h3>
                 <div className="space-y-4">
                    <button 
                      onClick={() => setActiveCert('BONAFIDE')}
                      className={`w-full py-5 rounded-[1.5rem] font-black text-sm flex items-center gap-4 px-6 transition-all ${
                        activeCert === 'BONAFIDE' ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'bg-gray-50 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
                      }`}
                    >
                       <i className="fa-solid fa-id-badge text-xl"></i>
                       Bonafide Certificate
                    </button>
                    <button 
                      onClick={() => setActiveCert('CHARACTER')}
                      className={`w-full py-5 rounded-[1.5rem] font-black text-sm flex items-center gap-4 px-6 transition-all ${
                        activeCert === 'CHARACTER' ? 'bg-emerald-600 text-white shadow-xl scale-105' : 'bg-gray-50 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600'
                      }`}
                    >
                       <i className="fa-solid fa-shield-heart text-xl"></i>
                       Character Certificate
                    </button>
                    <button 
                      onClick={() => setActiveCert('ATTEMPT')}
                      className={`w-full py-5 rounded-[1.5rem] font-black text-sm flex items-center gap-4 px-6 transition-all ${
                        activeCert === 'ATTEMPT' ? 'bg-amber-600 text-white shadow-xl scale-105' : 'bg-gray-50 text-gray-500 hover:bg-amber-50 hover:text-amber-600'
                      }`}
                    >
                       <i className="fa-solid fa-medal text-xl"></i>
                       Attempt Certificate
                    </button>
                 </div>
              </div>
           )}

           <div className="p-10 bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                 <h4 className="text-xl font-black mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-circle-info text-amber-400"></i>
                    Formal Registry Tips
                 </h4>
                 <ul className="space-y-4 text-xs font-bold text-indigo-200 leading-relaxed">
                    <li className="flex gap-3">
                       <span className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-[8px] font-black shrink-0">1</span>
                       Ensure digital signatures are uploaded in Marksheet Settings.
                    </li>
                    <li className="flex gap-3">
                       <span className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-[8px] font-black shrink-0">2</span>
                       Download official PDF using the floating action button.
                    </li>
                 </ul>
              </div>
              <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
           </div>
        </div>

        <div className="lg:col-span-2 min-h-[600px] flex flex-col items-center justify-center bg-gray-50/50 rounded-[4rem] border-4 border-dashed border-gray-100 p-8 relative overflow-hidden">
           {activeCert && student ? (
              <div className="animate-slide-up transform scale-[0.6] sm:scale-[0.8] lg:scale-100 origin-top">
                 {renderCertTemplate()}
              </div>
           ) : (
              <div className="text-center opacity-30 select-none">
                 <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-7xl mx-auto mb-8 shadow-inner ring-8 ring-white/50">
                    <i className="fa-solid fa-scroll"></i>
                 </div>
                 <p className="text-3xl font-black text-indigo-900 tracking-tighter">Document Preview Stage</p>
                 <p className="font-bold text-indigo-400 mt-2 italic max-w-sm mx-auto">Select a student and certificate type to generate the formal academy record.</p>
              </div>
           )}

           {activeCert && student && (
             <div className="fixed bottom-10 right-10 flex flex-col sm:flex-row gap-4 animate-slide-up z-[50] print:hidden">
                <button 
                  disabled={isDownloading}
                  onClick={handleDownloadPDF}
                  className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-2xl shadow-indigo-200 transform hover:scale-110 active:scale-95 transition-all flex items-center justify-center gap-4 text-lg min-w-[240px] disabled:opacity-50"
                >
                   <i className={`fa-solid ${isDownloading ? 'fa-spinner fa-spin' : 'fa-file-pdf'} text-xl`}></i>
                   {isDownloading ? 'Sealing PDF...' : 'Download Official PDF'}
                </button>
                <button 
                  onClick={handlePrint}
                  className="px-10 py-5 bg-emerald-600 text-white rounded-[2rem] font-black shadow-2xl shadow-emerald-200 transform hover:scale-110 active:scale-95 transition-all flex items-center justify-center gap-4 text-lg"
                >
                   <i className="fa-solid fa-print text-xl"></i>
                   Print Document
                </button>
             </div>
           )}
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #certs-hub-printable, #certs-hub-printable * { visibility: visible; }
          .print\\:hidden { display: none !important; }
          @page { size: portrait; margin: 0; }
          main { padding: 0 !important; margin: 0 !important; }
        }
        .animate-slide-up { animation: slideUp 0.5s ease-out forwards; }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default CertificateHub;
