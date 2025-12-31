
import React, { useEffect, useState } from 'react';
import AlcortexLogo from './Logo';
import { Activity, ShieldCheck, Cpu, Dna } from 'lucide-react';

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('BOOTING_ALCORTEX_CORE');
  const [isExiting, setIsExiting] = useState(false);

  const statuses = [
    { p: 10, t: 'INITIALIZING_NEURAL_NETWORK' },
    { p: 30, t: 'MAPPING_BIOCHEMICAL_MARKERS' },
    { p: 55, t: 'SYNCING_CLINICAL_DATABASE' },
    { p: 80, t: 'SECURING_EMR_VAULT' },
    { p: 95, t: 'READY_FOR_CLINICAL_USE' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;
        const currentStatus = statuses.find(s => s.p === next);
        if (currentStatus) setStatus(currentStatus.t);
        
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsExiting(true);
            setTimeout(onComplete, 800);
          }, 500);
          return 100;
        }
        return next;
      });
    }, 30);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center transition-all duration-1000 ease-in-out ${isExiting ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100'}`}>
      {/* Background Tech Effects */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#2dd4bf 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Pulsating Logo Container */}
        <div className="relative mb-12 animate-float">
          <div className="absolute inset-0 bg-blue-500/30 blur-3xl rounded-full scale-150 animate-pulse"></div>
          <AlcortexLogo size={120} className="relative drop-shadow-[0_0_35px_rgba(37,99,235,0.5)]" />
        </div>

        {/* Branding */}
        <h1 className="text-4xl font-black text-white tracking-[0.3em] mb-2 text-center">
          ALCORTEX<span className="text-teal-400">AI</span>
        </h1>
        <p className="text-[10px] font-black text-slate-500 tracking-[0.5em] uppercase mb-12">
          Precision Diagnostic Intelligence
        </p>

        {/* Progress System */}
        <div className="w-64 space-y-4">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping"></div>
              <span className="text-[9px] font-black text-teal-400 tracking-widest">{status}</span>
            </div>
            <span className="text-[10px] font-black text-white opacity-40">{progress}%</span>
          </div>
          
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-teal-400 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(45,212,191,0.5)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="absolute bottom-12 flex gap-8 opacity-30">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-white" />
            <span className="text-[8px] font-bold text-white uppercase tracking-widest">Hi-Res Security</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-white" />
            <span className="text-[8px] font-bold text-white uppercase tracking-widest">Neural V1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
