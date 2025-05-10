import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Calendar, ChevronLeft, DollarSign, Save, Trash2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { expenseAPI, categoryAPI } from '@/lib/api'
import { useCurrency } from '@/hooks/useCurrency'
import { supportedCurrencies } from '@/lib/utils/currencyUtils'

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

interface Category {
  id: number;
  name: string;
  color: string;
  description?: string;
}

interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
  category_id: number;
  category: {
    id: number;
    name: string;
    color: string;
  };
  notes?: string;
  currency: string;
}

export default function EditExpensePage() {
  const { user } = useAuth()
  const router = useRouter()
  const { id } = router.query
  const expenseId = typeof id === 'string' ? parseInt(id) : null
  const { preferredCurrency } = useCurrency()
  
  const [expense, setExpense] = useState<Expense | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: '',
      amount: '',
      date: new Date().toISOString().substring(0, 10),
      category_id: '',
      notes: '',
      currency: preferredCurrency,
    },
  })
  
  useEffect(() => {
    if (!expenseId) return
    
    const fetchExpenseAndCategories = async () => {
      try {
        setLoading(true)
        
        // Fetch categories first
        const fetchedCategories = await categoryAPI.getAllCategories()
        if (Array.isArray(fetchedCategories)) {
          setCategories(fetchedCategories)
        }
        
        // Then fetch the expense
        const fetchedExpense = await expenseAPI.getExpense(expenseId)
        setExpense(fetchedExpense)
        
        // Populate the form with expense data
        setValue('description', fetchedExpense.description)
        setValue('amount', fetchedExpense.amount.toString())
        setValue('date', fetchedExpense.date)
        setValue('category_id', fetchedExpense.category_id.toString())
        setValue('notes', fetchedExpense.notes || '')
        setValue('currency', fetchedExpense.currency || preferredCurrency)
        
      } catch (err: any) {
        console.error('Error fetching expense:', err)
        setError('Failed to load expense details. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchExpenseAndCategories()
  }, [expenseId, setValue, preferredCurrency])
  
  useEffect(() => {
    if (expense) {
      reset({
        description: expense.description,
        amount: expense.amount.toString(),
        date: expense.date,
        category_id: expense.category_id.toString(),
        notes: expense.notes || '',
        currency: expense.currency || preferredCurrency
      });
    }
  }, [expense, reset, preferredCurrency]);
  
  const onSubmit = async (data: ExpenseFormValues) => {
    if (!expenseId) return
    
    setSubmitting(true)
    setError('')
    
    try {
      const response = await expenseAPI.updateExpense(expenseId, {
        description: data.description,
        amount: parseFloat(data.amount),
        date: data.date,
        category_id: parseInt(data.category_id),
        notes: data.notes,
        currency: data.currency
      })
      
      // Redirect back to expenses list
      router.push('/expenses')
    } catch (err: any) {
      console.error('Error updating expense:', err)
      setError(err.response?.data?.detail || 'Failed to update expense')
    } finally {
      setSubmitting(false)
    }
  }
  
  const handleDelete = async () => {
    if (!expenseId) return
    
    if (!deleteConfirm) {
      setDeleteConfirm(true)
      return
    }
    
    setSubmitting(true)
    
    try {
      await expenseAPI.deleteExpense(expenseId)
      router.push('/expenses')
    } catch (err: any) {
      console.error('Error deleting expense:', err)
      setError(err.response?.data?.detail || 'Failed to delete expense')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center text-gray-600"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Expenses
          </Button>
        </div>

        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-5 border-b border-green-700 flex justify-between items-center text-white">
            <div>
              <h3 className="text-xl leading-6 font-medium">
                Edit Expense
              </h3>
              <p className="mt-1 text-sm text-green-100">
                Update the details of your expense
              </p>
            </div>
            {expense && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDelete}
                disabled={submitting}
                className="flex items-center bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                {deleteConfirm ? "Confirm Delete" : "Delete"}
              </Button>
            )}
          </div>
          
          {loading ? (
            <div className="px-6 py-5 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent"></div>
              <p className="mt-2 text-sm text-gray-500">Loading expense details...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
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
                    className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      errors.description ? 'border-red-300' : ''
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
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      id="amount"
                      type="number"
                      step="0.01"
                      className={`block w-full pl-7 pr-12 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        errors.amount ? 'border-red-300' : ''
                      }`}
                      placeholder="0.00"
                      {...register('amount')}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">USD</span>
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
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="date"
                      type="date"
                      className={`block w-full pl-10 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        errors.date ? 'border-red-300' : ''
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
                  <select
                    id="category_id"
                    className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      errors.category_id ? 'border-red-300' : ''
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
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    {...register('notes')}
                  />
                </div>
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <label 
                  htmlFor="currency" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Currency
                </label>
                <select
                  id="currency"
                  {...register('currency')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  {supportedCurrencies.map(currency => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
                {errors.currency && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.currency.message}
                  </p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/expenses')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {submitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-e-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Expense
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
} 