require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для парсинга JSON
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Вспомогательная функция для преобразования messages в prompt
function messagesToPrompt(messages) {
  if (!Array.isArray(messages)) return '';
  return messages.map(m => `${m.role}: ${m.content}`).join('\n') + '\nassistant:';
}

// === ОСНОВНОЙ РОУТ ПРОКСИ ===
app.post('/youcom-proxy', async (req, res) => {
  console.log('📥 Received request:', JSON.stringify(req.body, null, 2));

  const YOUCOM_API_KEY = process.env.YOUCOM_API_KEY;
  
  if (!YOUCOM_API_KEY) {
    console.error('❌ YOUCOM_API_KEY not set');
    return res.status(500).json({ error: 'You.com API key not configured' });
  }

  // Извлечение prompt из запроса
  let prompt = '';
  if (req.body.messages) {
    prompt = messagesToPrompt(req.body.messages);
  } else if (req.body.prompt) {
    prompt = req.body.prompt;
  } else {
    return res.status(400).json({ error: 'No prompt or messages provided' });
  }

  console.log('📤 Sending to You.com API:', prompt.substring(0, 100) + '...');

  try {
    // ВНИМАНИЕ: Замените URL на актуальный endpoint You.com API
    const youcomResponse = await axios.post(
      'https://api.you.com/smart/agent', // Проверьте правильный endpoint!
      {
        query: prompt,
        // Можно добавить другие параметры, если требуются
      },
      {
        headers: {
          'X-API-Key': YOUCOM_API_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 секунд
      }
    );

    console.log('✅ Response from You.com:', youcomResponse.status);

    // Извлечение ответа (структура может отличаться!)
    const completion = youcomResponse.data?.message || 
                      youcomResponse.data?.answer || 
                      youcomResponse.data?.result || 
                      youcomResponse.data?.completion ||
                      JSON.stringify(youcomResponse.data);

    if (!completion) {
      console.error('❌ No completion in response:', youcomResponse.data);
      return res.status(502).json({ 
        error: 'No completion returned from You.com API',
        debug: youcomResponse.data 
      });
    }

    // Формируем OpenAI-совместимый ответ
    const response = {
      id: 'youcom-proxy-' + Date.now(),
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: req.body.model || 'youcom-proxy',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: completion,
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: Math.ceil(prompt.length / 4),
        completion_tokens: Math.ceil(completion.length / 4),
        total_tokens: Math.ceil((prompt.length + completion.length) / 4),
      },
    };

    console.log('📨 Sending response');
    return res.json(response);

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    let status = 500;
    let message = 'Internal server error';

    if (error.response) {
      status = error.response.status;
      message = error.response.data?.error || error.response.statusText || 'You.com API error';
      console.error('API Response:', error.response.data);
    } else if (error.code === 'ECONNABORTED') {
      status = 504;
      message = 'Request timeout';
    } else {
      message = error.message;
    }

    return res.status(status).json({ 
      error: message,
      debug: error.response?.data 
    });
  }
});

// === ТЕСТОВЫЙ РОУТ (для проверки, что сервер работает) ===
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// === ROOT РОУТ ===
app.get('/', (req, res) => {
  res.json({ 
    message: 'You.com Proxy Server',
    endpoints: {
      proxy: 'POST /youcom-proxy',
      health: 'GET /health'
    }
  });
});

// === СТАРТ СЕРВЕРА ===
app.listen(PORT, () => {
  console.log('🚀 Local proxy running on http://localhost:' + PORT);
  console.log('📍 Endpoints:');
  console.log('   POST http://localhost:' + PORT + '/youcom-proxy');
  console.log('   GET  http://localhost:' + PORT + '/health');
  console.log('   GET  http://localhost:' + PORT + '/');
});

