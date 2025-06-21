# 🤖 Prompt Optimisé pour Sessions Claude Code

## 📋 Prompt de Démarrage Automatisé

Colle ce prompt quand tu démarres une nouvelle session avec Claude Code :

---

```
🤖 CLAUDE AI COLLABORATION SESSION - AUTO-INIT

Context: Système de collaboration AI autonome opérationnel
Projet: AI Relay Server (/Users/manu/Documents/DEV/ai-relay-server)

ACTIONS AUTOMATIQUES REQUISES:
1. Vérifier services AI actifs (Claude + Ollama endpoints)
2. Récupérer mémoire collaborative depuis Ollama
3. Lire documentation projet (CLAUDE.md, STATUS.md, ROADMAP.md)
4. Synchroniser context avec état actuel du système

ARCHITECTURE ACTIVE:
- VPS Contabo: AI Relay Server (http://89.117.61.193:4200) ✅
- Mac Mini M4: Claude endpoint (:5050) + Ollama endpoint (:8090) ✅  
- GitHub Webhook: Actif et fonctionnel ✅
- SSH Tunnel: Mac ↔ VPS opérationnel ✅

SYSTEM STATUS: 🟢 FULLY OPERATIONAL
Collaboration Modes: Direct (Manu↔Claude) + Autonomous (Jules↔Claude↔Ollama)

Please:
1. Connect to Ollama and retrieve collaborative memory
2. Read current project documentation 
3. Assess system health status
4. Ready for collaborative development session

Start immediately with health check and memory sync.
```

---

## 🔧 Actions Claude Automatiques

### 1️⃣ **Health Check Services**
```bash
# Vérifier Claude endpoint
curl http://localhost:5050/health

# Vérifier Ollama endpoint  
curl http://localhost:8090/health

# Vérifier AI Relay Server
curl http://89.117.61.193:4200/health
```

### 2️⃣ **Memory Sync avec Ollama**
```bash
# Récupérer contexte collaboratif
curl -X POST http://localhost:8090/memory-update \
  -H "Content-Type: application/json" \
  -d '{
    "context": "Claude session start - retrieving collaborative context",
    "event_type": "session_init",
    "branch": "main",
    "metadata": {
      "session_type": "claude_direct_collaboration",
      "timestamp": "'$(date -Iseconds)'"
    }
  }'
```

### 3️⃣ **Documentation Auto-Read**
```bash
# Lire fichiers contexte essentiels
cat CLAUDE.md              # Instructions spécifiques Claude
cat STATUS.md               # État actuel système  
cat ROADMAP.md              # Architecture complète
cat COLLABORATION-WORKFLOW.md  # Process de collaboration
cat README.md               # Overview projet
```

### 4️⃣ **Git Status & Context**
```bash
# État du repository
git status
git log --oneline -5       # 5 derniers commits
git branch -a              # Branches disponibles
```

---

## 📄 Fichiers Prioritaires à Lire

### 🎯 **Essentiels** (toujours lire)
- `CLAUDE.md` - Instructions spécifiques pour Claude
- `STATUS.md` - État temps réel du système
- `ROADMAP.md` - Architecture et plan complet
- `README.md` - Documentation utilisateur

### 📋 **Contextuels** (selon besoin)
- `RECOVERY.md` - Procédures de récupération
- `COLLABORATION-WORKFLOW.md` - Process de collaboration
- `claude-performance-analysis.md` - Retours d'expérience
- `package.json` - Dépendances et scripts

### 🔧 **Techniques** (debugging)
- `logs/claude.log` - Logs endpoint Claude
- `logs/ollama-endpoint.log` - Logs endpoint Ollama  
- `docker-compose.yaml` - Configuration déploiement
- `index.js` - AI Relay Server principal

---

## ⚡ Raccourci Session Init

**Version ultra-courte pour sessions récurrentes :**

```
🚀 CLAUDE QUICK INIT

Project: AI Relay Server
Actions: Health check + Ollama sync + Read docs + Ready for dev

Status: System OPERATIONAL ✅
Memory: Sync with Ollama collaborative context
Context: /Users/manu/Documents/DEV/ai-relay-server

Start auto-init sequence now.
```

---

## 🎯 Résultat Attendu

Après ce prompt, Claude devrait automatiquement :

✅ Vérifier santé de tous les services  
✅ Se connecter à Ollama pour récupérer le contexte  
✅ Lire la documentation projet essentielle  
✅ Afficher un résumé de l'état système  
✅ Être prêt pour collaboration immédiate

**Temps d'initialisation estimé : ~30 secondes**

---

## 📝 Template de Réponse Claude

```
🤖 CLAUDE SESSION INITIALIZED

✅ Services Health Check:
- Claude Endpoint (:5050): ACTIVE
- Ollama Endpoint (:8090): ACTIVE  
- AI Relay Server (VPS): ACTIVE

🧠 Ollama Memory Sync: [X] commits context retrieved

📚 Documentation Read:
- STATUS.md: System OPERATIONAL since [date]
- ROADMAP.md: Architecture [summary]
- Current branch: main ([X] commits ahead)

🎯 Ready for collaborative development!
What would you like to work on today?
```

---

*🤖 Ce prompt optimise l'initialisation automatique des sessions Claude pour maximum d'efficacité collaborative*