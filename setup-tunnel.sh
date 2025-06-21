#!/bin/bash

# Script de tunnel SSH : Mac → VPS
# Expose les services locaux (Claude/Ollama) sur le VPS

VPS_IP="89.117.61.193"
VPS_USER="admin"
SSH_KEY="~/.ssh/contabo_key"

echo "🚇 Configuration du tunnel SSH Mac → VPS"
echo "📍 VPS: $VPS_IP"
echo "🔧 Services à exposer:"
echo "   - Ollama (11434) → VPS:4003"
echo "   - Claude (5050) → VPS:5050"

# Test de connectivité VPS
echo "🔐 Test connexion VPS..."
if ssh -i $SSH_KEY -o ConnectTimeout=10 $VPS_USER@$VPS_IP "echo 'SSH OK'"; then
    echo "✅ Connexion VPS OK"
else
    echo "❌ Impossible de se connecter au VPS"
    exit 1
fi

# Vérifier les services locaux
echo "🔍 Vérification services locaux..."

if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama (11434) : Actif"
else
    echo "⚠️  Ollama (11434) : Non accessible"
    echo "   Démarre Ollama avec: ollama serve"
fi

if curl -s http://localhost:5050/health > /dev/null 2>&1; then
    echo "✅ Claude (5050) : Actif"
else
    echo "⚠️  Claude (5050) : Non accessible"
    echo "   Démarre ton endpoint Claude sur le port 5050"
fi

echo ""
echo "🚇 Création du tunnel SSH..."
echo "💡 Garde ce terminal ouvert pour maintenir le tunnel"
echo ""

# Créer le tunnel SSH avec reverse port forwarding
ssh -i $SSH_KEY \
    -R *:4003:localhost:11434 \
    -R *:5050:localhost:5050 \
    -N \
    -o ServerAliveInterval=30 \
    -o ServerAliveCountMax=3 \
    $VPS_USER@$VPS_IP

echo "🚇 Tunnel fermé"