import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, Brain, TrendingUp, Calendar, LogOut, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', color: 'indigo' },
  { to: '/tasks', icon: CheckSquare, label: 'Task Tracker', color: 'blue' },
  { to: '/stress', icon: Brain, label: 'Stress Check', color: 'purple' },
  { to: '/progress', icon: TrendingUp, label: 'Progress', color: 'emerald' },
  { to: '/schedule', icon: Calendar, label: 'Schedule', color: 'amber' },
]

const colorMap = {
  indigo: { active: 'text-indigo-400', bg: 'bg-indigo-500/12', glow: 'shadow-indigo-500/10' },
  blue: { active: 'text-blue-400', bg: 'bg-blue-500/12', glow: 'shadow-blue-500/10' },
  purple: { active: 'text-purple-400', bg: 'bg-purple-500/12', glow: 'shadow-purple-500/10' },
  emerald: { active: 'text-emerald-400', bg: 'bg-emerald-500/12', glow: 'shadow-emerald-500/10' },
  amber: { active: 'text-amber-400', bg: 'bg-amber-500/12', glow: 'shadow-amber-500/10' },
}

export default function Sidebar({ open, onClose }) {
  const { signOut, user } = useAuth()

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade" onClick={onClose} />
      )}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-[272px] glass-strong
        flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gradient">PaoTabs</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-5 space-y-1">
          <p className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold px-3 mb-3">Navigation</p>
          {navItems.map(({ to, icon: Icon, label, color }) => {
            const c = colorMap[color]
            return (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative group ${
                    isActive
                      ? `${c.bg} ${c.active} shadow-lg ${c.glow}`
                      : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
                  }`
                }
                end={to === '/'}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-indigo-400 to-purple-500" />
                    )}
                    <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                    {label}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-white/[0.04]">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.02] mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex-shrink-0">
              {user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">
                {user?.user_metadata?.full_name || 'User'}
              </p>
              <p className="text-[11px] text-slate-600 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] text-slate-500 hover:bg-red-500/8 hover:text-red-400 transition-all w-full group"
          >
            <LogOut size={16} className="group-hover:rotate-[-12deg] transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
