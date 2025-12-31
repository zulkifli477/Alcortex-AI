import React, { useState, useEffect } from 'react';
import { User, SavedRecord } from './types';
import { translations } from './translations';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DiagnosisForm from './pages/DiagnosisForm';
import AuthPage from './pages/AuthPage';
import SettingsPage from './pages/SettingsPage';
import ImagingPage from './pages/ImagingPage';
import EMRPage from './pages/EMRPage';
import SplashScreen from './components/SplashScreen';
import { databaseService } from './services/databaseService';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [records, setRecords] = useState<SavedRecord[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  useEffect(() => {
    const saved = localStorage.getItem('alcortex_user');
    if (saved) setUser(JSON.parse(saved));
    databaseService.getRecords().then(setRecords);

    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('alcortex_user', JSON.stringify(u));
  };

  const handleSaveRecord = async (record: SavedRecord) => {
    if (user) {
      await databaseService.saveDiagnosis(user.email, record);
      const updated = await databaseService.getRecords();
      setRecords(updated);
    }
  };

  if (showSplash) return <SplashScreen onComplete={() => setShowSplash(false)} />;
  if (!user) return <AuthPage onLogin={handleLogin} />;

  const t = translations[user.language] || translations['English'];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={() => setUser(null)} 
        language={user.language}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      <main className={`flex-1 transition-all duration-300 ease-in-out p-4 md:p-8 min-h-screen ${sidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:text-blue-600 shadow-sm transition-all"
              >
                <Menu size={20} />
              </button>
            )}
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight">{t[activeTab]}</h2>
              <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">Dr. {user.name} • Professional Station</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden md:block text-right">
                <p className="text-[10px] font-black text-slate-800 leading-none">ALCORTEX AI v1</p>
                <p className="text-[8px] font-bold text-teal-500 uppercase tracking-tighter">Proprietary AI Engine Active</p>
             </div>
             <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white font-black shadow-lg">
                {user.name[0]}
             </div>
          </div>
        </header>

        <div className="animate-fade-in">
          {activeTab === 'dashboard' && <Dashboard user={user} setActiveTab={setActiveTab} records={records} />}
          {activeTab === 'diagnosis' && <DiagnosisForm user={user} onSaveRecord={handleSaveRecord} />}
          {activeTab === 'imaging' && <ImagingPage user={user} />}
          {activeTab === 'settings' && <SettingsPage user={user} setUser={setUser} />}
          {activeTab === 'emr' && <EMRPage user={user} records={records} />}
        </div>
      </main>
    </div>
  );
};

export default App;