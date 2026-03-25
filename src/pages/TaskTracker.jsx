import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Trash2, GripVertical, List, LayoutGrid, X } from 'lucide-react'

const STATUS_COLS = [
  { key: 'todo', label: 'To Do', color: 'bg-slate-500' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-amber-500' },
  { key: 'done', label: 'Done', color: 'bg-emerald-500' },
]

const PRIORITIES = ['low', 'normal', 'high', 'critical']

const priorityColor = (p) => ({
  low: 'text-slate-400 bg-slate-500/10',
  normal: 'text-blue-400 bg-blue-500/10',
  high: 'text-amber-400 bg-amber-500/10',
  critical: 'text-red-400 bg-red-500/10'
}[p] || 'text-slate-400 bg-slate-500/10')

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
    <div className="space-y-6 animate-enter">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Task Tracker</h1>
          <p className="text-slate-400 text-sm mt-1">{tasks.length} total tasks</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#131b2e] rounded-xl border border-slate-800 overflow-hidden">
            <button onClick={() => setView('board')} className={`px-3 py-2 text-sm ${view === 'board' ? 'bg-indigo-500/15 text-indigo-400' : 'text-slate-400'}`}>
              <LayoutGrid size={16} />
            </button>
            <button onClick={() => setView('list')} className={`px-3 py-2 text-sm ${view === 'list' ? 'bg-indigo-500/15 text-indigo-400' : 'text-slate-400'}`}>
              <List size={16} />
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98] transition-all"
          >
            <Plus size={16} /> Add Task
          </button>
        </div>
      </div>

      {view === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATUS_COLS.map(col => (
            <div key={col.key} className="bg-[#0f1524] rounded-2xl border border-slate-800 p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                <h3 className="text-sm font-semibold text-slate-300">{col.label}</h3>
                <span className="text-xs text-slate-500 ml-auto">
                  {tasks.filter(t => t.status === col.key).length}
                </span>
              </div>
              <div className="space-y-3">
                {tasks.filter(t => t.status === col.key).map(task => (
                  <TaskCard key={task.id} task={task} onStatusChange={cycleStatus} onDelete={deleteTask} />
                ))}
                {tasks.filter(t => t.status === col.key).length === 0 && (
                  <p className="text-xs text-slate-600 text-center py-6">No tasks</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#131b2e] rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Task</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium hidden sm:table-cell">Priority</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium hidden md:table-cell">Due Date</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                  <td className="px-4 py-3 text-slate-200">{task.title}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${priorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 hidden md:table-cell">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => cycleStatus(task)} className="text-xs text-slate-400 hover:text-indigo-400">
                      {task.status.replace('_', ' ')}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteTask(task.id)} className="text-slate-500 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tasks.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-12">No tasks yet. Add one to get started!</p>
          )}
        </div>
      )}

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-[#131b2e] rounded-2xl border border-slate-800 p-6 w-full max-w-md shadow-2xl animate-enter" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-200">New Task</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-300">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <input
                type="text"
                placeholder="Task title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0f1524] border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                required
                autoFocus
              />
              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0f1524] border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 resize-none h-20"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0f1524] border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Due Date</label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={e => setForm({ ...form, due_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0f1524] border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium text-sm hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 active:scale-[0.98] transition-all"
              >
                {saving ? 'Adding...' : 'Add Task'}
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
    <div className="bg-[#131b2e] rounded-xl border border-slate-800 p-4 hover:border-slate-700 transition-colors group">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-slate-200 flex-1">{task.title}</h4>
        <button
          onClick={() => onDelete(task.id)}
          className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={14} />
        </button>
      </div>
      {task.description && (
        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center justify-between mt-3">
        <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${priorityColor(task.priority)}`}>
          {task.priority}
        </span>
        <div className="flex items-center gap-2">
          {task.due_date && (
            <span className={`text-xs ${
              new Date(task.due_date) < new Date() && task.status !== 'done' ? 'text-red-400' : 'text-slate-500'
            }`}>
              {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          <button
            onClick={() => onStatusChange(task)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Move →
          </button>
        </div>
      </div>
    </div>
  )
}
