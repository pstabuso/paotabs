import { useApp } from '../context/AppContext'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { TrendingUp, TrendingDown, Minus, Brain, CheckSquare, ArrowUpRight, Activity } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Progress() {
  const { assessments, tasks } = useApp()

  const stressData = [...assessments].reverse().map((a) => ({
    name: new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    level: a.stress_level || 0
  }))

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

  const totalAssessments = assessments.length
  const avgStress = totalAssessments > 0
    ? (assessments.reduce((s, a) => s + (a.stress_level || 0), 0) / totalAssessments).toFixed(1)
    : null
  const latestStress = assessments[0]?.stress_level
  const prevStress = assessments[1]?.stress_level
  const trend = latestStress && prevStress ? latestStress - prevStress : 0
  const tasksDone = tasks.filter(t => t.status === 'done').length
  const tasksTotal = tasks.length

  const tooltipStyle = { backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#e2e8f0' }

  return (
    <div className="space-y-6 animate-enter">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-emerald-600/10">
          <Activity size={22} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Progress & Analytics</h1>
          <p className="text-slate-500 text-sm mt-0.5">Track your wellness and productivity over time</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <SummaryCard
          label="Avg Stress" value={avgStress ? `${avgStress}/10` : '—'} sub={`${totalAssessments} assessments`}
          color={!avgStress ? 'text-slate-500' : Number(avgStress) <= 3 ? 'text-emerald-400' : Number(avgStress) <= 6 ? 'text-amber-400' : 'text-red-400'}
          bg="bg-purple-600/10" icon={Brain}
        />
        <SummaryCard
          label="Stress Trend" value={trend === 0 ? 'Stable' : trend > 0 ? `+${trend}` : `${trend}`}
          sub="vs. last check"
          color={trend === 0 ? 'text-slate-500' : trend < 0 ? 'text-emerald-400' : 'text-red-400'}
          bg={trend === 0 ? 'bg-slate-600/10' : trend < 0 ? 'bg-emerald-600/10' : 'bg-red-600/10'}
          icon={trend === 0 ? Minus : trend > 0 ? TrendingUp : TrendingDown}
        />
        <SummaryCard
          label="Tasks Done" value={tasksDone} sub={`of ${tasksTotal} total`}
          color="text-blue-400" bg="bg-blue-600/10" icon={CheckSquare}
        />
        <SummaryCard
          label="Completion" value={tasksTotal > 0 ? `${Math.round(tasksDone / tasksTotal * 100)}%` : '—'} sub="all time"
          color="text-cyan-400" bg="bg-cyan-600/10" icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#131b2e] rounded-2xl border border-slate-800 shadow-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-600/10"><Brain size={16} className="text-purple-400" /></div>
              <h3 className="text-sm font-bold text-slate-200">Stress Over Time</h3>
            </div>
            <Link to="/stress" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold transition-colors">
              Assess <ArrowUpRight size={12} />
            </Link>
          </div>
          {stressData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={stressData}>
                <defs>
                  <linearGradient id="progressStressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'rgba(59,130,246,0.15)' }} />
                <Area type="monotone" dataKey="level" stroke="#3b82f6" fill="url(#progressStressGrad)" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2, fill: '#131b2e' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex flex-col items-center justify-center">
              <Brain size={28} className="text-slate-700 mb-2" />
              <p className="text-sm text-slate-600">No assessments yet</p>
            </div>
          )}
        </div>

        <div className="bg-[#131b2e] rounded-2xl border border-slate-800 shadow-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-600/10"><CheckSquare size={16} className="text-blue-400" /></div>
              <h3 className="text-sm font-bold text-slate-200">Tasks Completed</h3>
            </div>
            <Link to="/tasks" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold transition-colors">
              Tasks <ArrowUpRight size={12} />
            </Link>
          </div>
          {taskChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={taskChartData}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(59,130,246,0.05)' }} />
                <Bar dataKey="completed" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex flex-col items-center justify-center">
              <CheckSquare size={28} className="text-slate-700 mb-2" />
              <p className="text-sm text-slate-600">Complete tasks to see stats</p>
            </div>
          )}
        </div>
      </div>

      {/* Assessment History */}
      {assessments.length > 0 && (
        <div className="bg-[#131b2e] rounded-2xl border border-slate-800 shadow-xl p-6">
          <h3 className="text-sm font-bold text-slate-200 mb-5">Assessment History</h3>
          <div className="divide-y divide-slate-800/50">
            {assessments.slice(0, 10).map((a) => {
              const levelColor = a.stress_level <= 3 ? 'emerald' : a.stress_level <= 6 ? 'amber' : 'red'
              return (
                <div key={a.id} className="flex items-center gap-4 py-3 px-3 hover:bg-slate-800/40 transition-colors">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold bg-${levelColor}-600/10 text-${levelColor}-400 flex-shrink-0`}>
                    {a.stress_level}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 font-medium">
                      Sleep: <span className="text-slate-400">{a.sleep_quality}</span> · Appetite: <span className="text-slate-400">{a.appetite}</span> · Energy: <span className="text-slate-400">{a.energy_level}</span>
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5 truncate">{a.feelings || 'No description'}</p>
                  </div>
                  <span className="text-[10px] text-slate-600 flex-shrink-0 font-bold uppercase tracking-wider">
                    {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value, sub, color, bg, icon: Icon }) {
  return (
    <div className="bg-[#131b2e] rounded-2xl border border-slate-800 shadow-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-xl ${bg}`}>
          <Icon size={16} className={color} />
        </div>
      </div>
      <p className={`text-2xl font-bold ${color} tracking-tight`}>{value}</p>
      <p className="text-[10px] font-bold text-slate-500 mt-0.5 uppercase tracking-wider">{label}</p>
      <p className="text-[11px] text-slate-600 mt-1">{sub}</p>
    </div>
  )
}
