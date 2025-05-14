import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { expenseAPI, categoryAPI, budgetAPI } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { useCurrency } from '@/hooks/useCurrency'
import AnnualSummaryChart from '@/components/reports/AnnualSummaryChart'
import { 
  DollarSign, 
  CreditCard, 
  Calendar, 
  ChevronRight, 
  PlusCircle,
  PieChart,
  TrendingUp,
  List,
  Filter,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Plus,
  ChevronLeft,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Tag,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatCard } from '@/components/StatCard'
import PageContainer from '@/components/layout/PageContainer'
import ApiDebug from '../components/ApiDebug'

// Define interface for expenses
interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
  category_id: number;
  currency: string;
  category: {
    id: number;
    name: string;
    color: string;
  };
}

// Define interface for categories
interface Category {
  id: number;
  name: string;
  color: string;
  description?: string;
  budget?: number;
  spent?: number;
}

// Define interface for category totals
interface CategoryTotal {
  id: number;
  name: string;
  color: string;
  total: number;
  percentage: number | string;
  count: number;
}

// Define interface for budget
interface Budget {
  id: number;
  amount: number;
  category_id: number;
  category?: Category;
  year: number;
  month: number;
  period?: string;
  currency: string;
  remaining?: number;
  percentage?: number;
  status?: 'under' | 'over' | 'warning';
}

// Dashboard component
export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { preferredCurrency, convertAmount, formatAmount, convertAndFormat } = useCurrency()
  
  // State for expenses data
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([])
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // State for date filtering
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [showDateFilter, setShowDateFilter] = useState(false)
  
  // State for month navigation
  const [currentDate, setCurrentDate] = useState(new Date())
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  // For comparison with previous month
  const [previousMonthTotal, setPreviousMonthTotal] = useState<number>(0)
  const [monthlyChange, setMonthlyChange] = useState<number>(0)
  const [monthlyChangePercent, setMonthlyChangePercent] = useState<number>(0)
  
  // Function to go to previous month
  const goToPreviousMonth = () => {
    let newMonth = selectedMonth - 1
    let newYear = selectedYear
    
    if (newMonth < 1) {
      newMonth = 12
      newYear = selectedYear - 1
    }
    
    setSelectedMonth(newMonth)
    setSelectedYear(newYear)
  }
  
  // Function to go to next month
  const goToNextMonth = () => {
    let newMonth = selectedMonth + 1
    let newYear = selectedYear
    
    if (newMonth > 12) {
      newMonth = 1
      newYear = selectedYear + 1
    }
    
    // Don't allow navigating to future months
    const today = new Date()
    const newDate = new Date(newYear, newMonth - 1, 1)
    
    if (newDate <= today) {
      setSelectedMonth(newMonth)
      setSelectedYear(newYear)
    }
  }
  
  // Get current month name
  const getMonthName = (month: number) => {
    return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' })
  }
  
  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      // Fetch data when user is available or when date range changes
      fetchDashboardData()
    }
  }, [user, authLoading, selectedYear, selectedMonth])
  
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get the current date for filtering
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
      
      // Add better parameters for the expenses API call
      const expenses = await expenseAPI.getAllExpenses({
        skip: 0,
        limit: 100, // Increase limit to ensure we get all expenses for the month
        start_date: `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`,
        end_date: selectedMonth === 12 
          ? `${selectedYear + 1}-01-01` 
          : `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-01`
      });
      
      // Also get expenses from previous month for comparison
      const previousMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
      const previousYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
      
      const previousMonthExpenses = await expenseAPI.getAllExpenses({
        skip: 0,
        limit: 100,
        start_date: `${previousYear}-${previousMonth.toString().padStart(2, '0')}-01`,
        end_date: previousMonth === 12 
          ? `${previousYear + 1}-01-01` 
          : `${previousYear}-${(previousMonth + 1).toString().padStart(2, '0')}-01`
      });
      
      // Fetch categories after expenses
      const fetchedCategories = await categoryAPI.getAllCategories()
      
      if (Array.isArray(expenses) && Array.isArray(fetchedCategories)) {
        // Get the 5 most recent expenses
        const recent = [...expenses].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ).slice(0, 6)
        
        setRecentExpenses(recent)
        
        // Calculate total expenses for the current month with currency conversion
        const total = expenses.reduce((sum, expense) => 
          sum + convertAmount(expense.amount, expense.currency), 0);
        setTotalExpenses(total);
        
        // Calculate previous month's total for comparison
        const prevTotal = previousMonthExpenses.reduce((sum: number, expense: Expense) => 
          sum + convertAmount(expense.amount, expense.currency), 0);
        setPreviousMonthTotal(prevTotal);
        
        // Calculate month-over-month change
        const change = total - prevTotal;
        setMonthlyChange(change);
        
        // Calculate percentage change
        const percentChange = prevTotal > 0 
          ? (change / prevTotal) * 100 
          : 0;
        setMonthlyChangePercent(percentChange);
        
        // Update categories with spent amounts
        const categoriesWithSpending = fetchedCategories.map(category => {
          const catExpenses = expenses.filter(exp => exp.category_id === category.id)
          const spent = catExpenses.reduce((sum, exp) => sum + convertAmount(exp.amount, exp.currency), 0)
          
          return {
            ...category,
            spent
          }
        })
        setCategories(categoriesWithSpending)
        
        // Cache categories
        localStorage.setItem('userCategories', JSON.stringify(categoriesWithSpending))
        
        // Calculate totals by category
        const catTotals = categoriesWithSpending.map(category => {
          const catExpenses = expenses.filter(exp => exp.category_id === category.id)
          const catTotal = catExpenses.reduce((sum, exp) => sum + convertAmount(exp.amount, exp.currency), 0)
          const percentage = total > 0 ? (catTotal / total * 100).toFixed(1) : 0
          
          return {
            id: category.id,
            name: category.name,
            color: category.color,
            total: catTotal,
            percentage: percentage,
            count: catExpenses.length
          }
        }).filter(cat => cat.total > 0)
        .sort((a, b) => b.total - a.total)
        
        setCategoryTotals(catTotals)
        
        // Fetch budgets for the selected month
        try {
          const budgetParams = {
            year: selectedYear,
            month: selectedMonth
          }
          
          const fetchedBudgets = await budgetAPI.getAllBudgets(budgetParams)
          console.log('Fetched budgets:', fetchedBudgets)
          
          if (Array.isArray(fetchedBudgets)) {
            // Process budgets to add category info and calculate remaining amount
            const processedBudgets = fetchedBudgets.map(budget => {
              const category = categoriesWithSpending.find(cat => cat.id === budget.category_id)
              const categoryExpenses = expenses.filter(exp => exp.category_id === budget.category_id)
              
              // Convert all expense amounts to the user's preferred currency
              const spentAmount = categoryExpenses.reduce((sum, exp) => 
                sum + convertAmount(exp.amount, exp.currency), 0)
              
              // Convert budget amount to preferred currency if it's in a different currency
              const budgetAmount = convertAmount(budget.amount, budget.currency)
              
              const remaining = budgetAmount - spentAmount
              const percentage = Math.min(100, Math.max(0, (spentAmount / budgetAmount) * 100))
              
              // Determine budget status
              let status: 'under' | 'over' | 'warning' = 'under'
              if (spentAmount > budgetAmount) {
                status = 'over'
              } else if (spentAmount > budgetAmount * 0.9) {
                status = 'warning'
              }
              
              return {
                ...budget,
                category,
                amount: budgetAmount, // Use the converted amount
                remaining,
                percentage,
                status
              }
            })
            
            setBudgets(processedBudgets)
          }
        } catch (budgetErr) {
          console.error('Error fetching budgets:', budgetErr)
          // Don't set error state here to prevent blocking UI
        }
      } else {
        // Handle case where data isn't an array
        if (!Array.isArray(expenses)) {
          console.error('Expenses data is not an array:', expenses)
        }
        if (!Array.isArray(fetchedCategories)) {
          console.error('Categories data is not an array:', fetchedCategories)
        }
        throw new Error('Invalid data format received from server')
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.detail || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
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
  
  return (
    <PageContainer>
      {/* <ApiDebug /> */}
      {/* Dashboard header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h1 className="text-3xl font-bold">Financial Dashboard</h1>
          </div>
          <p className="text-indigo-100 max-w-3xl">
            Track your spending, manage your budget, and improve your financial health.
          </p>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      {/* Month navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold mr-4 flex items-center">
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
                disabled={
                  selectedMonth === new Date().getMonth() + 1 && 
                  selectedYear === new Date().getFullYear()
                }
                className="h-8 w-8 rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/reports')}
            className="text-sm"
          >
            View Reports
            <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Monthly Expenses" 
          value={formatAmount(totalExpenses)}
          description={
            <div className="flex items-center text-sm">
              <span className={monthlyChange < 0 ? 'text-green-600' : 'text-red-600'}>
                {monthlyChange < 0 ? (
                  <ArrowDownRight className="inline h-3.5 w-3.5 mr-1" />
                ) : (
                  <ArrowUpRight className="inline h-3.5 w-3.5 mr-1" />
                )}
                {Math.abs(monthlyChangePercent).toFixed(1)}% 
              </span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          }
          icon={<Wallet className="h-4 w-4" />}
          loading={loading}
          onClick={() => router.push('/expenses')}
        />
        
        <StatCard 
          title="Total Categories" 
          value={categories.length}
          description="Active spending categories"
          icon={<Tag className="h-4 w-4" />}
          loading={loading}
          onClick={() => router.push('/categories')}
        />
        
        <StatCard 
          title="Active Budgets" 
          value={budgets.length}
          description="Budgets for this month"
          icon={<DollarSign className="h-4 w-4" />}
          loading={loading}
          onClick={() => router.push('/budgets')}
        />
        
        <StatCard 
          title="Recent Activity" 
          value={recentExpenses.length}
          description="New transactions this month"
          icon={<Clock className="h-4 w-4" />}
          loading={loading}
          onClick={() => router.push('/expenses')}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent expenses */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden h-[457px]">
            <div className="p-6 bg-gradient-to-b from-gray-50 to-white border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                  Recent Expenses
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-sm"
                  onClick={() => router.push('/expenses')}
                >
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {recentExpenses.length === 0 ? (
              <div className="p-6 text-center">
                {loading ? (
                  <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="py-12">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Wallet className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-gray-500 text-lg font-medium mb-2">No expenses yet</h3>
                    <p className="text-gray-400 max-w-md mx-auto mb-6">
                      Start tracking your spending to gain insights into your financial habits.
                    </p>
                    <Button 
                      onClick={() => router.push('/expenses/new')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="mr-1.5 h-4 w-4" />
                      Add Your First Expense
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentExpenses.map((expense) => (
                      <tr 
                        key={expense.id} 
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => router.push(`/expenses/${expense.id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(expense.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {expense.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: expense.category.color 
                                ? `${expense.category.color}20`  // 20 is hex for 12% opacity
                                : '#E5E7EB',
                              color: expense.category.color 
                                ? expense.category.color 
                                : '#374151'
                            }}
                          >
                            {expense.category.name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                          {convertAndFormat(expense.amount, expense.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
        
        {/* Category spending */}
        <div>
          <Card className="overflow-hidden">
            <div className="p-6 bg-gradient-to-b from-gray-50 to-white border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-blue-500" />
                  Category Spending
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-sm"
                  onClick={() => router.push('/categories')}
                >
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {categories.length === 0 ? (
              <div className="p-6 text-center">
                {loading ? (
                  <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="py-10">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Tag className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-gray-500 text-lg font-medium mb-2">No categories yet</h3>
                    <p className="text-gray-400 max-w-md mx-auto mb-6">
                      Create categories to organize your expenses and track your spending habits.
                    </p>
                    <Button 
                      onClick={() => router.push('/categories/new')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Add Categories
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {categories
                  .filter(cat => cat.spent && cat.spent > 0)
                  .sort((a, b) => (b.spent || 0) - (a.spent || 0))
                  .slice(0, 5)
                  .map((category) => {
                    const budgetItem = budgets.find(b => b.category_id === category.id);
                    const budgetAmount = budgetItem ? convertAmount(budgetItem.amount, budgetItem.currency) : 0;
                    const spent = category.spent || 0;
                    const percentage = budgetAmount > 0 
                      ? Math.min(Math.round((spent / budgetAmount) * 100), 100) 
                      : 0;
                    
                    return (
                      <div 
                        key={category.id} 
                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => router.push(`/categories/${category.id}`)}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="font-medium text-gray-800">
                              {category.name}
                            </span>
                          </div>
                          <span className="text-gray-700 font-medium">
                            {formatAmount(spent)}
                          </span>
                        </div>
                        
                        {budgetAmount > 0 && (
                          <div>
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Budget: {formatAmount(budgetAmount)}</span>
                              <span 
                                className={
                                  percentage >= 100 ? 'text-red-600 font-medium' : 
                                  percentage >= 85 ? 'text-amber-600 font-medium' : 
                                  'text-gray-500'
                                }
                              >
                                {percentage}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  percentage >= 100 ? 'bg-red-500' : 
                                  percentage >= 85 ? 'bg-amber-500' : 
                                  'bg-blue-500'
                                }`} 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                
                {categories.filter(cat => cat.spent && cat.spent > 0).length === 0 && !loading && (
                  <div className="p-6 text-center text-gray-500">
                    No spending recorded for this month yet.
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
      
      {/* Annual Expense Summary - New Section */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold flex items-center mb-4">
          <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
          Annual Expense Summary
        </h2>
        <div className="bg-white rounded-lg shadow-md p-5">
          <AnnualSummaryChart defaultYear={selectedYear} />
        </div>
      </div>
    </PageContainer>
  )
} 