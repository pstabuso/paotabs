import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
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
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setTasks(data)
  }, [user])

  const fetchAssessments = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('stress_assessments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setAssessments(data)
  }, [user])

  const fetchEvents = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .order('event_date', { ascending: true })
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
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ ...task, user_id: user.id }])
      .select()
    if (data) setTasks(prev => [data[0], ...prev])
    return { data, error }
  }

  const updateTask = async (id, updates) => {
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
    if (data) setTasks(prev => prev.map(t => t.id === id ? data[0] : t))
    return { data, error }
  }

  const deleteTask = async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (!error) setTasks(prev => prev.filter(t => t.id !== id))
    return { error }
  }

  const addAssessment = async (assessment) => {
    const { data, error } = await supabase
      .from('stress_assessments')
      .insert([{ ...assessment, user_id: user.id }])
      .select()
    if (data) setAssessments(prev => [data[0], ...prev])
    return { data, error }
  }

  const addEvent = async (event) => {
    const { data, error } = await supabase
      .from('events')
      .insert([{ ...event, user_id: user.id }])
      .select()
    if (data) setEvents(prev => [...prev, data[0]].sort((a, b) => new Date(a.event_date) - new Date(b.event_date)))
    return { data, error }
  }

  const deleteEvent = async (id) => {
    const { error } = await supabase.from('events').delete().eq('id', id)
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
