import React, { useState } from 'react';
import { 
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, 
  CornerDownLeft, Home, Play, Pause, Volume2, Volume1, VolumeX, 
  Tv, X, Minimize2, Maximize2
} from 'lucide-react';

interface TvRemoteControlProps {
  onDirection: (dir: 'up' | 'down' | 'left' | 'right' | 'select' | 'back' | 'home') => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const TvRemoteControl: React.FC<TvRemoteControlProps> = ({
  onDirection,
  isOpen,
  onToggle
}) => {
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-white border border-red-600/40 shadow-2xl backdrop-blur-md text-xs font-semibold transition-all hover:scale-105 neon-glow-red"
        title="Abrir Controle Remoto Virtual Android TV"
      >
        <Tv className="w-4 h-4 text-red-500 animate-pulse" />
        <span className="hidden sm:inline">Controle TV</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 w-64 bg-zinc-950/95 border border-zinc-800 rounded-3xl p-4 shadow-2xl backdrop-blur-xl text-white flex flex-col items-center select-none animate-in fade-in slide-in-from-bottom duration-300">
      {/* Top Remote Bar */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
          <span className="text-xs font-bold tracking-wider uppercase text-zinc-300">Android TV Remote</span>
        </div>
        <button
          onClick={onToggle}
          className="p-1 rounded-full text-zinc-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* D-Pad Circular Controller */}
      <div className="relative w-44 h-44 rounded-full bg-zinc-900 border border-zinc-700/80 p-2 shadow-inner flex items-center justify-center my-2">
        {/* Up */}
        <button
          onClick={() => onDirection('up')}
          className="absolute top-2 left-1/2 -translate-x-1/2 p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full transition-colors active:scale-95"
          title="Para cima"
        >
          <ChevronUp className="w-6 h-6" />
        </button>

        {/* Down */}
        <button
          onClick={() => onDirection('down')}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full transition-colors active:scale-95"
          title="Para baixo"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        {/* Left */}
        <button
          onClick={() => onDirection('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full transition-colors active:scale-95"
          title="Para esquerda"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Right */}
        <button
          onClick={() => onDirection('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full transition-colors active:scale-95"
          title="Para direita"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Center OK / Select Button */}
        <button
          onClick={() => onDirection('select')}
          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center shadow-lg active:scale-90 transition-transform neon-glow-red"
          title="OK / Selecionar"
        >
          OK
        </button>
      </div>

      {/* Bottom Nav Row */}
      <div className="w-full grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-zinc-800/80">
        <button
          onClick={() => onDirection('back')}
          className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all"
          title="Voltar"
        >
          <CornerDownLeft className="w-4 h-4 text-red-500" />
          <span className="text-[9px] uppercase font-bold text-zinc-400">Voltar</span>
        </button>

        <button
          onClick={() => onDirection('home')}
          className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all"
          title="Início"
        >
          <Home className="w-4 h-4 text-white" />
          <span className="text-[9px] uppercase font-bold text-zinc-400">Início</span>
        </button>

        <button
          onClick={() => onDirection('select')}
          className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all"
          title="Play/Pause"
        >
          <Play className="w-4 h-4 fill-current text-red-500" />
          <span className="text-[9px] uppercase font-bold text-zinc-400">Play</span>
        </button>
      </div>
    </div>
  );
};
