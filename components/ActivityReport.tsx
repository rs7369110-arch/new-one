
import React, { useState } from 'react';
import { AdminActivity } from '../types';

interface ActivityReportProps {
  activities: AdminActivity[];
  onClearLog: () => void;
}

const ActivityReport: React.FC<ActivityReportProps> = ({ activities, onClearLog }) => {
  const [filter, setFilter] = useState('');

  const filtered = activities
    .filter(a => 
      a.adminName.toLowerCase().includes(filter.toLowerCase()) || 
      a.module.toLowerCase().includes(filter.toLowerCase()) ||
      a.target.toLowerCase().includes(filter.toLowerCase())
    )
    .reverse();

  const getActionColor = (type: string) => {
    switch (type) {
      case 'CREATE': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'UPDATE': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'DELETE': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'PAYMENT': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'CREATE': return 'fa-circle-plus';
      case 'UPDATE': return 'fa-pen-to-square';
      case 'DELETE': return 'fa-trash-can';
      case 'PAYMENT': return 'fa-coins';
      default: return 'fa-bolt';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-indigo-900 tracking-tight">System Audit Log</h1>
          <p className="text-gray-500 font-medium">Tracking administrative actions for transparency.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input 
              className="pl-12 pr-6 py-3 bg-white rounded-2xl border-2 border-indigo-50 outline-none focus:border-indigo-300 w-64 font-bold"
              placeholder="Filter activities..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
            />
          </div>
          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to clear the entire log history?")) {
                onClearLog();
              }
            }}
            className="px-6 py-3 bg-white text-rose-500 rounded-2xl font-black border-2 border-rose-50 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
          >
            Clear History
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[3rem] shadow-xl border border-indigo-50 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-indigo-50/50 sticky top-0 z-10">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-8 py-6 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Administrator</th>
                <th className="px-8 py-6 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Action</th>
                <th className="px-8 py-6 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Module</th>
                <th className="px-8 py-6 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Target Entity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-50">
              {filtered.length > 0 ? filtered.map((act) => (
                <tr key={act.id} className="hover:bg-indigo-50/10 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-700 text-sm">{act.timestamp.split(', ')[1]}</span>
                      <span className="text-[10px] font-black text-gray-400">{act.timestamp.split(', ')[0]}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-600 text-[10px]">
                        {act.adminName.charAt(0)}
                      </div>
                      <span className="font-black text-gray-800 text-sm">{act.adminName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit ${getActionColor(act.actionType)}`}>
                      <i className={`fa-solid ${getActionIcon(act.actionType)}`}></i>
                      {act.actionType}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{act.module}</span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-gray-800 truncate max-w-xs">{act.target}</p>
                    {act.details && <p className="text-[10px] text-gray-400 italic">{act.details}</p>}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-40 text-center">
                    <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-5xl text-indigo-200 mx-auto mb-6">
                      <i className="fa-solid fa-list-check"></i>
                    </div>
                    <p className="text-xl font-black text-indigo-900">No activity recorded yet.</p>
                    <p className="text-gray-400 font-medium">Administrative actions will appear here automatically.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #fdfcfb;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default ActivityReport;
