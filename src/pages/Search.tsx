import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search as SearchIcon, Sparkles, CornerDownLeft } from 'lucide-react'
import { search } from '../services/search'
import { useAppStore } from '../stores'
import type { SearchQuery, SearchResult } from '../types'
import EvidenceBadge from '../components/EvidenceBadge'

const EXAMPLES = [
  '如何提升跨团队协作与执行力？',
  '面对复杂未知系统时，如何自下而上第一性思考？',
  '时间碎片化严重，怎样守住高价值深度工作？',
  '如何制定具有野心且可量化的团队季度目标？',
  '怎样用费曼学习法快速攻坚新专业领域？',
]

type SearchType = 'keyword' | 'natural_language' | 'scenario'

export default function SearchPage() {
  const navigate = useNavigate()
  const { setSearchResults, setSearchQuery, addNotification } = useAppStore()

  const [queryText, setQueryText] = useState('')
  const [searchType, setSearchType] = useState<SearchType>('natural_language')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SearchResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = useCallback(
    async (overrideText?: string) => {
      const q = (overrideText ?? queryText).trim()
      if (!q) return

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
        const msg = (err as Error).message
        setError(msg)
        addNotification({ type: 'error', title: '搜索失败', message: msg })
      } finally {
        setLoading(false)
      }
    },
    [queryText, searchType, setSearchResults, setSearchQuery, addNotification]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="space-y-7 max-w-4xl mx-auto">
      {/* 头部 */}
      <div className="text-center space-y-2 pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200 text-[11px] text-stone-600 font-mono shadow-soft">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Cogito · Multi-Method Reasoning</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">智能搜索与场景推演</h1>
        <p className="text-xs text-stone-500 max-w-lg mx-auto">
          输入你遇到的实际困境或目标，AI 从方法论底层逻辑进行推演，组合出可落地的系统解法
        </p>
      </div>

      {/* 搜索控制台 */}
      <div className="space-y-3">
        <div className="relative card p-1.5 border-stone-200/90 focus-within:border-stone-400 focus-within:shadow-float transition-all">
          <div className="flex items-center gap-3 px-3">
            <SearchIcon className="w-5 h-5 text-stone-400 shrink-0" />
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                searchType === 'keyword'
                  ? '输入方法论名称、提出者或关键词...'
                  : searchType === 'natural_language'
                  ? '输入你面临的实际问题（如：团队执行力不足、专注力差）...'
                  : '描述你的业务场景，由 AI 推荐最佳实践组合...'
              }
              className="w-full bg-transparent border-none py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading || !queryText.trim()}
              className="btn-primary text-xs shrink-0 py-2 px-4 rounded-xl flex items-center gap-1.5"
            >
              <span>{loading ? '推演中...' : '推演解法'}</span>
              <CornerDownLeft className="w-3.5 h-3.5 opacity-60" />
            </button>
          </div>
        </div>

        {/* 模式选择 */}
        <div className="flex justify-center gap-1.5 text-xs">
          {[
            { key: 'natural_language', label: '自然语言推演 (AI)' },
            { key: 'scenario', label: '情境方案组合' },
            { key: 'keyword', label: '精确关键词' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSearchType(key as SearchType)}
              className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                searchType === key
                  ? 'bg-stone-900 text-white shadow-soft'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 示例问题 */}
      {!result && !loading && (
        <div className="space-y-3 pt-2">
          <div className="text-[11px] font-mono text-stone-500 uppercase tracking-widest text-center">
            点击快速探索真实案例
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => {
                  setQueryText(ex)
                  handleSearch(ex)
                }}
                className="text-xs bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 px-3.5 py-2 rounded-xl transition-all duration-150 text-left hover:border-stone-300 hover:text-stone-900 shadow-soft"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="card p-4 border-rose-200 bg-rose-50 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* 搜索推演结果 */}
      {result && (
        <div className="space-y-6 pt-3">
          {/* AI 组合方案面板 */}
          {result.aiAnalysis && (
            <div className="card p-5 border-stone-300 bg-white shadow-float space-y-4">
              <div className="flex items-center gap-2 text-stone-900 text-xs font-semibold uppercase tracking-wider border-b border-stone-200 pb-3">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>AI 方法论组合推演报告</span>
              </div>

              {/* 理解 */}
              <div className="text-xs text-stone-700 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <strong className="text-stone-900 block mb-1">问题本质理解：</strong>
                {result.aiAnalysis.problemUnderstanding}
              </div>

              {/* 组合方案 */}
              {result.aiAnalysis.recommendedCombination && (
                <div className="space-y-1.5">
                  <h3 className="text-xs font-semibold text-stone-900">推荐组合解法</h3>
                  <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                    {result.aiAnalysis.recommendedCombination}
                  </p>
                </div>
              )}

              {/* 步骤 */}
              {result.aiAnalysis.executionSteps && result.aiAnalysis.executionSteps.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-stone-900">实施路径建议</h3>
                  <div className="space-y-1.5">
                    {result.aiAnalysis.executionSteps.map((st, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-stone-700 p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                        <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-700 text-[10px] flex items-center justify-center shrink-0 font-mono mt-0.5 font-bold">
                          {i + 1}
                        </span>
                        <span>{st}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 匹配的方法论卡片 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-500 font-mono px-1">
              <span>匹配方法论 ({result.methods.length})</span>
              <span>相关度排序</span>
            </div>

            <div className="space-y-2.5">
              {result.methods.map((hit) => {
                const m = hit.method
                return (
                  <div
                    key={m.id}
                    onClick={() => navigate(`/library/${m.id}`)}
                    className="card p-4 cursor-pointer hover:border-stone-400 hover:shadow-card transition-all group flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-stone-900 group-hover:text-stone-950 truncate">
                          {m.name}
                        </h4>
                        <EvidenceBadge level={m.evidence?.level ?? 'unverified'} />
                      </div>
                      <p className="text-xs text-stone-600 line-clamp-2">
                        {m.content?.summary}
                      </p>
                      {hit.relevanceReason && (
                        <div className="text-[11px] text-stone-500 font-mono">
                          匹配依据：{hit.relevanceReason}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-1">
                      <span className="btn-secondary text-xs py-1 px-2.5 rounded-lg">
                        查阅档案 →
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
