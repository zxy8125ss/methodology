import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import * as d3 from 'd3'
import { methodsDB, relationsDB, domainsDB } from '../services/db'
import type { Method, Domain, GraphNode, GraphEdge } from '../types'
import { INITIAL_DOMAINS } from '../data/initialData'

interface SimNode extends d3.SimulationNodeDatum, GraphNode {}
interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  edge: GraphEdge
}

export default function Graph() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [loading, setLoading] = useState(true)
  const [filterDomain, setFilterDomain] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [nodeCount, setNodeCount] = useState(0)
  const [edgeCount, setEdgeCount] = useState(0)
  const simulationRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null)

  const domainColors: Record<string, string> = {}
  INITIAL_DOMAINS.forEach(d => { domainColors[d.id] = d.color })

  const getNodeColor = (node: GraphNode) => {
    if (node.type === 'domain') return '#78716c'
    if (node.type === 'method') {
      const method = node.data as Method | undefined
      if (method?.layer === 1) return '#1c1917'
      if (method?.layer === 2) return '#44403c'
      return '#78716c'
    }
    return '#a8a29e'
  }

  const buildGraph = useCallback(async () => {
    setLoading(true)
    try {
      const { items: methods } = await methodsDB.getAll({ status: 'active' })
      const domains = await domainsDB.getAll()
      const relations = await relationsDB.getAll()

      let filteredMethods = methods
      if (filterDomain) filteredMethods = methods.filter(m => m.domains.includes(filterDomain))
      if (filterType !== 'all') filteredMethods = filteredMethods.filter(m => m.type === filterType)
      
      // 限制节点数量避免性能问题
      filteredMethods = filteredMethods.slice(0, 80)

      const nodes: SimNode[] = []
      const edges: SimLink[] = []

      // 添加方法论节点
      const methodNodeIds = new Set<string>()
      for (const method of filteredMethods) {
        const node: SimNode = {
          id: method.id,
          type: 'method',
          label: method.name,
          description: method.content.summary,
          radius: method.layer === 1 ? 18 : method.layer === 2 ? 14 : 10,
          data: method
        }
        nodes.push(node)
        methodNodeIds.add(method.id)
      }

      // 添加领域节点（如果没有按领域过滤）
      if (!filterDomain) {
        for (const domain of domains.filter(d => d.methodCount > 0)) {
          nodes.push({
            id: `domain_${domain.id}`,
            type: 'domain',
            label: domain.name,
            description: domain.description,
            radius: 24,
            data: domain
          })
          // 领域-方法论边
          for (const method of filteredMethods.filter(m => m.domains.includes(domain.id))) {
            edges.push({
              source: `domain_${domain.id}`,
              target: method.id,
              edge: {
                id: `d_${domain.id}_${method.id}`,
                source: `domain_${domain.id}`,
                target: method.id,
                type: 'applied_to',
                label: '包含',
                strength: 'weak'
              }
            })
          }
        }
      }

      // 添加方法论间关系边
      for (const relation of relations) {
        if (methodNodeIds.has(relation.fromMethodId) && methodNodeIds.has(relation.toMethodId)) {
          edges.push({
            source: relation.fromMethodId,
            target: relation.toMethodId,
            edge: {
              id: relation.id,
              source: relation.fromMethodId,
              target: relation.toMethodId,
              type: relation.type,
              label: getRelationLabel(relation.type),
              strength: relation.strength
            }
          })
        }
      }

      setNodeCount(nodes.length)
      setEdgeCount(edges.length)

      renderGraph(nodes, edges)
    } finally {
      setLoading(false)
    }
  }, [filterDomain, filterType])

  function getRelationLabel(type: string): string {
    const labels: Record<string, string> = {
      parent_child: '上下位', complementary: '互补', similar: '相似',
      conflicting: '冲突', combined_use: '组合', evolved_from: '演化', applied_to: '应用'
    }
    return labels[type] ?? type
  }

  function getEdgeColor(type: string): string {
    const colors: Record<string, string> = {
      parent_child: '#6366f1', complementary: '#10b981', similar: '#f59e0b',
      conflicting: '#ef4444', combined_use: '#3b82f6', evolved_from: '#8b5cf6', applied_to: '#94a3b8'
    }
    return colors[type] ?? '#475569'
  }

  const renderGraph = useCallback((nodes: SimNode[], links: SimLink[]) => {
    if (!svgRef.current) return
    
    // 清除旧内容
    d3.select(svgRef.current).selectAll('*').remove()
    if (simulationRef.current) simulationRef.current.stop()

    const container = svgRef.current.parentElement
    const width = container?.clientWidth ?? 800
    const height = container?.clientHeight ?? 600

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    // 缩放平移
    const g = svg.append('g')
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 3])
      .on('zoom', (event) => g.attr('transform', event.transform))
    svg.call(zoom)

    // 箭头标记
    svg.append('defs').selectAll('marker')
      .data(['arrow'])
      .join('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('fill', '#475569')
      .attr('d', 'M0,-5L10,0L0,5')

    // 力模拟
    const simulation = d3.forceSimulation<SimNode>(nodes)
      .force('link', d3.forceLink<SimNode, SimLink>(links).id(d => d.id).distance(80).strength(0.5))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<SimNode>(d => (d.radius ?? 12) + 8))

    simulationRef.current = simulation

    // 边
    const link = g.append('g').selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => getEdgeColor(d.edge.type))
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', d => d.edge.strength === 'strong' ? 2 : 1)
      .attr('marker-end', 'url(#arrow)')

    // 节点组
    const node = g.append('g').selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .on('click', (_, d) => setSelectedNode(d))
      .call(
        (d3.drag<any, any>() as any)
          .on('start', (event: any, d: any) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x; d.fy = d.y
          })
          .on('drag', (event: any, d: any) => { d.fx = event.x; d.fy = event.y })
          .on('end', (event: any, d: any) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null; d.fy = null
          })
      )

    // 节点圆形
    node.append('circle')
      .attr('r', d => d.radius ?? 12)
      .attr('fill', d => getNodeColor(d))
      .attr('fill-opacity', 0.9)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)

    // 节点文字
    node.append('text')
      .attr('dy', d => (d.radius ?? 12) + 12)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#44403c')
      .attr('font-weight', '500')
      .text(d => d.label.length > 8 ? d.label.slice(0, 8) + '…' : d.label)

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as SimNode).x ?? 0)
        .attr('y1', d => (d.source as SimNode).y ?? 0)
        .attr('x2', d => (d.target as SimNode).x ?? 0)
        .attr('y2', d => (d.target as SimNode).y ?? 0)

      node.attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`)
    })

    // 300个节点后降低动画质量
    if (nodes.length > 50) simulation.alphaDecay(0.05)
  }, [])

  useEffect(() => {
    buildGraph()
    return () => {
      simulationRef.current?.stop()
    }
  }, [buildGraph])

  const domains = INITIAL_DOMAINS

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 120px)' }}>
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h1 className="section-title">知识图谱</h1>
        <div className="flex items-center gap-2 text-sm text-muted ml-auto">
          <span>{nodeCount} 节点</span>
          <span>·</span>
          <span>{edgeCount} 关系</span>
        </div>

        {/* 领域过滤 */}
        <select
          value={filterDomain ?? ''}
          onChange={e => setFilterDomain(e.target.value || null)}
          className="select text-sm w-auto"
        >
          <option value="">全部领域</option>
          {domains.map(d => <option key={d.id} value={d.id}>{d.icon} {d.name}</option>)}
        </select>

        {/* 类型过滤 */}
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="select text-sm w-auto"
        >
          <option value="all">全部类型</option>
          <option value="theory">理论</option>
          <option value="model">模型</option>
          <option value="tool">工具</option>
          <option value="process">流程</option>
          <option value="framework">框架</option>
          <option value="principle">原则</option>
        </select>

        <button onClick={buildGraph} className="btn-secondary text-sm">刷新</button>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* 图谱 */}
        <div className="flex-1 relative card overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 z-10">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <div className="text-sm text-muted">构建图谱中...</div>
              </div>
            </div>
          )}
          <svg ref={svgRef} className="w-full h-full" />
          
          {/* 图例 */}
          <div className="absolute bottom-3 left-3 card p-2 text-xs space-y-1">
            <div className="text-muted font-medium mb-1">关系图例</div>
            {[
              { color: '#6366f1', label: '上下位' },
              { color: '#10b981', label: '互补' },
              { color: '#f59e0b', label: '相似' },
              { color: '#ef4444', label: '冲突' },
              { color: '#3b82f6', label: '组合使用' }
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className="w-4 h-0.5 rounded" style={{ backgroundColor: item.color }} />
                <span className="text-slate-400">{item.label}</span>
              </div>
            ))}
          </div>

          {/* 操作提示 */}
          <div className="absolute top-3 right-3 text-xs text-stone-500 bg-white/90 border border-stone-200 px-2 py-1 rounded-lg shadow-soft">
            滚轮缩放 · 拖拽平移 · 点击节点查看详情
          </div>
        </div>

        {/* 节点详情面板 */}
        {selectedNode && (
          <div className="w-72 card p-4 overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted uppercase">
                {selectedNode.type === 'method' ? '方法论' : selectedNode.type === 'domain' ? '领域' : '节点'}
              </span>
              <button onClick={() => setSelectedNode(null)} className="text-stone-400 hover:text-stone-700">×</button>
            </div>
            
            <h3 className="font-bold text-stone-900 text-base mb-2">{selectedNode.label}</h3>
            {selectedNode.description && (
              <p className="text-sm text-muted mb-4">{selectedNode.description}</p>
            )}

            {selectedNode.type === 'method' && selectedNode.data && (
              <div className="space-y-2">
                {(() => {
                  const m = selectedNode.data as Method
                  return (
                    <>
                      <div className="flex flex-wrap gap-1">
                        {m.domains?.map(d => (
                          <span key={d} className="badge badge-blue text-xs">{d}</span>
                        ))}
                      </div>
                      {m.origin?.proposer && (
                        <div className="text-xs text-muted">提出者：{m.origin.proposer}</div>
                      )}
                      <div className="text-xs text-muted">类型：{m.type}</div>
                      <div className="text-xs text-muted">证据：{m.evidence?.level}</div>
                      <Link
                        to={`/library/${m.id}`}
                        className="btn-primary text-xs mt-3 w-full justify-center"
                      >
                        查看详情 →
                      </Link>
                    </>
                  )
                })()}
              </div>
            )}

            {selectedNode.type === 'domain' && selectedNode.data && (
              <div className="space-y-2">
                {(() => {
                  const d = selectedNode.data as Domain
                  return (
                    <>
                      <div className="text-sm text-muted">{d.description}</div>
                      <div className="text-xs text-muted">方法论数：{d.methodCount}</div>
                      {d.subDomains?.slice(0, 5).map(sub => (
                        <div key={sub.id} className="text-xs text-slate-400">· {sub.name}</div>
                      ))}
                    </>
                  )
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
