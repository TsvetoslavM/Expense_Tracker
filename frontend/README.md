# Expense Tracker Frontend

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)

A modern, responsive web application for tracking and managing personal finances, built with Next.js and TypeScript.

## Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Dynamic Dashboard**: Real-time financial overview with charts and statistics
- **Expense Management**: Add, edit, and delete expenses with comprehensive filtering options
- **Budget Tracking**: Set budgets by category and track spending against them
- **Category Management**: Customize expense categories with colors
- **Report Generation**: Download detailed expense reports in PDF and CSV formats
- **User Settings**: Personalize currency, profile information, and notification preferences
- **Authentication**: Secure login, registration, and password recovery

## Tech Stack

- **Next.js**: React framework for production-grade applications
- **TypeScript**: Type-safe JavaScript for better developer experience
- **TailwindCSS**: Utility-first CSS framework for rapid UI development
- **Shadcn UI**: High-quality UI components built on Radix UI
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation for forms and data
- **Axios**: HTTP client for API requests
- **ApexCharts**: Interactive charts and data visualization
- **Lucide Icons**: Beautiful, consistent icon set

## Directory Structure

```
frontend/
├── components/          # Reusable UI components
│   ├── layout/          # Layout components
│   ├── ui/              # Base UI components
├── context/             # React context providers
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and API clients
├── pages/               # Next.js pages
│   ├── api/             # API routes
│   ├── auth/            # Authentication pages
│   ├── dashboard/       # Dashboard pages
│   ├── expenses/        # Expense management pages
│   ├── categories/      # Category management pages
│   ├── budgets/         # Budget management pages
│   └── reports/         # Report generation pages
├── public/              # Static assets
├── styles/              # Global styles
├── types/               # TypeScript type definitions
├── next.config.js       # Next.js configuration
└── package.json         # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/expense-tracker.git
   cd expense-tracker/frontend
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Configure environment variables:
   ```
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration.

### Development

Run the development server:
```
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:3000.

### Building for Production

Build the application for production:
```
npm run build
# or
yarn build
```

Start the production server:
```
npm run start
# or
yarn start
```

## Pages and Components

### Main Pages
- **Dashboard**: Overview of financial status with charts and stats
- **Expenses**: Manage and filter expenses
- **Categories**: Create and manage expense categories
- **Budgets**: Set and track spending budgets
- **Reports**: Generate and download financial reports
- **Settings**: Configure user preferences and account details

### Key Components
- **PageContainer**: Consistent layout wrapper for all pages
- **StatCard**: Display key financial metrics
- **CurrencyDisplay**: Format and display currency values
- **AnnualSummaryChart**: Visualize yearly spending patterns
- **ExpenseTable**: Interactive expense listing with filtering

## State Management

- **AuthContext**: Handles user authentication and session management
- **Custom hooks**: Encapsulate business logic for reusability

## Form Handling

Forms are built with React Hook Form and Zod for validation:
- Strong typing with TypeScript
- Efficient form rendering
- Comprehensive validation rules
- Intuitive error handling

## Styling

The application uses TailwindCSS for styling with:
- Consistent design system
- Responsive layouts
- Dark mode support
- Custom components built on Shadcn UI

## API Integration

- API client built with Axios
- Type-safe API responses
- Automatic authentication token handling
- Centralized error handling

## Testing

Run tests with Jest:
```
npm run test
# or
yarn test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. 