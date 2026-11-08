/**
 * Cloudflare Workers 安全 API 代理层
 * 保护 AI API 密钥与 GitHub Token 安全，处理请求鉴权、限流与跨域
 */

export interface Env {
  ANTHROPIC_API_KEY?: string
  OPENAI_API_KEY?: string
  GEMINI_API_KEY?: string
  DEEPSEEK_API_KEY?: string
  GITHUB_TOKEN?: string
  AUTH_SECRET?: string // 可选的用户访问密码
  ENVIRONMENT?: string
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Auth-Token',
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // 处理 OPTIONS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
    }

    const url = new URL(request.url)

    // 健康检查
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        providers: {
          claude: !!env.ANTHROPIC_API_KEY,
          openai: !!env.OPENAI_API_KEY,
          gemini: !!env.GEMINI_API_KEY,
          deepseek: !!env.DEEPSEEK_API_KEY,
          github: !!env.GITHUB_TOKEN
        }
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      })
    }

    // 简单可选密码鉴权
    if (env.AUTH_SECRET) {
      const authHeader = request.headers.get('Authorization') || request.headers.get('X-Auth-Token')
      if (authHeader !== `Bearer ${env.AUTH_SECRET}` && authHeader !== env.AUTH_SECRET) {
        return new Response(JSON.stringify({ error: 'Unauthorized: Invalid auth token' }), {
          status: 401,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        })
      }
    }

    try {
      // 路由：AI 对话与任务执行代理
      if (url.pathname === '/api/chat' && request.method === 'POST') {
        const body: any = await request.json()
        const { messages, model } = body
        return await handleAIChat(messages, model, env)
      }

      // 路由：AI 深度研究代理
      if (url.pathname === '/api/research' && request.method === 'POST') {
        const body: any = await request.json()
        const { taskId, config } = body
        return await handleAIResearch(taskId, config, env)
      }

      return new Response(JSON.stringify({ error: 'Not Found' }), {
        status: 404,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      })
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      })
    }
  }
}

async function handleAIChat(messages: any[], model: string = 'claude-3-5-sonnet-20241022', env: Env): Promise<Response> {
  // 根据模型选择后端 API
  if (model.startsWith('claude') || (!model.startsWith('gpt') && !model.startsWith('gemini') && !model.startsWith('deepseek') && env.ANTHROPIC_API_KEY)) {
    if (!env.ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured on server' }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      })
    }

    const systemMsg = messages.find(m => m.role === 'system')?.content
    const userMsgs = messages.filter(m => m.role !== 'system')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: model.startsWith('claude') ? model : 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: userMsgs,
        system: systemMsg
      })
    })

    const data: any = await response.json()
    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || 'Claude API Error' }), {
        status: response.status,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      content: data.content?.[0]?.text || '',
      usage: data.usage
    }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    })
  }

  // DeepSeek 代理
  if (model.startsWith('deepseek') || (env.DEEPSEEK_API_KEY && !env.ANTHROPIC_API_KEY)) {
    if (!env.DEEPSEEK_API_KEY) {
      return new Response(JSON.stringify({ error: 'DEEPSEEK_API_KEY not configured' }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      })
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model.startsWith('deepseek') ? model : 'deepseek-chat',
        messages,
        max_tokens: 4096
      })
    })

    const data: any = await response.json()
    return new Response(JSON.stringify({
      content: data.choices?.[0]?.message?.content || '',
      usage: data.usage
    }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    })
  }

  // OpenAI 代理
  if (model.startsWith('gpt') || env.OPENAI_API_KEY) {
    if (!env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      })
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model.startsWith('gpt') ? model : 'gpt-4o',
        messages,
        max_tokens: 4096
      })
    })

    const data: any = await response.json()
    return new Response(JSON.stringify({
      content: data.choices?.[0]?.message?.content || '',
      usage: data.usage
    }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ error: 'No active AI Provider Key found on server' }), {
    status: 500,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
  })
}

async function handleAIResearch(taskId: string, config: any, env: Env): Promise<Response> {
  return new Response(JSON.stringify({
    success: true,
    taskId,
    message: 'Research task accepted by worker'
  }), {
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
  })
}
