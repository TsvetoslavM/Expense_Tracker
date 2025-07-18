import { useState } from 'react'
import Link from 'next/link'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { loginBlobAnimations, fadeInDown, scaleIn, fadeInUp } from '@/components/auth/AuthAnimations'
import { AuthFormField } from '@/components/auth/AuthFormField'

// Form validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'test@example.com',
      password: 'password123',
    }
  })
  
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setError(null)
    setDebugInfo(null)
    
    console.log('Login attempt:', { email: data.email })
    
    try {
      const response = await login(data.email, data.password)
      console.log('Login successful:', response)
    } catch (err: any) {
      console.error('Login error:', err)
      
      // Collect debug information
      const debugData = {
        message: err.message,
        response: {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data
        },
        request: {
          url: err.config?.url,
          method: err.config?.method,
          baseURL: err.config?.baseURL,
          headers: err.config?.headers
        }
      }
      
      setDebugInfo(debugData)
      
      // Set user-friendly error message
      const errorMessage = err.response?.data?.detail || 
        err.response?.statusText || 
        'Failed to login. Please check your credentials.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <motion.div
          className={loginBlobAnimations.topRight.className}
          animate={loginBlobAnimations.topRight.animate}
          transition={loginBlobAnimations.topRight.transition}
        />
        <motion.div
          className={loginBlobAnimations.bottomLeft.className}
          animate={loginBlobAnimations.bottomLeft.animate}
          transition={loginBlobAnimations.bottomLeft.transition}
        />
      </div>
      <motion.div 
        variants={fadeInDown}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.5 }}
        className="relative sm:mx-auto sm:w-full sm:max-w-md"
      >
        <motion.div
          variants={scaleIn}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            Expense Tracker
          </h1>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </motion.div>
      </motion.div>
      <motion.div 
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="backdrop-blur-lg bg-white/80 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/20 hover:border-blue-200/50 transition-all duration-300">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence>
              {error && (
                <motion.div 
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm shadow-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
            
            <AuthFormField
              label="Email address"
              id="email"
              type="email"
              autoComplete="email"
              error={errors.email}
              register={register}
              required
            />

            <AuthFormField
              label="Password"
              id="password"
              type="password"
              autoComplete="current-password"
              error={errors.password}
              register={register}
              required
            />

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link 
                  href="/forgot-password" 
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign in'}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white/80 backdrop-blur-sm px-2 text-gray-500">Or</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link 
                href="/register" 
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200 hover:underline"
              >
                Create a new account
              </Link>
            </div>
          </div>
          
          {/* Debug information */}
          <AnimatePresence>
          {debugInfo && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 p-4 bg-gray-100/80 backdrop-blur-sm rounded-xl"
              >
              <h3 className="text-sm font-medium text-gray-700 mb-2">Debug Information</h3>
              <pre className="text-xs overflow-auto max-h-40">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
              </motion.div>
          )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
} 