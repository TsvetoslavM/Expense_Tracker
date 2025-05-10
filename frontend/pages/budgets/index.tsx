import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { budgetAPI, categoryAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { useCurrency } from '@/hooks/useCurrency'
import {
  AlertCircle,
  CreditCard,
  Wallet,
  Edit,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Filter,
  ChevronDown,
  PieChart,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  PlusCircle,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/StatCard'
import { Skeleton } from '@/components/ui/skeleton'
import PageContainer from '@/components/layout/PageContainer'

// Define interfaces
interface Budget {
  id: number;
  amount: number;
  year: number;
  month: number | null;
  period: string;
  currency: string;
  category_id: number;
  user_id: number;
}

interface Category {
  id: number;
  name: string;
  color: string;
  description?: string;
}

interface BudgetWithStats {
  id: number;
  amount: number;
  year: number;
  month: number | null;
  period: string;
  currency: string;
  category_id: number;
  category_name: string;
  category_color: string;
  spent_amount: number;
  remaining_amount: number;
  percentage_used: number;
}

export default function BudgetsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { formatAmount } = useCurrency()
  
  // State for budgets and categories
  const [budgets, setBudgets] = useState<BudgetWithStats[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // State for date filtering
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [showDateFilter, setShowDateFilter] = useState(false)
  
  // Function to go to previous month
  const goToPreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
  }
  
  // Function to go to next month
  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
  }
  
  // Get current month name
  const getMonthName = (month: number) => {
    return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' })
  }
  
  // Calculate budget summary stats
  const calculateSummaryStats = () => {
    if (!budgets.length) return {
      totalBudget: 0,
      totalSpent: 0,
      totalRemaining: 0,
      overBudgetCount: 0,
      nearLimitCount: 0
    }
    
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0)
    const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent_amount, 0)
    const totalRemaining = totalBudget - totalSpent
    const overBudgetCount = budgets.filter(b => b.percentage_used > 100).length
    const nearLimitCount = budgets.filter(b => b.percentage_used >= 85 && b.percentage_used <= 100).length
    
    return {
      totalBudget,
      totalSpent,
      totalRemaining,
      overBudgetCount,
      nearLimitCount
    }
  }
  
  // Load budgets and categories
  useEffect(() => {
    // If not authenticated, redirect to login
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    
    if (user) {
      fetchData()
    }
  }, [user, authLoading, selectedYear, selectedMonth])
  
  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch categories
      const fetchedCategories = await categoryAPI.getAllCategories()
      if (Array.isArray(fetchedCategories)) {
        setCategories(fetchedCategories)
      }
      
      // Fetch budgets with stats
      const params = {
        year: selectedYear,
        month: selectedMonth
      }
      
      const budgetStats = await budgetAPI.getBudgetStats(params)
      if (Array.isArray(budgetStats)) {
        setBudgets(budgetStats)
      }
    } catch (err) {
      console.error('Error fetching budgets:', err)
      setError('Failed to load budgets')
    } finally {
      setLoading(false)
    }
  }
  
  const handleDeleteBudget = async (budgetId: number) => {
    if (!confirm('Are you sure you want to delete this budget?')) {
      return
    }
    
    try {
      await budgetAPI.deleteBudget(budgetId)
      // Refresh budgets
      fetchData()
    } catch (err) {
      console.error('Error deleting budget:', err)
      setError('Failed to delete budget')
    }
  }
  
  // Get budget status info - returns color class and icon
  const getBudgetStatus = (percentage: number) => {
    if (percentage >= 100) {
      return {
        colorClass: 'text-red-600 bg-red-50',
        progressClass: 'bg-red-500',
        icon: <TrendingUp className="h-3 w-3 mr-1" />,
        label: 'Over budget'
      }
    } else if (percentage >= 85) {
      return {
        colorClass: 'text-amber-600 bg-amber-50',
        progressClass: 'bg-amber-500',
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
        label: 'Near limit'
      }
    }
    return {
      colorClass: 'text-green-600 bg-green-50',
      progressClass: 'bg-green-500',
      icon: <TrendingDown className="h-3 w-3 mr-1" />,
      label: 'Under budget'
    }
  }
  
  // If auth is loading, show a loading indicator
  if (authLoading) {
    return <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent"></div>
    </div>
  }
  
  // If no user, don't render the page (will redirect)
  if (!user) {
    return null
  }
  
  // Calculate summary stats for the top cards
  const summaryStats = calculateSummaryStats()
  
  return (
    <PageContainer>
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <PieChart className="h-8 w-8 mr-3" />
            Budget Management
          </h1>
          <p className="text-blue-100 max-w-3xl">Track your spending against your budget goals and manage your financial limits by category.</p>
          
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={() => router.push('/budgets/new')}
              className="bg-white text-blue-600 hover:bg-blue-50 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </div>
        </div>
      </div>
      
      {/* Month navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold mr-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-500" />
              {getMonthName(selectedMonth)} {selectedYear}
            </h2>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={goToPreviousMonth}
                className="h-8 w-8 rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={goToNextMonth}
                className="h-8 w-8 rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Budget summary */}
          <div className="flex space-x-4 text-sm">
            <div className="px-3 py-1 bg-gray-100 rounded-full">
              <span className="font-medium text-gray-700">Total Budget: </span>
              <span className="font-semibold text-blue-600">{formatAmount(summaryStats.totalBudget)}</span>
            </div>
            <div className="px-3 py-1 bg-gray-100 rounded-full">
              <span className="font-medium text-gray-700">Spent: </span>
              <span className="font-semibold text-blue-600">{formatAmount(summaryStats.totalSpent)}</span>
            </div>
            <div className={`px-3 py-1 rounded-full ${summaryStats.totalRemaining >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <span className="font-medium text-gray-700">Remaining: </span>
              <span className={`font-semibold ${summaryStats.totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatAmount(summaryStats.totalRemaining)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Budget summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Budget"
          value={formatAmount(summaryStats.totalBudget)}
          icon={<Wallet className="h-5 w-5" />}
          loading={loading}
        />
        
        <StatCard
          title="Total Spent"
          value={formatAmount(summaryStats.totalSpent)}
          icon={<CreditCard className="h-5 w-5" />}
          loading={loading}
        />
        
        <StatCard
          title="Remaining"
          value={formatAmount(summaryStats.totalRemaining)}
          description={`${Math.round((summaryStats.totalSpent / summaryStats.totalBudget) * 100 || 0)}% of budget used`}
          icon={<PiggyBank className="h-5 w-5" />}
          loading={loading}
        />
        
        <StatCard
          title="Budget Status"
          value={summaryStats.overBudgetCount > 0 ? `${summaryStats.overBudgetCount} Over Limit` : 'All Within Budget'}
          description={summaryStats.nearLimitCount > 0 ? `${summaryStats.nearLimitCount} categories near limit` : 'All categories within safe levels'}
          icon={<PieChart className="h-5 w-5" />}
          loading={loading}
        />
      </div>

      {/* Filter controls */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-8 border border-gray-200">
        <div className="p-4 border-b flex flex-wrap items-center justify-between gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showDateFilter ? 'Hide Filters' : 'Show Filters'}
            <ChevronDown className={`ml-2 h-3 w-3 transition-transform ${showDateFilter ? 'rotate-180' : ''}`} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const now = new Date()
              setSelectedMonth(now.getMonth() + 1)
              setSelectedYear(now.getFullYear())
            }}
          >
            Reset to Current Month
          </Button>
        </div>
        
        {showDateFilter && (
          <div className="p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  id="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      {getMonthName(month)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  id="year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Loading, error states or budgets display */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-28" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-2 w-full mb-1" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-700">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : budgets.length === 0 ? (
        <Card className="text-center py-10 px-6">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
              <CreditCard className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No budgets set</h3>
            <p className="text-gray-500 max-w-md mb-8">
              Set up budgets to track your spending against your financial goals. Budgets help you stay on track and achieve your financial objectives.
            </p>
            <Button onClick={() => router.push('/budgets/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Budget
            </Button>
          </div>
        </Card>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget) => {
              const status = getBudgetStatus(budget.percentage_used);
              return (
                <Card key={budget.id} className="overflow-hidden">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                        style={{ backgroundColor: `${budget.category_color}20` }}
                      >
                        <span style={{ color: budget.category_color }}>
                          {budget.category_name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{budget.category_name}</CardTitle>
                        <CardDescription>
                          {getMonthName(budget.month || 1)} {budget.year}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-indigo-600"
                        onClick={() => router.push(`/budgets/${budget.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-red-600"
                        onClick={() => handleDeleteBudget(budget.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="pt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{formatAmount(budget.amount)}</span>
                        <span className="text-gray-500">
                          {formatAmount(budget.spent_amount)} spent
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                        <div 
                          className={`h-2 rounded-full ${status.progressClass}`}
                          style={{ width: `${Math.min(100, budget.percentage_used)}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span 
                          className={`text-xs font-medium px-2 py-1 rounded-full flex items-center ${status.colorClass}`}
                        >
                          {status.icon}
                          {status.label}
                        </span>
                        
                        <span className="text-sm">
                          {budget.percentage_used > 100 
                            ? <span className="text-red-600 font-medium">Over by {formatAmount(Math.abs(budget.remaining_amount))}</span>
                            : <span className="text-gray-500">{formatAmount(budget.remaining_amount)} left</span>
                          }
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </PageContainer>
  )
} 