import { createContext, useContext, useState, useEffect } from 'react'

const API_URL = 'http://localhost:3000'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null
  })

  // Verifica il token al caricamento
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      verifyToken()
    } else {
      setAuth(prev => ({ ...prev, loading: false }))
    }
  }, [])

  const verifyToken = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Token non valido')
      }

      const data = await response.json()
      setAuth({
        isAuthenticated: true,
        user: data.data,
        loading: false,
        error: null
      })
    } catch {
      localStorage.removeItem('token')
      setAuth({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
      })
    }
  }

  const login = async (credentials) => {
    try {
      setAuth(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Errore durante il login')
      }

      const data = await response.json()
      const { token, ...userData } = data.data
      
      localStorage.setItem('token', token)
      setAuth({
        isAuthenticated: true,
        user: userData,
        loading: false,
        error: null
      })
      
      return userData.redirectTo || '/'
    } catch (error) {
      setAuth(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Errore durante il login'
      }))
      throw error
    }
  }

  const register = async (userData) => {
    try {
      setAuth(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Errore durante la registrazione')
      }

      const data = await response.json()
      const { token, ...user } = data.data
      
      localStorage.setItem('token', token)
      setAuth({
        isAuthenticated: true,
        user,
        loading: false,
        error: null
      })
      
      return user.redirectTo || '/'
    } catch (error) {
      setAuth(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Errore durante la registrazione'
      }))
      throw error
    }
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }
    } catch {
      console.error('Errore durante il logout')
    } finally {
      localStorage.removeItem('token')
      setAuth({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
      })
    }
  }

  const value = {
    ...auth,
    login,
    register,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve essere usato all\'interno di un AuthProvider')
  }
  return context
} 