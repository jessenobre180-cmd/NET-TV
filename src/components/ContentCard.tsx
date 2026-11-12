import React from 'react';
import { Play, Plus, Check, Info, Star } from 'lucide-react';
import { Movie, Series, LiveChannel, WatchProgress } from '../types';

interface ContentCardProps {
  item: Movie | Series | LiveChannel | WatchProgress;
  type: 'movie' | 'series' | 'channel' | 'history';
  aspect?: 'poster' | 'landscape';
  isFavorite?: boolean;
  onSelect: () => void;
  onPlay: () => void;
  onToggleFavorite?: () => void;
  isTvFocused?: boolean;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  item,
  type,
  aspect = 'poster',
  isFavorite = false,
  onSelect,
  onPlay,
  onToggleFavorite,
  isTvFocused = false
}) => {
  // Extract fields gracefully based on item type
  const isHistory = type === 'history';
  const isChannel = type === 'channel';

  let title = '';
  let imageUrl = '';
  let subtitle = '';
  let ageRating = '';
  let ratingNum: number | undefined;
  let progressPct: number | undefined;

  if (isHistory) {
    const hist = item as WatchProgress;
    title = hist.title;
    imageUrl = hist.thumbnailUrl;
    progressPct = hist.percentage;
    subtitle = hist.contentType === 'episode' ? 'Série' : 'Filme';
  } else if (isChannel) {
    const ch = item as LiveChannel;
    title = ch.name;
    imageUrl = ch.bannerUrl || ch.logoUrl;
    subtitle = ch.currentProgram.title;
  } else {
    const content = item as Movie | Series;
    title = content.title;
    imageUrl = aspect === 'poster' ? content.posterUrl : content.backdropUrl;
    subtitle = (content.genre || []).slice(0, 2).join(' · ');
    ageRating = content.ageRating;
    ratingNum = content.rating;
  }

  const getAgeRatingColor = (rating: string) => {
    switch (rating) {
      case 'L': return 'bg-emerald-600 text-white';
      case '10': return 'bg-blue-600 text-white';
      case '12': return 'bg-yellow-600 text-white';
      case '14': return 'bg-orange-600 text-white';
      case '16': return 'bg-red-600 text-white';
      case '18': return 'bg-black text-white border border-red-500';
      default: return 'bg-zinc-800 text-zinc-300';
    }
  };

  return (
    <div 
      className={`group relative shrink-0 rounded-xl overflow-hidden bg-zinc-900 border transition-all duration-300 cursor-pointer ${
        aspect === 'poster' ? 'w-36 sm:w-44 md:w-52' : 'w-60 sm:w-72 md:w-80'
      } ${
        isTvFocused 
          ? 'scale-105 border-red-500 shadow-2xl neon-glow-red z-20' 
          : 'border-white/5 hover:border-red-500/60 hover:scale-[1.03] hover:shadow-xl'
      }`}
      onClick={onSelect}
    >
      {/* Thumbnail Container */}
      <div className={`relative w-full ${aspect === 'poster' ? 'aspect-[3/4]' : 'aspect-video'} bg-zinc-950 overflow-hidden`}>
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Live Channel badge */}
        {isChannel && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider shadow">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            AO VIVO
          </div>
        )}

        {/* New Release 2026 Badge */}
        {!isChannel && !isHistory && ((item as any).year >= 2025 || (item as any).featured) && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-600/95 text-white text-[9px] font-black uppercase tracking-wider shadow border border-red-500/40">
            <span>LANÇAMENTO</span>
          </div>
        )}

        {/* Rating Score */}
        {ratingNum && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-amber-400 text-[11px] font-bold border border-white/10">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>{ratingNum.toFixed(1)}</span>
          </div>
        )}

        {/* Quick Hover Play / Info Bar */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/40 backdrop-blur-[2px]">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay();
              }}
              className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transform active:scale-95 transition-all neon-glow-red"
              title="Assistir agora"
            >
              <Play className="w-5 h-5 fill-current translate-x-0.5" />
            </button>

            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
                className={`p-2.5 rounded-full border transition-all active:scale-95 ${
                  isFavorite 
                    ? 'bg-white text-black border-white' 
                    : 'bg-zinc-900/80 text-white border-white/20 hover:bg-zinc-800'
                }`}
                title={isFavorite ? 'Remover da Minha Lista' : 'Adicionar à Minha Lista'}
              >
                {isFavorite ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className="p-2.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white border border-white/20 transition-all active:scale-95"
              title="Ver detalhes"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar for Continuar Assistindo */}
        {progressPct !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-800">
            <div 
              className="h-full bg-red-600" 
              style={{ width: `${Math.min(100, progressPct)}%` }}
            />
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="p-3">
        <h4 className="font-bold text-white text-xs sm:text-sm truncate drop-shadow-xs">
          {title}
        </h4>

        <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-400">
          <span className="truncate max-w-[130px]">{subtitle}</span>

          {ageRating && (
            <span className={`px-1 py-0.2 rounded text-[10px] font-bold shrink-0 ${getAgeRatingColor(ageRating)}`}>
              {ageRating}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
