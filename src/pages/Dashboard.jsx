import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { CheckSquare, Brain, TrendingUp, AlertTriangle, Calendar, Clock, ArrowUpRight, Zap, ListChecks, Target } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { user } = useAuth()
  const { tasks, assessments, events } = useApp()

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there'
  const totalTasks = tasks.length
  const doneTasks = tasks.filter(t => t.status === 'done').length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length
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
    .filter(t => t.due_date && t.status !== 'done')
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5)

  const stressColor = (level) => {
    if (!level) return 'text-slate-400'
    if (level <= 3) return 'text-emerald-400'
    if (level <= 6) return 'text-amber-400'
    return 'text-red-400'
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const tooltipStyle = { backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#e2e8f0' }

  return (
    <div className="space-y-6 animate-enter">
      {/* Hero header */}
      <div className="bg-[#131b2e] rounded-2xl border border-slate-800 shadow-xl p-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-600/10 border border-blue-500/20">
            <Zap size={12} className="text-blue-400" />
            <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white">{greeting}, {firstName}</h1>
        <p className="text-slate-400 mt-1.5 text-sm max-w-lg">
          {totalTasks === 0 && assessments.length === 0
            ? "Welcome to PaoTabs! Start by adding tasks or taking a stress assessment."
            : `You have ${totalTasks - doneTasks} pending task${totalTasks - doneTasks !== 1 ? 's' : ''} and ${overdueTasks > 0 ? `${overdueTasks} overdue` : 'nothing overdue'}.`}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard
          icon={CheckSquare} label="Tasks Done" value={`${doneTasks}/${totalTasks}`}
          color="text-blue-400" bg="bg-blue-600/10"
          sub={completionRate > 0 ? `${completionRate}% complete` : null}
        />
        <StatCard
          icon={Target} label="In Progress" value={inProgress}
          color="text-cyan-400" bg="bg-cyan-600/10"
          sub={inProgress > 0 ? 'active now' : null}
        />
        <StatCard
          icon={AlertTriangle} label="Overdue" value={overdueTasks}
          color={overdueTasks > 0 ? 'text-red-400' : 'text-slate-500'} bg={overdueTasks > 0 ? 'bg-red-600/10' : 'bg-slate-600/10'}
          sub={overdueTasks > 0 ? 'need attention' : 'all clear'}
        />
        <StatCard
          icon={Brain} label="Stress Level" value={latestStress ? `${latestStress}/10` : '—'}
          color={stressColor(latestStress)} bg="bg-purple-600/10"
          sub={avgStress ? `avg ${avgStress}` : null}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stress Trend */}
        <div className="bg-[#131b2e] rounded-2xl border border-slate-800 shadow-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-600/10">
                <Brain size={16} className="text-purple-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">Stress Trend</h3>
            </div>
            <Link to="/stress" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold transition-colors">
              Take assessment <ArrowUpRight size={12} />
            </Link>
          </div>
          {stressChartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stressChartData}>
                <defs>
                  <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'rgba(59,130,246,0.15)' }} />
                <Area type="monotone" dataKey="level" stroke="#3b82f6" fill="url(#stressGrad)" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2, fill: '#131b2e' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={Brain} message="Complete stress assessments to see trends" action="Take Assessment" to="/stress" />
          )}
          {avgStress && (
            <p className="text-xs text-slate-500 mt-3">Average stress: <span className={`font-bold ${stressColor(Number(avgStress))}`}>{avgStress}/10</span></p>
          )}
        </div>

        {/* Upcoming deadlines */}
        <div className="bg-[#131b2e] rounded-2xl border border-slate-800 shadow-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-600/10">
                <Clock size={16} className="text-amber-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">Upcoming Deadlines</h3>
            </div>
            <Link to="/tasks" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold transition-colors">
              All tasks <ArrowUpRight size={12} />
            </Link>
          </div>
          {upcomingTasks.length > 0 ? (
            <div className="space-y-1">
              {upcomingTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-800/40 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      task.priority === 'critical' ? 'bg-red-400' :
                      task.priority === 'high' ? 'bg-amber-400' : 'bg-slate-500'
                    }`} />
                    <span className="text-sm text-slate-300 truncate group-hover:text-slate-100 transition-colors">{task.title}</span>
                  </div>
                  <span className={`text-xs flex-shrink-0 ml-2 px-2 py-0.5 rounded-md font-bold ${
                    new Date(task.due_date) < new Date() ? 'text-red-400 bg-red-600/10' : 'text-slate-500 bg-slate-800/50'
                  }`}>
                    {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={ListChecks} message="No upcoming deadlines" action="Add Task" to="/tasks" />
          )}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-[#131b2e] rounded-2xl border border-slate-800 shadow-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-600/10">
              <Calendar size={16} className="text-cyan-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">Upcoming Events</h3>
          </div>
          <Link to="/schedule" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold transition-colors">
            Calendar <ArrowUpRight size={12} />
          </Link>
        </div>
        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger">
            {upcomingEvents.map(event => (
              <div key={event.id} className="flex items-center gap-3 bg-[#1e293b] border border-slate-700/50 rounded-xl px-4 py-3.5 hover:border-blue-500/30 transition-colors group">
                <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: event.color || '#3b82f6' }} />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-200 truncate group-hover:text-white transition-colors">{event.title}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {event.event_time && <span className="text-slate-600"> at {event.event_time}</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={Calendar} message="No upcoming events" action="Add Event" to="/schedule" />
        )}
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color, bg, sub }) {
  return (
    <div className="bg-[#131b2e] rounded-2xl border border-slate-800 shadow-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-xl ${bg}`}>
          <Icon size={16} className={color} />
        </div>
      </div>
      <p className={`text-2xl font-bold ${color} tracking-tight`}>{value}</p>
      <p className="text-[10px] font-bold text-slate-500 mt-0.5 uppercase tracking-wider">{label}</p>
      {sub && <p className="text-[11px] text-slate-600 mt-1">{sub}</p>}
    </div>
  )
}

function EmptyState({ icon: Icon, message, action, to }) {
  return (
    <div className="h-[200px] flex flex-col items-center justify-center text-center">
      <div className="p-3 rounded-2xl bg-slate-800/50 mb-3">
        <Icon size={24} className="text-slate-600" />
      </div>
      <p className="text-sm text-slate-500">{message}</p>
      <Link to={to} className="text-xs text-blue-400 hover:text-blue-300 mt-2 flex items-center gap-1 font-bold transition-colors">
        {action} <ArrowUpRight size={12} />
      </Link>
    </div>
  )
}
