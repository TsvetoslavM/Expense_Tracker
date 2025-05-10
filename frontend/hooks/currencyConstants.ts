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
};

// Supported currencies
export const supportedCurrencies = Object.keys(exchangeRates).sort();

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
}; 