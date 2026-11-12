import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar, NavTab, DeviceMode } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HeroBanner } from './components/HeroBanner';
import { ContentCarousel } from './components/ContentCarousel';
import { NetPlayer } from './components/NetPlayer';
import { ContentDetailsModal } from './components/ContentDetailsModal';
import { MoviesView } from './components/MoviesView';
import { SeriesView } from './components/SeriesView';
import { LiveTVHub } from './components/LiveTVHub';
import { MyListView } from './components/MyListView';
import { SearchModal } from './components/SearchModal';
import { AdminPanel } from './components/AdminPanel';
import { TvRemoteControl } from './components/TvRemoteControl';
import { ServerModal } from './components/ServerModal';
import { Movie, Series, LiveChannel, Episode, WatchProgress, StreamingServer } from './types';
import { api } from './services/api';
import { Sparkles, Radio, Film, Tv, ShieldAlert } from 'lucide-react';

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [channels, setChannels] = useState<LiveChannel[]>([]);
  const [servers, setServers] = useState<StreamingServer[]>([]);
  const [activeServer, setActiveServer] = useState<StreamingServer | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [watchHistory, setWatchHistory] = useState<WatchProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('tv'); // default to rich immersive experience
  const [isScrolled, setIsScrolled] = useState(false);

  // Active Modals & Overlays
  const [selectedContent, setSelectedContent] = useState<Movie | Series | LiveChannel | null>(null);
  const [activePlayerItem, setActivePlayerItem] = useState<{
    movie?: Movie;
    episode?: Episode;
    seriesTitle?: string;
    nextEpisode?: Episode;
    channel?: LiveChannel;
    initialTime?: number;
  } | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [isTvRemoteOpen, setIsTvRemoteOpen] = useState(false);

  // Load initial content from API
  const loadContent = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getContents();
      setMovies(data.movies || []);
      setSeries(data.series || []);
      setChannels(data.channels || []);
      setFavorites(data.favorites || []);
      setWatchHistory(data.watchHistory || []);
      const loadedServers = data.servers || [];
      setServers(loadedServers);
      if (loadedServers.length > 0) {
        const def = loadedServers.find(s => s.isDefault) || loadedServers[0];
        setActiveServer(prev => prev ? (loadedServers.find(s => s.id === prev.id) || def) : def);
      }
    } catch (err: any) {
      console.error(err);
      setError('Não foi possível carregar os dados do servidor NetTV.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  // Scroll listener for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // TV remote control keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (activePlayerItem) return; // Player handles its own shortcuts
      if (isSearchOpen || isAdminOpen) return;

      if (e.key === 't' || e.key === 'T') {
        setIsTvRemoteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activePlayerItem, isSearchOpen, isAdminOpen]);

  // Featured Hero content (prefer featured sci-fi or action movie)
  const heroContent = useMemo(() => {
    const feat = movies.find(m => m.featured) || movies[0];
    return feat || null;
  }, [movies]);

  // Carousel groups
  const popularMovies = useMemo(() => {
    return [...movies].sort((a, b) => b.views - a.views);
  }, [movies]);

  const recentMovies = useMemo(() => {
    return [...movies].sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  }, [movies]);

  const featuredSeries = useMemo(() => {
    return series;
  }, [series]);

  const liveChannelsCarousel = useMemo(() => {
    return channels;
  }, [channels]);

  const newlyReleasedItems = useMemo(() => {
    return [...movies].sort((a, b) => (b.year - a.year) || (new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()));
  }, [movies]);

  const recommendedContent = useMemo(() => {
    return [...movies].reverse();
  }, [movies]);

  // Action handlers
  const handleToggleFavorite = async (id: string) => {
    try {
      const res = await api.toggleFavorite(id);
      setFavorites(res.favorites);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePlayContent = (item: any, episode?: Episode) => {
    api.recordPlay(item.contentId || item.id);

    if ('channelNumber' in item) {
      // Live Channel
      setActivePlayerItem({
        channel: item as LiveChannel
      });
    } else if (episode) {
      // Series Episode
      const seriesItem = item as Series;
      // find next episode if available
      let nextEp: Episode | undefined;
      const allEps = seriesItem.seasons.flatMap(s => s.episodes);
      const currentIndex = allEps.findIndex(e => e.id === episode.id);
      if (currentIndex >= 0 && currentIndex < allEps.length - 1) {
        nextEp = allEps[currentIndex + 1];
      }

      setActivePlayerItem({
        episode,
        seriesTitle: seriesItem.title,
        nextEpisode: nextEp
      });
    } else if ('seasons' in item) {
      // Series without episode chosen: play first episode
      const seriesItem = item as Series;
      const firstEp = seriesItem.seasons[0]?.episodes[0];
      const nextEp = seriesItem.seasons[0]?.episodes[1];
      if (firstEp) {
        setActivePlayerItem({
          episode: firstEp,
          seriesTitle: seriesItem.title,
          nextEpisode: nextEp
        });
      }
    } else if ('duration' in item) {
      // Movie
      setActivePlayerItem({
        movie: item as Movie
      });
    } else if (item.contentType === 'movie') {
      // From history
      const originalMovie = movies.find(m => m.id === item.contentId);
      setActivePlayerItem({
        movie: originalMovie || {
          id: item.contentId,
          title: item.title,
          synopsis: '',
          year: 2025,
          genre: ['Ação'],
          ageRating: '16',
          duration: '2h',
          durationMinutes: 120,
          rating: 8.5,
          posterUrl: item.thumbnailUrl,
          backdropUrl: item.thumbnailUrl,
          videoUrl: '/videos/scifi_stream.mp4',
          cast: [],
          director: '',
          views: 100,
          addedAt: '2026-01-01'
        },
        initialTime: item.progressSeconds
      });
    } else if (item.contentType === 'episode') {
      // Episode from history
      const originalSeries = series.find(s => s.id === item.seriesId);
      setActivePlayerItem({
        episode: {
          id: item.episodeId || 'ep-1',
          seriesId: item.seriesId || '',
          seasonNumber: item.seasonNumber || 1,
          episodeNumber: item.episodeNumber || 1,
          title: item.title,
          synopsis: '',
          duration: '50m',
          durationMinutes: 50,
          videoUrl: '/videos/fantasy_stream.mp4',
          thumbnailUrl: item.thumbnailUrl
        },
        seriesTitle: originalSeries?.title || 'Série NetTV',
        initialTime: item.progressSeconds
      });
    }
  };

  const handlePlayerProgressUpdate = (currentTime: number, duration: number) => {
    if (!activePlayerItem || activePlayerItem.channel) return;

    const percentage = Math.round((currentTime / (duration || 1)) * 100);

    let progressData: WatchProgress | null = null;

    if (activePlayerItem.movie) {
      progressData = {
        contentId: activePlayerItem.movie.id,
        contentType: 'movie',
        title: activePlayerItem.movie.title,
        thumbnailUrl: activePlayerItem.movie.backdropUrl || activePlayerItem.movie.posterUrl,
        progressSeconds: Math.floor(currentTime),
        durationSeconds: Math.floor(duration),
        percentage,
        completed: percentage > 92,
        lastWatchedAt: new Date().toISOString()
      };
    } else if (activePlayerItem.episode) {
      progressData = {
        contentId: activePlayerItem.episode.seriesId,
        contentType: 'episode',
        seriesId: activePlayerItem.episode.seriesId,
        episodeId: activePlayerItem.episode.id,
        title: `${activePlayerItem.seriesTitle}: ${activePlayerItem.episode.title}`,
        thumbnailUrl: activePlayerItem.episode.thumbnailUrl,
        progressSeconds: Math.floor(currentTime),
        durationSeconds: Math.floor(duration),
        percentage,
        completed: percentage > 92,
        lastWatchedAt: new Date().toISOString(),
        seasonNumber: activePlayerItem.episode.seasonNumber,
        episodeNumber: activePlayerItem.episode.episodeNumber
      };
    }

    if (progressData && currentTime > 3) {
      api.updateWatchProgress(progressData).then(updated => {
        setWatchHistory(updated);
      }).catch(() => {});
    }
  };

  // Virtual TV Remote Direction Handler
  const handleTvRemoteDirection = (dir: 'up' | 'down' | 'left' | 'right' | 'select' | 'back' | 'home') => {
    if (dir === 'home') {
      setActiveTab('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (dir === 'back') {
      if (activePlayerItem) {
        setActivePlayerItem(null);
      } else if (selectedContent) {
        setSelectedContent(null);
      } else if (isSearchOpen) {
        setIsSearchOpen(false);
      } else if (isAdminOpen) {
        setIsAdminOpen(false);
      }
    } else if (dir === 'up') {
      window.scrollBy({ top: -300, behavior: 'smooth' });
    } else if (dir === 'down') {
      window.scrollBy({ top: 300, behavior: 'smooth' });
    } else if (dir === 'select') {
      if (heroContent && !selectedContent && !activePlayerItem) {
        handlePlayContent(heroContent);
      }
    }
  };

  // Device mode styling adjustments
  const getContainerMaxWidth = () => {
    if (deviceMode === 'mobile') return 'max-w-md mx-auto min-h-screen border-x border-zinc-900 shadow-2xl';
    if (deviceMode === 'tablet') return 'max-w-5xl mx-auto';
    return 'w-full'; // Android TV / Desktop full immersion
  };

  return (
    <div className={`min-h-screen bg-[#08090c] text-zinc-100 flex flex-col ${deviceMode === 'tv' ? 'tv-mode-active' : ''}`}>
      {/* Device frame wrapper when simulating mobile or tablet */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${getContainerMaxWidth()}`}>
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          deviceMode={deviceMode}
          onDeviceModeChange={setDeviceMode}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
          activeServer={activeServer}
          onOpenServers={() => setIsServerModalOpen(true)}
          isScrolled={isScrolled}
        />

        {/* Main Content Areas */}
        <main className="flex-1 pb-20 md:pb-12">
          {isLoading ? (
            <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
              <p className="text-zinc-400 font-semibold text-sm">Carregando NetTV...</p>
            </div>
          ) : error ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
              <ShieldAlert className="w-12 h-12 text-red-500" />
              <h3 className="text-xl font-bold text-white">Falha na Conexão</h3>
              <p className="text-sm text-zinc-400 max-w-md">{error}</p>
              <button
                onClick={loadContent}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs"
              >
                Tentar Novamente
              </button>
            </div>
          ) : (
            <>
              {/* TAB 1: INÍCIO (HOME) */}
              {activeTab === 'home' && (
                <div className="space-y-6">
                  {/* Hero Banner */}
                  {heroContent && (
                    <HeroBanner
                      content={heroContent}
                      isFavorite={favorites.includes(heroContent.id)}
                      onPlay={() => handlePlayContent(heroContent)}
                      onSelect={() => setSelectedContent(heroContent)}
                      onToggleFavorite={() => handleToggleFavorite(heroContent.id)}
                    />
                  )}

                  {/* Continuar Assistindo (when user has watch progress) */}
                  {watchHistory.length > 0 && (
                    <ContentCarousel
                      title="Continuar Assistindo"
                      items={watchHistory}
                      type="history"
                      aspect="landscape"
                      onSelect={(hist) => handlePlayContent(hist)}
                      onPlay={(hist) => handlePlayContent(hist)}
                    />
                  )}

                  {/* Recém-Lançados & Novidades do Catálogo */}
                  <ContentCarousel
                    title="Recém-Lançados no NetTV"
                    badge="NOVO 2026"
                    subtitle="Estreias cinematográficas e novos títulos adicionados automaticamente"
                    items={newlyReleasedItems}
                    type="movie"
                    aspect="landscape"
                    favorites={favorites}
                    onSelect={(m) => setSelectedContent(m)}
                    onPlay={(m) => handlePlayContent(m)}
                    onToggleFavorite={handleToggleFavorite}
                  />

                  {/* Filmes Populares */}
                  <ContentCarousel
                    title="Filmes Mais Assistidos"
                    items={popularMovies}
                    type="movie"
                    aspect="poster"
                    favorites={favorites}
                    onSelect={(m) => setSelectedContent(m)}
                    onPlay={(m) => handlePlayContent(m)}
                    onToggleFavorite={handleToggleFavorite}
                  />

                  {/* TV ao Vivo no Ar Agora */}
                  <ContentCarousel
                    title="Canais de TV ao Vivo no Ar"
                    items={liveChannelsCarousel}
                    type="channel"
                    aspect="landscape"
                    onSelect={(ch) => handlePlayContent(ch)}
                    onPlay={(ch) => handlePlayContent(ch)}
                  />

                  {/* Séries em Destaque */}
                  <ContentCarousel
                    title="Séries em Destaque"
                    items={featuredSeries}
                    type="series"
                    aspect="poster"
                    favorites={favorites}
                    onSelect={(s) => setSelectedContent(s)}
                    onPlay={(s) => handlePlayContent(s)}
                    onToggleFavorite={handleToggleFavorite}
                  />

                  {/* Filmes Adicionados Recentemente */}
                  <ContentCarousel
                    title="Adicionados Recentemente"
                    items={recentMovies}
                    type="movie"
                    aspect="poster"
                    favorites={favorites}
                    onSelect={(m) => setSelectedContent(m)}
                    onPlay={(m) => handlePlayContent(m)}
                    onToggleFavorite={handleToggleFavorite}
                  />

                  {/* Recomendados para Você */}
                  <ContentCarousel
                    title="Recomendados para Você"
                    items={recommendedContent}
                    type="movie"
                    aspect="poster"
                    favorites={favorites}
                    onSelect={(m) => setSelectedContent(m)}
                    onPlay={(m) => handlePlayContent(m)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </div>
              )}

              {/* TAB 2: FILMES */}
              {activeTab === 'movies' && (
                <div className="pt-20">
                  <MoviesView
                    movies={movies}
                    favorites={favorites}
                    onSelectMovie={(m) => setSelectedContent(m)}
                    onPlayMovie={(m) => handlePlayContent(m)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </div>
              )}

              {/* TAB 3: SÉRIES */}
              {activeTab === 'series' && (
                <div className="pt-20">
                  <SeriesView
                    series={series}
                    favorites={favorites}
                    onSelectSeries={(s) => setSelectedContent(s)}
                    onPlaySeries={(s) => handlePlayContent(s)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </div>
              )}

              {/* TAB 4: TV AO VIVO */}
              {activeTab === 'live' && (
                <div className="pt-20">
                  <LiveTVHub
                    channels={channels}
                    onPlayChannel={(ch) => handlePlayContent(ch)}
                    onSelectChannel={(ch) => setSelectedContent(ch)}
                  />
                </div>
              )}

              {/* TAB 5: MINHA LISTA */}
              {activeTab === 'mylist' && (
                <div className="pt-20">
                  <MyListView
                    movies={movies}
                    series={series}
                    favorites={favorites}
                    watchHistory={watchHistory}
                    onSelectContent={(item) => setSelectedContent(item)}
                    onPlayContent={(item) => handlePlayContent(item)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </div>
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-900 bg-black/60 py-8 px-4 sm:px-8 text-xs text-zinc-500">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-['Oswald'] text-lg font-black text-white">
                NET<span className="text-red-600">TV</span>
              </span>
              <span>— Plataforma de Streaming & Televisão Digital ao Vivo</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-zinc-400">
              <span>Transmissões 100% Autorizadas</span>
              <span aria-hidden="true">·</span>
              <span>Suporte Android & TV</span>
              <span aria-hidden="true">·</span>
              <span>Áudio Dolby 5.1 & 4K</span>
            </div>
          </div>
        </footer>

        {/* Mobile Fixed Bottom Nav */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Virtual Android TV Remote Control Tool */}
      <TvRemoteControl
        isOpen={isTvRemoteOpen}
        onToggle={() => setIsTvRemoteOpen(!isTvRemoteOpen)}
        onDirection={handleTvRemoteDirection}
      />

      {/* Content Details Modal / Drawer */}
      <ContentDetailsModal
        content={selectedContent}
        isFavorite={selectedContent ? favorites.includes(selectedContent.id) : false}
        onClose={() => setSelectedContent(null)}
        onPlay={(item, ep) => {
          setSelectedContent(null);
          handlePlayContent(item, ep);
        }}
        onToggleFavorite={() => {
          if (selectedContent) handleToggleFavorite(selectedContent.id);
        }}
      />

      {/* NetTV Custom Video Player */}
      {activePlayerItem && (
        <NetPlayer
          movie={activePlayerItem.movie}
          episode={activePlayerItem.episode}
          seriesTitle={activePlayerItem.seriesTitle}
          nextEpisode={activePlayerItem.nextEpisode}
          channel={activePlayerItem.channel}
          allChannels={channels}
          servers={servers}
          activeServer={activeServer}
          onSelectServer={(s) => setActiveServer(s)}
          initialTime={activePlayerItem.initialTime}
          onSelectChannel={(ch) => {
            setActivePlayerItem({ channel: ch });
          }}
          onPlayNextEpisode={() => {
            if (activePlayerItem.nextEpisode) {
              const currentSeries = series.find(s => s.id === activePlayerItem.episode?.seriesId);
              const allEps = currentSeries ? currentSeries.seasons.flatMap(s => s.episodes) : [];
              const nextIndex = allEps.findIndex(e => e.id === activePlayerItem.nextEpisode?.id);
              const afterNext = nextIndex >= 0 && nextIndex < allEps.length - 1 ? allEps[nextIndex + 1] : undefined;

              setActivePlayerItem({
                episode: activePlayerItem.nextEpisode,
                seriesTitle: activePlayerItem.seriesTitle,
                nextEpisode: afterNext
              });
            }
          }}
          onClose={() => setActivePlayerItem(null)}
          onProgressUpdate={handlePlayerProgressUpdate}
        />
      )}

      {/* Smart Search Modal */}
      {isSearchOpen && (
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          movies={movies}
          series={series}
          channels={channels}
          favorites={favorites}
          onSelectContent={(item) => setSelectedContent(item)}
          onPlayContent={(item) => handlePlayContent(item)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* Protected Admin Panel */}
      {isAdminOpen && (
        <AdminPanel
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          onDataChanged={loadContent}
          movies={movies}
          series={series}
          channels={channels}
          servers={servers}
        />
      )}

      {/* Streaming Server Selector & Add Server Modal */}
      {isServerModalOpen && (
        <ServerModal
          isOpen={isServerModalOpen}
          onClose={() => setIsServerModalOpen(false)}
          servers={servers}
          activeServer={activeServer}
          onSelectServer={(s) => setActiveServer(s)}
          onServersUpdated={loadContent}
        />
      )}
    </div>
  );
}
