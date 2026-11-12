import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ContentCard } from './ContentCard';
import { Movie, Series, LiveChannel, WatchProgress } from '../types';

interface ContentCarouselProps {
  title: string;
  subtitle?: string;
  badge?: string;
  items: (Movie | Series | LiveChannel | WatchProgress)[];
  type: 'movie' | 'series' | 'channel' | 'history';
  aspect?: 'poster' | 'landscape';
  favorites?: string[];
  onSelect: (item: any) => void;
  onPlay: (item: any) => void;
  onToggleFavorite?: (id: string) => void;
}

export const ContentCarousel: React.FC<ContentCarouselProps> = ({
  title,
  subtitle,
  badge,
  items,
  type,
  aspect = 'poster',
  favorites = [],
  onSelect,
  onPlay,
  onToggleFavorite
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!items || items.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const offset = direction === 'left' ? -450 : 450;
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <section className="relative py-4 group/carousel">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between px-4 sm:px-8 mb-2">
        <div>
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-white tracking-tight flex items-center gap-2 flex-wrap">
            {badge && (
              <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                {badge}
              </span>
            )}
            <span>{title}</span>
            <span className="text-xs font-normal text-zinc-500 font-mono">({items.length})</span>
          </h3>
          {subtitle && (
            <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Navigation Buttons (Desktop/TV) */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-10 h-24 bg-black/70 hover:bg-black/90 text-white rounded-r-lg opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden sm:flex items-center justify-center border border-white/10"
        title="Rolar para esquerda"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={() => scroll('right')}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-10 h-24 bg-black/70 hover:bg-black/90 text-white rounded-l-lg opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden sm:flex items-center justify-center border border-white/10"
        title="Rolar para direita"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Horizontal Carousel Track */}
      <div 
        ref={scrollRef}
        className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar px-4 sm:px-8 py-2 scroll-smooth"
      >
        {items.map((item: any, idx: number) => {
          const itemId = item.contentId || item.id;
          const isFav = favorites.includes(itemId);

          return (
            <ContentCard
              key={`${itemId}-${idx}`}
              item={item}
              type={type}
              aspect={aspect}
              isFavorite={isFav}
              onSelect={() => onSelect(item)}
              onPlay={() => onPlay(item)}
              onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(itemId) : undefined}
            />
          );
        })}
      </div>
    </section>
  );
};
