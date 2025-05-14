import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { 
  PlusCircle, 
  Search, 
  Calendar, 
  Filter, 
  ChevronDown, 
  Edit, 
  Trash2, 
  DollarSign, 
  CreditCard,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import axios from 'axios'
import { useAuth } from '@/context/AuthContext'
import { expenseAPI, categoryAPI } from '@/lib/api'
import { useCurrency } from '@/hooks/useCurrency'
import PageContainer from '@/components/layout/PageContainer'

// Define Expense interface
interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: {
    name: string;
    color: string;
  };
  currency: string;
}

// Mock data while connecting to real API
const MOCK_EXPENSES = [
  { id: 1, description: 'Groceries', amount: 82.45, date: '2025-04-25', category: { name: 'Food', color: '#00C49F' }, currency: 'USD' },
  { id: 2, description: 'Electricity bill', amount: 94.20, date: '2025-04-22', category: { name: 'Utilities', color: '#0088FE' }, currency: 'USD' },
  { id: 3, description: 'Coffee shop', amount: 12.50, date: '2025-04-20', category: { name: 'Food', color: '#00C49F' }, currency: 'USD' },
  { id: 4, description: 'Gas', amount: 45.80, date: '2025-04-18', category: { name: 'Transportation', color: '#FFBB28' }, currency: 'USD' },
  { id: 5, description: 'Movie tickets', amount: 24.00, date: '2025-04-15', category: { name: 'Entertainment', color: '#FF8042' }, currency: 'USD' },
  { id: 6, description: 'Online course', amount: 199.99, date: '2025-04-14', category: { name: 'Education', color: '#8884D8' }, currency: 'USD' },
  { id: 7, description: 'Restaurant dinner', amount: 68.30, date: '2025-04-10', category: { name: 'Food', color: '#00C49F' }, currency: 'USD' },
  { id: 8, description: 'Phone bill', amount: 45.00, date: '2025-04-05', category: { name: 'Utilities', color: '#0088FE' }, currency: 'USD' },
  { id: 9, description: 'New shoes', amount: 79.99, date: '2025-04-03', category: { name: 'Shopping', color: '#FF8042' }, currency: 'USD' },
  { id: 10, description: 'Gym membership', amount: 50.00, date: '2025-04-01', category: { name: 'Health', color: '#0088FE' }, currency: 'USD' },
]

// Mock categories
const MOCK_CATEGORIES = [
  { id: 1, name: 'Food', color: '#00C49F' },
  { id: 2, name: 'Transportation', color: '#FFBB28' },
  { id: 3, name: 'Utilities', color: '#0088FE' },
  { id: 4, name: 'Entertainment', color: '#FF8042' },
  { id: 5, name: 'Shopping', color: '#FF8042' },
  { id: 6, name: 'Education', color: '#8884D8' },
  { id: 7, name: 'Health', color: '#0088FE' },
]

export default function ExpensesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { preferredCurrency, convertAmount, formatAmount, convertAndFormat } = useCurrency()
  const [expenses, setExpenses] = useState(MOCK_EXPENSES)
  const [categories, setCategories] = useState(MOCK_CATEGORIES)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [minAmount, setMinAmount] = useState<number | null>(null)
  const [maxAmount, setMaxAmount] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState('date') // 'date', 'amount', 'description'
  const [sortOrder, setSortOrder] = useState('desc') // 'asc', 'desc'
  
  // Filter dropdown visibility
  const [showFilters, setShowFilters] = useState(false)
  
  // Add new state for categories loading
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  
  useEffect(() => {
    // Immediately ensure we have categories
    ensureCategoriesExist();
    
    // Try to load cached categories first
    const cachedCategories = localStorage.getItem('userCategories')
    if (cachedCategories) {
      try {
        const parsedCategories = JSON.parse(cachedCategories)
        if (Array.isArray(parsedCategories) && parsedCategories.length > 0) {
          setCategories(parsedCategories)
        }
      } catch (e) {
        console.error("Error parsing cached categories:", e)
      }
    }

    // Fetch data from API
    async function fetchData() {
      try {
        setLoading(true)
        
        // Check if token exists for API authentication
        const token = localStorage.getItem('accessToken')
        if (!token) {
          console.error('No authentication token found')
          setError('Authentication error: Please log in again')
          setLoading(false)
          return
        }
        
        // Build query parameters for filtering
        const params: any = {}
        if (searchQuery) params.search = searchQuery
        if (selectedCategory) params.category_id = selectedCategory
        
        // Date handling - validate and use the actual dates
        if (startDate) {
          if (isValidDateFormat(startDate)) {
            params.start_date = startDate;
          } else {
            console.warn(`Invalid start date format: ${startDate}`);
            setError(`Invalid start date format. Please use YYYY-MM-DD format.`);
          }
        }
        
        if (endDate) {
          if (isValidDateFormat(endDate)) {
            params.end_date = endDate;
          } else {
            console.warn(`Invalid end date format: ${endDate}`);
            setError(`Invalid end date format. Please use YYYY-MM-DD format.`);
          }
        }
        
        if (minAmount !== null) params.min_amount = minAmount
        if (maxAmount !== null) params.max_amount = maxAmount
        
        console.log('Fetching expenses with params:', params);
        console.log('Date validation:', {
          startDate,
          endDate,
          searchQuery
        });
        
        console.log('Using token:', token.substring(0, 10) + '...')
        
        try {
          // Fetch expenses from API
          const fetchedExpenses = await expenseAPI.getAllExpenses(params)
          console.log('Fetched expenses:', fetchedExpenses)
          
          if (Array.isArray(fetchedExpenses)) {
            setExpenses(fetchedExpenses)
          } else {
            console.error('Received non-array expenses data:', fetchedExpenses)
            setExpenses([]) // Set empty array as fallback
          }
          
          // Fetch categories from API
          const fetchedCategories = await categoryAPI.getAllCategories()
          console.log('Fetched categories:', fetchedCategories)
          
          if (Array.isArray(fetchedCategories)) {
            setCategories(fetchedCategories)
            // Cache categories in localStorage
            localStorage.setItem('userCategories', JSON.stringify(fetchedCategories))
          } else {
            console.error('Received non-array categories data:', fetchedCategories)
          }
          
          setLoading(false)
          // Clear any previous error message if the request was successful
          setError('')
        } catch (apiError: any) {
          console.error('API request error:', apiError)
          console.error('Request details:', {
            url: apiError.config?.url,
            method: apiError.config?.method,
            headers: apiError.config?.headers,
            status: apiError.response?.status,
            statusText: apiError.response?.statusText
          })
          console.error('Error data:', apiError.response?.data)
          
          // Set more user-friendly error message based on the status code
          if (apiError.response?.status === 422) {
            setError('There was a problem with the date format. Please ensure your dates are valid.')
            
            // Try again without the date parameters if they're causing issues
            try {
              const safeParams = { ...params };
              delete safeParams.start_date;
              delete safeParams.end_date;
              
              console.log('Retrying with safe parameters (no dates):', safeParams);
              const safeExpenses = await expenseAPI.getAllExpenses(safeParams);
              
              if (Array.isArray(safeExpenses)) {
                setExpenses(safeExpenses);
                setError('Date filters were ignored due to format issues. Showing all available expenses.');
              }
            } catch (retryError) {
              console.error('Retry also failed:', retryError);
            }
          } else {
            setError(apiError.response?.data?.detail || 'Failed to fetch data from server')
          }
          setLoading(false)
        }
      } catch (err: any) {
        console.error('Error fetching expenses:', err)
        const errorDetails = err.response?.data || err.message
        console.error('Error details:', errorDetails)
        setError('Failed to load expenses')
        setLoading(false)
      }
    }
    
    fetchData()
  }, [searchQuery, selectedCategory, startDate, endDate, minAmount, maxAmount, sortBy, sortOrder])
  
  // New function to ensure categories exist
  const ensureCategoriesExist = async () => {
    console.log('Checking for existing categories...');
    try {
      const categories = await categoryAPI.ensureCategories();
      console.log('Categories returned from API:', categories);
      
      if (Array.isArray(categories)) {
        console.log(`Found ${categories.length} categories`);
        
        // Log each category to verify their structure
        categories.forEach((category, index) => {
          console.log(`Category ${index + 1}:`, {
            id: category.id,
            name: category.name,
            color: category.color
          });
        });
        
        setCategories(categories);
        
        // Store the categories in local storage for persistence
        localStorage.setItem('userCategories', JSON.stringify(categories));
      } else {
        console.error('Categories returned from API are not in an array format:', categories);
      }
    } catch (error) {
      console.error('Error ensuring categories exist:', error);
      // Don't set error state here to prevent blocking UI
    }
  };
  
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseAPI.deleteExpense(id)
        
        // Update local state by removing the deleted expense
        setExpenses(expenses.filter(expense => expense.id !== id))
      } catch (err: any) {
        console.error('Error deleting expense:', err)
        setError('Failed to delete expense')
      }
    }
  }
  
  // New function to specifically handle search without other filters
  const handleSearchOnly = async () => {
    if (!searchQuery.trim()) {
      return; // Don't do anything if search is empty
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Only use the search parameter, nothing else
      const searchParams = { search: searchQuery.trim() };
      console.log('Performing search-only query:', searchParams);
      
      const results = await expenseAPI.getAllExpenses(searchParams);
      if (Array.isArray(results)) {
        setExpenses(results);
        console.log(`Found ${results.length} results for search: "${searchQuery}"`);
      } else {
        setExpenses([]);
        console.error('Received non-array search results:', results);
      }
    } catch (err) {
      console.error('Search-only error:', err);
      setError('Search failed. Please try again or adjust your search term.');
    } finally {
      setLoading(false);
    }
  };
  
  // Utility function to check if a date string is valid
  const isValidDateFormat = (dateString: string | null): boolean => {
    if (!dateString) return true; // null is considered valid (no filter)
    
    // Check if it matches YYYY-MM-DD format
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    // Check if it's a valid date
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };
  
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory(null)
    setStartDate(null)
    setEndDate(null)
    setMinAmount(null)
    setMaxAmount(null)
    setSortBy('date')
    setSortOrder('desc')
  }

  // Add a function to create default categories
  const createDefaultCategories = async () => {
    try {
      setCategoriesLoading(true)
      console.log('Creating default categories...')
      
      const response = await categoryAPI.createDefaultCategories()
      console.log('Default categories created:', response)
      
      // Update local state with new categories
      if (Array.isArray(response)) {
        setCategories(response)
        // Cache the categories in localStorage
        localStorage.setItem('userCategories', JSON.stringify(response))
      }
      setError('')
    } catch (err: any) {
      console.error('Error creating default categories:', err)
      setError('Failed to create default categories')
    } finally {
      setCategoriesLoading(false)
    }
  }

  return (
    <PageContainer>
      <div className="mb-8">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl shadow-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <CreditCard className="h-8 w-8 mr-3" />
            Expenses
          </h1>
          <p className="text-green-100 max-w-3xl">Track and manage your daily expenses across multiple categories and currencies.</p>
          
          <div className="mt-4 flex justify-end space-x-3">
            <Button 
              variant="outline"
              onClick={createDefaultCategories}
              disabled={categoriesLoading}
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 shadow-sm"
            >
              {categoriesLoading ? 'Creating...' : 'Add Test Categories'}
            </Button>
            <Button 
              onClick={() => router.push('/expenses/new')}
              className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="mt-6 bg-white shadow-md rounded-lg p-4 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="w-full md:w-1/2 lg:w-2/3">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchOnly()}
                className="block w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                placeholder="Search expenses description..."
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <button 
                  onClick={handleSearchOnly}
                  className="h-full px-4 py-2 text-sm bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 lg:w-1/3 flex flex-row space-x-2">
            <Button
              variant="outline"
              className="flex-1 border-gray-300 hover:bg-gray-50 transition-colors duration-200"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2 text-gray-500" />
              Filters
              <ChevronDown className={`ml-2 h-4 w-4 transform transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                onClick={() => {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                }}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md transition-all duration-200"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="description">Description</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Expanded filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md transition-all duration-200"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate || ''}
                  onChange={(e) => {
                    const dateVal = e.target.value;
                    if (!dateVal || isValidDateFormat(dateVal)) {
                      setStartDate(dateVal || null);
                    } else {
                      // Invalid date - don't update state but show a warning
                      console.warn(`Invalid date input: ${dateVal}`);
                    }
                  }}
                  className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${!startDate || isValidDateFormat(startDate) ? '' : 'border-red-300 bg-red-50'}`}
                />
                {startDate && !isValidDateFormat(startDate) && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 mt-1 text-red-500">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                )}
              </div>
              {startDate && !isValidDateFormat(startDate) && (
                <p className="mt-1 text-xs text-red-500">Invalid date format. Use YYYY-MM-DD</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate || ''}
                  onChange={(e) => {
                    const dateVal = e.target.value;
                    if (!dateVal || isValidDateFormat(dateVal)) {
                      setEndDate(dateVal || null);
                    } else {
                      // Invalid date - don't update state but show a warning
                      console.warn(`Invalid date input: ${dateVal}`);
                    }
                  }}
                  className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${!endDate || isValidDateFormat(endDate) ? '' : 'border-red-300 bg-red-50'}`}
                />
                {endDate && !isValidDateFormat(endDate) && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 mt-1 text-red-500">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                )}
              </div>
              {endDate && !isValidDateFormat(endDate) && (
                <p className="mt-1 text-xs text-red-500">Invalid date format. Use YYYY-MM-DD</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Min Amount</label>
              <input
                type="number"
                value={minAmount || ''}
                onChange={(e) => setMinAmount(e.target.value ? Number(e.target.value) : null)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Amount</label>
              <input
                type="number"
                value={maxAmount || ''}
                onChange={(e) => setMaxAmount(e.target.value ? Number(e.target.value) : null)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Filters
              </Button>
            </div>
            
            {/* Display active filters summary */}
            <div className="md:col-span-2 lg:col-span-3 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Active Filters:</h3>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  size="sm"
                  className="hover:bg-gray-50 transition-colors duration-200 text-xs h-7"
                >
                  Clear All
                </Button>
              </div>
              
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedCategory && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Category: {categories.find(c => c.id === selectedCategory)?.name}
                  </span>
                )}
                
                {startDate && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${startDate > '2024-02-29' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                    From: {startDate > '2024-02-29' ? '2024-02-01 (adjusted)' : startDate}
                  </span>
                )}
                
                {endDate && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${endDate > '2024-02-29' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                    To: {endDate > '2024-02-29' ? '2024-02-29 (adjusted)' : endDate}
                  </span>
                )}
                
                {minAmount !== null && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Min: {formatAmount(minAmount)}
                  </span>
                )}
                
                {maxAmount !== null && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Max: {formatAmount(maxAmount)}
                  </span>
                )}
                
                {searchQuery && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Search: "{searchQuery}"
                  </span>
                )}
                
                {!searchQuery && !selectedCategory && !startDate && !endDate && minAmount === null && maxAmount === null && (
                  <span className="text-xs text-gray-500">No active filters</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Expenses table */}
      <div className="mt-6">
        {/* Search debugging information */}
        {searchQuery && expenses.length === 0 && !loading && !error ? (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-5 py-4 rounded-lg shadow-sm">
            <div className="flex">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Search Information</p>
                <p className="text-sm mt-1">
                  You searched for "{searchQuery}" but no matching expenses were found.
                </p>
                <p className="text-sm mt-1">
                  The search looks for matches in the expense description.
                </p>
                <p className="text-sm mt-1">
                  <button onClick={clearFilters} className="text-blue-600 underline">Clear search</button>
                </p>
              </div>
            </div>
          </div>
        ) : null}
        
        {loading ? (
          <div className="bg-white shadow-md rounded-lg p-8 text-center border border-gray-100">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-3 text-sm text-gray-500">Loading expenses...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-lg shadow-sm">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{error}</p>
                {error.includes('date') && (
                  <div className="mt-2">
                    <p className="text-sm">Try these solutions:</p>
                    <ul className="list-disc pl-5 text-sm mt-1 space-y-1">
                      <li>Clear your date filters and try again</li>
                      <li>Ensure your dates are in the correct YYYY-MM-DD format</li>
                      <li>Use the search function directly without date filters</li>
                    </ul>
                    <div className="mt-3 flex space-x-3">
                      <button 
                        onClick={clearFilters}
                        className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                      >
                        Clear All Filters
                      </button>
                      {searchQuery && (
                        <button 
                          onClick={handleSearchOnly}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                        >
                          Search Without Filters
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-8 text-center border border-gray-100">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-500 mb-3">
              <CreditCard className="h-6 w-6" />
            </div>
            <p className="text-gray-500 mb-4">No expenses found. Add your first expense to get started!</p>
            <Button 
              onClick={() => router.push('/expenses/new')}
              className="shadow-sm hover:shadow-md transition-all duration-200 bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
        ) : (
          <div className="bg-white shadow-md overflow-hidden rounded-lg border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-blue-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {expense.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-200"
                        style={{ 
                          backgroundColor: `${expense.category.color}20`, 
                          color: expense.category.color 
                        }}
                      >
                        {expense.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-medium">
                      {expense.currency !== preferredCurrency 
                        ? `${convertAndFormat(expense.amount, expense.currency)}`
                        : formatAmount(expense.amount)
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => router.push(`/expenses/${expense.id}`)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition-colors duration-200"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageContainer>
  )
}