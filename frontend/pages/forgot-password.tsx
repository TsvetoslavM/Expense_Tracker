import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authAPI } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { ErrorMessage, FormField, SubmitButton, SuccessMessage } from '@/components/auth/AuthFormComponents'

// Form validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  })
  
  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await authAPI.requestPasswordReset(data.email)
      setIsSubmitted(true)
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to submit request. Please try again.'
      if (errorMessage.includes('Email service is not configured')) {
        setError('Password reset is currently unavailable. Please contact support for assistance.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!isMounted) {
    return null // Prevent hydration mismatch
  }
  
  return (
    <AuthLayout title="Reset your password">
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm text-gray-600 mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <ErrorMessage error={error} />
              
              <FormField
                label="Email address"
                id="email"
                type="email"
                autoComplete="email"
                error={errors.email}
                register={register}
              />

              <SubmitButton
                isLoading={isLoading}
                text="Send reset link"
                loadingText="Submitting..."
              />
            </form>
          </motion.div>
        ) : (
          <SuccessMessage
            title="Check your email"
            message="We've sent a password reset link to your email address."
          />
        )}
      </AnimatePresence>
    </AuthLayout>
  )
} 