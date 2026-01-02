import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  ChevronRight, 
  Calendar, 
  User as UserIcon, 
  Activity, 
  ArrowLeft,
  Thermometer,
  Heart,
  Wind,
  Droplets,
  Scale,
  ShieldAlert,
  Filter,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import { SavedRecord, User } from '../types';
import { translations } from '../translations';

interface EMRPageProps {
  user: User;
  records: SavedRecord[];
  selectedRecord: SavedRecord | null;
  setSelectedRecord: (record: SavedRecord | null) => void;
}

const EMRPage: React.FC<EMRPageProps> = ({ user, records, selectedRecord, setSelectedRecord }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  
  const t = translations[user.language];

  const resetFilters = () => {
    setSearchQuery('');
    setSeverityFilter('All');
    setMinAge('');
    setMaxAge('');
  };

  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        rec.patient.name.toLowerCase().includes(query) ||
        rec.patient.rmNo.toLowerCase().includes(query) ||
        rec.analysis.mainDiagnosis.toLowerCase().includes(query);

      const matchesSeverity = severityFilter === 'All' || rec.analysis.severity === severityFilter;
      
      const age = rec.patient.age;
      const matchesMinAge = minAge === '' || age >= parseInt(minAge);
      const matchesMaxAge = maxAge === '' || age <= parseInt(maxAge);

      return matchesSearch && matchesSeverity && matchesMinAge && matchesMaxAge;
    });
  }, [records, searchQuery, severityFilter, minAge, maxAge]);

  if (selectedRecord) {
    const { patient, analysis, date } = selectedRecord;
    return (
      <div className="animate-fade-in space-y-8 pb-20">
        <button 
          onClick={() => setSelectedRecord(null)}
          className="flex items-center gap-2 text-slate-400 font-bold hover:text-blue-600 transition-all uppercase text-[10px] tracking-widest"
        >
          <ArrowLeft size={16} /> {t.back} {t.emr}
        </button>

        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-10">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t.patientName}</span>
                <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-[10px] font-bold text-blue-600">{patient.rmNo}</span>
              </div>
              <h2 className="text-4xl font-black text-slate-800">{patient.name}</h2>
              <div className="flex items-center gap-4 mt-4 text-slate-400 font-medium text-sm">
                <div className="flex items-center gap-2">
                  <Calendar size={14} /> {new Date(date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon size={14} /> {patient.age}y, {patient.gender}
                </div>
              </div>
            </div>
            <div className={`px-6 py-2 rounded-2xl font-black text-xs uppercase ${
              analysis.severity === 'Critical' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-blue-500 text-white shadow-lg shadow-blue-200'
            }`}>
              {t[analysis.severity.toLowerCase()] || analysis.severity} Risk
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* History & Complaints */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 bg-slate-50 rounded-[40px]">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{t.complaints}</h4>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed">{patient.complaints || "None recorded"}</p>
                </div>
                <div className="p-8 bg-slate-50 rounded-[40px]">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{t.history}</h4>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed">{patient.history || "None recorded"}</p>
                </div>
              </div>

              {/* Interpretation */}
              <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{t.interpretation}</h4>
                <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">{analysis.interpretation}</p>
              </div>

              {/* Recommendations */}
              <div className="grid grid-cols-2 gap-6">
                <div className="p-8 bg-blue-50 rounded-[40px] border border-blue-100">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-4">{t.followUp}</h4>
                  <p className="text-xs font-medium text-blue-800 whitespace-pre-wrap">{analysis.followUp}</p>
                </div>
                <div className="p-8 bg-teal-50 rounded-[40px] border border-teal-100">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-4">{t.medicationRecs}</h4>
                  <p className="text-xs font-medium text-teal-800 whitespace-pre-wrap">{analysis.medicationRecs}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Diagnosis Sidebar */}
              <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl">
                <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Main Diagnosis</h4>
                <p className="text-xl font-black text-teal-300 mb-8 leading-tight">{analysis.mainDiagnosis}</p>
                
                <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-6">{t.differentialDiagnostics}</h4>
                <div className="space-y-4">
                  {analysis.differentials.map((d, i) => (
                    <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-help">
                      <div className="flex justify-between text-[10px] font-black text-teal-400 mb-1">
                        <span>{d.icd10}</span>
                        <span>{(d.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <p className="text-sm font-bold text-slate-100">{d.diagnosis}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vitals Summary Sidebar */}
              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t.vitals}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Heart size={16} className="text-rose-500" />
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase">BP</p>
                      <p className="font-bold text-slate-800 text-[10px]">{patient.vitals.bpSystolic}/{patient.vitals.bpDiastolic}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-blue-500" />
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase">HR</p>
                      <p className="font-bold text-slate-800 text-[10px]">{patient.vitals.heartRate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Thermometer size={16} className="text-orange-500" />
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase">Temp</p>
                      <p className="font-bold text-slate-800 text-[10px]">{patient.vitals.temperature}°C</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets size={16} className="text-teal-500" />
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase">SpO2</p>
                      <p className="font-bold text-slate-800 text-[10px]">{patient.vitals.spo2}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Search and Advanced Filter Container */}
      <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">{t.emr} Vault</h3>
            <p className="text-sm text-slate-400 font-medium mt-1">Indexing {records.length} historical diagnostic records.</p>
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative group flex-1 lg:w-96">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                className="w-full bg-slate-50 border-none rounded-3xl pl-14 pr-6 py-5 text-slate-700 font-bold focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                placeholder="Search Patient Name, RM, or Diagnosis..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className={`p-5 rounded-3xl transition-all flex items-center justify-center ${isFilterExpanded ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
            >
              <SlidersHorizontal size={24} />
            </button>
          </div>
        </div>

        {/* Expandable Filter Grid */}
        {isFilterExpanded && (
          <div className="pt-8 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert size={12} className="text-rose-500" /> Risk Severity
              </label>
              <select 
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 cursor-pointer outline-none focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none"
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value)}
              >
                <option value="All">All Severity Levels</option>
                <option value="Critical">Critical Risk</option>
                <option value="Severe">Severe Risk</option>
                <option value="Moderate">Moderate Risk</option>
                <option value="Mild">Mild Risk</option>
              </select>
            </div>

            <div className="space-y-3 lg:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={12} className="text-blue-500" /> Patient Age Range
              </label>
              <div className="flex items-center gap-4">
                <input 
                  type="number" 
                  placeholder="Min" 
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                  value={minAge}
                  onChange={e => setMinAge(e.target.value)}
                />
                <span className="font-black text-slate-200">TO</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                  value={maxAge}
                  onChange={e => setMaxAge(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-end gap-3">
               <button 
                onClick={resetFilters}
                className="flex-1 h-[52px] bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 hover:text-rose-500 transition-all"
               >
                 <RotateCcw size={14} /> Clear
               </button>
            </div>
          </div>
        )}
        
        {/* Active Filters Result Count */}
        {(searchQuery || severityFilter !== 'All' || minAge || maxAge) && (
          <div className="flex items-center gap-2 px-2">
             <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></div>
             <p className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em]">Neural Match: {filteredRecords.length} clinical profiles found</p>
          </div>
        )}
      </div>

      {/* Record Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredRecords.map((rec) => (
          <button 
            key={rec.id}
            onClick={() => setSelectedRecord(rec)}
            className="group bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left flex items-center gap-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all shadow-inner border border-transparent group-hover:border-blue-100">
              <FileText size={24} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{rec.patient.rmNo}</span>
                <span className="text-[10px] font-bold text-slate-300">•</span>
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{new Date(rec.date).toLocaleDateString()}</span>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{rec.patient.age}Y • {rec.patient.gender}</span>
              </div>
              <h4 className="font-black text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{rec.patient.name}</h4>
              <p className="text-xs font-bold text-slate-400 mt-0.5 max-w-xl truncate">{rec.analysis.mainDiagnosis}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${
                rec.analysis.severity === 'Critical' ? 'bg-rose-50 text-rose-500 border-rose-100' :
                rec.analysis.severity === 'Severe' ? 'bg-orange-50 text-orange-500 border-orange-100' :
                'bg-blue-50 text-blue-500 border-blue-100'
              }`}>
                {t[rec.analysis.severity.toLowerCase()] || rec.analysis.severity}
              </div>
              <ChevronRight className="text-slate-200 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" size={24} />
            </div>
          </button>
        ))}

        {filteredRecords.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-center opacity-40">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 border-2 border-dashed border-slate-200">
               <FileText size={48} className="text-slate-300" />
            </div>
            <h4 className="font-black uppercase tracking-[0.3em] text-sm text-slate-800">EMR Vault Empty</h4>
            <p className="text-xs mt-3 max-w-xs font-bold leading-relaxed text-slate-400">No medical records matched the current clinical filter parameters. Try clearing the search query or adjusting age ranges.</p>
            <button 
              onClick={resetFilters}
              className="mt-8 px-8 py-3 bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95"
            >
              Reset Clinical Engine
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EMRPage;