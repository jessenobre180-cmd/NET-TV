import React from 'react';
import { Home, Film, Tv, Radio, Bookmark } from 'lucide-react';
import { NavTab } from './Navbar';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'movies', label: 'Filmes', icon: Film },
    { id: 'series', label: 'Séries', icon: Tv },
    { id: 'live', label: 'TV ao Vivo', icon: Radio },
    { id: 'mylist', label: 'Minha Lista', icon: Bookmark }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0c0d12]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1 pb-safe shadow-2xl">
      <div className="grid grid-cols-5 items-center">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 relative transition-all active:scale-90 ${
                isActive ? 'text-red-500 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.id === 'live' && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 truncate">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-red-600 mt-0.5 shadow-[0_0_8px_#E50914]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
