import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Sparkles, Plus, Trash2, HelpCircle } from 'lucide-react'
import { methodsDB, domainsDB } from '../services/db'
import { useAppStore } from '../stores'
import { researchMethod } from '../services/aiResearch'
import TagInput from '../components/TagInput'
import LoadingSpinner from '../components/LoadingSpinner'
import type { Method, Step, Source, MethodType, EvidenceLevel, MethodStatus } from '../types'
import { v4 as uuidv4 } from 'uuid'

export default function MethodEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = !id || id === 'new'
  const { domains, addNotification, loadDashboardStats } = useAppStore()

  const [loading, setLoading] = useState(!isNew)
  const [aiGenerating, setAiGenerating] = useState(false)

  // 核心表单状态
  const [name, setName] = useState('')
  const [aliases, setAliases] = useState<string[]>([])
  const [selectedDomains, setSelectedDomains] = useState<string[]>([])
  const [type, setType] = useState<MethodType>('model')
  const [layer, setLayer] = useState<1 | 2 | 3>(2)
  const [status, setStatus] = useState<MethodStatus>('active')

  // 渊源与出处
  const [proposer, setProposer] = useState('')
  const [proposerBio, setProposerBio] = useState('')
  const [year, setYear] = useState<number | undefined>(undefined)
  const [sources, setSources] = useState<Source[]>([])

  // 核心内容
  const [summary, setSummary] = useState('')
  const [coreIdea, setCoreIdea] = useState('')
  const [principles, setPrinciples] = useState<string[]>([])
  const [mechanism, setMechanism] = useState('')
  const [scenarios, setScenarios] = useState<string[]>([])
  const [conditions, setConditions] = useState<string[]>([])
  const [steps, setSteps] = useState<Step[]>([])
  const [advantages, setAdvantages] = useState<string[]>([])
  const [limitations, setLimitations] = useState<string[]>([])
  const [misconceptions, setMisconceptions] = useState<string[]>([])
  const [fullArticle, setFullArticle] = useState('')

  // 证据
  const [evidenceLevel, setEvidenceLevel] = useState<EvidenceLevel>('medium')
  const [confidence, setConfidence] = useState<number>(85)
  const [evidenceNotes, setEvidenceNotes] = useState('')

  // 标签
  const [tags, setTags] = useState<string[]>([])

  // 加载已有方法论
  useEffect(() => {
    if (!isNew && id) {
      setLoading(true)
      methodsDB.get(id).then(m => {
        if (!m) {
          addNotification({ type: 'error', title: '未找到该方法论' })
          navigate('/library')
          return
        }
        setName(m.name || '')
        setAliases(m.aliases || [])
        setSelectedDomains(m.domains || [])
        setType(m.type || 'model')
        setLayer(m.layer || 2)
        setStatus(m.status || 'active')

        setProposer(m.origin?.proposer || '')
        setProposerBio(m.origin?.proposerBio || '')
        setYear(m.origin?.year)
        setSources(m.origin?.sources || [])

        setSummary(m.content?.summary || '')
        setCoreIdea(m.content?.coreIdea || '')
        setPrinciples(m.content?.principles || [])
        setMechanism(m.content?.mechanism || '')
        setScenarios(m.content?.scenarios || [])
        setConditions(m.content?.conditions || [])
        setSteps(m.content?.steps || [])
        setAdvantages(m.content?.advantages || [])
        setLimitations(m.content?.limitations || [])
        setMisconceptions(m.content?.misconceptions || [])
        setFullArticle(m.content?.fullArticle || '')

        setEvidenceLevel(m.evidence?.level || 'medium')
        setConfidence(m.evidence?.confidence ?? 80)
        setEvidenceNotes(m.evidence?.notes || '')
        setTags(m.tags || [])
      }).finally(() => setLoading(false))
    }
  }, [id, isNew, navigate, addNotification])

  // AI 辅助补全/扩写
  const handleAIAssist = async () => {
    if (!name.trim()) {
      addNotification({ type: 'warning', title: '请先输入方法论名称' })
      return
    }

    setAiGenerating(true)
    try {
      const { items: existing } = await methodsDB.getAll()
      const result = await researchMethod(name, existing, { deepth: 'standard' })

      if (!result.success || !result.draft) {
        addNotification({ type: 'error', title: 'AI 整理失败', message: result.error || '未能生成完整档案' })
        return
      }

      const d = result.draft
      if (d.aliases?.length && aliases.length === 0) setAliases(d.aliases)
      if (d.domains?.length && selectedDomains.length === 0) setSelectedDomains(d.domains)
      if (d.type) setType(d.type)
      if (d.layer) setLayer(d.layer)
      if (d.origin?.proposer && !proposer) setProposer(d.origin.proposer)
      if (d.origin?.proposerBio && !proposerBio) setProposerBio(d.origin.proposerBio)
      if (d.origin?.sources?.length && sources.length === 0) setSources(d.origin.sources)

      if (d.content?.summary && !summary) setSummary(d.content.summary)
      if (d.content?.coreIdea && !coreIdea) setCoreIdea(d.content.coreIdea)
      if (d.content?.principles?.length && principles.length === 0) setPrinciples(d.content.principles)
      if (d.content?.mechanism && !mechanism) setMechanism(d.content.mechanism)
      if (d.content?.scenarios?.length && scenarios.length === 0) setScenarios(d.content.scenarios)
      if (d.content?.conditions?.length && conditions.length === 0) setConditions(d.content.conditions)
      if (d.content?.steps?.length && steps.length === 0) setSteps(d.content.steps)
      if (d.content?.advantages?.length && advantages.length === 0) setAdvantages(d.content.advantages)
      if (d.content?.limitations?.length && limitations.length === 0) setLimitations(d.content.limitations)
      if (d.content?.misconceptions?.length && misconceptions.length === 0) setMisconceptions(d.content.misconceptions)
      if (d.content?.fullArticle && !fullArticle) setFullArticle(d.content.fullArticle)

      if (d.evidence?.level) setEvidenceLevel(d.evidence.level)
      if (d.tags?.length && tags.length === 0) setTags(d.tags)

      addNotification({ type: 'success', title: 'AI 辅助生成完成', message: '已自动填入标准化结构档案，请核对与补充' })
    } catch (err) {
      addNotification({ type: 'error', title: 'AI 辅助调用失败', message: (err as Error).message })
    } finally {
      setAiGenerating(false)
    }
  }

  // 步骤增删改
  const addStep = () => {
    setSteps([
      ...steps,
      {
        order: steps.length + 1,
        title: '',
        description: '',
        tips: [],
        warnings: []
      }
    ])
  }

  const updateStep = (index: number, field: keyof Step, val: any) => {
    const next = [...steps]
    next[index] = { ...next[index], [field]: val }
    setSteps(next)
  }

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index).map((s, idx) => ({ ...s, order: idx + 1 })))
  }

  // 领域勾选切换
  const toggleDomain = (domainId: string) => {
    if (selectedDomains.includes(domainId)) {
      setSelectedDomains(selectedDomains.filter(d => d !== domainId))
    } else {
      setSelectedDomains([...selectedDomains, domainId])
    }
  }

  // 保存提交
  const handleSave = async (targetStatus?: MethodStatus) => {
    if (!name.trim()) {
      addNotification({ type: 'warning', title: '方法论名称不能为空' })
      return
    }

    if (selectedDomains.length === 0) {
      addNotification({ type: 'warning', title: '请至少选择一个所属领域' })
      return
    }

    try {
      const finalId = isNew ? `method_${name.toLowerCase().replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, '_')}_${uuidv4().slice(0, 6)}` : id!
      const saveStatus = targetStatus || status

      const methodData: Method = {
        id: finalId,
        name: name.trim(),
        aliases: aliases.filter(Boolean),
        domains: selectedDomains,
        subDomains: [],
        type,
        layer,
        origin: {
          proposer: proposer.trim(),
          proposerBio: proposerBio.trim(),
          year: year ? Number(year) : undefined,
          sources
        },
        content: {
          summary: summary.trim(),
          coreIdea: coreIdea.trim(),
          principles: principles.filter(Boolean),
          mechanism: mechanism.trim(),
          scenarios: scenarios.filter(Boolean),
          conditions: conditions.filter(Boolean),
          steps: steps.filter(s => s.title.trim()),
          advantages: advantages.filter(Boolean),
          limitations: limitations.filter(Boolean),
          misconceptions: misconceptions.filter(Boolean),
          fullArticle: fullArticle.trim()
        },
        evidence: {
          level: evidenceLevel,
          claims: [],
          confidence,
          notes: evidenceNotes.trim()
        },
        cases: [],
        relations: [],
        tags: tags.filter(Boolean),
        status: saveStatus,
        stats: {
          viewCount: 0,
          practiceCount: 0,
          learningCount: 0,
          avgRating: 5.0
        },
        aiMeta: {
          researchedBy: 'Manual / AI Assisted',
          researchedAt: new Date().toISOString(),
          qualityScore: 90,
          contentWarnings: []
        },
        version: 1,
        versionHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await methodsDB.save(methodData)

      // 更新对应领域计数
      for (const domId of selectedDomains) {
        await domainsDB.updateCount(domId, 1)
      }

      await loadDashboardStats()
      addNotification({
        type: 'success',
        title: isNew ? '方法论档案已创建' : '方法论档案已更新',
        message: `状态：${saveStatus === 'active' ? '正式入库' : saveStatus === 'draft' ? '草稿' : '待审核'}`
      })

      navigate(`/library/${finalId}`)
    } catch (err) {
      addNotification({ type: 'error', title: '保存失败', message: (err as Error).message })
    }
  }

  if (loading) {
    return <LoadingSpinner text="加载档案数据中..." />
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* 顶部标题与保存条 */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-stone-500 hover:text-stone-800 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAIAssist}
            disabled={aiGenerating}
            className="btn bg-purple-600/30 hover:bg-purple-600/40 text-purple-300 border border-purple-500/40 text-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{aiGenerating ? 'AI 智能扩写中...' : 'AI 辅助扩写'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave('draft')}
            className="btn-secondary text-xs"
          >
            存为草稿
          </button>

          <button
            type="button"
            onClick={() => handleSave('active')}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isNew ? '创建并入库' : '保存更新'}</span>
          </button>
        </div>
      </div>

      <div className="card p-6 space-y-6">
        <h2 className="text-xl font-bold text-stone-900 border-b border-stone-200 pb-3">
          {isNew ? '创建新方法论档案' : `编辑方法论：${name}`}
        </h2>

        {/* 基础信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">方法论标准中文名称 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：PDCA循环、第一性原理、费曼学习法"
              className="input text-base font-semibold"
            />
          </div>

          <div>
            <label className="label">常见别名 / 英文名称</label>
            <TagInput
              value={aliases}
              onChange={setAliases}
              placeholder="输入别名后回车添加，如：戴明环、Plan-Do-Check-Act"
            />
          </div>

          <div>
            <label className="label">方法论类型</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as MethodType)}
              className="select"
            >
              <option value="model">模型 (Mental Model)</option>
              <option value="process">流程 (Process / Loop)</option>
              <option value="framework">框架 (Framework)</option>
              <option value="principle">原则 (Principle / Law)</option>
              <option value="tool">工具 (Tool / Canvas)</option>
              <option value="theory">理论 (Theory)</option>
              <option value="other">其他</option>
            </select>
          </div>

          <div>
            <label className="label">知识架构层级</label>
            <select
              value={layer}
              onChange={(e) => setLayer(Number(e.target.value) as 1 | 2 | 3)}
              className="select"
            >
              <option value={1}>第一层：通用方法论（普遍适用）</option>
              <option value={2}>第二层：专业领域方法论（八大领域垂直）</option>
              <option value={3}>第三层：跨领域关联（复合衍生）</option>
            </select>
          </div>

          <div>
            <label className="label">证据可信度等级</label>
            <select
              value={evidenceLevel}
              onChange={(e) => setEvidenceLevel(e.target.value as EvidenceLevel)}
              className="select"
            >
              <option value="high">高可信（经严谨科学/学术检验或行业实证）</option>
              <option value="medium">中等可信（广泛实践认可，部分学术支持）</option>
              <option value="low">低可信（主要为个人经验法则）</option>
              <option value="unverified">待验证（新出现或尚缺乏独立检验）</option>
              <option value="disputed">存疑（学术界或实践界存在较大争议）</option>
            </select>
          </div>
        </div>

        {/* 所属领域（多选） */}
        <div>
          <label className="label">所属领域（八大知识领域，可多选） *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {domains.map((dom) => {
              const checked = selectedDomains.includes(dom.id)
              return (
                <button
                  type="button"
                  key={dom.id}
                  onClick={() => toggleDomain(dom.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs text-left transition-all ${
                    checked
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-medium'
                      : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <span className="text-base">{dom.icon}</span>
                  <span className="truncate">{dom.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 渊源出处 */}
        <div className="pt-4 border-t border-stone-200 space-y-4">
          <h3 className="text-sm font-semibold text-stone-800">理论渊源与提出者</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="label">提出者 / 创始人</label>
              <input
                type="text"
                value={proposer}
                onChange={(e) => setProposer(e.target.value)}
                placeholder="如：理查德·费曼、德怀特·艾森豪威尔"
                className="input text-sm"
              />
            </div>
            <div>
              <label className="label">首次提出年份</label>
              <input
                type="number"
                value={year || ''}
                onChange={(e) => setYear(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="如：1950 或 -330"
                className="input text-sm"
              />
            </div>
            <div>
              <label className="label">提出者身份简介</label>
              <input
                type="text"
                value={proposerBio}
                onChange={(e) => setProposerBio(e.target.value)}
                placeholder="如：诺贝尔物理学奖得主"
                className="input text-sm"
              />
            </div>
          </div>
        </div>

        {/* 核心内容 */}
        <div className="pt-4 border-t border-stone-200 space-y-4">
          <h3 className="text-sm font-semibold text-stone-800">核心内容与运行机制</h3>

          <div>
            <label className="label">一句话概述（卡片展示用，30-50字） *</label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="概括该方法论是解决什么问题的什么工具..."
              className="input text-sm"
            />
          </div>

          <div>
            <label className="label">核心思想 (Core Idea) *</label>
            <textarea
              rows={2}
              value={coreIdea}
              onChange={(e) => setCoreIdea(e.target.value)}
              placeholder="该方法论的最根本洞察是什么..."
              className="textarea text-sm"
            />
          </div>

          <div>
            <label className="label">运行原理 (Mechanism / 为什么有效)</label>
            <textarea
              rows={2}
              value={mechanism}
              onChange={(e) => setMechanism(e.target.value)}
              placeholder="从心理学、统计学、系统论等角度阐述为什么能够起效..."
              className="textarea text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">适用场景 (Scenarios)</label>
              <TagInput
                value={scenarios}
                onChange={setScenarios}
                placeholder="输入场景回车，如：跨部门协同、重大战略决策"
              />
            </div>
            <div>
              <label className="label">适用条件 / 假设前提 (Conditions)</label>
              <TagInput
                value={conditions}
                onChange={setConditions}
                placeholder="输入成立前提，如：具备可量化度量基准"
              />
            </div>
          </div>
        </div>

        {/* 可操作步骤 */}
        <div className="pt-4 border-t border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-stone-800">标准操作步骤 (Steps)</h3>
              <p className="text-xs text-stone-500">指导用户在真实场景中一步步落地的 SOP</p>
            </div>
            <button
              type="button"
              onClick={addStep}
              className="btn-secondary text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>添加步骤</span>
            </button>
          </div>

          {steps.length === 0 ? (
            <div className="p-4 rounded-lg bg-stone-50 border border-dashed border-stone-200 text-center text-xs text-stone-400">
              暂无具体步骤，点击右上角“添加步骤”或使用 AI 辅助扩写生成
            </div>
          ) : (
            <div className="space-y-3">
              {steps.map((st, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-white border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-300 text-xs flex items-center justify-center font-bold">
                      {st.order || idx + 1}
                    </span>
                    <input
                      type="text"
                      value={st.title}
                      onChange={(e) => updateStep(idx, 'title', e.target.value)}
                      placeholder={`步骤 ${idx + 1} 标题（如：明确问题本质）`}
                      className="input text-xs font-medium py-1.5 flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeStep(idx)}
                      className="text-stone-400 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={st.description}
                    onChange={(e) => updateStep(idx, 'description', e.target.value)}
                    placeholder="详细操作说明与关键交付物..."
                    className="textarea text-xs py-1.5"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 优缺点、局限与误区 */}
        <div className="pt-4 border-t border-stone-200 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label text-emerald-300">核心优点 (Advantages)</label>
            <TagInput
              value={advantages}
              onChange={setAdvantages}
              placeholder="回车添加优点"
            />
          </div>
          <div>
            <label className="label text-yellow-300">不足与局限 (Limitations)</label>
            <TagInput
              value={limitations}
              onChange={setLimitations}
              placeholder="回车添加局限"
            />
          </div>
          <div>
            <label className="label text-red-300">常见误区 (Misconceptions)</label>
            <TagInput
              value={misconceptions}
              onChange={setMisconceptions}
              placeholder="回车添加误区"
            />
          </div>
        </div>

        {/* 标签 */}
        <div className="pt-4 border-t border-stone-200">
          <label className="label">标签 (Tags)</label>
          <TagInput
            value={tags}
            onChange={setTags}
            placeholder="输入标签回车，如：执行力、认知升级、敏捷"
          />
        </div>

        {/* 完整深度研究文章 (Markdown) */}
        <div className="pt-4 border-t border-stone-200 space-y-2">
          <div className="flex items-center justify-between">
            <label className="label mb-0">完整研究报告 (Markdown 文章)</label>
            <span className="text-xs text-stone-400">支持标准 GitHub Flavored Markdown 语法</span>
          </div>
          <textarea
            rows={10}
            value={fullArticle}
            onChange={(e) => setFullArticle(e.target.value)}
            placeholder="# 理论背景与深度拆解&#10;&#10;## 一、历史背景...&#10;&#10;## 二、核心运作机理..."
            className="textarea font-mono text-xs leading-relaxed"
          />
        </div>
      </div>
    </div>
  )
}
