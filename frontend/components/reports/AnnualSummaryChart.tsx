import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { reportAPI, expenseAPI } from '@/lib/api';
import { Loader2, PieChart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Use ApexCharts for visualizations
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface AnnualSummaryProps {
  defaultYear?: number;
}

interface CategoryData {
  id: number;
  name: string;
  color: string;
  amount: number;
  percentage: number;
}

interface MonthlyData {
  month: number;
  amount: number;
  percentage: number;
  primary_category_id?: number;
  category_breakdown?: Array<{
    category_id: number;
    amount: number;
    percentage?: number;
    category_name?: string;
    category_color?: string;
    category?: {
      name: string;
      color: string;
      id?: number;
    };
  }>;
}

interface SummaryData {
  year: number;
  total_amount: number;
  monthly_data: MonthlyData[];
  category_data: CategoryData[];
}

const AnnualSummaryChart: React.FC<AnnualSummaryProps> = ({ defaultYear = new Date().getFullYear() }) => {
  const [year, setYear] = useState<number>(defaultYear);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Available years for selection
  const availableYears = Array.from(
    { length: 5 }, 
    (_, i) => new Date().getFullYear() - 2 + i
  );

  // Add a utility function to manually create a category breakdown when API doesn't provide it
  const createManualCategoryBreakdown = (monthData: MonthlyData, knownExpenses: any[], categoryMap: Map<number, any>) => {
    // If we already have category breakdown, just return it
    if (monthData.category_breakdown && monthData.category_breakdown.length > 0) {
      return monthData.category_breakdown;
    }
    
    // Try to construct category breakdown from expenses we know about
    const expensesForMonth = knownExpenses.filter(exp => {
      // Extract month from expense date (format YYYY-MM-DD)
      const expMonth = new Date(exp.date).getMonth() + 1;
      return expMonth === monthData.month;
    });
    
    console.log(`Found ${expensesForMonth.length} expenses for month ${monthData.month}`);
    
    if (expensesForMonth.length > 0) {
      // Group expenses by category
      const categoryGroups = new Map();
      
      expensesForMonth.forEach(exp => {
        const categoryId = exp.category_id;
        if (!categoryGroups.has(categoryId)) {
          categoryGroups.set(categoryId, {
            category_id: categoryId,
            amount: 0,
            count: 0,
            category_name: exp.category?.name || (categoryMap.get(categoryId)?.name || 'Unknown'),
            category_color: exp.category?.color || (categoryMap.get(categoryId)?.color || '#cccccc')
          });
        }
        
        const group = categoryGroups.get(categoryId);
        group.amount += Number(exp.amount);
        group.count += 1;
      });
      
      // Convert to array and calculate percentages
      const totalAmount = monthData.amount || Array.from(categoryGroups.values()).reduce((sum, group) => sum + group.amount, 0);
      
      const breakdown = Array.from(categoryGroups.values()).map(group => {
        return {
          ...group,
          percentage: totalAmount > 0 ? parseFloat(((group.amount / totalAmount) * 100).toFixed(1)) : 0
        };
      });
      
      // Sort by amount
      return breakdown.sort((a, b) => b.amount - a.amount);
    }
    
    // If we have a category ID from the month's data but no breakdown
    if (monthData.primary_category_id && categoryMap.has(monthData.primary_category_id)) {
      const categoryInfo = categoryMap.get(monthData.primary_category_id);
      return [{
        category_id: monthData.primary_category_id,
        amount: monthData.amount || 0,
        percentage: 100,
        category_name: categoryInfo.name,
        category_color: categoryInfo.color,
        count: 1
      }];
    }
    
    // If we know the total amount but don't know the category, create a single "Uncategorized" entry
    if (monthData.amount > 0) {
      return [{
        category_id: 0,
        amount: monthData.amount,
        percentage: 100,
        category_name: "Unknown Category",
        category_color: "#888888",
        count: 1
      }];
    }
    
    return [];
  };

  // Process monthly category data to include percentages and names
  const processMonthlyCategories = (data: SummaryData | null, knownExpenses: any[] = []) => {
    if (!data || !data.monthly_data) return data;
    
    // Create a map of category ids to names and colors
    const categoryMap = new Map();
    if (data.category_data) {
      data.category_data.forEach(cat => {
        categoryMap.set(cat.id, {
          name: cat.name,
          color: cat.color
        });
      });
    }
    
    // Process each month's category breakdown to include names and percentages
    const updatedMonthlyData = data.monthly_data.map(month => {
      // If no category breakdown exists, try to create it manually from known expenses
      if (!month.category_breakdown || month.category_breakdown.length === 0) {
        month.category_breakdown = createManualCategoryBreakdown(month, knownExpenses, categoryMap);
      }
      
      // Process the category breakdown (either original or manually created)
      if (month.category_breakdown && month.category_breakdown.length > 0) {
        const monthTotal = month.amount || 0;
        const updatedBreakdown = month.category_breakdown.map(catBreakdown => {
          // Extract and fix category information
          let categoryName = 'Unknown';
          let categoryColor = '#cccccc';
          
          // First check if the category info is already populated in the breakdown
          if (catBreakdown.category_name) {
            categoryName = catBreakdown.category_name;
          } 
          // Otherwise look it up in our category map
          else if (categoryMap.has(catBreakdown.category_id)) {
            const categoryInfo = categoryMap.get(catBreakdown.category_id);
            categoryName = categoryInfo.name;
          }
          
          // Same for color
          if (catBreakdown.category_color) {
            categoryColor = catBreakdown.category_color;
          }
          else if (categoryMap.has(catBreakdown.category_id)) {
            const categoryInfo = categoryMap.get(catBreakdown.category_id);
            categoryColor = categoryInfo.color;
          }
          
          // Ensure we have proper category name and color even if the API doesn't provide it
          // Check if this breakdown item includes a category object directly
          if (catBreakdown.category) {
            categoryName = catBreakdown.category.name || categoryName;
            categoryColor = catBreakdown.category.color || categoryColor;
          }
          
          const percentage = monthTotal > 0 
            ? (catBreakdown.amount / monthTotal) * 100 
            : 0;
          
          console.log(`Processing category for month ${month.month}: ID=${catBreakdown.category_id}, Name=${categoryName}`);
          
          return {
            ...catBreakdown,
            percentage: parseFloat(percentage.toFixed(1)),
            category_name: categoryName,
            category_color: categoryColor
          };
        });
        
        // Sort by amount (highest first)
        updatedBreakdown.sort((a, b) => b.amount - a.amount);
        
        return {
          ...month,
          category_breakdown: updatedBreakdown
        };
      }
      
      return month;
    });
    
    return {
      ...data,
      monthly_data: updatedMonthlyData
    };
  };

  useEffect(() => {
    fetchSummaryData(year);
  }, [year]);

  const fetchSummaryData = async (selectedYear: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await reportAPI.getAnnualSummary(selectedYear);
      console.log('Annual summary data:', data);
      
      // Initialize empty arrays if data is missing them
      if (data && !data.monthly_data) {
        data.monthly_data = [];
      }
      if (data && !data.category_data) {
        data.category_data = [];
      }
      
      // Try to get known expenses for this year to help with category breakdown
      let knownExpenses = [];
      try {
        // Get expenses for the entire year
        const startDate = `${selectedYear}-01-01`;
        const endDate = `${selectedYear}-12-31`;
        knownExpenses = await expenseAPI.getAllExpenses({
          start_date: startDate,
          end_date: endDate,
          limit: 500 // Reasonable limit to get most expenses
        });
        console.log(`Retrieved ${knownExpenses.length} expenses for year ${selectedYear}`);
      } catch (error) {
        console.error('Error fetching expenses for category info:', error);
        // Continue even if this fails
        knownExpenses = [];
      }
      
      // Log the structure of category breakdown for debugging
      if (data && data.monthly_data && data.monthly_data.length > 0) {
        const sampleMonth = data.monthly_data.find((m: MonthlyData) => m.category_breakdown && m.category_breakdown.length > 0);
        if (sampleMonth && sampleMonth.category_breakdown) {
          console.log('Sample category breakdown structure:', sampleMonth.category_breakdown[0]);
        } else {
          console.log('No months with category breakdown found in API response');
        }
      }
      
      // Process the data to include category names and percentages
      const processedData = processMonthlyCategories(data, knownExpenses);
      setSummaryData(processedData);
      
      // Set selected month to current month if available in data
      const currentMonth = new Date().getMonth() + 1;
      const monthExists = processedData?.monthly_data?.some(m => m.month === currentMonth);
      setSelectedMonth(monthExists ? currentMonth : (processedData?.monthly_data?.[0]?.month || null));
    } catch (err: any) {
      console.error('Error fetching annual summary:', err);
      setError(err.response?.data?.detail || 'Failed to load annual summary data.');
      setSummaryData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare data for monthly chart
  const getMonthlyChartOptions = () => {
    if (!summaryData || !summaryData.monthly_data || summaryData.monthly_data.length === 0) {
      return {
        chart: {
          id: 'monthly-expenses',
          toolbar: { show: false },
          fontFamily: 'inherit'
        },
        xaxis: { categories: [] },
        series: [{ name: 'Expenses', data: [] }],
        title: {
          text: `No Monthly Data for ${year}`,
          align: 'center' as 'center'
        }
      };
    }

    // Extract and sort monthly data
    const sortedMonthlyData = [...summaryData.monthly_data]
      .sort((a, b) => a.month - b.month);
    
    // Map month numbers to names for x-axis
    const categories = sortedMonthlyData.map(item => monthNames[item.month - 1]);
    const series = [{
      name: 'Expenses',
      data: sortedMonthlyData.map(item => item.amount)
    }];

    return {
      chart: {
        id: 'monthly-expenses',
        toolbar: {
          show: false
        },
        fontFamily: 'inherit'
      },
      xaxis: {
        categories
      },
      colors: ['#3b82f6'],
      stroke: {
        curve: 'smooth' as 'smooth',
        width: 3
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.2,
          stops: [0, 90, 100]
        }
      },
      dataLabels: {
        enabled: false
      },
      title: {
        text: `Monthly Expenses for ${year}`,
        align: 'left' as 'left',
        style: {
          fontSize: '16px',
          fontWeight: 'bold'
        }
      },
      yaxis: {
        title: {
          text: 'Amount'
        },
        labels: {
          formatter: (value: number) => {
            return value.toFixed(0);
          }
        }
      },
      series
    };
  };

  // Prepare data for category pie chart
  const getCategoryChartOptions = () => {
    if (!summaryData || !summaryData.category_data || summaryData.category_data.length === 0) {
      return {
        chart: {
          id: 'category-distribution',
          fontFamily: 'inherit'
        },
        labels: ['No Data'],
        series: [100],
        plotOptions: {
          pie: {
            donut: {
              labels: {
                show: true,
                total: {
                  show: true,
                  label: 'No Data',
                }
              }
            }
          }
        }
      };
    }

    const labels = summaryData.category_data.map(item => item.name);
    const series = summaryData.category_data.map(item => item.amount);
    const colors = summaryData.category_data.map(item => item.color);

    return {
      chart: {
        id: 'category-distribution',
        fontFamily: 'inherit'
      },
      labels,
      colors,
      series,
      legend: {
        position: 'bottom' as 'bottom'
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number, opts: any) => {
          const index = opts.seriesIndex;
          if (index >= 0 && summaryData.category_data[index]) {
            const percentage = summaryData.category_data[index].percentage;
            return `${percentage.toFixed(1)}%`;
          }
          return '';
        }
      },
      plotOptions: {
        pie: {
          donut: {
            size: '55%',
            labels: {
              show: true,
              total: {
                show: true,
                showAlways: true,
                label: 'Total',
                fontSize: '16px',
                fontWeight: 600,
                formatter: () => {
                  return summaryData.total_amount.toFixed(2);
                }
              }
            }
          }
        }
      }
    };
  };

  // Get the selected month's data
  const getSelectedMonthData = () => {
    if (!summaryData || !selectedMonth) return null;
    return summaryData.monthly_data.find(m => m.month === selectedMonth) || null;
  };

  const monthlyChartOptions = getMonthlyChartOptions();
  const categoryChartOptions = getCategoryChartOptions();
  const selectedMonthData = getSelectedMonthData();

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl">Annual Expense Summary</CardTitle>
          <CardDescription>
            Visualization of your expenses across months and categories
          </CardDescription>
        </div>
        <Select 
          value={year.toString()} 
          onValueChange={(value) => setYear(parseInt(value))}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map((yearOption) => (
              <SelectItem key={yearOption} value={yearOption.toString()}>
                {yearOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="text-center p-6 text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <div className="space-y-8">
            <Tabs defaultValue="charts" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="charts">Charts</TabsTrigger>
                <TabsTrigger value="monthly">Monthly Breakdown</TabsTrigger>
              </TabsList>
              
              <TabsContent value="charts" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Monthly line chart */}
                  <div className="bg-white p-4 rounded-md border border-gray-100 shadow-sm">
                    {typeof window !== 'undefined' && (
                      <Chart
                        options={monthlyChartOptions}
                        series={monthlyChartOptions.series}
                        type="area"
                        height={300}
                      />
                    )}
                  </div>
                  
                  {/* Category pie chart */}
                  <div className="bg-white p-4 rounded-md border border-gray-100 shadow-sm">
                    {typeof window !== 'undefined' && (
                      <Chart
                        options={categoryChartOptions}
                        series={categoryChartOptions.series}
                        type="donut"
                        height={300}
                      />
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="monthly" className="space-y-6">
                {/* Month selector */}
                <div className="flex justify-center mb-6">
                  <Select 
                    value={selectedMonth?.toString() || ""} 
                    onValueChange={(value) => setSelectedMonth(parseInt(value))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {summaryData?.monthly_data
                        .sort((a, b) => a.month - b.month)
                        .map((month) => (
                          <SelectItem key={month.month} value={month.month.toString()}>
                            {monthNames[month.month - 1]}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Display monthly category breakdown - Add key to force re-render when month changes */}
                <div key={`category-breakdown-${selectedMonth}`}>
                  {selectedMonthData ? (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-blue-50 p-4 border-b">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold flex items-center">
                            <PieChart className="h-5 w-5 mr-2 text-blue-500" />
                            {monthNames[selectedMonthData.month - 1]} Category Breakdown
                          </h3>
                          <div className="text-sm font-medium">
                            Total: {selectedMonthData.amount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Re-generate category breakdown each time to ensure fresh data */}
                      {selectedMonthData.category_breakdown && selectedMonthData.category_breakdown.length > 0 ? (
                        <div className="divide-y">
                          {selectedMonthData.category_breakdown
                            .sort((a, b) => b.amount - a.amount) // Re-sort to ensure fresh order
                            .map((category, index) => (
                              <div key={`${index}-${category.category_id}-${category.amount}`} className="p-4 hover:bg-gray-50">
                                <div className="flex justify-between items-center mb-2">
                                  <div className="flex items-center">
                                    <div 
                                      className="w-3 h-3 rounded-full mr-2"
                                      style={{ backgroundColor: category.category_color || '#CCCCCC' }}
                                    />
                                    <span className="font-medium text-gray-800">
                                      {category.category_name || 'Unknown Category'}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-gray-700 font-medium">
                                      {category.amount.toFixed(2)}
                                    </span>
                                    <div className="text-xs text-gray-500">
                                      {category.percentage}% of total
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="h-1.5 rounded-full bg-blue-500" 
                                    style={{ 
                                      width: `${category.percentage}%`,
                                      backgroundColor: category.category_color || '#CCCCCC'
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center">
                          {selectedMonthData.amount > 0 ? (
                            <div className="text-gray-500">
                              <p className="mb-3">
                                This expense doesn't have detailed category information. View the expense list for details.
                              </p>
                              <div className="bg-yellow-50 border border-yellow-100 rounded p-3 text-sm text-yellow-800">
                                <strong>Note:</strong> The total amount of {selectedMonthData.amount.toFixed(2)} may represent a single expense or 
                                expenses that haven't been properly categorized in the database.
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-500">No expenses recorded for this month.</p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center p-6 text-gray-500">
                      <p>Please select a month to see category breakdown.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnnualSummaryChart; 