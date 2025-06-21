#!/bin/bash

echo "🧪 Test Pull Request webhook"

curl -X POST http://89.117.61.193:4200/github-webhook \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: pull_request" \
  -d '{
    "action": "opened",
    "number": 1,
    "pull_request": {
      "title": "Jules: Add advanced AI features",
      "body": "This PR adds new autonomous AI collaboration features",
      "head": {
        "ref": "jules-feature-001"
      },
      "user": {
        "login": "jules-ai"
      }
    },
    "repository": {
      "name": "ai-relay-server",
      "full_name": "Manu5921/ai-relay-server"
    }
  }'

echo ""
echo "✅ Test PR webhook envoyé !"