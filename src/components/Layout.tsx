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
    <div className="flex h-screen overflow-hidden bg-[#FAF9F6] font-sans selection:bg-stone-200 selection:text-stone-900 text-stone-900">
      {/* 桌面端极简精致侧边栏 */}
      <aside className="hidden md:flex flex-col w-60 lg:w-64 bg-[#F4F3EF] border-r border-stone-200/80 flex-shrink-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-stone-200/70">
          <div className="flex items-center gap-3">
            {/* Mobius Golden Loop Vector Icon */}
            <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 shadow-soft flex items-center justify-center p-1.5 flex-shrink-0">
              <img src="./icon.svg" alt="Cogito" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="font-bold text-stone-900 text-sm tracking-tight flex items-center gap-1.5">
                <span>Cogito</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-200 text-stone-700 border border-stone-300/60">V1.0</span>
              </div>
              <div className="text-[11px] text-stone-500 font-mono">方法论与认知系统</div>
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
                      ? 'bg-stone-900 text-white shadow-soft font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 transition-transform duration-150 group-hover:scale-105" />
                <span className="flex-1">{item.label}</span>
                {isPendingReviews && (
                  <span className="bg-amber-400 text-stone-950 font-bold text-[10px] px-1.5 py-0.2 rounded-full shadow-sm">
                    {stats?.pendingReviews}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* 底部信息与数据资产概览 */}
        <div className="p-4 border-t border-stone-200/70 bg-stone-100/50">
          <div className="text-[11px] text-stone-500 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-stone-500" />
                <span>方法论资产</span>
              </span>
              <span className="text-stone-800 font-mono font-medium">{stats?.totalMethods ?? 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>进行中实践</span>
              <span className="text-stone-800 font-mono font-medium">{stats?.activePractices ?? 0}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* 主视图区域 */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#FAF9F6]">
        {/* 移动端顶部栏：完美适配 iPhone 17 灵动岛 (Dynamic Island safe-top) */}
        <header className="md:hidden flex items-center justify-between px-4 py-2.5 bg-[#FAF9F6]/95 backdrop-blur-xl border-b border-stone-200/80 safe-top flex-shrink-0 z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white border border-stone-200 shadow-soft flex items-center justify-center p-1">
              <img src="./icon.svg" alt="Cogito" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-bold text-stone-900 text-sm tracking-tight">Cogito</span>
              <span className="text-[10px] text-stone-500 ml-1.5">方法论与认知系统</span>
            </div>
          </div>
          <div className="text-[11px] font-mono text-stone-600 bg-white px-2.5 py-0.5 rounded-full border border-stone-200 shadow-soft">
            {stats?.totalMethods ?? 0} 档案
          </div>
        </header>

        {/* 内容容器：针对 iPhone 底部操作条优化 padding，告别空洞留白 */}
        <main className="flex-1 overflow-y-auto overscroll-y-contain">
          <div className="max-w-6xl mx-auto px-4 md:px-8 pt-4 md:pt-6 pb-20 md:pb-8">
            <Outlet />
          </div>
        </main>

        {/* 移动端紧凑贴底导航栏 (Docked iOS Tab Bar，告别浮空药丸与割裂空白) */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-stone-200/90 shadow-dock safe-bottom z-50">
          <div className="grid grid-cols-5 items-center h-13 px-1">
            {NAV_ITEMS.slice(0, 5).map(item => {
              const Icon = item.icon
              const isPendingReviews = item.path === '/research' && stats && stats.pendingReviews > 0

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center py-1 text-[10px] relative transition-colors ${
                      isActive ? 'text-stone-950 font-semibold' : 'text-stone-400 hover:text-stone-600'
                    }`
                  }
                >
                  <div className="relative">
                    <Icon className="w-5 h-5 mb-0.5" />
                    {isPendingReviews && (
                      <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
                    )}
                  </div>
                  <span className="tracking-tight">{item.label}</span>
                </NavLink>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
