import React from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAppStore } from '../stores'

const NAV_ITEMS = [
  { path: '/dashboard', icon: '⊞', label: '工作台' },
  { path: '/library', icon: '📚', label: '方法论库' },
  { path: '/research', icon: '🔬', label: 'AI 研究' },
  { path: '/search', icon: '🔍', label: '智能搜索' },
  { path: '/graph', icon: '🕸️', label: '知识图谱' },
  { path: '/practice', icon: '🎯', label: '实践学习' },
  { path: '/settings', icon: '⚙️', label: '设置' }
]

export default function Layout() {
  const { stats } = useAppStore()
  const location = useLocation()

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 侧边栏（桌面端） */}
      <aside className="hidden md:flex flex-col w-56 lg:w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">方</div>
            <div>
              <div className="font-bold text-slate-100 text-sm">方法论</div>
              <div className="text-xs text-slate-500">知识管理系统</div>
            </div>
          </div>
        </div>

        {/* 导航 */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`
              }
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span>{item.label}</span>
              {item.path === '/research' && stats && stats.pendingReviews > 0 && (
                <span className="ml-auto bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {stats.pendingReviews}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* 底部统计 */}
        <div className="p-4 border-t border-slate-800">
          <div className="text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>方法论总数</span>
              <span className="text-slate-300 font-medium">{stats?.totalMethods ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span>进行中实践</span>
              <span className="text-slate-300 font-medium">{stats?.activePractices ?? 0}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* 移动端顶部标题栏 */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 safe-top">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">方</div>
            <span className="font-semibold text-slate-100">方法论</span>
          </div>
          <div className="text-xs text-slate-500">{stats?.totalMethods ?? 0} 个方法论</div>
        </header>

        {/* 内容 */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 pb-24 md:pb-6">
            <Outlet />
          </div>
        </main>

        {/* 底部导航（移动端） */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 safe-bottom z-50">
          <div className="flex">
            {NAV_ITEMS.slice(0, 5).map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
                    isActive ? 'text-blue-400' : 'text-slate-500'
                  }`
                }
              >
                <span className="text-lg leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
