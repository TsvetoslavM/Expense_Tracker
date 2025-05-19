/**
 * A utility file for currency conversion and formatting
 */

// Exchange rates with USD as the base currency
export const exchangeRates: Record<string, number> = {
  USD: 1.0,       // US Dollar (base)
  EUR: 0.93,      // Euro
  GBP: 0.80,      // British Pound 
  JPY: 151.64,    // Japanese Yen
  CAD: 1.37,      // Canadian Dollar
  AUD: 1.52,      // Australian Dollar
  CHF: 0.90,      // Swiss Franc
  CNY: 7.24,      // Chinese Yuan
  INR: 83.35,     // Indian Rupee
  RUB: 91.32,     // Russian Ruble
  BRL: 5.14,      // Brazilian Real
  ZAR: 18.38,     // South African Rand
  MXN: 17.07,     // Mexican Peso
  SGD: 1.34,      // Singapore Dollar
  NZD: 1.64,      // New Zealand Dollar
  SEK: 10.53,     // Swedish Krona
  NOK: 10.68,     // Norwegian Krone
};

// Supported currencies
export const supportedCurrencies = Object.keys(exchangeRates).sort((a, b) => a.localeCompare(b));

// Currency symbols mapping
export const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'Fr',
  CNY: '¥',
  INR: '₹',
  RUB: '₽',
  BRL: 'R$',
  ZAR: 'R',
  MXN: '$',
  SGD: 'S$',
  NZD: 'NZ$',
  SEK: 'kr',
  NOK: 'kr',
};

/**
 * Convert an amount from one currency to another
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number => {
  if (!amount) return 0;
  if (fromCurrency === toCurrency) return amount;

  // Convert from source currency to USD first
  const amountInUSD = fromCurrency === 'USD' 
    ? amount 
    : amount / (exchangeRates[fromCurrency] || 1);
  
  // Then convert from USD to target currency
  return toCurrency === 'USD' 
    ? amountInUSD 
    : amountInUSD * (exchangeRates[toCurrency] || 1);
};

/**
 * Format a number as a currency string
 */
export const formatCurrencyAmount = (amount: number, currency: string = 'USD'): string => {
  const symbol = currencySymbols[currency] || '';
  
  // Format based on currency
  // Some currencies like JPY don't typically show decimal places
  const precision = ['JPY', 'KRW', 'IDR'].includes(currency) ? 0 : 2;
  
  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(amount);
  
  return `${symbol}${formattedAmount}`;
}; 