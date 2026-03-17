require('dotenv').config(); // Carrega as variáveis de ambiente do .env
const express = require('express');
const cors = require('cors'); // Para permitir requisições do frontend
const { OpenAI } = require('openai');
const { google } = require('googleapis');

const app = express();
const port = process.env.PORT || 3001; // Porta do servidor

// Inicializa a OpenAI com sua chave
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Inicializa o cliente do YouTube com sua chave
const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY,
});

app.use(cors()); // Habilita CORS para o frontend poder se comunicar
app.use(express.json()); // Habilita o parsing de JSON no corpo das requisições

// Endpoint para detectar o mood e buscar músicas
app.post('/api/get-music-by-mood', async (req, res) => {
    const { moodText } = req.body;

    if (!moodText) {
        return res.status(400).json({ error: 'Texto do mood é obrigatório.' });
    }

    try {
        const chatCompletion = await openai.chat.completions.create({
            model: "gpt-4o", // Usando o modelo GPT-4o
            messages: [
                {
                    role: "system",
                    content: "Você é um assistente especialista em gerar frases de busca para o YouTube, com foco exclusivo em músicas lo-fi. Sua tarefa é traduzir o humor, a ocasião ou a atividade do usuário em uma única frase de busca concisa e eficaz. A frase DEVE SEMPRE incluir o termo 'lo-fi' ou um sinônimo (como 'chillhop' ou 'lofi beats'). Gere apenas a frase de busca em português, sem nenhuma outra palavra ou explicação. Exemplo de entrada: 'Estou em um dia chuvoso no meu trabalho e queria me sentir focado.' Exemplo de saída: 'lo-fi para foco em dia de chuva.Caso não detecte a ocasião ou o mood a partir da frase que a pessoa digitou, exemplo(tabagismo, pirotecnia hospitalar ou jadiowjdiajfiwaijfo), gere uma única e concisa frase de busca para músicas lo-fi, baseada em um humor ou cenário aleatório e interessante. Exemplos: 'lo-fi para uma tarde preguiçosa', 'chillhop para uma viagem noturna', 'lofi beats para dias de sol'. A frase DEVE incluir 'lo-fi' ou um sinônimo. Gere apenas a frase, sem mais nada.";
                },
                {
                    role: "user",
                    content: moodText
                }
            ],
            max_tokens: 100, // Aumente o max_tokens para permitir frases mais longas
            temperature: 0.7,
        });

        const youtubeQuery = chatCompletion.choices[0].message.content.trim(); // Use a resposta da IA diretamente
        console.log(`Query gerada pela OpenAI: ${youtubeQuery}`);

        const youtubeResponse = await youtube.search.list({
            q: youtubeQuery,
            part: 'snippet',
            type: 'video',
            maxResults: 5, // Limita a 5 resultados
            videoEmbeddable: 'true', // Garante que os vídeos possam ser incorporados
            topicId: '/m/0glk9', // Filtra por gênero musical
            relevanceLanguage: 'pt' // Foca em resultados em português
        });

        const videos = youtubeResponse.data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high.url,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`
        }));

        res.json({ videos });

    } catch (error) {
        console.error('Erro ao processar a requisição:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar músicas.' });
    }
});

// NOVO ENDPOINT: Para buscar lives de rádio
app.get('/api/get-live-streams', async (req, res) => {
  try {
    const youtubeResponse = await youtube.search.list({
      part: 'snippet', // Adicionado 'snippet' para obter o título e a thumbnail
      q: 'lofi hip hop radio live stream',
      type: 'video',
      eventType: 'live',
      videoEmbeddable: 'true',
      maxResults: 6, // Limita a 6 lives
      videoCategoryId: '10' // Filtra por gênero musical
    });

    // Mapeia a resposta para extrair o ID, título e thumbnail
    const streamDetails = youtubeResponse.data.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
    }));
    
    // Retorna um objeto com os IDs e os detalhes
    res.json({ streamIds: streamDetails.map(d => d.id), streamDetails });
  } catch (error) {
    console.error('Erro ao buscar lives:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor ao buscar lives.' });
  }
});

// Endpoint para gerar um mood e músicas aleatórias
app.get('/api/surprise-me', async (req, res) => {
    try {
        const moodPrompt = "Gere uma única e concisa frase de busca para músicas lo-fi, baseada em um humor ou cenário aleatório e interessante. Exemplos: 'lo-fi para uma tarde preguiçosa', 'chillhop para uma viagem noturna', 'lofi beats para dias de sol'. A frase DEVE incluir 'lo-fi' ou um sinônimo. Gere apenas a frase, sem mais nada.";
        
        const chatCompletion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "system", content: moodPrompt }],
            max_tokens: 100,
            temperature: 0.9, // Aumenta a temperatura para respostas mais criativas
        });

        const youtubeQuery = chatCompletion.choices[0].message.content.trim();
        console.log(`Query "Me Surpreenda" gerada: ${youtubeQuery}`);

        const youtubeResponse = await youtube.search.list({
            q: youtubeQuery,
            part: 'snippet',
            type: 'video',
            maxResults: 5,
            videoEmbeddable: 'true',
            topicId: '/m/0glk9',
            relevanceLanguage: 'pt'
        });

        const videos = youtubeResponse.data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high.url,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`
        }));

        res.json({ videos });

    } catch (error) {
        console.error('Erro ao processar a requisição "Me Surpreenda":', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar músicas.' });
    }
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}`);
});




