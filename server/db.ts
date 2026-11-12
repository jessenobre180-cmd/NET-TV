import fs from 'fs';
import path from 'path';
import { Movie, Series, LiveChannel, WatchProgress, AdminStats, StreamingServer } from '../src/types';
import { initialMovies, initialSeries, initialChannels, initialServers } from './defaultData';

interface DatabaseSchema {
  movies: Movie[];
  series: Series[];
  channels: LiveChannel[];
  servers: StreamingServer[];
  favorites: string[]; // content IDs
  watchHistory: WatchProgress[];
  playCounts: Record<string, number>;
  activeUsersCount: number;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

let idCounter = 0;
export function generateUniqueId(prefix: string): string {
  idCounter = (idCounter + 1) % 100000;
  const rand = Math.random().toString(36).substring(2, 7);
  return `${prefix}-${Date.now()}-${idCounter}-${rand}`;
}

class NetTVDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private sanitizeUniqueIds(data: DatabaseSchema): boolean {
    const seenIds = new Set<string>();
    let modified = false;

    const ensureUnique = (id: string, prefix: string): string => {
      if (!id || seenIds.has(id)) {
        modified = true;
        let newId = generateUniqueId(prefix);
        while (seenIds.has(newId)) {
          newId = generateUniqueId(prefix);
        }
        seenIds.add(newId);
        return newId;
      }
      seenIds.add(id);
      return id;
    };

    if (Array.isArray(data.movies)) {
      for (const m of data.movies) {
        m.id = ensureUnique(m.id, 'mov');
      }
    }

    if (Array.isArray(data.series)) {
      for (const s of data.series) {
        const oldId = s.id;
        const newId = ensureUnique(s.id, 'ser');
        s.id = newId;
        if (Array.isArray(s.seasons)) {
          for (const season of s.seasons) {
            if (Array.isArray(season.episodes)) {
              for (const ep of season.episodes) {
                if (!ep.seriesId || ep.seriesId === oldId) {
                  ep.seriesId = newId;
                }
                ep.id = ensureUnique(ep.id, 'ep');
              }
            }
          }
        }
      }
    }

    if (Array.isArray(data.channels)) {
      for (const c of data.channels) {
        c.id = ensureUnique(c.id, 'ch');
      }
    }

    if (Array.isArray(data.servers)) {
      for (const s of data.servers) {
        s.id = ensureUnique(s.id, 'srv');
      }
    }

    return modified;
  }

  private loadData(): DatabaseSchema {
    try {
      ensureDirectoryExistence(DB_FILE);
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed.movies && parsed.series && parsed.channels) {
          if (!parsed.servers || parsed.servers.length === 0) {
            parsed.servers = initialServers;
          }
          const hadDuplicates = this.sanitizeUniqueIds(parsed);
          if (hadDuplicates) {
            this.saveData(parsed);
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading database file, initializing defaults:', e);
    }

    const defaultDb: DatabaseSchema = {
      movies: initialMovies,
      series: initialSeries,
      channels: initialChannels,
      servers: initialServers,
      favorites: ['mov-1', 'ser-1', 'ch-1'],
      watchHistory: [
        {
          contentId: 'mov-1',
          contentType: 'movie',
          title: 'Cyberpunk 2099: Neon Horizon',
          thumbnailUrl: '/src/assets/images/hero_scifi_cyberpunk_1794036935679.jpg',
          progressSeconds: 4200,
          durationSeconds: 8280,
          percentage: 51,
          lastWatchedAt: new Date(Date.now() - 3600000 * 4).toISOString()
        },
        {
          contentId: 'ser-1',
          contentType: 'episode',
          seriesId: 'ser-1',
          episodeId: 'ep-1-1',
          seasonNumber: 1,
          episodeNumber: 1,
          title: 'The Iron Citadel: Ep. 1 - O Despertar da Fortaleza',
          thumbnailUrl: '/src/assets/images/series_banner_fantasy_1794036936974.jpg',
          progressSeconds: 1800,
          durationSeconds: 3240,
          percentage: 55,
          lastWatchedAt: new Date(Date.now() - 3600000 * 12).toISOString()
        }
      ],
      playCounts: {
        'mov-1': 1420,
        'mov-2': 1180,
        'ser-1': 2390,
        'ch-1': 3820,
        'ch-3': 2750
      },
      activeUsersCount: 1482
    };

    this.saveData(defaultDb);
    return defaultDb;
  }

  private saveData(dataToSave = this.data) {
    try {
      ensureDirectoryExistence(DB_FILE);
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // --- Movies ---
  public getMovies(): Movie[] {
    return this.data.movies;
  }

  public getMovieById(id: string): Movie | undefined {
    return this.data.movies.find(m => m.id === id);
  }

  public addMovie(movie: Omit<Movie, 'id' | 'views' | 'addedAt'>): Movie {
    const newMovie: Movie = {
      ...movie,
      id: generateUniqueId('mov'),
      views: 0,
      addedAt: new Date().toISOString().split('T')[0]
    };
    this.data.movies.unshift(newMovie);
    this.saveData();
    return newMovie;
  }

  public updateMovie(id: string, updates: Partial<Movie>): Movie | null {
    const index = this.data.movies.findIndex(m => m.id === id);
    if (index === -1) return null;
    this.data.movies[index] = { ...this.data.movies[index], ...updates };
    this.saveData();
    return this.data.movies[index];
  }

  public deleteMovie(id: string): boolean {
    const initialLen = this.data.movies.length;
    this.data.movies = this.data.movies.filter(m => m.id !== id);
    if (this.data.movies.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- Series ---
  public getSeries(): Series[] {
    return this.data.series;
  }

  public getSeriesById(id: string): Series | undefined {
    return this.data.series.find(s => s.id === id);
  }

  public addSeries(seriesData: Omit<Series, 'id' | 'views' | 'addedAt' | 'totalEpisodes'>): Series {
    const seriesId = generateUniqueId('ser');
    const totalEpisodes = (seriesData.seasons || []).reduce(
      (acc, s) => acc + (s.episodes ? s.episodes.length : 0), 0
    );
    const updatedSeasons = (seriesData.seasons || []).map(season => ({
      ...season,
      episodes: (season.episodes || []).map(ep => ({
        ...ep,
        id: generateUniqueId('ep'),
        seriesId
      }))
    }));
    const newSeries: Series = {
      ...seriesData,
      id: seriesId,
      seasons: updatedSeasons,
      totalEpisodes,
      views: 0,
      addedAt: new Date().toISOString().split('T')[0]
    };
    this.data.series.unshift(newSeries);
    this.saveData();
    return newSeries;
  }

  public updateSeries(id: string, updates: Partial<Series>): Series | null {
    const index = this.data.series.findIndex(s => s.id === id);
    if (index === -1) return null;
    const current = this.data.series[index];
    const seasons = updates.seasons || current.seasons;
    const totalEpisodes = seasons.reduce(
      (acc, s) => acc + (s.episodes ? s.episodes.length : 0), 0
    );
    this.data.series[index] = {
      ...current,
      ...updates,
      totalEpisodes
    };
    this.saveData();
    return this.data.series[index];
  }

  public deleteSeries(id: string): boolean {
    const initialLen = this.data.series.length;
    this.data.series = this.data.series.filter(s => s.id !== id);
    if (this.data.series.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- Channels ---
  public getChannels(): LiveChannel[] {
    return this.data.channels;
  }

  public getChannelById(id: string): LiveChannel | undefined {
    return this.data.channels.find(c => c.id === id);
  }

  public addChannel(channelData: Omit<LiveChannel, 'id' | 'views'>): LiveChannel {
    const newChannel: LiveChannel = {
      ...channelData,
      id: generateUniqueId('ch'),
      views: 0
    };
    this.data.channels.push(newChannel);
    this.saveData();
    return newChannel;
  }

  public updateChannel(id: string, updates: Partial<LiveChannel>): LiveChannel | null {
    const index = this.data.channels.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.data.channels[index] = { ...this.data.channels[index], ...updates };
    this.saveData();
    return this.data.channels[index];
  }

  public deleteChannel(id: string): boolean {
    const initialLen = this.data.channels.length;
    this.data.channels = this.data.channels.filter(c => c.id !== id);
    if (this.data.channels.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- Favorites & Watch History ---
  public getFavorites(): string[] {
    return this.data.favorites;
  }

  public toggleFavorite(id: string): { favorites: string[]; isFavorite: boolean } {
    const exists = this.data.favorites.includes(id);
    if (exists) {
      this.data.favorites = this.data.favorites.filter(favId => favId !== id);
    } else {
      this.data.favorites.unshift(id);
    }
    this.saveData();
    return {
      favorites: this.data.favorites,
      isFavorite: !exists
    };
  }

  public getWatchHistory(): WatchProgress[] {
    return this.data.watchHistory;
  }

  public updateWatchProgress(progress: WatchProgress): WatchProgress[] {
    this.data.watchHistory = this.data.watchHistory.filter(
      h => h.contentId !== progress.contentId && (!progress.episodeId || h.episodeId !== progress.episodeId)
    );
    this.data.watchHistory.unshift(progress);
    if (this.data.watchHistory.length > 20) {
      this.data.watchHistory = this.data.watchHistory.slice(0, 20);
    }

    // Register play count
    this.data.playCounts[progress.contentId] = (this.data.playCounts[progress.contentId] || 0) + 1;

    this.saveData();
    return this.data.watchHistory;
  }

  public recordPlay(contentId: string) {
    this.data.playCounts[contentId] = (this.data.playCounts[contentId] || 0) + 1;
    this.saveData();
  }

  // --- Servers ---
  public getServers(): StreamingServer[] {
    return this.data.servers || [];
  }

  public getServerById(id: string): StreamingServer | undefined {
    return (this.data.servers || []).find(s => s.id === id);
  }

  public addServer(serverData: Omit<StreamingServer, 'id' | 'addedAt'>): StreamingServer {
    if (!this.data.servers) this.data.servers = [];
    // If set as default, remove isDefault from other servers
    if (serverData.isDefault) {
      this.data.servers.forEach(s => s.isDefault = false);
    }
    const newServer: StreamingServer = {
      ...serverData,
      id: generateUniqueId('srv'),
      addedAt: new Date().toISOString().split('T')[0]
    };
    this.data.servers.push(newServer);
    this.saveData();
    return newServer;
  }

  public updateServer(id: string, updates: Partial<StreamingServer>): StreamingServer | null {
    if (!this.data.servers) return null;
    const index = this.data.servers.findIndex(s => s.id === id);
    if (index === -1) return null;

    if (updates.isDefault) {
      this.data.servers.forEach(s => s.isDefault = false);
    }

    this.data.servers[index] = { ...this.data.servers[index], ...updates };
    this.saveData();
    return this.data.servers[index];
  }

  public deleteServer(id: string): boolean {
    if (!this.data.servers) return false;
    const initialLen = this.data.servers.length;
    this.data.servers = this.data.servers.filter(s => s.id !== id);
    if (this.data.servers.length !== initialLen) {
      // Ensure at least one default server remains
      if (this.data.servers.length > 0 && !this.data.servers.some(s => s.isDefault)) {
        this.data.servers[0].isDefault = true;
      }
      this.saveData();
      return true;
    }
    return false;
  }

  public setDefaultServer(id: string): StreamingServer | null {
    if (!this.data.servers) return null;
    const target = this.data.servers.find(s => s.id === id);
    if (!target) return null;
    this.data.servers.forEach(s => s.isDefault = (s.id === id));
    this.saveData();
    return target;
  }

  // --- Stats for Admin Dashboard ---
  public getAdminStats(): AdminStats {
    const totalEpisodes = this.data.series.reduce(
      (sum, s) => sum + s.totalEpisodes, 0
    );

    const totalPlays = Object.values(this.data.playCounts).reduce((a, b) => a + b, 0);

    const topWatched = Object.entries(this.data.playCounts)
      .map(([id, plays]) => {
        const movie = this.data.movies.find(m => m.id === id);
        if (movie) return { id, title: movie.title, type: 'Filme' as const, plays };
        const series = this.data.series.find(s => s.id === id);
        if (series) return { id, title: series.title, type: 'Série' as const, plays };
        const channel = this.data.channels.find(c => c.id === id);
        if (channel) return { id, title: channel.name, type: 'Canal' as const, plays };
        return { id, title: 'Item ' + id, type: 'Filme' as const, plays };
      })
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 5);

    return {
      totalMovies: this.data.movies.length,
      totalSeries: this.data.series.length,
      totalEpisodes,
      totalChannels: this.data.channels.length,
      totalServers: (this.data.servers || []).length,
      totalPlays,
      activeUsers: this.data.activeUsersCount,
      topWatched
    };
  }

  public async autoPopulateCatalog(options: {
    type?: 'all' | 'movies' | 'series' | 'channels';
    count?: number;
    useAI?: boolean;
  }) {
    const { generateNewReleases } = await import('./autoCatalog');
    const { movies, series, channels } = await generateNewReleases({
      type: options.type || 'all',
      count: options.count || 3,
      useAI: options.useAI
    });

    const addedMovies: Movie[] = [];
    const addedSeries: Series[] = [];
    const addedChannels: LiveChannel[] = [];

    // Add movies (avoiding identical titles)
    for (const mov of movies) {
      const exists = this.data.movies.some(m => m.title.toLowerCase() === mov.title.toLowerCase());
      const title = exists ? `${mov.title} (Edição Especial)` : mov.title;
      const created = this.addMovie({
        ...mov,
        title
      });
      addedMovies.push(created);
    }

    // Add series
    for (const ser of series) {
      const exists = this.data.series.some(s => s.title.toLowerCase() === ser.title.toLowerCase());
      const title = exists ? `${ser.title} (Nova Temporada)` : ser.title;
      const created = this.addSeries({
        ...ser,
        title
      });
      addedSeries.push(created);
    }

    // Add channels
    for (const ch of channels) {
      const exists = this.data.channels.some(c => c.name.toLowerCase() === ch.name.toLowerCase());
      const name = exists ? `${ch.name} Plus` : ch.name;
      const channelNumber = 110 + this.data.channels.length;
      const created = this.addChannel({
        ...ch,
        name,
        channelNumber
      });
      addedChannels.push(created);
    }

    this.saveData();

    return {
      success: true,
      added: {
        moviesCount: addedMovies.length,
        seriesCount: addedSeries.length,
        channelsCount: addedChannels.length,
        totalAdded: addedMovies.length + addedSeries.length + addedChannels.length
      },
      addedMovies,
      addedSeries,
      addedChannels
    };
  }

  public resetToDefaults() {
    this.data = {
      movies: initialMovies,
      series: initialSeries,
      channels: initialChannels,
      servers: initialServers,
      favorites: ['mov-1', 'ser-1', 'ch-1'],
      watchHistory: [],
      playCounts: { 'mov-1': 240, 'ser-1': 380, 'ch-1': 510 },
      activeUsersCount: 1250
    };
    this.saveData();
    return this.data;
  }
}

export const db = new NetTVDatabase();
