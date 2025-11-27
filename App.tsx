import React, { useState, useEffect, useMemo } from 'react';
import { DailyRecord, QuoteData, ZenLevel } from './types';
import ZenGarden from './components/ZenGarden';
import Stats from './components/Stats';
import UserAuth from './components/UserAuth';
import { fetchZenQuote } from './services/geminiService';
import { Sparkles, User } from 'lucide-react';

const USERS_KEY = 'zenone_users_v1';
const DATA_PREFIX = 'zenone_data_';
const QUOTE_STORAGE_KEY = 'zenone_quote_v1';

// --- Custom Ink Wash Icons ---

const InkSunIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 100 100" className="w-12 h-12 transition-transform duration-700 hover:scale-105">
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

const InkMoonIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 100 100" className="w-12 h-12 transition-transform duration-700 hover:scale-105">
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

// -----------------------------

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [knownUsers, setKnownUsers] = useState<string[]>([]);
  
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [streak, setStreak] = useState(0);
  const [loadingQuote, setLoadingQuote] = useState(false);

  const getTodayStr = () => new Date().toISOString().split('T')[0];

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

    const savedQuote = localStorage.getItem(QUOTE_STORAGE_KEY);
    if (savedQuote) {
      const parsedQuote: QuoteData = JSON.parse(savedQuote);
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - parsedQuote.fetchedAt < oneWeek) {
        setQuote(parsedQuote);
      } else {
        refreshQuote();
      }
    } else {
      refreshQuote();
    }
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
    if (window.confirm(`确认要删除法号“${usernameToDelete}”及其所有修行记录吗？`)) {
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
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    
    const todayEntry = sorted.find(r => r.date === today);
    const startCheckingFrom = (todayEntry && (todayEntry.morning || todayEntry.evening)) 
      ? new Date() 
      : yesterdayDate;

    let checkDate = startCheckingFrom;
    
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
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

  const toggleSession = (type: 'morning' | 'evening') => {
    if (!currentUser) return;

    const today = getTodayStr();
    const updatedRecords = [...records];
    const existingIndex = updatedRecords.findIndex(r => r.date === today);

    if (existingIndex >= 0) {
      updatedRecords[existingIndex] = {
        ...updatedRecords[existingIndex],
        [type]: !updatedRecords[existingIndex][type]
      };
    } else {
      updatedRecords.push({
        date: today,
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
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#f0eee9] sm:p-4 font-serif">
      <div className={containerClasses}>
        
        <BuddhaBackground streak={streak} />
        
        <header className="flex-none pt-6 pb-2 px-6 flex justify-between items-center relative z-10">
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
          
          <div className="w-8"></div>
        </header>

        <main className="flex-1 flex flex-col px-6 py-2 relative z-10 min-h-0">
          
          <section className="flex-[2] shrink-0 flex justify-center items-center py-2 relative z-20">
            <ZenGarden streak={streak} />
          </section>

          <section className="flex-none py-2 mb-2">
            <div className="relative">
              {loadingQuote ? (
                <div className="animate-pulse flex justify-center">
                  <div className="h-0.5 bg-stone-200 rounded w-12"></div>
                </div>
              ) : (
                <div className="text-center">
                   <Sparkles size={10} className="inline-block text-clay mb-2 opacity-60" />
                  <p className="text-sm font-serif leading-relaxed text-stone-600 tracking-wider line-clamp-3 px-4">
                    {quote?.text}
                  </p>
                  {quote?.source && (
                    <p className="text-[10px] text-stone-400 font-serif tracking-widest mt-2">
                       {quote.source}
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          <section className="flex-none grid grid-cols-2 gap-5 mb-6">
            <button
              onClick={() => toggleSession('morning')}
              className={`
                group relative py-3 rounded-xl border transition-all duration-700 ease-out flex flex-col items-center justify-center gap-2
                ${todayRecord.morning 
                  ? 'bg-white/80 border-clay/20 shadow-sm' 
                  : 'bg-white/40 border-transparent hover:bg-white/60'}
              `}
            >
              <InkSunIcon active={todayRecord.morning} />
              <span className={`font-serif text-xs tracking-[0.2em] mt-1 transition-colors duration-500 ${todayRecord.morning ? 'text-clay font-bold' : 'text-stone-400'}`}>
                早课
              </span>
            </button>

            <button
              onClick={() => toggleSession('evening')}
              className={`
                group relative py-3 rounded-xl border transition-all duration-700 ease-out flex flex-col items-center justify-center gap-2
                ${todayRecord.evening 
                  ? 'bg-white/80 border-stone-300/30 shadow-sm' 
                  : 'bg-white/40 border-transparent hover:bg-white/60'}
              `}
            >
               <InkMoonIcon active={todayRecord.evening} />
              <span className={`font-serif text-xs tracking-[0.2em] mt-1 transition-colors duration-500 ${todayRecord.evening ? 'text-stone-600 font-bold' : 'text-stone-400'}`}>
                晚课
              </span>
            </button>
          </section>

          <section className="flex-[3] min-h-0 flex flex-col pb-4">
            <Stats records={records} />
          </section>
        </main>

        <footer className="text-center text-stone-300 text-[9px] pb-4 font-serif tracking-[0.3em] opacity-50 relative z-10 flex-none">
           本来无一物
        </footer>
      </div>
    </div>
  );
};

export default App;