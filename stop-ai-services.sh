#!/bin/bash

# Script pour arrêter tous les services AI

echo "🛑 Arrêt des services AI..."

# Arrêter Claude endpoint
if [ -f "logs/claude.pid" ]; then
    PID=$(cat logs/claude.pid)
    if kill -0 $PID 2>/dev/null; then
        echo "🛑 Arrêt Claude endpoint (PID: $PID)"
        kill $PID
        rm logs/claude.pid
    fi
fi

# Arrêter Ollama
if [ -f "logs/ollama.pid" ]; then
    PID=$(cat logs/ollama.pid)
    if kill -0 $PID 2>/dev/null; then
        echo "🛑 Arrêt Ollama (PID: $PID)"
        kill $PID
        rm logs/ollama.pid
    fi
fi

# Arrêter les processus par nom si les PIDs ne fonctionnent pas
pkill -f "claude-endpoint.js" 2>/dev/null
pkill -f "ollama serve" 2>/dev/null

echo "✅ Services AI arrêtés"