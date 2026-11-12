import React from 'react';
import { 
  Search, Shield, Smartphone, Tablet, Tv, Bookmark, Film, Radio, Home, Server
} from 'lucide-react';
import { StreamingServer } from '../types';

export type NavTab = 'home' | 'movies' | 'series' | 'live' | 'mylist';
export type DeviceMode = 'mobile' | 'tablet' | 'tv';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  deviceMode: DeviceMode;
  onDeviceModeChange: (mode: DeviceMode) => void;
  onOpenSearch: () => void;
  onOpenAdmin: () => void;
  activeServer?: StreamingServer | null;
  onOpenServers?: () => void;
  isScrolled: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  deviceMode,
  onDeviceModeChange,
  onOpenSearch,
  onOpenAdmin,
  activeServer,
  onOpenServers,
  isScrolled
}) => {
  return (
    <header 
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#08090c]/95 backdrop-blur-md border-b border-white/5 py-3 shadow-2xl' 
          : 'bg-gradient-to-b from-[#08090c]/90 via-[#08090c]/60 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-8">
        {/* Zone 1: NetTV Brand Wordmark */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onTabChange('home')}
            className="flex items-center gap-1.5 focus:outline-none group text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center font-black text-white text-lg tracking-tighter shadow-lg neon-glow-red group-hover:scale-105 transition-transform">
              N
            </div>
            <span className="font-['Oswald'] text-2xl font-black tracking-wider text-white">
              NET<span className="text-red-600">TV</span>
            </span>
          </button>

          {/* Zone 2: Navigation Links (Desktop/Tablet) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <button
              onClick={() => onTabChange('home')}
              className={`whitespace-nowrap transition-colors ${
                activeTab === 'home' ? 'text-red-500 font-bold' : 'text-zinc-300 hover:text-white'
              }`}
            >
              Início
            </button>
            <button
              onClick={() => onTabChange('movies')}
              className={`whitespace-nowrap transition-colors ${
                activeTab === 'movies' ? 'text-red-500 font-bold' : 'text-zinc-300 hover:text-white'
              }`}
            >
              Filmes
            </button>
            <button
              onClick={() => onTabChange('series')}
              className={`whitespace-nowrap transition-colors ${
                activeTab === 'series' ? 'text-red-500 font-bold' : 'text-zinc-300 hover:text-white'
              }`}
            >
              Séries
            </button>
            <button
              onClick={() => onTabChange('live')}
              className={`whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'live' ? 'text-red-500 font-bold' : 'text-zinc-300 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              TV ao Vivo
            </button>
            <button
              onClick={() => onTabChange('mylist')}
              className={`whitespace-nowrap transition-colors ${
                activeTab === 'mylist' ? 'text-red-500 font-bold' : 'text-zinc-300 hover:text-white'
              }`}
            >
              Minha Lista
            </button>
          </nav>
        </div>

        {/* Zone 3: Actions & Device Mode */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/5 transition-colors flex items-center gap-2 text-xs"
            title="Buscar conteúdos"
          >
            <Search className="w-4 h-4 text-zinc-300" />
            <span className="hidden lg:inline text-zinc-400">Buscar no NetTV...</span>
          </button>

          {/* Device View Mode Toggle (Mobile / Tablet / Android TV) */}
          <div className="hidden sm:flex items-center p-0.5 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400">
            <button
              onClick={() => onDeviceModeChange('mobile')}
              className={`p-1.5 rounded-lg transition-colors ${
                deviceMode === 'mobile' ? 'bg-red-600 text-white shadow-sm' : 'hover:text-white'
              }`}
              title="Modo Celular Android"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeviceModeChange('tablet')}
              className={`p-1.5 rounded-lg transition-colors ${
                deviceMode === 'tablet' ? 'bg-red-600 text-white shadow-sm' : 'hover:text-white'
              }`}
              title="Modo Tablet Android"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeviceModeChange('tv')}
              className={`p-1.5 rounded-lg transition-colors ${
                deviceMode === 'tv' ? 'bg-red-600 text-white shadow-sm' : 'hover:text-white'
              }`}
              title="Modo Android TV"
            >
              <Tv className="w-4 h-4" />
            </button>
          </div>

          {/* Server Selector Trigger */}
          {onOpenServers && (
            <button
              onClick={onOpenServers}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-emerald-500/30 hover:border-emerald-500/50 transition-all text-xs font-semibold"
              title="Gerenciar e Adicionar Servidores NetTV"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <Server className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden md:inline text-[11px] max-w-[100px] truncate">
                {activeServer ? activeServer.name.split(' ')[0] : 'Servidor'}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold">
                {activeServer?.pingMs || 14}ms
              </span>
            </button>
          )}

          {/* Admin Panel button */}
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/5 transition-colors text-xs font-semibold"
            title="Painel Administrativo"
          >
            <Shield className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden sm:inline">Admin</span>
          </button>

          {/* User Profile Avatar */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 p-0.5 shadow-md">
            <div className="w-full h-full rounded-[10px] bg-zinc-950 flex items-center justify-center text-white font-bold text-xs">
              J
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
