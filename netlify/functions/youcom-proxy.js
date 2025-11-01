/**
 * youcom-proxy.js
 * Netlify Function: OpenAI-compatible proxy for You.com API
 * 
 * - Принимает OpenAI/Continue-совместимые запросы (chat/completions)
 * - Преобразует их в формат You.com API
 * - Возвращает ответ в формате OpenAI API (choices, usage и т.д.)
 * - Поддерживает CORS, обработку ошибок, аутентификацию через X-API-Key
 * 
 * Требуется переменная окружения: YOUCOM_API_KEY
 */

const axios = require('axios');

// === Конфигурация ===
const YOUCOM_API_URL = 'https://api.you.com/v1/llm-endpoint'; // Уточните актуальный endpoint при необходимости

// --- Вспомогательные функции ---

/**
 * Оценка количества токенов (очень грубо, для usage)
 */
function estimateTokens(text) {
  if (!text) return 0;
  // Примерная оценка: 1 токен ≈ 4 символа (очень грубо)
  return Math.ceil(text.length / 4);
}

/**
 * Преобразует массив messages (OpenAI) в prompt (You.com)
 */
function messagesToPrompt(messages) {
  if (!Array.isArray(messages)) return '';
  // Простой конкат: роли и контент
  return messages.map(m => `${m.role}: ${m.content}`).join('\n') + '\nassistant:';
}

/**
 * Формирует OpenAI-совместимый ответ
 */
function formatOpenAIResponse({ prompt, completion, model = 'youcom-proxy', finish_reason = 'stop' }) {
  const prompt_tokens = estimateTokens(prompt);
  const completion_tokens = estimateTokens(completion);
  return {
    id: 'youcom-proxy-' + Date.now(),
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: completion
        },
        finish_reason
      }
    ],
    usage: {
      prompt_tokens,
      completion_tokens,
      total_tokens: prompt_tokens + completion_tokens
    }
  };
}

/**
 * CORS headers для всех ответов
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// --- Основная функция (Modern Netlify Functions) ---
export default async (request, context) => {
  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response('', { status: 200, headers: corsHeaders });
  }

  // Проверка метода
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Проверка наличия API-ключа
  const YOUCOM_API_KEY = process.env.YOUCOM_API_KEY;
  if (!YOUCOM_API_KEY) {
    return new Response(JSON.stringify({ error: 'You.com API key not set in environment variables.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  let body;
  try {
    body = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON in request body.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Поддержка как chat (messages), так и prompt (legacy)
  let prompt = '';
  if (body.messages) {
    prompt = messagesToPrompt(body.messages);
  } else if (body.prompt) {
    prompt = body.prompt;
  } else {
    return new Response(JSON.stringify({ error: 'No prompt or messages provided.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Формируем запрос к You.com API
  try {
    const youcomResponse = await axios.post(
      YOUCOM_API_URL,
      { prompt }, // Можно добавить другие параметры, если поддерживаются
      {
        headers: {
          'X-API-Key': YOUCOM_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 секунд
      }
    );

    // Проверка структуры ответа
    const completion = youcomResponse.data?/**
 * youcom-proxy.js
 * Netlify Function: OpenAI-compatible proxy for You.com API
 * 
 * - Принимает OpenAI/Continue-совместимые запросы (chat/completions)
 * - Преобразует их в формат You.com API
 * - Возвращает ответ в формате OpenAI API (choices, usage и т.д.)
 * - Поддерживает CORS, обработку ошибок, аутентификацию через X-API-Key
 * 
 * Требуется переменная окружения: YOUCOM_API_KEY
 */

const axios = require('axios');

// === Конфигурация ===
const YOUCOM_API_URL = 'https://api.you.com/v1/llm-endpoint'; // Уточните актуальный endpoint при необходимости

// --- Вспомогательные функции ---

/**
 * Оценка количества токенов (очень грубо, для usage)
 */
function estimateTokens(text) {
  if (!text) return 0;
  // Примерная оценка: 1 токен ≈ 4 символа (очень грубо)
  return Math.ceil(text.length / 4);
}

/**
 * Преобразует массив messages (OpenAI) в prompt (You.com)
 */
function messagesToPrompt(messages) {
  if (!Array.isArray(messages)) return '';
  // Простой конкат: роли и контент
  return messages.map(m => `${m.role}: ${m.content}`).join('\n') + '\nassistant:';
}

/**
 * Формирует OpenAI-совместимый ответ
 */
function formatOpenAIResponse({ prompt, completion, model = 'youcom-proxy', finish_reason = 'stop' }) {
  const prompt_tokens = estimateTokens(prompt);
  const completion_tokens = estimateTokens(completion);
  return {
    id: 'youcom-proxy-' + Date.now(),
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: completion
        },
        finish_reason
      }
    ],
    usage: {
      prompt_tokens,
      completion_tokens,
      total_tokens: prompt_tokens + completion_tokens
    }
  };
}

/**
 * CORS headers для всех ответов
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// --- Основная функция (Modern Netlify Functions) ---
export default async (request, context) => {
  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response('', { status: 200, headers: corsHeaders });
  }

  // Проверка метода
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Проверка наличия API-ключа
  const YOUCOM_API_KEY = process.env.YOUCOM_API_KEY;
  if (!YOUCOM_API_KEY) {
    return new Response(JSON.stringify({ error: 'You.com API key not set in environment variables.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  let body;
  try {
    body = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON in request body.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Поддержка как chat (messages), так и prompt (legacy)
  let prompt = '';
  if (body.messages) {
    prompt = messagesToPrompt(body.messages);
  } else if (body.prompt) {
    prompt = body.prompt;
  } else {
    return new Response(JSON.stringify({ error: 'No prompt or messages provided.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Формируем запрос к You.com API
  try {
    const youcomResponse = await axios.post(
      YOUCOM_API_URL,
      { prompt }, // Можно добавить другие параметры, если поддерживаются
      {
        headers: {
          'X-API-Key': YOUCOM_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 секунд
      }
    );

    // Проверка структуры ответа
    const completion = youcomResponse.data?.result || youcomResponse.data?.completion || '';
    if (!completion) {
      return new Response(JSON.stringify({ error: 'No completion returned from You.com API.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Формируем OpenAI-совместимый ответ
    const openaiResponse = formatOpenAIResponse({
      prompt,
      completion,
      model: body.model || 'youcom-proxy'
    });

    return new Response(JSON.stringify(openaiResponse), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    // Обработка ошибок сети, лимитов, аутентификации
    let status = 500;
    let message = 'Unknown error';
    if (error.response) {
      status = error.response.status;
      if (status === 401 || status === 403) {
        message = 'Authentication failed with You.com API.';
      } else if (status === 429) {
        message = 'You.com API rate limit exceeded.';
      } else {
        message = error.response.data?.error || error.response.statusText || 'You.com API error';
      }
    } else if (error.code === 'ECONNABORTED') {
      status = 504;
      message = 'You.com API request timed out.';
    } else {
      message = error.message;
    }
    // Логирование (можно убрать в проде)
    console.error('You.com Proxy Error:', message, error?.response?.data || error);

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

// --- Legacy Netlify Functions (exports.handler) ---
exports.handler = async function(event, context) {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const YOUCOM_API_KEY = process.env.YOUCOM_API_KEY;
  if (!YOUCOM_API_KEY) {
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'You.com API key not set in environment variables.' })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid JSON in request body.' })
    };
  }

  let prompt = '';
  if (body.messages) {
    prompt = messagesToPrompt(body.messages);
  } else if (body.prompt) {
    prompt = body.prompt;
  } else {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'No prompt or messages provided.' })
    };
  }

  try {
    const youcomResponse = await axios.post(
      YOUCOM_API_URL,
      { prompt },
      {
        headers: {
          'X-API-Key': YOUCOM_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    const completion = youcomResponse.data?.result || youcomResponse.data?.completion || '';
    if (!completion) {
      return {
        statusCode: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'No completion returned from You.com API.' })
      };
    }

    const openaiResponse = formatOpenAIResponse({
      prompt,
      completion,
      model: body.model || 'youcom-proxy'
    });

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(openaiResponse)
    };

  } catch (error) {
    let status = 500;
    let message = 'Unknown error';
    if (error.response) {
      status = error.response.status;
      if (status === 401 || status === 403) {
        message = 'Authentication failed with You.com API.';
      } else if (status === 429) {
        message = 'You.com API rate limit exceeded.';
      } else {
        message = error.response.data?.error || error.response.statusText || 'You.com API error';
      }
    } else if (error.code === 'ECONNABORTED') {
      status = 504;
      message = 'You.com API request timed out.';
    } else {
      message = error.message;
    }
    console.error('You.com Proxy Error:', message, error?.response?.data || error);

    return {
      statusCode: status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: message })
    };
  }
};
.result || youcomResponse.data?.completion || '';
    if (!completion) {
      return new Response(JSON.stringify({ error: 'No completion returned from You.com API.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Формируем OpenAI-совместимый ответ
    const openaiResponse = formatOpenAIResponse({
      prompt,
      completion,
      model: body.model || 'youcom-proxy'
    });

    return new Response(JSON.stringify(openaiResponse), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    // Обработка ошибок сети, лимитов, аутентификации
    let status = 500;
    let message = 'Unknown error';
    if (error.response) {
      status = error.response.status;
      if (status === 401 || status === 403) {
        message = 'Authentication failed with You.com API.';
      } else if (status === 429) {
        message = 'You.com API rate limit exceeded.';
      } else {
        message = error.response.data?.error || error.response.statusText || 'You.com API error';
      }
    } else if (error.code === 'ECONNABORTED') {
      status = 504;
      message = 'You.com API request timed out.';
    } else {
      message = error.message;
    }
    // Логирование (можно убрать в проде)
    console.error('You.com Proxy Error:', message, error?.response?.data || error);

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

// --- Legacy Netlify Functions (exports.handler) ---
exports.handler = async function(event, context) {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const YOUCOM_API_KEY = process.env.YOUCOM_API_KEY;
  if (!YOUCOM_API_KEY) {
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'You.com API key not set in environment variables.' })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid JSON in request body.' })
    };
  }

  let prompt = '';
  if (body.messages) {
    prompt = messagesToPrompt(body.messages);
  } else if (body.prompt) {
    prompt = body.prompt;
  } else {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'No prompt or messages provided.' })
    };
  }

  try {
    const youcomResponse = await axios.post(
      YOUCOM_API_URL,
      { prompt },
      {
        headers: {
          'X-API-Key': YOUCOM_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    const completion = youcomResponse.data?.result || youcomResponse.data?.completion || '';
    if (!completion) {
      return {
        statusCode: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'No completion returned from You.com API.' })
      };
    }

    const openaiResponse = formatOpenAIResponse({
      prompt,
      completion,
      model: body.model || 'youcom-proxy'
    });

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(openaiResponse)
    };

  } catch (error) {
    let status = 500;
    let message = 'Unknown error';
    if (error.response) {
      status = error.response.status;
      if (status === 401 || status === 403) {
        message = 'Authentication failed with You.com API.';
      } else if (status === 429) {
        message = 'You.com API rate limit exceeded.';
      } else {
        message = error.response.data?.error || error.response.statusText || 'You.com API error';
      }
    } else if (error.code === 'ECONNABORTED') {
      status = 504;
      message = 'You.com API request timed out.';
    } else {
      message = error.message;
    }
    console.error('You.com Proxy Error:', message, error?.response?.data || error);

    return {
      statusCode: status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: message })
    };
  }
};

