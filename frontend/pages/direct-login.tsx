import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function DirectLoginPage() {
  const router = useRouter()
  const [status, setStatus] = useState<string>('Idle')
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState<any>(null)

  const handleDirectLogin = async () => {
    try {
      setStatus('Logging in...')
      setError(null)
      
      // Clear previous auth data
      localStorage.removeItem('accessToken')
      localStorage.removeItem('userData')
      
      // Log request details
      console.log('Sending direct login request')
      
      // Use fetch instead of axios for a more direct approach
      const response = await fetch('http://localhost:8000/api/auth/login/json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      })
      
      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)
      
      // Parse the response
      const data = await response.json()
      console.log('Response data:', data)
      
      if (response.ok && data.access_token) {
        setStatus('Login successful!')
        setToken(data.access_token)
        
        // Save token to localStorage
        localStorage.setItem('accessToken', data.access_token)
        
        // Now fetch user data
        await fetchUserData(data.access_token)
      } else {
        setStatus('Login failed')
        setError(data.detail || 'Unknown error')
      }
    } catch (err: any) {
      setStatus('Error')
      setError(err.message || 'An error occurred')
      console.error('Direct login error:', err)
    }
  }
  
  const fetchUserData = async (accessToken: string) => {
    try {
      setStatus('Fetching user data...')
      
      // Fetch user data with token
      const response = await fetch('http://localhost:8000/api/users/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUserData(userData)
        setStatus('User data retrieved!')
        
        // Save user data
        localStorage.setItem('userData', JSON.stringify(userData))
      } else {
        setStatus('Failed to get user data')
        setError(`User data fetch failed with status: ${response.status}`)
      }
    } catch (err: any) {
      setStatus('Error fetching user data')
      setError(err.message || 'An error occurred while fetching user data')
    }
  }
  
  const goToDashboard = () => {
    router.push('/dashboard')
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Direct Login Debug</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-md">
            <p className="font-medium">Status: {status}</p>
          </div>
          
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}
          
          {token && (
            <div className="p-4 bg-green-50 rounded-md">
              <p className="font-medium">Token received:</p>
              <p className="text-xs overflow-auto break-all">{token}</p>
            </div>
          )}
          
          {userData && (
            <div className="p-4 bg-green-50 rounded-md">
              <p className="font-medium">User data:</p>
              <pre className="text-xs overflow-auto max-h-40">
                {JSON.stringify(userData, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="flex space-x-4">
            <button
              onClick={handleDirectLogin}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
            >
              Try Direct Login
            </button>
            
            {userData && (
              <button
                onClick={goToDashboard}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded"
              >
                Go to Dashboard
              </button>
            )}
          </div>
          
          <div className="text-center mt-6">
            <Link 
              href="/login"
              className="text-blue-500 hover:text-blue-600"
            >
              Back to regular login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 