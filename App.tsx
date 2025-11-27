import React, { useState, useEffect, useRef } from 'react';
import { DailyRecord, QuoteData } from './types';
import ZenGarden from './components/ZenGarden';
import Stats from './components/Stats';
import UserAuth from './components/UserAuth';
import { fetchZenQuote } from './services/geminiService';
import { Sparkles, Volume2, VolumeX, User, LogOut } from 'lucide-react';

const USERS_KEY = 'zenone_users_v1';
const DATA_PREFIX = 'zenone_data_'; // + username
const QUOTE_STORAGE_KEY = 'zenone_quote_v1';

// Slow, meditative Guzheng music
const ZEN_AUDIO_URL = "https://cdn.pixabay.com/download/audio/2024/09/06/audio_47347a4659.mp3?filename=guzheng-123-239617.mp3";

// --- Custom Ink Wash Icons ---

const InkSunIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 100 100" className="w-16 h-16 transition-transform duration-700 hover:scale-105">
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
    <path 
      d="M25 25 C 30 18, 40 15, 48 16" 
      fill="none" 
      stroke={active ? "#a68a64" : "#d6d3d1"} 
      strokeWidth={active ? "3" : "2"}
      className="opacity-60 transition-colors duration-500"
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
  <svg viewBox="0 0 100 100" className="w-16 h-16 transition-transform duration-700 hover:scale-105">
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
    <path 
      d="M60 20 C 70 20, 75 30, 75 40" 
      fill="none" 
      stroke={active ? "#475569" : "#d6d3d1"} 
      strokeWidth={active ? "2" : "1"} 
      strokeLinecap="round"
      className="opacity-30 transition-colors duration-500"
    />
  </svg>
);

const LotusBackground = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
         <svg viewBox="0 0 500 500" className="absolute -right-20 -bottom-20 w-[120%] h-auto opacity-[0.04] text-stone-900 fill-current rotate-[-10deg]">
            <path d="M250 250 Q 200 150 250 50 Q 300 150 250 250" />
            <path d="M250 250 Q 150 200 50 250 Q 150 300 250 250" />
            <path d="M250 250 Q 200 350 250 450 Q 300 350 250 250" />
            <path d="M250 250 Q 350 200 450 250 Q 350 300 250 250" />
            <path d="M250 250 Q 220 180 250 120 Q 280 180 250 250" />
            <path d="M250 250 Q 180 220 120 250 Q 180 280 250 250" />
            <path d="M250 250 Q 220 320 250 380 Q 280 320 250 250" />
            <path d="M250 250 Q 320 220 380 250 Q 320 280 250 250" />
         </svg>
         <svg viewBox="0 0 200 200" className="absolute left-[-50px] top-[20%] w-96 h-96 opacity-[0.03] text-stone-700 stroke-current fill-none" strokeWidth="1">
             <circle cx="100" cy="100" r="40" />
             <circle cx="100" cy="100" r="60" />
             <circle cx="100" cy="100" r="90" />
         </svg>
    </div>
);

// -----------------------------

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [knownUsers, setKnownUsers] = useState<string[]>([]);
  
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [streak, setStreak] = useState(0);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Helper to get today's date string YYYY-MM-DD
  const getTodayStr = () => new Date().toISOString().split('T')[0];

  // Initialize Audio
  useEffect(() => {
    audioRef.current = new Audio(ZEN_AUDIO_URL);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Load known users on mount
  useEffect(() => {
    const savedUsers = localStorage.getItem(USERS_KEY);
    if (savedUsers) {
      setKnownUsers(JSON.parse(savedUsers));
    }
  }, []);

  // Initialize User Data when user changes
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

    // Load Quote (Shared across users or could be per user)
    // We keep quote global for simplicity/cache efficiency
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

  // Handle Login / User Creation
  const handleLogin = (username: string) => {
    if (!knownUsers.includes(username)) {
      const updatedUsers = [...knownUsers, username];
      setKnownUsers(updatedUsers);
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    }
    setCurrentUser(username);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
    setIsPlaying(!isPlaying);
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
    
    // Check if streak continues from today or yesterday
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
    
    // Persist to user-specific storage
    localStorage.setItem(`${DATA_PREFIX}${currentUser}`, JSON.stringify(updatedRecords));
  };

  const getTodayRecord = () => {
    return records.find(r => r.date === getTodayStr()) || { date: getTodayStr(), morning: false, evening: false };
  };

  const todayRecord = getTodayRecord();

  // --- RENDER ---

  if (!currentUser) {
    return (
      <div className="min-h-screen max-w-md mx-auto bg-paper relative overflow-hidden font-serif">
         <LotusBackground />
         <UserAuth users={knownUsers} onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-md mx-auto bg-paper text-ink pb-20 relative overflow-hidden transition-colors duration-1000 font-serif">
      
      {/* Background Decor */}
      <LotusBackground />
      <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-stone-200/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-50px] left-[-50px] w-80 h-80 bg-bamboo/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <header className="pt-10 px-6 mb-8 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2 text-stone-500 cursor-pointer hover:text-stone-800 transition-colors" onClick={handleLogout} title="切换用户">
             <User size={18} />
             <span className="text-sm font-medium tracking-widest">{currentUser}</span>
        </div>
        <div className="text-center absolute left-1/2 -translate-x-1/2">
          <h1 className="text-3xl font-bold tracking-widest text-ink/80 mb-1" style={{ fontFamily: '"Noto Serif SC", serif' }}>禅一</h1>
        </div>
        <button 
          onClick={toggleAudio}
          className={`w-10 h-10 flex items-center justify-center transition-all duration-500 rounded-full ${isPlaying ? 'text-bamboo bg-bamboo/10' : 'text-stone-300 hover:text-stone-500'}`}
          aria-label="Toggle Background Music"
        >
          {isPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </header>

      {/* Zen Garden Visual */}
      <section className="mb-8 relative z-10">
        <ZenGarden streak={streak} />
      </section>

      {/* Quote Card */}
      <section className="px-6 mb-10 relative z-10">
        <div className="relative py-4 px-2">
          {loadingQuote ? (
            <div className="animate-pulse flex justify-center">
              <div className="h-1 bg-stone-200 rounded w-24"></div>
            </div>
          ) : (
            <div className="text-center">
               <Sparkles size={12} className="inline-block text-clay mb-2 opacity-50" />
              <p className="text-lg font-serif leading-loose text-ink/80 mb-2 tracking-wide">
                {quote?.text}
              </p>
              {quote?.source && (
                <p className="text-xs text-stone-400 font-serif tracking-widest mt-1">
                   {quote.source}
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Action Buttons */}
      <section className="px-6 grid grid-cols-2 gap-6 mb-12 relative z-10">
        {/* Morning Button */}
        <button
          onClick={() => toggleSession('morning')}
          className={`
            group relative p-4 rounded-[2rem] border transition-all duration-700 ease-out flex flex-col items-center justify-center h-44
            ${todayRecord.morning 
              ? 'bg-[#fdfbf7] border-clay/30 shadow-inner' 
              : 'bg-white/80 border-transparent shadow-lg shadow-stone-200/30 hover:-translate-y-1'}
          `}
        >
          <div className="mb-4 relative">
             <InkSunIcon active={todayRecord.morning} />
          </div>
          <span className={`font-serif text-lg tracking-[0.2em] transition-colors duration-500 ${todayRecord.morning ? 'text-clay font-bold' : 'text-stone-400'}`}>
            早课
          </span>
        </button>

        {/* Evening Button */}
        <button
          onClick={() => toggleSession('evening')}
          className={`
            group relative p-4 rounded-[2rem] border transition-all duration-700 ease-out flex flex-col items-center justify-center h-44
            ${todayRecord.evening 
              ? 'bg-[#fcfcfc] border-stone-300/30 shadow-inner' 
              : 'bg-white/80 border-transparent shadow-lg shadow-stone-200/30 hover:-translate-y-1'}
          `}
        >
          <div className="mb-4 relative">
            <InkMoonIcon active={todayRecord.evening} />
          </div>
          <span className={`font-serif text-lg tracking-[0.2em] transition-colors duration-500 ${todayRecord.evening ? 'text-stone-600 font-bold' : 'text-stone-400'}`}>
            晚课
          </span>
        </button>
      </section>

      {/* Statistics */}
      <section className="px-6 pb-10 relative z-10">
        <Stats records={records} />
      </section>

      {/* Footer */}
      <footer className="text-center text-stone-300 text-[10px] pb-6 font-serif tracking-widest opacity-60 relative z-10">
         日日是好日
      </footer>
    </div>
  );
};

export default App;