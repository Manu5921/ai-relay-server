# 🤖 AI Relay Server - Roadmap & Documentation

## 📋 État Actuel (21 Juin 2025)

### ✅ Tâches Accomplies

1. **Infrastructure VPS** ✅
   - VPS Contabo réinstallé avec Ubuntu 24.04
   - Clé SSH configurée (contabo_key)
   - Coolify installé et fonctionnel sur http://89.117.61.193:8000

2. **Repository GitHub** ✅
   - Créé : https://github.com/Manu5921/ai-relay-server.git
   - Code pushé avec toute l'architecture
   - Prêt pour déploiement Coolify

3. **Services Mac Local** ✅
   - Claude Endpoint : http://localhost:5050/health ✅
   - Ollama API : http://localhost:11434/api/tags ✅
   - Scripts automatisés : `start-ai-services.sh` et `stop-ai-services.sh`

4. **Tunnel SSH** ✅
   - Script `setup-tunnel.sh` configuré
   - Mapping : Mac:11434 → VPS:4003 (Ollama)
   - Mapping : Mac:5050 → VPS:5050 (Claude)

5. **Déploiement Coolify** 🔄
   - Application configurée dans Coolify
   - Variables d'environnement définies
   - Build en cours (étape Nixpacks)

### 🔄 En Cours

- **Déploiement Coolify** : Build Docker avec Nixpacks (étape installation packages)
- **Monitoring** : Surveillance des logs de build

### ⏳ À Faire

1. **Finaliser Déploiement**
   - Attendre fin du build Coolify
   - Corriger le domaine si nécessaire
   - Tester l'endpoint : http://89.117.61.193:4100/health

2. **Tests End-to-End**
   - Webhook GitHub → AI Relay Server
   - Communication avec Claude endpoint
   - Communication avec Ollama endpoint

3. **Configuration GitHub Webhooks**
   - Ajouter webhook dans le repo GitHub
   - URL : http://89.117.61.193:4100/github-webhook
   - Secret : ai-relay-production

4. **Documentation & Monitoring**
   - Guide d'utilisation
   - Monitoring des logs
   - Tests automatisés

## 🏗️ Architecture Complète

```
GitHub Push/PR
      ↓
AI Relay Server (VPS:4100)
      ↓
   Tunnel SSH
      ↓
Mac Mini M4 (Local)
  ├── Claude Endpoint (:5050)
  └── Ollama API (:11434)
```

## 📂 Structure des Fichiers

```
ai-relay-server/
├── index.js                 # Serveur principal Express
├── claude-endpoint.js       # Endpoint Claude local
├── package.json             # Dépendances Node.js
├── Dockerfile              # Image Docker
├── docker-compose.yml      # Config Docker Compose
├── setup-tunnel.sh         # Script tunnel SSH
├── start-ai-services.sh    # Démarrage services Mac
├── stop-ai-services.sh     # Arrêt services Mac
├── ROADMAP.md              # Ce fichier
└── RECOVERY.md             # Guide de récupération
```

## 🔧 Services & Endpoints

### VPS (89.117.61.193)
- **Coolify** : http://89.117.61.193:8000
- **AI Relay Server** : http://89.117.61.193:4100
  - `GET /health` - Santé du service
  - `POST /github-webhook` - Réception webhooks
  - `POST /test-webhook` - Tests manuels

### Mac Local (192.168.1.65)
- **Claude Endpoint** : http://localhost:5050
  - `GET /health` - Santé Claude
  - `POST /ai-sync` - Traitement AI
- **Ollama API** : http://localhost:11434
  - `GET /api/tags` - Modèles disponibles

## 🌍 Variables d'Environnement

```bash
NODE_ENV=production
PORT=4100
CLAUDE_ENDPOINT=http://localhost:5050
OLLAMA_ENDPOINT=http://localhost:4003
GITHUB_WEBHOOK_SECRET=ai-relay-production
```

## 🔑 Identifiants & Accès

### Contabo VPS
- **IP** : 89.117.61.193
- **User** : admin
- **SSH Key** : ~/.ssh/contabo_key
- **Connexion** : `ssh -i ~/.ssh/contabo_key admin@89.117.61.193`

### GitHub
- **Repo** : https://github.com/Manu5921/ai-relay-server.git
- **Branch** : main

### Coolify
- **URL** : http://89.117.61.193:8000
- **Projet** : AI Collaboration

## 🚀 Commandes Essentielles

### Démarrage Services Mac
```bash
cd /Users/manu/Documents/DEV/ai-relay-server
./start-ai-services.sh
```

### Tunnel SSH
```bash
./setup-tunnel.sh
# Garde ce terminal ouvert !
```

### Tests
```bash
# Test Claude
curl http://localhost:5050/health

# Test Ollama
curl http://localhost:11434/api/tags

# Test AI Relay (après déploiement)
curl http://89.117.61.193:4100/health
```

### Monitoring Coolify
- **Logs** : Interface Coolify → Logs
- **Status** : Interface Coolify → Applications

## 🎯 Objectif Final

Créer une architecture de collaboration AI autonome où :

1. **Jules (Google AI)** push du code sur GitHub
2. **GitHub Webhook** notifie le AI Relay Server
3. **AI Relay Server** route vers Claude et Ollama
4. **Claude** analyse et coordonne
5. **Ollama** gère la mémoire et les tests
6. **Collaboration autonome** sans intervention humaine

## 📞 Support & Dépannage

Voir `RECOVERY.md` pour :
- Redémarrage complet du système
- Résolution des problèmes courants
- Commandes de diagnostic
- Contacts et ressources

---

**Dernière mise à jour** : 21 Juin 2025 - Build Coolify en cours  
**Status** : 🟡 Déploiement en cours  
**Prochaine étape** : Finaliser build et tester endpoints