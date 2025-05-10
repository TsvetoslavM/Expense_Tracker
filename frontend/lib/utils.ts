import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Truncates a string to a specified length and adds ellipsis
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

/**
 * Gets a readable time period from a date
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  
  return formatDate(dateString)
}

/**
 * Generates a random color hex code
 */
export function getRandomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
}

/**
 * Calculates contrast between color and white to determine text color
 */
export function getContrastTextColor(hexColor: string): string {
  // Remove the hash if it exists
  hexColor = hexColor.replace('#', '')
  
  // Parse the color to get r, g, b values
  const r = parseInt(hexColor.substring(0, 2), 16)
  const g = parseInt(hexColor.substring(2, 4), 16)
  const b = parseInt(hexColor.substring(4, 6), 16)
  
  // Calculate brightness according to the formula
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  
  // Return black for bright colors, white for dark colors
  return brightness > 128 ? '#000000' : '#ffffff'
}

/**
 * Formats a number as currency, using the user's preferred currency if available
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
) {
  // Try to get the user's preferred currency from localStorage
  if (typeof window !== 'undefined') {
    try {
      const userData = localStorage.getItem('userData')
      if (userData) {
        const user = JSON.parse(userData)
        if (user.preferred_currency) {
          currency = user.preferred_currency
        }
      }
    } catch (error) {
      console.error('Error getting preferred currency:', error)
      // Use the provided currency as fallback
    }
  }
  
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: currency === 'JPY' ? 0 : 2,
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
  })
  
  return formatter.format(amount)
}

/**
 * Formats a date string to a localized date
 */
export function formatDate(
  date: string | Date,
  format: 'short' | 'long' | 'relative' = 'short'
) {
  const dateObj = typeof date === "string" ? new Date(date) : date
  
  if (format === 'relative') {
    const now = new Date()
    const diffMs = now.getTime() - dateObj.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffSecs < 60) return 'just now'
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }
  
  const options: Intl.DateTimeFormatOptions = 
    format === 'long' 
      ? { year: 'numeric', month: 'long', day: 'numeric' }
      : { year: 'numeric', month: 'short', day: 'numeric' }
      
  return new Intl.DateTimeFormat('en-US', options).format(dateObj)
}

/**
 * Truncates a string if it's longer than maxLength
 */
export function truncate(str: string, maxLength: number = 50) {
  if (str.length <= maxLength) return str
  return `${str.slice(0, maxLength)}...`
}

/**
 * Gets a contrasting text color (black or white) based on background color
 */
export function getContrastText(hexColor: string) {
  // Remove the # if present
  const color = hexColor.replace('#', '')
  
  // Convert to RGB
  const r = parseInt(color.substr(0, 2), 16)
  const g = parseInt(color.substr(2, 2), 16)
  const b = parseInt(color.substr(4, 2), 16)
  
  // Calculate brightness (YIQ formula)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  
  return brightness >= 128 ? '#000000' : '#FFFFFF'
}

/**
 * Adds delay for asynchronous operations (useful for testing or animations)
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Scrolls to the top of the page smoothly
 */
export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * Gets initials from a name
 */
export function getInitials(name: string): string {
  if (!name) return ''
  
  const parts = name.split(' ')
  if (parts.length === 1) return name.substring(0, 2).toUpperCase()
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}