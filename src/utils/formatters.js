function formatAnimeData($, id, url) {
    const name = $('h1.quicksand400.mt-2.mb-0').text().trim();


    const image = $('img[src*="-large.webp"]').attr('src') ||
        $('img[data-src*="-large.webp"]').attr('data-src') || '';


    const imageUrl = image.startsWith('http') ?
        image :
        (image.startsWith('/') ? 'https://animefire.plus' + image : 'https://animefire.plus/' + image);

    const synopsis = $('.divSinopse').text().trim();

    const categories = [];
    $('.spanGenerosLink').each((i, el) => {
        const category = $(el).text().trim();
        if (category && !categories.includes(category)) {
            categories.push(category);
        }
    });

    let status = '';
    let year = '';
    let studio = '';
    let episodesCount = '';
    let season = '';
    let audio = '';
    let releaseDay = '';

    $('.animeInfo').each((i, el) => {
        const text = $(el).text().trim();

        if (text.includes('Status do Anime:')) {
            status = text.replace('Status do Anime:', '').trim();
        } else if (text.includes('Ano:')) {
            year = text.replace('Ano:', '').trim();
        } else if (text.includes('Estúdios:')) {
            studio = text.replace('Estúdios:', '').trim();
        } else if (text.includes('Episódios:')) {
            episodesCount = text.replace('Episódios:', '').trim();
        } else if (text.includes('Temporada:')) {
            season = text.replace('Temporada:', '').trim();
        } else if (text.includes('Áudio:')) {
            audio = text.replace('Áudio:', '').trim();
        } else if (text.includes('Dia de Lançamento:')) {
            releaseDay = text.replace('Dia de Lançamento:', '').trim();
        }
    });

    const score = $('#anime_score').text().trim();
    const votes = $('#anime_votos').text().trim().replace(' votos', '').replace(',', '');

    const episodios = [];
    $('a.lEp.epT').each((i, el) => {
        const link = $(el).attr('href') || '';
        const number = link.split('/').pop() || '';
        const epName = $(el).text().trim() || `Episódio ${number}`;

        if (number && !isNaN(number)) {
            episodios.push({
                numero: parseInt(number),
                nome: epName,
                link: link
            });
        }
    });

    episodios.sort((a, b) => a.numero - b.numero);

    return {
        id,
        name,
        url,
        image: imageUrl,
        synopsis,
        categories,
        status,
        year,
        studio,
        episodiosCount: episodios.length > 0 ? episodios.length : episodesCount,
        season,
        audio,
        releaseDay,
        score,
        votes,
        episodios
    };
}


function formatEpisodeData($, id, url) {
    const titleSelectors = ['.video-title h1', '.episode-title', 'h1.title', '.titulo-episodio'];
    let title = '';
    for (const selector of titleSelectors) {
        const element = $(selector).first();
        if (element.length) {
            title = element.text().trim();
            if (title) break;
        }
    }

    const animeNameSelectors = ['.video-title h2 a', '.anime-title a', '.anime-name a', '.nome-anime a'];
    let anime = '';
    let animeId = '';
    for (const selector of animeNameSelectors) {
        const element = $(selector).first();
        if (element.length) {
            anime = element.text().trim();
            const animeUrl = element.attr('href') || '';
            animeId = animeUrl.split('/').pop() || '';
            if (anime && animeId) break;
        }
    }

    if (!title) {
        const episodeNumber = id.match(/episodio-(\d+)/i)?.[1] || '';
        if (episodeNumber) {
            title = `Episódio ${episodeNumber}`;
        } else {
            title = `Episódio`;
        }
    }

    if (!anime) {
        const animeName = id.replace(/-episodio-\d+$|-ep-\d+$/i, '').replace(/-/g, ' ');
        if (animeName) {
            anime = animeName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        } else {
            anime = 'Anime';
        }
    }

    return {
        id,
        title,
        url,
        anime: {
            id: animeId || '',
            name: anime
        }
    };
}

function extractStreamUrls(html, id, url) {
    
    const result = {
        id,
        url,
        streams: []
    };

    try {

        if (html && (html.startsWith('{') || html.includes('"data":') || html.includes('"src":'))) {
            
            try {
                const jsonData = JSON.parse(html);
                

                if (jsonData.data && Array.isArray(jsonData.data)) {                    

                    jsonData.data.forEach(item => {
                        if (item.src) {
                            
                            result.streams.push({
                                url: item.src,
                                format: item.src.endsWith('.mp4') ? 'mp4' : 
                                       item.src.endsWith('.m3u8') ? 'hls' : 'unknown',
                                quality: item.label || getQualityFromUrl(item.src),
                                type: 'direct'
                            });
                        }
                    });
                    
                    if (result.streams.length > 0) {
                        return result;
                    }
                }
            } catch (jsonError) {
            }
        }
        

        const videoRegex = /<video[^>]+id=["']my-video_html5_api["'][^>]+src=["']([^"']+)["']/i;
        const videoMatch = html.match(videoRegex);
        
        if (videoMatch && videoMatch[1]) {
            const videoUrl = videoMatch[1];
            
            result.streams.push({
                url: videoUrl,
                format: videoUrl.endsWith('.mp4') ? 'mp4' : 
                       videoUrl.endsWith('.m3u8') ? 'hls' : 'unknown',
                quality: getQualityFromUrl(videoUrl),
                type: 'direct'
            });
            
            return result;
        }
        
        const anyVideoSrcRegex = /<video[^>]+src=["']([^"']+)["']/i;
        const anyVideoMatch = html.match(anyVideoSrcRegex);
        
        if (anyVideoMatch && anyVideoMatch[1]) {
            const videoUrl = anyVideoMatch[1];
            
            result.streams.push({
                url: videoUrl,
                format: videoUrl.endsWith('.mp4') ? 'mp4' : 
                       videoUrl.endsWith('.m3u8') ? 'hls' : 'unknown',
                quality: getQualityFromUrl(videoUrl),
                type: 'direct'
            });
            
            return result;
        }
        

        const mp4UrlRegex = /(https?:\/\/[^"']+\.mp4)/gi;
        const mp4Matches = [...html.matchAll(mp4UrlRegex)];
        
        if (mp4Matches.length > 0) {
            
            const uniqueUrls = [...new Set(mp4Matches.map(match => match[1]))];
            
            uniqueUrls.forEach(videoUrl => {
                result.streams.push({
                    url: videoUrl,
                    format: 'mp4',
                    quality: getQualityFromUrl(videoUrl),
                    type: 'direct'
                });
            });
            
            return result;
        }
        
        result.message = "URL do vídeo não encontrada na página";
        
    } catch (error) {
        console.error('Erro ao extrair URL do stream:', error);
        result.error = error.message;
    }

    return result;
}


function getQualityFromUrl(url) {
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

module.exports = {
    formatAnimeData,
    formatEpisodeData,
    extractStreamUrls
};