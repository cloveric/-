import React, { useState, useMemo } from 'react';
import { DailyRecord } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { InkSunIcon, InkMoonIcon } from './ZenIcons';
import { X } from 'lucide-react';

interface StatsProps {
  records: DailyRecord[];
  onToggleRecord: (type: 'morning' | 'evening', dateStr: string) => void;
}

type ViewMode = 'week' | 'month' | 'year';

// Status: 0=None, 1=Morning Only, 2=Evening Only, 3=Both
const getStatus = (morning: boolean | undefined, evening: boolean | undefined): number => {
  if (morning && evening) return 3;
  if (morning) return 1;
  if (evening) return 2;
  return 0;
};

// Color Palette for Logic - Softer, more Zen
const COLORS = {
  NONE: '#e5e5e5',       
  MORNING: '#d4b483',    
  EVENING: '#94a3b8',    
  BOTH: '#5c7c64',       
};

// Helper: Get local YYYY-MM-DD string to match App.tsx logic and fix timezone bugs
const getLocalISOString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Stats: React.FC<StatsProps> = ({ records, onToggleRecord }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [displayDate, setDisplayDate] = useState(new Date()); // For Month View
  const [displayYear, setDisplayYear] = useState(new Date().getFullYear()); // For Year View
  const [editingInfo, setEditingInfo] = useState<{ date: string, dayName: string } | null>(null);

  const totalSessions = records.reduce((acc, curr) => {
    return acc + (curr.morning ? 1 : 0) + (curr.evening ? 1 : 0);
  }, 0);

  // --- WEEKLY DATA ---
  const weeklyData = useMemo(() => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      // Fix: Use local date string instead of UTC
      const dateStr = getLocalISOString(d);
      
      const record = records.find(r => r.date === dateStr);
      const status = getStatus(record?.morning, record?.evening);

      const dayName = new Intl.DateTimeFormat('zh-CN', { weekday: 'short' }).format(d);
      // Logic for chart height/visuals
      const height = status === 3 ? 100 : (status > 0 ? 60 : 5); 
      
      last7Days.push({ name: dayName, date: dateStr, status, height, fullDate: d });
    }
    return last7Days;
  }, [records]);

  // --- MONTHLY DATA ---
  const monthlyData = useMemo(() => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday
    
    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      // Fix: Use local date string instead of UTC
      const dateStr = getLocalISOString(d);
      const record = records.find(r => r.date === dateStr);
      const status = getStatus(record?.morning, record?.evening);
      
      days.push({ day: i, status, dateStr });
    }
    return days;
  }, [records, displayDate]);

  // --- YEARLY DATA (Specific Selected Year) ---
  const yearlyData = useMemo(() => {
    const months = [];
    // Generate data for all 12 months of the selected displayYear
    for (let m = 0; m < 12; m++) {
        const daysInMonth = new Date(displayYear, m + 1, 0).getDate();
        const monthDays = [];
        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(displayYear, m, d);
            // Fix: Use local date string (already implemented here correctly, but reinforced with helper)
            const dateStr = getLocalISOString(dateObj);

            const record = records.find(r => r.date === dateStr);
            const status = getStatus(record?.morning, record?.evening);
            monthDays.push({ status, date: dateStr });
        }
        months.push({ monthIndex: m, days: monthDays });
    }
    return months;
  }, [records, displayYear]);

  // Helper for colors
  const getColor = (status: number) => {
    switch(status) {
      case 3: return COLORS.BOTH;
      case 2: return COLORS.EVENING;
      case 1: return COLORS.MORNING;
      default: return COLORS.NONE;
    }
  };

  const getStatusLabel = (status: number) => {
    switch(status) {
        case 3: return "圆满";
        case 2: return "晚课";
        case 1: return "早课";
        default: return "未修";
    }
  }

  const changeMonth = (delta: number) => {
    const newDate = new Date(displayDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setDisplayDate(newDate);
  };

  const changeYear = (delta: number) => {
    setDisplayYear(prev => prev + delta);
  };

  const handleBarClick = (data: any) => {
    if (data && data.date) {
        setEditingInfo({ date: data.date, dayName: data.name });
    }
  };

  const closeEditModal = () => {
    setEditingInfo(null);
  };

  const currentEditingRecord = useMemo(() => {
    if (!editingInfo) return null;
    return records.find(r => r.date === editingInfo.date) || { date: editingInfo.date, morning: false, evening: false };
  }, [editingInfo, records]);

  return (
    <div className="w-full flex flex-col h-full bg-white/30 rounded-2xl p-4 backdrop-blur-sm border border-white/40 relative">
      
      {/* Header / Tabs */}
      <div className="flex justify-between items-center mb-4 flex-none">
        <span className="text-xs font-serif text-stone-400 tracking-widest pl-1">足迹 · {totalSessions}座</span>
        <div className="flex bg-stone-200/50 rounded-lg p-0.5 gap-1">
           {['week', 'month', 'year'].map((mode) => (
             <button
                key={mode}
                onClick={() => setViewMode(mode as ViewMode)}
                className={`
                    px-3 py-1 rounded-md text-[10px] font-serif tracking-widest transition-all duration-300
                    ${viewMode === mode 
                        ? 'bg-white text-stone-700 shadow-sm' 
                        : 'text-stone-400 hover:text-stone-600'}
                `}
             >
                {mode === 'week' ? '周' : mode === 'month' ? '月' : '年'}
             </button>
           ))}
        </div>
      </div>

      <div className="flex-1 relative min-h-0 w-full">
      {/* --- WEEK VIEW --- */}
      {viewMode === 'week' && (
        <div className="absolute inset-0 w-full h-full animate-in fade-in duration-700 z-10 flex items-end pb-2">
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#a8a29e', fontSize: 10, fontFamily: '"Noto Serif SC", serif' }} 
                dy={10}
                interval={0}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                            <div className="bg-white/95 border border-stone-100 px-2 py-1 rounded shadow-sm text-[10px] text-stone-600 font-serif">
                                {getStatusLabel(data.status)}
                            </div>
                        )
                    }
                    return null;
                }}
              />
              <Bar 
                 dataKey="height" 
                 radius={[4, 4, 4, 4]} 
                 barSize={12} 
                 animationDuration={1000}
                 onClick={handleBarClick}
                 className="cursor-pointer"
               >
                {weeklyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getColor(entry.status)} 
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* --- MONTH VIEW --- */}
      {viewMode === 'month' && (
        <div className="animate-in fade-in duration-700 relative z-10 h-full flex flex-col">
           <div className="flex justify-between items-center mb-4 px-2 flex-none">
              <button onClick={() => changeMonth(-1)} className="text-stone-400 hover:text-stone-600 font-serif text-sm px-2">←</button>
              <span className="text-stone-600 font-serif font-bold text-sm tracking-widest">
                {displayDate.getFullYear()} · {displayDate.getMonth() + 1}月
              </span>
              <button onClick={() => changeMonth(1)} className="text-stone-400 hover:text-stone-600 font-serif text-sm px-2">→</button>
           </div>
           
           <div className="grid grid-cols-7 gap-2 text-center mb-2">
             {['日', '一', '二', '三', '四', '五', '六'].map(day => (
               <div key={day} className="text-[9px] text-stone-400 font-serif">{day}</div>
             ))}
           </div>
           
           <div className="grid grid-cols-7 gap-2 flex-1 overflow-y-auto custom-scrollbar content-start">
             {monthlyData.map((d, i) => (
               <div key={i} className="aspect-square flex items-center justify-center relative">
                 {d && (
                   <>
                     <div 
                        className="absolute inset-0 rounded-full transition-all duration-500 transform hover:scale-110"
                        style={{ backgroundColor: d.status > 0 ? getColor(d.status) : 'transparent', opacity: d.status === 3 ? 1 : 0.7 }}
                     ></div>
                     <span className={`relative text-[10px] z-10 font-serif ${d.status === 3 ? 'text-white' : 'text-stone-500'}`}>
                       {d.day}
                     </span>
                   </>
                 )}
               </div>
             ))}
           </div>
        </div>
      )}

      {/* --- YEAR VIEW (Specific Year) --- */}
      {viewMode === 'year' && (
        <div className="animate-in fade-in duration-700 relative z-10 h-full flex flex-col">
          {/* Year Navigation Header */}
          <div className="flex justify-between items-center mb-4 px-2 flex-none">
              <button onClick={() => changeYear(-1)} className="text-stone-400 hover:text-stone-600 font-serif text-sm px-2">←</button>
              <span className="text-stone-600 font-serif font-bold text-sm tracking-widest">
                {displayYear}年
              </span>
              <button onClick={() => changeYear(1)} className="text-stone-400 hover:text-stone-600 font-serif text-sm px-2">→</button>
           </div>

          {/* 12-Month Grid */}
          <div className="grid grid-cols-3 gap-x-3 gap-y-6 flex-1 overflow-y-auto custom-scrollbar content-start pb-4 pr-1">
            {yearlyData.map((monthData) => (
              <div key={monthData.monthIndex} className="flex flex-col items-center">
                 {/* Month Label */}
                 <span className="text-[10px] text-stone-500 mb-2 font-serif font-bold opacity-80 border-b border-stone-200/50 pb-0.5 w-full text-center">
                    {monthData.monthIndex + 1}月
                 </span>
                 
                 {/* Days Dots - Increased size for visibility */}
                 <div className="grid grid-cols-7 gap-0.5">
                    {monthData.days.map((day, idx) => (
                        <div 
                            key={idx}
                            title={`${day.date}: ${getStatusLabel(day.status)}`}
                            className="w-[4px] h-[4px] rounded-[1px] transition-colors duration-300"
                            style={{ backgroundColor: getColor(day.status) }}
                        ></div>
                    ))}
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>

      {/* --- BACKFILL MODAL --- */}
      {editingInfo && currentEditingRecord && (
         <div className="absolute inset-0 z-50 flex items-center justify-center p-4 rounded-2xl bg-white/40 backdrop-blur-md animate-in fade-in zoom-in duration-200">
            <div className="bg-[#f7f5f0] w-full max-w-[200px] rounded-xl shadow-xl border border-stone-100 p-4 relative">
                <button 
                  onClick={closeEditModal}
                  className="absolute top-2 right-2 text-stone-400 hover:text-stone-600"
                >
                    <X size={14} />
                </button>
                
                <h3 className="text-center font-serif text-stone-600 text-sm font-bold tracking-widest mb-4">
                    补录 · {editingInfo.date.split('-')[1]}月{editingInfo.date.split('-')[2]}日 · {editingInfo.dayName}
                </h3>
                
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => onToggleRecord('morning', editingInfo.date)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${currentEditingRecord.morning ? 'bg-white border border-clay/30 shadow-sm' : 'hover:bg-black/5'}`}
                    >
                        <div className="w-8 h-8">
                            <InkSunIcon active={currentEditingRecord.morning} />
                        </div>
                        <span className={`text-[9px] font-serif ${currentEditingRecord.morning ? 'text-clay' : 'text-stone-400'}`}>早</span>
                    </button>
                    
                    <button
                        onClick={() => onToggleRecord('evening', editingInfo.date)}
                         className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${currentEditingRecord.evening ? 'bg-white border border-stone-300/30 shadow-sm' : 'hover:bg-black/5'}`}
                    >
                        <div className="w-8 h-8">
                            <InkMoonIcon active={currentEditingRecord.evening} />
                        </div>
                        <span className={`text-[9px] font-serif ${currentEditingRecord.evening ? 'text-stone-600' : 'text-stone-400'}`}>晚</span>
                    </button>
                </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Stats;