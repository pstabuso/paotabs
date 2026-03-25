import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TaskTracker from './pages/TaskTracker'
import StressAssessment from './pages/StressAssessment'
import Progress from './pages/Progress'
import Schedule from './pages/Schedule'
import { Menu, Sparkles } from 'lucide-react'

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <AppProvider>
      <div className="min-h-screen bg-[#0B0F19] noise">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Mobile header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-30 glass-strong px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-white/[0.05] transition-all">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles size={12} className="text-white" />
            </div>
            <span className="text-sm font-bold text-gradient">PaoTabs</span>
          </div>
        </div>

        <main className="lg:ml-[272px] p-5 pt-18 lg:pt-5 min-h-screen">
          <div className="max-w-[1200px] mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tasks" element={<TaskTracker />} />
              <Route path="/stress" element={<StressAssessment />} />
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F19] gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles size={20} className="text-white animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    )
  }

  return user ? <AppLayout /> : <Login />
}
