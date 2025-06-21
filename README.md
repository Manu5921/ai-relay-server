# AI Relay Server

Serveur de relais pour l'architecture de collaboration AI autonome entre Claude, Jules (Google AI), et Ollama.

## Architecture

```
GitHub Webhook → AI Relay Server → Claude + Ollama
```

## Fonctionnalités

- **Réception des webhooks GitHub** : Push, Pull Requests
- **Routage intelligent** : Notifications vers Claude et Ollama
- **Endpoints de santé** : Monitoring et tests
- **Sécurité** : Validation des signatures GitHub
- **Docker ready** : Déploiement facile via Coolify

## Endpoints

- `POST /github-webhook` - Réception des webhooks GitHub
- `POST /test-webhook` - Test manuel
- `GET /health` - Vérification de santé
- `GET /` - Page d'accueil

## Déploiement

### Via Coolify (Recommandé)

1. Connectez le dépôt GitHub
2. Configurez les variables d'environnement
3. Déployez automatiquement

### Variables d'environnement

```bash
NODE_ENV=production
PORT=4100
CLAUDE_ENDPOINT=http://votre-mac-ip:5050
OLLAMA_ENDPOINT=http://votre-mac-ip:4003
GITHUB_WEBHOOK_SECRET=your-secret
```

## Architecture AI

- **Claude** : Coordination et architecture
- **Jules** : Frontend async et GitHub
- **Ollama** : Mémoire et tests

## Test en local

```bash
npm install
npm start
npm test
```

## Contribution

Partie du système Jarvis MCP pour collaboration AI autonome.
