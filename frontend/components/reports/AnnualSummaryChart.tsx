import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { reportAPI } from '@/lib/api';
import { Loader2 } from "lucide-react";

// Use ApexCharts for visualizations
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface AnnualSummaryProps {
  defaultYear?: number;
}

interface CategoryData {
  name: string;
  color: string;
  amount: number;
  percentage: number;
}

interface MonthlyData {
  month: number;
  amount: number;
  percentage: number;
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

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Available years for selection
  const availableYears = Array.from(
    { length: 5 }, 
    (_, i) => new Date().getFullYear() - 2 + i
  );

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
      
      setSummaryData(data);
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

  const monthlyChartOptions = getMonthlyChartOptions();
  const categoryChartOptions = getCategoryChartOptions();

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
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">
            {error}
          </div>
        ) : summaryData ? (
          <div className="space-y-8">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold">
                Total Expenses: <span className="text-blue-600">{summaryData.total_amount.toFixed(2)}</span>
              </h3>
            </div>
            
            {/* Monthly Expense Chart */}
            <div className="h-72">
              {monthlyChartOptions && (
                <Chart 
                  options={monthlyChartOptions}
                  series={monthlyChartOptions.series || []}
                  type="area"
                  height="100%"
                />
              )}
            </div>
            
            {/* Category Distribution Chart */}
            <div className="h-80">
              {categoryChartOptions && (
                <Chart 
                  options={categoryChartOptions}
                  series={categoryChartOptions.series || []}
                  type="donut"
                  height="100%"
                />
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground p-4">
            No data available for {year}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnnualSummaryChart; 