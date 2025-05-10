import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string
  icon: ReactNode
  change?: {
    value: string
    positive: boolean
  }
  trend?: number[] // Optional array of values for the trend line
  className?: string
}

export function StatCard({ title, value, icon, change, trend, className = '' }: StatCardProps) {
  // Generate the spark line points if trend data is provided
  const generateSparkline = () => {
    if (!trend || trend.length < 2) return null;
    
    // Find min and max values for scaling
    const min = Math.min(...trend);
    const max = Math.max(...trend);
    const range = max - min || 1; // Avoid division by zero
    
    // Calculate width between points
    const width = 100 / (trend.length - 1);
    
    // Generate the points for the polyline
    const points = trend.map((value, index) => {
      const x = index * width;
      // Normalize to 0-100 range and invert (0 is at the bottom)
      const y = 100 - ((value - min) / range * 100);
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <svg className="h-8 w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={change?.positive ? "rgba(52, 211, 153, 0.8)" : "rgba(248, 113, 113, 0.8)"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };
  
  return (
    <div className={`rounded-xl bg-white shadow-sm border border-gray-100 p-6 ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className="mr-3 p-2 rounded-lg bg-indigo-50 text-indigo-600">
            {icon}
          </div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        </div>
        
        {change && (
          <span 
            className={`text-xs font-medium rounded-full px-2 py-1 ${
              change.positive 
                ? 'bg-green-50 text-green-600' 
                : 'bg-red-50 text-red-600'
            }`}
          >
            {change.positive ? '↑' : '↓'} {change.value}
          </span>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {trend && trend.length > 0 && (
          <div className="w-24 h-8">
            {generateSparkline()}
          </div>
        )}
      </div>
    </div>
  )
}

// Add default export for the component
export default StatCard 