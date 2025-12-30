
import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  ChevronRight, 
  Calendar, 
  User as UserIcon, 
  Activity, 
  Clock, 
  ArrowLeft,
  Download,
  AlertCircle
} from 'lucide-react';
import { SavedRecord, User } from '../types';
import { translations } from '../translations';

interface EMRPageProps {
  user: User;
  records: SavedRecord[];
}

const EMRPage: React.FC<EMRPageProps> = ({ user, records }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<SavedRecord | null>(null);
  const t = translations[user.language];

  const filteredRecords = records.filter(rec => 
    rec.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rec.patient.rmNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rec.analysis.mainDiagnosis.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  <Clock size={14} /> {new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            <div className={`px-6 py-2 rounded-2xl font-black text-xs uppercase ${
              analysis.severity === 'Critical' ? 'bg-rose-500 text-white' : 'bg-blue-500 text-white'
            }`}>
              {t[analysis.severity.toLowerCase()] || analysis.severity}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{t.mainDiagnosis}</h4>
                <p className="text-2xl font-black text-slate-800">{analysis.mainDiagnosis}</p>
                <div className="h-[1px] bg-slate-200 my-6"></div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{t.interpretation}</h4>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{analysis.interpretation}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-8 bg-blue-50 rounded-[40px] border border-blue-100">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-4">{t.followUp}</h4>
                  <p className="text-sm font-medium text-blue-800 whitespace-pre-wrap">{analysis.followUp}</p>
                </div>
                <div className="p-8 bg-teal-50 rounded-[40px] border border-teal-100">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-4">{t.medicationRecs}</h4>
                  <p className="text-sm font-medium text-teal-800 whitespace-pre-wrap">{analysis.medicationRecs}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900 p-8 rounded-[40px] text-white">
                <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-6">{t.differentialDiagnostics}</h4>
                <div className="space-y-4">
                  {analysis.differentials.map((d, i) => (
                    <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div className="flex justify-between text-[10px] font-black text-teal-400 mb-1">
                        <span>{d.icd10}</span>
                        <span>{(d.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <p className="text-sm font-bold">{d.diagnosis}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-4">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.vitals} Recap</h4>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-[8px] font-black text-slate-400 uppercase">Blood Pressure</p>
                      <p className="font-bold text-slate-700">{patient.vitals.bpSystolic}/{patient.vitals.bpDiastolic}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] font-black text-slate-400 uppercase">SpO2</p>
                      <p className="font-bold text-slate-700">{patient.vitals.spo2}%</p>
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
      <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="text-2xl font-black text-slate-800">{t.emr} Vault</h3>
          <p className="text-sm text-slate-400 font-medium">Historical precision diagnostic records.</p>
        </div>
        <div className="relative group w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={18} />
          <input 
            className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-4 text-slate-700 font-medium focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredRecords.map((rec) => (
          <button 
            key={rec.id}
            onClick={() => setSelectedRecord(rec)}
            className="group bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left flex items-center gap-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
              <FileText size={24} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{rec.patient.rmNo}</span>
                <span className="text-[10px] font-bold text-slate-300">•</span>
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{new Date(rec.date).toLocaleDateString()}</span>
              </div>
              <h4 className="font-black text-slate-800 text-lg">{rec.patient.name}</h4>
              <p className="text-xs font-medium text-slate-400 mt-0.5">{rec.analysis.mainDiagnosis}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase ${
                rec.analysis.severity === 'Critical' ? 'bg-rose-50 text-rose-500' :
                rec.analysis.severity === 'Severe' ? 'bg-orange-50 text-orange-500' :
                'bg-blue-50 text-blue-500'
              }`}>
                {t[rec.analysis.severity.toLowerCase()] || rec.analysis.severity}
              </div>
              <ChevronRight className="text-slate-200 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" size={24} />
            </div>
          </button>
        ))}

        {filteredRecords.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
            <FileText size={64} className="mb-6" />
            <h4 className="font-black uppercase tracking-widest text-sm">Vault Empty</h4>
            <p className="text-xs mt-2 max-w-xs">No examination records match your search or have been recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EMRPage;
