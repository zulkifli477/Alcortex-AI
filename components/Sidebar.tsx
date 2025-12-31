import React from 'react';
import { 
  LayoutDashboard, 
  Stethoscope, 
  FileText, 
  Settings, 
  LogOut, 
  Image as ImageIcon,
  ChevronLeft,
  X
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import AlcortexLogo from './Logo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  language: Language;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, language, isOpen, setIsOpen }) => {
  const t = translations[language];
  
  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'diagnosis', label: t.diagnosis, icon: Stethoscope },
    { id: 'imaging', label: t.imaging, icon: ImageIcon },
    { id: 'emr', label: t.emr, icon: FileText },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Panel */}
      <aside 
        className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-100 z-40 transition-all duration-300 ease-in-out shadow-2xl lg:shadow-sm ${
          isOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full lg:translate-x-[-100%]'
        }`}
      >
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlcortexLogo className="drop-shadow-sm" size={38} />
            <span className="text-xl font-black text-slate-800 tracking-tighter">ALCORTEX</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
          >
            <ChevronLeft size={20} className="hidden lg:block" />
            <X size={20} className="lg:hidden" />
          </button>
        </div>

        <nav className="flex-1 mt-4 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 1024) setIsOpen(false);
              }}
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
    </>
  );
};

export default Sidebar;