import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { Grid3X3, AlertTriangle, Clock, Trash2, ArrowDownRight, CheckCircle } from 'lucide-react'

function categorizeTask(task) {
  const now = new Date()
  const deadline = task.deadline ? new Date(task.deadline) : null
  const daysUntilDue = deadline ? Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)) : 999

  const isUrgent = daysUntilDue <= 3
  const isImportant = task.priority === 'critical' || task.priority === 'high'

  if (isUrgent && isImportant) return 'do'
  if (!isUrgent && isImportant) return 'schedule'
  if (isUrgent && !isImportant) return 'delegate'
  return 'eliminate'
}

function getDaysLabel(task) {
  if (!task.deadline) return 'No deadline'
  const now = new Date()
  const deadline = new Date(task.deadline)
  const days = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  return `${days}d left`
}

const QUADRANTS = [
  {
    key: 'do',
    title: 'Do First',
    subtitle: 'Urgent & Important',
    icon: AlertTriangle,
    color: 'red',
    bg: 'bg-red-500/5',
    border: 'border-red-500/20',
    iconBg: 'bg-red-600/10',
    iconColor: 'text-red-400',
    tagBg: 'bg-red-500/10 text-red-300',
    desc: 'Critical tasks due within 3 days',
  },
  {
    key: 'schedule',
    title: 'Schedule',
    subtitle: 'Not Urgent & Important',
    icon: Clock,
    color: 'blue',
    bg: 'bg-blue-500/5',
    border: 'border-blue-500/20',
    iconBg: 'bg-blue-600/10',
    iconColor: 'text-blue-400',
    tagBg: 'bg-blue-500/10 text-blue-300',
    desc: 'Important but can be planned ahead',
  },
  {
    key: 'delegate',
    title: 'Delegate',
    subtitle: 'Urgent & Not Important',
    icon: ArrowDownRight,
    color: 'amber',
    bg: 'bg-amber-500/5',
    border: 'border-amber-500/20',
    iconBg: 'bg-amber-600/10',
    iconColor: 'text-amber-400',
    tagBg: 'bg-amber-500/10 text-amber-300',
    desc: 'Due soon but lower priority — delegate if possible',
  },
  {
    key: 'eliminate',
    title: 'Eliminate',
    subtitle: 'Not Urgent & Not Important',
    icon: Trash2,
    color: 'slate',
    bg: 'bg-slate-500/5',
    border: 'border-slate-800',
    iconBg: 'bg-slate-600/10',
    iconColor: 'text-slate-400',
    tagBg: 'bg-slate-500/10 text-slate-400',
    desc: 'Consider removing or deferring',
  },
]

const PRIORITY_COLORS = {
  critical: 'bg-red-500/10 text-red-300 border-red-500/20',
  high: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  normal: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
}

export default function EisenhowerMatrix() {
  const { tasks } = useApp()

  const activeTasks = useMemo(() =>
    tasks.filter(t => t.status !== 'completed' && t.status !== 'done'),
    [tasks]
  )

  const categorized = useMemo(() => {
    const groups = { do: [], schedule: [], delegate: [], eliminate: [] }
    activeTasks.forEach(task => {
      const cat = categorizeTask(task)
      groups[cat].push(task)
    })
    // Sort each by deadline proximity
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => {
        const da = a.deadline ? new Date(a.deadline) : new Date('2099-01-01')
        const db = b.deadline ? new Date(b.deadline) : new Date('2099-01-01')
        return da - db
      })
    })
    return groups
  }, [activeTasks])

  const completedCount = tasks.filter(t => t.status === 'completed' || t.status === 'done').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Eisenhower Matrix</h1>
            <p className="text-slate-400 mt-1">Auto-prioritized by deadline & importance</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-[#131b2e] border border-slate-800 text-[10px] font-bold text-slate-400">
            {activeTasks.length} active
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
            <CheckCircle size={10} /> {completedCount} done
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-[#131b2e] rounded-2xl border border-slate-800 shadow-xl p-5">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">How it works</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="text-[10px] text-slate-400"><span className="text-red-400 font-bold">Urgent + Important</span> = Due in 3 days + High/Critical</div>
          <div className="text-[10px] text-slate-400"><span className="text-blue-400 font-bold">Important</span> = High/Critical priority, due later</div>
          <div className="text-[10px] text-slate-400"><span className="text-amber-400 font-bold">Urgent</span> = Due in 3 days, normal priority</div>
          <div className="text-[10px] text-slate-400"><span className="text-slate-400 font-bold">Neither</span> = Normal priority, due later</div>
        </div>
      </div>

      {/* Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {QUADRANTS.map(q => (
          <div key={q.key} className={`${q.bg} rounded-2xl border ${q.border} shadow-xl p-5 min-h-[200px]`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-1.5 rounded-lg ${q.iconBg}`}>
                <q.icon size={14} className={q.iconColor} />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-slate-200">{q.title}</h3>
                <p className="text-[9px] text-slate-500">{q.subtitle}</p>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${q.tagBg}`}>
                {categorized[q.key].length}
              </span>
            </div>

            {categorized[q.key].length === 0 ? (
              <div className="text-center py-6">
                <p className="text-[10px] text-slate-600">{q.desc}</p>
                <p className="text-[10px] text-slate-700 mt-1">No tasks here</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {categorized[q.key].map(task => (
                  <div key={task.id || task._id} className="flex items-center gap-2 bg-[#0B0F19]/50 rounded-lg px-2.5 py-2 border border-slate-800/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-slate-200 truncate">{task.title || task.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.normal}`}>
                          {(task.priority || 'normal').toUpperCase()}
                        </span>
                        <span className={`text-[9px] ${
                          getDaysLabel(task).includes('overdue') ? 'text-red-400 font-bold' :
                          getDaysLabel(task).includes('today') ? 'text-amber-400 font-bold' :
                          'text-slate-500'
                        }`}>
                          {getDaysLabel(task)}
                        </span>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      task.status === 'in_progress' || task.status === 'ongoing' ? 'bg-amber-400' : 'bg-slate-600'
                    }`} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
