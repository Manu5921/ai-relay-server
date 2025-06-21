# 🆘 AI Relay Server - Guide de Récupération

## 🎯 Prompt de Reprise pour Claude

```
Contexte : Je travaille sur un système de collaboration AI autonome avec un AI Relay Server.

État actuel :
- VPS Contabo (89.117.61.193) avec Coolify installé
- Repository GitHub : https://github.com/Manu5921/ai-relay-server.git  
- Services Mac local : Claude endpoint (port 5050) + Ollama (port 11434)
- Tunnel SSH configuré : Mac → VPS
- Déploiement Coolify en cours/problème

Architecture : GitHub → AI Relay Server (VPS) → Tunnel SSH → Claude + Ollama (Mac)

Fichiers importants dans /Users/manu/Documents/DEV/ai-relay-server/ :
- setup-tunnel.sh (tunnel SSH)
- start-ai-services.sh (services Mac)
- claude-endpoint.js (endpoint Claude local)
- ROADMAP.md (état complet du projet)

Connexion VPS : ssh -i ~/.ssh/contabo_key admin@89.117.61.193
Coolify : http://89.117.61.193:8000

[Décris ton problème spécifique ici]

Aide-moi à diagnostiquer et résoudre le problème.
```

## 🔧 Diagnostics Rapides

### 1. Vérifier l'État Général

```bash
# Services Mac
curl http://localhost:5050/health     # Claude
curl http://localhost:11434/api/tags  # Ollama

# VPS
ssh -i ~/.ssh/contabo_key admin@89.117.61.193 "curl http://localhost:4100/health"

# Coolify containers
ssh -i ~/.ssh/contabo_key admin@89.117.61.193 "sudo docker ps | grep coolify"
```

### 2. Redémarrage Complet

#### Sur Mac
```bash
cd /Users/manu/Documents/DEV/ai-relay-server
./stop-ai-services.sh
./start-ai-services.sh
./setup-tunnel.sh  # Dans un nouveau terminal
```

#### Sur VPS
```bash
ssh -i ~/.ssh/contabo_key admin@89.117.61.193
sudo docker restart coolify coolify-db coolify-redis coolify-proxy
```

### 3. Tests de Connectivité

```bash
# Tunnel SSH actif ?
ps aux | grep "ssh.*89.117.61.193"

# Ports ouverts Mac ?
lsof -i :5050    # Claude
lsof -i :11434   # Ollama

# Depuis VPS, services Mac accessibles ?
ssh -i ~/.ssh/contabo_key admin@89.117.61.193 "curl -I http://localhost:5050"
ssh -i ~/.ssh/contabo_key admin@89.117.61.193 "curl -I http://localhost:4003"
```

## 🚨 Problèmes Courants

### Problème 1 : Tunnel SSH fermé
**Symptômes** : AI Relay Server ne peut pas joindre Claude/Ollama
**Solution** :
```bash
./setup-tunnel.sh
# Garde le terminal ouvert !
```

### Problème 2 : Services Mac arrêtés
**Symptômes** : curl localhost:5050 échoue
**Solution** :
```bash
./start-ai-services.sh
# Vérifier logs/ pour les erreurs
```

### Problème 3 : Coolify inaccessible
**Symptômes** : http://89.117.61.193:8000 timeout
**Solution** :
```bash
ssh -i ~/.ssh/contabo_key admin@89.117.61.193
sudo docker ps | grep coolify
sudo docker restart coolify
```

### Problème 4 : Build Coolify échoue
**Symptômes** : Erreurs dans les logs Coolify
**Solutions** :
1. Vérifier variables d'environnement
2. Redéployer depuis GitHub
3. Vérifier Dockerfile et package.json

### Problème 5 : Domaine Coolify incorrect
**Symptômes** : URL .sslip.io au lieu de IP:port
**Solution** :
1. Configuration → General → Domains
2. Supprimer domaine généré
3. Ajouter : http://89.117.61.193:4100

## 🔍 Logs Utiles

### Logs Services Mac
```bash
tail -f logs/claude.log
tail -f logs/ollama.log
```

### Logs VPS
```bash
ssh -i ~/.ssh/contabo_key admin@89.117.61.193
sudo docker logs coolify --tail 50
sudo docker logs [app-container-name] --tail 50
```

### Logs Application
- Interface Coolify → Applications → Logs
- Ou SSH + docker logs

## 📋 Checklist de Récupération

- [ ] Services Mac démarrés (Claude + Ollama)
- [ ] Tunnel SSH actif et fonctionnel
- [ ] VPS accessible via SSH
- [ ] Coolify opérationnel
- [ ] Application déployée dans Coolify
- [ ] Variables d'environnement correctes
- [ ] Endpoints accessibles
- [ ] Tests end-to-end OK

## 🔄 Redéploiement Complet

Si tout est cassé, procédure complète :

### 1. Nettoyer
```bash
# Mac
./stop-ai-services.sh
pkill -f "ssh.*89.117.61.193"

# VPS (si nécessaire)
ssh -i ~/.ssh/contabo_key admin@89.117.61.193
sudo docker system prune -f
```

### 2. Redémarrer
```bash
# Mac
./start-ai-services.sh

# Vérifier
curl http://localhost:5050/health
curl http://localhost:11434/api/tags
```

### 3. Tunnel
```bash
./setup-tunnel.sh
# Nouveau terminal !
```

### 4. Coolify
- Aller sur http://89.117.61.193:8000
- Redéployer l'application
- Vérifier logs

### 5. Tests
```bash
curl http://89.117.61.193:4100/health
```

## 📞 Contacts & Ressources

### Documentation
- **Coolify** : https://coolify.io/docs
- **Nixpacks** : https://nixpacks.com/docs
- **Ollama** : https://ollama.ai/docs

### Commandes Claude Code
```bash
# Pour relancer Claude Code avec le contexte
claude --resume /Users/manu/Documents/DEV/ai-relay-server
```

### Informations Système
- **Mac IP** : 192.168.1.65
- **VPS IP** : 89.117.61.193
- **SSH Key** : ~/.ssh/contabo_key
- **GitHub** : https://github.com/Manu5921/ai-relay-server.git

---

**En cas de problème majeur** : Utilise le prompt de reprise ci-dessus avec Claude Code pour obtenir une aide spécialisée.