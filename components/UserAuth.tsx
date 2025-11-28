import React, { useState } from 'react';
import { ArrowRight, UserCircle, X } from 'lucide-react';

interface UserAuthProps {
  users: string[];
  onLogin: (name: string) => void;
  onDelete?: (name: string, e: React.MouseEvent) => void;
}

const UserAuth: React.FC<UserAuthProps> = ({ users, onLogin, onDelete }) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = inputValue.trim();
    if (!name) {
        setError('请输入您的名称');
        return;
    }
    onLogin(name);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 relative z-10">
      <div className="w-full max-w-xs space-y-12 animate-in fade-in duration-1000 slide-in-from-bottom-8">
        
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-[0.3em] text-stone-800 font-serif">禅一</h1>
          <p className="text-stone-400 text-sm tracking-widest font-serif">定心 · 守一 · 见性</p>
        </div>

        {/* Existing Users List */}
        {users.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 py-4">
                {users.map(user => (
                    <button 
                        key={user}
                        onClick={() => onLogin(user)}
                        className="flex flex-col items-center gap-2 group relative"
                    >
                        <div className="w-14 h-14 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 group-hover:bg-bamboo/10 group-hover:text-bamboo group-hover:border-bamboo/30 transition-all duration-500 relative">
                             <span className="font-serif text-lg">{user[0]}</span>
                             
                             {/* Delete Button - Visible on Group Hover */}
                             {onDelete && (
                               <div 
                                 onClick={(e) => onDelete(user, e)}
                                 className="absolute -top-1 -right-1 w-5 h-5 bg-stone-200 rounded-full flex items-center justify-center text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-500"
                                 title="删除记录"
                               >
                                 <X size={10} />
                               </div>
                             )}
                        </div>
                        <span className="text-xs text-stone-500 font-serif tracking-widest group-hover:text-stone-800 transition-colors">{user}</span>
                    </button>
                ))}
            </div>
        )}

        {/* New User Input */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative group">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                  setInputValue(e.target.value);
                  setError('');
              }}
              placeholder="请输入您的名称"
              className="w-full bg-transparent border-b border-stone-300 py-3 text-center text-lg text-stone-800 placeholder-stone-300 focus:outline-none focus:border-bamboo transition-colors font-serif tracking-widest"
              maxLength={10}
            />
            <button 
                type="submit" 
                className={`absolute right-0 bottom-3 text-stone-300 transition-all duration-500 hover:text-bamboo ${inputValue ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}
            >
                <ArrowRight size={20} />
            </button>
          </div>
          {error && <p className="absolute top-full left-0 right-0 text-center text-xs text-red-300 mt-2 font-serif">{error}</p>}
        </form>

        <div className="text-center text-[10px] text-stone-300 font-serif tracking-[0.2em] opacity-60">
            万法归一，一归何处
        </div>
      </div>
    </div>
  );
};

export default UserAuth;