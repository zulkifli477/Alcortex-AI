
import React from 'react';
import { 
  LayoutDashboard, 
  Stethoscope, 
  FileText, 
  Settings, 
  LogOut, 
  Image as ImageIcon 
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import AlcortexLogo from './Logo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  language: Language;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, language }) => {
  const t = translations[language];
  
  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'diagnosis', label: t.diagnosis, icon: Stethoscope },
    { id: 'imaging', label: t.imaging, icon: ImageIcon },
    { id: 'emr', label: t.emr, icon: FileText },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 h-screen flex flex-col fixed left-0 top-0 z-20 shadow-sm transition-all">
      <div className="p-8 flex items-center gap-4">
        <AlcortexLogo className="drop-shadow-sm" size={44} />
        <span className="text-2xl font-black text-slate-800 tracking-tighter">ALCORTEX</span>
      </div>

      <nav className="flex-1 mt-6 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${
              activeTab === item.id 
              ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-xl shadow-blue-500/20' 
              : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            }`}
          >
            <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-slate-300 group-hover:text-blue-500'} />
            <span className="font-bold text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-50">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-rose-400 hover:bg-rose-50 transition-all font-bold text-sm"
        >
          <LogOut size={20} />
          <span>{t.signout}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
