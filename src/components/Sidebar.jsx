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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade" onClick={onClose} />
      )}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-56 bg-[#0B0F19] border-r border-slate-800/50
        flex flex-col transition-transform duration-300
        lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="px-4 py-4 border-b border-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-900/20">
              <Zap size={14} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">PaoTabs</h1>
              <p className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[9px] text-slate-600 uppercase tracking-wider font-bold px-2.5 mb-2">Navigation</p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 border border-transparent'
                }`
              }
              end={to === '/'}
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-slate-800/50">
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-[#131b2e] border border-slate-800 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm flex-shrink-0">
              {user?.full_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">
                {user?.full_name || user?.username || 'User'}
              </p>
              <p className="text-[10px] text-slate-600 truncate">@{user?.username}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all w-full border border-transparent hover:border-red-500/10"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
