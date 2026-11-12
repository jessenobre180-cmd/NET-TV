import { Movie, Series, LiveChannel, WatchProgress, AdminStats, StreamingServer } from '../types';

export interface ContentsResponse {
  movies: Movie[];
  series: Series[];
  channels: LiveChannel[];
  servers: StreamingServer[];
  favorites: string[];
  watchHistory: WatchProgress[];
}

export const api = {
  async getContents(): Promise<ContentsResponse> {
    const res = await fetch('/api/contents');
    if (!res.ok) throw new Error('Falha ao carregar conteúdos');
    return res.json();
  },

  async getServers(): Promise<StreamingServer[]> {
    const res = await fetch('/api/servers');
    if (!res.ok) throw new Error('Falha ao carregar servidores');
    return res.json();
  },

  async addServer(server: Omit<StreamingServer, 'id' | 'addedAt'>): Promise<StreamingServer> {
    const res = await fetch('/api/servers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(server)
    });
    if (!res.ok) throw new Error('Falha ao adicionar servidor');
    return res.json();
  },

  async updateServer(id: string, updates: Partial<StreamingServer>): Promise<StreamingServer> {
    const res = await fetch(`/api/servers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Falha ao atualizar servidor');
    return res.json();
  },

  async deleteServer(id: string): Promise<void> {
    const res = await fetch(`/api/servers/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Falha ao excluir servidor');
  },

  async setDefaultServer(id: string): Promise<StreamingServer> {
    const res = await fetch(`/api/servers/${id}/set-default`, { method: 'POST' });
    if (!res.ok) throw new Error('Falha ao definir servidor padrão');
    return res.json();
  },

  async getMovies(): Promise<Movie[]> {
    const res = await fetch('/api/movies');
    if (!res.ok) throw new Error('Falha ao carregar filmes');
    return res.json();
  },

  async addMovie(movie: Omit<Movie, 'id' | 'views' | 'addedAt'>): Promise<Movie> {
    const res = await fetch('/api/movies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movie)
    });
    if (!res.ok) throw new Error('Falha ao adicionar filme');
    return res.json();
  },

  async updateMovie(id: string, updates: Partial<Movie>): Promise<Movie> {
    const res = await fetch(`/api/movies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Falha ao atualizar filme');
    return res.json();
  },

  async deleteMovie(id: string): Promise<void> {
    const res = await fetch(`/api/movies/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Falha ao excluir filme');
  },

  async getSeries(): Promise<Series[]> {
    const res = await fetch('/api/series');
    if (!res.ok) throw new Error('Falha ao carregar séries');
    return res.json();
  },

  async addSeries(series: Omit<Series, 'id' | 'views' | 'addedAt' | 'totalEpisodes'>): Promise<Series> {
    const res = await fetch('/api/series', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(series)
    });
    if (!res.ok) throw new Error('Falha ao adicionar série');
    return res.json();
  },

  async updateSeries(id: string, updates: Partial<Series>): Promise<Series> {
    const res = await fetch(`/api/series/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Falha ao atualizar série');
    return res.json();
  },

  async deleteSeries(id: string): Promise<void> {
    const res = await fetch(`/api/series/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Falha ao excluir série');
  },

  async getChannels(): Promise<LiveChannel[]> {
    const res = await fetch('/api/channels');
    if (!res.ok) throw new Error('Falha ao carregar canais');
    return res.json();
  },

  async addChannel(channel: Omit<LiveChannel, 'id' | 'views'>): Promise<LiveChannel> {
    const res = await fetch('/api/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(channel)
    });
    if (!res.ok) throw new Error('Falha ao adicionar canal');
    return res.json();
  },

  async updateChannel(id: string, updates: Partial<LiveChannel>): Promise<LiveChannel> {
    const res = await fetch(`/api/channels/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Falha ao atualizar canal');
    return res.json();
  },

  async deleteChannel(id: string): Promise<void> {
    const res = await fetch(`/api/channels/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Falha ao excluir canal');
  },

  async toggleFavorite(id: string): Promise<{ favorites: string[]; isFavorite: boolean }> {
    const res = await fetch('/api/favorites/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (!res.ok) throw new Error('Falha ao alterar favoritos');
    return res.json();
  },

  async updateWatchProgress(progress: WatchProgress): Promise<WatchProgress[]> {
    const res = await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progress)
    });
    if (!res.ok) throw new Error('Falha ao salvar progresso');
    return res.json();
  },

  async recordPlay(id: string): Promise<void> {
    await fetch('/api/record-play', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    }).catch(() => {});
  },

  async adminLogin(pin: string): Promise<{ success: boolean; token?: string; error?: string }> {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    return res.json();
  },

  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch('/api/admin/stats');
    if (!res.ok) throw new Error('Falha ao carregar estatísticas');
    return res.json();
  },

  async resetDefaultCatalog(): Promise<void> {
    const res = await fetch('/api/admin/reset-defaults', { method: 'POST' });
    if (!res.ok) throw new Error('Falha ao restaurar catálogo');
  },

  async autoPopulateCatalog(options: {
    type?: 'all' | 'movies' | 'series' | 'channels';
    count?: number;
    useAI?: boolean;
  }): Promise<{
    success: boolean;
    added: {
      moviesCount: number;
      seriesCount: number;
      channelsCount: number;
      totalAdded: number;
    };
    addedMovies: Movie[];
    addedSeries: Series[];
    addedChannels: LiveChannel[];
  }> {
    const res = await fetch('/api/auto-populate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    });
    if (!res.ok) throw new Error('Falha ao auto-adicionar conteúdos');
    return res.json();
  }
};
