import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Search, Download, Upload, RefreshCw, X, SlidersHorizontal } from 'lucide-react'
import { useMethodsStore, useAppStore } from '../stores'
import { methodsDB } from '../services/db'
import MethodCard from '../components/MethodCard'
import EmptyState from '../components/EmptyState'
import type { Method } from '../types'

export default function Library() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { domains, addNotification, loadDashboardStats } = useAppStore()
  const { methods, loadMethods } = useMethodsStore()

  // 筛选与搜索状态
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [selectedDomain, setSelectedDomain] = useState<string | null>(searchParams.get('domain') || null)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedLayer, setSelectedLayer] = useState<string>('all')
  const [selectedEvidence, setSelectedEvidence] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'updatedAt' | 'name' | 'views' | 'practice'>('updatedAt')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadMethods({ reset: true })
  }, [loadMethods])

  // 本地过滤与排序
  const filteredMethods = useMemo(() => {
    return methods.filter(m => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        const matchName = m.name?.toLowerCase().includes(q)
        const matchAlias = m.aliases?.some(a => a.toLowerCase().includes(q))
        const matchSummary = m.content?.summary?.toLowerCase().includes(q)
        const matchTags = m.tags?.some(t => t.toLowerCase().includes(q))
        const matchProposer = m.origin?.proposer?.toLowerCase().includes(q)
        if (!matchName && !matchAlias && !matchSummary && !matchTags && !matchProposer) {
          return false
        }
      }

      if (selectedDomain && !m.domains?.includes(selectedDomain)) {
        return false
      }

      if (selectedType !== 'all' && m.type !== selectedType) {
        return false
      }

      if (selectedLayer !== 'all' && m.layer !== Number(selectedLayer)) {
        return false
      }

      if (selectedEvidence !== 'all' && m.evidence?.level !== selectedEvidence) {
        return false
      }

      if (selectedStatus !== 'all' && m.status !== selectedStatus) {
        return false
      }

      return true
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'zh-CN')
      if (sortBy === 'views') return (b.stats?.viewCount || 0) - (a.stats?.viewCount || 0)
      if (sortBy === 'practice') return (b.stats?.practiceCount || 0) - (a.stats?.practiceCount || 0)
      return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
    })
  }, [methods, searchTerm, selectedDomain, selectedType, selectedLayer, selectedEvidence, selectedStatus, sortBy])

  const handleDomainSelect = (domainId: string | null) => {
    setSelectedDomain(domainId)
    if (domainId) {
      searchParams.set('domain', domainId)
    } else {
      searchParams.delete('domain')
    }
    setSearchParams(searchParams)
  }

  const handleExportJSON = async () => {
    try {
      const { items: all } = await methodsDB.getAll()
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(all, null, 2))
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute('href', dataStr)
      downloadAnchor.setAttribute('download', `cogito_methodologies_${new Date().toISOString().slice(0, 10)}.json`)
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()
      addNotification({ type: 'success', title: '导出成功', message: `已导出 ${all.length} 条方法论档案` })
    } catch (err) {
      addNotification({ type: 'error', title: '导出失败', message: (err as Error).message })
    }
  }

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string
          const parsed = JSON.parse(content)
          const items: Method[] = Array.isArray(parsed) ? parsed : [parsed]

          let importedCount = 0
          for (const item of items) {
            if (item.name && item.id) {
              await methodsDB.save(item)
              importedCount++
            }
          }

          await loadMethods({ reset: true })
          await loadDashboardStats()
          addNotification({
            type: 'success',
            title: '导入完成',
            message: `成功导入 ${importedCount} 条方法论`
          })
        } catch {
          addNotification({ type: 'error', title: '导入失败', message: '文件格式非合法的 JSON 数据' })
        }
      }
      reader.readAsText(file)
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedDomain(null)
    setSelectedType('all')
    setSelectedLayer('all')
    setSelectedEvidence('all')
    setSelectedStatus('all')
    setSortBy('updatedAt')
    setSearchParams({})
  }

  const hasActiveFilters = searchTerm || selectedDomain || selectedType !== 'all' || selectedLayer !== 'all' || selectedEvidence !== 'all' || selectedStatus !== 'all'

  return (
    <div className="space-y-6">
      {/* 顶部标题栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 pb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500">Cogito · Library</span>
            <span className="badge-zinc text-[10px]">{filteredMethods.length} 条收录</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 truncate">方法论知识库</h1>
          <p className="text-xs text-stone-500 mt-0.5 truncate">
            标准化结构档案、多维检验证据与跨领域关联体系
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJSON}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary text-xs"
            title="导入 JSON"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>导入</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="btn-secondary text-xs"
            title="导出全部档案"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出</span>
          </button>
          <button
            onClick={() => navigate('/library/new')}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新建档案</span>
          </button>
        </div>
      </div>

      {/* 搜索与主筛选卡片 */}
      <div className="card p-4 space-y-3.5">
        <div className="flex flex-col md:flex-row gap-2.5">
          {/* 搜索框 */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="按名称、别名、核心思想、标签或创始人搜索..."
              className="input pl-10 pr-9 text-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 排序与高级筛选按钮 */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="select text-xs py-2 w-auto"
            >
              <option value="updatedAt">最近更新</option>
              <option value="name">名称字母序</option>
              <option value="views">热度/浏览</option>
              <option value="practice">实践次数</option>
            </select>

            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`btn text-xs px-3.5 py-2 ${
                isFilterOpen
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'btn-secondary'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>筛选</span>
            </button>
          </div>
        </div>

        {/* 展开式高级过滤器 */}
        {isFilterOpen && (
          <div className="pt-3 border-t border-stone-200/70 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="label">知识架构层级</label>
              <select
                value={selectedLayer}
                onChange={(e) => setSelectedLayer(e.target.value)}
                className="select text-xs py-1.5"
              >
                <option value="all">全部层级</option>
                <option value="1">第一层：通用方法论</option>
                <option value="2">第二层：专业领域方法论</option>
                <option value="3">第三层：跨领域关联</option>
              </select>
            </div>

            <div>
              <label className="label">方法论类型</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="select text-xs py-1.5"
              >
                <option value="all">全部类型</option>
                <option value="model">模型 (Model)</option>
                <option value="process">流程 (Process)</option>
                <option value="framework">框架 (Framework)</option>
                <option value="principle">原则 (Principle)</option>
                <option value="tool">工具 (Tool)</option>
                <option value="theory">理论 (Theory)</option>
              </select>
            </div>

            <div>
              <label className="label">证据等级</label>
              <select
                value={selectedEvidence}
                onChange={(e) => setSelectedEvidence(e.target.value)}
                className="select text-xs py-1.5"
              >
                <option value="all">全部等级</option>
                <option value="high">高可信度 (High)</option>
                <option value="medium">中等可信度 (Medium)</option>
                <option value="low">经验性 (Low)</option>
                <option value="unverified">待验证 (Unverified)</option>
                <option value="disputed">存疑 (Disputed)</option>
              </select>
            </div>

            <div>
              <label className="label">状态</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="select text-xs py-1.5"
              >
                <option value="all">全部状态</option>
                <option value="active">已收录</option>
                <option value="pending_review">待审核</option>
                <option value="draft">草稿</option>
                <option value="disputed">存疑</option>
              </select>
            </div>
          </div>
        )}

        {/* 八大领域水平切换按钮 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar text-xs">
          <button
            onClick={() => handleDomainSelect(null)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all duration-150 ${
              selectedDomain === null
                ? 'bg-stone-900 text-white font-semibold shadow-soft'
                : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200/70 border border-stone-200'
            }`}
          >
            全部 ({methods.length})
          </button>
          {domains.map((dom) => {
            const isSelected = selectedDomain === dom.id
            const count = methods.filter(m => m.domains?.includes(dom.id)).length
            return (
              <button
                key={dom.id}
                onClick={() => handleDomainSelect(isSelected ? null : dom.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all duration-150 ${
                  isSelected
                    ? 'bg-stone-900 text-white font-semibold shadow-soft'
                    : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200/70 border border-stone-200'
                }`}
              >
                <span>{dom.name}</span>
                <span className={`text-[10px] font-mono px-1 rounded ${
                  isSelected ? 'bg-stone-800 text-stone-200' : 'bg-white text-stone-500 border border-stone-200'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between text-xs pt-1 text-stone-500 border-t border-stone-200/70">
            <span>筛选结果：{filteredMethods.length} 项</span>
            <button
              onClick={handleResetFilters}
              className="text-stone-700 hover:text-stone-950 flex items-center gap-1 font-medium transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>清空筛选</span>
            </button>
          </div>
        )}
      </div>

      {/* 列表内容区 */}
      {filteredMethods.length === 0 ? (
        <EmptyState
          icon="📚"
          title="未找到匹配的方法论"
          description={
            hasActiveFilters
              ? '建议调整关键词或清空筛选条件'
              : '知识库中尚无档案，可新建或通过 AI 深度研究中心自动挖掘'
          }
          action={{
            label: hasActiveFilters ? '重置筛选条件' : '新建方法论档案',
            onClick: hasActiveFilters ? handleResetFilters : () => navigate('/library/new')
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredMethods.map((method) => (
            <MethodCard
              key={method.id}
              method={method}
              onClick={() => navigate(`/library/${method.id}`)}
              showActions={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}
