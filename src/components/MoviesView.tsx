import React, { useState, useMemo } from 'react';
import { Film, Filter, Star, Sparkles } from 'lucide-react';
import { Movie } from '../types';
import { ContentCard } from './ContentCard';

interface MoviesViewProps {
  movies: Movie[];
  favorites: string[];
  onSelectMovie: (movie: Movie) => void;
  onPlayMovie: (movie: Movie) => void;
  onToggleFavorite: (id: string) => void;
}

const GENRES = [
  'Todos',
  'Ação',
  'Aventura',
  'Comédia',
  'Terror',
  'Ficção científica',
  'Romance',
  'Drama',
  'Suspense',
  'Animação',
  'Documentários'
];

export const MoviesView: React.FC<MoviesViewProps> = ({
  movies,
  favorites,
  onSelectMovie,
  onPlayMovie,
  onToggleFavorite
}) => {
  const [selectedGenre, setSelectedGenre] = useState('Todos');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'year' | 'title'>('popular');

  const filteredMovies = useMemo(() => {
    let result = [...movies];

    if (selectedGenre !== 'Todos') {
      result = result.filter(m => m.genre.includes(selectedGenre));
    }

    result.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'year') return b.year - a.year;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return (b.views || 0) - (a.views || 0); // popular
    });

    return result;
  }, [movies, selectedGenre, sortBy]);

  return (
    <div className="px-4 sm:px-8 py-6 space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Film className="w-7 h-7 text-red-600" />
            Catálogo de Filmes
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Explore grandes sucessos do cinema em alta definição e som espacial.
          </p>
        </div>

        {/* Sort Filter */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs text-zinc-400 font-medium">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-zinc-900 border border-zinc-800 text-white text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:border-red-600"
          >
            <option value="popular">Mais Populares</option>
            <option value="rating">Melhor Avaliados</option>
            <option value="year">Mais Recentes</option>
            <option value="title">Título (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Genre Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {GENRES.map(g => {
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

      {/* Movies Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredMovies.map((movie, idx) => (
          <ContentCard
            key={`${movie.id}-${idx}`}
            item={movie}
            type="movie"
            aspect="poster"
            isFavorite={favorites.includes(movie.id)}
            onSelect={() => onSelectMovie(movie)}
            onPlay={() => onPlayMovie(movie)}
            onToggleFavorite={() => onToggleFavorite(movie.id)}
          />
        ))}
      </div>

      {filteredMovies.length === 0 && (
        <div className="text-center py-16 text-zinc-500">
          <p className="text-base font-semibold">Nenhum filme encontrado para o gênero "{selectedGenre}".</p>
        </div>
      )}
    </div>
  );
};
