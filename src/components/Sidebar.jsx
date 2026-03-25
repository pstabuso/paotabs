import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, Grid3X3, Brain, MessageCircle, BarChart3, CalendarClock, TrendingUp, Calendar, LogOut, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks', icon: CheckSquare, label: 'Task Tracker' },
  { to: '/matrix', icon: Grid3X3, label: 'Eisenhower Matrix' },
  { to: '/scheduler', icon: CalendarClock, label: 'Auto Scheduler' },
  { to: '/stress', icon: Brain, label: 'Stress Check' },
  { to: '/chatbot', icon: MessageCircle, label: 'AI Counselor' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/schedule', icon: Calendar, label: 'Calendar' },
]

export default function Sidebar({ open, onClose }) {
  const { signOut, user } = useAuth()

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-[#0B0F19] border-r border-slate-800/50
        flex flex-col transition-transform duration-300
        lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-mono shadow-lg shadow-blue-900/50">
              <Zap size={16} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">PaoTabs</h1>
              <p className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 space-y-6 overflow-y-auto">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-3 px-3">Navigation</p>
            <div className="space-y-1">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/10'
                        : 'hover:bg-white/5 text-slate-400 hover:text-white border border-transparent'
                    }`
                  }
                  end={to === '/'}
                >
                  <Icon size={16} />
                  <span className="text-sm font-medium">{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-slate-800/50">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#131b2e] border border-slate-800 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
              {user?.full_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">
                {user?.full_name || user?.username || 'User'}
              </p>
              <p className="text-[10px] text-slate-600 truncate">@{user?.username}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all w-full"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
