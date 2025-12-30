
import React, { useState, useEffect } from 'react';
import { Language, User, SavedRecord } from './types';
import { translations } from './translations';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DiagnosisForm from './pages/DiagnosisForm';
import AuthPage from './pages/AuthPage';
import SettingsPage from './pages/SettingsPage';
import ImagingPage from './pages/ImagingPage';
import EMRPage from './pages/EMRPage';
import AlcortexLogo from './components/Logo';
import { databaseService } from './services/databaseService';

const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-blue-800 to-teal-700 flex flex-col items-center justify-center z-50 overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-400 blur-[120px] rounded-full"></div>
      </div>
      
      <div className="relative">
        <AlcortexLogo className="animate-pulse scale-110 drop-shadow-[0_0_30px_rgba(45,212,191,0.3)]" size={140} />
        <div className="absolute -inset-10 border border-white/10 rounded-full animate-ping"></div>
      </div>
      
      <h1 className="mt-10 text-5xl font-black text-white tracking-[0.25em] drop-shadow-lg">ALCORTEX</h1>
      <p className="mt-3 text-teal-100/70 font-medium tracking-[0.4em] uppercase text-[10px]">Precision AI Diagnostic Suite</p>
      
      <div className="mt-20 w-72 h-1 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-400 to-teal-300 w-1/2 animate-[loading_2s_ease-in-out_infinite]"></div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [records, setRecords] = useState<SavedRecord[]>([]);
  
  useEffect(() => {
    const initApp = async () => {
      try {
        const savedUser = localStorage.getItem('alcortex_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          databaseService.logActivity(parsedUser.email, 'SESSION_RESUMED');
        }

        const fetchedRecords = await databaseService.getRecords();
        setRecords(Array.isArray(fetchedRecords) ? fetchedRecords : []);
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };

    initApp();
  }, []);

  const handleLogin = async (u: User) => {
    setUser(u);
    localStorage.setItem('alcortex_user', JSON.stringify(u));
    try {
      await databaseService.registerUser(u);
      await databaseService.logActivity(u.email, 'LOGIN');
      const fetchedRecords = await databaseService.getRecords();
      setRecords(fetchedRecords);
    } catch (e) {
      // If network fails, we still have local state set
    }
  };

  const handleLogout = async () => {
    if (user) await databaseService.logActivity(user.email, 'LOGOUT');
    setUser(null);
    localStorage.removeItem('alcortex_user');
  };

  const handleSaveRecord = async (record: SavedRecord) => {
    if (user) {
      await databaseService.saveDiagnosis(user.email, record);
      const updatedRecords = await databaseService.getRecords();
      setRecords(updatedRecords);
    }
  };

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  const languageKey = user.language in translations ? user.language : Language.EN;
  const t = translations[languageKey];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        language={user.language} 
      />
      
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 capitalize">
              {t[activeTab] || activeTab.replace('-', ' ')}
            </h2>
            <p className="text-slate-500 text-sm">{t.welcome}, Dr. {user.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-700">{user.language}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">STR: {user.professionId}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 p-[2px] shadow-lg shadow-blue-500/10">
              <div className="w-full h-full rounded-[14px] bg-white overflow-hidden">
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="avatar" />
              </div>
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
