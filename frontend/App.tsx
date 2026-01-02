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
import GlobalSearch from './components/GlobalSearch';
import { databaseService } from './services/databaseService';
import { Menu, Search } from 'lucide-react';
import { ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [records, setRecords] = useState<SavedRecord[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SavedRecord | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
  useEffect(() => {
    // Session Validation Logic
    const validateSession = async () => {
      const saved = localStorage.getItem('alcortex_user');
      if (saved) {
        setIsVerifying(true);
        try {
          const parsedUser: User = JSON.parse(saved);
          
          // Simulated token verification with the server
          await new Promise(r => setTimeout(r, 1200));
          
          if (parsedUser.token) {
            setUser(parsedUser);
          } else {
            console.warn("Invalid session token detected.");
            localStorage.removeItem('alcortex_user');
          }
        } catch (e) {
          console.error("Session integrity check failed", e);
          localStorage.removeItem('alcortex_user');
        } finally {
          setIsVerifying(false);
        }
      }
    };

    validateSession();
    
    // Load patient records
    databaseService.getRecords().then(setRecords);

    // Responsive sidebar handling
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('alcortex_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('alcortex_user');
    setSelectedRecord(null);
    setActiveTab('dashboard');
  };

  const handleSaveRecord = async (record: SavedRecord) => {
    if (user) {
      await databaseService.saveDiagnosis(user.email, record);
      const updated = await databaseService.getRecords();
      setRecords(updated);
    }
  };

  const openRecord = (record: SavedRecord) => {
    setSelectedRecord(record);
    setActiveTab('emr');
    setIsSearchOpen(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-blue-500/20 blur-2xl animate-pulse rounded-full" />
          <ShieldCheck size={48} className="text-blue-500 relative animate-bounce" />
        </div>
        <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] opacity-40">Verifying Clinical Session Integrity...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  const t = translations[user.language] || translations['English'];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
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
                aria-label="Open Sidebar"
              >
                <Menu size={20} />
              </button>
            )}
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight">{t[activeTab]}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-1.5 h-1.5 rounded-full ${user.provider === 'Email' ? 'bg-blue-500' : 'bg-teal-500'}`} />
                <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                  Dr. {user.name} • {user.provider} Session
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setIsSearchOpen(true)}
               className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-100 shadow-sm transition-all group flex items-center gap-2"
               title="Global Patient Search"
             >
                <Search size={20} className="group-hover:scale-110 transition-transform" />
                <span className="hidden md:block text-[10px] font-black uppercase tracking-widest px-1">Search</span>
             </button>
             <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden md:block"></div>
             <div className="hidden md:block text-right">
                <p className="text-[10px] font-black text-slate-800 leading-none">ALCORTEX AI v1.2</p>
                <p className="text-[8px] font-bold text-teal-500 uppercase tracking-tighter">Proprietary AI Engine Active</p>
             </div>
             <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white font-black shadow-lg">
                {user.name[0]}
             </div>
          </div>
        </header>

        <div className="animate-fade-in">
          {activeTab === 'dashboard' && (
            <Dashboard 
              user={user} 
              setActiveTab={setActiveTab} 
              records={records} 
              onSelectRecord={openRecord} 
            />
          )}
          {activeTab === 'diagnosis' && <DiagnosisForm user={user} onSaveRecord={handleSaveRecord} />}
          {activeTab === 'imaging' && <ImagingPage user={user} />}
          {activeTab === 'settings' && <SettingsPage user={user} setUser={setUser} />}
          {activeTab === 'emr' && (
            <EMRPage 
              user={user} 
              records={records} 
              selectedRecord={selectedRecord} 
              setSelectedRecord={setSelectedRecord} 
            />
          )}
        </div>
      </main>

      <GlobalSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        records={records} 
        onSelectRecord={openRecord}
        language={user.language}
      />
    </div>
  );
};

export default App;