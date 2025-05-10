import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Calendar, ChevronLeft, DollarSign, Save, PlusCircle, AlertCircle } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '@/context/AuthContext'
import { expenseAPI, categoryAPI } from '@/lib/api'
import { useCurrency } from '@/hooks/useCurrency'
import { supportedCurrencies } from '@/lib/utils/currencyUtils'

// Mock categories while connecting to real API
const MOCK_CATEGORIES = [
  { id: 1, name: 'Food', color: '#00C49F' },
  { id: 2, name: 'Transportation', color: '#FFBB28' },
  { id: 3, name: 'Utilities', color: '#0088FE' },
  { id: 4, name: 'Entertainment', color: '#FF8042' },
  { id: 5, name: 'Shopping', color: '#FF8042' },
  { id: 6, name: 'Education', color: '#8884D8' },
  { id: 7, name: 'Health', color: '#0088FE' },
]

// Form validation schema
const expenseSchema = z.object({
  description: z
    .string()
    .min(1, 'Description is required')
    .max(100, 'Description must be 100 characters or less'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Amount must be a positive number',
    }),
  date: z.string().min(1, 'Date is required'),
  category_id: z
    .string()
    .min(1, 'Category is required')
    .refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
      message: 'Please select a category',
    }),
  notes: z.string().optional(),
  currency: z.string().min(1, 'Currency is required')
})

type ExpenseFormValues = z.infer<typeof expenseSchema>

export default function NewExpensePage() {
  const { user } = useAuth()
  const router = useRouter()
  const { preferredCurrency } = useCurrency()
  const [categories, setCategories] = useState(MOCK_CATEGORIES)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: '',
      amount: '',
      date: new Date().toISOString().substring(0, 10), // Today's date in YYYY-MM-DD format
      category_id: '',
      notes: '',
      currency: preferredCurrency,
    },
  })
  
  useEffect(() => {
    // Immediately ensure we have categories
    ensureCategoriesExist();
    
    // Existing code to try to load cached categories first
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

    // Fetch categories from API
    async function fetchCategories() {
      try {
        setLoading(true)
        const fetchedCategories = await categoryAPI.getAllCategories()
        console.log('Fetched categories:', fetchedCategories)
        
        if (Array.isArray(fetchedCategories)) {
          setCategories(fetchedCategories)
          // Cache categories in localStorage
          localStorage.setItem('userCategories', JSON.stringify(fetchedCategories))
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError('Failed to load categories')
      } finally {
        setLoading(false)
      }
    }
    
    fetchCategories()
  }, [])
  
  // New function to ensure categories exist
  const ensureCategoriesExist = async () => {
    try {
      console.log('Ensuring categories exist...');
      const existingCategories = await categoryAPI.ensureCategories();
      console.log('Categories verified:', existingCategories);
      
      if (Array.isArray(existingCategories)) {
        setCategories(existingCategories);
        localStorage.setItem('userCategories', JSON.stringify(existingCategories));
      }
    } catch (err) {
      console.error('Error ensuring categories exist:', err);
    }
  };
  
  const onSubmit = async (data: ExpenseFormValues) => {
    setLoading(true)
    setError('')
    
    try {
      console.log('Submitting expense data:', {
        description: data.description,
        amount: parseFloat(data.amount),
        date: data.date,
        category_id: parseInt(data.category_id),
        notes: data.notes,
        currency: data.currency
      })
      
      // Check if token exists for API authentication
      const token = localStorage.getItem('accessToken')
      if (!token) {
        console.error('No authentication token found')
        setError('Authentication error: Please try logging in again')
        setLoading(false)
        return
      }

      // Convert string values to appropriate types
      try {
        const response = await expenseAPI.createExpense({
          description: data.description,
          amount: parseFloat(data.amount),
          date: data.date,
          category_id: parseInt(data.category_id),
          notes: data.notes,
          currency: data.currency
        })
        
        console.log('API response:', response)
        
        // Verify that the expense was created and has an ID
        if (response && response.id) {
          // Add a small delay before redirecting to ensure data is saved
          setTimeout(() => {
            // Redirect back to expenses list
            router.push('/expenses')
          }, 500)
        } else {
          console.error('Expense created but invalid response:', response)
          setError('Expense was created but the server returned an invalid response')
          setLoading(false)
        }
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
        
        setError(apiError.response?.data?.detail || 'Failed to create expense. Server error.')
        setLoading(false)
      }
    } catch (err: any) {
      console.error('Error creating expense:', err)
      console.error('Error details:', err.response?.data || err.message)
      setError(err.response?.data?.detail || 'Failed to create expense')
      setLoading(false)
    }
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:bg-gray-100 transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Expenses
          </Button>
        </div>

        <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-5 text-white">
            <h3 className="text-xl leading-6 font-bold flex items-center">
              <PlusCircle className="h-5 w-5 mr-2" />
              Add New Expense
            </h3>
            <p className="mt-1 text-sm text-green-100">
              Enter the details of your expense below.
            </p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <div className="mt-1">
                <input
                  id="description"
                  type="text"
                  autoComplete="off"
                  className={`block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 ${
                    errors.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                  }`}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount *
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    className={`block w-full pl-7 pr-12 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 ${
                      errors.amount ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                    }`}
                    placeholder="0.00"
                    {...register('amount')}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">{watch('currency') || preferredCurrency}</span>
                  </div>
                </div>
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date *
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="date"
                    type="date"
                    className={`block w-full pl-10 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 ${
                      errors.date ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                    }`}
                    {...register('date')}
                  />
                </div>
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <div className="mt-1">
                {categories.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-4">
                    <p className="text-sm flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      You don't have any categories yet. Categories are required for expenses.
                    </p>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={createDefaultCategories}
                      disabled={categoriesLoading}
                      className="mt-2 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      {categoriesLoading ? 'Creating...' : 'Create Default Categories'}
                    </Button>
                  </div>
                ) : (
                  <select
                    id="category_id"
                    className={`block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 ${
                      errors.category_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                    }`}
                    {...register('category_id')}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
                {errors.category_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes (Optional)
              </label>
              <div className="mt-1">
                <textarea
                  id="notes"
                  rows={3}
                  className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                  {...register('notes')}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                Currency *
              </label>
              <div className="mt-1">
                <select
                  id="currency"
                  className={`block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 ${
                    errors.currency ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                  }`}
                  {...register('currency')}
                >
                  {supportedCurrencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
                {errors.currency && (
                  <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={loading}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Form
              </Button>
              <Button 
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 shadow-sm hover:shadow-md transition-all duration-200"
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-e-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Save Expense
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 