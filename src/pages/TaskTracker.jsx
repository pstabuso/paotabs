import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Trash2, List, LayoutGrid, X, ArrowRight, Inbox } from 'lucide-react'

const STATUS_COLS = [
  { key: 'todo', label: 'To Do', color: 'bg-slate-400', count_bg: 'bg-slate-600/10 text-slate-400' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-amber-400', count_bg: 'bg-amber-600/10 text-amber-400' },
  { key: 'done', label: 'Done', color: 'bg-emerald-400', count_bg: 'bg-emerald-600/10 text-emerald-400' },
]

const PRIORITIES = ['low', 'normal', 'high', 'critical']

const priorityStyles = {
  low: 'text-slate-400 bg-slate-600/10 border-slate-600/20',
  normal: 'text-blue-400 bg-blue-600/10 border-blue-600/20',
  high: 'text-amber-400 bg-amber-600/10 border-amber-600/20',
  critical: 'text-red-400 bg-red-600/10 border-red-600/20'
}

export default function TaskTracker() {
  const { tasks, addTask, updateTask, deleteTask } = useApp()
  const [view, setView] = useState('board')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', priority: 'normal', due_date: '', status: 'todo' })
  const [saving, setSaving] = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    await addTask({ ...form, due_date: form.due_date || null })
    setForm({ title: '', description: '', priority: 'normal', due_date: '', status: 'todo' })
    setShowModal(false)
    setSaving(false)
  }

  const cycleStatus = async (task) => {
    const next = { todo: 'in_progress', in_progress: 'done', done: 'todo' }
    await updateTask(task.id, { status: next[task.status] })
  }

  return (
    <div className="space-y-4 sm:space-y-5 animate-enter">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white">Task Tracker</h1>
          <p className="text-slate-500 text-xs mt-0.5">{tasks.length} total · {tasks.filter(t => t.status === 'done').length} done</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-[#131b2e] border border-slate-800 rounded-lg overflow-hidden">
            <button onClick={() => setView('board')} className={`px-2.5 py-1.5 text-xs transition-all ${view === 'board' ? 'bg-blue-600/10 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>
              <LayoutGrid size={14} />
            </button>
            <button onClick={() => setView('list')} className={`px-2.5 py-1.5 text-xs transition-all ${view === 'list' ? 'bg-blue-600/10 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>
              <List size={14} />
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-900/20 active:scale-[0.97] transition-all"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {view === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 stagger">
          {STATUS_COLS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.key)
            return (
              <div key={col.key} className="bg-[#131b2e] rounded-xl border border-slate-800 shadow-xl p-3 min-h-[200px]">
                <div className="flex items-center gap-2 mb-3 px-0.5">
                  <div className={`w-2 h-2 rounded-full ${col.color}`} />
                  <h3 className="text-xs font-bold text-slate-300">{col.label}</h3>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-auto ${col.count_bg}`}>
                    {colTasks.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {colTasks.map(task => (
                    <TaskCard key={task.id} task={task} onStatusChange={cycleStatus} onDelete={deleteTask} />
                  ))}
                  {colTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Inbox size={22} className="text-slate-700 mb-1.5" />
                      <p className="text-[10px] text-slate-600">No tasks</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-[#131b2e] rounded-xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#0f1524]">
                  <th className="text-left px-3 sm:px-4 py-2.5 text-[9px] text-slate-500 font-bold uppercase tracking-wider">Task</th>
                  <th className="text-left px-3 sm:px-4 py-2.5 text-[9px] text-slate-500 font-bold uppercase tracking-wider hidden sm:table-cell">Priority</th>
                  <th className="text-left px-3 sm:px-4 py-2.5 text-[9px] text-slate-500 font-bold uppercase tracking-wider hidden md:table-cell">Due</th>
                  <th className="text-left px-3 sm:px-4 py-2.5 text-[9px] text-slate-500 font-bold uppercase tracking-wider">Status</th>
                  <th className="px-2 py-2.5 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {tasks.map(task => (
                  <tr key={task.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-3 sm:px-4 py-2.5 text-slate-200 font-medium truncate max-w-[150px] sm:max-w-none">{task.title}</td>
                    <td className="px-3 sm:px-4 py-2.5 hidden sm:table-cell">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${priorityStyles[task.priority] || priorityStyles.normal}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 text-slate-500 hidden md:table-cell">
                      {task.due_date ? (
                        <span className={new Date(task.due_date) < new Date() && task.status !== 'done' ? 'text-red-400 font-bold' : ''}>
                          {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-3 sm:px-4 py-2.5">
                      <button onClick={() => cycleStatus(task)} className="text-[10px] text-slate-400 hover:text-blue-400 capitalize transition-colors font-medium">
                        {task.status.replace('_', ' ')}
                      </button>
                    </td>
                    <td className="px-2 py-2.5">
                      <button onClick={() => deleteTask(task.id)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Inbox size={28} className="text-slate-700 mb-2" />
              <p className="text-slate-500 text-xs">No tasks yet</p>
              <button onClick={() => setShowModal(true)} className="text-[10px] text-blue-400 mt-1.5 hover:text-blue-300 font-bold">Add first task</button>
            </div>
          )}
        </div>
      )}

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-3 animate-fade" onClick={() => setShowModal(false)}>
          <div className="bg-[#131b2e] border border-slate-700 rounded-xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 w-full max-w-sm animate-scale" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">New Task</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-800/50 transition-colors">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3">
              <input
                type="text" placeholder="Task title" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg bg-[#0B0F19] border border-slate-700/50 text-slate-200 text-xs focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                required autoFocus
              />
              <textarea
                placeholder="Description (optional)" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg bg-[#0B0F19] border border-slate-700/50 text-slate-200 text-xs focus:outline-none focus:border-blue-500 resize-none h-16 transition-all placeholder:text-slate-600"
              />
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[9px] text-slate-500 mb-1 block uppercase tracking-wider font-bold">Priority</label>
                  <select
                    value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg bg-[#0B0F19] border border-slate-700/50 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  >
                    {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 mb-1 block uppercase tracking-wider font-bold">Due Date</label>
                  <input
                    type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg bg-[#0B0F19] border border-slate-700/50 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <button
                type="submit" disabled={saving}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-900/20 disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              >
                {saving ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Add Task <ArrowRight size={12} /></>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function TaskCard({ task, onStatusChange, onDelete }) {
  return (
    <div className="bg-[#1e293b] border border-slate-700/50 rounded-lg p-3 group hover:border-blue-500/30 transition-all duration-200">
      <div className="flex items-start justify-between gap-1.5">
        <h4 className="text-xs font-medium text-slate-200 flex-1">{task.title}</h4>
        <button onClick={() => onDelete(task.id)} className="text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-0.5">
          <Trash2 size={11} />
        </button>
      </div>
      {task.description && (
        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
      )}
      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-700/30">
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${priorityStyles[task.priority] || priorityStyles.normal}`}>
          {task.priority}
        </span>
        <div className="flex items-center gap-2">
          {task.due_date && (
            <span className={`text-[10px] ${new Date(task.due_date) < new Date() && task.status !== 'done' ? 'text-red-400 font-bold' : 'text-slate-600'}`}>
              {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          <button onClick={() => onStatusChange(task)} className="text-[10px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-0.5 transition-colors">
            Move <ArrowRight size={10} />
          </button>
        </div>
      </div>
    </div>
  )
}
