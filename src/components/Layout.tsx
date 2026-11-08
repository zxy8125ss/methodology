import React from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BookMarked,
  Sparkles,
  Search,
  Compass,
  Settings,
  Layers,
  Network
} from 'lucide-react'
import { useAppStore } from '../stores'

const DESKTOP_NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: '概览工作台' },
  { path: '/library', icon: BookMarked, label: '方法论档案' },
  { path: '/research', icon: Sparkles, label: 'AI 深度研究' },
  { path: '/search', icon: Search, label: '智能推演' },
  { path: '/practice', icon: Compass, label: '实践与复盘' },
  { path: '/graph', icon: Network, label: '认知图谱' },
  { path: '/settings', icon: Settings, label: '系统设置' }
]

const MOBILE_TABS = [
  { path: '/dashboard', icon: LayoutDashboard, label: '概览' },
  { path: '/library', icon: BookMarked, label: '知识库' },
  { path: '/research', icon: Sparkles, label: 'AI研究' },
  { path: '/search', icon: Search, label: '推演' },
  { path: '/practice', icon: Compass, label: '实践' }
]

export default function Layout() {
  const { stats } = useAppStore()
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF9F6] font-sans selection:bg-stone-200 selection:text-stone-900 text-stone-900">
      {/* 桌面端精致侧边栏 */}
      <aside className="hidden md:flex flex-col w-60 lg:w-64 bg-[#F4F3EF] border-r border-stone-200/80 flex-shrink-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-stone-200/70">
          <div className="flex items-center gap-3">
            <img
              src="./icon.svg"
              alt="Cogito"
              className="w-8 h-8 rounded-xl object-contain shadow-soft flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="font-bold text-stone-900 text-sm tracking-tight flex items-center gap-1.5 truncate">
                <span>Cogito</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-200 text-stone-700 border border-stone-300/60 shrink-0">V1.0</span>
              </div>
              <div className="text-[11px] text-stone-500 font-mono truncate">方法论与认知系统</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {DESKTOP_NAV_ITEMS.map(item => {
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
                <Icon className="w-4 h-4 transition-transform duration-150 group-hover:scale-105 shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {isPendingReviews && (
                  <span className="bg-amber-400 text-stone-950 font-bold text-[10px] px-1.5 py-0.2 rounded-full shadow-sm shrink-0">
                    {stats?.pendingReviews}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* 底部信息与数据资产概览 */}
        <div className="p-4 border-t border-stone-200/70 bg-stone-100/50">
          <div className="text-[11px] text-stone-500 space-y-1.5 font-mono">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 font-sans">
                <Layers className="w-3.5 h-3.5 text-stone-500" />
                <span>方法论资产</span>
              </span>
              <span className="text-stone-800 font-medium">{stats?.totalMethods ?? 0}</span>
            </div>
            <div className="flex justify-between items-center font-sans">
              <span>进行中实践</span>
              <span className="text-stone-800 font-medium">{stats?.activePractices ?? 0}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* 主视图区域 */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#FAF9F6]">
        {/* 移动端顶部栏：实色纯净无毛玻璃断层，精准避让 iPhone 17 灵动岛 (Dynamic Island safe-top) */}
        <header className="md:hidden bg-[#FAF9F6] border-b border-stone-200/70 safe-top flex-shrink-0 z-30">
          <div className="flex items-center justify-between px-4 h-12">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src="./icon.svg"
                alt="Cogito"
                className="w-7 h-7 rounded-lg object-contain shadow-soft flex-shrink-0"
              />
              <div className="min-w-0">
                <span className="font-semibold text-stone-900 text-sm tracking-tight truncate">Cogito</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate('/graph')}
                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 active:bg-stone-200/60 transition-colors"
                title="图谱"
              >
                <Network className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 active:bg-stone-200/60 transition-colors"
                title="设置"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* 内容容器 */}
        <main className="flex-1 overflow-y-auto overscroll-y-contain">
          <div className="max-w-5xl mx-auto px-4 md:px-8 pt-3 md:pt-6 pb-[calc(52px+env(safe-area-inset-bottom,16px))] md:pb-8">
            <Outlet />
          </div>
        </main>

        {/* 移动端底部原生 Tab Bar（严格参考 Apple iOS HIG 与 Notion/Things 3 原生标准） */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#FAF9F6] border-t border-stone-200/90 safe-bottom">
          <div className="grid grid-cols-5 h-[49px] items-center px-1">
            {MOBILE_TABS.map(item => {
              const Icon = item.icon
              const isPendingReviews = item.path === '/research' && stats && stats.pendingReviews > 0

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center h-full w-full select-none transition-colors active:opacity-60 ${
                      isActive ? 'text-stone-950' : 'text-stone-400 hover:text-stone-600'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="relative flex items-center justify-center">
                        <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.2px]' : 'stroke-[1.6px]'}`} />
                        {isPendingReviews && (
                          <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-1 ring-white" />
                        )}
                      </div>
                      <span className={`text-[10px] mt-1 tracking-tight leading-none ${isActive ? 'font-semibold text-stone-950' : 'font-normal text-stone-500'}`}>
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
