import { useState, useEffect } from 'react'
import useCurrency from '@/hooks/useCurrency'
import { supportedCurrencies, exchangeRates, currencySymbols } from '@/hooks/currencyConstants'
import { ArrowDownUp, DollarSign, TrendingUp } from 'lucide-react'

interface CurrencyConverterProps {
  showTitle?: boolean
}

export default function CurrencyConverter({ showTitle = true }: CurrencyConverterProps) {
  const { preferredCurrency, convertAmount, formatAmount } = useCurrency()
  const [amount, setAmount] = useState<number>(100)
  const [fromCurrency, setFromCurrency] = useState<string>('USD')
  const [convertedAmounts, setConvertedAmounts] = useState<Array<{ currency: string; amount: number }>>([])

  useEffect(() => {
    if (!amount) {
      setConvertedAmounts([])
      return
    }

    // Convert to all currencies and sort results
    const results = supportedCurrencies.map(currency => {
      const convertedValue = convertAmount(amount, fromCurrency)
      const valueInTargetCurrency = 
        convertedValue / (exchangeRates[preferredCurrency] || 1) * (exchangeRates[currency] || 1)
      
      return {
        currency,
        amount: valueInTargetCurrency
      }
    }).sort((a, b) => {
      // Sort preferred currency first, then alphabetically
      if (a.currency === preferredCurrency) return -1
      if (b.currency === preferredCurrency) return 1
      return a.currency.localeCompare(b.currency)
    })

    setConvertedAmounts(results)
  }, [amount, fromCurrency, preferredCurrency, convertAmount])

  return (
    <div className="converter-widget">
      {showTitle && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-indigo-500" />
          Currency Converter
        </h3>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">{currencySymbols[fromCurrency] || ''}</span>
            </div>
            <input
              type="number"
              name="amount"
              id="amount"
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="0.00"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="fromCurrency" className="block text-sm font-medium text-gray-700 mb-1">
            From Currency
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ArrowDownUp className="h-4 w-4 text-gray-400" />
            </div>
            <select
              id="fromCurrency"
              name="fromCurrency"
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
            >
              {supportedCurrencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency} ({currencySymbols[currency] || ''})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Main conversion box with shadow and gradient */}
      <div className="bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-md p-4 border border-indigo-100">
        {/* Summary at the top */}
        <div className="bg-indigo-50 p-3 rounded-lg mb-4 text-center">
          <p className="text-sm text-gray-500">
            <span className="font-medium text-indigo-600">{formatAmount(amount, fromCurrency)}</span> is approximately
          </p>
          <p className="text-xl font-bold text-indigo-700">
            {formatAmount(convertAmount(amount, fromCurrency))}
          </p>
          <p className="text-xs text-gray-500">in your preferred currency ({preferredCurrency})</p>
        </div>
        
        {amount > 0 && convertedAmounts.length > 0 ? (
          <>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1 text-indigo-500" />
              All Currencies
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {convertedAmounts.slice(0, 9).map((item) => (
                <div 
                  key={item.currency}
                  className={`text-sm p-2 rounded ${item.currency === preferredCurrency ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-50'}`}
                >
                  <div className="font-medium">{item.currency}</div>
                  <div>{formatAmount(item.amount, item.currency)}</div>
                </div>
              ))}
            </div>
            
            {convertedAmounts.length > 9 && (
              <div className="mt-2 text-center">
                <button className="text-xs text-indigo-600 hover:text-indigo-800">
                  View all currencies
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Enter an amount to see conversions
          </div>
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>Exchange rates are updated periodically and should be considered approximate.</p>
      </div>
    </div>
  )
} 