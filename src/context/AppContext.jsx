import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'
import { useAuth } from './AuthContext'

const AppContext = createContext({})

export const useApp = () => useContext(AppContext)

// localStorage helpers
function loadLocal(key) {
  try { return JSON.parse(localStorage.getItem(`paotabs_${key}`)) || [] } catch { return [] }
}
function saveLocal(key, data) {
  localStorage.setItem(`paotabs_${key}`, JSON.stringify(data))
}
function genId() {
  return 'local_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
}

export function AppProvider({ children }) {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [assessments, setAssessments] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [dbAvailable, setDbAvailable] = useState(true)

  const fetchTasks = useCallback(async () => {
    if (!user) return
    const { data, error } = await api.get('/tasks')
    if (data && Array.isArray(data) && data.length > 0) {
      setTasks(data)
      saveLocal('tasks', data)
      setDbAvailable(true)
    } else if (error) {
      setTasks(loadLocal('tasks'))
      setDbAvailable(false)
    } else {
      // Empty array from server — check if we have local data
      const local = loadLocal('tasks')
      setTasks(local.length > 0 ? local : data || [])
    }
  }, [user])

  const fetchAssessments = useCallback(async () => {
    if (!user) return
    const { data, error } = await api.get('/assessments')
    if (data && Array.isArray(data) && data.length > 0) {
      setAssessments(data)
      saveLocal('assessments', data)
      setDbAvailable(true)
    } else if (error) {
      setAssessments(loadLocal('assessments'))
      setDbAvailable(false)
    } else {
      const local = loadLocal('assessments')
      setAssessments(local.length > 0 ? local : data || [])
    }
  }, [user])

  const fetchEvents = useCallback(async () => {
    if (!user) return
    const { data, error } = await api.get('/events')
    if (data && Array.isArray(data) && data.length > 0) {
      setEvents(data)
      saveLocal('events', data)
      setDbAvailable(true)
    } else if (error) {
      setEvents(loadLocal('events'))
      setDbAvailable(false)
    } else {
      const local = loadLocal('events')
      setEvents(local.length > 0 ? local : data || [])
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchTasks()
      fetchAssessments()
      fetchEvents()
    } else {
      setTasks([])
      setAssessments([])
      setEvents([])
    }
  }, [user, fetchTasks, fetchAssessments, fetchEvents])

  const addTask = async (task) => {
    const { data, error } = await api.post('/tasks', task)
    if (data) {
      setTasks(prev => { const next = [data, ...prev]; saveLocal('tasks', next); return next })
      return { data, error: null }
    }
    // Fallback: save locally
    const localTask = { ...task, id: genId(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    setTasks(prev => { const next = [localTask, ...prev]; saveLocal('tasks', next); return next })
    return { data: localTask, error: null }
  }

  const updateTask = async (id, updates) => {
    const { data, error } = await api.put(`/tasks/${id}`, updates)
    if (data) {
      setTasks(prev => { const next = prev.map(t => t.id === id ? data : t); saveLocal('tasks', next); return next })
      return { data, error: null }
    }
    // Fallback: update locally
    const updated = { ...updates, id, updated_at: new Date().toISOString() }
    setTasks(prev => {
      const next = prev.map(t => t.id === id ? { ...t, ...updated } : t)
      saveLocal('tasks', next)
      return next
    })
    return { data: updated, error: null }
  }

  const deleteTask = async (id) => {
    const { error } = await api.delete(`/tasks/${id}`)
    setTasks(prev => { const next = prev.filter(t => t.id !== id); saveLocal('tasks', next); return next })
    return { error: null }
  }

  const addAssessment = async (assessment) => {
    const { data, error } = await api.post('/assessments', assessment)
    if (data) {
      setAssessments(prev => { const next = [data, ...prev]; saveLocal('assessments', next); return next })
      return { data, error: null }
    }
    // Fallback: save locally
    const localDoc = { ...assessment, id: genId(), created_at: new Date().toISOString() }
    setAssessments(prev => { const next = [localDoc, ...prev]; saveLocal('assessments', next); return next })
    return { data: localDoc, error: null }
  }

  const addEvent = async (event) => {
    const { data, error } = await api.post('/events', event)
    if (data) {
      setEvents(prev => { const next = [...prev, data].sort((a, b) => new Date(a.event_date) - new Date(b.event_date)); saveLocal('events', next); return next })
      return { data, error: null }
    }
    const localDoc = { ...event, id: genId(), created_at: new Date().toISOString() }
    setEvents(prev => { const next = [...prev, localDoc].sort((a, b) => new Date(a.event_date) - new Date(b.event_date)); saveLocal('events', next); return next })
    return { data: localDoc, error: null }
  }

  const deleteEvent = async (id) => {
    await api.delete(`/events/${id}`)
    setEvents(prev => { const next = prev.filter(e => e.id !== id); saveLocal('events', next); return next })
    return { error: null }
  }

  return (
    <AppContext.Provider value={{
      tasks, assessments, events, loading, dbAvailable,
      addTask, updateTask, deleteTask,
      addAssessment,
      addEvent, deleteEvent,
      fetchTasks, fetchAssessments, fetchEvents
    }}>
      {children}
    </AppContext.Provider>
  )
}
