import React from 'react';
import { Play, Plus, Check, Info, Star } from 'lucide-react';
import { Movie, Series } from '../types';

interface HeroBannerProps {
  content: Movie | Series;
  isFavorite: boolean;
  onPlay: () => void;
  onSelect: () => void;
  onToggleFavorite: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  content,
  isFavorite,
  onPlay,
  onSelect,
  onToggleFavorite
}) => {
  const isMovie = 'duration' in content;

  return (
    <div className="relative w-full min-h-[500px] md:min-h-[620px] lg:min-h-[680px] flex items-end overflow-hidden pb-12 pt-28">
      {/* Background Image & Dramatic Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src={content.backdropUrl || content.posterUrl}
          alt={content.title}
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000"
          referrerPolicy="no-referrer"
        />
        {/* Cinematic Multi-stop Vignette Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090c] via-[#08090c]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090c] via-[#08090c]/80 to-transparent max-w-4xl" />
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#08090c]/90 to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 px-4 sm:px-8 md:px-12 max-w-3xl space-y-4">
        {/* Category & Badge */}
        <div className="flex items-center gap-2.5 text-xs text-zinc-300 font-medium">
          <span className="px-2 py-0.5 bg-red-600 text-white font-bold rounded-sm uppercase tracking-wider text-[10px]">
            {isMovie ? 'Filme Destaque' : 'Série Exclusiva'}
          </span>
          <span>{content.year}</span>
          <span aria-hidden="true">·</span>
          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[11px] font-bold border border-white/10">
            {content.ageRating}
          </span>
          <span aria-hidden="true">·</span>
          <span>{isMovie ? (content as Movie).duration : `${(content as Series).seasonsCount} Temporadas`}</span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1 text-amber-400 font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            {content.rating}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-none drop-shadow-md">
          {content.title}
        </h1>

        {/* Genres */}
        <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
          {(content.genre || []).map((g, i) => (
            <span key={g} className="hover:text-zinc-200 transition-colors">
              {g}{i < content.genre.length - 1 ? ' · ' : ''}
            </span>
          ))}
        </div>

        {/* Synopsis */}
        <p className="text-sm md:text-base text-zinc-300 line-clamp-3 md:line-clamp-4 leading-relaxed max-w-2xl drop-shadow-sm">
          {content.synopsis}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onPlay}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm md:text-base rounded-xl transition-all shadow-xl active:scale-95 neon-glow-red"
          >
            <Play className="w-5 h-5 fill-current" />
            Assistir Agora
          </button>

          <button
            onClick={onToggleFavorite}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all border active:scale-95 ${
              isFavorite 
                ? 'bg-zinc-800/90 text-white border-red-500/50' 
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-white border-white/15'
            }`}
          >
            {isFavorite ? <Check className="w-5 h-5 text-red-500" /> : <Plus className="w-5 h-5" />}
            <span>{isFavorite ? 'Na Minha Lista' : 'Minha Lista'}</span>
          </button>

          <button
            onClick={onSelect}
            className="flex items-center gap-2 px-4 py-3 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-sm font-semibold border border-white/10 transition-colors"
            title="Mais informações"
          >
            <Info className="w-5 h-5" />
            <span className="hidden sm:inline">Mais Informações</span>
          </button>
        </div>
      </div>
    </div>
  );
};
