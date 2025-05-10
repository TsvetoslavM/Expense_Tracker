import React from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  description?: string | React.ReactNode
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  onClick?: () => void
  loading?: boolean
  className?: string
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  onClick,
  loading = false,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all hover:shadow-md",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          {icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <div className="text-blue-600">{icon}</div>
            </div>
          )}
        </div>
        
        {loading ? (
          <>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-32" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {value}
            </div>
            {description && (
              <div className="text-xs text-gray-500">{description}</div>
            )}
          </>
        )}
        
        {onClick && (
          <div className="absolute bottom-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </div>
    </Card>
  )
}

export default StatCard 