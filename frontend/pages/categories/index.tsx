import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Calendar,
  X,
  Check,
  Tag,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { categoryAPI } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import PageContainer from '@/components/layout/PageContainer'

// Define Category type
interface Category {
  id: number;
  name: string;
  color: string;
  description?: string;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
}

// Mock categories while connecting to real API
const MOCK_CATEGORIES = [
  { id: 1, name: 'Food', color: '#00C49F', description: 'Groceries, restaurants, and cafes' },
  { id: 2, name: 'Transportation', color: '#FFBB28', description: 'Gas, public transit, and ride shares' },
  { id: 3, name: 'Utilities', color: '#0088FE', description: 'Electricity, water, internet, and phone bills' },
  { id: 4, name: 'Entertainment', color: '#FF8042', description: 'Movies, games, and recreational activities' },
  { id: 5, name: 'Shopping', color: '#FF8042', description: 'Clothing, electronics, and household items' },
  { id: 6, name: 'Education', color: '#8884D8', description: 'Tuition, books, and courses' },
  { id: 7, name: 'Health', color: '#0088FE', description: 'Medical expenses, prescriptions, and fitness' },
]

// Form validation schema
const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be 50 characters or less'),
  description: z
    .string()
    .max(200, 'Description must be 200 characters or less')
    .optional(),
  color: z
    .string()
    .min(1, 'Color is required')
    .regex(/^#([A-Fa-f0-9]{6})$/, 'Must be a valid hex color'),
})

type CategoryFormValues = z.infer<typeof categorySchema>

export default function CategoriesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
  const [error, setError] = useState('')
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#3B82F6',
    },
  })
  
  const selectedColor = watch('color')
  
  useEffect(() => {
    // Load cached categories initially if available
    const cachedCategories = localStorage.getItem('userCategories')
    if (cachedCategories) {
      try {
        const parsedCategories = JSON.parse(cachedCategories)
        console.log('Loaded cached categories:', parsedCategories)
        if (Array.isArray(parsedCategories)) {
          setCategories(parsedCategories)
        }
      } catch (e) {
        console.error('Error parsing cached categories:', e)
      }
    }
    
    // Fetch fresh categories from API
    fetchCategories()
  }, [])
  
  async function fetchCategories() {
    try {
      setLoading(true)
      console.log('Fetching categories from API')
      
      const fetchedCategories = await categoryAPI.getAllCategories()
      console.log('Categories fetched from API:', fetchedCategories)
      
      if (Array.isArray(fetchedCategories)) {
        setCategories(fetchedCategories)
        // Cache the categories
        localStorage.setItem('userCategories', JSON.stringify(fetchedCategories))
      } else {
        console.error('API returned non-array categories:', fetchedCategories)
        setError('Invalid data format received from server')
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError('Failed to load categories')
      // If we have no categories, try to create defaults
      if (categories.length === 0) {
        console.log('No categories available, trying to create defaults')
        await createDefaultCategories()
      }
    } finally {
      setLoading(false)
    }
  }
  
  const createDefaultCategories = async () => {
    try {
      setLoading(true)
      console.log('Creating default categories')
      
      const newCategories = await categoryAPI.createDefaultCategories()
      console.log('Default categories created:', newCategories)
      
      if (Array.isArray(newCategories)) {
        setCategories(newCategories)
        // Cache the categories
        localStorage.setItem('userCategories', JSON.stringify(newCategories))
        alert('Default categories created successfully')
      }
    } catch (err) {
      console.error('Error creating default categories:', err)
      setError('Failed to create default categories')
      alert('Failed to create default categories')
    } finally {
      setLoading(false)
    }
  }
  
  const startAddingCategory = () => {
    setIsAddingCategory(true)
    setEditingCategoryId(null)
    reset()
  }
  
  const startEditingCategory = (category: Category) => {
    setIsAddingCategory(false)
    setEditingCategoryId(category.id)
    setValue('name', category.name)
    setValue('description', category.description || '')
    setValue('color', category.color)
  }
  
  const cancelEditing = () => {
    setIsAddingCategory(false)
    setEditingCategoryId(null)
    reset()
  }
  
  const onSubmit = async (data: CategoryFormValues) => {
    if (editingCategoryId) {
      await updateCategory(editingCategoryId, data)
    } else {
      await createCategory(data)
    }
  }
  
  const createCategory = async (data: CategoryFormValues) => {
    try {
      setLoading(true)
      console.log('Creating new category:', data)
      
      const newCategory = await categoryAPI.createCategory(data) as Category
      console.log('API response for create category:', newCategory)
      
      // Update local state with the new category
      const updatedCategories = [...categories, newCategory]
      setCategories(updatedCategories)
      
      // Update local storage
      localStorage.setItem('userCategories', JSON.stringify(updatedCategories))
      
      setIsAddingCategory(false)
      reset()
      alert('Category created successfully')
    } catch (err: any) {
      console.error('Error creating category:', err)
      setError(err.response?.data?.detail || 'Failed to create category')
      alert('Failed to create category')
    } finally {
      setLoading(false)
    }
  }
  
  const updateCategory = async (id: number, data: CategoryFormValues) => {
    try {
      setLoading(true)
      console.log('Updating category:', id, data)
      
      const updatedCategory = await categoryAPI.updateCategory(id, data) as Category
      console.log('API response for update category:', updatedCategory)
      
      // Update local state
      const updatedCategories = categories.map(cat => 
        cat.id === id ? { ...cat, ...data } : cat
      )
      setCategories(updatedCategories)
      
      // Update local storage
      localStorage.setItem('userCategories', JSON.stringify(updatedCategories))
      
      setEditingCategoryId(null)
      reset()
      alert('Category updated successfully')
    } catch (err: any) {
      console.error('Error updating category:', err)
      setError(err.response?.data?.detail || 'Failed to update category')
      alert('Failed to update category')
    } finally {
      setLoading(false)
    }
  }
  
  const deleteCategory = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category? This will affect all expenses in this category.')) {
      try {
        setLoading(true)
        console.log('Deleting category:', id)
        
        await categoryAPI.deleteCategory(id)
        console.log('Category deleted successfully')
        
        // Update local state
        const updatedCategories = categories.filter(cat => cat.id !== id)
        setCategories(updatedCategories)
        
        // Update local storage
        localStorage.setItem('userCategories', JSON.stringify(updatedCategories))
        
        alert('Category deleted successfully')
        
      } catch (err: any) {
        console.error('Error deleting category:', err)
        setError(err.response?.data?.detail || 'Failed to delete category')
        alert('Failed to delete category')
      } finally {
        setLoading(false)
      }
    }
  }
  
  // Predefined colors
  const colorOptions = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#6B7280', // Gray
    '#000000', // Black
  ]

  return (
    <PageContainer>
      <div className="mb-8">
        <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl shadow-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Tag className="h-8 w-8 mr-3" />
            Expense Categories
          </h1>
          <p className="text-purple-100 max-w-3xl">Create and manage categories to better organize and track your expenses.</p>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category form */}
        <div className="lg:col-span-1">
          <div className="mt-5 bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4 border-b border-purple-700 text-white">
              <h3 className="text-lg font-medium">
                {editingCategoryId ? 'Edit Category' : 'Create New Category'}
              </h3>
              <p className="mt-1 text-sm text-purple-100">
                {editingCategoryId 
                  ? 'Update the details of this category' 
                  : 'Add a new category to organize your expenses'}
              </p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="px-6 py-5 space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Category Name *
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="name"
                        className={`shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          errors.name ? 'border-red-300' : ''
                        }`}
                        {...register('name')}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description (Optional)
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="description"
                        rows={3}
                        className={`shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          errors.description ? 'border-red-300' : ''
                        }`}
                        {...register('description')}
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Color *
                    </label>
                    <div className="mt-1 grid grid-cols-4 gap-2">
                      {colorOptions.map(color => (
                        <div 
                          key={color} 
                          className={`h-10 rounded-md cursor-pointer border-2 ${
                            selectedColor === color ? 'border-purple-500' : 'border-transparent'
                          } hover:shadow-md transition-all duration-200`}
                          style={{ backgroundColor: color }}
                          onClick={() => setValue('color', color)}
                        />
                      ))}
                    </div>
                    <div className="mt-3 flex">
                      <input
                        type="color"
                        id="color"
                        className="h-10 w-10 border-0 rounded cursor-pointer"
                        {...register('color')}
                      />
                      <input
                        type="text"
                        className={`ml-2 shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          errors.color ? 'border-red-300' : ''
                        }`}
                        {...register('color')}
                      />
                    </div>
                    {errors.color && (
                      <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Preview
                    </label>
                    <div className="mt-1 flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-full" 
                        style={{ backgroundColor: selectedColor }}
                      />
                      <div 
                        className="px-3 py-1 rounded-full text-sm font-medium" 
                        style={{ 
                          backgroundColor: `${selectedColor}20`,
                          color: selectedColor
                        }}
                      >
                        {watch('name') || 'Category Name'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={cancelEditing}
                  disabled={loading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-e-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      {editingCategoryId ? 'Update' : 'Create'} Category
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Categories list */}
        <div className="lg:col-span-2">
          <div className="mt-5">
            {loading && !isAddingCategory && editingCategoryId === null ? (
              <div className="bg-white shadow-md rounded-lg p-6 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-2 text-sm text-gray-500">Loading categories...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="bg-white shadow-md rounded-lg p-6 text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 text-purple-600 mb-4">
                  <Tag className="h-8 w-8" />
                </div>
                <p className="text-gray-600 mb-4">No categories found. Add your first category to organize your expenses!</p>
                <Button 
                  onClick={startAddingCategory}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
            ) : (
              <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
                <ul className="divide-y divide-gray-200">
                  {categories.map((category) => (
                    <li key={category.id} className="px-6 py-5 hover:bg-gray-50 transition-colors duration-150">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div 
                            className="flex-shrink-0 h-12 w-12 rounded-full shadow-sm"
                            style={{ backgroundColor: category.color }}
                          />
                          <div className="ml-4">
                            <div className="text-base font-medium text-gray-900">{category.name}</div>
                            {category.description && (
                              <div className="text-sm text-gray-500 mt-1">{category.description}</div>
                            )}
                            <div 
                              className="mt-1 inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium" 
                              style={{ 
                                backgroundColor: `${category.color}20`,
                                color: category.color
                              }}
                            >
                              {category.color}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditingCategory(category)}
                            className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                            disabled={editingCategoryId !== null || isAddingCategory}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteCategory(category.id)}
                            className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                            disabled={editingCategoryId !== null || isAddingCategory}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  )
} 