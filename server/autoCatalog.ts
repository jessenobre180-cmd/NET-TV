import { GoogleGenAI } from '@google/genai';
import { Movie, Series, LiveChannel, AgeRating, ChannelCategory } from '../src/types';

// Curated high quality cinematic poster and backdrop library
const CINEMATIC_POSTERS = [
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80',
  '/src/assets/images/hero_scifi_cyberpunk_1794036935679.jpg',
  '/src/assets/images/movie_poster_action_1794036937639.jpg',
  '/src/assets/images/series_banner_fantasy_1794036936974.jpg',
  '/src/assets/images/live_tv_sports_action_1794036938580.jpg'
];

const CINEMATIC_BACKDROPS = [
  '/src/assets/images/hero_scifi_cyberpunk_1794036935679.jpg',
  '/src/assets/images/series_banner_fantasy_1794036936974.jpg',
  '/src/assets/images/movie_poster_action_1794036937639.jpg',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600&auto=format&fit=crop&q=80'
];

const STREAM_URLS = [
  '/videos/scifi_stream.mp4',
  '/videos/action_stream.mp4',
  '/videos/fantasy_stream.mp4',
  '/videos/sports_stream.mp4'
];

// Pool of newly released 2025/2026 movies
export const newlyReleasedMoviesPool: Omit<Movie, 'id' | 'views' | 'addedAt'>[] = [
  {
    title: 'Duna Espacial: As Areias de Titã',
    originalTitle: 'Titan Sands: Chronicles of 2026',
    synopsis: 'Nas luas tempestuosas de Saturno, expedições de colonizadores disputam a última reserva de hidrogênio líquido contra forças separatistas cósmicas.',
    year: 2026,
    genre: ['Ficção científica', 'Ação', 'Aventura'],
    ageRating: '14',
    duration: '2h 24m',
    durationMinutes: 144,
    rating: 9.3,
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    backdropUrl: '/src/assets/images/hero_scifi_cyberpunk_1794036935679.jpg',
    videoUrl: '/videos/scifi_stream.mp4',
    trailerUrl: '/videos/scifi_stream.mp4',
    featured: true,
    cast: ['Lucas Till', 'Ana de Armas', 'Zendaya Cole', 'Harrison Ford'],
    director: 'Denis Villeneuve-Silva'
  },
  {
    title: 'Linha de Tiro: Fúria Noturna',
    originalTitle: 'Nightfire: Tactical Siege',
    synopsis: 'Um esquadrão tático de forças especiais fica encurralado no 50º andar de um arranha-céu dominado por um sindicato cibernético internacional.',
    year: 2026,
    genre: ['Ação', 'Suspense', 'Policial'],
    ageRating: '16',
    duration: '1h 58m',
    durationMinutes: 118,
    rating: 8.9,
    posterUrl: '/src/assets/images/movie_poster_action_1794036937639.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&auto=format&fit=crop&q=80',
    videoUrl: '/videos/action_stream.mp4',
    trailerUrl: '/videos/action_stream.mp4',
    featured: true,
    cast: ['Idris Elba', 'Charlize Theron', 'Karl Urban'],
    director: 'Chad Stahelski'
  },
  {
    title: 'O Guardião dos Reinos Ancestrais',
    originalTitle: 'Keeper of Ancient Realms',
    synopsis: 'Um arqueólogo descobre uma relíquia nas profundezas da Amazônia que abre passagens para dimensões mitológicas esquecidas no tempo.',
    year: 2026,
    genre: ['Fantasia', 'Aventura', 'Mistério'],
    ageRating: '12',
    duration: '2h 10m',
    durationMinutes: 130,
    rating: 9.1,
    posterUrl: '/src/assets/images/series_banner_fantasy_1794036936974.jpg',
    backdropUrl: '/src/assets/images/series_banner_fantasy_1794036936974.jpg',
    videoUrl: '/videos/fantasy_stream.mp4',
    trailerUrl: '/videos/fantasy_stream.mp4',
    featured: false,
    cast: ['Pedro Pascal', 'Wagner Moura', 'Anya Taylor-Joy'],
    director: 'Guillermo del Toro'
  },
  {
    title: 'Operação Subterrânea: Código Vermelho',
    originalTitle: 'Sub-Zero Protocol',
    synopsis: 'Uma quebra de contenção em um laboratório secreto abaixo da calota polar ameaça liberar um organismo sintético letal.',
    year: 2025,
    genre: ['Suspense', 'Ficção científica', 'Ação'],
    ageRating: '16',
    duration: '1h 49m',
    durationMinutes: 109,
    rating: 8.7,
    posterUrl: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=800&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&auto=format&fit=crop&q=80',
    videoUrl: '/videos/scifi_stream.mp4',
    trailerUrl: '/videos/scifi_stream.mp4',
    featured: false,
    cast: ['Jake Gyllenhaal', 'Rebecca Ferguson'],
    director: 'Daniel Espinosa'
  },
  {
    title: 'Planeta Extremo: Rios de Fogo',
    originalTitle: 'Extreme Planet: Rivers of Fire',
    synopsis: 'Imagens aéreas e subterrâneas em ultra-resolução documentando as maiores erupções vulcânicas e fenômenos geomagnéticos de 2026.',
    year: 2026,
    genre: ['Documentários', 'Aventura'],
    ageRating: 'L',
    duration: '1h 36m',
    durationMinutes: 96,
    rating: 9.4,
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&auto=format&fit=crop&q=80',
    videoUrl: '/videos/fantasy_stream.mp4',
    featured: false,
    cast: ['David Attenborough', 'Rodrigo Santoro'],
    director: 'Alastair Fothergill'
  },
  {
    title: 'Heróis do Asfalto: Grande Prêmio',
    originalTitle: 'Apex Velocity: The Grand Prix',
    synopsis: 'A rivalidade mortal entre dois prodígios do automobilismo que colocam a vida em risco na temporada mais disputada da história.',
    year: 2026,
    genre: ['Ação', 'Drama'],
    ageRating: '12',
    duration: '2h 05m',
    durationMinutes: 125,
    rating: 8.8,
    posterUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&auto=format&fit=crop&q=80',
    videoUrl: '/videos/action_stream.mp4',
    featured: false,
    cast: ['Brad Pitt', 'Damson Idris', 'Javier Bardem'],
    director: 'Joseph Kosinski'
  }
];

// Pool of newly released 2025/2026 series
export const newlyReleasedSeriesPool: Omit<Series, 'id' | 'views' | 'addedAt' | 'totalEpisodes'>[] = [
  {
    title: 'Protocolo Alfa: Agência Clandestina',
    synopsis: 'Quando agentes de inteligência de elite começam a ser eliminados misteriosamente, uma espiã dissidente desmascara um programa autônomo de inteligência militar.',
    year: 2026,
    genre: ['Suspense', 'Ação', 'Policial'],
    ageRating: '16',
    seasonsCount: 1,
    rating: 9.2,
    posterUrl: '/src/assets/images/hero_scifi_cyberpunk_1794036935679.jpg',
    backdropUrl: '/src/assets/images/hero_scifi_cyberpunk_1794036935679.jpg',
    featured: true,
    creator: 'Taylor Sheridan',
    cast: ['Zoe Saldana', 'Nicole Kidman', 'Morgan Freeman'],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Temporada 1: Quebra de Protocolo',
        episodes: [
          {
            id: 'ep-pa-1',
            seriesId: '',
            seasonNumber: 1,
            episodeNumber: 1,
            title: 'Ep. 1 - Alvo em Movimento',
            synopsis: 'Uma operação secreta em Berlim sai do controle após interceptação de satélite.',
            duration: '52m',
            durationMinutes: 52,
            videoUrl: '/videos/action_stream.mp4',
            thumbnailUrl: '/src/assets/images/movie_poster_action_1794036937639.jpg'
          },
          {
            id: 'ep-pa-2',
            seriesId: '',
            seasonNumber: 1,
            episodeNumber: 2,
            title: 'Ep. 2 - Código Vermelho',
            synopsis: 'Em fuga pela fronteira alpina, a agente localiza o refúgio do último analista confiável.',
            duration: '49m',
            durationMinutes: 49,
            videoUrl: '/videos/action_stream.mp4',
            thumbnailUrl: '/src/assets/images/hero_scifi_cyberpunk_1794036935679.jpg'
          },
          {
            id: 'ep-pa-3',
            seriesId: '',
            seasonNumber: 1,
            episodeNumber: 3,
            title: 'Ep. 3 - Linha Fantasma',
            synopsis: 'Uma infiltração arriscada no servidor central de Zurique revela quem puxa os fios.',
            duration: '56m',
            durationMinutes: 56,
            videoUrl: '/videos/scifi_stream.mp4',
            thumbnailUrl: '/src/assets/images/hero_scifi_cyberpunk_1794036935679.jpg'
          },
          {
            id: 'ep-pa-4',
            seriesId: '',
            seasonNumber: 1,
            episodeNumber: 4,
            title: 'Ep. 4 - Ponto de Não Retorno',
            synopsis: 'O confronto final nos túneis subterrâneos do parlamento europeu.',
            duration: '60m',
            durationMinutes: 60,
            videoUrl: '/videos/action_stream.mp4',
            thumbnailUrl: '/src/assets/images/movie_poster_action_1794036937639.jpg'
          }
        ]
      }
    ]
  },
  {
    title: 'Crimes da Madrugada: Seção Pericial',
    synopsis: 'Um grupo forense especializado em casos sem solução usa reconstrução holográfica de cenas de crime para desvendar assassinatos em São Paulo.',
    year: 2026,
    genre: ['Suspense', 'Drama', 'Policial'],
    ageRating: '16',
    seasonsCount: 1,
    rating: 8.9,
    posterUrl: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=800&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&auto=format&fit=crop&q=80',
    featured: false,
    creator: 'José Padilha',
    cast: ['Selton Mello', 'Taís Araújo', 'Gabriel Leone'],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Temporada 1: Vestígios Digitais',
        episodes: [
          {
            id: 'ep-cm-1',
            seriesId: '',
            seasonNumber: 1,
            episodeNumber: 1,
            title: 'Ep. 1 - O Nevoeiro do Viaduto',
            synopsis: 'Um corpo encontrado sem identificação traz marcas de uma tecnologia nunca vista antes.',
            duration: '46m',
            durationMinutes: 46,
            videoUrl: '/videos/scifi_stream.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=800&auto=format&fit=crop&q=80'
          },
          {
            id: 'ep-cm-2',
            seriesId: '',
            seasonNumber: 1,
            episodeNumber: 2,
            title: 'Ep. 2 - A Chave de Cripto',
            synopsis: 'A pista deixada pela vítima aponta para uma conta bancária congelada há dez anos.',
            duration: '48m',
            durationMinutes: 48,
            videoUrl: '/videos/action_stream.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&auto=format&fit=crop&q=80'
          }
        ]
      }
    ]
  },
  {
    title: 'Arquivos da Terra: Civilizações Perdidas',
    synopsis: 'Série documental explorando com tecnologia LiDAR templos e cidades milenares submersas em florestas tropicais e abismos marinhos.',
    year: 2025,
    genre: ['Documentários', 'Aventura', 'História'],
    ageRating: 'L',
    seasonsCount: 1,
    rating: 9.3,
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&auto=format&fit=crop&q=80',
    featured: false,
    creator: 'National Geographics Team',
    cast: ['Albert Lin', 'Ella Al-Shamahi'],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Temporada 1: Cidades dos Deuses',
        episodes: [
          {
            id: 'ep-at-1',
            seriesId: '',
            seasonNumber: 1,
            episodeNumber: 1,
            title: 'Ep. 1 - As Torres da Selva',
            synopsis: 'Escaners de laser revelam uma metrópole de pedra de 3.000 anos escondida na copa das árvores.',
            duration: '50m',
            durationMinutes: 50,
            videoUrl: '/videos/fantasy_stream.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80'
          },
          {
            id: 'ep-at-2',
            seriesId: '',
            seasonNumber: 1,
            episodeNumber: 2,
            title: 'Ep. 2 - A Pirâmide Submarina',
            synopsis: 'Mergulho de saturação nas águas do caribe revela estruturas megalíticas submersas.',
            duration: '52m',
            durationMinutes: 52,
            videoUrl: '/videos/fantasy_stream.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&auto=format&fit=crop&q=80'
          }
        ]
      }
    ]
  }
];

// Pool of newly authorized live channels
export const newlyReleasedChannelsPool: Omit<LiveChannel, 'id' | 'views'>[] = [
  {
    channelNumber: 109,
    name: 'NetTV Cinema Max 4K',
    category: 'Filmes',
    logoUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&auto=format&fit=crop&q=80',
    bannerUrl: '/src/assets/images/hero_scifi_cyberpunk_1794036935679.jpg',
    streamUrl: '/videos/scifi_stream.mp4',
    isOnline: true,
    resolution: '4K',
    currentProgram: {
      title: 'Festival Sci-Fi 2026: Viagem Além das Galáxias',
      start: '21:00',
      end: '23:30',
      synopsis: 'Os maiores clássicos e novidades do cinema futurista com imagem ultra-definida.',
      progressPercentage: 55
    },
    nextProgram: {
      title: 'Especial Noturno: Suspense Psicológico',
      start: '23:30',
      end: '01:30'
    }
  },
  {
    channelNumber: 110,
    name: 'Arena Esportiva Brasil HD',
    category: 'Esportes',
    logoUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200&auto=format&fit=crop&q=80',
    bannerUrl: '/src/assets/images/live_tv_sports_action_1794036938580.jpg',
    streamUrl: '/videos/sports_stream.mp4',
    isOnline: true,
    resolution: '1080p',
    currentProgram: {
      title: 'Copa dos Campeões: Quartas de Final (Ao Vivo)',
      start: '20:30',
      end: '22:45',
      synopsis: 'Transmissão com narração exclusiva e câmeras táticas em campo.',
      progressPercentage: 70
    },
    nextProgram: {
      title: 'Debate da Rodada & Prancheta Tática',
      start: '22:45',
      end: '00:00'
    }
  },
  {
    channelNumber: 111,
    name: 'Mundo Natureza 4K',
    category: 'Documentários',
    logoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=80',
    streamUrl: '/videos/fantasy_stream.mp4',
    isOnline: true,
    resolution: '4K',
    currentProgram: {
      title: 'Floresta Viva: Os Grandes Predadores',
      start: '21:15',
      end: '22:45',
      synopsis: 'Acompanhe a vida selvagem através de lentes térmicas e ultra-lentas.',
      progressPercentage: 40
    },
    nextProgram: {
      title: 'Planeta Ártico: A Dança das Auroras',
      start: '22:45',
      end: '23:45'
    }
  },
  {
    channelNumber: 112,
    name: 'GamerZone TV & eSports',
    category: 'Entretenimento',
    logoUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80',
    bannerUrl: '/src/assets/images/hero_scifi_cyberpunk_1794036935679.jpg',
    streamUrl: '/videos/scifi_stream.mp4',
    isOnline: true,
    resolution: '1080p',
    currentProgram: {
      title: 'Torneio Mundial de FPS: Grande Final',
      start: '20:00',
      end: '23:00',
      synopsis: 'As duas maiores equipes do planeta disputam o troféu em cinco mapas decisivos.',
      progressPercentage: 85
    },
    nextProgram: {
      title: 'Podcast dos Pro-Players',
      start: '23:00',
      end: '00:30'
    }
  },
  {
    channelNumber: 113,
    name: 'Jazz & Lounge Sounds TV',
    category: 'Música',
    logoUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600&auto=format&fit=crop&q=80',
    streamUrl: '/videos/action_stream.mp4',
    isOnline: true,
    resolution: '1080p',
    currentProgram: {
      title: 'Sessão Acústica: Montreux Jazz Live',
      start: '22:00',
      end: '00:00',
      synopsis: 'Grandes mestres do jazz instrumental com áudio imersivo remasterizado.',
      progressPercentage: 50
    },
    nextProgram: {
      title: 'Madrugada Chillout & Neo Soul',
      start: '00:00',
      end: '02:00'
    }
  }
];

/**
 * Service to generate / auto-add newly released content.
 * Uses Gemini API (gemini-3.8-flash) if available, with full fallback to curated releases.
 */
export async function generateNewReleases(options: {
  type: 'all' | 'movies' | 'series' | 'channels';
  count?: number;
  useAI?: boolean;
}): Promise<{
  movies: Omit<Movie, 'id' | 'views' | 'addedAt'>[];
  series: Omit<Series, 'id' | 'views' | 'addedAt' | 'totalEpisodes'>[];
  channels: Omit<LiveChannel, 'id' | 'views'>[];
}> {
  const apiKey = process.env.GEMINI_API_KEY;
  const count = options.count || 3;

  // Try AI Generation with Gemini if requested and apiKey is available
  if (options.useAI && apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const moviesToReturn: Omit<Movie, 'id' | 'views' | 'addedAt'>[] = [];
      const seriesToReturn: Omit<Series, 'id' | 'views' | 'addedAt' | 'totalEpisodes'>[] = [];
      const channelsToReturn: Omit<LiveChannel, 'id' | 'views'>[] = [];

      if (options.type === 'all' || options.type === 'movies') {
        const prompt = `Gere ${count} filmes recém-lançados (lançamentos de cinema 2025 e 2026) em formato JSON.
Cada filme deve conter:
- title: string (título em português)
- originalTitle: string (título original)
- synopsis: string (sinopse emocionante de 2 a 3 frases)
- year: number (2025 ou 2026)
- genre: array de strings (ex: ["Ação", "Ficção científica", "Suspense"])
- ageRating: string ("L", "10", "12", "14", "16", "18")
- duration: string (ex: "2h 15m")
- durationMinutes: number
- rating: number (entre 8.4 e 9.6)
- director: string
- cast: array de strings (3 a 4 atores famosos)
- featured: boolean`;

        const resp = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const raw = JSON.parse(resp.text || '[]');
        if (Array.isArray(raw)) {
          raw.slice(0, count).forEach((item, idx) => {
            moviesToReturn.push({
              title: item.title || `Superprodução 2026 #${idx + 1}`,
              originalTitle: item.originalTitle || item.title,
              synopsis: item.synopsis || 'Uma das produções cinematográficas mais comentadas do ano no streaming.',
              year: item.year || 2026,
              genre: Array.isArray(item.genre) ? item.genre : ['Ação', 'Ficção científica'],
              ageRating: (['L', '10', '12', '14', '16', '18'].includes(item.ageRating) ? item.ageRating : '14') as AgeRating,
              duration: item.duration || '2h 00m',
              durationMinutes: item.durationMinutes || 120,
              rating: typeof item.rating === 'number' ? item.rating : 9.0,
              posterUrl: CINEMATIC_POSTERS[idx % CINEMATIC_POSTERS.length],
              backdropUrl: CINEMATIC_BACKDROPS[idx % CINEMATIC_BACKDROPS.length],
              videoUrl: STREAM_URLS[idx % STREAM_URLS.length],
              trailerUrl: STREAM_URLS[idx % STREAM_URLS.length],
              director: item.director || 'Diretor de Sucesso',
              cast: Array.isArray(item.cast) ? item.cast : ['Ator Principal', 'Atriz Destaque'],
              featured: !!item.featured
            });
          });
        }
      }

      if (options.type === 'all' || options.type === 'series') {
        const seriesPrompt = `Gere ${Math.min(count, 2)} séries de TV recém-lançadas (2025 ou 2026) com episódios em formato JSON.
Cada série deve conter:
- title: string
- synopsis: string
- year: number (2025 ou 2026)
- genre: array de strings
- ageRating: string ("14", "16" ou "18")
- rating: number (8.5 a 9.5)
- creator: string
- cast: array de strings
- episodes: array de 3 episódios (com title, synopsis, duration "48m", durationMinutes 48)`;

        const resp = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: seriesPrompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const rawSeries = JSON.parse(resp.text || '[]');
        if (Array.isArray(rawSeries)) {
          rawSeries.slice(0, count).forEach((item, idx) => {
            const rawEps = Array.isArray(item.episodes) ? item.episodes : [];
            const episodes = rawEps.map((ep: any, epIdx: number) => ({
              id: `ep-ai-${Date.now()}-${idx}-${epIdx + 1}`,
              seriesId: '',
              seasonNumber: 1,
              episodeNumber: epIdx + 1,
              title: ep.title || `Ep. ${epIdx + 1} - A Revelação`,
              synopsis: ep.synopsis || 'Episódio repleto de reviravoltas e revelações impactantes.',
              duration: ep.duration || '50m',
              durationMinutes: ep.durationMinutes || 50,
              videoUrl: STREAM_URLS[(idx + epIdx) % STREAM_URLS.length],
              thumbnailUrl: CINEMATIC_BACKDROPS[(idx + epIdx) % CINEMATIC_BACKDROPS.length]
            }));

            seriesToReturn.push({
              title: item.title || `Série Revelação 2026 #${idx + 1}`,
              synopsis: item.synopsis || 'Grande produção seriada aclamada pela crítica internacional.',
              year: item.year || 2026,
              genre: Array.isArray(item.genre) ? item.genre : ['Drama', 'Suspense'],
              ageRating: (['L', '10', '12', '14', '16', '18'].includes(item.ageRating) ? item.ageRating : '16') as AgeRating,
              rating: typeof item.rating === 'number' ? item.rating : 9.1,
              posterUrl: CINEMATIC_POSTERS[(idx + 4) % CINEMATIC_POSTERS.length],
              backdropUrl: CINEMATIC_BACKDROPS[(idx + 2) % CINEMATIC_BACKDROPS.length],
              creator: item.creator || 'Showrunner NetTV',
              cast: Array.isArray(item.cast) ? item.cast : ['Elenco Principal'],
              seasonsCount: 1,
              seasons: [
                {
                  seasonNumber: 1,
                  title: 'Temporada 1',
                  episodes
                }
              ]
            });
          });
        }
      }

      if (options.type === 'all' || options.type === 'channels') {
        // Return from curated high-quality channels pool
        channelsToReturn.push(...newlyReleasedChannelsPool.slice(0, count));
      }

      if (moviesToReturn.length > 0 || seriesToReturn.length > 0 || channelsToReturn.length > 0) {
        return {
          movies: moviesToReturn,
          series: seriesToReturn,
          channels: channelsToReturn
        };
      }
    } catch (e) {
      console.warn('[AutoCatalog] AI generation failed or fallback triggered:', e);
    }
  }

  // Fallback to curated high-quality 2025/2026 releases pool
  const movies = (options.type === 'all' || options.type === 'movies') 
    ? newlyReleasedMoviesPool.slice(0, count) 
    : [];

  const series = (options.type === 'all' || options.type === 'series')
    ? newlyReleasedSeriesPool.slice(0, count)
    : [];

  const channels = (options.type === 'all' || options.type === 'channels')
    ? newlyReleasedChannelsPool.slice(0, count)
    : [];

  return { movies, series, channels };
}
