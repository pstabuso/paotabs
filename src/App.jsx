import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TaskTracker from './pages/TaskTracker'
import EisenhowerMatrix from './pages/EisenhowerMatrix'
import StressAssessment from './pages/StressAssessment'
import StressChatbot from './pages/StressChatbot'
import Reports from './pages/Reports'
import AutoScheduler from './pages/AutoScheduler'
import Progress from './pages/Progress'
import Schedule from './pages/Schedule'
import { Menu, Zap } from 'lucide-react'

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <AppProvider>
      <div className="min-h-screen bg-[#0B0F19]">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Mobile header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#0B0F19] border-b border-slate-800/50 px-3 py-2.5 flex items-center gap-2.5">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800/50 transition-all">
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
              <Zap size={10} className="text-white" />
            </div>
            <span className="text-xs font-bold text-white">PaoTabs</span>
          </div>
        </div>

        <main className="lg:ml-56 p-3 sm:p-4 lg:p-5 pt-14 lg:pt-5 min-h-screen">
          <div className="max-w-[1100px] mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tasks" element={<TaskTracker />} />
              <Route path="/matrix" element={<EisenhowerMatrix />} />
              <Route path="/stress" element={<StressAssessment />} />
              <Route path="/chatbot" element={<StressChatbot />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/scheduler" element={<AutoScheduler />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </AppProvider>
  )
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F19] gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
          <Zap size={16} className="text-white animate-pulse" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1 h-1 rounded-full bg-blue-300 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    )
  }

  return user ? <AppLayout /> : <Login />
}
