import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function createServer() {
  const app = express();

  app.use(express.json());

  // Serve local video streams with byte-range support
  const publicDir = path.resolve(__dirname, 'public');
  app.use('/videos', express.static(path.resolve(publicDir, 'videos'), {
    acceptRanges: true,
    setHeaders: (res) => {
      res.setHeader('Accept-Ranges', 'bytes');
    }
  }));

  // --- API Routes ---
  
  // 1. Initial full contents load (for fast instant UI rendering)
  app.get('/api/contents', (_req: Request, res: Response) => {
    res.json({
      movies: db.getMovies(),
      series: db.getSeries(),
      channels: db.getChannels(),
      servers: db.getServers(),
      favorites: db.getFavorites(),
      watchHistory: db.getWatchHistory()
    });
  });

  // 2. Movies
  app.get('/api/movies', (_req: Request, res: Response) => {
    res.json(db.getMovies());
  });

  app.post('/api/movies', (req: Request, res: Response) => {
    try {
      const movie = db.addMovie(req.body);
      res.status(201).json(movie);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/movies/:id', (req: Request, res: Response) => {
    const updated = db.updateMovie(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json(updated);
  });

  app.delete('/api/movies/:id', (req: Request, res: Response) => {
    const success = db.deleteMovie(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json({ success: true, id: req.params.id });
  });

  // 3. Series
  app.get('/api/series', (_req: Request, res: Response) => {
    res.json(db.getSeries());
  });

  app.post('/api/series', (req: Request, res: Response) => {
    try {
      const series = db.addSeries(req.body);
      res.status(201).json(series);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/series/:id', (req: Request, res: Response) => {
    const updated = db.updateSeries(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Series not found' });
    }
    res.json(updated);
  });

  app.delete('/api/series/:id', (req: Request, res: Response) => {
    const success = db.deleteSeries(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Series not found' });
    }
    res.json({ success: true, id: req.params.id });
  });

  // 4. Channels
  app.get('/api/channels', (_req: Request, res: Response) => {
    res.json(db.getChannels());
  });

  app.post('/api/channels', (req: Request, res: Response) => {
    try {
      const channel = db.addChannel(req.body);
      res.status(201).json(channel);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/channels/:id', (req: Request, res: Response) => {
    const updated = db.updateChannel(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    res.json(updated);
  });

  app.delete('/api/channels/:id', (req: Request, res: Response) => {
    const success = db.deleteChannel(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    res.json({ success: true, id: req.params.id });
  });

  // 4b. Streaming Servers
  app.get('/api/servers', (_req: Request, res: Response) => {
    res.json(db.getServers());
  });

  app.post('/api/servers', (req: Request, res: Response) => {
    try {
      const server = db.addServer(req.body);
      res.status(201).json(server);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/servers/:id', (req: Request, res: Response) => {
    const updated = db.updateServer(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Server not found' });
    }
    res.json(updated);
  });

  app.delete('/api/servers/:id', (req: Request, res: Response) => {
    const success = db.deleteServer(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Server not found' });
    }
    res.json({ success: true, id: req.params.id });
  });

  app.post('/api/servers/:id/set-default', (req: Request, res: Response) => {
    const updated = db.setDefaultServer(req.params.id);
    if (!updated) {
      return res.status(404).json({ error: 'Server not found' });
    }
    res.json(updated);
  });

  // 5. User Favorites & Watch History
  app.get('/api/favorites', (_req: Request, res: Response) => {
    res.json(db.getFavorites());
  });

  app.post('/api/favorites/toggle', (req: Request, res: Response) => {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'Missing content ID' });
    }
    const result = db.toggleFavorite(id);
    res.json(result);
  });

  app.get('/api/history', (_req: Request, res: Response) => {
    res.json(db.getWatchHistory());
  });

  app.post('/api/history', (req: Request, res: Response) => {
    const history = db.updateWatchProgress(req.body);
    res.json(history);
  });

  app.post('/api/record-play', (req: Request, res: Response) => {
    const { id } = req.body;
    if (id) db.recordPlay(id);
    res.json({ success: true });
  });

  // 6. Admin Panel API & Authentication
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { pin } = req.body;
    // Standard secure pin / admin password (accepts 1234 or admin123)
    if (pin === '1234' || pin === 'admin123') {
      res.json({ success: true, token: 'admin_token_nettv_session' });
    } else {
      res.status(401).json({ success: false, error: 'Senha/PIN de administrador incorreta' });
    }
  });

  app.get('/api/admin/stats', (_req: Request, res: Response) => {
    res.json(db.getAdminStats());
  });

  app.post('/api/admin/reset-defaults', (_req: Request, res: Response) => {
    db.resetToDefaults();
    res.json({ success: true, message: 'Catálogo restaurado com sucesso' });
  });

  // 7. Auto-populate newly released movies, series, channels (Curated + Gemini AI)
  app.post('/api/auto-populate', async (req: Request, res: Response) => {
    try {
      const { type = 'all', count = 3, useAI = true } = req.body;
      const result = await db.autoPopulateCatalog({ type, count, useAI });
      res.json(result);
    } catch (err: any) {
      console.error('[AutoPopulate Error]', err);
      res.status(500).json({ error: err.message || 'Falha ao auto-adicionar conteúdos' });
    }
  });

  // --- Vite Dev Server Middleware or Static Build in Prod ---
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NetTV Server] Running on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch(err => {
  console.error('Failed to start server:', err);
});
