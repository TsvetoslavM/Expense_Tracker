import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Redirect to dashboard if already authenticated
        router.replace('/dashboard')
      } else {
        // Redirect to login page if not authenticated
        router.replace('/login')
      }
    }
  }, [isAuthenticated, isLoading, router])
  
  // Loading state while checking authentication
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  )
} 