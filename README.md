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

Check out [💰 Can try it 💰](https://expense-tracker-zwetoslaw-gmailcoms-projects.vercel.app/login).
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

## 📚 Documentation

### Backend

The backend provides a RESTful API for the frontend to consume:

- **Authentication API**: User registration, login, and password reset
- **Expense API**: CRUD operations for expenses with filtering and sorting
- **Category API**: Manage expense categories
- **Budget API**: Create and track budgets by category
- **Report API**: Generate financial reports in PDF and CSV formats

Comprehensive API documentation is available at http://localhost:8000/docs when the server is running.

### Frontend

The frontend is a modern React application built with Next.js:

- **Dashboard**: Overview of financial status with charts and stats
- **Expenses**: Manage and filter expenses
- **Categories**: Create and manage expense categories
- **Budgets**: Set and track spending budgets
- **Reports**: Generate and download financial reports
- **Settings**: Configure user preferences and account details

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

## 🛠️ Technologies

### Backend
- **FastAPI**: High-performance Python web framework
- **SQLAlchemy**: ORM for database interactions
- **Pydantic**: Data validation and settings management
- **JWT**: Authentication mechanism
- **SQLite**: Database (can be easily replaced with PostgreSQL)
- **ReportLab**: PDF report generation

### Frontend
- **Next.js**: React framework for the frontend
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS**: Utility-first CSS framework
- **Shadcn UI**: Component library based on Radix UI
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation
- **ApexCharts**: Interactive charts

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
- [Next.js](https://nextjs.org/) for the frontend framework
- [TailwindCSS](https://tailwindcss.com/) for styling
- [Shadcn UI](https://ui.shadcn.com/) for UI components
- [ApexCharts](https://apexcharts.com/) for data visualization

---

<div align="center">
  <p>Made with ❤️ for better financial management</p>
  <p>
    <a href="https://github.com/yourusername/expense-tracker/issues">Report Bug</a>
    ·
    <a href="https://github.com/yourusername/expense-tracker/issues">Request Feature</a>
  </p>
</div> 