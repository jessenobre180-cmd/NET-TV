import React, { useState, useMemo } from 'react';
import { Search, X, Film, Tv, Radio, Star, Filter } from 'lucide-react';
import { Movie, Series, LiveChannel } from '../types';
import { ContentCard } from './ContentCard';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  movies: Movie[];
  series: Series[];
  channels: LiveChannel[];
  favorites: string[];
  onSelectContent: (item: any) => void;
  onPlayContent: (item: any) => void;
  onToggleFavorite: (id: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  movies,
  series,
  channels,
  favorites,
  onSelectContent,
  onPlayContent,
  onToggleFavorite
}) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'series' | 'channel'>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  const allGenres = useMemo(() => {
    const set = new Set<string>();
    movies.forEach(m => (m.genre || []).forEach(g => set.add(g)));
    series.forEach(s => (s.genre || []).forEach(g => set.add(g)));
    return Array.from(set);
  }, [movies, series]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();

    const matchesQuery = (text: string) => !q || text.toLowerCase().includes(q);

    let foundMovies: Movie[] = [];
    let foundSeries: Series[] = [];
    let foundChannels: LiveChannel[] = [];

    if (filterType === 'all' || filterType === 'movie') {
      foundMovies = movies.filter(m => {
        const matchesText = matchesQuery(m.title) || 
          matchesQuery(m.synopsis) || 
          matchesQuery(m.director) || 
          (m.cast || []).some(c => matchesQuery(c));
        const matchesG = selectedGenre === 'all' || (m.genre || []).includes(selectedGenre);
        return matchesText && matchesG;
      });
    }

    if (filterType === 'all' || filterType === 'series') {
      foundSeries = series.filter(s => {
        const matchesText = matchesQuery(s.title) || 
          matchesQuery(s.synopsis) || 
          matchesQuery(s.creator) || 
          (s.cast || []).some(c => matchesQuery(c));
        const matchesG = selectedGenre === 'all' || (s.genre || []).includes(selectedGenre);
        return matchesText && matchesG;
      });
    }

    if (filterType === 'all' || filterType === 'channel') {
      foundChannels = channels.filter(c => {
        return matchesQuery(c.name) || 
          matchesQuery(c.category) || 
          matchesQuery(c.currentProgram.title);
      });
    }

    return {
      movies: foundMovies,
      series: foundSeries,
      channels: foundChannels,
      total: foundMovies.length + foundSeries.length + foundChannels.length
    };
  }, [query, filterType, selectedGenre, movies, series, channels]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950/98 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Top Search Input Bar */}
      <div className="p-4 sm:p-6 border-b border-zinc-800 bg-zinc-950">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar filmes, séries, atores, canais ou programas..."
              className="w-full pl-12 pr-10 py-3.5 bg-zinc-900 border border-zinc-700/80 rounded-2xl text-white placeholder-zinc-500 text-sm sm:text-base focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-zinc-800/80">
          {/* Type Segmented Controls */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-900 rounded-xl border border-white/5 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterType === 'all' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('movie')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterType === 'movie' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Filmes
            </button>
            <button
              onClick={() => setFilterType('series')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterType === 'series' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Séries
            </button>
            <button
              onClick={() => setFilterType('channel')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterType === 'channel' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Canais
            </button>
          </div>

          {/* Genre selector */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-zinc-900 border border-zinc-700/80 text-white text-xs font-semibold px-3 py-1.5 rounded-xl focus:outline-none focus:border-red-600"
            >
              <option value="all">Todos os Gêneros</option>
              {allGenres.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Viewport */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-xs text-zinc-400">
            {searchResults.total} resultado{searchResults.total !== 1 ? 's' : ''} encontrado{searchResults.total !== 1 ? 's' : ''}
          </div>

          {/* Channels results */}
          {searchResults.channels.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-red-500 flex items-center gap-2">
                <Radio className="w-4 h-4" />
                Canais de TV ao Vivo
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults.channels.map((ch, idx) => (
                  <ContentCard
                    key={`${ch.id}-${idx}`}
                    item={ch}
                    type="channel"
                    aspect="landscape"
                    onSelect={() => {
                      onSelectContent(ch);
                      onClose();
                    }}
                    onPlay={() => {
                      onPlayContent(ch);
                      onClose();
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Movies results */}
          {searchResults.movies.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-red-500 flex items-center gap-2">
                <Film className="w-4 h-4" />
                Filmes
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {searchResults.movies.map((m, idx) => (
                  <ContentCard
                    key={`${m.id}-${idx}`}
                    item={m}
                    type="movie"
                    aspect="poster"
                    isFavorite={favorites.includes(m.id)}
                    onSelect={() => {
                      onSelectContent(m);
                      onClose();
                    }}
                    onPlay={() => {
                      onPlayContent(m);
                      onClose();
                    }}
                    onToggleFavorite={() => onToggleFavorite(m.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Series results */}
          {searchResults.series.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-red-500 flex items-center gap-2">
                <Tv className="w-4 h-4" />
                Séries
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {searchResults.series.map((s, idx) => (
                  <ContentCard
                    key={`${s.id}-${idx}`}
                    item={s}
                    type="series"
                    aspect="poster"
                    isFavorite={favorites.includes(s.id)}
                    onSelect={() => {
                      onSelectContent(s);
                      onClose();
                    }}
                    onPlay={() => {
                      onPlayContent(s);
                      onClose();
                    }}
                    onToggleFavorite={() => onToggleFavorite(s.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {searchResults.total === 0 && (
            <div className="text-center py-20 text-zinc-500">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-base font-semibold text-zinc-400">Nenhum resultado encontrado</p>
              <p className="text-xs text-zinc-500 mt-1">Tente pesquisar por outro título, ator, diretor ou categoria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
