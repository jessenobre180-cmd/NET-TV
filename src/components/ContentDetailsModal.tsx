import React, { useState } from 'react';
import { X, Play, Plus, Check, Star, Clock, Calendar, Film, Tv, Radio } from 'lucide-react';
import { Movie, Series, LiveChannel, Episode } from '../types';

interface ContentDetailsModalProps {
  content: Movie | Series | LiveChannel | null;
  isFavorite: boolean;
  onClose: () => void;
  onPlay: (item: any, episode?: Episode) => void;
  onToggleFavorite: () => void;
}

export const ContentDetailsModal: React.FC<ContentDetailsModalProps> = ({
  content,
  isFavorite,
  onClose,
  onPlay,
  onToggleFavorite
}) => {
  const [selectedSeason, setSelectedSeason] = useState<number>(1);

  if (!content) return null;

  const isMovie = 'duration' in content;
  const isSeries = 'seasons' in content;
  const isChannel = 'channelNumber' in content;

  const movie = isMovie ? (content as Movie) : null;
  const series = isSeries ? (content as Series) : null;
  const channel = isChannel ? (content as LiveChannel) : null;

  const currentSeason = series?.seasons?.find(s => s.seasonNumber === selectedSeason) || series?.seasons?.[0];

  const modalTitle = movie?.title || series?.title || channel?.name || '';
  const modalImage = movie?.backdropUrl || movie?.posterUrl || series?.backdropUrl || series?.posterUrl || channel?.bannerUrl || channel?.logoUrl || '';
  const modalSynopsis = movie?.synopsis || series?.synopsis || channel?.currentProgram.synopsis || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-white border border-white/10 transition-colors"
          title="Fechar (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Banner inside modal */}
        <div className="relative w-full aspect-[21/9] min-h-[220px] max-h-[380px] overflow-hidden">
          <img
            src={modalImage}
            alt={modalTitle}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div className="space-y-2">
              {isChannel && (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-red-600 text-white text-xs font-bold rounded-sm uppercase tracking-wider inline-flex">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  CANAL AO VIVO #{channel?.channelNumber}
                </span>
              )}

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
                {modalTitle}
              </h2>

              <div className="flex items-center gap-3 text-xs text-zinc-300 font-medium">
                {movie && (
                  <>
                    <span>{movie.year}</span>
                    <span>·</span>
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 border border-white/10">{movie.ageRating}</span>
                    <span>·</span>
                    <span>{movie.duration}</span>
                  </>
                )}
                {series && (
                  <>
                    <span>{series.year}</span>
                    <span>·</span>
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 border border-white/10">{series.ageRating}</span>
                    <span>·</span>
                    <span>{series.seasonsCount} Temporadas ({series.totalEpisodes} eps)</span>
                  </>
                )}
                {channel && (
                  <>
                    <span>{channel.category}</span>
                    <span>·</span>
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 border border-white/10">{channel.resolution}</span>
                    <span>·</span>
                    <span className="text-emerald-400 font-semibold">Online HD</span>
                  </>
                )}
                {(movie?.rating || series?.rating) && (
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {movie?.rating || series?.rating}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onPlay(content)}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg active:scale-95 neon-glow-red"
              >
                <Play className="w-4 h-4 fill-current" />
                Assistir
              </button>

              {!isChannel && (
                <button
                  onClick={onToggleFavorite}
                  className={`p-2.5 rounded-xl border transition-all active:scale-95 ${
                    isFavorite 
                      ? 'bg-zinc-800 text-white border-red-500' 
                      : 'bg-zinc-900/80 text-white border-white/20 hover:bg-zinc-800'
                  }`}
                  title={isFavorite ? 'Remover da Lista' : 'Adicionar à Lista'}
                >
                  {isFavorite ? <Check className="w-4 h-4 text-red-500" /> : <Plus className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Details Body */}
        <div className="p-6 space-y-6">
          {/* Synopsis & Meta Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Sinopse</h4>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                {modalSynopsis || 'Sem descrição cadastrada.'}
              </p>

              {/* Channel live schedule */}
              {channel && (
                <div className="mt-4 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                  <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Grade de Programação
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs text-red-500 font-bold uppercase">No Ar Agora</div>
                      <div className="text-sm font-bold text-white">{channel.currentProgram.title}</div>
                      <div className="text-xs text-zinc-400">{channel.currentProgram.start} às {channel.currentProgram.end}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-zinc-500 font-medium">A Seguir</div>
                      <div className="text-sm font-semibold text-zinc-300">{channel.nextProgram.title}</div>
                      <div className="text-xs text-zinc-400">{channel.nextProgram.start} às {channel.nextProgram.end}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Meta Column */}
            <div className="space-y-4 text-xs bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/80">
              {(movie?.cast || series?.cast) && (
                <div>
                  <span className="text-zinc-500 font-medium block mb-1">Elenco Principal:</span>
                  <p className="text-zinc-200">{(movie?.cast || series?.cast || []).join(', ')}</p>
                </div>
              )}

              {(movie?.director || series?.creator) && (
                <div>
                  <span className="text-zinc-500 font-medium block mb-1">
                    {movie ? 'Direção:' : 'Criação:'}
                  </span>
                  <p className="text-zinc-200">{movie?.director || series?.creator}</p>
                </div>
              )}

              {(movie?.genre || series?.genre) && (
                <div>
                  <span className="text-zinc-500 font-medium block mb-1">Gêneros:</span>
                  <p className="text-zinc-200">{(movie?.genre || series?.genre || []).join(' · ')}</p>
                </div>
              )}

              <div>
                <span className="text-zinc-500 font-medium block mb-1">Visualizações:</span>
                <p className="text-zinc-200 font-mono">{content.views?.toLocaleString('pt-BR') || '12.400'} visualizações</p>
              </div>
            </div>
          </div>

          {/* Series Episodes Browser */}
          {series && series.seasons && (
            <div className="pt-4 border-t border-zinc-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Tv className="w-5 h-5 text-red-600" />
                  Episódios
                </h3>

                {/* Season Picker */}
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(Number(e.target.value))}
                  className="bg-zinc-900 text-white text-xs font-semibold px-3 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:border-red-500"
                >
                  {series.seasons.map(s => (
                    <option key={s.seasonNumber} value={s.seasonNumber}>
                      {s.title || `Temporada ${s.seasonNumber}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Episodes List */}
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {currentSeason?.episodes?.map((ep, idx) => (
                  <div
                    key={`${ep.id}-${idx}`}
                    onClick={() => onPlay(series, ep)}
                    className="group/ep flex items-center gap-4 p-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-red-600/40 cursor-pointer transition-all"
                  >
                    <div className="relative w-28 sm:w-36 aspect-video rounded-lg overflow-hidden shrink-0 bg-black">
                      <img
                        src={ep.thumbnailUrl || series.backdropUrl}
                        alt={ep.title}
                        className="w-full h-full object-cover group-hover/ep:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover/ep:bg-black/10 flex items-center justify-center">
                        <div className="p-2 rounded-full bg-red-600 text-white opacity-0 group-hover/ep:opacity-100 transition-opacity">
                          <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-bold text-white text-xs sm:text-sm truncate group-hover/ep:text-red-400 transition-colors">
                          {ep.title}
                        </h5>
                        <span className="text-[11px] font-mono text-zinc-400 shrink-0 ml-2">
                          {ep.duration}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed">
                        {ep.synopsis}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
