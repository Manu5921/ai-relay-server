'use client'

import { useState } from 'react'
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react'

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  currentPage?: string
  contextData?: any
}

export default function ChatInterface({ currentPage, contextData }: ChatInterfaceProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<'claude' | 'ollama' | 'jules'>('claude')

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          agent: selectedAgent,
          context: { page: currentPage, data: contextData }
        })
      })

      const result = await response.json()

      if (result.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: result.data.response,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error(result.error || 'Erreur de communication')
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Erreur: ${error instanceof Error ? error.message : 'Communication impossible'}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 bg-white border rounded-lg shadow-xl z-50 w-96 h-80">
      <div className="flex items-center justify-between p-3 border-b bg-gray-50 rounded-t-lg">
        <h3 className="font-medium">Assistant IA</h3>
        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-200 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="h-48 p-3 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 flex items-center justify-center h-full">
            <div>
              <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Assistant IA {selectedAgent.charAt(0).toUpperCase() + selectedAgent.slice(1)}</p>
              <p className="text-xs mt-1">Powered by Google Gemini</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-2 rounded text-sm ${
                  msg.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100'
                }`}>
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-2 rounded">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="p-3 border-t">
        <div className="flex gap-2 mb-2">
          <select 
            value={selectedAgent} 
            onChange={(e) => setSelectedAgent(e.target.value as 'claude' | 'ollama' | 'jules')}
            className="text-xs border rounded px-2 py-1"
          >
            <option value="claude">🤖 Claude (Code & Business)</option>
            <option value="ollama">📚 Ollama (Documentation)</option>
            <option value="jules">⚙️ Jules (GitHub & DevOps)</option>
          </select>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Votre question..."
            className="flex-1 p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button 
            onClick={sendMessage}
            disabled={!message.trim() || isLoading}
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}