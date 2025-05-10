import React, { ButtonHTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 focus-visible:ring-indigo-500",
        destructive: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500",
        outline: "border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 active:bg-indigo-100 focus-visible:ring-indigo-500",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 focus-visible:ring-gray-500",
        ghost: "bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-700 focus-visible:ring-gray-500",
        link: "bg-transparent underline-offset-4 hover:underline text-indigo-600 hover:text-indigo-700 focus-visible:ring-indigo-500",
        gradient: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 active:from-indigo-800 active:to-purple-800 focus-visible:ring-indigo-500",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
      fullWidth: {
        true: "w-full",
      },
      withIcon: {
        true: "group",
      },
      loading: {
        true: "relative text-transparent transition-none hover:text-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, withIcon, loading, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, withIcon, loading }), className)}
        ref={ref}
        disabled={props.disabled || loading}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="animate-spin h-5 w-5 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}
        {props.children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants } 