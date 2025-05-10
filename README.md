# Expense Tracker

A comprehensive financial management application built with FastAPI and Next.js that helps users track expenses, manage budgets, and generate insightful reports.

## Features

- **User Authentication**: Secure login/registration system with JWT authentication
- **Expense Management**: Add, edit, and delete expenses with categories and tags
- **Budget Planning**: Create monthly or yearly budgets for different expense categories
- **Reporting**: Generate detailed PDF and CSV reports of your spending habits
- **Data Visualization**: Interactive charts and graphs to visualize your financial data
- **Category Management**: Customize expense categories with colors and icons
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend
- **FastAPI**: High-performance Python web framework
- **SQLAlchemy**: ORM for database interactions
- **Pydantic**: Data validation and settings management
- **JWT**: Authentication mechanism
- **SQLite**: Database (can be easily replaced with PostgreSQL, MySQL, etc.)
- **ReportLab**: PDF report generation

### Frontend
- **Next.js**: React framework for the frontend
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS**: Utility-first CSS framework
- **Shadcn UI**: Component library based on Radix UI
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation
- **ApexCharts**: Interactive charts

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```
   cp .env.example .env
   ```
   Edit the `.env` file with your desired configuration.

5. Run the server:
   ```
   python run.py
   ```
   The API will be available at http://localhost:8000

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```
   The application will be available at http://localhost:3000

## Usage

### Login and Registration

- Navigate to the login page and use the default credentials:
  - Email: `test@example.com`
  - Password: `password123`
- Or register a new account

### Adding Expenses

1. Navigate to the Expenses page
2. Click "Add New Expense"
3. Fill in the expense details:
   - Amount
   - Date
   - Category
   - Description (optional)
   - Notes (optional)
4. Click "Save"

### Managing Budgets

1. Navigate to the Budgets page
2. Create a new budget by selecting:
   - Category
   - Amount
   - Period (monthly/yearly)
3. View budget performance compared to actual spending

### Generating Reports

1. Navigate to the Reports page
2. Select the report type (PDF or CSV)
3. Choose the time period (year and optional month)
4. Select a category (optional)
5. Click "Generate Report"
6. The report will be downloaded to your device

## API Endpoints

The backend provides a comprehensive API for all functionality. Key endpoints include:

- **Authentication**: `/api/auth/login`, `/api/auth/register`
- **Users**: `/api/users/me`
- **Expenses**: `/api/expenses`, `/api/expenses/{id}`
- **Categories**: `/api/categories`, `/api/categories/{id}`
- **Budgets**: `/api/budgets`, `/api/budgets/{id}`
- **Reports**: `/api/reports/csv`, `/api/reports/pdf`, `/api/reports/summary/annual`

Full API documentation is available at `http://localhost:8000/docs` when the server is running.

## Screenshots

[Include screenshots of key pages here]

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
- [Next.js](https://nextjs.org/) for the frontend framework
- [TailwindCSS](https://tailwindcss.com/) for styling
- [Shadcn UI](https://ui.shadcn.com/) for UI components
- [ApexCharts](https://apexcharts.com/) for data visualization 