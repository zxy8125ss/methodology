import React, { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Library from './pages/Library'
import MethodDetail from './pages/MethodDetail'
import MethodEdit from './pages/MethodEdit'
import Research from './pages/Research'
import Search from './pages/Search'
import Graph from './pages/Graph'
import PracticeAndLearning from './pages/PracticeAndLearning'
import Settings from './pages/Settings'
import NotificationCenter from './components/NotificationCenter'
import { useAppStore } from './stores'

export default function App() {
  const { initialize } = useAppStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
        <NotificationCenter />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="library" element={<Library />} />
            <Route path="library/:id" element={<MethodDetail />} />
            <Route path="library/:id/edit" element={<MethodEdit />} />
            <Route path="library/new" element={<MethodEdit />} />
            <Route path="research" element={<Research />} />
            <Route path="search" element={<Search />} />
            <Route path="graph" element={<Graph />} />
            <Route path="practice" element={<PracticeAndLearning />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </div>
    </HashRouter>
  )
}
