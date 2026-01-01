import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, FileText, ChevronRight, Command } from 'lucide-react';
import { SavedRecord, Language } from '../types';
import { translations } from '../translations';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  records: SavedRecord[];
  onSelectRecord: (record: SavedRecord) => void;
  language: Language;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, records, onSelectRecord, language }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const t = translations[language];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // This is handled by the parent trigger usually, but good for focus
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const filtered = query.trim() === '' 
    ? records.slice(0, 5) 
    : records.filter(r => 
        r.patient.name.toLowerCase().includes(query.toLowerCase()) || 
        r.patient.rmNo.toLowerCase().includes(query.toLowerCase()) ||
        r.analysis.mainDiagnosis.toLowerCase().includes(query.toLowerCase())
      );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[10vh] px-4 md:px-0">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white/90 backdrop-blur-2xl rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/20 overflow-hidden animate-scale-in">
        <div className="p-8 border-b border-slate-100">
          <div className="relative flex items-center">
            <Search className="absolute left-0 text-blue-500" size={24} />
            <input 
              ref={inputRef}
              className="w-full bg-transparent pl-10 pr-12 py-2 text-2xl font-black text-slate-800 placeholder:text-slate-300 outline-none"
              placeholder={t.searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="absolute right-0 flex items-center gap-4">
              <div className="hidden md:flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-400 border border-slate-200">
                <Command size={10} />
                <span>ESC</span>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-all">
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="p-4">
            <div className="px-4 mb-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {query ? `Results matching "${query}"` : 'Recent Examinations'}
              </span>
            </div>

            <div className="space-y-2">
              {filtered.map((rec) => (
                <button 
                  key={rec.id}
                  onClick={() => onSelectRecord(rec)}
                  className="w-full flex items-center gap-5 p-4 rounded-3xl hover:bg-blue-50/50 transition-all group text-left border border-transparent hover:border-blue-100"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-blue-500 transition-all shadow-sm">
                    <User size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{rec.patient.rmNo}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                      <span className="text-[10px] font-bold text-slate-400">{new Date(rec.date).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">{rec.patient.name}</h4>
                    <p className="text-xs font-medium text-slate-400 truncate max-w-md">{rec.analysis.mainDiagnosis}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      rec.analysis.severity === 'Critical' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'
                    }`}>
                      {rec.analysis.severity}
                    </span>
                    <ChevronRight size={16} className="text-slate-200 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              ))}

              {filtered.length === 0 && (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-4">
                    <Search size={32} />
                  </div>
                  <h4 className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No Matching Entities Found</h4>
                  <p className="text-slate-300 text-xs mt-2 px-12">Search for patient name, record number, or diagnostic classification.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 opacity-40">
              <div className="w-4 h-4 bg-white border border-slate-200 rounded flex items-center justify-center text-[10px] font-bold">↑↓</div>
              <span className="text-[9px] font-black uppercase tracking-widest">Navigate</span>
            </div>
            <div className="flex items-center gap-2 opacity-40">
              <div className="w-4 h-4 bg-white border border-slate-200 rounded flex items-center justify-center text-[10px] font-bold">↵</div>
              <span className="text-[9px] font-black uppercase tracking-widest">Select</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Alcortex Neural Core Search Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;