import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { ChevronLeft, ChevronRight, Plus, X, Trash2 } from 'lucide-react'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']

export default function Schedule() {
  const { events, tasks, addEvent, deleteEvent } = useApp()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', event_time: '', color: '#6366f1' })
  const [saving, setSaving] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(d)
    return days
  }, [year, month])

  const getEventsForDay = (day) => {
    if (!day) return []
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayEvents = events.filter(e => e.event_date === dateStr)
    const dayTasks = tasks.filter(t => t.due_date === dateStr).map(t => ({
      id: `task-${t.id}`, title: `📋 ${t.title}`, color: t.priority === 'critical' ? '#ef4444' : t.priority === 'high' ? '#f59e0b' : '#6366f1',
      isTask: true
    }))
    return [...dayEvents, ...dayTasks]
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const openAddEvent = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDate(dateStr)
    setForm({ title: '', description: '', event_time: '', color: '#6366f1' })
    setShowModal(true)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    await addEvent({ ...form, event_date: selectedDate, event_time: form.event_time || null })
    setShowModal(false)
    setSaving(false)
  }

  const today = new Date()
  const isToday = (day) => day && today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

  return (
    <div className="space-y-6 animate-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Schedule</h1>
          <p className="text-slate-400 text-sm mt-1">Events and task deadlines</p>
        </div>
      </div>

      {/* Calendar header */}
      <div className="bg-[#131b2e] rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-semibold text-slate-200">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-medium text-slate-500 py-2">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            const dayEvents = getEventsForDay(day)
            return (
              <div
                key={i}
                onClick={() => day && openAddEvent(day)}
                className={`min-h-[80px] sm:min-h-[100px] rounded-xl p-1.5 border transition-colors cursor-pointer ${
                  day ? 'hover:border-slate-600 border-slate-800/50' : 'border-transparent'
                } ${isToday(day) ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-[#0f1524]/50'}`}
              >
                {day && (
                  <>
                    <span className={`text-xs font-medium ${isToday(day) ? 'text-indigo-400' : 'text-slate-400'}`}>
                      {day}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 3).map(ev => (
                        <div key={ev.id} className="flex items-center gap-1 group">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: ev.color || '#6366f1' }} />
                          <span className="text-[10px] text-slate-400 truncate flex-1">{ev.title}</span>
                          {!ev.isTask && (
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteEvent(ev.id) }}
                              className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-opacity"
                            >
                              <Trash2 size={10} />
                            </button>
                          )}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[10px] text-slate-500">+{dayEvents.length - 3} more</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-[#131b2e] rounded-2xl border border-slate-800 p-6 w-full max-w-md shadow-2xl animate-enter" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-200">
                New Event — {new Date(selectedDate + 'T00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-300">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <input
                type="text"
                placeholder="Event title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0f1524] border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                required
                autoFocus
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0f1524] border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Time (optional)</label>
                  <input
                    type="time"
                    value={form.event_time}
                    onChange={e => setForm({ ...form, event_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0f1524] border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Color</label>
                  <div className="flex gap-2 mt-1">
                    {COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm({ ...form, color: c })}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${form.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium text-sm hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 active:scale-[0.98] transition-all"
              >
                {saving ? 'Adding...' : 'Add Event'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
