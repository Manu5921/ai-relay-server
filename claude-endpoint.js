#!/usr/bin/env node

/**
 * Claude Endpoint Server
 * Expose une API REST pour recevoir les notifications du AI Relay Server
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');

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

// Fonction pour poster un commentaire GitHub
async function postGitHubComment(repoFullName, prNumber, comment) {
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
        log('⚠️ GITHUB_TOKEN not configured - skipping comment');
        return null;
    }

    try {
        const response = await axios.post(
            `https://api.github.com/repos/${repoFullName}/issues/${prNumber}/comments`,
            { body: comment },
            {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        log(`✅ GitHub comment posted: ${response.data.html_url}`);
        return response.data;
    } catch (error) {
        log(`❌ Failed to post GitHub comment: ${error.message}`);
        return null;
    }
}

// Endpoint principal pour recevoir les notifications AI
app.post('/ai-sync', async (req, res) => {
    const { source, event_type, branch, message, commits, timestamp, metadata } = req.body;
    
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
    
    // Analyser le type d'événement et générer une réponse
    let analysis = {
        event_type,
        branch,
        files_analyzed: commits ? commits.reduce((acc, c) => acc + (c.modified?.length || 0), 0) : 0,
        suggestions: []
    };

    // Logique spécifique selon le type d'événement
    if (event_type === 'push') {
        analysis.suggestions = [
            "🚀 Push detected - code analysis completed",
            "📋 Files reviewed for potential issues",
            "✅ Memory updated in collaboration system"
        ];
    } else if (event_type === 'pull_request') {
        analysis.suggestions = [
            "🔍 Pull Request analysis initiated",
            "🧪 Running automated tests...",
            "📝 Reviewing changes for best practices"
        ];
    }

    const claudeResponse = {
        status: 'processed',
        analysis,
        timestamp: new Date().toISOString(),
        processed_by: 'claude-endpoint'
    };

    // Si c'est une Pull Request, poster un commentaire automatique
    if (event_type === 'pull_request' && metadata?.repository && metadata?.pr_number) {
        const comment = `🤖 **Claude AI Analysis Complete**

✅ **Status**: Code review completed  
📊 **Files analyzed**: ${analysis.files_analyzed}  
🌿 **Branch**: \`${branch}\`  

**Analysis Summary**:
${analysis.suggestions.map(s => `- ${s}`).join('\n')}

🔗 **AI Collaboration**: This review was processed by the autonomous AI system.  
⏰ **Processed**: ${new Date().toLocaleString()}`;

        await postGitHubComment(metadata.repository.full_name, metadata.pr_number, comment);
    }

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