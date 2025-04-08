const AnimeService = require('../services/AnimeService');

class AnimeController {

  static async search(req, res) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({ error: 'Parâmetro de busca não fornecido' });
      }

      const results = await AnimeService.search(q);

      return res.json(results);
    } catch (error) {
      console.error('Erro na busca:', error.message);
      return res.status(500).json({
        error: 'Erro ao buscar animes',
        details: error.message
      });
    }
  }

  static async getAnime(req, res) {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'ID do anime não fornecido' });
      }

      const animeInfo = await AnimeService.getAnime(id);

      return res.json(animeInfo);
    } catch (error) {
      console.error('Erro ao obter anime:', error.message);
      return res.status(500).json({
        error: 'Erro ao obter informações do anime',
        details: error.message
      });
    }
  }

  static async getEpisodes(req, res) {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'ID do anime não fornecido' });
      }

      const episodes = await AnimeService.getEpisodes(id);

      return res.json(episodes);
    } catch (error) {
      console.error('Erro ao obter episódios:', error.message);
      return res.status(500).json({
        error: 'Erro ao obter episódios do anime',
        details: error.message
      });
    }
  }

  static async getStream(req, res) {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'ID do episódio não fornecido' });
      }

      const streamUrls = await AnimeService.getStream(id);

      return res.json(streamUrls);
    } catch (error) {
      console.error('Erro ao obter stream:', error.message);
      return res.status(500).json({
        error: 'Erro ao obter URLs de stream',
        details: error.message
      });
    }
  }

  static async getGenresList(req, res) {
    try {
      const genres = await AnimeService.getGenresList();
      return res.json(genres);
    } catch (error) {
      console.error('Erro ao buscar lista de gêneros:', error.message);
      return res.status(500).json({
        error: 'Erro ao buscar lista de gêneros',
        details: error.message
      });
    }
  }

  static async getAnimesByGenre(req, res) {
    try {
      const { genre } = req.params;
      const { page = 1 } = req.query;

      if (!genre) {
        return res.status(400).json({ error: 'Gênero não fornecido' });
      }

      const animes = await AnimeService.getAnimesByGenre(genre, page);

      return res.json(animes);
    } catch (error) {
      console.error(`Erro ao buscar animes do gênero ${req.params.genre}:`, error.message);
      return res.status(500).json({
        error: 'Erro ao buscar animes por gênero',
        details: error.message
      });
    }
  }

  static async getTopAnimes(req, res) {
    try {
      const { page = 1, classificacao } = req.query;


      const animes = await AnimeService.getTopAnimes(page, classificacao);


      if (!classificacao) {
        const itemsPerPage = 20;
        const startIndex = (page - 1) * itemsPerPage;
        const paginatedResults = animes.slice(startIndex, startIndex + itemsPerPage);
        return res.json(paginatedResults);
      }

      return res.json(animes);
    } catch (error) {
      console.error('Erro ao obter top animes:', error.message);
      return res.status(500).json({
        error: 'Erro ao obter lista de animes populares',
        details: error.message
      });
    }
  }
}

module.exports = AnimeController;