import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, 
  Maximize, Minimize, Settings, MessageSquare, SkipForward, 
  X, Radio, Tv, Check, ChevronRight, AlertCircle, RefreshCw, Server
} from 'lucide-react';
import { Movie, Episode, LiveChannel, StreamingServer } from '../types';

interface NetPlayerProps {
  movie?: Movie;
  episode?: Episode;
  seriesTitle?: string;
  nextEpisode?: Episode;
  channel?: LiveChannel;
  allChannels?: LiveChannel[];
  servers?: StreamingServer[];
  activeServer?: StreamingServer | null;
  onSelectServer?: (server: StreamingServer) => void;
  onSelectChannel?: (channel: LiveChannel) => void;
  onPlayNextEpisode?: () => void;
  onClose: () => void;
  onProgressUpdate?: (seconds: number, duration: number) => void;
  initialTime?: number;
}

export const NetPlayer: React.FC<NetPlayerProps> = ({
  movie,
  episode,
  seriesTitle,
  nextEpisode,
  channel,
  allChannels,
  servers,
  activeServer,
  onSelectServer,
  onSelectChannel,
  onPlayNextEpisode,
  onClose,
  onProgressUpdate,
  initialTime = 0
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showSubtitlesMenu, setShowSubtitlesMenu] = useState(false);
  const [showServerMenu, setShowServerMenu] = useState(false);
  const [showChannelDrawer, setShowChannelDrawer] = useState(false);
  const [quality, setQuality] = useState('1080p');
  const [subtitleTrack, setSubtitleTrack] = useState<'off' | 'pt-br' | 'en'>('pt-br');
  const [audioTrack, setAudioTrack] = useState<'pt-br' | 'original'>('pt-br');
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [nextCountdown, setNextCountdown] = useState<number | null>(null);

  const isLive = !!channel;
  const title = movie?.title || (episode ? `${seriesTitle || 'Série'} - ${episode.title}` : channel?.name || 'Reprodução');
  
  const rawStreamUrl = movie?.videoUrl || episode?.videoUrl || channel?.streamUrl || '';
  const initialStream = rawStreamUrl && rawStreamUrl.trim() !== '' ? rawStreamUrl : '/videos/scifi_stream.mp4';
  const [activeStreamUrl, setActiveStreamUrl] = useState<string>(initialStream);

  useEffect(() => {
    const nextUrl = movie?.videoUrl || episode?.videoUrl || channel?.streamUrl;
    if (nextUrl && nextUrl.trim() !== '') {
      setActiveStreamUrl(nextUrl);
    } else {
      setActiveStreamUrl('/videos/scifi_stream.mp4');
    }
    setHasError(false);
  }, [movie, episode, channel]);

  // Auto-hide controls
  const triggerActivity = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSettings(false);
        setShowSubtitlesMenu(false);
        setShowServerMenu(false);
      }
    }, 3500);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      triggerActivity();
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        skip(-10);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        skip(10);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setVolume(prev => Math.min(1, prev + 0.1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setVolume(prev => Math.max(0, prev - 0.1));
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isFullscreen]);

  // Initial playback setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (initialTime > 0) {
      video.currentTime = initialTime;
    }

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setHasError(false);
        })
        .catch(() => {
          // Browser requires user interaction or muted autoplay
          setIsPlaying(false);
        });
    }

    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [activeStreamUrl]);

  // Next episode countdown handler
  useEffect(() => {
    if (!nextEpisode || isLive) return;
    
    // When 15 seconds remaining before end of episode
    if (duration > 0 && duration - currentTime <= 15 && currentTime > 10) {
      if (nextCountdown === null) {
        setNextCountdown(10);
      }
    } else {
      if (nextCountdown !== null && duration - currentTime > 15) {
        setNextCountdown(null);
      }
    }
  }, [currentTime, duration, nextEpisode, isLive]);

  useEffect(() => {
    if (nextCountdown === null) return;
    if (nextCountdown <= 0) {
      if (onPlayNextEpisode) onPlayNextEpisode();
      setNextCountdown(null);
      return;
    }
    const timer = setTimeout(() => {
      setNextCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [nextCountdown]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
    triggerActivity();
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video || isLive) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
    triggerActivity();
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    if (onProgressUpdate && video.duration) {
      onProgressUpdate(video.currentTime, video.duration);
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video || isLive) return;
    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
    triggerActivity();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
    triggerActivity();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
    setIsMuted(val === 0);
    triggerActivity();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
    triggerActivity();
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={triggerActivity}
      onTouchStart={triggerActivity}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden"
    >
      {/* Video Element with resilient source fallbacks */}
      <video
        ref={videoRef}
        key={activeStreamUrl}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false);
          setHasError(false);
        }}
        onError={() => {
          // If the stream failed to decode, fallback immediately to reliable local stream
          if (!activeStreamUrl.includes('/videos/test.mp4')) {
            setActiveStreamUrl('/videos/test.mp4');
          } else {
            setHasError(true);
            setIsBuffering(false);
          }
        }}
        playsInline
        preload="auto"
      >
        <source src={activeStreamUrl} type="video/mp4" />
        <source src="/videos/test.mp4" type="video/mp4" />
      </video>

      {/* Stream Error & Fallback UI */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 p-6 text-center z-30 space-y-3">
          <AlertCircle className="w-12 h-12 text-red-500 animate-bounce" />
          <h3 className="text-lg font-bold text-white">Transmissão em Manutenção</h3>
          <p className="text-xs text-zinc-400 max-w-sm">
            O fluxo de vídeo solicitado está temporariamente indisponível. Alterne para o servidor secundário do NetTV.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setActiveStreamUrl('/videos/test.mp4');
                setHasError(false);
                setIsBuffering(false);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Conectar Servidor Reserva
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition-colors"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      )}

      {/* Buffering Spinner */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/30 backdrop-blur-xs">
          <div className="w-16 h-16 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Simulated Subtitles overlay */}
      {subtitleTrack !== 'off' && !isLive && isPlaying && currentTime > 3 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/80 rounded-md text-white text-sm md:text-lg font-medium text-center max-w-xl pointer-events-none shadow-lg">
          {subtitleTrack === 'pt-br' 
            ? '— [NetTV Áudio Original em Português]' 
            : '— [NetTV Original Audio in English]'}
        </div>
      )}

      {/* Next Episode Auto-advance Overlay */}
      {nextCountdown !== null && nextEpisode && (
        <div className="absolute bottom-28 right-8 z-40 bg-zinc-950/95 border border-red-600/50 p-4 rounded-xl shadow-2xl max-w-sm neon-glow-red animate-in fade-in slide-in-from-bottom duration-300">
          <div className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">
            Próximo Episódio em {nextCountdown}s
          </div>
          <div className="text-white font-bold text-sm mb-1">{nextEpisode.title}</div>
          <div className="text-xs text-zinc-400 mb-3 line-clamp-1">{nextEpisode.synopsis}</div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (onPlayNextEpisode) onPlayNextEpisode();
                setNextCountdown(null);
              }}
              className="flex-1 py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Assistir Agora
            </button>
            <button
              onClick={() => setNextCountdown(null)}
              className="py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Overlay Controls */}
      <div 
        className={`absolute inset-0 flex flex-col justify-between p-4 md:p-8 bg-gradient-to-t from-black/90 via-transparent to-black/80 transition-opacity duration-300 ${
          showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white transition-colors border border-white/10"
              title="Fechar player (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                {isLive && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-600 text-white text-[11px] font-bold rounded-sm tracking-wide uppercase">
                    <Radio className="w-3 h-3 animate-pulse" />
                    AO VIVO
                  </span>
                )}
                <h2 className="text-base md:text-xl font-bold text-white tracking-tight drop-shadow">
                  {title}
                </h2>
              </div>
              {channel?.currentProgram && (
                <div className="text-xs text-zinc-300 mt-0.5">
                  Agora: <span className="text-zinc-100 font-medium">{channel.currentProgram.title}</span> ({channel.currentProgram.start} - {channel.currentProgram.end})
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live TV Channels Switcher button */}
            {isLive && allChannels && (
              <button
                onClick={() => setShowChannelDrawer(!showChannelDrawer)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-white border border-white/10 text-xs font-medium transition-colors"
              >
                <Tv className="w-4 h-4 text-red-500" />
                <span className="hidden sm:inline">Guia de Canais</span>
              </button>
            )}

            {/* Subtitles & Audio button */}
            {!isLive && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSubtitlesMenu(!showSubtitlesMenu);
                    setShowSettings(false);
                  }}
                  className={`p-2 rounded-full transition-colors border border-white/10 ${
                    showSubtitlesMenu ? 'bg-red-600 text-white' : 'bg-zinc-900/80 hover:bg-zinc-800 text-white'
                  }`}
                  title="Áudio e Legendas"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>

                {showSubtitlesMenu && (
                  <div className="absolute right-0 top-12 w-64 bg-zinc-950/95 border border-zinc-800 rounded-xl p-3 shadow-2xl z-50 text-xs">
                    <div className="font-semibold text-zinc-400 uppercase tracking-wider mb-2">Áudio</div>
                    <div className="space-y-1 mb-3">
                      <button
                        onClick={() => setAudioTrack('pt-br')}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md ${
                          audioTrack === 'pt-br' ? 'bg-red-600/20 text-red-400 font-semibold' : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        Português (Brasil) [Original]
                        {audioTrack === 'pt-br' && <Check className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => setAudioTrack('original')}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md ${
                          audioTrack === 'original' ? 'bg-red-600/20 text-red-400 font-semibold' : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        Inglês (Dolby 5.1)
                        {audioTrack === 'original' && <Check className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="font-semibold text-zinc-400 uppercase tracking-wider mb-2 border-t border-zinc-800 pt-2">Legendas</div>
                    <div className="space-y-1">
                      <button
                        onClick={() => setSubtitleTrack('off')}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md ${
                          subtitleTrack === 'off' ? 'bg-red-600/20 text-red-400 font-semibold' : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        Desativadas
                        {subtitleTrack === 'off' && <Check className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => setSubtitleTrack('pt-br')}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md ${
                          subtitleTrack === 'pt-br' ? 'bg-red-600/20 text-red-400 font-semibold' : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        Português [CC]
                        {subtitleTrack === 'pt-br' && <Check className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => setSubtitleTrack('en')}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md ${
                          subtitleTrack === 'en' ? 'bg-red-600/20 text-red-400 font-semibold' : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        English
                        {subtitleTrack === 'en' && <Check className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quality Settings */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSettings(!showSettings);
                  setShowSubtitlesMenu(false);
                }}
                className={`p-2 rounded-full transition-colors border border-white/10 ${
                  showSettings ? 'bg-red-600 text-white' : 'bg-zinc-900/80 hover:bg-zinc-800 text-white'
                }`}
                title="Qualidade e Transmissão"
              >
                <Settings className="w-5 h-5" />
              </button>

              {showSettings && (
                <div className="absolute right-0 top-12 w-48 bg-zinc-950/95 border border-zinc-800 rounded-xl p-3 shadow-2xl z-50 text-xs">
                  <div className="font-semibold text-zinc-400 uppercase tracking-wider mb-2">Qualidade</div>
                  <div className="space-y-1">
                    {['4K Ultra HD', '1080p FHD', '720p HD', 'Automático (Adaptativo)'].map(q => (
                      <button
                        key={q}
                        onClick={() => {
                          setQuality(q);
                          setShowSettings(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md ${
                          quality === q ? 'bg-red-600/20 text-red-400 font-semibold' : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        {q}
                        {quality === q && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Server Selector inside Player */}
            {servers && servers.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowServerMenu(!showServerMenu);
                    setShowSettings(false);
                    setShowSubtitlesMenu(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors border border-white/10 ${
                    showServerMenu ? 'bg-red-600 text-white' : 'bg-zinc-900/80 hover:bg-zinc-800 text-white'
                  }`}
                  title="Alterar Servidor de Transmissão"
                >
                  <Server className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold hidden sm:inline text-emerald-400">
                    {activeServer?.pingMs || 14}ms
                  </span>
                </button>

                {showServerMenu && (
                  <div className="absolute right-0 top-12 w-64 bg-zinc-950/95 border border-zinc-800 rounded-xl p-3 shadow-2xl z-50 text-xs">
                    <div className="font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Servidores NetTV</span>
                      <span className="text-[10px] text-emerald-400 font-mono">CDN Edge</span>
                    </div>
                    <div className="space-y-1 max-h-56 overflow-y-auto">
                      {servers.map((s, idx) => {
                        const isCurrent = activeServer?.id === s.id;
                        return (
                          <button
                            key={`${s.id}-${idx}`}
                            onClick={() => {
                              onSelectServer?.(s);
                              setShowServerMenu(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                              isCurrent ? 'bg-red-600/20 border border-red-500/40 text-white font-medium' : 'hover:bg-zinc-800 text-zinc-300'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="truncate font-semibold text-xs">{s.name}</div>
                              <div className="text-[10px] text-zinc-400">{s.region}</div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="font-mono text-[11px] text-emerald-400 font-bold">{s.pingMs}ms</span>
                              {isCurrent && <Check className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center Big Play Button (Visible on Pause) */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="self-center p-6 rounded-full bg-red-600/90 hover:bg-red-600 text-white transition-all transform hover:scale-110 neon-glow-red shadow-2xl"
          >
            <Play className="w-12 h-12 fill-current translate-x-1" />
          </button>
        )}

        {/* Bottom Controls */}
        <div className="space-y-3">
          {/* Progress Scrubber (for movies/series) */}
          {!isLive && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-zinc-300">{formatTime(currentTime)}</span>
              <div className="relative flex-1 group py-2">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-zinc-700/80 rounded-lg appearance-none cursor-pointer accent-red-600 focus:outline-none transition-all"
                />
              </div>
              <span className="text-xs font-mono text-zinc-300">{formatTime(duration)}</span>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={togglePlay}
                className="p-2 sm:p-2.5 rounded-full bg-white text-black hover:bg-zinc-200 transition-colors"
                title={isPlaying ? 'Pausar (Espaço)' : 'Reproduzir (Espaço)'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-0.5" />}
              </button>

              {!isLive && (
                <>
                  <button
                    onClick={() => skip(-10)}
                    className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                    title="Voltar 10 segundos (Seta Esquerda)"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => skip(10)}
                    className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                    title="Avançar 10 segundos (Seta Direita)"
                  >
                    <RotateCw className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Volume Slider */}
              <div className="flex items-center gap-2 group">
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                  title="Mudo (M)"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 sm:w-24 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-600 hidden group-hover:block transition-all"
                />
              </div>

              {/* Next Episode button for Series */}
              {nextEpisode && onPlayNextEpisode && (
                <button
                  onClick={onPlayNextEpisode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors"
                  title="Próximo Episódio"
                >
                  <SkipForward className="w-4 h-4" />
                  <span className="hidden sm:inline">Próximo</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs px-2 py-0.5 bg-zinc-800/80 text-zinc-300 rounded font-mono border border-white/5">
                {quality}
              </span>
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                title="Tela Cheia (F)"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live TV Channels Drawer inside player */}
      {showChannelDrawer && allChannels && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-zinc-950/95 border-l border-zinc-800 p-4 overflow-y-auto z-50 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Tv className="w-4 h-4 text-red-600" />
              Canais Disponíveis
            </h3>
            <button
              onClick={() => setShowChannelDrawer(false)}
              className="p-1 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {allChannels.map((ch, idx) => {
              const active = channel?.id === ch.id;
              return (
                <button
                  key={`${ch.id}-${idx}`}
                  onClick={() => {
                    if (onSelectChannel) onSelectChannel(ch);
                    setShowChannelDrawer(false);
                  }}
                  className={`w-full p-2.5 rounded-xl flex items-center gap-3 text-left transition-all ${
                    active 
                      ? 'bg-red-600/20 border border-red-600/50 text-white' 
                      : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-black/60 overflow-hidden flex items-center justify-center shrink-0 border border-white/5">
                    <img 
                      src={ch.logoUrl} 
                      alt={ch.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate text-white">{ch.name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">#{ch.channelNumber}</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate">
                      {ch.currentProgram.title}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
