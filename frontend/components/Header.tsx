import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import useCurrency from '@/hooks/useCurrency'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Menu, 
  X, 
  ChevronDown, 
  LogOut, 
  User, 
  PieChart,
  Tag 
} from 'lucide-react'

export default function Header() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { preferredCurrency } = useCurrency()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  
  // Main navigation links
  const navigationLinks = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Expenses', href: '/expenses', icon: CreditCard },
    { name: 'Categories', href: '/categories', icon: Tag },
    { name: 'Budgets', href: '/budgets', icon: PieChart },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]
  
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and desktop navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <span className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center mr-2">
                  <CreditCard className="h-4 w-4 text-white" />
                </span>
                <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  Expense Tracker
                </span>
              </Link>
            </div>
            
            {/* Desktop navigation links */}
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              {navigationLinks.map((item) => {
                const isActive = router.pathname === item.href || 
                  (item.href !== '/' && router.pathname.startsWith(item.href))
                
                const Icon = item.icon
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors",
                      isActive
                        ? "border-indigo-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    )}
                  >
                    <Icon className={cn(
                      "mr-1 h-4 w-4",
                      isActive ? "text-indigo-500" : "text-gray-400"
                    )} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          
          {/* Right side actions: notifications, theme toggle, user menu */}
          <div className="flex items-center">
            {user && (
              <>          
                {/* Currency indicator */}
                <div className="ml-2 flex items-center text-sm font-medium text-gray-700 bg-gray-100 rounded-full px-3 py-1">
                  <CreditCard className="h-4 w-4 mr-1 text-gray-500" />
                  {preferredCurrency}
                </div>
                
                {/* User dropdown */}
                <div className="ml-4 relative flex-shrink-0">
                  <div>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                        <span className="font-medium text-sm">
                          {user.first_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="hidden md:flex md:items-center ml-2">
                        <span className="text-sm font-medium text-gray-700">
                          {user.first_name || 'User'}
                        </span>
                        <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
                      </div>
                    </button>
                  </div>
                  
                  {userMenuOpen && (
                    <div 
                      className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu-button"
                    >
                      <Link 
                        href="/settings" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="mr-3 h-4 w-4 text-gray-400" />
                        Your Profile
                      </Link>
                      <Link 
                        href="/settings" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="mr-3 h-4 w-4 text-gray-400" />
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          logout()
                          setUserMenuOpen(false)
                        }}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="mr-3 h-4 w-4 text-gray-400" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden ml-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="pt-2 pb-3 space-y-1">
            {navigationLinks.map((item) => {
              const isActive = router.pathname === item.href || 
                (item.href !== '/' && router.pathname.startsWith(item.href))
              
              const Icon = item.icon
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center pl-3 pr-4 py-2 text-base font-medium border-l-4",
                    isActive
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className={cn(
                    "mr-4 h-5 w-5 flex-shrink-0",
                    isActive ? "text-indigo-500" : "text-gray-400"
                  )} />
                  {item.name}
                </Link>
              )
            })}
          </div>
          
          {user && (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <span className="font-medium text-sm">
                      {user.first_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.email}
                  </div>
                  <div className="text-sm font-medium text-gray-500">{user.email}</div>
                </div>
              </div>
              
              <div className="mt-3 space-y-1">
                <Link
                  href="/settings"
                  className="flex items-center px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="mr-4 h-5 w-5 text-gray-400" />
                  Your Profile
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="mr-4 h-5 w-5 text-gray-400" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    logout()
                    setMobileMenuOpen(false)
                  }}
                  className="flex w-full items-center px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-100"
                >
                  <LogOut className="mr-4 h-5 w-5 text-gray-400" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  )
} 