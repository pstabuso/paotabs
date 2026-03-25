import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Trash2, List, LayoutGrid, X, ArrowRight, Inbox, AlertTriangle } from 'lucide-react'

const STATUS_COLS = [
  { key: 'todo', label: 'To Do', icon: '📋', color: 'bg-slate-400' },
  { key: 'in_progress', label: 'In Progress', icon: '⚡', color: 'bg-amber-400' },
  { key: 'done', label: 'Done', icon: '✅', color: 'bg-emerald-400' },
]

const PRIORITIES = ['normal', 'high', 'critical']

const priorityStyles = {
  normal: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  high: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  critical: 'text-red-400 bg-red-500/10 border-red-500/20',
}

export default function TaskTracker() {
  const { tasks, addTask, updateTask, deleteTask } = useApp()
  const [view, setView] = useState('board')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', priority: 'normal', deadline: '', status: 'todo' })
  const [saving, setSaving] = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    await addTask({ ...form, deadline: form.deadline || null })
    setForm({ title: '', description: '', priority: 'normal', deadline: '', status: 'todo' })
    setShowModal(false)
    setSaving(false)
  }

  const cycleStatus = async (task) => {
    const next = { todo: 'in_progress', in_progress: 'done', done: 'todo' }
    await updateTask(task.id, { status: next[task.status] || 'todo' })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Task Tracker</h1>
          <p className="text-slate-400 mt-1">{tasks.length} total · {tasks.filter(t => t.status === 'done').length} completed</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-[#131b2e] p-1 rounded-xl border border-slate-800 flex shadow-sm">
            <button onClick={() => setView('board')} className={`p-2 rounded-lg transition-all ${view === 'board' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
              <LayoutGrid size={16} />
            </button>
            <button onClick={() => setView('list')} className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
              <List size={16} />
            </button>
          </div>
          <button onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition active:scale-95">
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

      {/* Board View */}
      {view === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-hidden">
          {STATUS_COLS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.key)
            return (
              <div key={col.key} className="flex flex-col h-full bg-[#131b2e] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/30 sticky top-0 z-10">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                    <span className="font-bold text-white">{col.label}</span>
                  </div>
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-xs font-bold text-slate-400">{colTasks.length}</span>
                </div>
                <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                  {colTasks.map(task => (
                    <TaskCard key={task.id} task={task} onStatusChange={cycleStatus} onDelete={deleteTask} />
                  ))}
                  {colTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                      <Inbox size={28} className="text-slate-700 mb-2" />
                      <p className="text-xs text-slate-600 font-medium">No tasks here</p>
                      <p className="text-[10px] text-slate-700 mt-1">Click "New Task" to add one</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-[#131b2e] rounded-2xl border border-slate-800 overflow-hidden shadow-xl h-full overflow-y-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead>
              <tr className="bg-[#0f1524] text-xs uppercase font-bold text-slate-500 sticky top-0 z-10 shadow-sm">
                <th className="p-4 pl-6">Task</th>
                <th className="p-4 hidden sm:table-cell">Priority</th>
                <th className="p-4 hidden md:table-cell">Deadline</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => {
                const dl = task.deadline || task.due_date
                const isOverdue = dl && new Date(dl) < new Date() && task.status !== 'done'
                return (
                  <tr key={task.id} className="hover:bg-slate-800/40 cursor-pointer border-b border-slate-800/30 group">
                    <td className="p-4 pl-6">
                      <p className="text-sm font-bold text-slate-200 truncate max-w-[200px]">{task.title || task.name}</p>
                      {task.description && <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[200px]">{task.description}</p>}
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${priorityStyles[task.priority] || priorityStyles.normal}`}>
                        {task.priority || 'normal'}
                      </span>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      {dl ? (
                        <span className={`font-mono text-xs ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                          {new Date(dl).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {isOverdue && <AlertTriangle size={10} className="text-red-400 ml-1 inline" />}
                        </span>
                      ) : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="p-4">
                      <button onClick={() => cycleStatus(task)} className={`px-2 py-1 rounded text-xs font-bold border transition hover:opacity-80 ${
                        task.status === 'done' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        task.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-slate-700/50 text-slate-400 border-slate-600'
                      }`}>
                        {(task.status || 'todo').replace('_', ' ')}
                      </button>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <button onClick={() => deleteTask(task.id)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <Inbox size={32} className="text-slate-700 mb-3" />
              <p className="text-slate-500 text-sm">No tasks yet</p>
              <button onClick={() => setShowModal(true)} className="text-xs text-blue-400 mt-2 hover:text-blue-300 font-bold">Create your first task</button>
            </div>
          )}
        </div>
      )}

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-[#131b2e] border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">New Task</h3>
                <p className="text-[10px] text-slate-600 font-mono mt-0.5">Create a task to track</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Task Name</label>
                <input
                  type="text" placeholder="What needs to be done?" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-[#0f1524] border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition"
                  required autoFocus maxLength={200}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Description</label>
                <textarea
                  placeholder="Optional details..." value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-[#0f1524] border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 resize-none h-20 transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full bg-[#0f1524] border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 cursor-pointer">
                    {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Deadline</label>
                  <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })}
                    className="w-full bg-[#0f1524] border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-blue-500" />
                </div>
              </div>
              <button type="submit" disabled={saving || !form.title.trim()}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-500 transition mt-2 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Task <ArrowRight size={16} /></>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function TaskCard({ task, onStatusChange, onDelete }) {
  const dl = task.deadline || task.due_date
  const isOverdue = dl && new Date(dl) < new Date() && task.status !== 'done'
  return (
    <div className="p-4 rounded-xl border shadow-sm transition-all duration-200 relative group bg-[#1e293b] border-slate-700/50 hover:border-blue-500/50 cursor-pointer">
      <div className="flex justify-between items-start mb-3">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${priorityStyles[task.priority] || priorityStyles.normal}`}>
          {task.priority || 'normal'}
        </span>
        <button onClick={() => onDelete(task.id)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <Trash2 size={14} />
        </button>
      </div>
      <p className="text-sm font-bold text-slate-200 mb-3 pr-6 leading-relaxed">{task.title || task.name}</p>
      {task.description && <p className="text-[10px] text-slate-500 mb-3 line-clamp-2">{task.description}</p>}
      <div className="flex justify-between items-center pt-3 border-t border-slate-700/50">
        {dl ? (
          <span className={`flex items-center gap-1 text-[10px] font-mono ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
            {new Date(dl).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {isOverdue && <AlertTriangle size={10} className="text-red-400" />}
          </span>
        ) : <span className="text-[10px] text-slate-600">No deadline</span>}
        <button onClick={() => onStatusChange(task)}
          className="absolute top-1/2 right-3 -translate-y-1/2 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-blue-600 opacity-0 group-hover:opacity-100 transition-all shadow-lg border border-slate-700">
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  )
}
