import React, { useState } from 'react';
import { CustomProfileTemplate, Student } from '../types';

interface CustomProfileBuilderProps {
  templates: CustomProfileTemplate[];
  onUpdateTemplates: (templates: CustomProfileTemplate[]) => void;
  students: Student[];
}

declare var html2pdf: any;

const CustomProfileBuilder: React.FC<CustomProfileBuilderProps> = ({ templates, onUpdateTemplates, students }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingBlueprint, setEditingBlueprint] = useState<CustomProfileTemplate | null>(null);
  const [isEditingBlueprintStructure, setIsEditingBlueprintStructure] = useState(false);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedClassToImport, setSelectedClassToImport] = useState('1');

  // Modal Form State
  const [modalName, setModalName] = useState('');
  const [modalColumns, setModalColumns] = useState<string[]>([]);
  const [columnInput, setColumnInput] = useState('');

  const activeTemplate = templates.find(t => t.id === activeTemplateId);

  const openCreateModal = () => {
    setModalName('');
    setModalColumns(['Student Name', 'Roll No']);
    setEditingBlueprint(null);
    setIsCreating(true);
  };

  const openModifyModal = (e: React.MouseEvent, template: CustomProfileTemplate) => {
    e.stopPropagation();
    setEditingBlueprint(template);
    setModalName(template.name);
    setModalColumns([...template.columns]);
    setIsCreating(true);
  };

  const addColumnToModal = () => {
    if (columnInput.trim() && !modalColumns.includes(columnInput.trim())) {
      setModalColumns([...modalColumns, columnInput.trim()]);
      setColumnInput('');
    }
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBlueprint) {
      // Modify Existing
      const updatedTemplates = templates.map(t => {
        if (t.id === editingBlueprint.id) {
          // Identify deleted columns to clean data
          const newData = t.data.map(row => {
            const newRow: Record<string, string> = {};
            modalColumns.forEach(col => {
              newRow[col] = row[col] || '';
            });
            return newRow;
          });
          return { ...t, name: modalName, columns: modalColumns, data: newData };
        }
        return t;
      });
      onUpdateTemplates(updatedTemplates);
    } else {
      // Create New
      const newTemplate: CustomProfileTemplate = {
        id: Math.random().toString(36).substr(2, 9),
        name: modalName,
        columns: modalColumns,
        data: [],
        createdAt: new Date().toLocaleDateString()
      };
      onUpdateTemplates([...templates, newTemplate]);
    }
    setIsCreating(false);
  };

  const deleteTemplate = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("🚨 PERMANENT DELETE: Are you sure? This will erase the blueprint and ALL saved data within it!")) {
      onUpdateTemplates(templates.filter(t => t.id !== id));
      if (activeTemplateId === id) setActiveTemplateId(null);
    }
  };

  const addRow = () => {
    if (!activeTemplateId) return;
    const emptyRow = activeTemplate?.columns.reduce((acc, col) => ({ ...acc, [col]: '' }), {});
    const updated = templates.map(t => 
      t.id === activeTemplateId ? { ...t, data: [...t.data, emptyRow as any] } : t
    );
    onUpdateTemplates(updated);
  };

  const deleteRow = (idx: number) => {
    if (!activeTemplateId || !activeTemplate) return;
    const rowData = activeTemplate.data[idx];
    // Explicitly type iterator parameter to any to fix inference issue with Object.values on dynamic records
    const hasData = Object.values(rowData).some((val: any) => val.trim() !== '');
    
    if (hasData && !window.confirm("⚠️ This row has entries. Delete it anyway?")) return;

    const updated = templates.map(t => {
      if (t.id === activeTemplateId) {
        const newData = t.data.filter((_, i) => i !== idx);
        return { ...t, data: newData };
      }
      return t;
    });
    onUpdateTemplates(updated);
  };

  const importFromClass = () => {
    if (!activeTemplateId) return;
    const classStudents = students.filter(s => s.grade === selectedClassToImport);
    if (classStudents.length === 0) return alert(`No students in Class ${selectedClassToImport}`);

    if (window.confirm(`Import ${classStudents.length} students from Class ${selectedClassToImport}?`)) {
      const updated = templates.map(t => {
        if (t.id === activeTemplateId) {
          const newRows = classStudents.map(s => {
            const row: Record<string, string> = {};
            t.columns.forEach(col => {
              const lower = col.toLowerCase();
              if (lower.includes('name')) row[col] = s.name;
              else if (lower.includes('roll')) row[col] = s.rollNo;
              else if (lower.includes('adm')) row[col] = s.admissionNo;
              else row[col] = '';
            });
            return row;
          });
          return { ...t, data: [...t.data, ...newRows] };
        }
        return t;
      });
      onUpdateTemplates(updated);
    }
  };

  const handleCellChange = (rowIndex: number, colName: string, value: string) => {
    if (!activeTemplateId) return;
    const updated = templates.map(t => {
      if (t.id === activeTemplateId) {
        const newData = [...t.data];
        newData[rowIndex] = { ...newData[rowIndex], [colName]: value };
        return { ...t, data: newData };
      }
      return t;
    });
    onUpdateTemplates(updated);
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('custom-profile-export-area');
    if (!element) return;
    setIsExporting(true);
    const opt = {
      margin: 10,
      filename: `Academy_Profile_${activeTemplate?.name}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    try {
      await html2pdf().set(opt).from(element).save();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-indigo-900 tracking-tighter uppercase">Custom Profile Factory</h1>
          <p className="text-indigo-500 font-medium italic">Manage and modify academy data structures. 🛠️</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[2rem] font-black shadow-xl transform hover:scale-105 transition-all flex items-center gap-3"
        >
          <i className="fa-solid fa-plus-circle"></i>
          Design New Profile
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Templates List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] ml-4">Blueprint Library</h3>
          {templates.map(t => (
            <div 
              key={t.id}
              onClick={() => setActiveTemplateId(t.id)}
              className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all group relative overflow-hidden ${
                activeTemplateId === t.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' : 'bg-white border-indigo-50 text-indigo-900 hover:border-indigo-200'
              }`}
            >
              <h4 className="font-black text-lg leading-tight mb-1">{t.name}</h4>
              <p className={`text-[10px] font-bold ${activeTemplateId === t.id ? 'text-indigo-200' : 'text-indigo-300'}`}>{t.columns.length} Active Pillars</p>
              
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={(e) => openModifyModal(e, t)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    activeTemplateId === t.id ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-indigo-50 text-indigo-500 opacity-0 group-hover:opacity-100'
                  }`}
                  title="Modify Blueprint Structure"
                >
                  <i className="fa-solid fa-pen-to-square text-[10px]"></i>
                </button>
                <button 
                  onClick={(e) => deleteTemplate(e, t.id)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    activeTemplateId === t.id ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-rose-50 text-rose-500 opacity-0 group-hover:opacity-100'
                  }`}
                  title="Delete Profile"
                >
                  <i className="fa-solid fa-trash-can text-[10px]"></i>
                </button>
              </div>
            </div>
          ))}
          {templates.length === 0 && (
            <div className="p-10 text-center bg-indigo-50/50 rounded-[2.5rem] border-2 border-dashed border-indigo-100 opacity-50">
              <i className="fa-solid fa-layer-group text-3xl mb-4 text-indigo-200"></i>
              <p className="text-xs font-black text-indigo-300 uppercase">No Blueprints yet</p>
            </div>
          )}
        </div>

        {/* Workspace */}
        <div className="lg:col-span-3">
          {activeTemplate ? (
            <div className="bg-white rounded-[3.5rem] shadow-2xl border border-indigo-50 overflow-hidden animate-slide-up flex flex-col">
              <div className="p-10 bg-indigo-50/50 border-b border-indigo-100 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg"><i className="fa-solid fa-blueprint"></i></span>
                    <h2 className="text-3xl font-black text-indigo-950 uppercase">{activeTemplate.name}</h2>
                  </div>
                  <p className="text-[10px] font-black text-indigo-400 mt-2 uppercase tracking-widest italic">Data Sheet Size: {activeTemplate.data.length} Rows</p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <div className="flex bg-white p-1 rounded-2xl border border-indigo-100 items-center shadow-sm">
                    <select 
                      className="bg-transparent px-4 py-2 font-black text-xs text-indigo-600 outline-none"
                      value={selectedClassToImport}
                      onChange={e => setSelectedClassToImport(e.target.value)}
                    >
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n.toString()}>Class {n}</option>)}
                    </select>
                    <button 
                      onClick={importFromClass}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all"
                    >
                      Import Students
                    </button>
                  </div>
                  <button onClick={addRow} className="px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs hover:bg-black transition-all flex items-center gap-2 shadow-lg">
                    <i className="fa-solid fa-user-plus"></i> New Row
                  </button>
                  <button onClick={handleExportPDF} className="px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg">
                    <i className={`fa-solid ${isExporting ? 'fa-spinner fa-spin' : 'fa-file-export'}`}></i> Export PDF
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto" id="custom-profile-export-area">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-indigo-950 text-white text-[10px] font-black uppercase tracking-widest">
                      <th className="px-4 py-5 w-12 text-center border-r border-white/10">#</th>
                      {activeTemplate.columns.map(col => (
                        <th key={col} className="px-8 py-5 border-r border-white/10">{col}</th>
                      ))}
                      <th className="px-4 py-5 w-12 text-center print:hidden">Del</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-50">
                    {activeTemplate.data.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-4 py-2 text-center font-black text-[10px] text-indigo-300 border-r border-indigo-50">{rIdx + 1}</td>
                        {activeTemplate.columns.map(col => (
                          <td key={col} className="px-2 py-2">
                            <input 
                              className="w-full px-4 py-3 bg-transparent border-2 border-transparent hover:border-indigo-100 focus:bg-white focus:border-indigo-400 outline-none rounded-xl font-bold text-indigo-900 transition-all"
                              value={row[col]}
                              placeholder={`Enter ${col}...`}
                              onChange={e => handleCellChange(rIdx, col, e.target.value)}
                            />
                          </td>
                        ))}
                        <td className="px-4 py-2 text-center print:hidden">
                          <button 
                            onClick={() => deleteRow(rIdx)}
                            className="w-8 h-8 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
                            title="Delete Entry"
                          >
                            <i className="fa-solid fa-trash-can text-[10px]"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {activeTemplate.data.length === 0 && (
                      <tr>
                        <td colSpan={activeTemplate.columns.length + 2} className="py-32 text-center">
                          <p className="font-black text-gray-300 italic uppercase">Workspace ready. Build your registry.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-40 bg-white/50 rounded-[5rem] border-4 border-dashed border-indigo-50 text-center">
              <div className="w-40 h-40 bg-white rounded-full shadow-inner flex items-center justify-center text-indigo-100 text-7xl mb-10 ring-8 ring-white">
                <i className="fa-solid fa-puzzle-piece"></i>
              </div>
              <h3 className="text-3xl font-black text-indigo-900 tracking-tighter uppercase">Blueprint Station</h3>
              <p className="text-indigo-400 max-w-sm mt-2 font-medium italic">Create a new structure or modify an existing one from the library to start managing data.</p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE / MODIFY MODAL */}
      {isCreating && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-indigo-950/80 backdrop-blur-md" onClick={() => setIsCreating(false)}></div>
          <div className="bg-white rounded-[4rem] p-12 max-w-2xl w-full relative z-10 shadow-2xl animate-slide-up space-y-10 border-t-[15px] border-indigo-600">
            <div className="flex justify-between items-start">
               <h2 className="text-4xl font-black text-indigo-950 tracking-tighter uppercase leading-none">
                 {editingBlueprint ? 'Modify Blueprint' : 'Architect Profile'}
               </h2>
               <button onClick={() => setIsCreating(false)} className="w-12 h-12 rounded-full bg-gray-50 text-gray-400 hover:text-rose-500 transition-colors flex items-center justify-center">
                  <i className="fa-solid fa-times text-xl"></i>
               </button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-2">Profile Designation (Name)</label>
                <input 
                  className="w-full px-8 py-5 rounded-[2rem] bg-indigo-50 border-4 border-transparent focus:bg-white focus:border-indigo-400 outline-none font-black text-indigo-900 shadow-inner"
                  placeholder="e.g. Health Registry"
                  value={modalName}
                  onChange={e => setModalName(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-2">Define Pillars (Columns)</label>
                <div className="flex gap-3">
                  <input 
                    className="flex-1 px-8 py-5 rounded-[2rem] bg-indigo-50 border-4 border-transparent focus:bg-white focus:border-indigo-400 outline-none font-black text-indigo-900 shadow-inner"
                    placeholder="New column name..."
                    value={columnInput}
                    // Fix: Correctly update state and use onKeyDown for key detection
                    onChange={e => setColumnInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addColumnToModal()}
                  />
                  <button onClick={addColumnToModal} className="px-8 py-4 bg-indigo-600 text-white rounded-[2rem] font-black hover:bg-black transition-all">Add Pillar</button>
                </div>
                
                <div className="flex flex-wrap gap-2 p-6 bg-gray-50 rounded-[2.5rem] min-h-[120px] border-2 border-indigo-50">
                  {modalColumns.map(col => (
                    <div key={col} className="px-5 py-3 bg-white border border-indigo-100 rounded-2xl text-[11px] font-black text-indigo-600 flex items-center gap-4 uppercase tracking-widest shadow-sm">
                      {col}
                      <button 
                        onClick={() => setModalColumns(modalColumns.filter(c => c !== col))}
                        className="text-rose-400 hover:text-rose-600 transition-colors"
                      ><i className="fa-solid fa-xmark"></i></button>
                    </div>
                  ))}
                  {modalColumns.length === 0 && <p className="text-gray-300 font-bold italic text-xs w-full text-center py-4">No columns defined yet.</p>}
                </div>
                {editingBlueprint && <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest ml-2"><i className="fa-solid fa-circle-exclamation"></i> Warning: Removing columns will permanently erase data stored in those fields.</p>}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={() => setIsCreating(false)} className="flex-1 py-5 bg-gray-100 text-gray-500 rounded-[2rem] font-black">Cancel</button>
              <button 
                onClick={handleSaveTemplate}
                disabled={!modalName || modalColumns.length === 0}
                className="flex-[2] py-5 bg-indigo-900 text-white rounded-[2rem] font-black shadow-2xl disabled:opacity-50"
              >
                {editingBlueprint ? 'Update Blueprint' : 'Finalize Architecting'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @media print {
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default CustomProfileBuilder;