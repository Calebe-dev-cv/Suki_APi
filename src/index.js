const express = require('express');
const cors = require('cors');
const animeRoutes = require('./routes/animeRoutes');

const app = express();
const PORT = process.env.PORT || 4000;


app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000', '*'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());


app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use((err, req, res, next) => {
  console.error('Erro na requisição:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.use('/api', animeRoutes);

app.get('/', (req, res) => {
  res.json({
    name: 'SukiSekaiApi',
    version: '1.0.0',
    description: 'API para buscar animes do AnimeFire',
    author: 'Suki Sekai',
    endpoints: {
      search: '/api/search?q=nome_do_anime',
      anime: '/api/anime?id=id_do_anime',
      episodes: '/api/episodes?id=id_do_anime',
      stream: '/api/stream?id=id_do_episodio'
    }
  });
});


app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});