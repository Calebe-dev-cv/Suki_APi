const express = require('express');
const router = express.Router();
const cheerio = require('cheerio');
const AnimeController = require('../controllers/AnimeController');
const AnimeService = require('../services/AnimeService'); 


router.get('/search', AnimeController.search);
router.get('/anime', AnimeController.getAnime);
router.get('/episodes', AnimeController.getEpisodes);
router.get('/stream', AnimeController.getStream);
router.get('/genres/list', AnimeController.getGenresList);
router.get('/genres/:genre', AnimeController.getAnimesByGenre);
router.get('/top-animes', AnimeController.getTopAnimes);
router.get('/debug', async (req, res) => {
    try {
      const { url } = req.query;
      if (!url) return res.status(400).json({ error: 'URL não fornecida' });
      
      const html = await AnimeService.makeRequest(url);
      const $ = cheerio.load(html);
      
      const debug = {
        title: $('title').text(),
        h1: $('h1').map((i, el) => $(el).text().trim()).get(),
        images: $('img').map((i, el) => ({
          src: $(el).attr('src'),
          alt: $(el).attr('alt'),
          class: $(el).attr('class')
        })).get().slice(0, 10), 
        potentialSynopsis: $('p, div').filter((i, el) => {
          const text = $(el).text().trim();
          return text.length > 100 && text.length < 1000;
        }).map((i, el) => ({
          text: $(el).text().trim(),
          class: $(el).attr('class')
        })).get().slice(0, 5), 
        potentialGenres: $('a[href*="/genero/"], a[href*="/categoria/"]').map((i, el) => ({
          text: $(el).text().trim(),
          href: $(el).attr('href'),
          class: $(el).attr('class')
        })).get(),
        metaInfo: $('div, span').filter((i, el) => {
          const text = $(el).text().trim();
          return text.includes('Status:') || 
                 text.includes('Estado:') || 
                 text.includes('Ano:') || 
                 text.includes('Estúdio:');
        }).map((i, el) => ({
          text: $(el).text().trim(),
          class: $(el).attr('class')
        })).get()
      };
      
      res.json(debug);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

module.exports = router;