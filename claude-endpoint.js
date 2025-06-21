#!/usr/bin/env node

/**
 * Claude Endpoint Server
 * Expose une API REST pour recevoir les notifications du AI Relay Server
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5050;

// Middleware
app.use(cors());
app.use(express.json());

// Logs avec timestamp
const log = (message) => {
    console.log(`[${new Date().toISOString()}] ${message}`);
};

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'claude-endpoint',
        timestamp: new Date().toISOString()
    });
});

// Endpoint principal pour recevoir les notifications AI
app.post('/ai-sync', (req, res) => {
    const { source, event_type, branch, message, commits, timestamp } = req.body;
    
    log(`📨 Notification reçue de ${source}`);
    log(`🔄 Type: ${event_type}`);
    log(`🌿 Branch: ${branch}`);
    log(`📝 Message: ${message}`);
    
    if (commits && commits.length > 0) {
        log(`📦 Commits (${commits.length}):`);
        commits.forEach(commit => {
            log(`   • ${commit.id}: ${commit.message}`);
            if (commit.modified) {
                log(`     Fichiers: ${commit.modified.join(', ')}`);
            }
        });
    }

    // Ici tu peux ajouter ta logique Claude
    // Par exemple : analyser le code, générer des tests, etc.
    
    // Simulation d'une réponse Claude
    const claudeResponse = {
        status: 'processed',
        analysis: {
            event_type,
            branch,
            files_analyzed: commits ? commits.reduce((acc, c) => acc + (c.modified?.length || 0), 0) : 0,
            suggestions: [
                "Code looks good! 👍",
                "Consider adding tests for new features",
                "Documentation updated as needed"
            ]
        },
        timestamp: new Date().toISOString(),
        processed_by: 'claude-endpoint'
    };

    log(`✅ Traitement terminé`);
    res.json(claudeResponse);
});

// Endpoint pour les tests
app.post('/test', (req, res) => {
    log(`🧪 Test reçu: ${JSON.stringify(req.body)}`);
    res.json({ 
        status: 'test-ok', 
        received: req.body,
        timestamp: new Date().toISOString()
    });
});

// Page d'accueil
app.get('/', (req, res) => {
    res.json({
        service: 'Claude Endpoint Server',
        version: '1.0.0',
        endpoints: {
            health: 'GET /health',
            ai_sync: 'POST /ai-sync',
            test: 'POST /test'
        },
        status: 'running'
    });
});

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
    log(`🚀 Claude Endpoint Server démarré`);
    log(`📍 Port: ${PORT}`);
    log(`🔗 Health: http://localhost:${PORT}/health`);
    log(`🔗 AI Sync: http://localhost:${PORT}/ai-sync`);
    log(`💡 Prêt à recevoir les notifications AI !`);
});

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
    log('🛑 Arrêt du serveur Claude Endpoint...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    log('🛑 Arrêt du serveur Claude Endpoint...');
    process.exit(0);
});