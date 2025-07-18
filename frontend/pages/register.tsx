import { useState } from 'react'
import Link from 'next/link'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { registerBlobAnimations, fadeInDown, scaleIn, fadeInUp } from '@/components/auth/AuthAnimations'
import { AuthFormField } from '@/components/auth/AuthFormField'

// Form validation schema
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  preferredCurrency: z.string().default('USD'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>

// Available currency options
const currencyOptions = [
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'JPY', label: 'Japanese Yen (JPY)' },
  { value: 'CAD', label: 'Canadian Dollar (CAD)' },
  { value: 'AUD', label: 'Australian Dollar (AUD)' },
  { value: 'CNY', label: 'Chinese Yuan (CNY)' },
  { value: 'INR', label: 'Indian Rupee (INR)' },
];

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      preferredCurrency: 'USD',
    }
  })
  
  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        first_name: data.firstName || undefined,
        last_name: data.lastName || undefined,
        preferred_currency: data.preferredCurrency,
      })
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to register. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <motion.div
          className={registerBlobAnimations.topRight.className}
          animate={registerBlobAnimations.topRight.animate}
          transition={registerBlobAnimations.topRight.transition}
        />
        <motion.div
          className={registerBlobAnimations.bottomLeft.className}
          animate={registerBlobAnimations.bottomLeft.animate}
          transition={registerBlobAnimations.bottomLeft.transition}
        />
        <motion.div
          className={registerBlobAnimations.center.className}
          animate={registerBlobAnimations.center.animate}
          transition={registerBlobAnimations.center.transition}
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
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600">
            Expense Tracker
          </h1>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">
            Create your account
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
        <div className="backdrop-blur-lg bg-white/80 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/20 hover:border-purple-200/50 transition-all duration-300">
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

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <AuthFormField
                label="First name"
                id="firstName"
                type="text"
                autoComplete="given-name"
                error={errors.firstName}
                register={register}
              />

              <AuthFormField
                label="Last name"
                id="lastName"
                type="text"
                autoComplete="family-name"
                error={errors.lastName}
                register={register}
              />
            </div>

            <AuthFormField
              label="Password"
              id="password"
              type="password"
              autoComplete="new-password"
              error={errors.password}
              register={register}
              required
            />

            <AuthFormField
              label="Confirm Password"
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword}
              register={register}
              required
            />

            <div>
              <label htmlFor="preferredCurrency" className="block text-sm font-medium text-gray-700">
                Preferred Currency
              </label>
              <div className="mt-1">
                <motion.div
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <select
                    id="preferredCurrency"
                    className="block w-full appearance-none rounded-xl border border-gray-300 px-4 py-3 placeholder-gray-400 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 sm:text-sm bg-white/50 backdrop-blur-sm"
                    {...register('preferredCurrency')}
                  >
                    {currencyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </motion.div>
                <AnimatePresence>
                  {errors.preferredCurrency && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-1 text-sm text-red-600"
                    >
                      {errors.preferredCurrency.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : 'Create Account'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 