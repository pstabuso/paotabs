import { createContext, useContext, useEffect, useState } from 'react'
import { api, setToken } from '../lib/api'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('paotabs_token')
    if (!token) {
      setLoading(false)
      return
    }
    api.get('/auth/me').then(({ data, error }) => {
      if (data?.user) {
        setUser(data.user)
      } else {
        setToken(null)
      }
      setLoading(false)
    }).catch(() => {
      setToken(null)
      setLoading(false)
    })
  }, [])

  const signUp = async (email, password, fullName) => {
    try {
      const { data, error } = await api.post('/auth/signup', { email, password, fullName })
      if (data?.token) {
        setToken(data.token)
        setUser(data.user)
      }
      return { data, error }
    } catch {
      return { data: null, error: { message: 'Unable to create account. Please try again.' } }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await api.post('/auth/signin', { email, password })
      if (data?.token) {
        setToken(data.token)
        setUser(data.user)
      }
      return { data, error }
    } catch {
      return { data: null, error: { message: 'Unable to sign in. Please try again.' } }
    }
  }

  const signOut = async () => {
    setToken(null)
    setUser(null)
    return { error: null }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
