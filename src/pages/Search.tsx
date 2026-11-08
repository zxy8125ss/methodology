import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search as SearchIcon, Sparkles, CornerDownLeft, ArrowRight, Lightbulb } from 'lucide-react'
import { search } from '../services/search'
import { useAppStore } from '../stores'
import type { SearchQuery, SearchResult } from '../types'
import EvidenceBadge from '../components/EvidenceBadge'

const EXAMPLES = [
  '如何结合第一性原理与费曼技巧穿透业务本质？',
  '面对复杂多变的目标，如何用 OKR 与双周 PDCA 建立坚固执行闭环？',
  '注意力碎片化严重，怎样打造高沉浸的心流深度工作系统？',
  '重大决策前夕，如何运用逆向思维与事前验尸法防范黑天鹅？',
  '跨部门协作阻力重重，如何运用非暴力沟通与利害关系人矩阵破局？'
]

type SearchType = 'natural_language' | 'scenario' | 'keyword'

export default function SearchPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setSearchResults, setSearchQuery, addNotification } = useAppStore()

  const initialQuery = searchParams.get('q') || ''
  const [queryText, setQueryText] = useState(initialQuery)
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
        addNotification({ type: 'error', title: '推演检索失败', message: msg })
      } finally {
        setLoading(false)
      }
    },
    [queryText, searchType, setSearchResults, setSearchQuery, addNotification]
  )

  // 自动响应 URL 参数变化（从首页或其他入口一键推演跳入）
  useEffect(() => {
    const q = searchParams.get('q')
    if (q && q.trim()) {
      setQueryText(q.trim())
      handleSearch(q.trim())
    }
  }, [searchParams, handleSearch])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="space-y-7 max-w-3xl mx-auto">
      {/* 头部：Claude Editorial 雅致标题 */}
      <div className="text-center space-y-2.5 pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0EB] border border-[#F0DED3] text-[11px] text-[#B8684D] font-medium font-sans">
          <Sparkles className="w-3.5 h-3.5 text-[#CC785C]" />
          <span>Cognitive Synthesis · 跨模型推演</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-[#1F1E1B]">
          智能推演与场景解构
        </h1>
        <p className="text-xs sm:text-sm text-[#57534D] max-w-lg mx-auto font-sans leading-relaxed">
          描述你面临的具体现实阻碍、决策困惑或业务目标，AI 将从方法论底层逻辑进行解构与组合，生成可落地的系统解法。
        </p>
      </div>

      {/* 搜索控制台 */}
      <div className="space-y-3">
        <div className="bg-white border border-[#EAE6DF] focus-within:border-[#CC785C] focus-within:ring-2 focus-within:ring-[#CC785C]/20 rounded-2xl p-2 sm:p-2.5 transition-all shadow-card">
          <div className="flex items-center gap-3 px-2">
            <SearchIcon className="w-5 h-5 text-[#8C877D] shrink-0" />
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                searchType === 'keyword'
                  ? '输入方法论名称、提出者或关键词...'
                  : searchType === 'natural_language'
                  ? '描述你面临的现实困境（如：跨团队协作阻力、战略执行滞后）...'
                  : '描述业务场景，由 AI 推荐最佳方法论组合...'
              }
              className="w-full bg-transparent border-none py-2 text-xs sm:text-sm text-[#1F1E1B] placeholder-[#9E9A90] focus:outline-none min-w-0"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading || !queryText.trim()}
              className="px-4 py-2 bg-[#CC785C] hover:bg-[#B8684D] active:bg-[#A2583F] disabled:opacity-40 text-white rounded-xl text-xs font-medium transition-all shadow-soft shrink-0 flex items-center gap-1.5"
            >
              <span>{loading ? '推演中...' : '推演'}</span>
              <CornerDownLeft className="w-3.5 h-3.5 opacity-70" />
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
              className={`px-3 py-1 rounded-xl transition-all font-medium text-[11px] ${
                searchType === key
                  ? 'bg-[#CC785C] text-white shadow-soft font-semibold'
                  : 'text-[#68645C] hover:text-[#1F1E1B] bg-white border border-[#EAE6DF]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 示例启发 */}
      {!result && !loading && (
        <div className="space-y-3 pt-3">
          <div className="text-[11px] font-sans text-[#8C877D] uppercase tracking-wider text-center">
            点击快速探索经典困局解法
          </div>
          <div className="flex flex-col gap-2">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => {
                  setQueryText(ex)
                  handleSearch(ex)
                }}
                className="text-xs bg-white hover:bg-[#FAF9F5] border border-[#EAE6DF] hover:border-[#CC785C]/60 text-[#4A4741] hover:text-[#1F1E1B] px-4 py-2.5 rounded-xl transition-all duration-150 text-left shadow-soft flex items-center justify-between group"
              >
                <span className="flex items-center gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-[#CC785C] shrink-0" />
                  <span>{ex}</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#A39E93] group-hover:text-[#CC785C] group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="card p-4 border-rose-200 bg-rose-50 text-xs text-rose-800">
          {error}
        </div>
      )}

      {/* 搜索推演结果 (Claude Artifacts 级精细排版) */}
      {result && (
        <div className="space-y-6 pt-2">
          {/* AI 组合方案报告 */}
          {result.aiAnalysis && (
            <div className="bg-white border border-[#EAE6DF] rounded-2xl p-5 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-3">
                <div className="flex items-center gap-2 text-xs font-serif font-medium text-[#1F1E1B]">
                  <Sparkles className="w-4 h-4 text-[#CC785C]" />
                  <span>AI 方法论跨界推演报告</span>
                </div>
                <span className="text-[10px] font-sans px-2 py-0.5 rounded-md bg-[#FAF0EB] text-[#B8684D] border border-[#F0DED3]">
                  多模型协同
                </span>
              </div>

              {/* 理解 */}
              <div className="text-xs text-[#4A4741] bg-[#FAF9F5] p-3.5 rounded-xl border border-[#EAE6DF] leading-relaxed">
                <strong className="text-[#1F1E1B] block mb-1 font-serif text-sm">问题本质解构：</strong>
                {result.aiAnalysis.problemUnderstanding}
              </div>

              {/* 组合方案 */}
              {result.aiAnalysis.recommendedCombination && (
                <div className="space-y-1.5">
                  <h3 className="font-serif text-sm font-medium text-[#1F1E1B]">推荐组合解法</h3>
                  <p className="text-xs text-[#4A4741] leading-relaxed bg-[#FAF9F5] p-3.5 rounded-xl border border-[#EAE6DF]">
                    {result.aiAnalysis.recommendedCombination}
                  </p>
                </div>
              )}

              {/* 步骤 */}
              {result.aiAnalysis.executionSteps && result.aiAnalysis.executionSteps.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-serif text-sm font-medium text-[#1F1E1B]">行动落地路径</h3>
                  <div className="space-y-1.5">
                    {result.aiAnalysis.executionSteps.map((st, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-[#4A4741] p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE6DF] leading-relaxed">
                        <span className="w-4 h-4 rounded-full bg-[#FAF0EB] text-[#B8684D] text-[10px] flex items-center justify-center shrink-0 font-serif mt-0.5 font-medium border border-[#F0DED3]">
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
            <div className="flex items-center justify-between text-xs text-[#8C877D] font-serif italic px-1">
              <span>关联方法论档案 ({result.methods.length})</span>
              <span>相关度排序</span>
            </div>

            <div className="space-y-2.5">
              {result.methods.map((hit) => {
                const m = hit.method
                return (
                  <div
                    key={m.id}
                    onClick={() => navigate(`/library/${m.id}`)}
                    className="bg-white border border-[#EAE6DF] rounded-2xl p-4 cursor-pointer hover:border-[#CC785C]/60 hover:shadow-card transition-all group flex flex-col sm:flex-row sm:items-start justify-between gap-3 overflow-hidden"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 min-w-0 flex-wrap sm:flex-nowrap">
                        <h4 className="font-serif text-base font-medium text-[#1F1E1B] group-hover:text-[#9E543C] transition-colors truncate min-w-0">
                          {m.name}
                        </h4>
                        <div className="shrink-0">
                          <EvidenceBadge level={m.evidence?.level ?? 'unverified'} />
                        </div>
                      </div>
                      <p className="text-xs text-[#57534D] line-clamp-2 break-words leading-relaxed">
                        {m.content?.summary}
                      </p>
                      {hit.relevanceReason && (
                        <div className="text-[11px] text-[#8C877D] truncate">
                          推演契合点：{hit.relevanceReason}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-start pt-0 sm:pt-1">
                      <span className="text-xs text-[#CC785C] font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        <span>研读</span>
                        <ArrowRight className="w-3.5 h-3.5" />
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
