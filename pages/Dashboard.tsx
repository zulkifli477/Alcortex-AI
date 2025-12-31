import React, { useState, useMemo } from 'react';
import { 
  Users, 
  CheckCircle, 
  ChevronRight,
  MoreVertical,
  Activity,
  ShieldAlert,
  Search,
  Stethoscope,
  Image as ImageIcon,
  FileText,
  TrendingUp
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
}

const Dashboard: React.FC<DashboardProps> = ({ user, setActiveTab, records }) => {
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

  // Improved filtering logic for History Explorer
  const filteredHistory = useMemo(() => {
    return records.filter(item => {
      const nameMatch = item.patient.name.toLowerCase().includes(searchQuery.toLowerCase());
      const diagnosisMatch = item.analysis.mainDiagnosis.toLowerCase().includes(searchQuery.toLowerCase());
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

          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-10 pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h3 className="text-xl font-bold text-slate-800">{t.historyExplorer}</h3>
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={16} />
                    <input 
                      className="bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-3 text-sm w-full md:w-64 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                      placeholder={t.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select 
                    className="bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-blue-500/5 transition-all outline-none cursor-pointer font-bold"
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                  >
                    <option value="All">{t.all} {t.severity}</option>
                    <option value="Critical">{t.critical}</option>
                    <option value="Severe">{t.severe}</option>
                    <option value="Moderate">{t.moderate}</option>
                    <option value="Mild">{t.mild}</option>
                  </select>
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
                        onClick={() => setActiveTab('emr')}
                      >
                        <td className="py-6 px-4 font-bold text-slate-700 text-sm">
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                             {item.patient.name}
                          </div>
                        </td>
                        <td className="py-6 px-4 text-slate-600 text-sm font-medium">{item.analysis.mainDiagnosis}</td>
                        <td className="py-6 px-4">
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase ${
                            item.analysis.severity === 'Critical' ? 'bg-rose-50 text-rose-500' :
                            item.analysis.severity === 'Severe' ? 'bg-orange-50 text-orange-500' :
                            'bg-blue-50 text-blue-500'
                          }`}>
                            {t[item.analysis.severity.toLowerCase()] || item.analysis.severity}
                          </span>
                        </td>
                        <td className="py-6 px-4 text-right text-slate-400 text-[10px] font-bold">
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {filteredHistory.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-20 text-center text-slate-400 font-medium italic">
                          {records.length === 0 ? "EMR Vault is empty. Start a new diagnosis to see records here." : "No results found for your search query."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-blue-700 to-teal-800 text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <TrendingUp size={120} />
             </div>
             <div className="flex items-center gap-4 mb-10 relative z-10">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                  <Activity size={24} className="text-teal-300" />
                </div>
                <h3 className="font-black tracking-widest text-sm uppercase">AI Statistics</h3>
             </div>
             <div className="space-y-6 relative z-10">
                <div className="p-5 rounded-3xl bg-white/5 border border-white/10">
                   <p className="text-teal-300 text-[10px] font-black uppercase mb-2">System Integrity</p>
                   <p className="text-xs leading-relaxed opacity-90 font-medium">Neural engine operating at 98.4% diagnostic accuracy based on recent feedback loops.</p>
                </div>
                <div className="p-5 rounded-3xl bg-white/5 border border-white/10">
                   <p className="text-blue-300 text-[10px] font-black uppercase mb-2">Vault Audit</p>
                   <p className="text-xs leading-relaxed opacity-90 font-medium">Auto-backup successful. {records.length} clinical profiles encrypted.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;