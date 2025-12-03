
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DailyRecord, QuoteData, ZenLevel } from './types';
import ZenGarden from './components/ZenGarden';
import Stats from './components/Stats';
import Insights from './components/Insights';
import UserAuth from './components/UserAuth';
import { fetchZenQuote } from './services/geminiService';
import { Sparkles, User } from 'lucide-react';
import { InkSunIcon, InkMoonIcon } from './components/ZenIcons';

const USERS_KEY = 'zenone_users_v1';
const DATA_PREFIX = 'zenone_data_';
const QUOTE_STORAGE_KEY = 'zenone_quote_v1';

const BuddhaBackground = ({ streak }: { streak: number }) => {
  // Opacity scales with streak to symbolize "manifestation" of enlightenment
  const opacity = Math.min(0.05 + (streak * 0.002), 0.18);
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-end justify-center">
         <div 
            className="w-full h-full text-stone-900 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: opacity }}
         >
             <svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
                <defs>
                  <filter id="ink-wash-buddha">
                    <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
                    <feGaussianBlur stdDeviation="0.5" />
                  </filter>
                </defs>
                
                <g filter="url(#ink-wash-buddha)" fill="none" stroke="currentColor" strokeLinecap="round">
                    
                    {/* Buddha Figure (Bottom Right - Side Profile Meditating) */}
                    <g transform="translate(80, 200) scale(1.4)">
                        {/* Head & Ushnisha */}
                        <path d="M120 100 Q105 100 105 120 Q105 145 130 145" strokeWidth="2" />
                        <path d="M115 95 Q125 90 135 100" strokeWidth="2" /> {/* Top bun */}

                        {/* Back & Robes */}
                        <path d="M105 120 Q80 140 70 180 Q60 240 100 260" strokeWidth="2.5" />
                        
                        {/* Knee/Legs folded */}
                        <path d="M180 260 Q160 260 140 240" strokeWidth="2" />
                        <path d="M100 260 L180 260" strokeWidth="2" />

                        {/* Arm/Hand in Dhyana Mudra */}
                        <path d="M130 145 Q150 150 155 180 Q160 210 140 220" strokeWidth="2" />
                        <path d="M140 220 Q150 220 160 215" strokeWidth="1.5" />

                        {/* Aura/Halo (Subtle) */}
                        <circle cx="130" cy="120" r="35" strokeWidth="0.5" opacity="0.3" strokeDasharray="5,5" />
                    </g>
                </g>
             </svg>
         </div>
    </div>
  );
};

// Helper: Get local YYYY-MM-DD string to fix timezone bugs
const getLocalISOString = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// -----------------------------

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [knownUsers, setKnownUsers] = useState<string[]>([]);
  
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [streak, setStreak] = useState(0);
  const [loadingQuote, setLoadingQuote] = useState(false);

  // View State: 0 = Home, 1 = Insights
  const [currentView, setCurrentView] = useState<0 | 1>(0);
  
  // Swipe State
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const mouseStartX = useRef<number | null>(null);

  // Use local date helper
  const getTodayStr = () => getLocalISOString(new Date());

  useEffect(() => {
    const savedUsers = localStorage.getItem(USERS_KEY);
    if (savedUsers) {
      setKnownUsers(JSON.parse(savedUsers));
    }
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setRecords([]);
      setStreak(0);
      setCurrentView(0); // Reset view on logout
      return;
    }

    const userKey = `${DATA_PREFIX}${currentUser}`;
    const savedData = localStorage.getItem(userKey);
    if (savedData) {
      const parsedRecords = JSON.parse(savedData);
      setRecords(parsedRecords);
      calculateStreak(parsedRecords);
    } else {
      setRecords([]);
      setStreak(0);
    }

    refreshQuote();
    
  }, [currentUser]);

  const handleLogin = (username: string) => {
    if (!knownUsers.includes(username)) {
      const updatedUsers = [...knownUsers, username];
      setKnownUsers(updatedUsers);
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    }
    setCurrentUser(username);
  };

  const handleDeleteUser = (usernameToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`确认要删除名称“${usernameToDelete}”及其所有修行记录吗？`)) {
        const updatedUsers = knownUsers.filter(u => u !== usernameToDelete);
        setKnownUsers(updatedUsers);
        localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
        localStorage.removeItem(`${DATA_PREFIX}${usernameToDelete}`);
        
        if (currentUser === usernameToDelete) {
            setCurrentUser(null);
        }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const refreshQuote = async () => {
    setLoadingQuote(true);
    const newQuote = await fetchZenQuote();
    setQuote(newQuote);
    localStorage.setItem(QUOTE_STORAGE_KEY, JSON.stringify(newQuote));
    setLoadingQuote(false);
  };

  const calculateStreak = (data: DailyRecord[]) => {
    if (data.length === 0) {
      setStreak(0);
      return;
    }
    const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date));
    let currentStreak = 0;
    const today = getTodayStr();
    
    // Check local date for yesterday
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    
    const todayEntry = sorted.find(r => r.date === today);
    // Start counting from today if today is done, otherwise start from yesterday
    const startCheckingFrom = (todayEntry && (todayEntry.morning || todayEntry.evening)) 
      ? new Date() 
      : yesterdayDate;

    let checkDate = startCheckingFrom;
    
    while (true) {
      const dateStr = getLocalISOString(checkDate);
      const entry = data.find(r => r.date === dateStr);
      
      if (entry && (entry.morning || entry.evening)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    setStreak(currentStreak);
  };

  const toggleSession = (type: 'morning' | 'evening', targetDateStr?: string) => {
    if (!currentUser) return;

    const dateToUpdate = targetDateStr || getTodayStr();
    const updatedRecords = [...records];
    const existingIndex = updatedRecords.findIndex(r => r.date === dateToUpdate);

    if (existingIndex >= 0) {
      updatedRecords[existingIndex] = {
        ...updatedRecords[existingIndex],
        [type]: !updatedRecords[existingIndex][type]
      };
    } else {
      updatedRecords.push({
        date: dateToUpdate,
        morning: type === 'morning',
        evening: type === 'evening'
      });
    }

    setRecords(updatedRecords);
    calculateStreak(updatedRecords);
    localStorage.setItem(`${DATA_PREFIX}${currentUser}`, JSON.stringify(updatedRecords));
  };

  const getTodayRecord = () => {
    return records.find(r => r.date === getTodayStr()) || { date: getTodayStr(), morning: false, evening: false };
  };

  // --- Touch Swipe Handlers ---
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    handleSwipe(distance);
    // Reset
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // --- Mouse Drag Handlers ---
  const onMouseDown = (e: React.MouseEvent) => {
      mouseStartX.current = e.clientX;
  };

  const onMouseUp = (e: React.MouseEvent) => {
      if (!mouseStartX.current) return;
      const distance = mouseStartX.current - e.clientX;
      handleSwipe(distance);
      mouseStartX.current = null;
  };

  const handleSwipe = (distance: number) => {
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentView === 0) {
      setCurrentView(1); // Go to Insights
    }
    if (isRightSwipe && currentView === 1) {
      setCurrentView(0); // Go back to Home
    }
  };

  const todayRecord = getTodayRecord();
  const containerClasses = "w-full h-[100dvh] sm:h-[90vh] sm:max-h-[850px] sm:max-w-[400px] sm:rounded-[2.5rem] sm:shadow-2xl sm:border-[8px] sm:border-white/50 bg-paper relative overflow-hidden flex flex-col transition-all duration-700";

  if (!currentUser) {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#f0eee9] sm:p-4">
        <div className={containerClasses}>
           <BuddhaBackground streak={0} />
           <UserAuth users={knownUsers} onLogin={handleLogin} onDelete={handleDeleteUser} />
        </div>
      </div>
    );
  }

  return (
    <div 
        className="min-h-[100dvh] w-full flex items-center justify-center bg-[#f0eee9] sm:p-4 font-serif"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
    >
      <div className={containerClasses}>
        
        <BuddhaBackground streak={streak} />
        
        {/* Header - Fixed Height */}
        <header className="flex-none pt-4 pb-2 px-6 flex justify-between items-center relative z-10">
          <button 
            className="flex items-center gap-2 text-stone-400 hover:text-stone-600 transition-colors group" 
            onClick={handleLogout} 
            title="切换用户"
          >
               <div className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center group-hover:bg-white transition-colors">
                  <User size={14} />
               </div>
          </button>
          
          <div className="text-center absolute left-1/2 -translate-x-1/2">
            <h1 className="text-lg font-bold tracking-[0.3em] text-ink/80" style={{ fontFamily: '"Noto Serif SC", serif' }}>禅一</h1>
          </div>
          
          <div className="w-8 h-8"></div>
        </header>

        {/* Sliding Main Content Area */}
        <main className="flex-1 relative z-10 min-h-0 overflow-hidden">
            <div 
                className="flex w-[200%] h-full transition-transform duration-500 ease-out"
                style={{ transform: `translateX(${currentView === 0 ? '0%' : '-50%'})` }}
            >
                {/* PAGE 1: HOME */}
                <div className="w-1/2 h-full flex flex-col px-4">
                    {/* Zen Garden */}
                    <section className="flex-none flex justify-center items-center py-1 relative z-20">
                        <ZenGarden streak={streak} />
                    </section>

                    {/* Quote */}
                    <section className="flex-none py-1 mb-2">
                        <div className="relative">
                        {loadingQuote ? (
                            <div className="animate-pulse flex justify-center">
                            <div className="h-0.5 bg-stone-200 rounded w-12"></div>
                            </div>
                        ) : (
                            <div className="text-center">
                            <Sparkles size={10} className="inline-block text-clay mb-1 opacity-60" />
                            <p className="text-xs font-serif leading-relaxed text-stone-600 tracking-wider line-clamp-2 px-4">
                                {quote?.text}
                            </p>
                            {quote?.source && (
                                <p className="text-[9px] text-stone-400 font-serif tracking-widest mt-1">
                                {quote.source}
                                </p>
                            )}
                            </div>
                        )}
                        </div>
                    </section>

                    {/* Action Buttons */}
                    <section className="flex-none grid grid-cols-2 gap-3 mb-3">
                        <button
                        onClick={() => toggleSession('morning')}
                        className={`
                            group relative py-2 rounded-xl border transition-all duration-700 ease-out flex flex-col items-center justify-center gap-1
                            ${todayRecord.morning 
                            ? 'bg-white/80 border-clay/20 shadow-sm' 
                            : 'bg-white/40 border-transparent hover:bg-white/60'}
                        `}
                        >
                        <div className="w-10 h-10">
                            <InkSunIcon active={todayRecord.morning} />
                        </div>
                        <span className={`font-serif text-[10px] tracking-[0.2em] mt-0.5 transition-colors duration-500 ${todayRecord.morning ? 'text-clay font-bold' : 'text-stone-400'}`}>
                            早课
                        </span>
                        </button>

                        <button
                        onClick={() => toggleSession('evening')}
                        className={`
                            group relative py-2 rounded-xl border transition-all duration-700 ease-out flex flex-col items-center justify-center gap-1
                            ${todayRecord.evening 
                            ? 'bg-white/80 border-stone-300/30 shadow-sm' 
                            : 'bg-white/40 border-transparent hover:bg-white/60'}
                        `}
                        >
                        <div className="w-10 h-10">
                            <InkMoonIcon active={todayRecord.evening} />
                        </div>
                        <span className={`font-serif text-[10px] tracking-[0.2em] mt-0.5 transition-colors duration-500 ${todayRecord.evening ? 'text-stone-600 font-bold' : 'text-stone-400'}`}>
                            晚课
                        </span>
                        </button>
                    </section>

                    {/* Stats */}
                    <section className="flex-1 min-h-0 flex flex-col pb-2">
                        <Stats records={records} onToggleRecord={toggleSession} />
                    </section>
                </div>

                {/* PAGE 2: INSIGHTS */}
                <div className="w-1/2 h-full px-4 pb-4">
                    <Insights records={records} currentStreak={streak} />
                </div>
            </div>
        </main>

        {/* Page Indicators */}
        <div className="flex justify-center gap-2 pb-4 z-10">
            <button onClick={() => setCurrentView(0)} className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${currentView === 0 ? 'bg-stone-500' : 'bg-stone-300'}`} />
            <button onClick={() => setCurrentView(1)} className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${currentView === 1 ? 'bg-stone-500' : 'bg-stone-300'}`} />
        </div>
      </div>
    </div>
  );
};

export default App;
