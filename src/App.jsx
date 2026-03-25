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
      <div className="flex min-h-screen bg-[#0B0F19] font-sans text-slate-200">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Mobile header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#0B0F19] border-b border-slate-800/50 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800/50 transition-all">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/50">
              <Zap size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">PaoTabs</span>
          </div>
        </div>

        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 min-h-screen overflow-y-auto">
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
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/50">
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
