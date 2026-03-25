import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { CalendarClock, Zap, AlertTriangle, Clock, CheckCircle, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const PRIORITY_WEIGHT = { critical: 4, high: 3, normal: 1 }
const PRIORITY_COLORS = {
  critical: 'bg-red-500/20 border-red-500/30 text-red-300',
  high: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
  normal: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
}

function autoSchedule(tasks, events) {
  const now = new Date()
  const activeTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'done')

  // Score each task: higher = more urgent
  const scored = activeTasks.map(task => {
    const deadline = task.deadline ? new Date(task.deadline) : null
    const daysUntilDue = deadline ? Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)) : 30
    const priorityWeight = PRIORITY_WEIGHT[task.priority] || 1
    const urgency = deadline ? Math.max(0, 10 - daysUntilDue) : 0
    const score = (priorityWeight * 3) + (urgency * 2) + (daysUntilDue < 0 ? 20 : 0)
    return { ...task, score, daysUntilDue, suggestedDate: null }
  })

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score)

  // Distribute across upcoming days (max 3 tasks per day, skip overloaded days)
  const schedule = {}
  const MAX_PER_DAY = 3

  // Mark event days
  const eventDays = new Set()
  events.forEach(e => {
    if (e.event_date) eventDays.add(new Date(e.event_date).toDateString())
  })

  scored.forEach(task => {
    // If task has a deadline, try to schedule 1-2 days before
    let targetDate
    if (task.deadline) {
      const dl = new Date(task.deadline)
      if (dl < now) {
        targetDate = new Date(now)
      } else {
        const daysBefore = task.priority === 'critical' ? 0 : task.priority === 'high' ? 1 : 2
        targetDate = new Date(dl)
        targetDate.setDate(targetDate.getDate() - daysBefore)
        if (targetDate < now) targetDate = new Date(now)
      }
    } else {
      targetDate = new Date(now)
      targetDate.setDate(targetDate.getDate() + 3)
    }

    // Find the closest available slot
    for (let offset = 0; offset < 14; offset++) {
      const candidate = new Date(targetDate)
      candidate.setDate(candidate.getDate() + offset)
      const key = candidate.toDateString()
      const dayTasks = schedule[key] || []
      if (dayTasks.length < MAX_PER_DAY) {
        if (!schedule[key]) schedule[key] = []
        schedule[key].push({ ...task, suggestedDate: new Date(candidate) })
        break
      }
    }
  })

  return schedule
}

export default function AutoScheduler() {
  const { tasks, events } = useApp()
  const [monthOffset, setMonthOffset] = useState(0)

  const now = new Date()
  const viewDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const schedule = useMemo(() => autoSchedule(tasks, events), [tasks, events])

  // Calendar grid
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7

  // Get events for a specific date
  const getEventsForDate = (date) => {
    return events.filter(e => {
      if (!e.event_date) return false
      return new Date(e.event_date).toDateString() === date.toDateString()
    })
  }

  // Get scheduled tasks for a date
  const getScheduledForDate = (date) => {
    return schedule[date.toDateString()] || []
  }

  // Summary stats
  const totalScheduled = Object.values(schedule).flat().length
  const overdueTasks = tasks.filter(t => {
    if (t.status === 'completed' || t.status === 'done') return false
    if (!t.deadline) return false
    return new Date(t.deadline) < now
  }).length
  const todayTasks = getScheduledForDate(now)

  return (
    <div className="animate-enter space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-600/10">
            <CalendarClock size={18} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              Auto Scheduler
              <Sparkles size={14} className="text-indigo-400" />
            </h1>
            <p className="text-slate-500 text-[11px] mt-0.5">AI-optimized task scheduling</p>
          </div>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-[#131b2e] rounded-xl border border-slate-800 shadow-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Zap size={11} className="text-indigo-400" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Scheduled</span>
          </div>
          <p className="text-xl font-bold text-indigo-400">{totalScheduled}</p>
        </div>
        <div className="bg-[#131b2e] rounded-xl border border-slate-800 shadow-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Clock size={11} className="text-blue-400" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Today</span>
          </div>
          <p className="text-xl font-bold text-blue-400">{todayTasks.length}</p>
        </div>
        <div className="bg-[#131b2e] rounded-xl border border-slate-800 shadow-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <AlertTriangle size={11} className={overdueTasks > 0 ? 'text-red-400' : 'text-emerald-400'} />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Overdue</span>
          </div>
          <p className={`text-xl font-bold ${overdueTasks > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{overdueTasks}</p>
        </div>
      </div>

      {/* Today's Focus */}
      {todayTasks.length > 0 && (
        <div className="bg-[#131b2e] rounded-xl border border-indigo-500/20 shadow-xl p-4">
          <h3 className="text-xs font-bold text-slate-200 mb-2.5 flex items-center gap-2">
            <div className="p-1 rounded-lg bg-indigo-600/10"><Zap size={12} className="text-indigo-400" /></div>
            Today's Focus
          </h3>
          <div className="space-y-1.5">
            {todayTasks.map((task, i) => (
              <div key={i} className="flex items-center gap-2 bg-[#0B0F19]/50 rounded-lg px-3 py-2 border border-slate-800/50">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  task.priority === 'critical' ? 'bg-red-400' : task.priority === 'high' ? 'bg-amber-400' : 'bg-blue-400'
                }`} />
                <span className="text-[11px] font-medium text-slate-200 flex-1 truncate">{task.title || task.name}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.normal}`}>
                  {(task.priority || 'normal').toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="bg-[#131b2e] rounded-xl border border-slate-800 shadow-xl p-4">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setMonthOffset(monthOffset - 1)}
            className="p-1.5 rounded-lg hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 transition-all">
            <ChevronLeft size={16} />
          </button>
          <h3 className="text-sm font-bold text-white">{monthName}</h3>
          <button onClick={() => setMonthOffset(monthOffset + 1)}
            className="p-1.5 rounded-lg hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 transition-all">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-px mb-1">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-center text-[9px] font-bold text-slate-600 uppercase tracking-wider py-1">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-px">
          {Array.from({ length: totalCells }).map((_, i) => {
            const dayNum = i - firstDay + 1
            const isValid = dayNum >= 1 && dayNum <= daysInMonth
            if (!isValid) return <div key={i} className="min-h-[52px] sm:min-h-[72px]" />

            const date = new Date(year, month, dayNum)
            const isToday = date.toDateString() === now.toDateString()
            const scheduledTasks = getScheduledForDate(date)
            const dayEvents = getEventsForDate(date)
            const isPast = date < new Date(now.getFullYear(), now.getMonth(), now.getDate())

            return (
              <div key={i} className={`min-h-[52px] sm:min-h-[72px] rounded-lg p-1 border transition-all ${
                isToday ? 'bg-indigo-500/10 border-indigo-500/30' : 'border-transparent hover:bg-slate-800/20'
              } ${isPast ? 'opacity-40' : ''}`}>
                <div className={`text-[10px] font-bold mb-0.5 ${isToday ? 'text-indigo-400' : 'text-slate-500'}`}>
                  {dayNum}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.map((e, j) => (
                    <div key={`e${j}`} className="text-[7px] sm:text-[8px] px-1 py-0.5 rounded bg-purple-500/20 text-purple-300 truncate border border-purple-500/20">
                      {e.title || e.name}
                    </div>
                  ))}
                  {scheduledTasks.slice(0, 2).map((t, j) => (
                    <div key={`t${j}`} className={`text-[7px] sm:text-[8px] px-1 py-0.5 rounded truncate border ${
                      t.priority === 'critical' ? 'bg-red-500/15 border-red-500/20 text-red-300' :
                      t.priority === 'high' ? 'bg-amber-500/15 border-amber-500/20 text-amber-300' :
                      'bg-blue-500/15 border-blue-500/20 text-blue-300'
                    }`}>
                      {t.title || t.name}
                    </div>
                  ))}
                  {scheduledTasks.length > 2 && (
                    <div className="text-[7px] text-slate-500 px-1">+{scheduledTasks.length - 2} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-[#131b2e] rounded-xl border border-slate-800 shadow-xl p-3 sm:p-4">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Scheduling Algorithm</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] text-slate-400">
          <div className="flex gap-2">
            <div className="w-0.5 rounded-full bg-red-500/40 flex-shrink-0" />
            <p><span className="text-red-400 font-bold">Critical</span> tasks are scheduled on their deadline day</p>
          </div>
          <div className="flex gap-2">
            <div className="w-0.5 rounded-full bg-amber-500/40 flex-shrink-0" />
            <p><span className="text-amber-400 font-bold">High</span> priority tasks are scheduled 1 day before deadline</p>
          </div>
          <div className="flex gap-2">
            <div className="w-0.5 rounded-full bg-blue-500/40 flex-shrink-0" />
            <p><span className="text-blue-400 font-bold">Normal</span> tasks are spread 2 days before, max 3 per day</p>
          </div>
        </div>
      </div>
    </div>
  )
}
