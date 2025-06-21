#!/bin/bash

# Script pour démarrer tous les services AI sur le Mac

echo "🚀 Démarrage des services AI..."

# Créer les répertoires de logs
mkdir -p logs

# Fonction pour vérifier si un port est utilisé
check_port() {
    lsof -ti:$1 > /dev/null 2>&1
}

# 1. Vérifier/Démarrer Ollama
echo "🔍 Vérification Ollama (port 11434)..."
if check_port 11434; then
    echo "✅ Ollama déjà actif"
else
    echo "🚀 Démarrage Ollama..."
    ollama serve > logs/ollama.log 2>&1 &
    echo $! > logs/ollama.pid
    sleep 3
fi

# 2. Installer les dépendances pour Claude endpoint si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install express cors
fi

# 3. Démarrer Claude endpoint
echo "🔍 Vérification Claude endpoint (port 5050)..."
if check_port 5050; then
    echo "⚠️  Port 5050 déjà utilisé, arrêt du processus..."
    pkill -f "claude-endpoint.js"
    sleep 2
fi

echo "🚀 Démarrage Claude endpoint..."
node claude-endpoint.js > logs/claude.log 2>&1 &
echo $! > logs/claude.pid
sleep 2

# 4. Vérifier les services
echo "🔍 Vérification des services..."

if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Ollama API (11434) : Actif"
else
    echo "❌ Ollama API non accessible"
fi

if curl -s http://localhost:5050/health > /dev/null; then
    echo "✅ Claude Endpoint (5050) : Actif"
else
    echo "❌ Claude Endpoint non accessible"
fi

echo ""
echo "📋 Services démarrés:"
echo "   - Ollama: http://localhost:11434"
echo "   - Claude: http://localhost:5050"
echo ""
echo "📁 Logs dans: ./logs/"
echo "🛑 Pour arrêter: ./stop-ai-services.sh"
echo ""
echo "🚇 Lance maintenant le tunnel SSH:"
echo "   ./setup-tunnel.sh"