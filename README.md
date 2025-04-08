## Instalação

Clone este repositório:

```bash
git clone https://github.com/Calebe-dev-cv/ApiAnimeFire.git
cd sukisekai-api-node
```

Instale as dependências:

```bash
npm install
```

Inicie o servidor:

```bash
npm start
```

Para desenvolvimento (com hot-reload):

```bash
npm run dev
```

## Endpoints

A API estará disponível em `http://localhost:4000` com os seguintes endpoints:

### Buscar Animes

```
GET /api/search?q=nome_do_anime
```

Exemplo de resposta:
```json
{
  "query": "naruto",
  "results": [
    {
      "id": "naruto",
      "name": "Naruto",
      "image": "https://animefire.plus/img/animes/naruto.jpg",
      "url": "https://animefire.plus/animes/naruto"
    },

  ]
}
```

### Obter Informações do Anime

```
GET /api/anime?id=id_do_anime
```

Exemplo de resposta:
```json
{
  "id": "naruto",
  "name": "Naruto",
  "url": "https://animefire.plus/animes/naruto",
  "image": "https://animefire.plus/img/animes/naruto.jpg",
  "synopsis": "A história segue Naruto Uzumaki, um jovem ninja que constantemente procura por reconhecimento...",
  "categories": ["Ação", "Aventura", "Shounen"],
  "status": "Completo",
  "year": "2002",
  "studio": "Studio Pierrot",
  "rating": "4.8"
}
```

### Obter Episódios do Anime

```
GET /api/episodes?id=id_do_anime
```

Exemplo de resposta:
```json
{
  "id": "naruto",
  "total": 220,
  "episodes": [
    {
      "id": "naruto-episodio-220",
      "number": "220",
      "title": "Episódio 220",
      "url": "https://animefire.plus/video/naruto-episodio-220"
    },

  ]
}
```

### Obter URLs de Stream

```
GET /api/stream?id=id_do_episodio
```

Exemplo de resposta:
```json
{
  "id": "naruto-episodio-1",
  "url": "https://animefire.plus/video/naruto-episodio-1",
  "streams": [
    {
      "url": "https://example.com/video.mp4",
      "format": "mp4",
      "quality": "720p",
      "type": "direct"
    },

  ]
}
```

## Estrutura do Projeto

```
src/
├── controllers/      # Controladores que gerenciam as requisições
├── routes/           # Definição das rotas da API
├── services/         # Lógica de negócio e comunicação com o site
├── utils/            # Funções auxiliares
└── index.js          # Ponto de entrada da aplicação
```

## Tecnologias Utilizadas

- **Express**: Framework web para Node.js
- **Axios**: Cliente HTTP para realizar requisições
- **Cheerio**: Biblioteca para web scraping
- **Cors**: Middleware para habilitar CORS

## Observações

Esta API é apenas para fins educacionais. O uso dos dados obtidos é de responsabilidade do usuário.

## Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

## Licença

MIT