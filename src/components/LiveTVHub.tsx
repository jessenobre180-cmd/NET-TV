import React, { useState } from 'react';
import { Radio, Play, Tv, Wifi, WifiOff, Star, ShieldCheck } from 'lucide-react';
import { LiveChannel, ChannelCategory } from '../types';

interface LiveTVHubProps {
  channels: LiveChannel[];
  onPlayChannel: (channel: LiveChannel) => void;
  onSelectChannel: (channel: LiveChannel) => void;
}

const CATEGORIES: ('Todos' | ChannelCategory)[] = [
  'Todos',
  'Esportes',
  'Notícias',
  'Filmes',
  'Abertos',
  'Entretenimento',
  'Infantil',
  'Documentários',
  'Música'
];

export const LiveTVHub: React.FC<LiveTVHubProps> = ({
  channels,
  onPlayChannel,
  onSelectChannel
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'Todos' | ChannelCategory>('Todos');

  const filteredChannels = selectedCategory === 'Todos'
    ? channels
    : channels.filter(c => c.category === selectedCategory);

  return (
    <div className="px-4 sm:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden p-6 md:p-8 bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-950 border border-red-900/30">
        <div className="max-w-xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              Transmissões Oficiais & Autorizadas
            </span>
            <span className="flex items-center gap-1 text-xs text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Legal & Seguro
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            TV ao Vivo em Alta Definição
          </h2>

          <p className="text-xs sm:text-sm text-zinc-300">
            Acompanhe notícias, eventos esportivos, canais abertos e entretenimento sem travamentos e com a melhor qualidade de streaming.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {CATEGORIES.map(cat => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-red-600 text-white border-red-600 shadow-md neon-glow-red'
                  : 'bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 border-white/5 hover:border-white/10'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredChannels.map((channel, idx) => (
          <div
            key={`${channel.id}-${idx}`}
            onClick={() => onPlayChannel(channel)}
            className="group relative rounded-xl bg-zinc-900/90 border border-white/5 hover:border-red-500/50 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            {/* Banner preview */}
            <div className="relative aspect-video w-full bg-zinc-950 overflow-hidden">
              <img
                src={channel.bannerUrl || channel.logoUrl}
                alt={channel.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />

              {/* Status & Resolution Badge */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  AO VIVO
                </span>
                <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-mono text-zinc-300 border border-white/10">
                  {channel.resolution}
                </span>
              </div>

              {/* Channel Number */}
              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-xs font-mono font-bold text-white border border-white/10">
                #{channel.channelNumber}
              </div>

              {/* Play Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                <div className="p-3.5 rounded-full bg-red-600 text-white shadow-xl neon-glow-red transform scale-90 group-hover:scale-100 transition-transform">
                  <Play className="w-6 h-6 fill-current translate-x-0.5" />
                </div>
              </div>

              {/* Program Progress line */}
              <div className="absolute bottom-0 inset-x-0 h-1 bg-zinc-800">
                <div
                  className="h-full bg-red-600"
                  style={{ width: `${channel.currentProgram.progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Info Section */}
            <div className="p-3.5 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                  <img
                    src={channel.logoUrl}
                    alt={channel.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-white text-sm truncate group-hover:text-red-400 transition-colors">
                    {channel.name}
                  </h4>
                  <div className="text-[11px] text-zinc-400 font-medium">
                    {channel.category}
                  </div>
                </div>
              </div>

              {/* Current show EPG */}
              <div className="pt-2 border-t border-zinc-800/80 text-xs">
                <div className="text-[11px] text-zinc-400 flex items-center justify-between">
                  <span className="text-red-400 font-medium">No ar:</span>
                  <span className="font-mono text-zinc-500">{channel.currentProgram.start} - {channel.currentProgram.end}</span>
                </div>
                <div className="font-semibold text-zinc-200 truncate mt-0.5">
                  {channel.currentProgram.title}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
