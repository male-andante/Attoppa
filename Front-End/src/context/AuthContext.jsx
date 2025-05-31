import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

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
      verifyToken(token)
    } else {
      setAuth(prev => ({ ...prev, loading: false }))
    }
  }, [])

  const verifyToken = async (token) => {
    try {
      const response = await axios.get('http://localhost:3000/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAuth({
        isAuthenticated: true,
        user: response.data.data,
        loading: false,
        error: null
      })
    } catch (error) {
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
      const response = await axios.post('http://localhost:3000/auth/login', credentials)
      const { token, ...userData } = response.data.data
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
        error: error.response?.data?.message || 'Errore durante il login'
      }))
      throw error
    }
  }

  const register = async (userData) => {
    try {
      setAuth(prev => ({ ...prev, loading: true, error: null }))
      const response = await axios.post('http://localhost:3000/auth/register', userData)
      const { token, ...user } = response.data.data
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
        error: error.response?.data?.message || 'Errore durante la registrazione'
      }))
      throw error
    }
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        await axios.post('http://localhost:3000/auth/logout', null, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
    } catch (error) {
      console.error('Errore durante il logout:', error)
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