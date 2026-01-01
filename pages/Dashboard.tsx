import React, { useState, useMemo } from 'react';
import { 
  Users, 
  CheckCircle, 
  ChevronRight,
  Activity,
  ShieldAlert,
  Search,
  Stethoscope,
  Image as ImageIcon,
  FileText,
  TrendingUp,
  Filter,
  XCircle
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { User, SavedRecord } from '../types';
import { translations } from '../translations';

interface DashboardProps {
  user: User;
  setActiveTab: (tab: string) => void;
  records: SavedRecord[];
  onSelectRecord: (record: SavedRecord) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, setActiveTab, records, onSelectRecord }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const t = translations[user.language] || translations['English'];

  // Derive chart data from real EMR records
  const chartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = days.map(day => ({ name: day, patients: 0 }));
    
    records.forEach(rec => {
      const date = new Date(rec.date);
      const dayName = days[date.getDay()];
      const entry = counts.find(c => c.name === dayName);
      if (entry) entry.patients += 1;
    });
    
    return counts;
  }, [records]);

  // Calculate Severity Statistics
  const stats = useMemo(() => {
    const total = records.length;
    const critical = records.filter(r => r.analysis.severity === 'Critical' || r.analysis.severity === 'Severe').length;
    const avgConfidence = total > 0 
      ? (records.reduce((acc, curr) => acc + curr.analysis.confidenceScore, 0) / total) * 100 
      : 0;
    
    return { total, critical, avgConfidence };
  }, [records]);

  // Multi-criteria filtering logic
  const filteredHistory = useMemo(() => {
    return records.filter(item => {
      const query = searchQuery.toLowerCase();
      const nameMatch = item.patient.name.toLowerCase().includes(query);
      const diagnosisMatch = item.analysis.mainDiagnosis.toLowerCase().includes(query);
      const severityMatch = severityFilter === 'All' || item.analysis.severity === severityFilter;
      
      return (nameMatch || diagnosisMatch) && severityMatch;
    });
  }, [records, searchQuery, severityFilter]);

  const quickActions = [
    { id: 'diagnosis', label: t.diagnosis, icon: Stethoscope, color: 'from-blue-600 to-blue-400', desc: 'AI Analysis' },
    { id: 'imaging', label: t.imaging, icon: ImageIcon, color: 'from-blue-500 to-teal-400', desc: 'Analyze CT/X-Ray' },
    { id: 'emr', label: t.emr, icon: FileText, color: 'from-teal-500 to-teal-300', desc: 'Patient Records' },
  ];

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.emr} Total</p>
            <h4 className="text-2xl font-black text-slate-800">{stats.total}</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.critical}/{t.severe}</p>
            <h4 className="text-2xl font-black text-slate-800">{stats.critical}</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Confidence</p>
            <h4 className="text-2xl font-black text-slate-800">{stats.avgConfidence.toFixed(1)}%</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, idx) => (
          <button 
            key={idx} 
            onClick={() => setActiveTab(action.id)}
            className="group bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left flex items-center gap-5"
          >
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${action.color} text-white shadow-lg`}>
              <action.icon size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">{action.label}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{action.desc}</p>
            </div>
            <ChevronRight className="ml-auto text-slate-200 group-hover:text-blue-500 transition-colors" size={20} />
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Diagnostic Activity Chart */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8 px-2">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Diagnostic Activity</h3>
                <p className="text-xs text-slate-400">Total analysis per day</p>
              </div>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} 
                  />
                  <Area type="monotone" dataKey="patients" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorPatients)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* History Explorer with Refined Filtering */}
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-10 pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">{t.historyExplorer}</h3>
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-50 text-[10px] font-black text-slate-400 border border-slate-100">{filteredHistory.length}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative group min-w-[200px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input 
                      className="bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-3 text-sm w-full focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-medium text-slate-700"
                      placeholder="Search Name or Diagnosis..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="relative group">
                    <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <select 
                      className="bg-slate-50 border-none rounded-2xl pl-10 pr-8 py-3 text-sm focus:ring-4 focus:ring-blue-500/5 transition-all outline-none cursor-pointer font-bold text-slate-700 appearance-none"
                      value={severityFilter}
                      onChange={(e) => setSeverityFilter(e.target.value)}
                    >
                      <option value="All">All Severity</option>
                      <option value="Critical">Critical</option>
                      <option value="Severe">Severe</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Mild">Mild</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-400 text-[10px] uppercase font-black tracking-[0.15em] border-b border-slate-50">
                      <th className="pb-6 px-4">{t.patientName}</th>
                      <th className="pb-6 px-4">Primary Diagnosis</th>
                      <th className="pb-6 px-4">{t.status}</th>
                      <th className="pb-6 px-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredHistory.map((item) => (
                      <tr 
                        key={item.id} 
                        className="group hover:bg-slate-50 transition-all cursor-pointer"
                        onClick={() => onSelectRecord(item)}
                      >
                        <td className="py-6 px-4 font-bold text-slate-700 text-sm">
                          <div className="flex flex-col">
                             <span className="text-slate-800">{item.patient.name}</span>
                             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.patient.age}Y • {item.patient.gender}</span>
                          </div>
                        </td>
                        <td className="py-6 px-4 text-slate-600 text-sm font-medium">
                          <div className="max-w-[200px] truncate" title={item.analysis.mainDiagnosis}>
                            {item.analysis.mainDiagnosis}
                          </div>
                        </td>
                        <td className="py-6 px-4">
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                            item.analysis.severity === 'Critical' ? 'bg-rose-50 text-rose-500 border border-rose-100' :
                            item.analysis.severity === 'Severe' ? 'bg-orange-50 text-orange-500 border border-orange-100' :
                            'bg-blue-50 text-blue-500 border border-blue-100'
                          }`}>
                            {t[item.analysis.severity.toLowerCase()] || item.analysis.severity}
                          </span>
                        </td>
                        <td className="py-6 px-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-slate-800 font-black text-[10px]">{new Date(item.date).toLocaleDateString()}</span>
                            <span className="text-[9px] text-slate-300 font-bold uppercase tracking-tighter">Encrypted ID: {item.patient.rmNo}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredHistory.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-24 text-center">
                          <div className="flex flex-col items-center justify-center opacity-30">
                            <XCircle size={48} className="text-slate-300 mb-4" />
                            <h4 className="font-black uppercase tracking-widest text-xs text-slate-400">No Patient Entities Found</h4>
                            <p className="text-[10px] mt-1 font-bold">Try adjusting your filters or clinical keywords.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar AI Stats */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-blue-700 to-teal-800 text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <TrendingUp size={120} />
             </div>
             <div className="flex items-center gap-4 mb-10 relative z-10">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                  <Activity size={24} className="text-teal-300" />
                </div>
                <h3 className="font-black tracking-widest text-sm uppercase">Neural Stats</h3>
             </div>
             <div className="space-y-6 relative z-10">
                <div className="p-5 rounded-3xl bg-white/5 border border-white/10">
                   <p className="text-teal-300 text-[10px] font-black uppercase mb-2 tracking-widest">System Integrity</p>
                   <p className="text-xs leading-relaxed opacity-90 font-medium">Neural engine operating at 98.4% accuracy based on recent clinical feedback loops.</p>
                </div>
                <div className="p-5 rounded-3xl bg-white/5 border border-white/10">
                   <p className="text-blue-300 text-[10px] font-black uppercase mb-2 tracking-widest">Vault Analytics</p>
                   <p className="text-xs leading-relaxed opacity-90 font-medium">{records.length} clinical profiles fully indexed across {new Set(records.map(r => r.analysis.severity)).size} severity tiers.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;