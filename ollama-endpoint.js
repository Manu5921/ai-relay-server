#!/usr/bin/env node

/**
 * Ollama Endpoint - Local Memory Management Service
 * Reçoit les notifications du AI Relay Server
 */

const express = require('express')
const cors = require('cors')
const axios = require('axios')

const app = express()
const PORT = 4003 // Port mappé par le tunnel SSH

// Middleware
app.use(cors())
app.use(express.json())

// Configuration Ollama
const OLLAMA_BASE_URL = 'http://localhost:11434'

// Logging utility
const log = (level, message, data = {}) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] [OLLAMA-${level.toUpperCase()}] ${message}`,
              Object.keys(data).length > 0 ? JSON.stringify(data, null, 2) : '')
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ollama-endpoint',
    timestamp: new Date().toISOString(),
    ollama_url: OLLAMA_BASE_URL
  })
})

// Memory update endpoint (équivalent à /ai-sync pour Claude)
app.post('/memory-update', async (req, res) => {
  const { context, branch, event_type, timestamp, metadata } = req.body
  
  log('info', '🧠 Memory update received', {
    event_type,
    branch,
    context: context?.substring(0, 100) + '...',
    commits_count: metadata?.commits_count
  })

  try {
    // Vérifier que Ollama est accessible
    const ollamaHealth = await axios.get(`${OLLAMA_BASE_URL}/api/tags`)
    
    // Simuler une mise à jour mémoire
    const memoryUpdate = {
      status: 'success',
      processed_at: new Date().toISOString(),
      event: {
        type: event_type,
        branch,
        context_length: context?.length || 0,
        commits_processed: metadata?.commits_count || 0
      },
      ollama: {
        models: ollamaHealth.data.models?.length || 0,
        available: true
      }
    }

    log('info', '✅ Memory updated successfully', memoryUpdate)
    
    res.json({
      status: 'success',
      message: 'Memory update processed',
      data: memoryUpdate
    })

  } catch (error) {
    log('error', '❌ Memory update failed', { error: error.message })
    
    res.status(500).json({
      status: 'error',
      message: 'Memory update failed',
      error: error.message
    })
  }
})

// Proxy vers Ollama API
app.use('/api', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${OLLAMA_BASE_URL}/api${req.path}`,
      data: req.body,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    res.json(response.data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Démarrer le serveur
app.listen(PORT, () => {
  log('info', `🦙 Ollama Endpoint started on http://localhost:${PORT}`)
  log('info', `🔗 Proxying Ollama API from ${OLLAMA_BASE_URL}`)
})

// Gestion des erreurs
process.on('uncaughtException', (error) => {
  log('error', '💥 Uncaught Exception', { error: error.message })
  process.exit(1)
})

process.on('unhandledRejection', (error) => {
  log('error', '💥 Unhandled Rejection', { error: error.message })
  process.exit(1)
})