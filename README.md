# 🤖 AI Relay Server

**Système de collaboration AI autonome** entre Claude, Jules (Google AI), et Ollama.

![Status](https://img.shields.io/badge/Status-OPERATIONAL-brightgreen)
![GitHub Webhook](https://img.shields.io/badge/GitHub_Webhook-ACTIVE-blue)
![AI Collaboration](https://img.shields.io/badge/AI_Collaboration-AUTONOMOUS-purple)

## 🎯 Mission Accomplie (21 Juin 2025)

✅ **Système entièrement déployé et fonctionnel !**  
✅ **GitHub Webhook connecté et testé**  
✅ **Communication Claude ↔ Ollama validée**  
✅ **Tunnel SSH Mac ↔ VPS opérationnel**  
✅ **Déploiement Coolify avec Docker Compose**

## 🏗️ Architecture Complète

```
🌍 GitHub (Jules Push/PR)
       ↓ webhook
📡 AI Relay Server (VPS Contabo)
   http://89.117.61.193:4200
       ↓ tunnel SSH  
🖥️  Mac Mini M4 (Services locaux)
   ├── 🤖 Claude Endpoint (5050)
   └── 🦙 Ollama Endpoint (8090)
```

## 🚀 Fonctionnalités Actives

### Core System
- ✅ **GitHub Webhooks** : Push, Pull Requests, Issue Comments
- ✅ **AI Routing** : Notifications intelligentes vers Claude et Ollama
- ✅ **Auto Comments** : Claude poste des commentaires automatiques sur les PR
- ✅ **Memory Sync** : Ollama maintient la mémoire collaborative
- ✅ **Health Monitoring** : Surveillance temps réel de tous les services

### Security & Reliability
- ✅ **SSH Tunnel** : Communication sécurisée Mac ↔ VPS
- ✅ **Docker Host Network** : Configuration réseau optimisée
- ✅ **GitHub Secret Validation** : Sécurité des webhooks
- ✅ **Error Handling** : Gestion robuste des erreurs et timeouts

## 📊 Services & Status

| Service | URL | Status | Description |
|---------|-----|---------|-------------|
| **AI Relay Server** | http://89.117.61.193:4200 | 🟢 ACTIVE | Serveur principal VPS |
| **Claude Endpoint** | http://localhost:5050 | 🟢 ACTIVE | Analyse et coordination |
| **Ollama Endpoint** | http://localhost:8090 | 🟢 ACTIVE | Gestion mémoire collaborative |
| **Coolify Dashboard** | http://89.117.61.193:8000 | 🟢 ACTIVE | Interface de déploiement |
| **GitHub Webhook** | Repository Settings | 🟢 ACTIVE | Déclencheur automatique |

## 🔧 Configuration Technique

### Variables d'environnement (Production)
```bash
NODE_ENV=production
PORT=4200
CLAUDE_ENDPOINT=http://localhost:5050
OLLAMA_ENDPOINT=http://localhost:8091
GITHUB_WEBHOOK_SECRET=ai-relay-production
```

### Ports & Network
```bash
# VPS (Contabo)
4200 → AI Relay Server (externe)

# Mac Mini M4 (via tunnel SSH)
5050 → Claude Endpoint
8090 → Ollama Endpoint  
11434 → Ollama API

# Tunnel SSH mapping
Mac:5050 → VPS:5050   (Claude)
Mac:8090 → VPS:8091   (Ollama)
```

## 🧪 Tests Validés

### ✅ End-to-End Testing
- **GitHub Push** → Webhook → Claude + Ollama ✅
- **GitHub PR** → Auto-comment par Claude ✅  
- **Manual Test** → curl test-webhook ✅
- **Health Checks** → Tous services OK ✅
- **SSH Tunnel** → Communication stable ✅

### 📋 Test Commands
```bash
# Test santé général
curl http://89.117.61.193:4200/health

# Test communication complète
curl -X POST http://89.117.61.193:4200/test-webhook \
  -H "Content-Type: application/json" \
  -d '{"test":"system-check"}'

# Simulation webhook GitHub
./test-pr-webhook.sh
```

## 📁 Structure du Projet

```
ai-relay-server/
├── index.js                 # 📡 AI Relay Server principal
├── claude-endpoint.js       # 🤖 Service Claude local
├── ollama-endpoint.js       # 🦙 Service Ollama local
├── docker-compose.yaml      # 🐳 Config Docker Compose
├── package.json             # 📦 Dépendances Node.js
├── Dockerfile              # 🏗️ Image Docker
├── setup-tunnel.sh         # 🚇 Script tunnel SSH
├── start-ai-services.sh    # 🚀 Démarrage services Mac
├── stop-ai-services.sh     # 🛑 Arrêt services Mac
├── test-pr-webhook.sh      # 🧪 Test webhook PR
├── ROADMAP.md              # 📋 Documentation complète
├── RECOVERY.md             # 🆘 Guide de récupération
└── STATUS.md               # 📊 Status temps réel
```

## 🎯 Utilisation

### Démarrage des services Mac
```bash
./start-ai-services.sh
./setup-tunnel.sh  # Dans un terminal séparé
```

### Push code et collaboration automatique
```bash
git add .
git commit -m "Jules: Nouvelle fonctionnalité AI"
git push origin main
# → Déclenche automatiquement Claude + Ollama !
```

### Créer une PR avec commentaire auto
```bash
git checkout -b jules-feature-001
# ... modifications code ...
git push origin jules-feature-001
# Créer PR sur GitHub → Claude commente automatiquement
```

## 🔗 Liens Utiles

- **Repository** : https://github.com/Manu5921/ai-relay-server
- **Coolify Dashboard** : http://89.117.61.193:8000
- **VPS Status** : http://89.117.61.193:4200/health
- **Webhook Config** : https://github.com/Manu5921/ai-relay-server/settings/hooks

## 🏆 Crédits

**Développé avec Claude Code** dans le cadre du système **Jarvis MCP** pour la collaboration AI autonome.

**Système testé et validé** : ✅ Opérationnel depuis le 21 Juin 2025

---

*🤖 Ce système permet à Jules (Google AI), Claude et Ollama de collaborer de manière entièrement autonome via GitHub, sans intervention humaine.*