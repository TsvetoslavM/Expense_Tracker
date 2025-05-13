import { useState, useEffect } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/router';

import { useAuth } from '@/context/AuthContext';
import { budgetAPI, categoryAPI } from '@/lib/api';
import { useCurrency } from '@/hooks/useCurrency';
import { 
  ArrowLeft, 
  SaveIcon, 
  Calendar, 
  PiggyBank, 
  Tag, 
  Wallet, 
  CheckCircle,
  XCircle,
  Trash2
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Define interfaces
interface Category {
  id: number;
  name: string;
  color: string;
  description?: string;
}

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

export default function EditBudgetPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const { preferredCurrency, formatAmount } = useCurrency();
  
  // Form state
  const [amount, setAmount] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [period, setPeriod] = useState<string>('monthly');
  
  // Other state
  const [budget, setBudget] = useState<Budget | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Load budget and categories on mount
  useEffect(() => {
    // If not authenticated, redirect to login
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    
    // If we have the user and the budget ID, fetch data
    if (user && id) {
      fetchData();
    }
  }, [user, authLoading, id]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch categories
      const fetchedCategories = await categoryAPI.getAllCategories();
      if (Array.isArray(fetchedCategories)) {
        setCategories(fetchedCategories);
      }
      
      // Fetch the budget
      const budgetId = parseInt(id as string);
      const fetchedBudget = await budgetAPI.getBudget(budgetId);
      
      if (fetchedBudget) {
        setBudget(fetchedBudget);
        
        // Set form values
        setAmount(fetchedBudget.amount);
        setCategoryId(fetchedBudget.category_id);
        setYear(fetchedBudget.year);
        setMonth(fetchedBudget.month || new Date().getMonth() + 1);
        setPeriod(fetchedBudget.period || 'monthly');
      } else {
        setError('Budget not found');
      }
    } catch (err) {
      console.error('Error fetching budget data:', err);
      setError('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryId) {
      setError('Please select a category');
      return;
    }
    
    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      const budgetData = {
        amount,
        category_id: categoryId,
        year,
        month,
        period,
        currency: preferredCurrency
      };
      
      const budgetId = parseInt(id as string);
      await budgetAPI.updateBudget(budgetId, budgetData);
      setSuccess(true);
      window.scrollTo(0, 0);
      
      // Redirect after brief success message
      setTimeout(() => {
        router.push('/budgets');
      }, 1500);
    } catch (err) {
      console.error('Error updating budget:', err);
      setError('Failed to update budget');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }
    
    try {
      setSubmitting(true);
      const budgetId = parseInt(id as string);
      await budgetAPI.deleteBudget(budgetId);
      
      router.push('/budgets');
    } catch (err) {
      console.error('Error deleting budget:', err);
      setError('Failed to delete budget');
      setSubmitting(false);
    }
  };
  
  // Get current month name
  const getMonthName = (month: number) => {
    return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' });
  };
  
  // Find the currently selected category
  const selectedCategory = categories.find(c => c.id === categoryId);
  
  // Get currency symbol based on preferred currency
  const getCurrencySymbol = () => {
    switch(preferredCurrency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      default: return '$';
    }
  };
  
  // If auth is loading, show a loading indicator
  if (authLoading) {
    return <div className='flex h-screen items-center justify-center'>
      <div className='h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent'></div>
    </div>;
  }
  
  // If no user, don't render the page (will redirect)
  if (!user) {
    return null;
  }
  
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header section with gradient background */}
      <div className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
          <div className='flex flex-col'>
            <Link href='/budgets' className='inline-flex items-center text-sm text-blue-100 hover:text-white transition-colors'>
              <ArrowLeft className='h-4 w-4 mr-1' />
              Back to Budgets
            </Link>
            <h1 className='text-3xl font-bold mt-4'>Edit Budget</h1>
            <p className='mt-1 text-blue-100'>
              Update your spending limits to stay on track
            </p>
          </div>
        </div>
      </div>
      
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {success && (
          <div className='mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-lg flex items-center'>
            <CheckCircle className='h-5 w-5 mr-2 flex-shrink-0' />
            <p>Budget updated successfully! Redirecting to budget list...</p>
          </div>
        )}
        
        {error && (
          <div className='mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-lg flex items-center'>
            <XCircle className='h-5 w-5 mr-2 flex-shrink-0' />
            <p>{error}</p>
          </div>
        )}
        
        {loading ? (
          <Card className='shadow'>
            <CardContent className='pt-6 space-y-4'>
              <Skeleton className='h-8 w-1/2' />
              <Skeleton className='h-12 w-full' />
              <Skeleton className='h-12 w-full' />
              <Skeleton className='h-12 w-full' />
              <Skeleton className='h-12 w-3/4' />
            </CardContent>
          </Card>
        ) : budget ? (
          <Card className='shadow'>
            <form onSubmit={handleSubmit}>
              <CardContent className='pt-6 space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-1'>
                    <label htmlFor='category' className='block text-sm font-medium text-gray-700 flex items-center'>
                      <Tag className='h-4 w-4 mr-1.5 text-gray-500' />
                      Category
                    </label>
                    <select
                      id='category'
                      value={categoryId}
                      onChange={(e) => setCategoryId(parseInt(e.target.value))}
                      className='block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                      required
                    >
                      <option value=''>Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedCategory && (
                    <div className='flex items-center h-full'>
                      <div className='flex items-center space-x-3'>
                        <div 
                          className='w-8 h-8 rounded-full'
                          style={{ backgroundColor: selectedCategory.color }}
                        />
                        <div>
                          <div 
                            className='px-3 py-1 rounded-full text-sm font-medium'
                            style={{ 
                              backgroundColor: `${selectedCategory.color}20`,
                              color: selectedCategory.color
                            }}
                          >
                            {selectedCategory.name}
                          </div>
                          {selectedCategory.description && (
                            <p className='text-xs text-gray-500 mt-1'>{selectedCategory.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <label htmlFor='amount' className='block text-sm font-medium text-gray-700 flex items-center'>
                    <Wallet className='h-4 w-4 mr-1.5 text-gray-500' />
                    Budget Amount
                  </label>
                  <div className='mt-1 relative rounded-md shadow-sm'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <span className='text-gray-500 sm:text-sm'>{getCurrencySymbol()}</span>
                    </div>
                    <input
                      type='number'
                      name='amount'
                      id='amount'
                      min='0'
                      step='0.01'
                      value={amount || ''}
                      onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                      className='block w-full pl-7 pr-12 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                      placeholder='0.00'
                      required
                    />
                    <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
                      <span className='text-gray-500 sm:text-sm'>{preferredCurrency}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor='period' className='block text-sm font-medium text-gray-700 flex items-center'>
                    <PiggyBank className='h-4 w-4 mr-1.5 text-gray-500' />
                    Budget Period
                  </label>
                  <select
                    id='period'
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                  >
                    <option value='monthly'>Monthly</option>
                    <option value='yearly'>Yearly</option>
                  </select>
                </div>
                
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-1'>
                    <label htmlFor='month' className='block text-sm font-medium text-gray-700 flex items-center'>
                      <Calendar className='h-4 w-4 mr-1.5 text-gray-500' />
                      Month
                    </label>
                    <select
                      id='month'
                      value={month}
                      onChange={(e) => setMonth(parseInt(e.target.value))}
                      className='block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>{getMonthName(m)}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className='space-y-1'>
                    <label htmlFor='year' className='block text-sm font-medium text-gray-700 flex items-center'>
                      <Calendar className='h-4 w-4 mr-1.5 text-gray-500' />
                      Year
                    </label>
                    <select
                      id='year'
                      value={year}
                      onChange={(e) => setYear(parseInt(e.target.value))}
                      className='block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                    >
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 + i).map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {period === 'monthly' && (
                  <div className='flex items-center p-4 bg-blue-50 rounded-lg'>
                    <div className='mr-4 flex-shrink-0'>
                      <Calendar className='h-6 w-6 text-blue-600' />
                    </div>
                    <div>
                      <h4 className='text-sm font-medium text-blue-700'>Budget Timeline</h4>
                      <p className='text-sm text-blue-600'>
                        This budget will apply to <strong>{getMonthName(month)} {year}</strong>
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className='flex justify-between pt-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleDelete}
                  className='text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600'
                  disabled={submitting}
                >
                  <Trash2 className='h-4 w-4 mr-2' />
                  Delete Budget
                </Button>
                
                <div className='flex space-x-4'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => router.push('/budgets')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type='submit'
                    disabled={submitting}
                    className='inline-flex items-center bg-blue-600 hover:bg-blue-700'
                  >
                    {submitting ? (
                      <>
                        <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-e-transparent'></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <SaveIcon className='h-4 w-4 mr-2' />
                        Update Budget
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        ) : (
          <Card className='text-center py-10 px-6'>
            <div className='flex flex-col items-center'>
              <XCircle className='h-12 w-12 text-red-500 mb-4' />
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>Budget Not Found</h3>
              <p className='text-gray-500 max-w-md mb-8'>
                We couldn't find the budget you're looking for. It may have been deleted or you may have followed an invalid link.
              </p>
              <Button onClick={() => router.push('/budgets')}>
                Return to Budget List
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
} 