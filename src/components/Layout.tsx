import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  Sparkles,
  BookMarked,
  Search,
  Compass,
  Settings,
  Layers,
  Network,
  Compass as CompassIcon
} from 'lucide-react'
import { useAppStore } from '../stores'

const DESKTOP_NAV_ITEMS = [
  { path: '/dashboard', icon: Sparkles, label: '思想智库' },
  { path: '/library', icon: BookMarked, label: '方法论档案' },
  { path: '/search', icon: Search, label: '场景推演' },
  { path: '/research', icon: Sparkles, label: 'AI 深度研究' },
  { path: '/practice', icon: Compass, label: '实践与复盘' },
  { path: '/graph', icon: Network, label: '认知图谱' },
  { path: '/settings', icon: Settings, label: '系统设置' }
]

const MOBILE_TABS = [
  { path: '/dashboard', icon: Sparkles, label: '智库' },
  { path: '/library', icon: BookMarked, label: '知识库' },
  { path: '/search', icon: Search, label: '推演' },
  { path: '/research', icon: Sparkles, label: '研究' },
  { path: '/practice', icon: Compass, label: '实践' }
]

export default function Layout() {
  const { stats } = useAppStore()
  const navigate = useNavigate()

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF9F5] font-sans selection:bg-[#F2DFD5] selection:text-[#6B3827] text-[#1F1E1B]">
      {/* 桌面端高雅侧边栏 (Claude Editorial Aesthetic) */}
      <aside className="hidden md:flex flex-col w-60 lg:w-64 bg-[#F4F2EC] border-r border-[#EAE6DF] flex-shrink-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-[#EAE6DF]/80">
          <div className="flex items-center gap-3">
            <img
              src="./icon.svg"
              alt="Cogito"
              className="w-8 h-8 rounded-xl object-contain shadow-soft flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="font-serif text-lg text-[#1F1E1B] tracking-tight flex items-center gap-2 truncate">
                <span>Cogito</span>
                <span className="text-[10px] font-sans font-medium px-1.5 py-0.2 rounded-full bg-[#FAF0EB] text-[#B8684D] border border-[#F0DED3] shrink-0">
                  AI
                </span>
              </div>
              <div className="text-[11px] text-[#8C877D] truncate font-serif italic">方法论与认知系统</div>
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
                  `group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-white text-[#9E543C] font-semibold shadow-soft border border-[#EAE6DF]'
                      : 'text-[#68645C] hover:text-[#1F1E1B] hover:bg-[#EAE6DF]/50'
                  }`
                }
              >
                <Icon className="w-4 h-4 transition-transform duration-150 group-hover:scale-105 shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {isPendingReviews && (
                  <span className="bg-[#CC785C] text-white font-semibold text-[10px] px-1.5 py-0.2 rounded-full shadow-soft shrink-0">
                    {stats?.pendingReviews}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* 底部信息与数据资产概览 */}
        <div className="p-4 border-t border-[#EAE6DF]/80 bg-[#FAF9F5]/60">
          <div className="text-[11px] text-[#8C877D] space-y-1.5 font-sans">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#A39E93]" />
                <span>收录模型</span>
              </span>
              <span className="text-[#1F1E1B] font-medium font-serif">{stats?.totalMethods ?? 0} 套</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5">
                <CompassIcon className="w-3.5 h-3.5 text-[#A39E93]" />
                <span>实践与复盘</span>
              </span>
              <span className="text-[#1F1E1B] font-medium font-serif">{stats?.activePractices ?? 0} 项</span>
            </div>
          </div>
        </div>
      </aside>

      {/* 主视图区域 */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#FAF9F5]">
        {/* 移动端顶部栏：100% 实色纯净，针对 iPhone 17 Dynamic Island 优化 safe-top */}
        <header className="md:hidden bg-[#FAF9F5] border-b border-[#EAE6DF] safe-top flex-shrink-0 z-30">
          <div className="flex items-center justify-between px-4 h-12">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src="./icon.svg"
                alt="Cogito"
                className="w-7 h-7 rounded-lg object-contain shadow-soft flex-shrink-0"
              />
              <div className="min-w-0 flex items-baseline gap-1.5">
                <span className="font-serif font-medium text-[#1F1E1B] text-base tracking-tight truncate">Cogito</span>
                <span className="text-[10px] text-[#8C877D] font-serif italic truncate hidden sm:inline">· 认知系统</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => navigate('/graph')}
                className="p-2 rounded-xl text-[#736F66] hover:text-[#1F1E1B] active:bg-[#F4F2EC] transition-colors"
                title="图谱"
              >
                <Network className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="p-2 rounded-xl text-[#736F66] hover:text-[#1F1E1B] active:bg-[#F4F2EC] transition-colors"
                title="设置"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* 内容容器 */}
        <main className="flex-1 overflow-y-auto overscroll-y-contain">
          <div className="max-w-4xl mx-auto px-4 md:px-8 pt-4 md:pt-8 pb-[calc(56px+env(safe-area-inset-bottom,16px))] md:pb-12">
            <Outlet />
          </div>
        </main>

        {/* 移动端底部原生 Tab Bar（严格遵守 Apple iOS HIG 49px + safe-bottom，无缝贴底） */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#FAF9F5] border-t border-[#EAE6DF] safe-bottom">
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
                      isActive ? 'text-[#CC785C]' : 'text-[#8C877D] hover:text-[#4A4741]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="relative flex items-center justify-center">
                        <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.2px]' : 'stroke-[1.6px]'}`} />
                        {isPendingReviews && (
                          <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[#CC785C] ring-1 ring-white" />
                        )}
                      </div>
                      <span className={`text-[10px] mt-1 tracking-tight leading-none ${isActive ? 'font-semibold text-[#CC785C]' : 'font-normal text-[#8C877D]'}`}>
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
