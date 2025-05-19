import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { categoryAPI, reportAPI } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import AnnualSummaryChart from '@/components/reports/AnnualSummaryChart'
import { FileText, Download, RefreshCw, Calendar, BarChart3, Filter, Loader2, Check, FileSpreadsheet, PieChart } from 'lucide-react'
import PageContainer from '@/components/layout/PageContainer'

// Report schema with validation
const reportSchema = z.object({
  year: z.number().min(2000).max(2100),
  month: z.string().optional(),
  category_id: z.number().optional().nullable(),
  report_type: z.enum(['csv', 'pdf']),
})

type ReportFormValues = z.infer<typeof reportSchema>

// Category data type
interface Category {
  id: number
  name: string
  description?: string
  color: string
}

interface ReportHistoryItem {
  id: number
  type: string
  format: string
  created_at: string
  file_url: string
  status: 'completed' | 'processing' | 'error'
}

export default function ReportsPage() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [reportHistory, setReportHistory] = useState<ReportHistoryItem[]>([])
  const [regeneratingId, setRegeneratingId] = useState<number | null>(null)

  // Form setup with zod validation
  const { register, handleSubmit, formState: { errors }, watch } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      year: new Date().getFullYear(),
      month: '',
      category_id: null,
      report_type: 'pdf',
    }
  })

  // Helper to generate month options
  const monthOptions = [
    { value: '', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ]

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories()
    // Initialize report history with latest generated reports (ideally from backend)
    initializeReportHistory()
  }, [])

  async function fetchCategories() {
    try {
      setIsLoadingCategories(true)
      console.log('Fetching categories for report page...')
      
      // Check if token exists for API authentication
      const token = localStorage.getItem('accessToken')
      if (!token) {
        console.error('No authentication token found')
        setError('Authentication error: Please log in again')
        setIsLoadingCategories(false)
        return
      }
      
      // Use ensureCategories instead of getAllCategories
      const fetchedCategories = await categoryAPI.ensureCategories()
      
      if (Array.isArray(fetchedCategories) && fetchedCategories.length > 0) {
        console.log(`Loaded ${fetchedCategories.length} categories for report filters`)
        setCategories(fetchedCategories)
      } else {
        console.warn('No categories found, reports may have limited filtering options')
        setCategories([])
      }
    } catch (err) {
      console.error('Error fetching categories for reports:', err)
      setError('Failed to load categories. Some filtering options may not be available.')
    } finally {
      setIsLoadingCategories(false)
    }
  }

  async function initializeReportHistory() {
    // In a real app, we would fetch report history from backend
    // For now, just create sample history based on current date
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const lastWeek = new Date(now)
    lastWeek.setDate(lastWeek.getDate() - 7)

    // Mock history - in a real app, fetch this from a reports history API
    const mockHistory: ReportHistoryItem[] = [
      {
        id: 1,
        type: `Monthly Expenses (${monthOptions[now.getMonth()].label})`,
        format: 'PDF',
        created_at: now.toISOString(),
        file_url: '#',
        status: 'completed'
      },
      {
        id: 2,
        type: 'Annual Summary',
        format: 'CSV',
        created_at: yesterday.toISOString(),
        file_url: '#',
        status: 'completed'
      },
      {
        id: 3,
        type: 'Category Analysis',
        format: 'PDF',
        created_at: lastWeek.toISOString(),
        file_url: '#',
        status: 'completed'
      }
    ]
    
    setReportHistory(mockHistory)
  }

  const onSubmit = async (data: ReportFormValues) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      console.log('Generating report with parameters:', data)
      
      // Prepare query parameters
      const params: any = { year: data.year }
      // Only include month if it's a valid number
      const monthValue = data.month ? parseInt(data.month, 10) : undefined
      if (monthValue && monthValue >= 1 && monthValue <= 12) {
        params.month = monthValue
      }
      // Only include category_id if it's a valid number greater than 0
      if (data.category_id && data.category_id > 0) {
        params.category_id = data.category_id
      }
      
      // Get report data using the appropriate API function
      let reportData: Blob
      
      if (data.report_type === 'csv') {
        reportData = await reportAPI.getCSVReport(params)
      } else { // pdf
        // Pass all parameters including category_id, but only if it's a valid number
        const categoryId = data.category_id && data.category_id > 0 ? data.category_id : undefined
        reportData = await reportAPI.getPDFReport(data.year, monthValue, categoryId)
      }
      
      // Create download link for the blob
      const url = window.URL.createObjectURL(new Blob([reportData]))
      const link = document.createElement('a')
      link.href = url
      
      // Generate descriptive filename
      const categoryName = data.category_id && data.category_id > 0 ? 
        categories.find(c => c.id === data.category_id)?.name || 'filtered' : 
        'all-categories'
      
      const monthName = monthValue && monthValue >= 1 && monthValue <= 12 ? 
        monthOptions.find(m => m.value === String(monthValue))?.label.toLowerCase() : 
        'all-months'
        
      const fileName = `expense_report_${data.year}_${monthName}_${categoryName}.${data.report_type}`
      
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      setSuccess(`Report has been generated and downloaded successfully!`)
      
      // Add new report to history
      const categoryDetail = data.category_id && data.category_id > 0 ?
        ` (${categories.find(c => c.id === data.category_id)?.name})` : ''
        
      const timeDetail = monthValue && monthValue >= 1 && monthValue <= 12 ?
        `${monthOptions.find(m => m.value === String(monthValue))?.label} ${data.year}` :
        `${data.year}`
      
      const newReportItem: ReportHistoryItem = {
        id: Date.now(),
        type: `${timeDetail}${categoryDetail}`,
        format: data.report_type.toUpperCase(),
        created_at: new Date().toISOString(),
        file_url: '#',
        status: 'completed'
      }
      
      setReportHistory([newReportItem, ...reportHistory])
      
    } catch (err: any) {
      console.error('Error generating report:', err)
      setError(err.response?.data?.detail || 'Failed to generate report. Please try again.')
    } finally {
      setIsLoading(false)
      setRegeneratingId(null)
    }
  }

  // Watch form values for conditional rendering
  const watchReportType = watch('report_type')

  return (
    <PageContainer>
      <div className="mb-8">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Financial Reports</h1>
          <p className="text-indigo-100 max-w-3xl">Generate detailed reports and analytics to gain deeper insights into your spending habits and financial trends.</p>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md flex items-center">
          <div className="flex-shrink-0 mr-3">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-md flex items-center">
          <div className="flex-shrink-0 mr-3">
            <Check className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Report Generator Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-b from-indigo-50 to-white">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-indigo-500" />
                Generate Report
              </h2>
              <p className="mt-1 text-sm text-gray-500 ">
                Create detailed reports in various formats to analyze your expenses
              </p>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`relative rounded-lg border ${watchReportType === 'pdf' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'} p-4 cursor-pointer transition-all hover:border-indigo-300 hover:bg-indigo-50/50`}>
                    <input
                      id="pdf"
                      type="radio"
                      value="pdf"
                      className="sr-only"
                      {...register('report_type')}
                    />
                    <label htmlFor="pdf" className="cursor-pointer flex flex-col items-center">
                      <FileText className={`h-8 w-8 mb-2 ${watchReportType === 'pdf' ? 'text-indigo-600' : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${watchReportType === 'pdf' ? 'text-indigo-700' : 'text-gray-700'}`}>
                        PDF Report
                      </span>
                    </label>
                    {watchReportType === 'pdf' && (
                      <div className="absolute top-2 right-2">
                        <div className="h-4 w-4 bg-indigo-500 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className={`relative rounded-lg border ${watchReportType === 'csv' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'} p-4 cursor-pointer transition-all hover:border-indigo-300 hover:bg-indigo-50/50`}>
                    <input
                      id="csv"
                      type="radio"
                      value="csv"
                      className="sr-only"
                      {...register('report_type')}
                    />
                    <label htmlFor="csv" className="cursor-pointer flex flex-col items-center">
                      <FileSpreadsheet className={`h-8 w-8 mb-2 ${watchReportType === 'csv' ? 'text-indigo-600' : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${watchReportType === 'csv' ? 'text-indigo-700' : 'text-gray-700'}`}>
                        CSV Export
                      </span>
                    </label>
                    {watchReportType === 'csv' && (
                      <div className="absolute top-2 right-2">
                        <div className="h-4 w-4 bg-indigo-500 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5 text-indigo-500" />
                  Year
                </label>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  {...register('year', { valueAsNumber: true })}
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {errors.year && (
                  <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5 text-indigo-500" />
                  Month (Optional)
                </label>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  {...register('month')}
                >
                  {monthOptions.map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
                {errors.month && (
                  <p className="mt-1 text-sm text-red-600">{errors.month.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Filter className="h-4 w-4 mr-1.5 text-indigo-500" />
                  Category (Optional)
                </label>
                <div className="relative h-[107px]" >
                  <select
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    {...register('category_id', { 
                      valueAsNumber: true,
                      setValueAs: (v) => v === '' ? null : Number(v)
                    })}
                    disabled={isLoadingCategories}
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {isLoadingCategories && (
                    <div className="absolute right-3 top-3">
                      <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                    </div>
                  )}
                </div>
                {isLoadingCategories && (
                  <p className="mt-1 text-xs text-gray-500">Loading categories...</p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full flex items-center justify-center text-base font-medium bg-indigo-600 hover:bg-indigo-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      {watchReportType === 'pdf' ? (
                        <FileText className="mr-2 h-5 w-5" />
                      ) : (
                        <Download className="mr-2 h-5 w-5" />
                      )}
                      Generate {watchReportType === 'pdf' ? 'PDF Report' : 'CSV Export'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Report Preview & Info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-b from-indigo-50 to-white">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-indigo-500" />
                Report Information
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Learn about available report types and view your report history
              </p>
            </div>
            
            <div className="p-6">
              <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                <FileText className="h-4 w-4 mr-1.5 text-indigo-500" />
                Available Reports
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="p-4 border border-gray-200 rounded-lg transition-all hover:border-indigo-200 hover:bg-indigo-50/30 bg-white shadow-sm">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <FileText className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h4 className="font-medium text-gray-900">PDF Report</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    A comprehensive document with expense details, category breakdowns, and visual charts. 
                    Perfect for printing or saving as records.
                  </p>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg transition-all hover:border-indigo-200 hover:bg-indigo-50/30 bg-white shadow-sm">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h4 className="font-medium text-gray-900">CSV Export</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Raw expense data in spreadsheet format. Ideal for importing into Excel, Google Sheets, 
                    or other financial software for custom analysis.
                  </p>
                </div>
              </div>
              
              <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center pb-2 border-b border-gray-100">
                <Calendar className="h-4 w-4 mr-1.5 text-indigo-500" />
                Recently Generated Reports
              </h3>
              
              {reportHistory.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <PieChart className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-500 mb-4">No reports have been generated yet.</p>
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => handleSubmit(onSubmit)()}
                  >
                    Generate Your First Report
                  </Button>
                </div>
              ) : (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Report Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Format
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date Created
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportHistory.map((report) => (
                        <tr key={report.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {report.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              report.format === 'PDF' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {report.format === 'PDF' ? (
                                <FileText className="mr-1 h-3 w-3" />
                              ) : (
                                <FileSpreadsheet className="mr-1 h-3 w-3" />
                              )}
                              {report.format}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(report.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {report.status === 'completed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center"
                                onClick={() => {
                                  setRegeneratingId(report.id);
                                  onSubmit({
                                    year: new Date().getFullYear(),
                                    report_type: report.format.toLowerCase() as 'pdf' | 'csv',
                                    month: String(new Date().getMonth() + 1),
                                    category_id: null
                                  });
                                }}
                                disabled={isLoading || regeneratingId === report.id}
                              >
                                {regeneratingId === report.id ? (
                                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                ) : (
                                  <RefreshCw className="mr-1 h-3 w-3" />
                                )}
                                Regenerate
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Annual Summary Charts */}
      <div className="mt-8 bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-b from-indigo-50 to-white">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-indigo-500" />
            Annual Expense Summary
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Visualize your spending patterns across the entire year
          </p>
        </div>
        <div className="p-6">
          <AnnualSummaryChart defaultYear={new Date().getFullYear()} />
        </div>
      </div>
    </PageContainer>
  )
} 