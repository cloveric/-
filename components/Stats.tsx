import React, { useState, useMemo } from 'react';
import { DailyRecord } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, BarChart3, Grid } from 'lucide-react';

interface StatsProps {
  records: DailyRecord[];
}

type ViewMode = 'week' | 'month' | 'year';

// Status: 0=None, 1=Morning Only, 2=Evening Only, 3=Both
const getStatus = (morning: boolean | undefined, evening: boolean | undefined): number => {
  if (morning && evening) return 3;
  if (morning) return 1;
  if (evening) return 2;
  return 0;
};

// Color Palette for Logic
const COLORS = {
  NONE: '#e5e5e5',       // Mist
  MORNING: '#d4b483',    // Clay/Gold (Warm)
  EVENING: '#94a3b8',    // Slate/Ink (Cool)
  BOTH: '#5c7c64',       // Bamboo (Complete)
};

const Stats: React.FC<StatsProps> = ({ records }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [displayDate, setDisplayDate] = useState(new Date());

  const totalSessions = records.reduce((acc, curr) => {
    return acc + (curr.morning ? 1 : 0) + (curr.evening ? 1 : 0);
  }, 0);

  // --- WEEKLY DATA ---
  const weeklyData = useMemo(() => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const record = records.find(r => r.date === dateStr);
      const status = getStatus(record?.morning, record?.evening);

      const dayName = new Intl.DateTimeFormat('zh-CN', { weekday: 'short' }).format(d);
      // Logic for chart height/visuals
      const height = status === 3 ? 2 : (status > 0 ? 1 : 0.1); 
      
      last7Days.push({ name: dayName, date: dateStr, status, height });
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
      const dateStr = d.toISOString().split('T')[0];
      const record = records.find(r => r.date === dateStr);
      const status = getStatus(record?.morning, record?.evening);
      
      days.push({ day: i, status, dateStr });
    }
    return days;
  }, [records, displayDate]);

  // --- YEARLY DATA (Grouped by Month) ---
  const yearlyDataGrouped = useMemo(() => {
    const today = new Date();
    const groups = [];
    
    // We want to show the last 12 months, ending with current month
    for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const year = d.getFullYear();
        const month = d.getMonth(); // 0-11
        const monthName = new Intl.DateTimeFormat('zh-CN', { month: 'short' }).format(d);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const monthDays = [];
        for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(year, month, day);
            const dateStr = dateObj.toISOString().split('T')[0];
            const record = records.find(r => r.date === dateStr);
            const status = getStatus(record?.morning, record?.evening);
            monthDays.push({ date: dateStr, status });
        }
        groups.push({ year, month, monthName, days: monthDays });
    }
    return groups;
  }, [records]);

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

  return (
    <div className="w-full bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-stone-100 shadow-sm mt-6 relative overflow-hidden">
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h3 className="text-stone-600 font-serif text-lg tracking-widest">修行足迹</h3>
        <div className="flex bg-stone-100 rounded-lg p-1">
          <button 
            onClick={() => setViewMode('week')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'week' ? 'bg-white shadow-sm text-stone-700' : 'text-stone-400'}`}
          >
            <BarChart3 size={16} />
          </button>
          <button 
            onClick={() => setViewMode('month')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'month' ? 'bg-white shadow-sm text-stone-700' : 'text-stone-400'}`}
          >
            <Calendar size={16} />
          </button>
          <button 
            onClick={() => setViewMode('year')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'year' ? 'bg-white shadow-sm text-stone-700' : 'text-stone-400'}`}
          >
            <Grid size={16} />
          </button>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-end gap-3 text-[10px] text-stone-400 mb-4 font-sans relative z-10">
         <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS.MORNING}}></span>早课</div>
         <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS.EVENING}}></span>晚课</div>
         <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS.BOTH}}></span>圆满</div>
      </div>

      {/* --- WEEK VIEW --- */}
      {viewMode === 'week' && (
        <div className="h-48 w-full animate-in fade-in duration-500 relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#8f8f8f', fontSize: 12, fontFamily: 'serif' }} 
                dy={10}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                            <div className="bg-white/90 backdrop-blur border border-stone-100 p-2 rounded-lg shadow-sm text-xs text-stone-600 font-serif">
                                {getStatusLabel(data.status)}
                            </div>
                        )
                    }
                    return null;
                }}
              />
              <Bar dataKey="height" radius={[4, 4, 4, 4]} barSize={24} animationDuration={1000}>
                {weeklyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getColor(entry.status)} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* --- MONTH VIEW --- */}
      {viewMode === 'month' && (
        <div className="animate-in fade-in duration-500 relative z-10">
           <div className="flex justify-between items-center mb-4 px-2">
              <button onClick={() => changeMonth(-1)} className="text-stone-400 hover:text-stone-600 font-serif">←</button>
              <span className="text-stone-700 font-serif font-bold">
                {displayDate.getFullYear()}年 {displayDate.getMonth() + 1}月
              </span>
              <button onClick={() => changeMonth(1)} className="text-stone-400 hover:text-stone-600 font-serif">→</button>
           </div>
           <div className="grid grid-cols-7 gap-1 text-center mb-2">
             {['日', '一', '二', '三', '四', '五', '六'].map(day => (
               <div key={day} className="text-xs text-stone-400 font-serif">{day}</div>
             ))}
           </div>
           <div className="grid grid-cols-7 gap-2">
             {monthlyData.map((d, i) => (
               <div key={i} className="aspect-square flex items-center justify-center relative">
                 {d && (
                   <>
                     <div 
                        className="absolute inset-0 rounded-full transition-colors duration-500"
                        style={{ backgroundColor: d.status > 0 ? getColor(d.status) : 'transparent', opacity: d.status === 3 ? 1 : 0.6 }}
                     ></div>
                     <span className={`relative text-sm z-10 font-serif ${d.status === 3 ? 'text-white' : 'text-stone-600'}`}>
                       {d.day}
                     </span>
                   </>
                 )}
               </div>
             ))}
           </div>
        </div>
      )}

      {/* --- YEAR VIEW (Grouped) --- */}
      {viewMode === 'year' && (
        <div className="animate-in fade-in duration-500 relative z-10">
          <h4 className="text-center text-xs text-stone-400 mb-4 font-serif">过去十二个月</h4>
          <div className="grid grid-cols-3 gap-x-2 gap-y-4 max-h-[300px] overflow-y-auto custom-scrollbar p-1">
            {yearlyDataGrouped.map((group, i) => (
              <div key={i} className="flex flex-col items-center">
                 <span className="text-[10px] text-stone-400 mb-1 font-serif scale-90">{group.monthName}</span>
                 <div className="grid grid-cols-7 gap-[2px]">
                    {group.days.map((day, dIndex) => (
                        <div 
                            key={dIndex}
                            title={`${day.date}: ${getStatusLabel(day.status)}`}
                            className="w-[3px] h-[3px] rounded-[0.5px]"
                            style={{ backgroundColor: getColor(day.status) }}
                        ></div>
                    ))}
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center mt-6 px-4 pt-4 border-t border-stone-100 text-sm text-stone-500 relative z-10">
        <div className="text-center">
          <p className="text-xs text-stone-400 mb-1">累计修习</p>
          <p className="text-lg font-serif text-ink tracking-widest">{totalSessions} <span className="text-xs">座</span></p>
        </div>
      </div>
    </div>
  );
};

export default Stats;