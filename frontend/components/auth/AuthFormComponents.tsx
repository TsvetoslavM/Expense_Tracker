import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { FieldError } from 'react-hook-form'

interface ErrorMessageProps {
  error: string | null
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm shadow-sm"
        >
          {error}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface FormFieldProps {
  label: string
  id: string
  type?: string
  autoComplete?: string
  error?: FieldError
  register: any
}

export function FormField({ label, id, type = 'text', autoComplete, error, register }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
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
            className="block w-full appearance-none rounded-xl border border-gray-300 px-4 py-3 placeholder-gray-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 sm:text-sm bg-white/50 backdrop-blur-sm"
            {...register(id)}
          />
        </motion.div>
        <AnimatePresence>
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
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

interface SubmitButtonProps {
  isLoading: boolean
  text: string
  loadingText?: string
}

export function SubmitButton({ isLoading, text, loadingText = 'Loading...' }: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {loadingText}
        </span>
      ) : text}
    </Button>
  )
}

interface SuccessMessageProps {
  title: string
  message: string
}

export function SuccessMessage({ title, message }: SuccessMessageProps) {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.2
        }}
        className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-4"
      >
        <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-lg font-medium text-gray-900"
      >
        {title}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-2 text-sm text-gray-600"
      >
        {message}
      </motion.p>
    </motion.div>
  )
} 