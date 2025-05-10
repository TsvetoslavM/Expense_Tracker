import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/router'
import jwtDecode from 'jwt-decode'
import { authAPI, userAPI } from '@/lib/api'

interface User {
  id: number
  email: string
  first_name: string | null
  last_name: string | null
  is_active: boolean
  is_admin: boolean
  preferred_currency: string
  created_at: string
  updated_at: string
  last_login: string | null
}

interface JwtPayload {
  exp: number
  sub: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: {
    email: string
    password: string
    first_name?: string
    last_name?: string
    preferred_currency?: string
  }) => Promise<void>
  logout: () => void
  updateUserData: (userData: User) => void
}

// Create a default context
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateUserData: () => {}
})

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Provider component for the auth context
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user

  useEffect(() => {
    // Check if we have a token in localStorage
    const token = localStorage.getItem('accessToken')
    if (!token) {
      setIsLoading(false)
      return
    }

    // Check if token is expired
    try {
      const decoded = jwtDecode<JwtPayload>(token)
      const currentTime = Date.now() / 1000
      
      if (decoded.exp < currentTime) {
        // Token is expired
        localStorage.removeItem('accessToken')
        localStorage.removeItem('userData') // Also clear user data
        setUser(null)
        setIsLoading(false)
        return
      }

      // Check if we have cached user data
      const cachedUserData = localStorage.getItem('userData')
      if (cachedUserData) {
        try {
          // Use cached data while we fetch the latest
          setUser(JSON.parse(cachedUserData))
        } catch (e) {
          console.error("Error parsing cached user data:", e)
        }
      }

      // Token is valid, load user data
      fetchUserData()
    } catch (error) {
      // Invalid token
      localStorage.removeItem('accessToken')
      localStorage.removeItem('userData')
      setUser(null)
      setIsLoading(false)
    }
  }, [])

  const fetchUserData = async () => {
    try {
      const userData = await userAPI.getCurrentUser()
      setUser(userData)
      
      // Cache user data in localStorage
      localStorage.setItem('userData', JSON.stringify(userData))
    } catch (error) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('userData')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      console.log(`Attempting to login with email: ${email}`)
      
      // Clear any previous auth data
      localStorage.removeItem('accessToken')
      localStorage.removeItem('userData')
      
      // Log the API request we're about to make
      console.log('Sending login request to:', '/api/auth/login/json')
      console.log('With payload:', { email, password: '********' })
      
      const response = await authAPI.login(email, password)
      console.log('Login response received:', response)
      
      if (response && response.access_token) {
        console.log('Valid token received, length:', response.access_token.length)
        localStorage.setItem('accessToken', response.access_token)
        console.log('Access token saved to localStorage')
        
        // Fetch user data with the new token
        await fetchUserData()
        
        // Navigate to dashboard
        console.log('Navigating to dashboard')
        router.push('/dashboard')
        return response
      } else {
        console.error('Invalid login response format:', response)
        throw new Error('Invalid login response format')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : 'No response',
        request: error.request ? 'Request sent but no response received' : 'Request not sent'
      })
      
      localStorage.removeItem('accessToken')
      localStorage.removeItem('userData')
      setUser(null)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: {
    email: string
    password: string
    first_name?: string
    last_name?: string
    preferred_currency?: string
  }) => {
    setIsLoading(true)
    try {
      await authAPI.register(userData)
      // Auto-login after registration
      await login(userData.email, userData.password)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('userData')
    setUser(null)
    router.push('/login')
  }
  
  // New function to update user data
  const updateUserData = (userData: User) => {
    setUser(userData)
  }

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUserData
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext 