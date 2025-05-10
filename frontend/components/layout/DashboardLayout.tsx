import { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  Calendar, 
  Settings, 
  LogOut, 
  BarChart 
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

// Navigation items configuration
const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: <TrendingUp className="mr-3 flex-shrink-0 h-6 w-6" />,
  },
  {
    name: 'Expenses',
    href: '/expenses',
    icon: <DollarSign className="mr-3 flex-shrink-0 h-6 w-6" />,
  },
  {
    name: 'Categories',
    href: '/categories',
    icon: <CreditCard className="mr-3 flex-shrink-0 h-6 w-6" />,
  },
  {
    name: 'Budgets',
    href: '/budgets',
    icon: <Calendar className="mr-3 flex-shrink-0 h-6 w-6" />,
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: <BarChart className="mr-3 flex-shrink-0 h-6 w-6" />,
  },
]

// TypeScript interfaces
interface NavigationItem {
  name: string
  href: string
  icon: ReactNode
  adminOnly?: boolean
}

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const { user, logout } = useAuth()
  
  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 bg-gray-900 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-semibold text-white">Expense Tracker</h1>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md
                    ${
                      router.pathname.startsWith(item.href)
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <span className={router.pathname.startsWith(item.href) ? 'text-gray-300' : 'text-gray-400'}>
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-800 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-600">
                    <span className="text-sm font-medium leading-none text-white">
                      {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">
                    {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.email}
                  </p>
                  <div className="flex space-x-4 mt-1">
                    <Link 
                      href="/settings" 
                      className="text-xs font-medium text-gray-300 hover:text-gray-200 flex items-center"
                    >
                      <Settings className="h-3 w-3 mr-1" /> 
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-xs font-medium text-gray-300 hover:text-gray-200 flex items-center"
                    >
                      <LogOut className="h-3 w-3 mr-1" /> 
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-gray-900 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold text-white">Expense Tracker</h1>
          {/* Mobile menu button - would be implemented with a proper mobile menu */}
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1 pt-16 md:pt-0">
          {children}
        </main>
      </div>
    </div>
  )
} 