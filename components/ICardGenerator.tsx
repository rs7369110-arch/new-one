
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Student, UserRole, User, SchoolBranding } from '../types';
import Logo from './Logo';
import { storage, DB_KEYS } from '../db';

interface ICardGeneratorProps {
  students: Student[];
  user: User;
  branding: SchoolBranding;
}

const ID_SETTINGS_KEY = 'edu_id_card_custom_settings_v4';

interface ElementLayout {
  x: number;
  y: number;
  scale: number;
  visible: boolean;
  fontSize?: number;
}

interface IDLayoutConfig {
  logo: ElementLayout;
  schoolName: ElementLayout;
  tagline: ElementLayout;
  photo: ElementLayout;
  studentName: ElementLayout;
  metaData: ElementLayout;
  parentName: ElementLayout;
  phone: ElementLayout;
  address: ElementLayout;
  dobInfo: ElementLayout;
  admissionInfo: ElementLayout;
  qrCode: ElementLayout;
  signature: ElementLayout;
  footer: ElementLayout;
}

interface IDSettings {
  schoolName: string;
  tagline: string;
  themeColor: string;
  customLogo: string | null;
  signature: string | null;
  layout: IDLayoutConfig;
}

const DEFAULT_LAYOUT: IDLayoutConfig = {
  logo: { x: 0, y: 0, scale: 1, visible: true },
  schoolName: { x: 0, y: 0, scale: 1, visible: true, fontSize: 18 },
  tagline: { x: 0, y: 0, scale: 1, visible: true, fontSize: 8 },
  photo: { x: 0, y: 0, scale: 1, visible: true },
  studentName: { x: 0, y: 0, scale: 1, visible: true, fontSize: 22 },
  metaData: { x: 0, y: 0, scale: 1, visible: true, fontSize: 10 },
  parentName: { x: 0, y: 0, scale: 1, visible: true, fontSize: 10 },
  phone: { x: 0, y: 0, scale: 1, visible: true, fontSize: 10 },
  address: { x: 0, y: 0, scale: 1, visible: true, fontSize: 9 },
  dobInfo: { x: 0, y: 0, scale: 1, visible: true, fontSize: 9 },
  admissionInfo: { x: 0, y: 0, scale: 1, visible: true, fontSize: 9 },
  qrCode: { x: 0, y: 0, scale: 1, visible: true },
  signature: { x: 0, y: 0, scale: 1, visible: true },
  footer: { x: 0, y: 0, scale: 1, visible: true }
};

// Declare html2pdf for TypeScript
declare var html2pdf: any;

const ICardGenerator: React.FC<ICardGeneratorProps> = ({ students, user, branding }) => {
  const [selectedId, setSelectedId] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'IDENTITY' | 'LAYOUT'>('IDENTITY');
  const [selectedElement, setSelectedElement] = useState<keyof IDLayoutConfig | null>(null);
  
  const [settings, setSettings] = useState<IDSettings>(() => {
    const saved = storage.get<any>(ID_SETTINGS_KEY, {});
    return {
      schoolName: branding.name || 'Academy',
      tagline: branding.tagline || 'Excellence Defined',
      themeColor: branding.themeColor || '#1e1b4b',
      customLogo: branding.logo || null,
      signature: saved.signature || null,
      layout: saved.layout || DEFAULT_LAYOUT
    };
  });

  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      schoolName: branding.name,
      tagline: branding.tagline,
      customLogo: branding.logo
    }));
  }, [branding]);

  const isAdmin = user.role === UserRole.ADMIN;

  const displayStudents = useMemo(() => {
    if (selectedGrade) {
      return students.filter(s => s.grade === selectedGrade && s.status !== 'CANCELLED');
    }
    const single = students.find(s => s.id === selectedId);
    return single ? [single] : [];
  }, [students, selectedGrade, selectedId]);

  const updateSettings = (updates: Partial<IDSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    storage.set(ID_SETTINGS_KEY, newSettings);
  };

  const updateElement = (el: keyof IDLayoutConfig, updates: Partial<ElementLayout>) => {
    const newLayout = { 
      ...settings.layout, 
      [el]: { ...settings.layout[el], ...updates } 
    };
    updateSettings({ layout: newLayout });
  };

  const handleFileUpload = (type: 'logo' | 'signature', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'logo') updateSettings({ customLogo: base64 });
        else updateSettings({ signature: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('id-card-printable-container');
    if (!element || displayStudents.length === 0) return;
    
    setIsDownloading(true);
    const fileName = selectedGrade 
      ? `Class_${selectedGrade}_ID_Batch.pdf` 
      : `${displayStudents[0].name.replace(/\s+/g, '_')}_ID.pdf`;

    const opt = {
      margin: [5, 5, 5, 5],
      filename: fileName,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } finally {
      setIsDownloading(false);
    }
  };

  const getTransform = (el: keyof IDLayoutConfig) => {
    const l = settings.layout[el];
    if (!l) return { display: 'none' };
    return {
      transform: `translate(${l.x}px, ${l.y}px) scale(${l.scale})`,
      display: l.visible ? 'flex' : 'none',
      fontSize: l.fontSize ? `${l.fontSize}px` : undefined,
      transition: isEditMode ? 'none' : 'all 0.3s ease',
      zIndex: selectedElement === el ? 50 : 10
    };
  };

  const LayoutSlider = ({ label, value, min, max, onChange }: any) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
        <span className="text-[10px] font-black text-indigo-600">{value}</span>
      </div>
      <input 
        type="range" min={min} max={max} step={label === 'Scale' ? 0.05 : 1}
        className="w-full h-1.5 bg-indigo-50 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
      />
    </div>
  );

  const LabelValue = ({ label, value, elKey }: { label: string, value: string, elKey: keyof IDLayoutConfig }) => (
    <div 
      className={`flex flex-col gap-0.5 cursor-pointer hover:bg-indigo-50/50 rounded px-1 transition-all ${selectedElement === elKey ? 'ring-2 ring-indigo-400 bg-indigo-50' : ''}`}
      style={getTransform(elKey)}
      onClick={() => isEditMode && setSelectedElement(elKey)}
    >
      <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none">{label}</span>
      <span className="font-black text-indigo-950 uppercase leading-none">{value}</span>
    </div>
  );

  const CardFace = ({ student }: { student: Student }) => (
    <div className="w-[360px] h-[580px] bg-white rounded-[3rem] shadow-2xl overflow-hidden relative border-2 border-indigo-50 flex flex-col shrink-0 mb-10 break-inside-avoid">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="id-grid-master" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke={settings.themeColor} strokeWidth="0.5"/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#id-grid-master)" />
          </svg>
      </div>

      <div className="h-44 p-6 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-500" style={{ backgroundColor: settings.themeColor }}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10 transition-all cursor-pointer hover:ring-2 ring-indigo-400 rounded-lg p-1" style={getTransform('logo')} onClick={() => isEditMode && setSelectedElement('logo')}>
            {settings.customLogo ? <img src={settings.customLogo} className="w-14 h-14 object-contain" alt="Logo" /> : <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-950 text-2xl shadow-xl"><i className="fa-solid fa-graduation-cap"></i></div>}
        </div>
        <div className="text-center relative z-10 mt-3 space-y-1">
            <h2 className="text-white font-black uppercase tracking-tighter cursor-pointer hover:bg-white/10 px-2 rounded" style={getTransform('schoolName')} onClick={() => isEditMode && setSelectedElement('schoolName')}>{settings.schoolName}</h2>
            <p className="text-amber-400 font-black uppercase tracking-[0.4em] cursor-pointer hover:bg-white/10 px-2 rounded" style={getTransform('tagline')} onClick={() => isEditMode && setSelectedElement('tagline')}>{settings.tagline}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-8 pt-4 pb-6 relative z-10">
        <div className="relative -mt-20 mb-6 cursor-pointer hover:ring-2 ring-indigo-400 rounded-[2.5rem] p-1" style={getTransform('photo')} onClick={() => isEditMode && setSelectedElement('photo')}>
            <div className="w-36 h-36 rounded-[2.5rem] bg-white p-2 shadow-2xl relative z-10">
              <div className="w-full h-full rounded-[1.8rem] bg-gray-50 overflow-hidden border-2 border-indigo-50 flex items-center justify-center">
                  {student.photo ? <img src={student.photo} alt={student.name} className="w-full h-full object-cover" /> : <i className="fa-solid fa-user-astronaut text-6xl text-indigo-100"></i>}
              </div>
            </div>
        </div>
        <h3 className="font-black text-indigo-950 text-center leading-tight mb-2 uppercase tracking-tighter cursor-pointer hover:bg-indigo-50 rounded px-2" style={getTransform('studentName')} onClick={() => isEditMode && setSelectedElement('studentName')}>{student.name}</h3>
        <div className="flex flex-col items-center cursor-pointer hover:bg-indigo-50 rounded px-2 mb-6" style={getTransform('metaData')} onClick={() => isEditMode && setSelectedElement('metaData')}>
            <div className="px-5 py-1.5 rounded-full border-2" style={{ borderColor: settings.themeColor + '20', backgroundColor: settings.themeColor + '05' }}>
              <span className="font-black uppercase tracking-widest" style={{ color: settings.themeColor }}>Class {student.grade} • Roll {student.rollNo}</span>
            </div>
        </div>
        <div className="w-full space-y-4 pt-4 border-t border-indigo-50">
            <LabelValue label="Parent/Guardian" value={student.parentName || 'Not Recorded'} elKey="parentName" />
            <LabelValue label="Emergency Contact" value={`+91 ${student.phone}`} elKey="phone" />
            <div className={`flex flex-col gap-0.5 cursor-pointer hover:bg-indigo-50 rounded px-1 transition-all ${selectedElement === 'address' ? 'ring-2 ring-indigo-400 bg-indigo-50' : ''}`} style={getTransform('address')} onClick={() => isEditMode && setSelectedElement('address')}>
              <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none">Residential Address</span>
              <span className="font-bold text-gray-600 uppercase text-[9px] leading-tight line-clamp-2">{student.address || 'Address verification pending.'}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <LabelValue label="Date of Birth" value={student.dob} elKey="dobInfo" />
              <LabelValue label="Admission No" value={student.admissionNo} elKey="admissionInfo" />
            </div>
        </div>
      </div>

      <div className="h-28 bg-gray-50 border-t border-gray-100 flex items-center justify-between px-8 relative" style={getTransform('footer')} onClick={() => isEditMode && setSelectedElement('footer')}>
          <div className="flex items-center gap-4 cursor-pointer hover:bg-white rounded p-1" style={getTransform('qrCode')} onClick={() => isEditMode && setSelectedElement('qrCode')}>
            <div className="w-14 h-14 bg-white border border-gray-200 rounded-xl p-1.5 shadow-sm">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${student.id}`} className="w-full h-full grayscale" alt="QR" />
            </div>
          </div>
          <div className="text-right flex flex-col items-end cursor-pointer hover:bg-white rounded p-1" style={getTransform('signature')} onClick={() => isEditMode && setSelectedElement('signature')}>
            {settings.signature ? <img src={settings.signature} className="h-12 mix-blend-multiply" alt="Seal" /> : <div className="h-1 w-24 bg-gray-200 mb-1"></div>}
            <p className="text-[8px] font-black text-indigo-900 uppercase tracking-widest">Principal Seal</p>
          </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 bg-indigo-950 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-800/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="flex items-center gap-8 relative z-10">
           <div className="w-20 h-20 bg-white/10 rounded-[2.5rem] flex items-center justify-center text-4xl border border-white/10 shadow-xl backdrop-blur-md">
              <i className="fa-solid fa-id-card-clip text-indigo-400"></i>
           </div>
           <div>
             <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Identity Studio</h1>
             <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.6em] mt-3 italic opacity-80">Bulk Generation Engine v4.5</p>
           </div>
        </div>

        <div className="flex flex-wrap gap-4 relative z-10">
          {isAdmin && (
            <button 
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-10 py-4 rounded-[1.8rem] font-black shadow-xl transition-all flex items-center gap-3 transform hover:scale-105 active:scale-95 ${isEditMode ? 'bg-amber-400 text-amber-950' : 'bg-white/10 text-white border border-white/10'}`}
            >
              <i className={`fa-solid ${isEditMode ? 'fa-circle-check' : 'fa-wand-magic-sparkles'}`}></i>
              {isEditMode ? 'Save Blueprint' : 'Design Mode'}
            </button>
          )}
          {displayStudents.length > 0 && (
            <button 
              disabled={isDownloading}
              onClick={handleDownloadPDF}
              className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.8rem] font-black shadow-xl transition-all flex items-center gap-3 transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <i className={`fa-solid ${isDownloading ? 'fa-spinner fa-spin' : 'fa-file-pdf'} text-xl`}></i>
              {isDownloading ? 'Exporting...' : displayStudents.length > 1 ? `Export ${displayStudents.length} IDs` : 'Export Card'}
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR: SELECTION & LAYOUT */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-indigo-50 space-y-6">
            <div>
              <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Batch Selection</h3>
              <select 
                className="w-full px-6 py-4 rounded-2xl bg-indigo-50 border-2 border-transparent focus:bg-white focus:border-indigo-400 outline-none font-bold text-indigo-900 shadow-inner appearance-none transition-all"
                value={selectedGrade}
                onChange={(e) => { setSelectedGrade(e.target.value); setSelectedId(''); }}
              >
                <option value="">Choose a Class...</option>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n.toString()}>Grade {n} Registry</option>)}
              </select>
            </div>

            <div className="relative py-2">
               <div className="absolute inset-x-0 top-1/2 h-px bg-gray-100"></div>
               <span className="relative bg-white px-4 text-[8px] font-black text-gray-300 uppercase tracking-[0.5em] left-1/2 -translate-x-1/2">OR</span>
            </div>

            <div>
              <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Individual Look</h3>
              <select 
                className="w-full px-6 py-4 rounded-2xl bg-indigo-50 border-2 border-transparent focus:bg-white focus:border-indigo-400 outline-none font-bold text-indigo-900 shadow-inner appearance-none transition-all"
                value={selectedId}
                onChange={(e) => { setSelectedId(e.target.value); setSelectedGrade(''); }}
              >
                <option value="">Choose Student...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.admissionNo})</option>)}
              </select>
            </div>
          </div>

          {isEditMode && isAdmin && (
            <div className="bg-white rounded-[3rem] shadow-xl border border-indigo-50 overflow-hidden animate-slide-up sticky top-6">
              <div className="flex bg-gray-50 border-b border-indigo-50 p-2">
                 <button onClick={() => setActiveTab('IDENTITY')} className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'IDENTITY' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>Visuals</button>
                 <button onClick={() => setActiveTab('LAYOUT')} className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'LAYOUT' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>Pillars</button>
              </div>

              <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {activeTab === 'IDENTITY' ? (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Accent Theme</label>
                      <div className="flex gap-2">
                        <input type="color" className="w-12 h-12 rounded-xl border-none cursor-pointer p-0" value={settings.themeColor} onChange={e => updateSettings({ themeColor: e.target.value })} />
                        <input className="flex-1 px-5 py-3 bg-gray-50 rounded-xl font-bold border-2 border-transparent focus:border-indigo-400 outline-none uppercase" value={settings.themeColor} onChange={e => updateSettings({ themeColor: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-indigo-50">
                       <button onClick={() => document.getElementById('seal-upload')?.click()} className="w-full py-4 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all border-2 border-dashed border-emerald-100">Upload Registry Seal</button>
                       <input id="seal-upload" type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload('signature', e)} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-3">
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Element</label>
                       <select 
                         className="w-full px-5 py-3 bg-indigo-50 rounded-xl font-black text-xs text-indigo-900 outline-none"
                         value={selectedElement || ''}
                         onChange={e => setSelectedElement(e.target.value as any)}
                       >
                         <option value="">Choose Node...</option>
                         {Object.keys(settings.layout).map(key => <option key={key} value={key}>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</option>)}
                       </select>
                    </div>

                    {selectedElement ? (
                      <div className="space-y-6 p-6 bg-indigo-50/50 rounded-3xl animate-scale-in">
                        <LayoutSlider label="Horizontal (X)" value={settings.layout[selectedElement].x} min={-180} max={180} onChange={(v: number) => updateElement(selectedElement, { x: v })} />
                        <LayoutSlider label="Vertical (Y)" value={settings.layout[selectedElement].y} min={-350} max={350} onChange={(v: number) => updateElement(selectedElement, { y: v })} />
                        <LayoutSlider label="Scale" value={settings.layout[selectedElement].scale} min={0.1} max={4} onChange={(v: number) => updateElement(selectedElement, { scale: v })} />
                        {settings.layout[selectedElement].fontSize !== undefined && (
                          <LayoutSlider label="Font Size" value={settings.layout[selectedElement].fontSize} min={6} max={56} onChange={(v: number) => updateElement(selectedElement, { fontSize: v })} />
                        )}
                        <div className="flex items-center justify-between pt-4 border-t border-indigo-100">
                           <span className="text-[9px] font-black text-gray-400 uppercase">Visible</span>
                           <button onClick={() => updateElement(selectedElement, { visible: !settings.layout[selectedElement].visible })} className={`w-12 h-6 rounded-full relative transition-all ${settings.layout[selectedElement].visible ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.layout[selectedElement].visible ? 'right-1' : 'left-1'}`}></div>
                           </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-10 text-center opacity-30 border-2 border-dashed border-indigo-100 rounded-3xl">
                        <p className="text-[10px] font-black uppercase tracking-widest">Select element on card to design</p>
                      </div>
                    )}
                    
                    <button onClick={() => updateSettings({ layout: DEFAULT_LAYOUT })} className="w-full py-4 bg-rose-50 text-rose-500 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">Reset To Master Blueprint</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* INTERACTIVE WORKSPACE */}
        <div className="lg:col-span-8 flex flex-col items-center py-12 bg-gray-100/50 rounded-[4.5rem] border-4 border-dashed border-gray-200 relative overflow-hidden min-h-[850px]">
          {displayStudents.length > 0 ? (
            <div id="id-card-printable-container" className="flex flex-col items-center p-10 bg-transparent animate-slide-up w-full max-h-[85vh] overflow-y-auto custom-scrollbar">
              <div id="id-card-printable" className="flex flex-col items-center w-full">
                {displayStudents.map((s, idx) => (
                   <React.Fragment key={s.id}>
                      <CardFace student={s} />
                      {idx < displayStudents.length - 1 && <div className="html2pdf__page-break"></div>}
                   </React.Fragment>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center opacity-30 py-40 select-none">
              <div className="w-40 h-40 bg-white rounded-[4rem] shadow-inner flex items-center justify-center text-indigo-200 text-8xl mx-auto mb-10 ring-8 ring-white animate-pulse">
                <i className="fa-solid fa-passport"></i>
              </div>
              <p className="text-4xl font-black text-indigo-900 tracking-tighter uppercase">ID Designer Stage</p>
              <p className="font-bold text-indigo-400 mt-3 italic max-w-sm mx-auto">Choose a Class to generate a batch or a student to design a master template.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.1); border-radius: 10px; }
        @media print {
          body * { visibility: hidden; }
          #id-card-printable, #id-card-printable * { visibility: visible; }
          #id-card-printable { position: absolute; left: 0; top: 0; width: 100%; display: flex; flex-direction: column; align-items: center; }
          .html2pdf__page-break { display: block; page-break-before: always; }
          @page { size: portrait; margin: 0; }
        }
      `}</style>
    </div>
  );
};

export default ICardGenerator;
