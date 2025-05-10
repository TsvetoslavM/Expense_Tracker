import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { exchangeRates, formatCurrencyAmount } from '@/lib/utils/currencyUtils';

export const useCurrency = () => {
  const { user } = useAuth();
  const [preferredCurrency, setPreferredCurrency] = useState<string>('USD');

  useEffect(() => {
    if (user?.preferred_currency) {
      setPreferredCurrency(user.preferred_currency);
    }
  }, [user]);

  const convertAmount = useCallback((amount: number, fromCurrency: string = 'USD'): number => {
    if (!amount) return 0;
    if (fromCurrency === preferredCurrency) return amount;

    // Convert from source currency to USD first (if not already USD)
    const amountInUSD = fromCurrency === 'USD' 
      ? amount 
      : amount / (exchangeRates[fromCurrency] || 1);
      
    // Then convert from USD to preferred currency
    return preferredCurrency === 'USD' 
      ? amountInUSD 
      : amountInUSD * (exchangeRates[preferredCurrency] || 1);
  }, [preferredCurrency]);

  const formatAmount = useCallback((amount: number, currency: string = preferredCurrency): string => {
    return formatCurrencyAmount(amount, currency);
  }, [preferredCurrency]);

  return {
    preferredCurrency,
    convertAmount,
    formatAmount,
    // Utility to both convert and format in one step
    convertAndFormat: useCallback((amount: number, fromCurrency: string = 'USD'): string => {
      const convertedAmount = convertAmount(amount, fromCurrency);
      return formatAmount(convertedAmount);
    }, [convertAmount, formatAmount])
  };
};

export default useCurrency; 