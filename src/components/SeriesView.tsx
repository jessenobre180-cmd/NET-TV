import React, { useState, useMemo } from 'react';
import { Tv, Star, Layers } from 'lucide-react';
import { Series } from '../types';
import { ContentCard } from './ContentCard';

interface SeriesViewProps {
  series: Series[];
  favorites: string[];
  onSelectSeries: (series: Series) => void;
  onPlaySeries: (series: Series) => void;
  onToggleFavorite: (id: string) => void;
}

export const SeriesView: React.FC<SeriesViewProps> = ({
  series,
  favorites,
  onSelectSeries,
  onPlaySeries,
  onToggleFavorite
}) => {
  const [selectedGenre, setSelectedGenre] = useState('Todos');

  const genres = useMemo(() => {
    const set = new Set<string>();
    series.forEach(s => (s.genre || []).forEach(g => set.add(g)));
    return ['Todos', ...Array.from(set)];
  }, [series]);

  const filteredSeries = useMemo(() => {
    if (selectedGenre === 'Todos') return series;
    return series.filter(s => s.genre.includes(selectedGenre));
  }, [series, selectedGenre]);

  return (
    <div className="px-4 sm:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Tv className="w-7 h-7 text-red-600" />
            Séries e Minisséries
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Produções originais, temporadas completas e episódios semanais para maratonar.
          </p>
        </div>
      </div>

      {/* Genres */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {genres.map(g => {
          const active = selectedGenre === g;
          return (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                active
                  ? 'bg-red-600 text-white border-red-600 shadow-md neon-glow-red'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border-white/5'
              }`}
            >
              {g}
            </button>
          );
        })}
      </div>

      {/* Series Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredSeries.map((s, idx) => (
          <ContentCard
            key={`${s.id}-${idx}`}
            item={s}
            type="series"
            aspect="poster"
            isFavorite={favorites.includes(s.id)}
            onSelect={() => onSelectSeries(s)}
            onPlay={() => onPlaySeries(s)}
            onToggleFavorite={() => onToggleFavorite(s.id)}
          />
        ))}
      </div>
    </div>
  );
};
