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
    if (streak < 30) return ZenLevel.TREE; // Renamed conceptually to "Bud"
    if (streak < 60) return ZenLevel.BLOOM;
    return ZenLevel.FOREST; // Renamed conceptually to "Full Bloom"
  }, [streak]);

  // CSS for gentle, natural animations
  const styles = (
    <style>{`
      @keyframes sway-gentle {
        0%, 100% { transform: rotate(-1deg); }
        50% { transform: rotate(1deg); }
      }
      @keyframes grow-breathe {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
      }
      .lotus-stem {
        stroke: #5c7c64;
        stroke-width: 2px;
        fill: none;
        stroke-linecap: round;
      }
      .lotus-petal {
        fill: #fdf2f2;
        stroke: #d0a0a0;
        stroke-width: 1.5px;
        stroke-linejoin: round;
      }
      .lotus-pad {
        fill: #7fa080;
        stroke: #5c7c64;
        stroke-width: 1.5px;
      }
      .anim-sway {
        transform-box: view-box;
        transform-origin: 50% 100%;
        animation: sway-gentle 6s ease-in-out infinite;
      }
      .anim-breathe {
        transform-box: view-box;
        transform-origin: 50% 60%;
        animation: grow-breathe 5s ease-in-out infinite;
      }
    `}</style>
  );

  const renderVisual = () => {
    switch (level) {
      case ZenLevel.SEED:
        // Level 0: A simple seed in the mud
        return (
          <g transform="translate(100, 140)">
             <ellipse cx="0" cy="0" rx="6" ry="4" fill="#a68a64" />
             <path d="M-15 10 L15 10" stroke="#a68a64" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
          </g>
        );

      case ZenLevel.SPROUT:
        // Level 1: A small curled sprout rising
        return (
          <g className="anim-sway">
            <path d="M100 150 Q100 130 105 125" className="lotus-stem" strokeWidth="3" />
            <path d="M105 125 Q110 115 100 115 Q95 120 105 125" fill="#7fa080" stroke="#5c7c64" strokeWidth="1" />
            <path d="M80 150 L120 150" stroke="#a68a64" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
          </g>
        );

      case ZenLevel.SAPLING:
        // Level 2: A floating lotus leaf (Pad) - Side view
        return (
          <g className="anim-sway">
             <path d="M100 150 L100 110" className="lotus-stem" strokeWidth="2.5" />
             {/* Side view of a pad */}
             <path d="M70 110 Q100 115 130 110 Q100 105 70 110" className="lotus-pad" />
             <line x1="100" y1="110" x2="100" y2="112" stroke="#5c7c64" strokeWidth="2" />
          </g>
        );

      case ZenLevel.TREE: 
        // Level 3: A closed Flower Bud rising high
        return (
          <g className="anim-sway">
             <path d="M100 150 L100 90" className="lotus-stem" strokeWidth="3" />
             {/* The Bud */}
             <path d="M100 90 Q85 60 100 35 Q115 60 100 90" fill="#fdf2f2" stroke="#d4b483" strokeWidth="1.5" />
             <path d="M100 90 Q95 60 100 35" fill="none" stroke="#d4b483" strokeWidth="0.5" />
          </g>
        );

      case ZenLevel.BLOOM:
        // Level 4: Half-open Lotus (Side View)
        return (
          <g className="anim-breathe">
             <path d="M100 150 L100 100" className="lotus-stem" strokeWidth="3" />
             <g transform="translate(0, -10)">
                {/* Back Petals */}
                <path d="M100 110 Q80 80 90 50 Q100 70 100 110" className="lotus-petal" fill="#fff" />
                <path d="M100 110 Q120 80 110 50 Q100 70 100 110" className="lotus-petal" fill="#fff" />
                {/* Front Petals (Main) */}
                <path d="M100 110 Q70 80 60 60 Q85 70 100 110" className="lotus-petal" />
                <path d="M100 110 Q130 80 140 60 Q115 70 100 110" className="lotus-petal" />
                <path d="M100 110 Q85 60 100 40 Q115 60 100 110" className="lotus-petal" fill="#fff5f5" />
             </g>
          </g>
        );

      case ZenLevel.FOREST:
        // Level 5: Fully Open Lotus (Side View) - "Perfect" but simple
        return (
          <g className="anim-breathe">
             <path d="M100 150 L100 110" className="lotus-stem" strokeWidth="3" />
             <g transform="translate(0, -5)">
                {/* Lower wide petals */}
                <path d="M100 115 Q60 110 40 90 Q70 100 100 115" className="lotus-petal" />
                <path d="M100 115 Q140 110 160 90 Q130 100 100 115" className="lotus-petal" />
                
                {/* Mid petals */}
                <path d="M100 115 Q70 80 60 50 Q90 80 100 115" className="lotus-petal" />
                <path d="M100 115 Q130 80 140 50 Q110 80 100 115" className="lotus-petal" />
                
                {/* Center bud/petals */}
                <path d="M100 115 Q90 70 100 40 Q110 70 100 115" className="lotus-petal" fill="#fff" />
                
                {/* Golden Stamen hints */}
                <circle cx="95" cy="105" r="1.5" fill="#e6b800" opacity="0.8" />
                <circle cx="100" cy="102" r="1.5" fill="#e6b800" opacity="0.8" />
                <circle cx="105" cy="105" r="1.5" fill="#e6b800" opacity="0.8" />
             </g>
          </g>
        );

      default:
        return null;
    }
  };

  const getLevelName = () => {
    switch(level) {
      case ZenLevel.SEED: return "初心";
      case ZenLevel.SPROUT: return "萌芽";
      case ZenLevel.SAPLING: return "立叶";
      case ZenLevel.TREE: return "含苞";
      case ZenLevel.BLOOM: return "初放";
      case ZenLevel.FOREST: return "圆满";
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-0 mx-auto transition-all duration-700 relative">
      {styles}
      <div className="w-40 h-40 relative flex items-end justify-center">
        <svg width="100%" height="100%" viewBox="0 0 200 160" className="overflow-visible">
          {renderVisual()}
        </svg>
      </div>
      <div className="flex flex-col items-center justify-center mt-2">
        <div className="text-stone-600 text-sm font-medium tracking-[0.3em] font-serif">{getLevelName()}</div>
        <div className="text-stone-400 text-[10px] mt-1 tracking-widest font-serif">
          连续 {streak} 天
        </div>
      </div>
    </div>
  );
};

export default ZenGarden;