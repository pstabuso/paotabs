import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { CheckSquare, Brain, TrendingUp, AlertTriangle, Calendar, Clock, ArrowUpRight, Zap, ListChecks, Target } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { user } = useAuth()
  const { tasks, assessments, events, dbAvailable } = useApp()

  const firstName = user?.full_name?.split(' ')[0] || user?.username || 'there'
  const totalTasks = tasks.length
  const doneTasks = tasks.filter(t => t.status === 'done' || t.status === 'completed').length
  const inProgress = tasks.filter(t => t.status === 'in_progress' || t.status === 'ongoing').length
  const overdueTasks = tasks.filter(t => {
    if (t.status === 'done' || t.status === 'completed') return false
    const dl = t.due_date || t.deadline
    return dl && new Date(dl) < new Date()
  }).length
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  const latestStress = assessments[0]?.stress_level || null
  const avgStress = assessments.length > 0
    ? (assessments.reduce((s, a) => s + (a.stress_level || 0), 0) / assessments.length).toFixed(1)
    : null

  const stressChartData = [...assessments].reverse().slice(-14).map((a, i) => ({
    name: `#${i + 1}`,
    level: a.stress_level || 0
  }))

  const upcomingEvents = events
    .filter(e => new Date(e.event_date) >= new Date(new Date().toDateString()))
    .slice(0, 5)

  const upcomingTasks = tasks
    .filter(t => (t.due_date || t.deadline) && t.status !== 'done' && t.status !== 'completed')
    .sort((a, b) => new Date(a.due_date || a.deadline) - new Date(b.due_date || b.deadline))
    .slice(0, 5)

  const stressColor = (level) => {
    if (!level) return 'text-slate-400'
    if (level <= 3) return 'text-emerald-400'
    if (level <= 6) return 'text-amber-400'
    return 'text-red-400'
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const tooltipStyle = { backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#e2e8f0', fontSize: '11px' }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-slate-400 mb-1">
          <Zap size={16} className="text-amber-400" />
          <span className="text-xs">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">
          {greeting}, <span className="text-slate-500 font-normal">{firstName}</span>
        </h1>
        {!dbAvailable && (
          <div className="mt-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 inline-flex items-center gap-2">
            <AlertTriangle size={12} /> Offline mode — data saved locally
          </div>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard icon={CheckSquare} label="Tasks Done" value={`${doneTasks}/${totalTasks}`} color="blue" sub={completionRate > 0 ? `${completionRate}% complete` : null} />
        <MetricCard icon={Target} label="In Progress" value={inProgress} color="cyan" sub={inProgress > 0 ? 'active now' : null} />
        <MetricCard icon={AlertTriangle} label="Overdue" value={overdueTasks} color={overdueTasks > 0 ? 'red' : 'slate'} sub={overdueTasks > 0 ? 'needs attention' : 'all clear'} />
        <MetricCard icon={Brain} label="Stress Level" value={latestStress ? `${latestStress}/10` : '—'} color={!latestStress ? 'slate' : latestStress <= 3 ? 'emerald' : latestStress <= 6 ? 'amber' : 'red'} sub={avgStress ? `avg ${avgStress}` : null} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stress Trend */}
        <div className="bg-[#131b2e] rounded-3xl border border-slate-800 p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white text-lg">Stress Trend</h3>
            <Link to="/stress" className="text-[10px] font-bold text-slate-500 hover:text-white flex items-center gap-1 transition">
              Assess <ArrowUpRight size={10} />
            </Link>
          </div>
          {stressChartData.length > 1 ? (
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stressChartData}>
                  <defs>
                    <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="level" stroke="#6366f1" fill="url(#stressGrad)" strokeWidth={2} dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart icon={Brain} message="Take assessments to see trends" action="Assess Now" to="/stress" />
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-[#131b2e] rounded-3xl border border-slate-800 p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white text-lg">Upcoming Deadlines</h3>
            <Link to="/tasks" className="text-[10px] font-bold text-slate-500 hover:text-white flex items-center gap-1 transition">
              View All <ArrowUpRight size={10} />
            </Link>
          </div>
          {upcomingTasks.length > 0 ? (
            <div className="space-y-2">
              {upcomingTasks.map(task => {
                const dl = new Date(task.due_date || task.deadline)
                const isOverdue = dl < new Date()
                const daysLeft = Math.ceil((dl - new Date()) / (1000 * 60 * 60 * 24))
                return (
                  <div key={task.id} className={`flex items-center justify-between p-3 rounded-xl ${
                    isOverdue ? 'bg-red-900/10 border border-red-500/15' : 'bg-[#0f1524] border border-slate-800/50'
                  } cursor-pointer hover:border-slate-700 transition`}>
                    <div className="flex items-center gap-3 min-w-0">
                      {isOverdue ? <AlertTriangle size={14} className="text-red-400 shrink-0" /> : <Clock size={14} className="text-slate-500 shrink-0" />}
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${isOverdue ? 'text-red-300' : 'text-slate-200'}`}>{task.title || task.name}</p>
                        <p className="text-[10px] text-slate-500">{(task.priority || 'normal').charAt(0).toUpperCase() + (task.priority || 'normal').slice(1)} priority</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ml-2 ${
                      isOverdue ? 'text-red-400 bg-red-900/30' :
                      daysLeft <= 3 ? 'text-amber-400 bg-amber-900/30' :
                      'text-slate-400 bg-slate-800'
                    }`}>
                      {isOverdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyChart icon={ListChecks} message="No upcoming deadlines" action="Add Task" to="/tasks" />
          )}
        </div>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="bg-[#131b2e] rounded-3xl border border-slate-800 p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white text-lg">Upcoming Events</h3>
            <Link to="/schedule" className="text-[10px] font-bold text-slate-500 hover:text-white flex items-center gap-1 transition">
              Calendar <ArrowUpRight size={10} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingEvents.map(event => (
              <div key={event.id} className="flex items-center gap-3 bg-[#0f1524] border border-slate-800/50 rounded-xl px-4 py-3 hover:border-slate-700 transition">
                <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: event.color || '#8b5cf6' }} />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-200 truncate">{event.title}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, color, sub }) {
  const colors = {
    blue: { bg: 'bg-blue-900/20', text: 'text-blue-400', icon: 'text-blue-400' },
    cyan: { bg: 'bg-cyan-900/20', text: 'text-cyan-400', icon: 'text-cyan-400' },
    red: { bg: 'bg-red-900/20', text: 'text-red-400', icon: 'text-red-400' },
    amber: { bg: 'bg-amber-900/20', text: 'text-amber-400', icon: 'text-amber-400' },
    emerald: { bg: 'bg-emerald-900/20', text: 'text-emerald-400', icon: 'text-emerald-400' },
    slate: { bg: 'bg-slate-800/50', text: 'text-slate-400', icon: 'text-slate-500' },
  }
  const c = colors[color] || colors.blue
  return (
    <div className="p-5 rounded-2xl bg-[#131b2e] border border-slate-800 shadow-xl flex items-center gap-4 hover:border-blue-500/30 transition cursor-pointer">
      <div className={`p-3 rounded-xl ${c.bg}`}>
        <Icon size={18} className={c.icon} />
      </div>
      <div>
        <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
        <p className="text-xs text-slate-500 font-bold uppercase">{label}</p>
        {sub && <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function EmptyChart({ icon: Icon, message, action, to }) {
  return (
    <div className="h-52 flex flex-col items-center justify-center text-center">
      <div className="p-3 rounded-xl bg-slate-800/50 mb-3">
        <Icon size={24} className="text-slate-600" />
      </div>
      <p className="text-sm text-slate-500">{message}</p>
      <Link to={to} className="text-xs text-blue-400 hover:text-blue-300 mt-2 flex items-center gap-1 font-bold transition">
        {action} <ArrowUpRight size={12} />
      </Link>
    </div>
  )
}
