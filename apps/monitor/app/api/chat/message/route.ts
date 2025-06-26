import { NextResponse } from 'next/server'

interface ChatRequest {
  message: string
  agent: 'claude' | 'ollama' | 'jules' | 'auto'
  context: {
    page: string
    data?: any
    conversation_history?: any[]
  }
}

// Real AI responses using OpenAI API
const generateResponse = async (request: ChatRequest): Promise<string> => {
  const { message, agent, context } = request
  const page = context.page
  
  // Use Google Gemini for intelligent responses
  try {
    const systemPrompt = getSystemPrompt(agent, page, context)
    const fullPrompt = `${systemPrompt}\n\nQuestion de l'utilisateur: ${message}`
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: fullPrompt }]
        }],
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.7
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.candidates[0].content.parts[0].text

  } catch (error) {
    console.error('Gemini API error:', error)
    // Fallback to template responses if API fails
    return getFallbackResponse(agent, message, page)
  }
}

const getSystemPrompt = (agent: string, page: string, context: any): string => {
  const baseContext = `Tu es un assistant IA pour une agence qui crée des sites web pour des PME françaises. Page actuelle: ${page}.`
  
  switch (agent) {
    case 'claude':
      return `${baseContext} Tu es Claude, assistant code et stratégie business. Tu aides avec:
- Génération de code Next.js/React/TypeScript
- Architecture de projets web
- Conseils stratégiques pour PME (pricing, secteurs, ROI)
- Optimisations techniques
- SEO et conversion

Réponds en français, sois concis et actionnable. Utilise des émojis et du formatage markdown.`

    case 'ollama':
      return `${baseContext} Tu es Ollama, spécialiste documentation et recherche. Tu aides avec:
- Recherche dans la base de connaissances
- Documentation technique
- Guides et tutoriels
- Meilleures pratiques

Réponds en français, sois détaillé et éducatif.`

    case 'jules':
      return `${baseContext} Tu es Jules, expert GitHub et intégrations. Tu aides avec:
- Workflows GitHub Actions
- Déploiements automatisés
- Intégrations API
- DevOps et monitoring

Réponds en français, sois technique et précis.`

    default:
      return `${baseContext} Tu es un assistant intelligent polyvalent. Aide l'utilisateur selon ses besoins.`
  }
}

const getFallbackResponse = (agent: string, message: string, page: string): string => {
  return `⚠️ **Service temporairement indisponible**

L'API OpenAI rencontre une difficulté temporaire. 

**Votre message :** "${message}"
**Agent sélectionné :** ${agent}
**Page :** ${page}

Veuillez réessayer dans quelques instants. En cas de problème persistant, contactez l'administrateur.

**Astuce :** Vous pouvez essayer des questions plus courtes ou reformuler votre demande.`
}


export async function POST(request: Request) {
  try {
    const body: any = await request.json()
    
    if (!body.message || !body.agent) {
      return NextResponse.json(
        { success: false, error: 'Message and agent are required' },
        { status: 400 }
      )
    }

    // Normalize context - handle both context.page and currentPage
    if (!body.context) {
      body.context = {}
    }
    if (!body.context.page && body.currentPage) {
      body.context.page = body.currentPage
    }
    if (!body.context.page) {
      body.context.page = 'unknown'
    }

    // Log the conversation for monitoring
    console.log(`💬 Chat: ${body.agent} | Page: ${body.context.page} | Message: ${body.message.substring(0, 50)}...`)

    // Generate response (in production, this would call actual AI services)
    const response = await generateResponse(body)

    // In a real implementation, you would call:
    /*
    let apiResponse
    switch (body.agent) {
      case 'claude':
        apiResponse = await fetch('http://localhost:5050/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task: body.message,
            context: body.context,
            type: 'chat'
          })
        })
        break
      case 'ollama':
        apiResponse = await fetch('http://localhost:8090/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: body.message,
            context: body.context
          })
        })
        break
      case 'jules':
        apiResponse = await fetch('http://localhost:5100/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: body.message,
            context: body.context
          })
        })
        break
    }
    */

    return NextResponse.json({
      success: true,
      data: {
        response,
        agent: body.agent,
        context: body.context,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('Chat API error:', error.message)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}