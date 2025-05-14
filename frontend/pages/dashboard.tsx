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

// Define interface for top category
interface TopCategory {
  name: string;
  spent: number;
  id?: string;
  color?: string;
}

// Dashboard component
export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { preferredCurrency, convertAmount, formatAmount, convertAndFormat } = useCurrency()
  
  // State for expenses data
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([])
  const [monthlyExpenses, setMonthlyExpenses] = useState<Expense[]>([])
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryTotals, setCategoryTotals] = useState<any[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [topSpendingCategory, setTopSpendingCategory] = useState<TopCategory>({ name: 'None', spent: 0 })
  
  // State for date filtering
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    // Default to current year, never allow future years
    const currentYear = new Date().getFullYear();
    return currentYear;
  });
  
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    // Default to current month, never allow future months
    return new Date().getMonth() + 1;
  });
  
  // Add effect to validate selected date on component mount and when date changes
  useEffect(() => {
    // Validate that selected date is not in the future
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    // If selected date is in the future, reset to current date
    if (selectedYear > currentYear || (selectedYear === currentYear && selectedMonth > currentMonth)) {
      console.log('Selected date is in the future, resetting to current date');
      setSelectedYear(currentYear);
      setSelectedMonth(currentMonth);
    }
  }, [selectedMonth, selectedYear]);
  
  // State for month navigation
  const [currentDate, setCurrentDate] = useState(new Date())
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  // For comparison with previous month
  const [previousMonthTotal, setPreviousMonthTotal] = useState<number>(0)
  const [monthlyChange, setMonthlyChange] = useState<number>(0)
  const [monthlyChangePercent, setMonthlyChangePercent] = useState<number>(0)
  
  // Add a state for notifications at the top with other states
  const [notification, setNotification] = useState<string | null>(null);
  
  // Add state for debug panel visibility near the other state variables
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  
  // Update the month navigation functions to prevent going to future dates
  const goToPreviousMonth = () => {
    let newMonth = selectedMonth - 1;
    let newYear = selectedYear;
    
    if (newMonth === 0) {
      newMonth = 12;
      newYear = selectedYear - 1;
    }
    
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };
  
  // Update the goToNextMonth function to show a notification
  const goToNextMonth = () => {
    // Get current date for comparison
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    // Calculate next month and year
    let newMonth = selectedMonth + 1;
    let newYear = selectedYear;
    
    if (newMonth === 13) {
      newMonth = 1;
      newYear = selectedYear + 1;
    }
    
    // Only update if not going to a future month
    if (newYear < currentYear || (newYear === currentYear && newMonth <= currentMonth)) {
      setSelectedMonth(newMonth);
      setSelectedYear(newYear);
    } else {
      console.log('Cannot navigate to future months');
      setNotification('Cannot navigate to future months');
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };
  
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
      // Validate that we're not requesting data for a future date
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      
      // If selected date is in the future, reset to current date
      if (selectedYear > currentYear || (selectedYear === currentYear && selectedMonth > currentMonth)) {
        console.log('Selected date is in the future, resetting to current date');
        setSelectedYear(currentYear);
        setSelectedMonth(currentMonth);
        // Don't return here, we'll let the validation in API handle it
      }
      
      // First day of the selected month - ensure we're using proper date format
      // Adding padStart to ensure single digit months and days have leading zeros
      const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
      
      // Calculate the last day of the selected month
      const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
      const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      
      console.log('Fetching expenses with date range:', { startDate, endDate, env: process.env.NODE_ENV });
      
      // Add date filtering to expenses API call
      let expenses = [];
      try {
        expenses = await expenseAPI.getAllExpenses({
          skip: 0,
          limit: 100,
          start_date: startDate,
          end_date: endDate
        });
        console.log('Received expenses:', expenses.length);
      } catch (expError) {
        console.error('Error fetching expenses:', expError);
        expenses = [];
      }
      
      // Store the monthly expenses
      setMonthlyExpenses(expenses);
      
      // For comparison with previous month
      // Calculate the previous month
      let prevMonth = selectedMonth - 1;
      let prevYear = selectedYear;
      if (prevMonth === 0) {
        prevMonth = 12;
        prevYear = selectedYear - 1;
      }
      
      // First and last day of previous month
      const prevStartDate = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
      const prevLastDay = new Date(prevYear, prevMonth, 0).getDate();
      const prevEndDate = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(prevLastDay).padStart(2, '0')}`;
      
      console.log('Fetching previous month expenses:', { prevStartDate, prevEndDate });
      
      // Get previous month expenses
      let prevMonthExpenses = [];
      try {
        prevMonthExpenses = await expenseAPI.getAllExpenses({
          skip: 0,
          limit: 100,
          start_date: prevStartDate,
          end_date: prevEndDate
        });
        console.log('Received previous month expenses:', prevMonthExpenses.length);
      } catch (prevExpError) {
        console.error('Error fetching previous month expenses:', prevExpError);
        prevMonthExpenses = [];
      }
      
      // Fetch categories after expenses
      const fetchedCategories = await categoryAPI.getAllCategories()
      
      if (Array.isArray(fetchedCategories)) {
        // Get the 5 most recent expenses - ensure we handle the case where expenses is empty
        const recent = expenses.length > 0 
          ? [...expenses].sort((a, b) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            ).slice(0, 6)
          : [];
        
        setRecentExpenses(recent)
        
        // Calculate total expenses for the current month with currency conversion
        const total = expenses.reduce((sum: number, expense: any) => 
          sum + convertAmount(expense.amount, expense.currency), 0);
        setTotalExpenses(total);
        
        // Calculate previous month total for comparison
        const prevTotal = Array.isArray(prevMonthExpenses) && prevMonthExpenses.length > 0
          ? prevMonthExpenses.reduce((sum: number, expense: any) => 
              sum + convertAmount(expense.amount, expense.currency), 0) 
          : 0;
        setPreviousMonthTotal(prevTotal);
        
        // Calculate monthly change for the comparison indicator
        const change = total - prevTotal;
        setMonthlyChange(change);
        
        // Calculate percentage change
        if (prevTotal > 0) {
          const changePercent = (change / prevTotal) * 100;
          setMonthlyChangePercent(changePercent);
        } else {
          setMonthlyChangePercent(total > 0 ? 100 : 0);
        }
        
        // Now we process the categories to include spending data for this month
        const categoriesWithSpending = fetchedCategories.map((category: any) => {
          // Calculate total spending for this category in the selected month
          const categoryExpenses = expenses.filter((exp: any) => exp.category_id === category.id);
          const spent = categoryExpenses.reduce((sum: number, exp: any) => 
            sum + convertAmount(exp.amount, exp.currency), 0);
          
          return { ...category, spent };
        });
        
        // Find the category with the highest spending
        let topCategory: TopCategory = { name: 'None', spent: 0 };
        if (categoriesWithSpending.length > 0) {
          topCategory = categoriesWithSpending.reduce((top: TopCategory, exp: any) => 
            exp.spent > top.spent ? exp : top, { name: 'None', spent: 0 });
        }
        
        setTopSpendingCategory(topCategory);
        setCategories(categoriesWithSpending);
        
        // Calculate totals by category for charts
        const catTotals = categoriesWithSpending
          .map((category: any) => {
            const catExpenses = expenses.filter((exp: any) => exp.category_id === category.id);
            const catTotal = catExpenses.reduce((sum: number, exp: any) => 
              sum + convertAmount(exp.amount, exp.currency), 0);
            const percentage = total > 0 ? Number((catTotal / total * 100).toFixed(1)) : 0;
            
            return {
              id: category.id,
              name: category.name,
              color: category.color,
              total: catTotal,
              percentage: percentage,
              count: catExpenses.length
            };
          })
          .filter((cat: any) => cat.total > 0)
          .sort((a: any, b: any) => b.total - a.total);
        
        setCategoryTotals(catTotals);
        
        // Get the budgets and calculate the spending against them
        try {
          const budgetParams = {
            year: selectedYear,
            month: selectedMonth
          };
          
          console.log('Fetching budgets with params:', budgetParams);
          const budgetsData = await budgetAPI.getAllBudgets(budgetParams);
          console.log('Received budgets data:', budgetsData);
          
          // Ensure budgets is an array
          if (Array.isArray(budgetsData)) {
            const processedBudgets = budgetsData.map((budget: any) => {
              try {
                // Find the associated category
                const category = categoriesWithSpending.find((cat: any) => cat.id === budget.category_id);
                
                // Log the current budget for debugging
                console.log('Processing budget:', { 
                  id: budget.id, 
                  category_id: budget.category_id,
                  has_category_ids: !!budget.category_ids,
                  amount: budget.amount
                });
                
                // Get expenses for this budget based on category
                const budgetExpenses = expenses.filter((exp: any) => {
                  // Safely check if budget has category_ids and if so, use it for filtering
                  // Otherwise fall back to comparing the budget's category_id with the expense's category_id
                  return budget.category_ids 
                    ? Array.isArray(budget.category_ids) && budget.category_ids.includes(exp.category_id)
                    : budget.category_id === exp.category_id;
                });
                
                // Calculate spent amount for this budget
                const spent = budgetExpenses.reduce((sum: number, exp: any) => 
                  sum + convertAmount(exp.amount, exp.currency), 0);
                
                // Convert budget amount to preferred currency if needed
                const budgetAmount = convertAmount(budget.amount, budget.currency);
                
                // Calculate remaining amount and percentage
                const remaining = budgetAmount - spent;
                const percentage = budgetAmount > 0 
                  ? Math.min(100, Math.max(0, (spent / budgetAmount) * 100))
                  : 0;
                
                // Determine budget status
                let status: 'under' | 'over' | 'warning' = 'under';
                if (spent > budgetAmount) {
                  status = 'over';
                } else if (spent > budgetAmount * 0.9) {
                  status = 'warning';
                }
                
                return {
                  ...budget,
                  category,
                  spent,
                  remaining,
                  percentage,
                  status
                };
              } catch (processingError) {
                // If there's an error processing a specific budget, log it but don't break the whole process
                console.error('Error processing budget:', processingError, budget);
                return { 
                  ...budget, 
                  spent: 0, 
                  remaining: budget.amount,
                  percentage: 0,
                  status: 'under',
                  processingError: true
                };
              }
            });
            
            setBudgets(processedBudgets);
          } else {
            console.warn('Budgets data is not an array:', budgetsData);
            setBudgets([]);
          }
        } catch (budgetErr) {
          console.error('Error fetching budgets:', budgetErr);
          // Don't set error state here to prevent blocking UI
          setBudgets([]);
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
      setError(err?.message || 'Error fetching dashboard data. Please try again later.');
      
      // Ensure we set loading to false even on error
      setLoading(false);
      
      // Set fallback empty values for all state
      setMonthlyExpenses([]);
      setRecentExpenses([]);
      setCategories([]);
      setCategoryTotals([]);
      setBudgets([]);
      setTotalExpenses(0);
      setPreviousMonthTotal(0);
      setMonthlyChange(0);
      setMonthlyChangePercent(0);
      setTopSpendingCategory({ name: 'None', spent: 0 });
    } finally {
      // Always set loading to false when done, regardless of success or failure
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
          value={formatAmount(totalExpenses || 0)}
          description={
            <div className="flex items-center text-sm">
              <span className={monthlyChange < 0 ? 'text-green-600' : 'text-red-600'}>
                {monthlyChange < 0 ? (
                  <ArrowDownRight className="inline h-3.5 w-3.5 mr-1" />
                ) : (
                  <ArrowUpRight className="inline h-3.5 w-3.5 mr-1" />
                )}
                {Math.abs(monthlyChangePercent || 0).toFixed(1)}% 
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
          value={categories?.length || 0}
          description="Active spending categories"
          icon={<Tag className="h-4 w-4" />}
          loading={loading}
          onClick={() => router.push('/categories')}
        />
        
        <StatCard 
          title="Active Budgets" 
          value={budgets?.length || 0}
          description="Budgets for this month"
          icon={<DollarSign className="h-4 w-4" />}
          loading={loading}
          onClick={() => router.push('/budgets')}
        />
        
        <StatCard 
          title="Recent Activity" 
          value={monthlyExpenses?.length || 0}
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
            
            {loading ? (
              <div className="flex justify-center items-center h-48 p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (!recentExpenses || recentExpenses.length === 0) ? (
              <div className="p-6 text-center">
                <div className="py-12">
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Wallet className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-gray-500 text-lg font-medium mb-2">No expenses found</h3>
                  <p className="text-gray-400 max-w-md mx-auto mb-6">
                    No expenses recorded for {getMonthName(selectedMonth)} {selectedYear} yet.
                  </p>
                  <Button 
                    onClick={() => router.push('/expenses/new')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add New Expense
                  </Button>
                </div>
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
                              backgroundColor: expense.category?.color 
                                ? `${expense.category.color}20`  // 20 is hex for 12% opacity
                                : '#E5E7EB',
                              color: expense.category?.color 
                                ? expense.category.color 
                                : '#374151'
                            }}
                          >
                            {expense.category?.name || 'Uncategorized'}
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
            
            {loading ? (
              <div className="flex justify-center items-center h-48 p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (!categories || categories.length === 0 || !categories.some(cat => (cat.spent || 0) > 0)) ? (
              <div className="p-6 text-center">
                <div className="py-10">
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Tag className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-gray-500 text-lg font-medium mb-2">
                    {!categories || categories.length === 0 ? 'No categories yet' : 'No spending for this month'}
                  </h3>
                  <p className="text-gray-400 max-w-md mx-auto mb-6">
                    {!categories || categories.length === 0 
                      ? 'Create categories to organize your expenses and track your spending habits.'
                      : `No category spending recorded for ${getMonthName(selectedMonth)} ${selectedYear}.`
                    }
                  </p>
                  <Button 
                    onClick={() => router.push(!categories || categories.length === 0 ? '/categories/new' : '/expenses/new')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {!categories || categories.length === 0 ? 'Add Categories' : 'Add New Expense'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {categories
                  .filter(cat => cat.spent && cat.spent > 0)
                  .sort((a, b) => (b.spent || 0) - (a.spent || 0))
                  .slice(0, 5)
                  .map((category) => {
                    try {
                      // Safely access budgets with null checks
                      const budgetItem = Array.isArray(budgets) ? 
                        budgets.find(b => b && b.category_id === category.id) : 
                        undefined;
                      
                      // Safely convert amount with null checks
                      const budgetAmount = budgetItem && budgetItem.amount && budgetItem.currency ? 
                        convertAmount(budgetItem.amount, budgetItem.currency) : 
                        0;
                      
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
                                style={{ backgroundColor: category.color || '#CCCCCC' }}
                              />
                              <span className="font-medium text-gray-800">
                                {category.name || 'Unknown Category'}
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
                    } catch (error) {
                      console.error('Error rendering category:', error, category);
                      // Provide a fallback UI for the category to avoid breaking the entire list
                      return (
                        <div 
                          key={category.id || 'fallback-key'} 
                          className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full mr-2 bg-gray-400" />
                              <span className="font-medium text-gray-800">
                                {category.name || 'Category Error'}
                              </span>
                            </div>
                            <span className="text-gray-700 font-medium">
                              {formatAmount(category.spent || 0)}
                            </span>
                          </div>
                        </div>
                      );
                    }
                  })}
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
      
      {/* Debug Information section - toggle for both development and production */}
      <div className="mt-6 flex justify-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowDebugPanel(!showDebugPanel)}
          className="text-sm"
        >
          {showDebugPanel ? "Hide Debug Info" : "Show Debug Info"}
        </Button>
      </div>
      
      {showDebugPanel && (
        <div className="mt-2 p-4 bg-gray-100 rounded-lg border border-gray-300">
          <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Fixed Issues:</strong></p>
              <ul className="list-disc pl-5 text-sm">
                <li>Prevented requests for future dates that caused 422 errors</li>
                <li>Added robust error handling for API requests</li>
                <li>Improved date formatting for API consistency</li>
                <li>Added validation to prevent navigation to future months</li>
                <li>Added fallbacks for all calculations when data is missing</li>
                <li>Fixed "Cannot read properties of undefined (reading 'includes')" error by adding null checks for budget.category_ids</li>
              </ul>
            </div>
            <div>
              <p><strong>State Values:</strong></p>
              <ul className="text-xs space-y-1">
                <li><strong>Selected Month/Year:</strong> {getMonthName(selectedMonth)} {selectedYear}</li>
                <li><strong>Monthly Expenses:</strong> {monthlyExpenses?.length || 0} items</li>
                <li><strong>Recent Expenses:</strong> {recentExpenses?.length || 0} items</li>
                <li><strong>Categories:</strong> {categories?.length || 0} items</li>
                <li><strong>Total Monthly Expenses:</strong> ${totalExpenses.toFixed(2)}</li>
                <li><strong>Previous Month Total:</strong> ${previousMonthTotal.toFixed(2)}</li>
                <li><strong>Environment:</strong> {process.env.NODE_ENV}</li>
                <li><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || '(not set)'}</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4">
            <p><strong>Budget Processing:</strong></p>
            <div className="bg-gray-50 p-2 rounded text-xs font-mono max-h-40 overflow-y-auto">
              <pre>
                {JSON.stringify(budgets?.slice(0, 3) || [], null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
      
      {/* Add the notification display in the JSX right after the main dashboard container div */}
      {notification && (
        <div className="fixed top-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-md z-50">
          <p>{notification}</p>
        </div>
      )}
    </PageContainer>
  )
} 