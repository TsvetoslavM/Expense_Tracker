import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { currencySymbols, exchangeRates } from './currencyConstants'

// Define minimal interfaces and constants
interface User {
  preferred_currency?: string;
}

/**
 * Hook that provides access to the user's preferred currency
 * and functions to format amounts using that currency
 */
export const useCurrency = () => {
  const { user } = useAuth()
  const [preferredCurrency, setPreferredCurrency] = useState<string>('USD')
  
  // Update preferred currency when user changes
  useEffect(() => {
    if (user?.preferred_currency) {
      setPreferredCurrency(user.preferred_currency)
    }
  }, [user])

  const convertAmount = useCallback((amount: number, fromCurrency: string = 'USD'): number => {
    if (!amount) return 0
    if (fromCurrency === preferredCurrency) return amount

    // Convert from source currency to USD first (if not already USD)
    const amountInUSD = fromCurrency === 'USD' 
      ? amount 
      : amount / (exchangeRates[fromCurrency] || 1)
      
    // Then convert from USD to preferred currency
    return preferredCurrency === 'USD' 
      ? amountInUSD 
      : amountInUSD * (exchangeRates[preferredCurrency] || 1)
  }, [preferredCurrency])

  const formatAmount = useCallback((amount: number, currency: string = preferredCurrency): string => {
    const symbol = currencySymbols[currency] || ''
    const precision = ['JPY'].includes(currency) ? 0 : 2
    
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }).format(amount)
    
    return `${symbol}${formattedAmount}`
  }, [preferredCurrency])

  return {
    preferredCurrency,
    convertAmount,
    formatAmount,
    // Utility to both convert and format in one step
    convertAndFormat: useCallback((amount: number, fromCurrency: string = 'USD'): string => {
      const convertedAmount = convertAmount(amount, fromCurrency)
      return formatAmount(convertedAmount)
    }, [convertAmount, formatAmount])
  }
}

export default useCurrency 