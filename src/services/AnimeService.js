const axios = require('axios');
const cheerio = require('cheerio');
const { formatAnimeData, extractStreamUrls } = require('../utils/formatters');

class AnimeService {
    static BASE_URL = 'https://animefire.plus';

    static async makeRequest(url) {
        try {

            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Cache-Control': 'max-age=0',
                'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1',
                'Referer': 'https://animefire.plus/'
            };

            const response = await fetch(url, { headers });

            if (!response.ok) {
                throw new Error(`Request failed with status code ${response.status}`);
            }

            return await response.text();
        } catch (error) {
            console.error(`Erro na requisição para ${url}: ${error.message}`);
            throw new Error(`Falha ao acessar ${url}: ${error.message}`);
        }
    }

    static async getGenresList() {
        try {
            const html = await this.makeRequest(`${this.BASE_URL}`);
            const $ = cheerio.load(html);

            const genres = [];


            $('.dropdown-menu a[href*="/genero/"]').each((index, element) => {
                const genre = $(element).text().trim();
                if (genre && !genres.includes(genre)) {
                    genres.push(genre);
                }
            });


            if (genres.length === 0) {
                $('a[href*="/genero/"]').each((index, element) => {
                    const genre = $(element).text().trim();
                    if (genre && !genres.includes(genre)) {
                        genres.push(genre);
                    }
                });
            }


            if (genres.length === 0) {
                return [
                    "Ação", "Artes Marciais", "Aventura", "Comédia", "Demônios",
                    "Drama", "Ecchi", "Espaço", "Esporte", "Fantasia",
                    "Ficção Científica", "Harém", "Horror", "Jogos", "Josei",
                    "Magia", "Mecha", "Mistério", "Militar", "Musical",
                    "Paródia", "Psicológico", "Romance", "Seinen", "Shoujo-ai",
                    "Shounen", "Slice of Life", "Sobrenatural", "Suspense",
                    "Superpoder", "Vampiros", "Vida Escolar"
                ];
            }

            genres.push("L");
            genres.push("A10");
            genres.push("A14");
            genres.push("A16");
            genres.push("A18");

            return genres;
        } catch (error) {
            console.error('Erro ao obter lista de gêneros:', error);

            return [
                "Ação", "Artes Marciais", "Aventura", "Comédia", "Demônios",
                "Drama", "Ecchi", "Espaço", "Esporte", "Fantasia",
                "Ficção Científica", "Harém", "Horror", "Jogos", "Josei",
                "Magia", "Mecha", "Mistério", "Militar", "Musical",
                "Paródia", "Psicológico", "Romance", "Seinen", "Shoujo-ai",
                "Shounen", "Slice of Life", "Sobrenatural", "Suspense",
                "Superpoder", "Vampiros", "Vida Escolar", "L", "A10", "A14", "A16", "A18"
            ];
        }
    }

    static async getAnimesByGenre(genre, page = 1) {
        try {

            const formattedGenre = genre.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/\s+/g, '-');

            let genreUrl;
            if (page <= 1) {
                genreUrl = `${this.BASE_URL}/genero/${formattedGenre}`;
            } else {
                genreUrl = `${this.BASE_URL}/genero/${formattedGenre}/${page}`;
            }

            const html = await this.makeRequest(genreUrl);
            const $ = cheerio.load(html);


            const animesEncontrados = [];

            $('.divCardUltimosEps, .card-anime').each((index, element) => {
                const cardElement = $(element);

                const url = cardElement.find('a').attr('href') || '';
                const id = url.split('/').pop() || '';
                const image = cardElement.find('img').attr('src') || cardElement.find('img').attr('data-src') || '';
                const name = cardElement.find('h3').text().trim();
                let ageRating = cardElement.find('.text-blockCapaAnimeTagsDL span').text().trim();
                let score = cardElement.find('.horaUltimosEps').text().trim();

                const imageUrl = image.startsWith('http') ?
                    image :
                    (image.startsWith('/') ? `${this.BASE_URL}${image}` : `${this.BASE_URL}/${image}`);

                if (id && name && !animesEncontrados.some(r => r.id === id)) {
                    animesEncontrados.push({
                        id,
                        name,
                        image: imageUrl,
                        url,
                        genres: [genre],
                        ageRating,
                        score
                    });
                }
            });

            return animesEncontrados;
        } catch (error) {
            console.error(`Erro ao buscar animes do gênero ${genre}, página ${page}:`, error);
            return [];
        }
    }

    static async search(query) {
        try {
            const formattedQuery = query.replace(/\s+/g, '-');

            const searchUrl = `${this.BASE_URL}/pesquisar/${encodeURIComponent(formattedQuery)}`;

            const html = await this.makeRequest(searchUrl);
            const $ = cheerio.load(html);

            const results = [];

            $('.divCardUltimosEps').each((index, element) => {
                const cardElement = $(element);

                const url = cardElement.find('a').attr('href') || '';
                const id = url.split('/').pop() || '';
                const image = cardElement.find('img').attr('src') || cardElement.find('img').attr('data-src') || '';
                const name = cardElement.find('h3.animeTitle').text().trim();

                let ageRating = cardElement.find('.text-blockCapaAnimeTagsDL span').text().trim();
                let score = cardElement.find('.horaUltimosEps').text().trim();

                const imageUrl = image.startsWith('http') ?
                    image :
                    (image.startsWith('/') ? `${this.BASE_URL}${image}` : `${this.BASE_URL}/${image}`);

                if (id && name) {
                    results.push({
                        id,
                        name,
                        image: imageUrl,
                        url,
                        ageRating,
                        score
                    });
                }
            });

            if (results.length === 0) {
                $('.card-anime').each((index, element) => {
                    const cardElement = $(element);

                    const url = cardElement.find('a').attr('href') || '';
                    let ageRating = cardElement.find('.text-blockCapaAnimeTagsDL span').text().trim();
                    let score = cardElement.find('.horaUltimosEps').text().trim();
                    const id = url.split('/').pop() || '';
                    const image = cardElement.find('img').attr('src') || cardElement.find('img').attr('data-src') || '';
                    const name = cardElement.find('.anime-title, h3, .title').text().trim();
                    const imageUrl = image.startsWith('http') ?
                        image :
                        (image.startsWith('/') ? `${this.BASE_URL}${image}` : `${this.BASE_URL}/${image}`);

                    if (id && name) {
                        results.push({
                            id,
                            name,
                            image: imageUrl,
                            url,
                            ageRating,
                            score
                        });
                    }
                });
            }

            if (results.length === 0) {
                $('a[href*="/animes/"]').each((index, element) => {
                    const linkElement = $(element);
                    const url = linkElement.attr('href') || '';

                    if (url.includes('/animes/') && !url.includes('/categoria/')) {
                        const id = url.split('/').pop() || '';
                        let image = '';

                        const parentCard = linkElement.closest('div');
                        if (parentCard.find('img').length) {
                            image = parentCard.find('img').attr('src') || parentCard.find('img').attr('data-src') || '';
                        }

                        let name = linkElement.text().trim();
                        if (!name) {
                            name = linkElement.find('h3, .title, .anime-title').text().trim();
                            if (!name) {
                                name = parentCard.find('h3, .title, .anime-title').text().trim();
                            }
                        }

                        if (id && name && !results.some(r => r.id === id)) {
                            results.push({ id, name, image, url });
                        }
                    }
                });
            }

            return {
                query,
                results
            };
        } catch (error) {
            console.error('Erro na busca:', error);
            throw error;
        }
    }


    static async getAnime(id) {
        try {
            const animeUrl = `${this.BASE_URL}/animes/${id}`;
            const html = await this.makeRequest(animeUrl);
            const $ = cheerio.load(html);

            return formatAnimeData($, id, animeUrl);
        } catch (error) {
            console.error('Erro ao obter anime:', error);
            throw error;
        }
    }

    static async getEpisodes(id) {
        try {
            const animeUrl = `${this.BASE_URL}/animes/${id}`;
            const html = await this.makeRequest(animeUrl);
            const $ = cheerio.load(html);

            const episodes = [];

            $('a[href*="/animes/' + id + '/"]').each((index, element) => {
                const episodeElement = $(element);

                const url = episodeElement.attr('href') || '';
                const episodeNumber = url.split('/').pop() || '';
                const title = episodeElement.text().trim() || `Episódio ${episodeNumber}`;

                if (episodeNumber && !isNaN(episodeNumber)) {
                    episodes.push({
                        id: `${id}/${episodeNumber}`,
                        number: episodeNumber,
                        title,
                        url
                    });
                }
            });

            episodes.sort((a, b) => {
                return parseInt(a.number) - parseInt(b.number);
            });

            return {
                id,
                total: episodes.length,
                episodes
            };
        } catch (error) {
            console.error('Erro ao obter episódios:', error);
            throw error;
        }
    }



    static async getStream(id) {
        try {


            const videoApiUrl = `${this.BASE_URL}/video/${id}?tempsubs=1`;

            try {

                const response = await this.makeRequest(videoApiUrl);


                if (typeof response === 'string') {
                } else if (typeof response === 'object') {
                } else {
                }


                let jsonData = null;

                if (typeof response === 'string') {

                    try {
                        jsonData = JSON.parse(response);
                    } catch (parseError) {


                        const mp4UrlRegex = /(https?:\/\/[^"']+\.mp4)/gi;
                        const matches = [...response.matchAll(mp4UrlRegex)];

                        if (matches.length > 0) {
                            const urls = [...new Set(matches.map(m => m[1]))];

                            const streams = urls.map(url => ({
                                url,
                                format: 'mp4',
                                quality: this.getQualityFromUrl(url),
                                type: 'direct'
                            }));

                            return {
                                id,
                                url: videoApiUrl,
                                streams: this.sortStreamsByQuality(streams)
                            };
                        }
                    }
                } else if (typeof response === 'object' && response !== null) {

                    jsonData = response;
                }


                if (jsonData) {
                    if (jsonData.data && Array.isArray(jsonData.data)) {

                        const streams = [];

                        for (const item of jsonData.data) {
                            if (item && item.src) {

                                streams.push({
                                    url: item.src,
                                    format: 'mp4',
                                    quality: item.label || this.getQualityFromUrl(item.src),
                                    type: 'direct'
                                });
                            }
                        }

                        if (streams.length > 0) {
                            return {
                                id,
                                url: videoApiUrl,
                                streams: this.sortStreamsByQuality(streams)
                            };
                        }
                    } else {
                    }
                }


                return {
                    id,
                    url: videoApiUrl,
                    streams: [],
                    message: "Nenhum link de vídeo encontrado na resposta"
                };

            } catch (apiError) {
                return {
                    id,
                    url: videoApiUrl,
                    streams: [],
                    message: "Erro ao acessar API de vídeo: " + apiError.message
                };
            }
        } catch (error) {
            console.error('Erro ao obter stream:', error);

            return {
                id,
                error: error.message,
                streams: [],
                message: "Erro ao obter stream: " + error.message
            };
        }
    }

    static sortStreamsByQuality(streams) {
        const qualityOrder = {
            '1080p': 0,
            '720p': 1,
            'hd': 2,
            '480p': 3,
            '360p': 4,
            '380p': 4,
            'sd': 5
        };

        return streams.sort((a, b) => {
            const qualityA = a.quality ? a.quality.toLowerCase() : 'unknown';
            const qualityB = b.quality ? b.quality.toLowerCase() : 'unknown';

            const orderA = qualityOrder[qualityA] !== undefined ? qualityOrder[qualityA] : 999;
            const orderB = qualityOrder[qualityB] !== undefined ? qualityOrder[qualityB] : 999;

            return orderA - orderB;
        });
    }


    static getQualityFromUrl(url) {
        if (!url) return 'unknown';

        if (url.includes('1080p')) return '1080p';
        if (url.includes('720p')) return '720p';
        if (url.includes('/hd/')) return 'hd';
        if (url.includes('480p')) return '480p';
        if (url.includes('380p')) return '380p';
        if (url.includes('360p')) return '360p';
        if (url.includes('/sd/')) return 'sd';

        return 'unknown';
    }


    static async getTopAnimes(page = 1, classificacao = null) {
        try {

            let url = `${this.BASE_URL}/top-animes`;


            if (page > 1) {
                url = `${url}/${page}`;
            }


            if (classificacao) {

                const separator = url.includes('?') ? '&' : '?';
                url = `${url}${separator}classificação=${encodeURIComponent(classificacao)}`;
            }

            const html = await this.makeRequest(url);
            const $ = cheerio.load(html);

            const results = [];


            $('.divCardUltimosEps, .card-anime').each((index, element) => {
                const cardElement = $(element);

                const url = cardElement.find('a').attr('href') || '';
                const id = url.split('/').pop() || '';
                const image = cardElement.find('img').attr('src') || cardElement.find('img').attr('data-src') || '';
                const name = cardElement.find('h3').text().trim();

                let ageRating = cardElement.find('.text-blockCapaAnimeTags span').text().trim();
                let score = cardElement.find('.horaUltimosEps').text().trim();

                const imageUrl = image.startsWith('http') ?
                    image :
                    (image.startsWith('/') ? `${this.BASE_URL}${image}` : `${this.BASE_URL}/${image}`);

                if (id && name && !results.some(r => r.id === id)) {
                    results.push({
                        id,
                        name,
                        image: imageUrl,
                        url,
                        ageRating,
                        score
                    });
                }
            });

            return results;
        } catch (error) {
            console.error('Erro ao buscar top animes:', error);
            return [];
        }
    }
}

module.exports = AnimeService;