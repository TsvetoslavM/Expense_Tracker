import { motion, AnimatePresence } from 'framer-motion'
import { FieldError, UseFormRegister } from 'react-hook-form'
import { fadeInUp } from './AuthAnimations'
import React from 'react'

interface AuthFormFieldProps {
  label: string
  id: string
  type?: string
  autoComplete?: string
  error?: FieldError
  register: UseFormRegister<any> // Use UseFormRegister type for better type safety
  required?: boolean
}

export function AuthFormField({
  label,
  id,
  type = 'text',
  autoComplete,
  error,
  register,
  required = false,
}: AuthFormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="mt-1">
        <motion.div
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <input
            id={id}
            type={type}
            autoComplete={autoComplete}
            className={
              `block w-full appearance-none rounded-xl border px-4 py-3 placeholder-gray-400 shadow-sm focus:outline-none transition-all duration-200 sm:text-sm bg-white/50 backdrop-blur-sm ` +
              (error ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20')
            }
            {...register(id)}
          />
        </motion.div>
        <AnimatePresence>
          {error && (
            <motion.p
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              className="mt-1 text-sm text-red-600"
            >
              {error.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 