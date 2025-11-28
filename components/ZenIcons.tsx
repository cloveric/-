import React from 'react';

export const InkSunIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full transition-transform duration-700 hover:scale-105">
    <defs>
      <filter id="ink-blur-sun">
        <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
      </filter>
    </defs>
    <path 
      d="M50 15 C 75 15, 90 35, 85 60 C 80 85, 55 90, 35 85 C 15 80, 10 50, 25 25" 
      fill="none" 
      stroke={active ? "#a68a64" : "#d6d3d1"} 
      strokeWidth={active ? "4" : "3"} 
      strokeLinecap="round"
      style={{ filter: 'url(#ink-blur-sun)' }}
      className="transition-colors duration-500"
    />
    <circle 
      cx="55" cy="50" r={active ? "12" : "10"} 
      fill={active ? "#d4b483" : "transparent"} 
      stroke={active ? "none" : "#d6d3d1"}
      strokeWidth="2"
      className="transition-all duration-700"
    />
  </svg>
);

export const InkMoonIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full transition-transform duration-700 hover:scale-105">
    <defs>
      <filter id="ink-blur-moon">
        <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" />
      </filter>
    </defs>
    <path 
      d="M60 20 C 40 25, 30 50, 40 80 C 42 85, 50 90, 60 88" 
      fill="none" 
      stroke={active ? "#475569" : "#d6d3d1"} 
      strokeWidth={active ? "5" : "3"} 
      strokeLinecap="round"
      style={{ filter: 'url(#ink-blur-moon)' }}
      className="transition-colors duration-500"
    />
  </svg>
);
