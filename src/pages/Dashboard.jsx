import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { CheckSquare, Clock, Brain, TrendingUp, AlertTriangle, Calendar } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const { user } = useAuth()
  const { tasks, assessments, events } = useApp()

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there'
  const totalTasks = tasks.length
  const doneTasks = tasks.filter(t => t.status === 'done').length
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

  return (
    <div className="space-y-6 animate-enter">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Hey, {firstName}!</h1>
        <p className="text-slate-400 mt-1">Here's your overview for today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={CheckSquare} label="Tasks Done" value={`${doneTasks}/${totalTasks}`} color="text-indigo-400" bg="bg-indigo-500/10" />
        <StatCard icon={TrendingUp} label="Completion" value={`${completionRate}%`} color="text-emerald-400" bg="bg-emerald-500/10" />
        <StatCard icon={AlertTriangle} label="Overdue" value={overdueTasks} color="text-red-400" bg="bg-red-500/10" />
        <StatCard icon={Brain} label="Stress Level" value={latestStress ? `${latestStress}/10` : '—'} color={stressColor(latestStress)} bg="bg-purple-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stress Trend */}
        <div className="bg-[#131b2e] rounded-2xl border border-slate-800 p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Stress Trend</h3>
          {stressChartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stressChartData}>
                <defs>
                  <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1a2340', border: '1px solid #334155', borderRadius: 12, color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="level" stroke="#818cf8" fill="url(#stressGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">
              Complete stress assessments to see trends
            </div>
          )}
          {avgStress && (
            <p className="text-xs text-slate-500 mt-2">Average stress: <span className={stressColor(Number(avgStress))}>{avgStress}/10</span></p>
          )}
        </div>

        {/* Upcoming deadlines */}
        <div className="bg-[#131b2e] rounded-2xl border border-slate-800 p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Upcoming Deadlines</h3>
          {upcomingTasks.length > 0 ? (
            <div className="space-y-3">
              {upcomingTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      task.priority === 'critical' ? 'bg-red-400' :
                      task.priority === 'high' ? 'bg-amber-400' : 'bg-slate-500'
                    }`} />
                    <span className="text-sm text-slate-300 truncate">{task.title}</span>
                  </div>
                  <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                    {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">
              No upcoming deadlines
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="bg-[#131b2e] rounded-2xl border border-slate-800 p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Calendar size={16} /> Upcoming Events
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingEvents.map(event => (
              <div key={event.id} className="flex items-center gap-3 bg-[#0f1524] rounded-xl px-4 py-3">
                <div className="w-1 h-8 rounded-full" style={{ backgroundColor: event.color || '#6366f1' }} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-300 truncate">{event.title}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {event.event_time && ` at ${event.event_time}`}
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

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="bg-[#131b2e] rounded-2xl border border-slate-800 p-5 hover:border-slate-700 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${bg}`}>
          <Icon size={18} className={color} />
        </div>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className={`text-xl font-bold ${color}`}>{value}</p>
        </div>
      </div>
    </div>
  )
}
