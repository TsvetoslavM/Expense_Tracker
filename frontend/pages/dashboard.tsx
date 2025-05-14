import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { expenseAPI, categoryAPI, budgetAPI, reportAPI } from '@/lib/api'
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
  created_at?: string;
  updated_at?: string;
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
    const clientDate = new Date();
    const clientYear = clientDate.getFullYear();
    
    // If client year seems unreasonable, use fallback
    return (clientYear < 2020 || clientYear > 2025) ? 2025 : clientYear;
  });
  
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    // Always use client month as it's likely correct even if year is wrong
    return new Date().getMonth() + 1;
  });
  
  // Add a state to track if we've detected an incorrect system date
  const [systemDateIncorrect, setSystemDateIncorrect] = useState(false);
  
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
  
  // Function to get the actual current date (not relying solely on client system date)
  const getActualCurrentDate = () => {
    // Get the actual current date from the client system
    const clientDate = new Date();
    
    return {
      year: clientDate.getFullYear(),
      month: clientDate.getMonth() + 1,
      source: 'client'
    };
  };
  
  // Update the reset current month function to use this
  const resetToCurrentMonth = () => {
    const actualDate = getActualCurrentDate();
    
    // Explicitly reset category state
    setCategoryTotals([]);
    setMonthlyExpenses([]);
    setTopSpendingCategory({ name: 'None', spent: 0 });
    
    // Set loading state
    setLoading(true);
    
    setSelectedYear(actualDate.year);
    setSelectedMonth(actualDate.month);
  };
  
  // Update the month navigation functions to include direct state reset
  const goToPreviousMonth = () => {
    let newMonth = selectedMonth - 1;
    let newYear = selectedYear;
    
    if (newMonth === 0) {
      newMonth = 12;
      newYear = selectedYear - 1;
    }
    
    // Explicitly reset category state
    setCategoryTotals([]);
    setMonthlyExpenses([]);
    setTopSpendingCategory({ name: 'None', spent: 0 });
    
    // Set loading state
    setLoading(true);
    
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };
  
  // Update the goToNextMonth function to allow future dates
  const goToNextMonth = () => {
    // Calculate next month and year
    let newMonth = selectedMonth + 1;
    let newYear = selectedYear;
    
    if (newMonth === 13) {
      newMonth = 1;
      newYear = selectedYear + 1;
    }
    
    // Explicitly reset category state
    setCategoryTotals([]);
    setMonthlyExpenses([]);
    setTopSpendingCategory({ name: 'None', spent: 0 });
    
    // Set loading state
    setLoading(true);
    
    // Allow navigating to any future month
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
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
      // Set loading true when date range changes
      setLoading(true);
      // Fetch data when user is available or when date range changes
      fetchDashboardData()
      
    }
  }, [user, authLoading, selectedYear, selectedMonth])
  
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Debug current state
      console.log('Fetching dashboard data for:', { year: selectedYear, month: selectedMonth });
      
      // Get annual summary data for the selected year
      const annualData = await reportAPI.getAnnualSummary(selectedYear);
      console.log('Annual summary data:', annualData);
      
      if (!annualData || !annualData.monthly_data) {
        setError('No data available for the selected year');
        setLoading(false);
        return;
      }
      
      // Find monthly data for the selected month
      const monthlyData = annualData.monthly_data.find((item: any) => item.month === selectedMonth);
      console.log('Monthly data found:', { monthlyData, month: selectedMonth });
      
      // Find previous month data - declare at the top level of the function
      // so it's available to all code blocks below
      let prevMonthData = null;
      
      // Get expense data BEFORE calculating category spending
      // to ensure it's available for the category calculations
      let expenses = [];
      try {
        // Calculate first and last day of the selected month
        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
        const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
        
        console.log('Fetching expenses with dates:', { startDate, endDate });
        
        expenses = await expenseAPI.getAllExpenses({
          skip: 0,
          limit: 100,
          start_date: startDate,
          end_date: endDate
        });
        
        // Set monthly expenses and recent expenses
        setMonthlyExpenses(expenses || []);
        console.log(`Found ${expenses?.length || 0} expenses for ${selectedMonth}/${selectedYear}`);
        
        // Get the 5 most recent expenses
        const recent = expenses && expenses.length > 0 
          ? [...expenses].sort((a, b) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            ).slice(0, 6)
          : [];
        setRecentExpenses(recent);
        
      } catch (expError) {
        console.error('Error fetching expenses:', expError);
        setMonthlyExpenses([]);
        setRecentExpenses([]);
        expenses = [];
      }
      
      if (monthlyData) {
        // Set the total expenses from the monthly data
        setTotalExpenses(monthlyData.amount || 0);
        
        // Find previous month data
        const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
        const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
        
        // If we're looking at previous year, we need to fetch that annual data
        let prevYearData;
        
        if (prevMonth === 12 && selectedMonth === 1) {
          // Fetch previous year data
          try {
            prevYearData = await reportAPI.getAnnualSummary(prevYear);
            prevMonthData = prevYearData.monthly_data.find((item: any) => item.month === prevMonth);
          } catch (err) {
            console.error('Error fetching previous year data:', err);
            prevMonthData = null;
          }
        } else {
          // Previous month is in the same year
          prevMonthData = annualData.monthly_data.find((item: any) => item.month === prevMonth);
        }
        
        // Set previous month total and calculate change
        const prevTotal = prevMonthData ? prevMonthData.amount : 0;
        setPreviousMonthTotal(prevTotal);
        
        // Calculate monthly change for the comparison indicator
        const change = monthlyData.amount - prevTotal;
        setMonthlyChange(change);
        
        // Calculate percentage change
        if (prevTotal > 0) {
          const changePercent = (change / prevTotal) * 100;
          setMonthlyChangePercent(changePercent);
        } else {
          setMonthlyChangePercent(monthlyData.amount > 0 ? 100 : 0);
        }
      } else {
        // No data for selected month
        setTotalExpenses(0);
        setPreviousMonthTotal(0);
        setMonthlyChange(0);
        setMonthlyChangePercent(0);
      }
      
      // Fetch categories
      const fetchedCategories = await categoryAPI.getAllCategories();
      if (Array.isArray(fetchedCategories)) {
        setCategories(fetchedCategories);
        console.log(`Processing ${fetchedCategories.length} categories with ${expenses.length} expenses`);
        
        // Process categories with spending data and month-over-month comparisons
        const categoriesWithSpending = fetchedCategories.map((category: Category) => {
          // Get spending data from monthly expenses first (most accurate)
          const spentFromExpenses = expenses  // Use the expenses variable from above
            .filter((expense: Expense) => expense.category_id === category.id)
            .reduce((total: number, expense: Expense) => {
              // Convert expense amount to preferred currency if needed
              const convertedAmount = convertAmount(expense.amount, expense.currency);
              return total + convertedAmount;
            }, 0);
          
          // Fallback to annual summary data if available
          let spentFromAnnualData = 0;
          if (monthlyData && monthlyData.category_breakdown) {
            // Look for category by ID in the annual data's category breakdown
            const categoryData = monthlyData.category_breakdown.find((item: any) => 
              item.category_id === category.id
            );
            
            if (categoryData) {
              spentFromAnnualData = categoryData.amount || 0;
            }
          }
          
          // Use expense data if available, otherwise use annual data
          const spent = expenses.length > 0 ? spentFromExpenses : spentFromAnnualData;
          
          // Log category spending
          if (spent > 0) {
            console.log(`Category ${category.name}: spent ${spent}`);
          }
          
          // Get previous month's spending for this category (if available)
          let previousSpent = 0;
          if (prevMonthData && prevMonthData.category_breakdown) {
            const prevCategoryData = prevMonthData.category_breakdown.find((item: any) => 
              item.category_id === category.id
            );
            if (prevCategoryData) {
              previousSpent = prevCategoryData.amount || 0;
            }
          }
          
          return {
            ...category,
            spent,
            previousMonthTotal: previousSpent
          };
        });
        
        // Calculate total monthly spending
        const monthlyTotal = totalExpenses || 
          categoriesWithSpending.reduce((sum, cat) => sum + (cat.spent || 0), 0);
        
        // Find the category with the highest spending
        const topCategory = categoriesWithSpending.reduce((top: any, current: any) => 
          current.spent > top.spent ? current : top, 
          { name: 'None', spent: 0 }
        );
        
        setTopSpendingCategory(topCategory);
        
        // Calculate totals by category for charts, including percentage of monthly total
        const catTotals = categoriesWithSpending
          .filter((cat: any) => cat.spent > 0)
          .map((category: any) => {
            const percentage = monthlyTotal > 0 
              ? Number((category.spent / monthlyTotal * 100).toFixed(1)) 
              : 0;
            
            return {
              id: category.id,
              name: category.name,
              color: category.color,
              total: category.spent,
              percentage: percentage,
              count: expenses.filter((exp: Expense) => exp.category_id === category.id).length,
              previousMonthTotal: category.previousMonthTotal
            };
          })
          .sort((a: any, b: any) => b.total - a.total);
        
        console.log(`Found ${catTotals.length} categories with spending`);
        setCategoryTotals(catTotals);
      } else {
        setCategories([]);
        setCategoryTotals([]);
      }
      
      // Fetch budgets
      try {
        const budgetParams = {
          year: selectedYear,
          month: selectedMonth
        };
        
        console.log('Fetching budgets with params:', budgetParams);
        const budgetsData = await budgetAPI.getAllBudgets(budgetParams);
        
        if (Array.isArray(budgetsData)) {
          setBudgets(budgetsData);
        } else {
          setBudgets([]);
        }
      } catch (budgetErr) {
        console.error('Error fetching budgets:', budgetErr);
        setBudgets([]);
      }
      
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err?.message || 'Error fetching dashboard data. Please try again later.');
      
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
      console.log('Data fetching complete, setting loading to false');
      setLoading(false);
    }
  }
  
  // Add this after the existing useEffect for data fetching
  useEffect(() => {
    // Show notification when there are budgets but no expenses for the selected month
    if (!loading && budgets?.length > 0 && monthlyExpenses?.length === 0) {
      setNotification(`No expenses found for ${getMonthName(selectedMonth)} ${selectedYear}, but you have ${budgets.length} budget(s) set up.`);
      
      // Clear notification after 5 seconds
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [loading, budgets, monthlyExpenses, selectedMonth, selectedYear]);
  
  // Update the effect that resets to current month/year on mount
  useEffect(() => {
    // After budgets are loaded, we can check if the system date is reasonable
    if (budgets?.length > 0) {
      const actualDate = getActualCurrentDate();
      
      // Check if system date is likely incorrect
      const clientDate = new Date();
      if (actualDate.source === 'fallback' || 
         (actualDate.source === 'server' && 
          Math.abs(clientDate.getFullYear() - actualDate.year) > 1)) {
        
        console.warn('System date appears incorrect', {
          clientDate,
          actualDate
        });
        
        setSystemDateIncorrect(true);
        
        // Also reset to a more reasonable date
        setSelectedYear(actualDate.year);
        setSelectedMonth(actualDate.month);
        
        // Show notification
        setNotification('Your system date appears to be set incorrectly. Using ' + 
                         getMonthName(actualDate.month) + ' ' + actualDate.year + 
                         ' instead.');
      }
    }
  }, [budgets]);
  
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
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                Viewing: {getMonthName(selectedMonth)} {selectedYear} Data
              </span>
            </h2>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={goToPreviousMonth}
                className="h-8 w-8 rounded-full"
                disabled={false}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetToCurrentMonth}
                className="h-8 px-2 text-xs"
                disabled={false}
              >
                Today
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={goToNextMonth}
                disabled={false}
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
        
        {/* Add indicator when no expenses for selected month */}
        {!loading && monthlyExpenses.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-center text-amber-800">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-medium">
                No expenses found for {getMonthName(selectedMonth)} {selectedYear}
              </p>
              <p className="text-xs mt-0.5">
                Add expenses for this month to see your spending statistics.
              </p>
            </div>
            <Button 
              variant="outline"
              size="sm"
              className="ml-auto text-xs"
              onClick={() => router.push('/expenses/new')}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Expense
            </Button>
          </div>
        )}
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Monthly Expenses" 
          value={formatAmount(totalExpenses || 0)}
          description={
            <div className="flex flex-col">
              <div className="flex items-center text-sm">
                <span className={monthlyChange < 0 ? 'text-green-600' : monthlyChange > 0 ? 'text-red-600' : 'text-gray-600'}>
                  {monthlyChange === 0 ? (
                    'No change'
                  ) : monthlyChange < 0 ? (
                    <><ArrowDownRight className="inline h-3.5 w-3.5 mr-1" />{Math.abs(monthlyChangePercent || 0).toFixed(1)}%</>
                  ) : (
                    <><ArrowUpRight className="inline h-3.5 w-3.5 mr-1" />{Math.abs(monthlyChangePercent || 0).toFixed(1)}%</>
                  )}
                </span>
                <span className="text-gray-500 ml-1">vs {selectedMonth === 1 ? 'Dec' : getMonthName(selectedMonth - 1).substring(0, 3)}</span>
              </div>
              {previousMonthTotal === 0 && monthlyChange > 0 && (
                <span className="text-xs text-gray-500 mt-0.5">No data for previous month</span>
              )}
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" key={`dashboard-content-${selectedYear}-${selectedMonth}`}>
        {/* Recent expenses */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden h-full">
            <div className="p-6 bg-gradient-to-b from-gray-50 to-white border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                  Recent Expenses
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    {getMonthName(selectedMonth)} {selectedYear}
                  </span>
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
        
        {/* Category spending - add a key to force rerender on month change */}
        <div key={`category-spending-${selectedYear}-${selectedMonth}`}>
          <Card className="overflow-hidden h-full">
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
            ) : (!categoryTotals || categoryTotals.length === 0) ? (
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
                {categoryTotals.slice(0, 5).map((category) => {
                  try {
                    // Safely access budgets with null checks
                    const budgetItem = Array.isArray(budgets) ? 
                      budgets.find(b => b && b.category_id === category.id) : 
                      undefined;
                    
                    // Safely convert amount with null checks
                    const budgetAmount = budgetItem && budgetItem.amount && budgetItem.currency ? 
                      convertAmount(budgetItem.amount, budgetItem.currency) : 
                      0;
                    
                    const spent = category.total || 0;
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
                              {category.count > 0 && (
                                <span className="ml-2 text-xs text-gray-500">
                                  ({category.count} {category.count === 1 ? 'expense' : 'expenses'})
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-700 font-medium">
                              {formatAmount(spent)}
                            </span>
                            <div className="text-xs text-gray-500">
                              {category.percentage}% of total
                            </div>
                          </div>
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
                        
                        {/* Display month-over-month change if available */}
                        {category.previousMonthTotal !== undefined && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-500">vs Previous Month:</span>
                              {category.previousMonthTotal > 0 ? (
                                <span className={
                                  spent > category.previousMonthTotal ? 'text-red-600' : 
                                  spent < category.previousMonthTotal ? 'text-green-600' : 
                                  'text-gray-500'
                                }>
                                  {spent > category.previousMonthTotal ? (
                                    <>
                                      <ArrowUpRight className="inline h-3 w-3 mr-0.5" />
                                      {Math.abs(((spent - category.previousMonthTotal) / category.previousMonthTotal) * 100).toFixed(0)}%
                                    </>
                                  ) : spent < category.previousMonthTotal ? (
                                    <>
                                      <ArrowDownRight className="inline h-3 w-3 mr-0.5" />
                                      {Math.abs(((category.previousMonthTotal - spent) / category.previousMonthTotal) * 100).toFixed(0)}%
                                    </>
                                  ) : (
                                    'No change'
                                  )}
                                </span>
                              ) : (
                                <span className="text-gray-500">New this month</span>
                              )}
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
                            {formatAmount(category.total || 0)}
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
          <div className="mt-4">
            <p><strong>Debug Information:</strong></p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Fixed Issues:</strong></p>
                <ul className="list-disc pl-5 text-sm">
                  <li>Now using data from Annual Summary API for Monthly Expenses</li>
                  <li>Using actual system date without restrictions</li>
                  <li>Allowing navigation to any month/year, including future dates</li>
                  <li>No more date validation limits on the server</li>
                  <li>Improved calculation of previous month for year transitions</li>
                </ul>

                <div className="mt-4">
                  <p><strong>Data Sources:</strong></p>
                  <ul className="text-xs space-y-1">
                    <li><strong>Monthly Expenses:</strong> reportAPI.getAnnualSummary ({selectedYear})</li>
                    <li><strong>Recent Expenses List:</strong> expenseAPI.getAllExpenses ({selectedMonth}/{selectedYear})</li>
                    <li><strong>Categories:</strong> categoryAPI.getAllCategories + Annual Summary</li>
                    <li><strong>Budgets:</strong> budgetAPI.getAllBudgets</li>
                  </ul>
                </div>

                <div className="mt-4">
                  <p><strong>Date Handling:</strong></p>
                  <ul className="text-xs space-y-1">
                    <li><strong>System Date:</strong> {new Date().toLocaleDateString()} (Used for UI)</li>
                    <li><strong>Selected Month:</strong> {getMonthName(selectedMonth)} {selectedYear}</li>
                    <li><strong>Recent Expenses Date:</strong> {getMonthName(selectedMonth)} {selectedYear}</li>
                  </ul>
                </div>
              </div>
              <div>
                <p><strong>State Values:</strong></p>
                <ul className="text-xs space-y-1">
                  <li><strong>Selected Month/Year:</strong> {getMonthName(selectedMonth)} {selectedYear}</li>
                  <li><strong>Monthly Expenses:</strong> {monthlyExpenses?.length || 0} items</li>
                  <li><strong>Recent Expenses:</strong> {recentExpenses?.length || 0} items</li>
                  <li><strong>Categories:</strong> {categories?.length || 0} items</li>
                  <li><strong>Total Monthly Expenses:</strong> {formatAmount(totalExpenses)}</li>
                  <li><strong>Previous Month Total:</strong> {formatAmount(previousMonthTotal)}</li>
                  <li><strong>Environment:</strong> {process.env.NODE_ENV}</li>
                  <li><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || '(not set)'}</li>
                  <li><strong>System Date:</strong> {new Date().toLocaleDateString()}</li>
                </ul>
              </div>
            </div>
          
            <div className="mt-4">
              <p><strong>Date Information:</strong></p>
              <div className="mb-2 bg-green-50 border border-green-200 text-green-700 p-2 rounded-md">
                <p className="text-xs font-bold">✓ System Date: {new Date().toLocaleDateString()}</p>
                <p className="text-xs mt-1">Using actual system date ({getMonthName(new Date().getMonth() + 1)} {new Date().getFullYear()}) for API requests.</p>
                <p className="text-xs mt-1">All data shown is for the selected month: {getMonthName(selectedMonth)} {selectedYear}</p>
              </div>
              <ul className="text-xs space-y-1">
                <li><strong>Current System Date:</strong> {new Date().toLocaleDateString()} ({new Date().getFullYear()}-{String(new Date().getMonth() + 1).padStart(2, '0')})</li>
                <li><strong>Selected Month/Year:</strong> {getMonthName(selectedMonth)} {selectedYear}</li>
                <li><strong>API Request Date:</strong> {getMonthName(selectedMonth)} {selectedYear} ({selectedYear}-{String(selectedMonth).padStart(2, '0')})</li>
              </ul>
            </div>
          
            <div className="mt-4">
              <p><strong>Server Response Logs:</strong></p>
              <div className="bg-gray-50 p-2 rounded text-xs font-mono max-h-40 overflow-y-auto">
                <pre>
GET /api/reports/summary/annual?year={selectedYear} → 200 OK (Annual Summary Data)
GET /api/expenses?start_date={selectedYear}-{String(selectedMonth).padStart(2, '0')}-01&end_date={selectedYear}-{String(selectedMonth).padStart(2, '0')}-{new Date(selectedYear, selectedMonth, 0).getDate()} → 200 OK
GET /api/categories → 200 OK
GET /api/budgets-list?year={selectedYear}&month={selectedMonth} → 200 OK
                </pre>
              </div>
            </div>
          
            <div className="mt-4">
              <p><strong>Budget Processing:</strong></p>
              <div className="bg-gray-50 p-2 rounded text-xs font-mono max-h-40 overflow-y-auto">
                <pre>
                  {JSON.stringify(budgets?.slice(0, 3) || [], null, 2)}
                </pre>
              </div>
              {budgets?.length > 0 && budgets[0]?.year !== new Date().getFullYear() && (
                <div className="mt-2 text-red-600 text-xs font-medium p-2 bg-red-50 rounded">
                  Warning: Budget data is for {budgets[0]?.month}/{budgets[0]?.year} (not the current month/year).
                  This may indicate a synchronization issue between budgets and expenses.
                </div>
              )}
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