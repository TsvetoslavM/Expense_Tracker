import axios from 'axios'

// Create axios instance with environment-aware configuration
const api = axios.create({
  // Hard-code production URL with fallback to local development
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://expense-tracker-api-un6a.onrender.com'  // Production Render API URL
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',  // Local development
  headers: {
    'Content-Type': 'application/json',
  },
  // IMPORTANT: Set to false to avoid CORS preflight issues
  withCredentials: false,
  // Add timeout to prevent hanging requests
  timeout: 15000, // Increased timeout for slower connections
})

// Log API configuration for debugging
console.log('API Configuration:', {
  baseURL: api.defaults.baseURL,
  withCredentials: api.defaults.withCredentials,
  timeout: api.defaults.timeout,
  environment: process.env.NODE_ENV,
  productionMode: process.env.NODE_ENV === 'production' ? 'Yes' : 'No',
})

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage if we're in a browser environment
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    })
    return Promise.reject(error)
  }
)

// Authentication APIs
export const authAPI = {
  login: async (email: string, password: string) => {
    console.log(`Attempting login for user: ${email}`)
    try {
      const response = await api.post('/api/auth/login/json', { email, password })
      console.log('Login successful, received token')
      return response.data
    } catch (error: any) {
      console.error('Login failed:', error.response?.data || error.message)
      throw error
    }
  },
  register: async (userData: {
    email: string
    password: string
    first_name?: string
    last_name?: string
    preferred_currency?: string
  }) => {
    const response = await api.post('/api/auth/register', userData)
    return response.data
  },
  requestPasswordReset: async (email: string) => {
    const response = await api.post('/api/auth/password-reset/request', { email })
    return response.data
  },
  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/api/auth/password-reset/confirm', { token, password })
    return response.data
  },
}

// User APIs
export const userAPI = {
  getCurrentUser: async () => {
    const response = await api.get('/api/users/me')
    return response.data
  },
  updateCurrentUser: async (userData: any) => {
    console.log('Updating user with data:', userData)
    try {
      const response = await api.put('/api/users/me', userData)
      console.log('Update user response:', response.data)
      
      // After successful update, fetch the latest user data to ensure consistency
      if (response.status === 200) {
        // We can either return the direct response or fetch fresh data
        return response.data
      }
      
      return response.data
    } catch (error) {
      console.error('Error in updateCurrentUser:', error)
      throw error
    }
  },
}

// Category APIs
export const categoryAPI = {
  getAllCategories: async () => {
    const response = await api.get('/api/categories')
    return response.data
  },
  getCategory: async (id: number) => {
    const response = await api.get(`/api/categories/${id}`)
    return response.data
  },
  createCategory: async (categoryData: { name: string; description?: string; color?: string; icon?: string }) => {
    const response = await api.post('/api/categories', categoryData)
    return response.data
  },
  updateCategory: async (id: number, categoryData: any) => {
    const response = await api.put(`/api/categories/${id}`, categoryData)
    return response.data
  },
  deleteCategory: async (id: number) => {
    const response = await api.delete(`/api/categories/${id}`)
    return response.data
  },
  createDefaultCategories: async () => {
    const response = await api.post('/api/categories/defaults')
    return response.data
  },
  // New function to ensure categories exist - will create defaults if none found
  ensureCategories: async () => {
    try {
      // First check if user has any categories
      const currentCategories = await api.get('/api/categories')
      
      // If no categories exist, create defaults
      if (!currentCategories.data || currentCategories.data.length === 0) {
        console.log('No categories found, creating defaults...')
        const response = await api.post('/api/categories/defaults')
        return response.data
      }
      
      // Otherwise return existing categories
      return currentCategories.data
    } catch (error) {
      console.error('Error ensuring categories exist:', error)
      throw error
    }
  }
}

// Expense APIs
export const expenseAPI = {
  getAllExpenses: async (params?: {
    category_id?: number
    start_date?: string
    end_date?: string
    min_amount?: number
    max_amount?: number
    skip?: number
    limit?: number
  }) => {
    // Add default values for pagination to prevent 422 errors
    const defaultParams = {
      skip: 0,
      limit: 100
    };
    
    // Ensure dates are in proper ISO format (YYYY-MM-DD)
    const formattedParams = { ...params };
    if (formattedParams.start_date && !formattedParams.start_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = new Date(formattedParams.start_date);
      formattedParams.start_date = date.toISOString().split('T')[0];
    }
    if (formattedParams.end_date && !formattedParams.end_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = new Date(formattedParams.end_date);
      formattedParams.end_date = date.toISOString().split('T')[0];
    }
    
    // Merge user provided params with defaults
    const requestParams = { ...defaultParams, ...formattedParams };
    
    try {
      const response = await api.get('/api/expenses', { 
        params: requestParams 
      });
      return response.data;
    } catch (error) {
      console.error('Error in getAllExpenses:', error);
      // Return empty array instead of throwing to prevent dashboard from crashing
      return [];
    }
  },
  getExpense: async (id: number) => {
    const response = await api.get(`/api/expenses/${id}`)
    return response.data
  },
  createExpense: async (expenseData: {
    amount: number
    date: string
    category_id: number
    description: string
    currency?: string
    notes?: string
    attachment_url?: string
  }) => {
    // Ensure date is in proper format
    const formattedData = { ...expenseData };
    if (formattedData.date && !formattedData.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = new Date(formattedData.date);
      formattedData.date = date.toISOString().split('T')[0];
    }

    // Ensure amount is a number (not a string)
    if (typeof formattedData.amount === 'string') {
      formattedData.amount = parseFloat(formattedData.amount);
    }

    // Ensure category_id is a number
    if (typeof formattedData.category_id === 'string') {
      formattedData.category_id = parseInt(formattedData.category_id, 10);
    }

    // Make sure description is not empty
    if (!formattedData.description || formattedData.description.trim() === '') {
      formattedData.description = 'Untitled Expense';
    }

    try {
      console.log('Sending expense data:', formattedData);
      
      // Try with explicit content type
      const response = await api.post('/api/expenses/', formattedData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error creating expense:', error);
      
      // Provide better error diagnostic information
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        
        // Check if this is a validation error
        if (error.response.status === 422 && error.response.data.detail) {
          console.error('Validation errors:', error.response.data.detail);
        }
      }
      
      throw error;
    }
  },
  updateExpense: async (id: number, expenseData: any) => {
    const response = await api.put(`/api/expenses/${id}`, expenseData)
    return response.data
  },
  deleteExpense: async (id: number) => {
    const response = await api.delete(`/api/expenses/${id}`)
    return response.data
  },
  getMonthlySummary: async (year: number, month?: number) => {
    const response = await api.get('/api/expenses/summary/monthly', {
      params: { year, month },
    })
    return response.data
  },
}

// Budget APIs
export const budgetAPI = {
  getAllBudgets: async (params?: {
    year?: number
    month?: number
    category_id?: number
    skip?: number
    limit?: number
  }) => {
    // Use direct endpoint to avoid routing issues
    const response = await api.get('/api/budgets-list', { params })
    return response.data
  },
  getBudget: async (id: number) => {
    const response = await api.get(`/api/budgets/${id}`)
    return response.data
  },
  createBudget: async (budgetData: {
    amount: number
    year: number
    month?: number
    category_id: number
    period?: string
    currency?: string
  }) => {
    const response = await api.post('/api/budgets', budgetData)
    return response.data
  },
  updateBudget: async (id: number, budgetData: any) => {
    const response = await api.put(`/api/budgets/${id}`, budgetData)
    return response.data
  },
  deleteBudget: async (id: number) => {
    const response = await api.delete(`/api/budgets/${id}`)
    return response.data
  },
  getCurrentBudgets: async () => {
    const response = await api.get('/api/budgets/overview/current')
    return response.data
  },
  getBudgetStats: async (params?: {
    year: number;
    month?: number;
    category_id?: number;
  }) => {
    const response = await api.get('/api/budgets/stats', { params })
    return response.data
  }
}

// Report APIs
export const reportAPI = {
  getCSVReport: async (params?: { year?: number; month?: number; category_id?: number }) => {
    const response = await api.get('/api/reports/csv', { 
      params,
      responseType: 'blob',
    })
    return response.data
  },
  getPDFReport: async (year: number, month?: number) => {
    const response = await api.get('/api/reports/pdf', { 
      params: { year, month },
      responseType: 'blob',
    })
    return response.data
  },
  getAnnualSummary: async (year: number) => {
    const response = await api.get('/api/reports/summary/annual', {
      params: { year },
    })
    return response.data
  },
}

export default api 