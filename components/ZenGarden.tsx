import React, { useMemo } from 'react';
import { ZenLevel } from '../types';

interface ZenGardenProps {
  streak: number;
}

const ZenGarden: React.FC<ZenGardenProps> = ({ streak }) => {
  
  const level = useMemo(() => {
    if (streak < 3) return ZenLevel.SEED;
    if (streak < 7) return ZenLevel.SPROUT;
    if (streak < 14) return ZenLevel.SAPLING;
    if (streak < 30) return ZenLevel.TREE;
    if (streak < 60) return ZenLevel.BLOOM;
    return ZenLevel.FOREST;
  }, [streak]);

  // SVG Paths and configurations
  const renderVisual = () => {
    switch (level) {
      case ZenLevel.SEED:
        return (
          <g className="animate-pulse">
            <circle cx="100" cy="140" r="8" fill="#a68a64" />
            <path d="M90 150 L110 150" stroke="#a68a64" strokeWidth="2" strokeLinecap="round"/>
          </g>
        );
      case ZenLevel.SPROUT:
        return (
          <g className="transition-all duration-1000 ease-in-out">
            <path d="M100 150 Q100 130 90 120" stroke="#5c7c64" strokeWidth="3" fill="none" />
            <path d="M100 150 Q100 125 110 115" stroke="#5c7c64" strokeWidth="3" fill="none" />
            <circle cx="90" cy="120" r="4" fill="#7fa080" />
            <circle cx="110" cy="115" r="3" fill="#7fa080" />
            <path d="M80 150 L120 150" stroke="#a68a64" strokeWidth="2" strokeLinecap="round"/>
          </g>
        );
      case ZenLevel.SAPLING:
        return (
          <g>
            <path d="M100 150 C100 120 80 100 80 80" stroke="#5c7c64" strokeWidth="4" fill="none" />
            <path d="M100 150 C100 110 120 90 125 70" stroke="#5c7c64" strokeWidth="3.5" fill="none" />
            <ellipse cx="80" cy="80" rx="8" ry="12" fill="#7fa080" transform="rotate(-20 80 80)" />
            <ellipse cx="125" cy="70" rx="7" ry="10" fill="#7fa080" transform="rotate(20 125 70)" />
             <path d="M70 150 L130 150" stroke="#a68a64" strokeWidth="2" strokeLinecap="round"/>
          </g>
        );
      case ZenLevel.TREE:
        return (
          <g>
             {/* Trunk */}
             <path d="M100 150 L100 80" stroke="#5c4c34" strokeWidth="8" strokeLinecap="round" />
             {/* Branches */}
             <path d="M100 110 L70 80" stroke="#5c4c34" strokeWidth="5" strokeLinecap="round" />
             <path d="M100 100 L130 70" stroke="#5c4c34" strokeWidth="5" strokeLinecap="round" />
             {/* Foliage */}
             <circle cx="70" cy="80" r="15" fill="#5c7c64" opacity="0.8" />
             <circle cx="130" cy="70" r="15" fill="#5c7c64" opacity="0.8" />
             <circle cx="100" cy="60" r="20" fill="#4a6650" opacity="0.9" />
             <path d="M60 150 L140 150" stroke="#a68a64" strokeWidth="2" strokeLinecap="round"/>
          </g>
        );
      case ZenLevel.BLOOM:
      case ZenLevel.FOREST: // Forest adds a glow in CSS
        return (
          <g>
            {/* Lotus-like Abstract */}
             <path d="M100 150 L100 100" stroke="#5c7c64" strokeWidth="4" />
             <path d="M100 100 Q80 80 60 90 Q80 110 100 100" fill="#e0c0c0" stroke="#d0a0a0" />
             <path d="M100 100 Q120 80 140 90 Q120 110 100 100" fill="#e0c0c0" stroke="#d0a0a0" />
             <path d="M100 100 Q90 60 100 40 Q110 60 100 100" fill="#f0d0d0" stroke="#d0a0a0" />
             {/* Radiance for Forest */}
             {level === ZenLevel.FOREST && (
               <circle cx="100" cy="90" r="60" stroke="#e6b800" strokeWidth="1" strokeDasharray="4 4" opacity="0.3">
                  <animate attributeName="r" values="60;65;60" dur="4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.1;0.3" dur="4s" repeatCount="indefinite" />
               </circle>
             )}
              <path d="M50 150 L150 150" stroke="#a68a64" strokeWidth="2" strokeLinecap="round"/>
          </g>
        );
      default:
        return null;
    }
  };

  const getLevelName = () => {
    switch(level) {
      case ZenLevel.SEED: return "初心 (Seed)";
      case ZenLevel.SPROUT: return "萌芽 (Sprout)";
      case ZenLevel.SAPLING: return "成长 (Sapling)";
      case ZenLevel.TREE: return "坚定 (Steadfast)";
      case ZenLevel.BLOOM: return "绽放 (Bloom)";
      case ZenLevel.FOREST: return "圆满 (Harmony)";
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white/50 rounded-full w-64 h-64 shadow-inner shadow-stone-200 backdrop-blur-sm border border-white/60 mx-auto transition-all duration-700">
      <svg width="200" height="160" viewBox="0 0 200 160" className="overflow-visible">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {renderVisual()}
      </svg>
      <div className="mt-2 text-stone-500 text-sm font-medium tracking-widest">{getLevelName()}</div>
      <div className="text-stone-400 text-xs mt-1">
        连续 {streak} 天
      </div>
    </div>
  );
};

export default ZenGarden;