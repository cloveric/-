
import React from 'react';
import { DailyRecord } from '../types';
import { InkSunIcon, InkMoonIcon } from './ZenIcons';
import { Mountain, Footprints, Flower2, Sprout, Feather } from 'lucide-react';

interface InsightsProps {
  records: DailyRecord[];
  currentStreak: number;
}

const Insights: React.FC<InsightsProps> = ({ records, currentStreak }) => {
  
  // 1. Calculate Longest Streak
  const calculateLongestStreak = () => {
    if (records.length === 0) return 0;
    const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
    
    let maxStreak = 0;
    let tempStreak = 0;
    
    // Simple logic: iterate days. If consecutive (gap <= 1 day), increment.
    for (let i = 0; i < sorted.length; i++) {
        const entry = sorted[i];
        if (entry.morning || entry.evening) {
            if (i > 0) {
                const prevDate = new Date(sorted[i-1].date);
                const currDate = new Date(entry.date);
                const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) {
                    tempStreak++;
                } else if (diffDays > 1) {
                    maxStreak = Math.max(maxStreak, tempStreak);
                    tempStreak = 1;
                }
            } else {
                tempStreak = 1;
            }
        }
    }
    return Math.max(maxStreak, tempStreak, currentStreak);
  };

  const longestStreak = calculateLongestStreak();

  // 2. Count Total Sessions
  const totalMorning = records.filter(r => r.morning).length;
  const totalEvening = records.filter(r => r.evening).length;
  const totalSessions = totalMorning + totalEvening;

  // 3. Perfect Days (Both morning and evening)
  const perfectDays = records.filter(r => r.morning && r.evening).length;

  // 4. Balance Percentage
  const totalActive = totalMorning + totalEvening;
  const morningPercent = totalActive === 0 ? 50 : Math.round((totalMorning / totalActive) * 100);
  const eveningPercent = totalActive === 0 ? 50 : 100 - morningPercent;

  return (
    <div className="h-full w-full flex flex-col p-2 space-y-4 overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex flex-col items-center justify-center py-4">
            <h2 className="text-xl font-bold font-serif tracking-[0.3em] text-stone-700">统计</h2>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
            
            {/* Card 1: Total Accumulation */}
            <div className="bg-white/60 p-4 rounded-2xl border border-white shadow-sm flex flex-col items-center justify-center gap-2">
                <div className="text-stone-600 opacity-80"><Footprints size={18} /></div>
                <div className="text-2xl font-bold text-stone-700 font-serif">{totalSessions}</div>
                <div className="text-[10px] text-stone-500 font-serif tracking-widest">总定课(次)</div>
            </div>

            {/* Card 2: Longest Streak */}
            <div className="bg-white/60 p-4 rounded-2xl border border-white shadow-sm flex flex-col items-center justify-center gap-2">
                <div className="text-stone-600 opacity-80"><Mountain size={18} /></div>
                <div className="text-2xl font-bold text-stone-700 font-serif">{longestStreak}</div>
                <div className="text-[10px] text-stone-500 font-serif tracking-widest">最长连续(天)</div>
            </div>

             {/* Card 3: Perfect Days */}
             <div className="bg-white/60 p-4 rounded-2xl border border-white shadow-sm flex flex-col items-center justify-center gap-2">
                <div className="text-bamboo opacity-80"><Flower2 size={18} /></div>
                <div className="text-2xl font-bold text-stone-700 font-serif">{perfectDays}</div>
                <div className="text-[10px] text-stone-500 font-serif tracking-widest">早晚皆修(天)</div>
            </div>

             {/* Card 4: Current Streak (Mirroring home but good for context) */}
             <div className="bg-white/60 p-4 rounded-2xl border border-white shadow-sm flex flex-col items-center justify-center gap-2">
                <div className="text-clay opacity-80"><Sprout size={18} /></div>
                <div className="text-2xl font-bold text-stone-700 font-serif">{currentStreak}</div>
                <div className="text-[10px] text-stone-500 font-serif tracking-widest">当前连续(天)</div>
            </div>

        </div>

        {/* Balance Section */}
        <div className="bg-white/60 p-5 rounded-2xl border border-white shadow-sm flex flex-col gap-4">
             <div className="flex items-center gap-2 text-stone-500">
                <Feather size={14} />
                <span className="text-xs font-serif tracking-widest font-bold">早晚比例</span>
             </div>

             <div className="flex items-center justify-between px-2">
                <div className="flex flex-col items-center gap-1">
                     <div className="w-8 h-8"><InkSunIcon active={true} /></div>
                     <span className="text-[10px] text-stone-400 font-serif">{morningPercent}%</span>
                </div>
                
                {/* Progress Bar */}
                <div className="flex-1 mx-4 h-1.5 bg-stone-200 rounded-full overflow-hidden flex">
                    <div className="bg-clay transition-all duration-1000" style={{ width: `${morningPercent}%` }}></div>
                    <div className="bg-stone-400 transition-all duration-1000" style={{ width: `${eveningPercent}%` }}></div>
                </div>

                <div className="flex flex-col items-center gap-1">
                     <div className="w-8 h-8"><InkMoonIcon active={true} /></div>
                     <span className="text-[10px] text-stone-400 font-serif">{eveningPercent}%</span>
                </div>
             </div>
             
             <p className="text-[9px] text-stone-400 text-center font-serif leading-relaxed">
                {Math.abs(morningPercent - eveningPercent) < 10 
                    ? "早晚均衡" 
                    : morningPercent > eveningPercent 
                        ? "早课较多" 
                        : "晚课较多"}
             </p>
        </div>

    </div>
  );
};

export default Insights;
