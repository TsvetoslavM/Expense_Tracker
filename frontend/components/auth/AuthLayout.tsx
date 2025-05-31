import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { backgroundBlobAnimations, fadeInDown, scaleIn } from './AuthAnimations'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <motion.div
          className={backgroundBlobAnimations.topRight.className}
          animate={backgroundBlobAnimations.topRight.animate}
          transition={backgroundBlobAnimations.topRight.transition}
        />
        <motion.div
          className={backgroundBlobAnimations.bottomLeft.className}
          animate={backgroundBlobAnimations.bottomLeft.animate}
          transition={backgroundBlobAnimations.bottomLeft.transition}
        />
        <motion.div
          className={backgroundBlobAnimations.center.className}
          animate={backgroundBlobAnimations.center.animate}
          transition={backgroundBlobAnimations.center.transition}
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
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
            Expense Tracker
          </h1>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
          )}
        </motion.div>
      </motion.div>

      <motion.div 
        variants={fadeInDown}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="backdrop-blur-lg bg-white/80 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/20 hover:border-emerald-200/50 transition-all duration-300">
          {children}
        </div>
      </motion.div>
    </div>
  )
} 