/**
 * AI Relay Server - GitHub Webhook to AI Endpoints
 * Handles communication between Jules (GitHub) → Claude + Ollama
 */

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const axios = require('axios')

const app = express()
const PORT = process.env.PORT || 4000

// Security & middleware
app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Configuration
const CONFIG = {
  claude: {
    url: process.env.CLAUDE_ENDPOINT || 'http://localhost:5050',
    timeout: 30000
  },
  ollama: {
    url: process.env.OLLAMA_ENDPOINT || 'http://localhost:4003',
    timeout: 15000
  },
  security: {
    github_secret: process.env.GITHUB_WEBHOOK_SECRET,
    allowed_origins: ['github.com']
  }
}

// Logging utility
const log = (level, message, data = {}) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, 
              Object.keys(data).length > 0 ? JSON.stringify(data, null, 2) : '')
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    server: 'ai-relay-server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      claude: CONFIG.claude.url,
      ollama: CONFIG.ollama.url
    }
  })
})

// Main GitHub webhook handler
app.post('/github-webhook', async (req, res) => {
  const startTime = Date.now()
  log('info', '🔄 GitHub webhook received', { 
    headers: req.headers,
    body: req.body 
  })

  try {
    // Parse GitHub payload
    const payload = parseGitHubPayload(req.body, req.headers)
    
    if (!payload) {
      log('warn', '⚠️ Invalid payload format')
      return res.status(400).json({ error: 'Invalid payload' })
    }

    log('info', '✅ Payload parsed', payload)

    // Handle ping events differently (no AI notification needed)
    if (payload.type === 'ping') {
      log('info', '🏓 GitHub ping received', { zen: payload.zen })
      return res.json({
        status: 'pong',
        message: 'Webhook active and healthy',
        zen: payload.zen,
        timestamp: new Date().toISOString()
      })
    }

    // Parallel notification to Claude and Ollama for actual events
    const [claudeResult, ollamaResult] = await Promise.allSettled([
      notifyClaude(payload),
      notifyOllama(payload)
    ])

    // Log results
    log('info', '📊 Notification results', {
      claude: claudeResult.status,
      ollama: ollamaResult.status,
      duration: `${Date.now() - startTime}ms`
    })

    res.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      duration: `${Date.now() - startTime}ms`,
      notifications: {
        claude: claudeResult.status === 'fulfilled' ? 'success' : 'failed',
        ollama: ollamaResult.status === 'fulfilled' ? 'success' : 'failed'
      }
    })

  } catch (error) {
    log('error', '💥 Webhook processing error', { error: error.message })
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
})

// Parse GitHub webhook payload
function parseGitHubPayload(body, headers) {
  try {
    // Handle different GitHub event types
    const eventType = headers['x-github-event']
    
    // GitHub ping event (webhook test)
    if (eventType === 'ping') {
      return {
        type: 'ping',
        from: 'github',
        message: 'Webhook connection test',
        repository: body.repository?.name,
        hook_id: body.hook_id,
        zen: body.zen,
        timestamp: new Date().toISOString()
      }
    }
    
    if (eventType === 'push') {
      return {
        type: 'push',
        from: 'jules',
        branch: body.ref?.replace('refs/heads/', ''),
        commits: body.commits || [],
        repository: body.repository?.name,
        message: body.head_commit?.message || '',
        author: body.head_commit?.author?.name || '',
        timestamp: new Date().toISOString()
      }
    }
    
    if (eventType === 'pull_request') {
      return {
        type: 'pull_request',
        from: 'jules',
        action: body.action,
        pr_number: body.number,
        title: body.pull_request?.title,
        body: body.pull_request?.body,
        branch: body.pull_request?.head?.ref,
        repository: body.repository?.name,
        message: body.pull_request?.title || '',
        author: body.pull_request?.user?.login,
        commits: [], // PRs don't have commits in the payload
        timestamp: new Date().toISOString()
      }
    }

    // Manual webhook for testing
    if (body.branch && body.commit_message) {
      return {
        type: 'manual',
        from: 'jules',
        branch: body.branch,
        message: body.commit_message,
        timestamp: new Date().toISOString()
      }
    }

    return null
  } catch (error) {
    log('error', 'Payload parsing error', { error: error.message })
    return null
  }
}

// Notify Claude endpoint
async function notifyClaude(payload) {
  log('info', '🤖 Notifying Claude...', { url: CONFIG.claude.url })
  
  try {
    const claudePayload = {
      source: 'github-jules',
      event_type: payload.type,
      branch: payload.branch,
      message: payload.message,
      commits: payload.commits,
      timestamp: payload.timestamp,
      metadata: {
        repository: { 
          name: payload.repository,
          full_name: `Manu5921/${payload.repository}` // Hardcoded for now
        },
        author: payload.author,
        pr_number: payload.pr_number,
        action: payload.action
      }
    }

    const response = await axios.post(
      `${CONFIG.claude.url}/ai-sync`,
      claudePayload,
      {
        timeout: CONFIG.claude.timeout,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AI-Relay-Server/1.0'
        }
      }
    )

    log('info', '✅ Claude notification successful', { 
      status: response.status,
      data: response.data 
    })
    
    return response.data
  } catch (error) {
    log('error', '❌ Claude notification failed', { 
      error: error.message,
      url: CONFIG.claude.url 
    })
    throw error
  }
}

// Notify Ollama endpoint
async function notifyOllama(payload) {
  log('info', '🦙 Notifying Ollama...', { url: CONFIG.ollama.url })
  
  try {
    const ollamaPayload = {
      context: `Jules update: ${payload.message}`,
      branch: payload.branch,
      event_type: payload.type,
      timestamp: payload.timestamp,
      metadata: {
        commits_count: payload.commits?.length || 0,
        repository: payload.repository
      }
    }

    const response = await axios.post(
      `${CONFIG.ollama.url}/memory-update`,
      ollamaPayload,
      {
        timeout: CONFIG.ollama.timeout,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AI-Relay-Server/1.0'
        }
      }
    )

    log('info', '✅ Ollama notification successful', { 
      status: response.status,
      data: response.data 
    })
    
    return response.data
  } catch (error) {
    log('error', '❌ Ollama notification failed', { 
      error: error.message,
      url: CONFIG.ollama.url 
    })
    throw error
  }
}

// Test endpoint for manual webhooks
app.post('/test-webhook', async (req, res) => {
  log('info', '🧪 Test webhook triggered')
  
  const testPayload = {
    branch: req.body.branch || 'jules-test',
    commit_message: req.body.message || 'Test commit from AI relay'
  }

  // Simulate GitHub webhook
  req.body = testPayload
  req.headers['x-github-event'] = 'push'
  
  // Forward to main handler
  return await app._router.handle(
    { ...req, url: '/github-webhook', method: 'POST' },
    res
  )
})

// Error handling
app.use((error, req, res, next) => {
  log('error', 'Unhandled error', { error: error.message })
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  })
})

// 404 handler
app.use((req, res) => {
  log('warn', '404 - Route not found', { 
    method: req.method, 
    url: req.url 
  })
  res.status(404).json({ 
    error: 'Route not found',
    available_endpoints: [
      'GET /health',
      'POST /github-webhook', 
      'POST /test-webhook'
    ]
  })
})

// Start server
app.listen(PORT, () => {
  log('info', `🚀 AI Relay Server started on port ${PORT}`)
  log('info', '📋 Configuration', CONFIG)
  log('info', '🔗 Available endpoints:', {
    health: `http://localhost:${PORT}/health`,
    webhook: `http://localhost:${PORT}/github-webhook`,
    test: `http://localhost:${PORT}/test-webhook`
  })
})

module.exports = app