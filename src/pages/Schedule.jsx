import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { ChevronLeft, ChevronRight, Plus, X, Trash2, Calendar as CalIcon } from 'lucide-react'

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']

export default function Schedule() {
  const { events, tasks, addEvent, deleteEvent } = useApp()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', event_time: '', color: '#3b82f6' })
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
      id: `task-${t.id}`, title: t.title, color: t.priority === 'critical' ? '#ef4444' : t.priority === 'high' ? '#f59e0b' : '#3b82f6',
      isTask: true
    }))
    return [...dayEvents, ...dayTasks]
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToday = () => setCurrentDate(new Date())

  const openAddEvent = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDate(dateStr)
    setForm({ title: '', description: '', event_time: '', color: '#3b82f6' })
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
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month

  return (
    <div className="space-y-6 animate-enter">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-amber-600/10">
          <CalIcon size={22} className="text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Schedule</h1>
          <p className="text-slate-500 text-sm mt-0.5">Events and task deadlines</p>
        </div>
      </div>

      <div className="bg-[#131b2e] rounded-2xl border border-slate-800 shadow-xl p-6">
        {/* Calendar header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-slate-800/50 text-slate-500 hover:text-slate-200 transition-all">
              <ChevronLeft size={18} />
            </button>
            <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-slate-800/50 text-slate-500 hover:text-slate-200 transition-all">
              <ChevronRight size={18} />
            </button>
          </div>
          <h2 className="text-lg font-bold text-white">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={goToday} className={`text-xs px-3 py-1.5 rounded-lg transition-all font-bold ${isCurrentMonth ? 'text-slate-600' : 'text-blue-400 hover:bg-blue-600/10'}`}>
            Today
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2 bg-[#0f1524] rounded-xl">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider py-2.5">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((day, i) => {
            const dayEvents = getEventsForDay(day)
            const hasEvents = dayEvents.length > 0
            return (
              <div
                key={i}
                onClick={() => day && openAddEvent(day)}
                className={`min-h-[85px] sm:min-h-[100px] rounded-xl p-2 transition-all cursor-pointer group border ${
                  !day ? 'border-transparent' :
                  isToday(day) ? 'bg-blue-600/8 border-blue-500/20 hover:border-blue-500/40' :
                  hasEvents ? 'bg-slate-800/20 border-slate-800/50 hover:border-slate-700' :
                  'border-transparent hover:bg-slate-800/20 hover:border-slate-800/50'
                }`}
              >
                {day && (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg ${
                        isToday(day)
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                          : 'text-slate-400 group-hover:text-slate-200'
                      }`}>
                        {day}
                      </span>
                      {hasEvents && !isToday(day) && (
                        <div className="flex gap-0.5">
                          {dayEvents.slice(0, 3).map((ev, j) => (
                            <div key={j} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ev.color || '#3b82f6' }} />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map(ev => (
                        <div key={ev.id} className="flex items-center gap-1 group/item">
                          <div className="w-1 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: ev.color || '#3b82f6' }} />
                          <span className="text-[10px] text-slate-400 truncate flex-1 group-hover/item:text-slate-300">{ev.title}</span>
                          {!ev.isTask && (
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteEvent(ev.id) }}
                              className="opacity-0 group-hover/item:opacity-100 text-slate-600 hover:text-red-400 transition-opacity"
                            >
                              <Trash2 size={9} />
                            </button>
                          )}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-[10px] text-slate-600 font-bold">+{dayEvents.length - 2} more</span>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade" onClick={() => setShowModal(false)}>
          <div className="bg-[#131b2e] border border-slate-700 rounded-2xl shadow-2xl p-7 w-full max-w-md animate-scale" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-white">New Event</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {new Date(selectedDate + 'T00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-800/50 transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <input
                type="text" placeholder="Event title" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#0B0F19] border border-slate-700/50 text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                required autoFocus
              />
              <input
                type="text" placeholder="Description (optional)" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#0B0F19] border border-slate-700/50 text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 mb-1.5 block uppercase tracking-wider font-bold">Time</label>
                  <input
                    type="time" value={form.event_time} onChange={e => setForm({ ...form, event_time: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-700/50 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 mb-1.5 block uppercase tracking-wider font-bold">Color</label>
                  <div className="flex gap-2 mt-1.5">
                    {COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                        className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 ${form.color === c ? 'border-white shadow-lg scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <button type="submit" disabled={saving}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-900/20 disabled:opacity-50 active:scale-[0.98] transition-all">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Add Event'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
