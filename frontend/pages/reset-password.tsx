import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authAPI } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { ErrorMessage, FormField, SubmitButton, SuccessMessage } from '@/components/auth/AuthFormComponents'

// Form validation schema
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const { token } = router.query
  
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
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })
  
  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true)
    setError(null)
    
    if (!token || typeof token !== 'string') {
      setError('Invalid or expired reset token')
      setIsLoading(false)
      return
    }
    
    try {
      await authAPI.resetPassword(token, data.password)
      setIsSubmitted(true)
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to reset password. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }
  
  if (!isMounted) {
    return null // Prevent hydration mismatch
  }
  
  if (!token) {
    return (
      <AuthLayout title="Invalid Reset Link">
        <div className="text-center">
          <p className="mt-2 text-sm text-gray-600">
            This password reset link is invalid or has expired.
          </p>
          <div className="mt-6">
            <Link 
              href="/forgot-password" 
              className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors duration-200 hover:underline"
            >
              Request a new reset link
            </Link>
          </div>
        </div>
      </AuthLayout>
    )
  }
  
  return (
    <AuthLayout title="Set new password">
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <ErrorMessage error={error} />
              
              <FormField
                label="New Password"
                id="password"
                type="password"
                autoComplete="new-password"
                error={errors.password}
                register={register}
              />

              <FormField
                label="Confirm Password"
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                error={errors.confirmPassword}
                register={register}
              />

              <SubmitButton
                isLoading={isLoading}
                text="Reset Password"
                loadingText="Resetting..."
              />
            </form>
          </motion.div>
        ) : (
          <SuccessMessage
            title="Password Reset Successful"
            message="Your password has been reset successfully. You can now log in with your new password."
          />
        )}
      </AnimatePresence>
    </AuthLayout>
  )
} 