import React, { useState, useRef, useCallback } from 'react'
import { search } from '../services/search'
import { useAppStore } from '../stores'
import type { SearchQuery, SearchResult, MethodSearchHit } from '../types'

// ============================================================
// 示例问题
// ============================================================

const EXAMPLES = [
  '如何提升团队执行力？',
  '面对复杂问题时怎么系统性思考？',
  '时间管理效率低下，有什么改善方法？',
  '如何制定一个有效的年度目标？',
  '团队沟通不畅，有什么解决框架？',
  '如何快速学习一个新领域的知识？',
]

// ============================================================
// 相关度进度条
// ============================================================

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-orange-500'
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500">{pct}%</span>
    </div>
  )
}

// ============================================================
// 方法论结果卡片
// ============================================================

function MethodHitCard({
  hit,
  onViewDetail,
}: {
  hit: MethodSearchHit
  onViewDetail: (id: string) => void
}) {
  const { method } = hit
  const evidenceColor: Record<string, string> = {
    high: 'text-green-400 bg-green-900/40',
    medium: 'text-yellow-400 bg-yellow-900/40',
    low: 'text-orange-400 bg-orange-900/40',
    unverified: 'text-gray-400 bg-gray-700',
    disputed: 'text-red-400 bg-red-900/40',
  }

  return (
    <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-4 hover:border-blue-500/50 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1.5 mb-1">
            <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-md">{method.type}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-md ${evidenceColor[method.evidence.level] ?? 'text-gray-400 bg-gray-700'}`}
            >
              证据：{method.evidence.level}
            </span>
            {hit.aiScore !== undefined && (
              <span className="text-xs bg-purple-900/40 text-purple-400 px-2 py-0.5 rounded-md">AI 推荐</span>
            )}
          </div>
          <h3 className="text-white font-semibold text-base">{method.name}</h3>
          {method.aliases.length > 0 && (
            <p className="text-xs text-gray-500 mt-0.5">{method.aliases.join(' · ')}</p>
          )}
        </div>
        <ScoreBar score={hit.score} />
      </div>

      <p className="text-gray-300 text-sm mb-3 line-clamp-2">{method.content.summary}</p>

      {hit.relevanceReason && (
        <p className="text-xs text-blue-400/80 mb-3 italic">{hit.relevanceReason}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {method.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="text-xs bg-gray-700/60 text-gray-400 px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
        <button
          onClick={() => onViewDetail(method.id)}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
        >
          查看详情 →
        </button>
      </div>
    </div>
  )
}

// ============================================================
// AI 分析面板
// ============================================================

function AIAnalysisPanel({ analysis }: { analysis: NonNullable<SearchResult['aiAnalysis']> }) {
  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/20 border border-purple-700/40 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2 text-purple-300 font-semibold">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        AI 智能分析
      </div>

      {analysis.problemUnderstanding && (
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">问题理解</h4>
          <p className="text-gray-200 text-sm">{analysis.problemUnderstanding}</p>
        </div>
      )}

      {analysis.recommendedCombination && (
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">推荐组合方案</h4>
          <p className="text-gray-200 text-sm">{analysis.recommendedCombination}</p>
        </div>
      )}

      {analysis.combinationLogic && (
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">组合逻辑</h4>
          <p className="text-gray-300 text-sm">{analysis.combinationLogic}</p>
        </div>
      )}

      {analysis.executionSteps && analysis.executionSteps.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">实施步骤</h4>
          <ol className="space-y-1.5">
            {analysis.executionSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-200">
                <span className="shrink-0 w-5 h-5 bg-purple-700/60 text-purple-200 rounded-full flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {analysis.precautions && analysis.precautions.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">注意事项</h4>
          <ul className="space-y-1">
            {analysis.precautions.map((p, i) => (
              <li key={i} className="flex items-start gap-1.5 text-sm text-yellow-200/80">
                <span className="text-yellow-500 mt-0.5">⚠</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ============================================================
// 主页面
// ============================================================

type SearchType = SearchQuery['type']

export default function Search() {
  const [queryText, setQueryText] = useState('')
  const [searchType, setSearchType] = useState<SearchType>('keyword')
  const [result, setResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const { setSearchResults, setSearchQuery, addNotification } = useAppStore()

  const handleSearch = useCallback(
    async (text?: string) => {
      const q = (text ?? queryText).trim()
      if (!q) return

      // 取消上一次
      abortRef.current?.abort()
      abortRef.current = new AbortController()

      setLoading(true)
      setError(null)

      try {
        const query: SearchQuery = {
          text: q,
          type: searchType,
          filters: {},
          limit: 10,
        }

        const res = await search(query)
        setResult(res)
        setSearchResults(res)
        setSearchQuery(q)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          const msg = (err as Error).message
          setError(msg)
          addNotification({ type: 'error', title: '搜索失败', message: msg })
        }
      } finally {
        setLoading(false)
      }
    },
    [queryText, searchType, setSearchResults, setSearchQuery, addNotification]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleExampleClick = (example: string) => {
    setQueryText(example)
    handleSearch(example)
  }

  const handleViewDetail = (id: string) => {
    // 导航到方法论详情（路由由外部处理）
    addNotification({ type: 'info', title: '打开方法论', message: `ID: ${id}` })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* 页头 */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">智能搜索</h1>
          <p className="text-gray-400">在知识库中查找方法论，获取 AI 推荐组合方案</p>
        </div>

        {/* 搜索框 */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              {loading ? (
                <svg className="w-5 h-5 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                searchType === 'keyword'
                  ? '输入关键词搜索...'
                  : searchType === 'natural_language'
                  ? '用自然语言描述你的问题...'
                  : '描述你的场景，获取推荐方案...'
              }
              className="w-full bg-gray-800 border border-gray-600 rounded-2xl pl-12 pr-32 py-4 text-white placeholder-gray-500 text-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading || !queryText.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors text-sm"
            >
              搜索
            </button>
          </div>
        </div>

        {/* 搜索类型切换 */}
        <div className="flex gap-2 mb-6 justify-center">
          {[
            { key: 'keyword', label: '关键词搜索' },
            { key: 'natural_language', label: '自然语言' },
            { key: 'scenario', label: '场景推荐' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSearchType(key as SearchType)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                searchType === key
                  ? 'border-blue-500 bg-blue-900/40 text-blue-300'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 示例问题 */}
        {!result && !loading && (
          <div className="mb-8">
            <p className="text-xs text-gray-500 text-center mb-3 uppercase tracking-wider">示例问题</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => handleExampleClick(ex)}
                  className="text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 text-gray-300 px-3 py-1.5 rounded-xl transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 错误 */}
        {error && (
          <div className="bg-red-900/20 border border-red-700/40 rounded-xl p-4 mb-6 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* 搜索结果 */}
        {result && (
          <div className="space-y-6">
            {/* AI 分析 */}
            {result.aiAnalysis && <AIAnalysisPanel analysis={result.aiAnalysis} />}

            {/* 结果列表 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  方法论结果
                </h2>
                <span className="text-xs text-gray-500">共 {result.total} 条</span>
              </div>

              {result.methods.length > 0 ? (
                <div className="space-y-3">
                  {result.methods.map((hit) => (
                    <MethodHitCard key={hit.method.id} hit={hit} onViewDetail={handleViewDetail} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p>未找到相关方法论</p>
                  <p className="text-xs mt-1 text-gray-600">尝试其他关键词，或使用自然语言描述</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
