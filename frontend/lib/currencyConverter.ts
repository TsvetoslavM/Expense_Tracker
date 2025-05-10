// Exchange rates against USD (as of a recent date)
// In a production app, these would be fetched from an API like Open Exchange Rates or Fixer.io
export const exchangeRates: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 152.15,
  CAD: 1.37,
  AUD: 1.51,
  CHF: 0.89,
  CNY: 7.23,
  INR: 83.1,
  RUB: 91.76,
}

/**
 * Converts an amount from one currency to another
 * @param amount The amount to convert
 * @param fromCurrency The source currency code
 * @param toCurrency The target currency code
 * @returns The converted amount
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string = 'USD',
  toCurrency: string = 'USD'
): number {
  // If currencies are the same, no conversion needed
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  // Check if both currencies are supported
  if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
    console.warn(`Currency conversion not supported for ${fromCurrency} to ${toCurrency}`);
    return amount;
  }
  
  // Convert to USD first (base currency)
  const amountInUSD = amount / exchangeRates[fromCurrency];
  
  // Then convert from USD to target currency
  return amountInUSD * exchangeRates[toCurrency];
}

/**
 * Format a currency amount with proper currency symbol
 * @param amount The amount to format
 * @param currency The currency code
 * @param locale The locale for number formatting
 * @returns Formatted currency string
 */
export function formatCurrencyAmount(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get currency symbol for a currency code
 * @param currency The currency code
 * @param locale The locale for formatting
 * @returns The currency symbol
 */
export function getCurrencySymbol(
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  const parts = formatter.formatToParts(0);
  const currencySymbol = parts.find(part => part.type === 'currency')?.value || currency;
  
  return currencySymbol;
}

export default {
  convertCurrency,
  formatCurrencyAmount,
  getCurrencySymbol,
  exchangeRates
}; 