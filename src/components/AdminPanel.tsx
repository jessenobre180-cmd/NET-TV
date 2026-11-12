import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, Film, Tv, Radio, BarChart3, Plus, 
  Trash2, Edit3, X, RefreshCw, Check, AlertCircle, Eye, Users, PlaySquare,
  Server, Globe, Activity, Sparkles, Wand2, DownloadCloud, Zap, Flame
} from 'lucide-react';
import { Movie, Series, LiveChannel, AdminStats, AgeRating, ChannelCategory, StreamingServer } from '../types';
import { api } from '../services/api';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
  movies: Movie[];
  series: Series[];
  channels: LiveChannel[];
  servers: StreamingServer[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  onDataChanged,
  movies,
  series,
  channels,
  servers
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'movies' | 'series' | 'channels' | 'servers'>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [isAutoPopulating, setIsAutoPopulating] = useState(false);
  const [autoPopulateSuccessMsg, setAutoPopulateSuccessMsg] = useState<string | null>(null);

  // Forms states
  const [showAddMovieModal, setShowAddMovieModal] = useState(false);
  const [showAddSeriesModal, setShowAddSeriesModal] = useState(false);
  const [showAddChannelModal, setShowAddChannelModal] = useState(false);
  const [showAddServerModal, setShowAddServerModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Server form
  const [serverForm, setServerForm] = useState({
    name: '',
    baseUrl: '',
    region: 'América do Sul (Brasil)',
    type: 'cdn' as 'cdn' | 'backup' | 'custom' | 'hls',
    isDefault: false
  });

  // Movie form
  const [movieForm, setMovieForm] = useState({
    title: '',
    originalTitle: '',
    synopsis: '',
    year: 2026,
    genre: 'Ação, Suspense',
    ageRating: '16' as AgeRating,
    duration: '2h 00m',
    durationMinutes: 120,
    rating: 8.5,
    posterUrl: '',
    backdropUrl: '',
    videoUrl: '/videos/scifi_stream.mp4',
    director: '',
    cast: ''
  });

  // Series form
  const [seriesForm, setSeriesForm] = useState({
    title: '',
    synopsis: '',
    year: 2026,
    genre: 'Drama, Ficção científica',
    ageRating: '16' as AgeRating,
    rating: 8.7,
    posterUrl: '',
    backdropUrl: '',
    creator: '',
    cast: '',
    episodesCount: 4,
    sampleEpisodeVideo: '/videos/fantasy_stream.mp4'
  });

  // Channel form
  const [channelForm, setChannelForm] = useState({
    channelNumber: 110,
    name: '',
    category: 'Entretenimento' as ChannelCategory,
    logoUrl: '',
    bannerUrl: '',
    streamUrl: '/videos/sports_stream.mp4',
    resolution: '1080p' as '1080p' | '720p' | '4K',
    programTitle: 'Transmissão Especial NetTV',
    programStart: '20:00',
    programEnd: '22:00'
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
    }
  }, [isAuthenticated]);

  if (!isOpen) return null;

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const data = await api.getAdminStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    try {
      const res = await api.adminLogin(pin);
      if (res.success) {
        setIsAuthenticated(true);
      } else {
        setPinError(res.error || 'PIN incorreto. Use 1234.');
      }
    } catch (e: any) {
      setPinError('Erro de conexão ao autenticar');
    }
  };

  const handleDeleteMovie = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este filme do catálogo?')) {
      try {
        await api.deleteMovie(id);
        onDataChanged();
        loadStats();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleDeleteSeries = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta série?')) {
      try {
        await api.deleteSeries(id);
        onDataChanged();
        loadStats();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleDeleteChannel = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este canal de TV?')) {
      try {
        await api.deleteChannel(id);
        onDataChanged();
        loadStats();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleSaveMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const genreArray = movieForm.genre.split(',').map(s => s.trim()).filter(Boolean);
      const castArray = movieForm.cast.split(',').map(s => s.trim()).filter(Boolean);

      const payload = {
        title: movieForm.title,
        originalTitle: movieForm.originalTitle,
        synopsis: movieForm.synopsis,
        year: Number(movieForm.year),
        genre: genreArray.length ? genreArray : ['Ação'],
        ageRating: movieForm.ageRating,
        duration: movieForm.duration,
        durationMinutes: Number(movieForm.durationMinutes),
        rating: Number(movieForm.rating),
        posterUrl: movieForm.posterUrl || '/src/assets/images/movie_poster_action_1794036937639.jpg',
        backdropUrl: movieForm.backdropUrl || movieForm.posterUrl || '/src/assets/images/hero_scifi_cyberpunk_1794036935679.jpg',
        videoUrl: movieForm.videoUrl,
        cast: castArray.length ? castArray : ['Elenco NetTV'],
        director: movieForm.director || 'Diretor NetTV'
      };

      if (editingItem) {
        await api.updateMovie(editingItem.id, payload);
      } else {
        await api.addMovie(payload);
      }

      setShowAddMovieModal(false);
      setEditingItem(null);
      onDataChanged();
      loadStats();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const genreArray = seriesForm.genre.split(',').map(s => s.trim()).filter(Boolean);
      const castArray = seriesForm.cast.split(',').map(s => s.trim()).filter(Boolean);

      const episodes = [];
      for (let i = 1; i <= seriesForm.episodesCount; i++) {
        episodes.push({
          id: `ep-${Date.now()}-${i}`,
          seriesId: editingItem?.id || '',
          seasonNumber: 1,
          episodeNumber: i,
          title: `Ep. ${i} - O Segredo Revelado`,
          synopsis: `Episódio imperdível da série ${seriesForm.title}. Desfechos eletrizantes e reviravoltas.`,
          duration: '48m',
          durationMinutes: 48,
          videoUrl: seriesForm.sampleEpisodeVideo,
          thumbnailUrl: seriesForm.backdropUrl || seriesForm.posterUrl || '/src/assets/images/series_banner_fantasy_1794036936974.jpg'
        });
      }

      const payload = {
        title: seriesForm.title,
        synopsis: seriesForm.synopsis,
        year: Number(seriesForm.year),
        genre: genreArray.length ? genreArray : ['Drama'],
        ageRating: seriesForm.ageRating,
        rating: Number(seriesForm.rating),
        posterUrl: seriesForm.posterUrl || '/src/assets/images/series_banner_fantasy_1794036936974.jpg',
        backdropUrl: seriesForm.backdropUrl || seriesForm.posterUrl || '/src/assets/images/series_banner_fantasy_1794036936974.jpg',
        creator: seriesForm.creator || 'NetTV Studios',
        cast: castArray.length ? castArray : ['Elenco NetTV'],
        seasonsCount: 1,
        seasons: [
          {
            seasonNumber: 1,
            title: 'Temporada 1',
            episodes
          }
        ]
      };

      if (editingItem) {
        await api.updateSeries(editingItem.id, payload);
      } else {
        await api.addSeries(payload);
      }

      setShowAddSeriesModal(false);
      setEditingItem(null);
      onDataChanged();
      loadStats();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        channelNumber: Number(channelForm.channelNumber),
        name: channelForm.name,
        category: channelForm.category,
        logoUrl: channelForm.logoUrl || 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=200&auto=format&fit=crop&q=80',
        bannerUrl: channelForm.bannerUrl || '/src/assets/images/live_tv_sports_action_1794036938580.jpg',
        streamUrl: channelForm.streamUrl,
        isOnline: true,
        resolution: channelForm.resolution,
        currentProgram: {
          title: channelForm.programTitle,
          start: channelForm.programStart,
          end: channelForm.programEnd,
          progressPercentage: 50
        },
        nextProgram: {
          title: 'Programação da Madrugada',
          start: channelForm.programEnd,
          end: '02:00'
        }
      };

      if (editingItem) {
        await api.updateChannel(editingItem.id, payload);
      } else {
        await api.addChannel(payload);
      }

      setShowAddChannelModal(false);
      setEditingItem(null);
      onDataChanged();
      loadStats();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResetCatalog = async () => {
    if (confirm('Atenção: deseja restaurar o catálogo padrão de filmes, séries e canais de TV?')) {
      try {
        await api.resetDefaultCatalog();
        alert('Catálogo original restaurado com sucesso!');
        onDataChanged();
        loadStats();
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  const handleSaveServer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: serverForm.name,
        baseUrl: serverForm.baseUrl,
        region: serverForm.region,
        type: serverForm.type,
        status: 'online' as const,
        pingMs: Math.floor(Math.random() * 30) + 15,
        isDefault: serverForm.isDefault
      };

      if (editingItem) {
        await api.updateServer(editingItem.id, payload);
      } else {
        await api.addServer(payload);
      }

      setShowAddServerModal(false);
      setEditingItem(null);
      onDataChanged();
      loadStats();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteServer = async (id: string, name: string) => {
    if (confirm(`Deseja remover o servidor "${name}"?`)) {
      try {
        await api.deleteServer(id);
        onDataChanged();
        loadStats();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleSetDefaultServer = async (id: string) => {
    try {
      await api.setDefaultServer(id);
      onDataChanged();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAutoPopulate = async (type: 'all' | 'movies' | 'series' | 'channels' = 'all', useAI: boolean = false) => {
    try {
      setIsAutoPopulating(true);
      setAutoPopulateSuccessMsg(null);
      const res = await api.autoPopulateCatalog({ type, count: 3, useAI });
      onDataChanged();
      await loadStats();
      const msg = `Conteúdos recém-lançados adicionados com sucesso! (+${res.added.moviesCount} filmes, +${res.added.seriesCount} séries, +${res.added.channelsCount} canais)`;
      setAutoPopulateSuccessMsg(msg);
      setTimeout(() => setAutoPopulateSuccessMsg(null), 5000);
    } catch (e: any) {
      alert(e.message || 'Erro ao auto-adicionar conteúdos');
    } finally {
      setIsAutoPopulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/20 text-red-500 border border-red-600/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Painel Administrativo NetTV
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-red-600/30 text-red-400 border border-red-600/50">
                  Gerenciamento de Conteúdo
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Gerencie filmes, séries, temporadas, canais autorizados e monitore estatísticas.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {!isAuthenticated ? (
          /* Authentication Screen */
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-500 mb-4 shadow-xl">
              <Lock className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Acesso Restrito</h4>
            <p className="text-xs sm:text-sm text-zinc-400 mb-6">
              Digite a senha ou PIN de administrador para acessar o gerenciador de catálogo do NetTV. (PIN padrão: <strong className="text-red-400 font-mono">1234</strong>)
            </p>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="PIN do Administrador (ex: 1234)"
                  className="w-full text-center tracking-widest text-lg font-mono py-3 px-4 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-red-600"
                  autoFocus
                />
                {pinError && (
                  <p className="text-xs text-red-500 mt-2 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {pinError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg neon-glow-red"
              >
                Entrar no Painel
              </button>
            </form>
          </div>
        ) : (
          /* Logged In Dashboard */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Tabs Bar */}
            <div className="flex items-center gap-2 px-6 pt-4 border-b border-zinc-800 bg-zinc-900/40 text-xs overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'dashboard'
                    ? 'border-red-600 text-red-500 font-bold'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard & Estatísticas
              </button>

              <button
                onClick={() => setActiveTab('movies')}
                className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'movies'
                    ? 'border-red-600 text-red-500 font-bold'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Film className="w-4 h-4" />
                Filmes ({movies.length})
              </button>

              <button
                onClick={() => setActiveTab('series')}
                className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'series'
                    ? 'border-red-600 text-red-500 font-bold'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Tv className="w-4 h-4" />
                Séries ({series.length})
              </button>

              <button
                onClick={() => setActiveTab('channels')}
                className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'channels'
                    ? 'border-red-600 text-red-500 font-bold'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Radio className="w-4 h-4" />
                Canais de TV ({channels.length})
              </button>

              <button
                onClick={() => setActiveTab('servers')}
                className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'servers'
                    ? 'border-red-600 text-red-500 font-bold'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Server className="w-4 h-4" />
                Servidores ({servers.length})
              </button>

              <div className="ml-auto pb-2">
                <button
                  onClick={handleResetCatalog}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
                  title="Restaurar banco original"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Restaurar Padrão
                </button>
              </div>
            </div>

            {/* Tab Viewport */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Feedback Alert for Auto-populate */}
              {autoPopulateSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span className="font-semibold">{autoPopulateSuccessMsg}</span>
                  </div>
                  <button onClick={() => setAutoPopulateSuccessMsg(null)} className="text-zinc-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* TAB 1: DASHBOARD */}
              {activeTab === 'dashboard' && stats && (
                <div className="space-y-6">
                  {/* Auto-Populate New Releases Engine Card */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950/70 via-zinc-900 to-zinc-900 border border-red-500/30 p-5 shadow-2xl">
                    <div className="absolute top-0 right-0 w-80 h-full bg-red-600/5 blur-3xl pointer-events-none" />
                    
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-sm">
                            <Flame className="w-3 h-3" />
                            Auto-Importador 2026
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono text-[10px]">
                            IA + Catálogo Curado
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-white tracking-tight">
                          Adicionar Filmes, Séries e Canais Automaticamente
                        </h4>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          Popule o NetTV instantaneamente com lançamentos cinematográficos de 2025/2026, novas temporadas de séries com episódios completos e canais de transmissão autorizados.
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                        <button
                          onClick={() => handleAutoPopulate('all', false)}
                          disabled={isAutoPopulating}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold transition-all shadow-lg neon-glow-red disabled:opacity-50"
                        >
                          {isAutoPopulating ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Adicionando Lançamentos...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4 fill-current" />
                              <span>Auto-Adicionar Tudo (Lançamentos)</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleAutoPopulate('all', true)}
                          disabled={isAutoPopulating}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all shadow-lg disabled:opacity-50"
                          title="Gera títulos inéditos de filmes e séries usando o Gemini 3.8 Flash"
                        >
                          <Sparkles className="w-4 h-4 text-purple-400" />
                          <span>Gerar Novos com IA</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Granular Buttons */}
                    <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-[11px] text-zinc-400 font-medium">Auto-Adicionar por categoria:</span>
                      <button
                        onClick={() => handleAutoPopulate('movies', false)}
                        disabled={isAutoPopulating}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-750 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors flex items-center gap-1.5"
                      >
                        <Film className="w-3 h-3 text-red-400" />
                        <span>+3 Filmes Recém-Lançados</span>
                      </button>
                      <button
                        onClick={() => handleAutoPopulate('series', false)}
                        disabled={isAutoPopulating}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-750 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors flex items-center gap-1.5"
                      >
                        <Tv className="w-3 h-3 text-red-400" />
                        <span>+2 Séries com Episódios</span>
                      </button>
                      <button
                        onClick={() => handleAutoPopulate('channels', false)}
                        disabled={isAutoPopulating}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-750 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors flex items-center gap-1.5"
                      >
                        <Radio className="w-3 h-3 text-red-400" />
                        <span>+Novos Canais ao Vivo</span>
                      </button>
                    </div>
                  </div>

                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                    <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                      <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                        <Film className="w-3.5 h-3.5 text-red-500" />
                        Total Filmes
                      </div>
                      <div className="text-2xl font-black text-white font-mono">{stats.totalMovies}</div>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                      <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                        <Tv className="w-3.5 h-3.5 text-red-500" />
                        Total Séries
                      </div>
                      <div className="text-2xl font-black text-white font-mono">{stats.totalSeries}</div>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                      <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                        <PlaySquare className="w-3.5 h-3.5 text-red-500" />
                        Episódios
                      </div>
                      <div className="text-2xl font-black text-white font-mono">{stats.totalEpisodes}</div>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                      <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                        <Radio className="w-3.5 h-3.5 text-red-500" />
                        Canais ao Vivo
                      </div>
                      <div className="text-2xl font-black text-white font-mono">{stats.totalChannels}</div>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                      <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                        <Server className="w-3.5 h-3.5 text-purple-400" />
                        Servidores
                      </div>
                      <div className="text-2xl font-black text-white font-mono">{(stats.totalServers ?? servers.length)}</div>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                      <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                        <Users className="w-3.5 h-3.5 text-blue-400" />
                        Usuários
                      </div>
                      <div className="text-2xl font-black text-white font-mono">{stats.activeUsers}</div>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                      <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        Plays Totais
                      </div>
                      <div className="text-2xl font-black text-white font-mono">{stats.totalPlays.toLocaleString('pt-BR')}</div>
                    </div>
                  </div>

                  {/* Top Watched */}
                  <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-red-500" />
                      Conteúdos Mais Assistidos na Plataforma
                    </h4>
                    <div className="divide-y divide-zinc-800/80">
                      {stats.topWatched.map((item, idx) => (
                        <div key={`${item.id}-${idx}`} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-zinc-500 font-bold w-4">#{idx + 1}</span>
                            <span className="font-bold text-white">{item.title}</span>
                            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400">{item.type}</span>
                          </div>
                          <span className="font-mono font-semibold text-red-400">
                            {item.plays.toLocaleString('pt-BR')} reproduções
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MOVIES */}
              {activeTab === 'movies' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">Catálogo de Filmes Cadastrados</h4>
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setMovieForm({
                          title: '',
                          originalTitle: '',
                          synopsis: '',
                          year: 2026,
                          genre: 'Ação, Ficção científica',
                          ageRating: '16',
                          duration: '1h 55m',
                          durationMinutes: 115,
                          rating: 8.8,
                          posterUrl: '/src/assets/images/movie_poster_action_1794036937639.jpg',
                          backdropUrl: '/src/assets/images/hero_scifi_cyberpunk_1794036935679.jpg',
                          videoUrl: '/videos/action_stream.mp4',
                          director: '',
                          cast: ''
                        });
                        setShowAddMovieModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Filme Manual
                    </button>

                    <button
                      onClick={() => handleAutoPopulate('movies', false)}
                      disabled={isAutoPopulating}
                      className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                      title="Auto-adicionar filmes recém-lançados 2026"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Auto-Adicionar 2026</span>
                    </button>

                    <button
                      onClick={() => handleAutoPopulate('movies', true)}
                      disabled={isAutoPopulating}
                      className="flex items-center gap-1.5 px-3 py-2 bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-500/30 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                      title="Gerar novos filmes via IA Gemini"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Gerar com IA</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {movies.map((movie, idx) => (
                      <div
                        key={`${movie.id}-${idx}`}
                        className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800/80 gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            className="w-10 h-14 object-cover rounded bg-black shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <h5 className="font-bold text-white truncate text-sm">{movie.title}</h5>
                            <div className="text-zinc-400">
                              {movie.year} · {movie.ageRating} · {movie.duration} · {movie.genre.join(', ')}
                            </div>
                            <div className="text-zinc-500 font-mono text-[11px] truncate">
                              URL: {movie.videoUrl}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setEditingItem(movie);
                              setMovieForm({
                                title: movie.title,
                                originalTitle: movie.originalTitle || '',
                                synopsis: movie.synopsis,
                                year: movie.year,
                                genre: movie.genre.join(', '),
                                ageRating: movie.ageRating,
                                duration: movie.duration,
                                durationMinutes: movie.durationMinutes,
                                rating: movie.rating,
                                posterUrl: movie.posterUrl,
                                backdropUrl: movie.backdropUrl,
                                videoUrl: movie.videoUrl,
                                director: movie.director,
                                cast: (movie.cast || []).join(', ')
                              });
                              setShowAddMovieModal(true);
                            }}
                            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                            title="Editar filme"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMovie(movie.id)}
                            className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400"
                            title="Excluir filme"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: SERIES */}
              {activeTab === 'series' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">Catálogo de Séries</h4>
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setSeriesForm({
                          title: '',
                          synopsis: '',
                          year: 2026,
                          genre: 'Drama, Ficção científica',
                          ageRating: '16',
                          rating: 9.0,
                          posterUrl: '/src/assets/images/series_banner_fantasy_1794036936974.jpg',
                          backdropUrl: '/src/assets/images/series_banner_fantasy_1794036936974.jpg',
                          creator: '',
                          cast: '',
                          episodesCount: 4,
                          sampleEpisodeVideo: '/videos/fantasy_stream.mp4'
                        });
                        setShowAddSeriesModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Série Manual
                    </button>

                    <button
                      onClick={() => handleAutoPopulate('series', false)}
                      disabled={isAutoPopulating}
                      className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                      title="Auto-adicionar séries com temporadas e episódios"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Auto-Adicionar Séries 2026</span>
                    </button>

                    <button
                      onClick={() => handleAutoPopulate('series', true)}
                      disabled={isAutoPopulating}
                      className="flex items-center gap-1.5 px-3 py-2 bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-500/30 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                      title="Gerar novas séries com IA Gemini"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Gerar com IA</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {series.map((s, idx) => (
                      <div
                        key={`${s.id}-${idx}`}
                        className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800/80 gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={s.posterUrl}
                            alt={s.title}
                            className="w-10 h-14 object-cover rounded bg-black shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <h5 className="font-bold text-white truncate text-sm">{s.title}</h5>
                            <div className="text-zinc-400">
                              {s.year} · {s.ageRating} · {s.seasonsCount} Temporadas ({s.totalEpisodes} episódios) · {s.genre.join(', ')}
                            </div>
                            <div className="text-zinc-500 text-[11px]">
                              Criador: {s.creator}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleDeleteSeries(s.id)}
                            className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400"
                            title="Excluir série"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: CHANNELS */}
              {activeTab === 'channels' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">Central de Canais Autorizados</h4>
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setChannelForm({
                          channelNumber: 110 + channels.length,
                          name: '',
                          category: 'Entretenimento',
                          logoUrl: '',
                          bannerUrl: '',
                          streamUrl: '/videos/sports_stream.mp4',
                          resolution: '1080p',
                          programTitle: 'Transmissão Oficial NetTV',
                          programStart: '20:00',
                          programEnd: '22:00'
                        });
                        setShowAddChannelModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Cadastrar Canal Manual
                    </button>

                    <button
                      onClick={() => handleAutoPopulate('channels', false)}
                      disabled={isAutoPopulating}
                      className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                      title="Auto-adicionar canais de TV autorizados"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Auto-Adicionar Canais ao Vivo</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {channels.map((channel, idx) => (
                      <div
                        key={`${channel.id}-${idx}`}
                        className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800/80 gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={channel.logoUrl}
                            alt={channel.name}
                            className="w-10 h-10 object-cover rounded bg-black shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-zinc-500 font-bold">#{channel.channelNumber}</span>
                              <h5 className="font-bold text-white truncate text-sm">{channel.name}</h5>
                              <span className="px-1.5 py-0.2 rounded bg-red-600 text-[10px] text-white font-bold">AO VIVO</span>
                            </div>
                            <div className="text-zinc-400">
                              {channel.category} · {channel.resolution} · Programa atual: {channel.currentProgram.title}
                            </div>
                            <div className="text-zinc-500 font-mono text-[11px] truncate">
                              URL: {channel.streamUrl}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleDeleteChannel(channel.id)}
                            className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400"
                            title="Excluir canal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: SERVIDORES */}
              {activeTab === 'servers' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Server className="w-4 h-4 text-red-500" />
                        Infraestrutura de Servidores e CDNs NetTV
                      </h4>
                      <p className="text-xs text-zinc-400">
                        Gerencie pontos de presença, nós de baixa latência e rotas de streaming HLS.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setServerForm({
                          name: '',
                          baseUrl: '',
                          region: 'América do Sul (Brasil)',
                          type: 'cdn',
                          isDefault: false
                        });
                        setShowAddServerModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-red-950/30"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Servidor
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {servers.map((server, idx) => (
                      <div
                        key={`${server.id}-${idx}`}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl bg-zinc-900 border border-zinc-800/80 gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0">
                            <Server className="w-5 h-5 text-red-500" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-bold text-white text-sm">{server.name}</h5>
                              <span className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-[10px] font-semibold text-zinc-300 uppercase">
                                {server.type}
                              </span>
                              {server.isDefault && (
                                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold">
                                  Padrão do Sistema
                                </span>
                              )}
                            </div>
                            <div className="text-zinc-400 flex items-center gap-2 mt-0.5">
                              <Globe className="w-3.5 h-3.5 text-zinc-500" />
                              <span>{server.region}</span>
                              <span className="text-zinc-600">•</span>
                              <span className="font-mono text-zinc-500 truncate max-w-xs">{server.baseUrl}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-800">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="font-mono text-xs font-bold text-emerald-400">{server.pingMs}ms</span>
                          </div>

                          {!server.isDefault && (
                            <button
                              onClick={() => handleSetDefaultServer(server.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs transition-colors"
                              title="Tornar servidor padrão"
                            >
                              Tornar Padrão
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setEditingItem(server);
                              setServerForm({
                                name: server.name,
                                baseUrl: server.baseUrl,
                                region: server.region,
                                type: server.type,
                                isDefault: !!server.isDefault
                              });
                              setShowAddServerModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                            title="Editar servidor"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {server.id !== 'srv-1' && (
                            <button
                              onClick={() => handleDeleteServer(server.id, server.name)}
                              className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400"
                              title="Excluir servidor"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add/Edit Movie Modal */}
        {showAddMovieModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 w-full max-w-lg space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-base">
                  {editingItem ? 'Editar Filme' : 'Adicionar Novo Filme'}
                </h4>
                <button onClick={() => setShowAddMovieModal(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveMovie} className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-400 block mb-1">Título do Filme</label>
                  <input
                    type="text"
                    required
                    value={movieForm.title}
                    onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Sinopse</label>
                  <textarea
                    rows={3}
                    required
                    value={movieForm.synopsis}
                    onChange={(e) => setMovieForm({ ...movieForm, synopsis: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-zinc-400 block mb-1">Ano</label>
                    <input
                      type="number"
                      value={movieForm.year}
                      onChange={(e) => setMovieForm({ ...movieForm, year: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Duração</label>
                    <input
                      type="text"
                      value={movieForm.duration}
                      onChange={(e) => setMovieForm({ ...movieForm, duration: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Classificação</label>
                    <select
                      value={movieForm.ageRating}
                      onChange={(e) => setMovieForm({ ...movieForm, ageRating: e.target.value as AgeRating })}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                    >
                      {['L', '10', '12', '14', '16', '18'].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Gêneros (separados por vírgula)</label>
                  <input
                    type="text"
                    value={movieForm.genre}
                    onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">URL do Vídeo / Stream Autorizado</label>
                  <input
                    type="url"
                    required
                    value={movieForm.videoUrl}
                    onChange={(e) => setMovieForm({ ...movieForm, videoUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">URL da Capa (Pôster)</label>
                  <input
                    type="text"
                    value={movieForm.posterUrl}
                    onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                    placeholder="https://... ou caminho de imagem"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
                  >
                    Salvar Filme
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddMovieModal(false)}
                    className="py-2.5 px-4 bg-zinc-800 text-zinc-300 rounded-xl"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Series Modal */}
        {showAddSeriesModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 w-full max-w-lg space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-base">Adicionar Nova Série</h4>
                <button onClick={() => setShowAddSeriesModal(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveSeries} className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-400 block mb-1">Título da Série</label>
                  <input
                    type="text"
                    required
                    value={seriesForm.title}
                    onChange={(e) => setSeriesForm({ ...seriesForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Sinopse</label>
                  <textarea
                    rows={3}
                    required
                    value={seriesForm.synopsis}
                    onChange={(e) => setSeriesForm({ ...seriesForm, synopsis: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-zinc-400 block mb-1">Criador / Produtora</label>
                    <input
                      type="text"
                      value={seriesForm.creator}
                      onChange={(e) => setSeriesForm({ ...seriesForm, creator: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Classificação</label>
                    <select
                      value={seriesForm.ageRating}
                      onChange={(e) => setSeriesForm({ ...seriesForm, ageRating: e.target.value as AgeRating })}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                    >
                      {['L', '10', '12', '14', '16', '18'].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Gêneros</label>
                  <input
                    type="text"
                    value={seriesForm.genre}
                    onChange={(e) => setSeriesForm({ ...seriesForm, genre: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Episódios Iniciais da Temporada 1</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={seriesForm.episodesCount}
                    onChange={(e) => setSeriesForm({ ...seriesForm, episodesCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">URL de Stream dos Episódios</label>
                  <input
                    type="url"
                    required
                    value={seriesForm.sampleEpisodeVideo}
                    onChange={(e) => setSeriesForm({ ...seriesForm, sampleEpisodeVideo: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-mono"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
                  >
                    Salvar Série
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddSeriesModal(false)}
                    className="py-2.5 px-4 bg-zinc-800 text-zinc-300 rounded-xl"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Channel Modal */}
        {showAddChannelModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 w-full max-w-lg space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-base">Cadastrar Novo Canal de TV</h4>
                <button onClick={() => setShowAddChannelModal(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveChannel} className="space-y-3 text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-zinc-400 block mb-1">Número</label>
                    <input
                      type="number"
                      required
                      value={channelForm.channelNumber}
                      onChange={(e) => setChannelForm({ ...channelForm, channelNumber: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-zinc-400 block mb-1">Nome do Canal</label>
                    <input
                      type="text"
                      required
                      value={channelForm.name}
                      onChange={(e) => setChannelForm({ ...channelForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-zinc-400 block mb-1">Categoria</label>
                    <select
                      value={channelForm.category}
                      onChange={(e) => setChannelForm({ ...channelForm, category: e.target.value as ChannelCategory })}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                    >
                      {['Abertos', 'Notícias', 'Esportes', 'Filmes', 'Entretenimento', 'Infantil', 'Documentários', 'Música'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Resolução</label>
                    <select
                      value={channelForm.resolution}
                      onChange={(e) => setChannelForm({ ...channelForm, resolution: e.target.value as any })}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                    >
                      <option value="1080p">1080p Full HD</option>
                      <option value="720p">720p HD</option>
                      <option value="4K">4K Ultra HD</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">URL de Transmissão (Stream Autorizado)</label>
                  <input
                    type="url"
                    required
                    value={channelForm.streamUrl}
                    onChange={(e) => setChannelForm({ ...channelForm, streamUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Programa Atual (EPG)</label>
                  <input
                    type="text"
                    value={channelForm.programTitle}
                    onChange={(e) => setChannelForm({ ...channelForm, programTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
                  >
                    Cadastrar Canal
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddChannelModal(false)}
                    className="py-2.5 px-4 bg-zinc-800 text-zinc-300 rounded-xl"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add/Edit Server Modal */}
        {showAddServerModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 w-full max-w-lg space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <Server className="w-5 h-5 text-red-500" />
                  {editingItem ? 'Editar Servidor de Streaming' : 'Adicionar Novo Servidor'}
                </h4>
                <button
                  onClick={() => setShowAddServerModal(false)}
                  className="p-1 rounded bg-zinc-900 text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveServer} className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-400 block mb-1">Nome do Servidor *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: CDN São Paulo - Node 03"
                    value={serverForm.name}
                    onChange={(e) => setServerForm({ ...serverForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">URL Base ou Endpoint Streaming *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: https://sp3.cdn.nettv.internal ou http://10.0.0.5:8080"
                    value={serverForm.baseUrl}
                    onChange={(e) => setServerForm({ ...serverForm, baseUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-400 block mb-1">Região Geográfica</label>
                    <select
                      value={serverForm.region}
                      onChange={(e) => setServerForm({ ...serverForm, region: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                    >
                      <option value="América do Sul (Brasil)">América do Sul (Brasil)</option>
                      <option value="América do Sul (Sul)">América do Sul (Sul)</option>
                      <option value="América do Norte (EUA)">América do Norte (EUA)</option>
                      <option value="Europa Central">Europa Central</option>
                      <option value="Rede Local / P2P">Rede Local / P2P</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Tipo de Arquitetura</label>
                    <select
                      value={serverForm.type}
                      onChange={(e) => setServerForm({ ...serverForm, type: e.target.value as any })}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                    >
                      <option value="cdn">CDN Edge</option>
                      <option value="backup">Cloud Backup</option>
                      <option value="hls">HLS / IPTV</option>
                      <option value="custom">Personalizado</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={serverForm.isDefault}
                      onChange={(e) => setServerForm({ ...serverForm, isDefault: e.target.checked })}
                      className="rounded bg-zinc-900 border-zinc-700 text-red-600 focus:ring-0"
                    />
                    <span>Definir como servidor padrão do sistema</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
                  >
                    {editingItem ? 'Salvar Alterações' : 'Cadastrar Servidor'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddServerModal(false)}
                    className="py-2.5 px-4 bg-zinc-800 text-zinc-300 rounded-xl"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
