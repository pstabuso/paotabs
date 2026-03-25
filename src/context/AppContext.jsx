import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'
import { useAuth } from './AuthContext'

const AppContext = createContext({})

export const useApp = () => useContext(AppContext)

export function AppProvider({ children }) {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [assessments, setAssessments] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchTasks = useCallback(async () => {
    if (!user) return
    const { data } = await api.get('/tasks')
    if (data) setTasks(data)
  }, [user])

  const fetchAssessments = useCallback(async () => {
    if (!user) return
    const { data } = await api.get('/assessments')
    if (data) setAssessments(data)
  }, [user])

  const fetchEvents = useCallback(async () => {
    if (!user) return
    const { data } = await api.get('/events')
    if (data) setEvents(data)
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
    if (data) setTasks(prev => [data, ...prev])
    return { data, error }
  }

  const updateTask = async (id, updates) => {
    const { data, error } = await api.put(`/tasks/${id}`, updates)
    if (data) setTasks(prev => prev.map(t => t.id === id ? data : t))
    return { data, error }
  }

  const deleteTask = async (id) => {
    const { data, error } = await api.delete(`/tasks/${id}`)
    if (!error) setTasks(prev => prev.filter(t => t.id !== id))
    return { error }
  }

  const addAssessment = async (assessment) => {
    const { data, error } = await api.post('/assessments', assessment)
    if (data) setAssessments(prev => [data, ...prev])
    return { data, error }
  }

  const addEvent = async (event) => {
    const { data, error } = await api.post('/events', event)
    if (data) setEvents(prev => [...prev, data].sort((a, b) => new Date(a.event_date) - new Date(b.event_date)))
    return { data, error }
  }

  const deleteEvent = async (id) => {
    const { data, error } = await api.delete(`/events/${id}`)
    if (!error) setEvents(prev => prev.filter(e => e.id !== id))
    return { error }
  }

  return (
    <AppContext.Provider value={{
      tasks, assessments, events, loading,
      addTask, updateTask, deleteTask,
      addAssessment,
      addEvent, deleteEvent,
      fetchTasks, fetchAssessments, fetchEvents
    }}>
      {children}
    </AppContext.Provider>
  )
}
