import { useApp } from '../context/AppContext'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { TrendingUp, TrendingDown, Minus, Brain, CheckSquare } from 'lucide-react'

export default function Progress() {
  const { assessments, tasks } = useApp()

  // Stress chart data
  const stressData = [...assessments].reverse().map((a, i) => ({
    name: new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    level: a.stress_level || 0
  }))

  // Task completion over time (group by week)
  const tasksByWeek = tasks.reduce((acc, task) => {
    if (task.status === 'done' && task.updated_at) {
      const date = new Date(task.updated_at)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const key = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      acc[key] = (acc[key] || 0) + 1
    }
    return acc
  }, {})
  const taskChartData = Object.entries(tasksByWeek).map(([name, count]) => ({ name, completed: count }))

  // Stats
  const totalAssessments = assessments.length
  const avgStress = totalAssessments > 0
    ? (assessments.reduce((s, a) => s + (a.stress_level || 0), 0) / totalAssessments).toFixed(1)
    : null
  const latestStress = assessments[0]?.stress_level
  const prevStress = assessments[1]?.stress_level
  const trend = latestStress && prevStress ? latestStress - prevStress : 0

  const tasksDone = tasks.filter(t => t.status === 'done').length
  const tasksTotal = tasks.length

  return (
    <div className="space-y-6 animate-enter">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Progress & Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Track your wellness and productivity over time</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Avg Stress" value={avgStress ? `${avgStress}/10` : '—'} sub={`${totalAssessments} assessments`}
          color={!avgStress ? 'text-slate-400' : Number(avgStress) <= 3 ? 'text-emerald-400' : Number(avgStress) <= 6 ? 'text-amber-400' : 'text-red-400'} />
        <SummaryCard label="Stress Trend" value={
          trend === 0 ? 'Stable' : trend > 0 ? `+${trend} ↑` : `${trend} ↓`
        } sub="vs. last assessment"
          color={trend === 0 ? 'text-slate-400' : trend < 0 ? 'text-emerald-400' : 'text-red-400'}
          icon={trend === 0 ? Minus : trend > 0 ? TrendingUp : TrendingDown} />
        <SummaryCard label="Tasks Done" value={tasksDone} sub={`of ${tasksTotal} total`} color="text-indigo-400" />
        <SummaryCard label="Completion Rate" value={tasksTotal > 0 ? `${Math.round(tasksDone / tasksTotal * 100)}%` : '—'} sub="all time" color="text-emerald-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stress over time */}
        <div className="bg-[#131b2e] rounded-2xl border border-slate-800 p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Brain size={16} className="text-purple-400" /> Stress Over Time
          </h3>
          {stressData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={stressData}>
                <defs>
                  <linearGradient id="progressStressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1a2340', border: '1px solid #334155', borderRadius: 12, color: '#e2e8f0' }} />
                <Area type="monotone" dataKey="level" stroke="#a78bfa" fill="url(#progressStressGrad)" strokeWidth={2} dot={{ fill: '#a78bfa', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-slate-500 text-sm">
              No assessments yet
            </div>
          )}
        </div>

        {/* Tasks completed by week */}
        <div className="bg-[#131b2e] rounded-2xl border border-slate-800 p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <CheckSquare size={16} className="text-indigo-400" /> Tasks Completed by Week
          </h3>
          {taskChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={taskChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1a2340', border: '1px solid #334155', borderRadius: 12, color: '#e2e8f0' }} />
                <Bar dataKey="completed" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-slate-500 text-sm">
              Complete tasks to see weekly stats
            </div>
          )}
        </div>
      </div>

      {/* Assessment History */}
      {assessments.length > 0 && (
        <div className="bg-[#131b2e] rounded-2xl border border-slate-800 p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Assessment History</h3>
          <div className="space-y-3">
            {assessments.slice(0, 10).map(a => (
              <div key={a.id} className="flex items-center gap-4 py-3 border-b border-slate-800/50 last:border-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                  a.stress_level <= 3 ? 'bg-emerald-500/15 text-emerald-400' :
                  a.stress_level <= 6 ? 'bg-amber-500/15 text-amber-400' :
                  'bg-red-500/15 text-red-400'
                }`}>
                  {a.stress_level}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300">
                    Sleep: {a.sleep_quality} · Appetite: {a.appetite} · Energy: {a.energy_level}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{a.feelings || 'No description'}</p>
                </div>
                <span className="text-xs text-slate-500 flex-shrink-0">
                  {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value, sub, color, icon: Icon }) {
  return (
    <div className="bg-[#131b2e] rounded-2xl border border-slate-800 p-5">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} className={color} />}
        <p className={`text-xl font-bold ${color}`}>{value}</p>
      </div>
      <p className="text-xs text-slate-500 mt-1">{sub}</p>
    </div>
  )
}
