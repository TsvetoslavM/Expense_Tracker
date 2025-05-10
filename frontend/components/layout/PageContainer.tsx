import React from 'react'

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

/**
 * PageContainer component provides consistent, responsive spacing
 * for page content with flexible padding based on viewport size
 */
export default function PageContainer({ 
  children, 
  className = '', 
  fullWidth = false 
}: PageContainerProps) {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className={`${fullWidth ? 'w-full' : 'max-w-7xl mx-auto'} px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8`}>
        {children}
      </div>
    </div>
  )
} 