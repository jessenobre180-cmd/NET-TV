export type ContentType = 'movie' | 'series' | 'channel';

export type AgeRating = 'L' | '10' | '12' | '14' | '16' | '18';

export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  synopsis: string;
  year: number;
  genre: string[];
  ageRating: AgeRating;
  duration: string; // e.g. "1h 58m"
  durationMinutes: number;
  rating: number; // e.g. 8.6
  posterUrl: string;
  backdropUrl: string;
  videoUrl: string;
  trailerUrl?: string;
  featured?: boolean;
  cast: string[];
  director: string;
  views: number;
  addedAt: string;
}

export interface Episode {
  id: string;
  seriesId: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  synopsis: string;
  duration: string;
  durationMinutes: number;
  videoUrl: string;
  thumbnailUrl: string;
}

export interface Season {
  seasonNumber: number;
  title: string;
  episodes: Episode[];
}

export interface Series {
  id: string;
  title: string;
  synopsis: string;
  year: number;
  genre: string[];
  ageRating: AgeRating;
  seasonsCount: number;
  totalEpisodes: number;
  rating: number;
  posterUrl: string;
  backdropUrl: string;
  featured?: boolean;
  cast: string[];
  creator: string;
  views: number;
  addedAt: string;
  seasons: Season[];
}

export type ChannelCategory = 
  | 'Abertos' 
  | 'Notícias' 
  | 'Esportes' 
  | 'Filmes' 
  | 'Entretenimento' 
  | 'Infantil' 
  | 'Documentários' 
  | 'Música';

export interface LiveChannel {
  id: string;
  channelNumber: number;
  name: string;
  category: ChannelCategory;
  logoUrl: string;
  bannerUrl: string;
  streamUrl: string;
  backupStreamUrl?: string;
  isOnline: boolean;
  resolution: '1080p' | '720p' | '4K';
  currentProgram: {
    title: string;
    start: string;
    end: string;
    synopsis?: string;
    progressPercentage: number;
  };
  nextProgram: {
    title: string;
    start: string;
    end: string;
  };
  views: number;
}

export interface WatchProgress {
  contentId: string;
  contentType: 'movie' | 'episode' | 'channel';
  seriesId?: string;
  episodeId?: string;
  title: string;
  thumbnailUrl: string;
  progressSeconds: number;
  durationSeconds: number;
  percentage: number;
  completed?: boolean;
  lastWatchedAt: string;
  seasonNumber?: number;
  episodeNumber?: number;
}

export interface StreamingServer {
  id: string;
  name: string;
  baseUrl: string;
  region: string;
  status: 'online' | 'degraded' | 'offline';
  pingMs: number;
  isDefault?: boolean;
  type: 'cdn' | 'backup' | 'custom' | 'hls';
  addedAt: string;
}

export interface AdminStats {
  totalMovies: number;
  totalSeries: number;
  totalEpisodes: number;
  totalChannels: number;
  totalServers: number;
  totalPlays: number;
  activeUsers: number;
  topWatched: {
    id: string;
    title: string;
    type: 'Filme' | 'Série' | 'Canal';
    plays: number;
  }[];
}
