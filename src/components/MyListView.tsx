import React from 'react';
import { Bookmark, Play, Trash2, Clock, Film } from 'lucide-react';
import { Movie, Series, WatchProgress } from '../types';
import { ContentCard } from './ContentCard';

interface MyListViewProps {
  movies: Movie[];
  series: Series[];
  favorites: string[];
  watchHistory: WatchProgress[];
  onSelectContent: (item: any) => void;
  onPlayContent: (item: any) => void;
  onToggleFavorite: (id: string) => void;
}

export const MyListView: React.FC<MyListViewProps> = ({
  movies,
  series,
  favorites,
  watchHistory,
  onSelectContent,
  onPlayContent,
  onToggleFavorite
}) => {
  // Aggregate favorite movies and series
  const favoriteItems = [
    ...movies.filter(m => favorites.includes(m.id)),
    ...series.filter(s => favorites.includes(s.id))
  ];

  return (
    <div className="px-4 sm:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-800">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Bookmark className="w-7 h-7 text-red-600" />
          Minha Lista & Histórico
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Seus títulos salvos para assistir mais tarde e progresso de reprodução salvo na sua conta.
        </p>
      </div>

      {/* Continuar Assistindo Section */}
      {watchHistory.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-red-500" />
            Continuar de Onde Parou
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {watchHistory.map((item, idx) => (
              <div
                key={`${item.contentId}-${idx}`}
                className="group relative rounded-xl bg-zinc-900 border border-white/5 hover:border-red-500/60 overflow-hidden transition-all p-3"
              >
                <div className="relative aspect-video rounded-lg overflow-hidden bg-black mb-3">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onPlayContent(item)}
                      className="p-3 rounded-full bg-red-600 text-white shadow-lg neon-glow-red"
                    >
                      <Play className="w-5 h-5 fill-current translate-x-0.5" />
                    </button>
                  </div>
                  {/* Progress Line */}
                  <div className="absolute bottom-0 inset-x-0 h-1.5 bg-zinc-800">
                    <div
                      className="h-full bg-red-600"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-white truncate">{item.title}</h4>
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>{item.percentage}% concluído</span>
                    <button
                      onClick={() => onPlayContent(item)}
                      className="text-red-500 hover:text-red-400 font-semibold"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Favorites Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-red-500" />
          Títulos Favoritos ({favoriteItems.length})
        </h3>

        {favoriteItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {favoriteItems.map((item, idx) => (
              <ContentCard
                key={`${item.id}-${idx}`}
                item={item}
                type={'duration' in item ? 'movie' : 'series'}
                aspect="poster"
                isFavorite={true}
                onSelect={() => onSelectContent(item)}
                onPlay={() => onPlayContent(item)}
                onToggleFavorite={() => onToggleFavorite(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-zinc-900/30 rounded-2xl border border-zinc-800/80 p-8">
            <Film className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white mb-1">Sua lista está vazia</h4>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto">
              Adicione filmes e séries favoritos clicando no ícone "+" em qualquer capa ou banner para encontrá-los aqui rapidamente.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
