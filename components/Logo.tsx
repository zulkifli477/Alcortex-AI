
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

const AlcortexLogo: React.FC<LogoProps> = ({ className = "", size = 40 }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-2xl"
      >
        <defs>
          <linearGradient id="alcortexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" /> {/* Blue 600 */}
            <stop offset="100%" stopColor="#2dd4bf" /> {/* Teal 400 */}
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Hexagon - High-Tech Biological Structure */}
        <path
          d="M50 8L86.4 29V71L50 92L13.6 71V29L50 8Z"
          stroke="url(#alcortexGradient)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          fill="url(#alcortexGradient)"
          fillOpacity="0.05"
        />
        
        {/* The Core 'A' Silhouette */}
        <path
          d="M32 75L50 25L68 75"
          stroke="url(#alcortexGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />
        
        {/* Refined EKG Pulse - Integrated into the crossbar */}
        <path
          d="M38 56H43L46 48L51 64L54 56H62"
          stroke="url(#alcortexGradient)"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Central Clinical Intersection (Subtle Medical Cross) */}
        <rect x="48" y="54" width="4" height="4" rx="1" fill="white" fillOpacity="0.8" />
        
        {/* Professional Synapse Nodes */}
        <circle cx="32" cy="75" r="4.5" fill="url(#alcortexGradient)" />
        <circle cx="68" cy="78" r="4.5" fill="url(#alcortexGradient)" />
        <circle cx="50" cy="25" r="4.5" fill="url(#alcortexGradient)" />

        {/* Data/Biological Flow Particles */}
        <circle cx="80" cy="35" r="2" fill="url(#alcortexGradient)" opacity="0.4" />
        <circle cx="20" cy="45" r="2" fill="url(#alcortexGradient)" opacity="0.4" />
        
        {/* Technological Connection Lines */}
        <path
          d="M50 18V6M22 75H10M78 75H90"
          stroke="url(#alcortexGradient)"
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="2 3"
        />
      </svg>
    </div>
  );
};

export default AlcortexLogo;
