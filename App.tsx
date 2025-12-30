
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
    const timer = setTimeout(onFinish, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-50">
      <AlcortexLogo className="animate-pulse" size={100} />
      <h1 className="mt-8 text-3xl font-black text-white tracking-[0.2em]">ALCORTEX</h1>
      <div className="mt-8 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 w-1/2 animate-[loading_1.5s_infinite]"></div>
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
        }
        const fetchedRecords = await databaseService.getRecords();
        setRecords(Array.isArray(fetchedRecords) ? fetchedRecords : []);
      } catch (error) {
        console.warn("App initialization warning:", error);
      } finally {
        // Guarantee splash disappears
        setTimeout(() => setShowSplash(false), 500);
      }
    };
    initApp();
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('alcortex_user', JSON.stringify(u));
    databaseService.registerUser(u);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('alcortex_user');
  };

  const handleSaveRecord = async (record: SavedRecord) => {
    if (user) {
      await databaseService.saveDiagnosis(user.email, record);
      const updated = await databaseService.getRecords();
      setRecords(updated);
    }
  };

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;

  if (!user) return <AuthPage onLogin={handleLogin} />;

  const t = translations[user.language] || translations[Language.EN];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} language={user.language} />
      <main className="flex-1 ml-64 p-8 min-h-screen">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{t[activeTab] || activeTab}</h2>
            <p className="text-slate-500 text-sm">Dr. {user.name}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            {user.name[0]}
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
