import React from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  BookMarked,
  Sparkles,
  Search,
  Network,
  Compass,
  Settings,
  Layers
} from 'lucide-react'
import { useAppStore } from '../stores'

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: '工作台' },
  { path: '/library', icon: BookMarked, label: '知识库' },
  { path: '/research', icon: Sparkles, label: 'AI 研究' },
  { path: '/search', icon: Search, label: '智能推演' },
  { path: '/graph', icon: Network, label: '知识图谱' },
  { path: '/practice', icon: Compass, label: '实践与学习' },
  { path: '/settings', icon: Settings, label: '系统设置' }
]

export default function Layout() {
  const { stats } = useAppStore()
  const location = useLocation()

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 font-sans selection:bg-zinc-800">
      {/* 桌面端极简精致侧边栏 */}
      <aside className="hidden md:flex flex-col w-60 lg:w-64 bg-zinc-950/80 backdrop-blur-xl border-r border-zinc-900/90 flex-shrink-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-zinc-900/80">
          <div className="flex items-center gap-3">
            {/* Geometric Prism Icon */}
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-700/60 flex items-center justify-center p-1.5 shadow-sm">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <polygon points="50,15 85,35 50,55 15,35" fill="#f4f4f5" />
                <polygon points="85,35 85,75 50,95 50,55" fill="#a1a1aa" />
                <polygon points="15,35 50,55 50,95 15,75" fill="#52525b" />
                <polygon points="50,42 62,49 62,63 50,70 38,63 38,49" fill="#09090b" stroke="#ffffff" strokeWidth="2" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-zinc-100 text-sm tracking-tight flex items-center gap-1.5">
                <span>Cogito</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">V1.0</span>
              </div>
              <div className="text-[11px] text-zinc-400 font-mono">方法论与认知系统</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const isPendingReviews = item.path === '/research' && stats && stats.pendingReviews > 0

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-zinc-800/90 text-white shadow-sm border border-zinc-700/50 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 transition-transform duration-150 group-hover:scale-105" />
                <span className="flex-1">{item.label}</span>
                {isPendingReviews && (
                  <span className="bg-amber-400 text-zinc-950 font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                    {stats?.pendingReviews}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* 底部信息与数据资产概览 */}
        <div className="p-4 border-t border-zinc-900/80 bg-zinc-900/20">
          <div className="text-[11px] text-zinc-400 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-zinc-400" />
                <span>方法论资产</span>
              </span>
              <span className="text-zinc-300 font-mono font-medium">{stats?.totalMethods ?? 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>进行中实践</span>
              <span className="text-zinc-300 font-mono font-medium">{stats?.activePractices ?? 0}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* 主视图区域 */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-zinc-950">
        {/* 移动端精致顶部栏 */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-900 safe-top">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700/60 flex items-center justify-center p-1">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <polygon points="50,15 85,35 50,55 15,35" fill="#f4f4f5" />
                <polygon points="85,35 85,75 50,95 50,55" fill="#a1a1aa" />
                <polygon points="15,35 50,55 50,95 15,75" fill="#52525b" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-zinc-100 text-sm tracking-tight">Cogito</span>
              <span className="text-[10px] text-zinc-400 ml-1.5">方法论系统</span>
            </div>
          </div>
          <div className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
            {stats?.totalMethods ?? 0} 档案
          </div>
        </header>

        {/* 内容容器 */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-5 md:py-8 pb-28 md:pb-10">
            <Outlet />
          </div>
        </main>

        {/* 移动端毛玻璃浮动底栏 */}
        <nav className="md:hidden fixed bottom-3 left-4 right-4 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-float safe-bottom z-50">
          <div className="flex items-center justify-around py-2">
            {NAV_ITEMS.slice(0, 5).map(item => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1 px-3 py-1 text-[10px] transition-colors ${
                      isActive ? 'text-white font-semibold' : 'text-zinc-500 hover:text-zinc-300'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
