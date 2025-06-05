<div align="center">

# 💰 Expense Tracker made by Tsvetoslav Makaveev

<img src="https://img.shields.io/badge/version-1.0.0-blue.svg?style=for-the-badge" alt="Version 1.0.0"/>
<img src="https://img.shields.io/badge/license-MIT-green.svg?style=for-the-badge" alt="License MIT"/>

**Manage your finances with ease. Track expenses, set budgets, and visualize your financial journey.**

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite"/>
</p>

Check out [💰 Try it now 💰](https://expense-tracker-zwetoslaw-gmailcoms-projects.vercel.app/login).
</div>

## 📋 Features

- **📊 Dynamic Dashboard**: Get a visual overview of your financial health
- **💸 Expense Management**: Easily track where your money goes
- **💹 Budget Planning**: Set meaningful spending limits by category
- **📝 Detailed Reports**: Generate PDF and CSV reports of your finances
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **🌈 Customizable Categories**: Organize expenses your way with colored categories
- **🔐 Secure Authentication**: Keep your financial data private

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- Python 3.9+
- npm or yarn

### Getting Started (All-in-One)

For convenience, you can start both services at once:

```bash
# Clone the repository
git clone https://github.com/yourusername/expense-tracker.git
cd expense-tracker

# Start both backend and frontend
node start-dev.js
```

The frontend will be available at http://localhost:3000 and the backend at http://localhost:8000.

### Default Login

```
Email: test@example.com
Password: password123
```

## 🏛️ Architecture

This project is built with a modern, decoupled architecture:

- **Frontend**: Next.js application with TypeScript, TailwindCSS, and Shadcn UI
- **Backend**: FastAPI application with SQLAlchemy, Pydantic, and JWT authentication
- **Database**: SQLite by default (can be configured to use PostgreSQL)

### Deployment Architecture

The application is deployed on Render.com with a continuous deployment pipeline:

- **Frontend**: Deployed as a Node.js web service on Render
- **Backend**: Deployed as a Python web service on Render
- **Database**: SQLite with persistent storage
- **CI/CD**: GitHub Actions for automated testing, code quality analysis via SonarCloud, and deployment

For a detailed view of the deployment architecture, see [Deployment Diagram](docs/deployment_diagram.md).
For more information about the CI/CD process, see [CI/CD Process](docs/ci_cd_process.md).

## 📚 User Stories

### For Regular Users:
1. **As a new user**, I want to register in the system to start tracking my expenses.
2. **As a registered user**, I want to log in to the system using email and password to access my data.
3. **As a user**, I want to be able to enter new expenses to track where my money goes.
4. **As a user**, I want to categorize my expenses to have a better overview of my spending.
5. **As a user**, I want to see a summary of my expenses on the Dashboard to quickly assess my financial status.
6. **As a user**, I want to set budgets by category to control my expenses.
7. **As a user**, I want to generate reports for a specific period to analyze my financial behavior.
8. **As a user**, I want to receive notifications when I approach or exceed my budget to adjust my spending habits.
9. **As a user**, I want to be able to edit or delete expenses in case of input errors.
10. **As a user**, I want to customize my categories with different colors for easier visual recognition.

### For Administrators:
11. **As an administrator**, I want to see a list of all users to properly manage the system.
12. **As an administrator**, I want to be able to deactivate accounts if necessary for system security.
13. **As an administrator**, I want to have access to system usage statistics to optimize its operation.

## 🔄 Use Cases

### UC1: New User Registration
**User**: Unregistered user
**Goal**: Create a new account in the system
**Precondition**: User has a valid email address
**Main Scenario**:
1. User visits the application's home page
2. User selects the "Register" option
3. System displays the registration form
4. User enters their email, password, and other required data
5. User submits the form
6. System validates the entered data
7. System creates a new account and stores the information in the database
8. System automatically logs the user in
9. System redirects the user to the Dashboard
**Alternative Scenario**:
- If the email already exists, the system displays an error message
- If the password doesn't meet security requirements, the system shows an appropriate message

### UC2: Adding a New Expense
**User**: Registered user
**Goal**: Record a new expense in the system
**Precondition**: User is logged into the system
**Main Scenario**:
1. User selects "Add Expense" from the navigation
2. System displays the expense entry form
3. User enters amount, category, date, and description of the expense
4. User submits the form
5. System validates the entered data
6. System records the new expense in the database
7. System shows a success message
8. System updates the Dashboard with the new information
**Alternative Scenario**:
- If the entered data is invalid, the system displays an error message

### UC3: Setting a Budget
**User**: Registered user
**Goal**: Create a budget for a specific expense category
**Precondition**: User is logged in and has created categories
**Main Scenario**:
1. User selects the "Budgets" section from the navigation
2. System displays a list of current budgets and an option to add new ones
3. User selects "Add Budget"
4. System displays the budget creation form
5. User selects category, period (month/year), and maximum amount
6. User submits the form
7. System validates the entered data
8. System records the new budget in the database
9. System shows the updated list of budgets
**Alternative Scenario**:
- If a budget for the same category and period already exists, the system offers to edit it

### UC4: Generating a Report
**User**: Registered user
**Goal**: Create a detailed report for a specific period
**Precondition**: User is logged in and has recorded expenses
**Main Scenario**:
1. User selects the "Reports" section from the navigation
2. System displays report generation options
3. User selects report type (PDF or CSV), period, and other filters
4. User selects "Generate Report"
5. System processes the data for the selected period
6. System generates the report in the selected format
7. System provides the report for download or visualization
**Alternative Scenario**:
- If there is no data for the selected period, the system shows an appropriate message

### UC5: Viewing the Dashboard
**User**: Registered user
**Goal**: Get an overview of financial status
**Precondition**: User is logged into the system
**Main Scenario**:
1. User selects "Dashboard" from the navigation or logs in
2. System retrieves data for expenses, budgets, and other financial indicators
3. System processes the data and generates various charts and statistics
4. System displays information about recent expenses, total expenses for the current month, budget progress, and expense distribution by category
5. User can select different filters or periods for visualization
**Alternative Scenario**:
- If the user has no entered data, the system shows guidelines for getting started

## 🏗️ Infrastructure with Terraform

The project uses Terraform to manage the infrastructure and deployment of both frontend and backend services. The infrastructure is defined in the `terraform` directory.

### Prerequisites

- Docker
- Terraform CLI

### Infrastructure Components

- **Docker Network**: `expense_tracker_network` for container communication
- **Docker Volume**: `expense_tracker_sqlite_data` for persistent database storage
- **Backend Container**: FastAPI application running on port 8000
- **Frontend Container**: Next.js application running on port 3000

### Deployment

1. Initialize Terraform:
```bash
cd terraform
terraform init
```

2. Apply the infrastructure:
```bash
terraform apply
```

3. Access the applications:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

### Infrastructure Management

- **Health Checks**: Both containers have health checks configured
- **Volume Persistence**: SQLite data is persisted using Docker volumes
- **Network Isolation**: Containers communicate through a dedicated Docker network
- **Environment Variables**: Configured through Terraform for both services

### Cleanup

To destroy the infrastructure:
```bash
terraform destroy
```

## 📁 Project Structure

```
expense-tracker/
├── backend/              # FastAPI application
│   ├── app/              # Main application package
│   │   ├── core/         # Core functionality
│   │   ├── models/       # Database models
│   │   ├── routers/      # API endpoints
│   │   ├── schemas/      # Pydantic models
│   │   └── services/     # Business logic
│   ├── tests/            # Test cases
│   └── run.py            # Server startup script
├── frontend/             # Next.js application
│   ├── components/       # Reusable UI components
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and API clients
│   ├── pages/            # Next.js pages
│   └── public/           # Static assets
└── start-dev.js          # Development startup script
```

## 💻 Development

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Continuous Integration & Deployment

The project uses GitHub Actions for CI/CD:

1. **Linting**: ESLint, Prettier, Black, isort, and Pylint
2. **Testing**: Automated testing with pytest and coverage reports
3. **Code Quality**: SonarCloud for static code analysis
4. **Deployment**: Automatic deployment to Render on successful builds

### Code Quality Tools

- **Frontend**: ESLint, Prettier
- **Backend**: Black, isort, Pylint
- **Analysis**: SonarCloud

## 🛠️ Technologies

### Backend
- **FastAPI**: High-performance Python web framework
- **SQLAlchemy**: ORM for database interactions
- **Pydantic**: Data validation and settings management
- **JWT**: Authentication mechanism
- **SQLite**: Database (can be easily replaced with PostgreSQL)
- **ReportLab**: PDF report generation

### Frontend
- **Next.js**: React framework for production
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS**: Utility-first CSS framework
- **Shadcn UI**: UI components
- **ApexCharts**: Data visualization

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Contact

For any questions or suggestions, please reach out to:
- Email: your.email@example.com
- GitHub: [Your GitHub Profile](https://github.com/yourusername)

---

<div align="center">
  <p>Made with ❤️ for better financial management</p>
  <p>
    <a href="https://github.com/yourusername/expense-tracker/issues">Report Bug</a>
    ·
    <a href="https://github.com/yourusername/expense-tracker/issues">Request Feature</a>
  </p>
</div> 