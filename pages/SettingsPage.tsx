import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Shield, 
  Bell, 
  Globe, 
  Moon, 
  Database,
  Cloud,
  ChevronRight,
  CheckCircle2,
  Settings,
  HardDrive,
  RefreshCw,
  Trash2,
  Download,
  Upload
} from 'lucide-react';
import { User, Language } from '../types';
import { translations } from '../translations';

interface SettingsPageProps {
  user: User;
  setUser: (u: User) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user, setUser }) => {
  const [currentSection, setCurrentSection] = useState<'account' | 'notifications' | 'display' | 'data'>('account');
  const [formData, setFormData] = useState<User>(user);
  const [saved, setSaved] = useState(false);
  const [backupStatus, setBackupStatus] = useState<'idle' | 'success' | 'restored'>('idle');
  const t = translations[user.language];

  const [notifs, setNotifs] = useState({ critical: true, reports: false, ai: true });
  const [display, setDisplay] = useState({ theme: false, compact: false, font: false });
  const [dataSync, setDataSync] = useState({ cloud: true, archive: true });

  const handleSave = () => {
    setUser(formData);
    localStorage.setItem('alcortex_user', JSON.stringify(formData));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLocalBackup = () => {
    localStorage.setItem('alcortex_backup_local', JSON.stringify(formData));
    setBackupStatus('success');
    setTimeout(() => setBackupStatus('idle'), 3000);
  };

  const handleLocalRestore = () => {
    const backup = localStorage.getItem('alcortex_backup_local');
    if (backup) {
      const restoredUser = JSON.parse(backup);
      setFormData(restoredUser);
      setUser(restoredUser);
      localStorage.setItem('alcortex_user', backup);
      setBackupStatus('restored');
      setTimeout(() => setBackupStatus('idle'), 3000);
    } else {
      alert(t.noBackup || "No backup found.");
    }
  };

  const navItems = [
    { id: 'account', label: t.account, icon: UserIcon },
    { id: 'notifications', label: t.notifications, icon: Bell },
    { id: 'display', label: t.display, icon: Moon },
    { id: 'data', label: t.dataBackup, icon: Database },
  ];

  const Toggle = ({ enabled, onChange, label }: { enabled: boolean, onChange: () => void, label: string }) => (
    <div className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <button 
        onClick={onChange}
        className={`w-12 h-6 rounded-full p-1 transition-all ${enabled ? 'bg-teal-500' : 'bg-slate-200'}`}
      >
        <div className={`w-4 h-4 bg-white rounded-full transition-all ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-2">
          {navItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => setCurrentSection(item.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${
                currentSection === item.id 
                ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-xl shadow-blue-500/20 translate-x-1' 
                : 'text-slate-400 hover:bg-white hover:text-slate-600'
              }`}
            >
              <item.icon size={20} className={currentSection === item.id ? 'text-white' : 'group-hover:text-blue-500'} />
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="md:col-span-3 space-y-8">
          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm min-h-[500px]">
            {currentSection === 'account' && (
              <div className="space-y-8 animate-fade-in">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 shadow-inner">
                    <UserIcon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{t.account}</h3>
                    <p className="text-xs text-slate-400 font-medium">{t.manageIdentity}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.displayName}</label>
                    <input 
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.medicalId}</label>
                    <input 
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                      value={formData.professionId}
                      onChange={e => setFormData({...formData, professionId: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.workEmail}</label>
                    <input 
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.all} Language</label>
                    <select 
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-700 appearance-none outline-none"
                      value={formData.language}
                      onChange={e => setFormData({...formData, language: e.target.value as any})}
                    >
                      <option value={Language.ID}>Bahasa Indonesia</option>
                      <option value={Language.EN}>English</option>
                      <option value={Language.RU}>Russian</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentSection === 'notifications' && (
              <div className="space-y-8 animate-fade-in">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-orange-50 rounded-2xl text-orange-600 shadow-inner">
                    <Bell size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{t.notifications}</h3>
                    <p className="text-xs text-slate-400 font-medium">{t.configAlerts}</p>
                  </div>
                </div>

                <div className="bg-slate-50/50 rounded-3xl p-6">
                  <Toggle label={t.notifCritical} enabled={notifs.critical} onChange={() => setNotifs({...notifs, critical: !notifs.critical})} />
                  <Toggle label={t.notifReports} enabled={notifs.reports} onChange={() => setNotifs({...notifs, reports: !notifs.reports})} />
                  <Toggle label={t.notifAI} enabled={notifs.ai} onChange={() => setNotifs({...notifs, ai: !notifs.ai})} />
                </div>
              </div>
            )}

            {currentSection === 'display' && (
              <div className="space-y-8 animate-fade-in">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 shadow-inner">
                    <Moon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{t.display}</h3>
                    <p className="text-xs text-slate-400 font-medium">{t.personalizeUI}</p>
                  </div>
                </div>

                <div className="bg-slate-50/50 rounded-3xl p-6">
                  <Toggle label={t.displayTheme} enabled={display.theme} onChange={() => setDisplay({...display, theme: !display.theme})} />
                  <Toggle label={t.displayCompact} enabled={display.compact} onChange={() => setDisplay({...display, compact: !display.compact})} />
                  <Toggle label={t.displayFont} enabled={display.font} onChange={() => setDisplay({...display, font: !display.font})} />
                </div>
              </div>
            )}

            {currentSection === 'data' && (
              <div className="space-y-8 animate-fade-in">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-teal-50 rounded-2xl text-teal-600 shadow-inner">
                    <Database size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{t.dataBackup}</h3>
                    <p className="text-xs text-slate-400 font-medium">{t.clinicalArchive}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 bg-slate-50 rounded-[32px] flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                      <HardDrive size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.storageUsed}</p>
                      <p className="text-lg font-black text-slate-800">428.5 MB / 2 GB</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={handleLocalBackup}
                      className="p-6 bg-slate-50 rounded-[32px] flex flex-col items-center justify-center gap-2 group hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm group-hover:text-blue-600">
                        <Download size={20} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-center">
                        {backupStatus === 'success' ? t.backupSuccess : t.backupLocal}
                      </span>
                    </button>
                    <button 
                      onClick={handleLocalRestore}
                      className="p-6 bg-slate-50 rounded-[32px] flex flex-col items-center justify-center gap-2 group hover:bg-teal-500 hover:text-white transition-all shadow-sm"
                    >
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-teal-600 shadow-sm group-hover:text-teal-500">
                        <Upload size={20} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-center">
                        {backupStatus === 'restored' ? t.restoreSuccess : t.restoreLocal}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50/50 rounded-3xl p-6">
                  <Toggle label={t.dataCloud} enabled={dataSync.cloud} onChange={() => setDataSync({...dataSync, cloud: !dataSync.cloud})} />
                  <Toggle label={t.dataArchive} enabled={dataSync.archive} onChange={() => setDataSync({...dataSync, archive: !dataSync.archive})} />
                  
                  <div className="flex items-center justify-between py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">{t.dataClear}</span>
                      <span className="text-[10px] text-slate-400">{t.clearCacheDesc}</span>
                    </div>
                    <button className="px-6 py-2 bg-rose-50 text-rose-500 rounded-xl font-bold text-xs hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2">
                      <Trash2 size={14} /> Clear
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <button 
              onClick={handleSave}
              className="px-16 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-black py-5 rounded-2xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {saved ? <CheckCircle2 size={20} /> : null}
              {saved ? t.updateSuccess : t.save.toUpperCase()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;