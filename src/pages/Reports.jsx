import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { BarChart3, TrendingUp, Brain, CheckCircle, Clock, AlertTriangle, Activity } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function Reports() {
  const { tasks, assessments, events } = useApp()

  // Task statistics
  const taskStats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter(t => t.status === 'completed' || t.status === 'done').length
    const inProgress = tasks.filter(t => t.status === 'in_progress' || t.status === 'ongoing').length
    const todo = tasks.filter(t => t.status === 'todo' || t.status === 'not_started').length
    const overdue = tasks.filter(t => {
      if (t.status === 'completed' || t.status === 'done') return false
      if (!t.deadline) return false
      return new Date(t.deadline) < new Date()
    }).length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    const byPriority = {
      critical: tasks.filter(t => t.priority === 'critical').length,
      high: tasks.filter(t => t.priority === 'high').length,
      normal: tasks.filter(t => !t.priority || t.priority === 'normal').length,
    }

    return { total, completed, inProgress, todo, overdue, completionRate, byPriority }
  }, [tasks])

  // Stress analytics
  const stressData = useMemo(() => {
    if (!assessments.length) return null

    const sorted = [...assessments].sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))
    const levels = sorted.map(a => a.stress_level || 0)
    const avg = levels.length ? Math.round((levels.reduce((s, l) => s + l, 0) / levels.length) * 10) / 10 : 0
    const latest = levels[levels.length - 1] || 0
    const trend = levels.length >= 2 ? latest - levels[levels.length - 2] : 0

    // Stress over time
    const timeline = sorted.map((a, i) => ({
      name: `#${i + 1}`,
      level: a.stress_level || 0,
      date: a.created_at ? new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `Assessment ${i + 1}`,
    }))

    // Stress factor breakdown
    const factors = {
      sleep: { poor: 0, restless: 0, well: 0 },
      appetite: { decreased: 0, increased: 0, normal: 0 },
      overwhelmed: { often: 0, sometimes: 0, not_at_all: 0 },
      energy: { low: 0, medium: 0, high: 0 },
    }
    sorted.forEach(a => {
      if (a.sleep_quality && factors.sleep[a.sleep_quality] !== undefined) factors.sleep[a.sleep_quality]++
      if (a.appetite && factors.appetite[a.appetite] !== undefined) factors.appetite[a.appetite]++
      if (a.overwhelmed && factors.overwhelmed[a.overwhelmed] !== undefined) factors.overwhelmed[a.overwhelmed]++
      if (a.energy_level && factors.energy[a.energy_level] !== undefined) factors.energy[a.energy_level]++
    })

    // Radar data for stress factors
    const total = sorted.length || 1
    const radarData = [
      { factor: 'Poor Sleep', value: Math.round(((factors.sleep.poor + factors.sleep.restless * 0.5) / total) * 100) },
      { factor: 'Low Appetite', value: Math.round(((factors.appetite.decreased + factors.appetite.increased * 0.5) / total) * 100) },
      { factor: 'Overwhelmed', value: Math.round(((factors.overwhelmed.often + factors.overwhelmed.sometimes * 0.5) / total) * 100) },
      { factor: 'Low Energy', value: Math.round(((factors.energy.low + factors.energy.medium * 0.5) / total) * 100) },
    ]

    // Distribution pie
    const distribution = [
      { name: 'Low (1-3)', value: levels.filter(l => l <= 3).length },
      { name: 'Moderate (4-6)', value: levels.filter(l => l > 3 && l <= 6).length },
      { name: 'High (7-10)', value: levels.filter(l => l > 6).length },
    ].filter(d => d.value > 0)

    return { avg, latest, trend, timeline, radarData, distribution, total: sorted.length }
  }, [assessments])

  // Task status for pie chart
  const taskPieData = useMemo(() => [
    { name: 'Completed', value: taskStats.completed },
    { name: 'In Progress', value: taskStats.inProgress },
    { name: 'To Do', value: taskStats.todo },
    { name: 'Overdue', value: taskStats.overdue },
  ].filter(d => d.value > 0), [taskStats])

  // Priority distribution for bar chart
  const priorityData = useMemo(() => [
    { name: 'Critical', count: taskStats.byPriority.critical, fill: '#ef4444' },
    { name: 'High', count: taskStats.byPriority.high, fill: '#f59e0b' },
    { name: 'Normal', count: taskStats.byPriority.normal, fill: '#3b82f6' },
  ], [taskStats])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Reports & Analytics</h1>
        <p className="text-slate-400 mt-1">Comprehensive task & wellness insights</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle} label="Completion" value={`${taskStats.completionRate}%`}
          color={taskStats.completionRate >= 75 ? 'emerald' : taskStats.completionRate >= 50 ? 'amber' : 'red'} />
        <StatCard icon={Activity} label="Active Tasks" value={taskStats.inProgress + taskStats.todo} color="blue" />
        <StatCard icon={AlertTriangle} label="Overdue" value={taskStats.overdue}
          color={taskStats.overdue > 0 ? 'red' : 'emerald'} />
        <StatCard icon={Brain} label="Avg Stress" value={stressData?.avg || '—'}
          color={!stressData ? 'slate' : stressData.avg <= 3 ? 'emerald' : stressData.avg <= 6 ? 'amber' : 'red'} />
      </div>

      {/* Task Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Task Status Pie */}
        <div className="bg-[#131b2e] rounded-2xl border border-slate-800 shadow-xl p-6">
          <h3 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-2">
            <div className="p-1 rounded-lg bg-blue-600/10"><CheckCircle size={12} className="text-blue-400" /></div>
            Task Status Distribution
          </h3>
          {taskPieData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={140}>
                <PieChart>
                  <Pie data={taskPieData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={3} dataKey="value">
                    {taskPieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#131b2e', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5">
                {taskPieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-[10px] text-slate-400">{d.name}</span>
                    <span className="text-[10px] font-bold text-slate-300">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState text="Add tasks to see distribution" />
          )}
        </div>

        {/* Priority Breakdown */}
        <div className="bg-[#131b2e] rounded-2xl border border-slate-800 shadow-xl p-6">
          <h3 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-2">
            <div className="p-1 rounded-lg bg-amber-600/10"><AlertTriangle size={12} className="text-amber-400" /></div>
            Priority Breakdown
          </h3>
          {taskStats.total > 0 ? (
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={priorityData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#131b2e', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState text="Add tasks to see priorities" />
          )}
        </div>
      </div>

      {/* Stress Analytics Section */}
      <div className="bg-[#131b2e] rounded-2xl border border-slate-800 shadow-xl p-6">
        <h3 className="text-xs font-bold text-slate-200 mb-1 flex items-center gap-2">
          <div className="p-1 rounded-lg bg-purple-600/10"><Brain size={12} className="text-purple-400" /></div>
          Stress Level Over Time
        </h3>
        <p className="text-[10px] text-slate-500 mb-3">Tracking your wellness journey</p>
        {stressData && stressData.timeline.length > 0 ? (
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: stressData.latest <= 3 ? '#10b981' : stressData.latest <= 6 ? '#f59e0b' : '#ef4444' }}>
                  {stressData.latest}
                </p>
                <p className="text-[9px] text-slate-500">Latest</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">{stressData.avg}</p>
                <p className="text-[9px] text-slate-500">Average</p>
              </div>
              <div className="text-center">
                <p className={`text-lg font-bold ${stressData.trend > 0 ? 'text-red-400' : stressData.trend < 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {stressData.trend > 0 ? '+' : ''}{stressData.trend || '0'}
                </p>
                <p className="text-[9px] text-slate-500">Trend</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-slate-300">{stressData.total}</p>
                <p className="text-[9px] text-slate-500">Assessments</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={stressData.timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#131b2e', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '11px' }} />
                <defs>
                  <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="level" stroke="#8b5cf6" fill="url(#stressGrad)" strokeWidth={2} dot={{ r: 3, fill: '#8b5cf6' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState text="Complete stress assessments to see trends" />
        )}
      </div>

      {/* Stress Factor Analysis Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Radar */}
        <div className="bg-[#131b2e] rounded-2xl border border-slate-800 shadow-xl p-6">
          <h3 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-2">
            <div className="p-1 rounded-lg bg-purple-600/10"><TrendingUp size={12} className="text-purple-400" /></div>
            Stress Factor Radar
          </h3>
          {stressData && stressData.radarData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={stressData.radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="factor" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                <Radar dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState text="Complete assessments to see factor analysis" />
          )}
        </div>

        {/* Stress Distribution Pie */}
        <div className="bg-[#131b2e] rounded-2xl border border-slate-800 shadow-xl p-6">
          <h3 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-2">
            <div className="p-1 rounded-lg bg-cyan-600/10"><Activity size={12} className="text-cyan-400" /></div>
            Stress Distribution
          </h3>
          {stressData && stressData.distribution.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie data={stressData.distribution} cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={3} dataKey="value">
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip contentStyle={{ background: '#131b2e', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {stressData.distribution.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ['#10b981', '#f59e0b', '#ef4444'][i] }} />
                    <div>
                      <p className="text-[10px] font-bold text-slate-300">{d.name}</p>
                      <p className="text-[9px] text-slate-500">{d.value} assessment{d.value !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState text="Complete assessments to see distribution" />
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  const colorMap = {
    emerald: { bg: 'bg-emerald-600/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    blue: { bg: 'bg-blue-600/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    amber: { bg: 'bg-amber-600/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    red: { bg: 'bg-red-600/10', text: 'text-red-400', border: 'border-red-500/20' },
    slate: { bg: 'bg-slate-600/10', text: 'text-slate-400', border: 'border-slate-500/20' },
  }
  const c = colorMap[color] || colorMap.blue
  return (
    <div className={`bg-[#131b2e] rounded-xl border border-slate-800 shadow-xl p-3 sm:p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1 rounded-lg ${c.bg}`}><Icon size={12} className={c.text} /></div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-xl sm:text-2xl font-bold ${c.text}`}>{value}</p>
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div className="flex items-center justify-center py-8">
      <p className="text-[11px] text-slate-600">{text}</p>
    </div>
  )
}
