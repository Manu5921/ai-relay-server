'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ChatInterface from './ChatInterface'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts'
import { 
  Activity, Database, Users, Zap, TrendingUp, Search, 
  Clock, Target, Cpu, HardDrive, RefreshCw, Play, CheckCircle, AlertCircle, ExternalLink, Settings, Globe 
} from 'lucide-react'

interface VectorStats {
  overview: {
    total: number
    active: number
    last_24h: number
    last_7d: number
  }
  agents: Record<string, {
    total: number
    active: number
    recent_24h: number
    task_types: string[]
    avg_priority: number
  }>
  performance: {
    avg_query_time: number
    avg_similarity: number
    queries_today: number
    cache_hit_rate: number
  }
  keywords: Array<{
    keyword: string
    count: number
  }>
  last_updated: string
}

interface SearchResult {
  id: string
  agent_id: string
  content: string
  summary: string
  created_at: string
  similarity: number
  task_type: string
}

interface HealthStatus {
  service: string
  port: number
  status: 'online' | 'offline' | 'slow'
  response_time: number
  url: string
}

interface SimilarityHistoryData {
  timeline: Array<{
    date: string
    memories_count: number
    agents_active: number
    avg_quality: number
    avg_feedback: number
    avg_priority: number
    similarity_score: number
    quality_variance: number
  }>
  summary: {
    total_days: number
    avg_similarity_7d: number
    total_memories: number
    unique_agents: number
  }
  alerts: Array<{
    type: string
    message: string
    threshold?: number
    current?: number
    drift_amount?: number
  }>
  thresholds: {
    critical: number
    warning: number
    excellent: number
  }
}

export default function VectorDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<VectorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  
  // Search Playground states
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  
  // Health Monitoring states
  const [healthStatus, setHealthStatus] = useState<HealthStatus[]>([])
  const [healthLoading, setHealthLoading] = useState(false)
  
  // Similarity History states
  const [similarityData, setSimilarityData] = useState<SimilarityHistoryData | null>(null)
  const [similarityLoading, setSimilarityLoading] = useState(false)

  const fetchStats = async () => {
    try {
      console.log('🔄 Fetching stats...')
      setLoading(true)
      const response = await fetch('/api/vector/stats')
      console.log('📡 Response status:', response.status)
      const result = await response.json()
      console.log('📊 Stats result:', result)
      
      if (result.success) {
        setStats(result.data)
        setError(null)
        console.log('✅ Stats loaded successfully')
      } else {
        setError(result.error || 'Erreur inconnue')
        console.error('❌ Stats error:', result.error)
      }
    } catch (err: any) {
      console.error('💥 Fetch error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
      setLastRefresh(new Date())
      console.log('🏁 fetchStats finished, loading=false')
    }
  }

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    
    try {
      setSearching(true)
      const response = await fetch('/api/vector/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit: 5 })
      })
      
      const result = await response.json()
      if (result.success) {
        setSearchResults(result.data.results || [])
      }
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setSearching(false)
    }
  }

  const checkHealth = async () => {
    try {
      setHealthLoading(true)
      const response = await fetch('/api/health/services')
      const result = await response.json()
      
      if (result.success) {
        setHealthStatus(result.data || [])
      }
    } catch (err) {
      console.error('Health check error:', err)
    } finally {
      setHealthLoading(false)
    }
  }

  const fetchSimilarityHistory = async () => {
    try {
      setSimilarityLoading(true)
      const response = await fetch('/api/vector/similarity-history')
      const result = await response.json()
      
      if (result.success) {
        setSimilarityData(result.data)
      }
    } catch (err) {
      console.error('Similarity history error:', err)
    } finally {
      setSimilarityLoading(false)
    }
  }

  useEffect(() => {
    // Test progressif : d'abord les stats uniquement
    fetchStats()
  }, [])

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement des statistiques vectorielles...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Erreur de connexion</p>
            <p>{error}</p>
            <button 
              onClick={fetchStats}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) return null

  // Préparer les données pour les graphiques
  const agentData = Object.entries(stats.agents).map(([agent, data]) => ({
    agent: agent.replace('-', ' '),
    total: data.total,
    active: data.active,
    recent: data.recent_24h,
    quality: data.avg_priority
  }))

  const keywordData = stats.keywords.map(item => ({
    name: item.keyword,
    value: item.count
  }))

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Database className="w-8 h-8 mr-3 text-blue-600" />
                Vector Memory Monitor
              </h1>
              <p className="text-gray-600 mt-1">
                Dashboard de monitoring pour la mémoire vectorielle Supabase
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => router.push('/projects')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Projets PME
                </button>
                <button 
                  onClick={() => router.push('/memories')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Memory Management
                </button>
                <button 
                  onClick={fetchStats}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Actualiser
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Dernière MAJ: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Health Monitoring */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Activity className="w-5 h-5 mr-2 text-green-600" />
              Health Monitoring
            </h2>
            <button 
              onClick={checkHealth}
              className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
              disabled={healthLoading}
            >
              {healthLoading ? 'Vérification...' : 'Vérifier'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {healthStatus.map((service) => (
              <div key={service.service} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{service.service}</span>
                  <div className="flex items-center">
                    {service.status === 'online' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : service.status === 'slow' ? (
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Port {service.port} • {service.response_time}ms
                </div>
                <div className={`text-xs font-medium mt-1 ${
                  service.status === 'online' ? 'text-green-600' : 
                  service.status === 'slow' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {service.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search Playground */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Search className="w-5 h-5 mr-2 text-purple-600" />
            Search Playground
          </h2>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher dans les mémoires vectorielles..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (e.target.value.length > 2) {
                    performSearch(e.target.value)
                  } else {
                    setSearchResults([])
                  }
                }}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => performSearch(searchQuery)}
              disabled={searching || !searchQuery.trim()}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center"
            >
              {searching ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span className="ml-2">{searching ? 'Recherche...' : 'Rechercher'}</span>
            </button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700">Top 5 résultats similaires :</h3>
              {searchResults.map((result, index) => (
                <div key={result.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                          {result.agent_id}
                        </span>
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          {result.task_type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(result.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 mb-1 font-medium">
                        {result.summary || 'Pas de résumé'}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {result.content.substring(0, 150)}...
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <div className={`text-lg font-bold ${
                        result.similarity > 0.8 ? 'text-green-600' : 
                        result.similarity > 0.6 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {(result.similarity * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">similarité</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={<HardDrive className="w-6 h-6" />}
            title="Mémoires Totales"
            value={stats.overview.total}
            subtitle={`${stats.overview.active} actives`}
            color="blue"
          />
          <MetricCard
            icon={<Activity className="w-6 h-6" />}
            title="Activité 24h"
            value={stats.overview.last_24h}
            subtitle={`${stats.overview.last_7d} cette semaine`}
            color="green"
          />
          <MetricCard
            icon={<Zap className="w-6 h-6" />}
            title="Temps Requête"
            value={`${stats.performance.avg_query_time}ms`}
            subtitle={`${stats.performance.queries_today} requêtes aujourd'hui`}
            color="yellow"
          />
          <MetricCard
            icon={<Target className="w-6 h-6" />}
            title="Similarité Moy."
            value={`${(stats.performance.avg_similarity * 100).toFixed(1)}%`}
            subtitle={`Cache: ${(stats.performance.cache_hit_rate * 100).toFixed(0)}%`}
            color="purple"
          />
        </div>

        {/* Similarity History Chart */}
        {similarityData && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                Courbe Similarité (7 derniers jours)
              </h2>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600">
                  Moyenne 7j: <strong>{(similarityData.summary.avg_similarity_7d * 100).toFixed(1)}%</strong>
                </span>
                <button 
                  onClick={fetchSimilarityHistory}
                  className="text-purple-600 hover:text-purple-700"
                  disabled={similarityLoading}
                >
                  {similarityLoading ? 'Actualisation...' : 'Actualiser'}
                </button>
              </div>
            </div>

            {/* Alerts */}
            {similarityData.alerts.length > 0 && (
              <div className="mb-4 space-y-2">
                {similarityData.alerts.map((alert, index) => (
                  <div key={index} className={`px-4 py-2 rounded-lg border-l-4 ${
                    alert.type === 'critical' ? 'bg-red-50 border-red-500 text-red-700' :
                    alert.type === 'warning' ? 'bg-yellow-50 border-yellow-500 text-yellow-700' :
                    'bg-blue-50 border-blue-500 text-blue-700'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{alert.message}</span>
                      {alert.current && (
                        <span className="text-sm">
                          {(alert.current * 100).toFixed(1)}% / {(alert.threshold! * 100).toFixed(0)}%
                        </span>
                      )}
                      {alert.drift_amount && (
                        <span className="text-sm">
                          Dérive: -{(alert.drift_amount * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Chart */}
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={similarityData.timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  yAxisId="left"
                  domain={[0, 1]}
                  tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  domain={[0, 'dataMax']}
                />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    name === 'similarity_score' ? `${(value * 100).toFixed(1)}%` : value,
                    name === 'similarity_score' ? 'Similarité' : 
                    name === 'memories_count' ? 'Mémoires' : 
                    name === 'agents_active' ? 'Agents actifs' : name
                  ]}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR')}
                />
                <Line 
                  type="monotone" 
                  dataKey="similarity_score" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  name="Similarité"
                  yAxisId="left"
                />
                <Line 
                  type="monotone" 
                  dataKey="memories_count" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 1, r: 3 }}
                  name="Mémoires"
                  yAxisId="right"
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Legend and Thresholds */}
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span>Score Similarité</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Nb. Mémoires</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>🔴 Critique: &lt;{(similarityData.thresholds.critical * 100).toFixed(0)}%</span>
                <span>🟡 Attention: &lt;{(similarityData.thresholds.warning * 100).toFixed(0)}%</span>
                <span>🟢 Excellent: &gt;{(similarityData.thresholds.excellent * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Activité par Agent */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Activité par Agent
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="agent" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#3B82F6" name="Total" />
                <Bar dataKey="active" fill="#10B981" name="Actives" />
                <Bar dataKey="recent" fill="#F59E0B" name="24h" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Mots-clés populaires */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Search className="w-5 h-5 mr-2 text-green-600" />
              Mots-clés Populaires
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={keywordData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {keywordData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table des agents */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Cpu className="w-5 h-5 mr-2 text-purple-600" />
            Détails par Agent
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-medium">Agent</th>
                  <th className="text-center p-3 font-medium">Total</th>
                  <th className="text-center p-3 font-medium">Actives</th>
                  <th className="text-center p-3 font-medium">24h</th>
                  <th className="text-center p-3 font-medium">Priorité Moy.</th>
                  <th className="text-left p-3 font-medium">Types de Tâches</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats.agents).map(([agent, data]) => (
                  <tr key={agent} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/agent/${agent}`)}>
                    <td className="p-3 font-medium text-blue-600 hover:text-blue-800">
                      <div className="flex items-center">
                        {agent}
                        <ExternalLink className="w-3 h-3 ml-2 opacity-50" />
                      </div>
                    </td>
                    <td className="p-3 text-center">{data.total}</td>
                    <td className="p-3 text-center">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        {data.active}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {data.recent_24h > 0 && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {data.recent_24h}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">{data.avg_priority.toFixed(1)}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {data.task_types.slice(0, 3).map(type => (
                          <span key={type} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            {type}
                          </span>
                        ))}
                        {data.task_types.length > 3 && (
                          <span className="text-gray-500 text-xs">+{data.task_types.length - 3}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Chat Interface avec API Gemini - Temporarily disabled for debugging */}
      {/* <ChatInterface 
        currentPage="dashboard" 
        contextData={{ stats, healthStatus, similarityData }} 
      /> */}
    </div>
  )
}

interface MetricCardProps {
  icon: React.ReactNode
  title: string
  value: string | number
  subtitle: string
  color: 'blue' | 'green' | 'yellow' | 'purple'
}

function MetricCard({ icon, title, value, subtitle, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    purple: 'text-purple-600 bg-purple-100'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}