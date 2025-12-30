
import React from 'react';

interface SentinelBotProps {
  state: 'idle' | 'typing' | 'secure' | 'success';
}

const SentinelBot: React.FC<SentinelBotProps> = ({ state }) => {
  // Cyber Bear Colors
  const furMain = "#334155"; // Slate 700
  const furMuzzle = "#cbd5e1"; // Slate 200
  const glowColor = "#2dd4bf"; // Teal 400
  const vestColor = "#f8fafc"; // White/Slate 50

  return (
    <div className="relative w-64 h-64 mx-auto z-30 transition-all duration-700 transform hover:scale-105 pointer-events-none">
      {/* Cyber Glow Aura */}
      <div className={`absolute inset-0 blur-[50px] rounded-full transition-colors duration-500 ${
        state === 'success' ? 'bg-teal-400/30' : state === 'secure' ? 'bg-rose-400/30' : 'bg-blue-400/20'
      }`}></div>
      
      {/* Expanded viewBox to ensure no clipping anywhere (Top -25, Total height 130) */}
      <svg viewBox="0 -25 100 130" className="relative w-full h-full drop-shadow-2xl overflow-visible">
        <defs>
          <linearGradient id="cyberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={glowColor} />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
          <filter id="neonGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Success Icon Bubble - Positioned high with plenty of room */}
        <g className={`transition-all duration-500 ${state === 'success' ? 'opacity-100 translate-y-[-15px] scale-110' : 'opacity-0 translate-y-10 scale-0'}`}>
           <circle cx="50" cy="-10" r="7" fill="url(#cyberGrad)" />
           <path d="M46 -10 L49 -7 L54 -12" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>

        {/* Ears - Centered properly */}
        <circle cx="25" cy="25" r="11" fill={furMain} />
        <circle cx="25" cy="25" r="6" fill="#1e293b" />
        <circle cx="75" cy="25" r="11" fill={furMain} />
        <circle cx="75" cy="25" r="6" fill="#1e293b" />

        {/* Body - Peeking style restored */}
        <g>
          <ellipse cx="50" cy="80" rx="36" ry="24" fill={furMain} />
          {/* Tactical Medical Vest */}
          <path d="M14 75 Q50 62 86 75 V100 H14 Z" fill={vestColor} stroke="#cbd5e1" strokeWidth="0.5" />
          <rect x="36" y="82" width="28" height="12" rx="4" fill="#e2e8f0" />
          <path d="M45 88 H55 M50 83 V93" stroke={glowColor} strokeWidth="2" strokeLinecap="round" filter="url(#neonGlow)" />
          
          {/* Tactical Straps */}
          <path d="M14 75 L36 82 M86 75 L64 82" stroke="#1e293b" strokeWidth="3" />
        </g>

        {/* Head Group - Slightly shifted down within SVG */}
        <g className={`transition-transform duration-500 origin-bottom ${state === 'typing' ? 'rotate-[-2deg] translate-x-[-1px]' : 'rotate-0'}`}>
          <circle cx="50" cy="42" r="36" fill={furMain} />
          
          {/* Muzzle */}
          <ellipse cx="50" cy="58" rx="14" ry="11" fill={furMuzzle} />
          <path d="M46 60 Q50 64 54 60" stroke="#1e293b" fill="none" strokeWidth="2" strokeLinecap="round" />
          <path d="M45 54 L55 54 L50 58 Z" fill="#0f172a" />

          {/* Eyes & Tech Visor */}
          <g className={`transition-all duration-500 ${state === 'secure' ? 'opacity-0 scale-y-0' : 'opacity-100 scale-y-100'}`}>
            <rect 
                x="16" y="34" width="68" height="18" rx="5" 
                fill="rgba(45, 212, 191, 0.08)" 
                stroke={glowColor} 
                strokeWidth="1.5" 
                filter="url(#neonGlow)"
            />
            {/* Scanlines */}
            <path d="M18 38 H82 M18 43 H82 M18 48 H82" stroke={glowColor} strokeWidth="0.5" opacity="0.2" />
            
            {/* Eye - Left */}
            <g transform={`translate(${state === 'typing' ? '3' : '0'}, ${state === 'typing' ? '1' : '0'})`}>
              <circle cx="35" cy="43" r="6.5" fill="#0f172a" />
              <circle cx="37" cy="41" r="2" fill="white" />
              <path d="M28 37 L34 40" stroke={furMain} strokeWidth="2.5" />
            </g>
            
            {/* Eye - Right */}
            <g transform={`translate(${state === 'typing' ? '3' : '0'}, ${state === 'typing' ? '1' : '0'})`}>
              <circle cx="65" cy="43" r="6.5" fill="#0f172a" />
              <circle cx="67" cy="41" r="2" fill="white" />
              <path d="M72 37 L66 40" stroke={furMain} strokeWidth="2.5" />
            </g>
          </g>

          {/* Secure Mode Hide */}
          <g className={`transition-all duration-500 ${state === 'secure' ? 'opacity-100' : 'opacity-0'}`}>
             <path d="M30 45 Q36 51 42 45" stroke="#0f172a" fill="none" strokeWidth="3" strokeLinecap="round" />
             <path d="M58 45 Q64 51 70 45" stroke="#0f172a" fill="none" strokeWidth="3" strokeLinecap="round" />
             <circle cx="22" cy="52" r="5" fill="#fb7185" opacity="0.4" />
             <circle cx="78" cy="52" r="5" fill="#fb7185" opacity="0.4" />
          </g>
        </g>

        {/* Paws - Overlapping bottom edge */}
        <g className="transition-all duration-500">
          <circle 
            cx="16" cy={state === 'secure' ? "42" : "80"} r="11" 
            fill={furMain} stroke="#1e293b" strokeWidth="1.5" 
            className="transition-all duration-500 shadow-xl"
            style={{ transform: state === 'secure' ? 'translateX(20px)' : 'none' }}
          />
          <circle 
            cx="84" cy={state === 'secure' ? "42" : "80"} r="11" 
            fill={furMain} stroke="#1e293b" strokeWidth="1.5" 
            className="transition-all duration-500 shadow-xl"
            style={{ transform: state === 'secure' ? 'translateX(-20px)' : 'none' }}
          />
        </g>
      </svg>
    </div>
  );
};

export default SentinelBot;
