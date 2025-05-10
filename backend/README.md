# Expense Tracker Backend

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

A powerful and flexible API backend for the Expense Tracker application, built with FastAPI and SQLAlchemy.

## Features

- **RESTful API** designed with modern best practices
- **JWT Authentication** for secure user access
- **Role-based Authorization** with user and admin roles
- **OpenAPI Documentation** automatically generated
- **SQLAlchemy ORM** for database interactions
- **Pydantic Models** for request and response validation
- **Modular Architecture** for easy maintenance and scalability
- **Automatic API Documentation** with Swagger UI

## Tech Stack

- **FastAPI**: High-performance Python web framework
- **SQLAlchemy**: SQL toolkit and Object-Relational Mapping
- **Pydantic**: Data validation and settings management
- **SQLite**: Default database (can be configured to use PostgreSQL)
- **JWT**: JSON Web Tokens for authentication
- **ReportLab**: PDF generation for reports
- **Pytest**: For comprehensive testing

## Directory Structure

```
backend/
├── app/                    # Main application package
│   ├── core/               # Core functionality
│   │   ├── config.py       # Application configuration
│   │   ├── database.py     # Database connection
│   │   ├── deps.py         # Dependencies (auth, db)
│   │   └── security.py     # Security utilities
│   ├── models/             # SQLAlchemy ORM models
│   ├── routers/            # API route handlers
│   ├── schemas/            # Pydantic models for API I/O
│   ├── services/           # Business logic services
│   └── main.py             # Application entry point
├── tests/                  # Test cases
├── .env                    # Environment variables
├── requirements.txt        # Python dependencies
└── run.py                  # Server startup script
```

## Getting Started

### Prerequisites

- Python 3.9+
- pip (Python package manager)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/expense-tracker.git
   cd expense-tracker/backend
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

4. Configure the environment:
   ```
   cp .env.example .env
   ```
   Then edit the `.env` file with your preferred settings.

### Running the Server

Run the development server:
```
python run.py
```

The API will be available at http://localhost:8000.

API documentation will be available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Default Test User

The application automatically creates a test user on startup:
- Email: `test@example.com`
- Password: `password123`

You can use these credentials for testing the API.

## API Endpoints

The API is organized around the following resources:

### Authentication
- `POST /api/auth/login/json`: JSON login endpoint
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/password-reset/request`: Request password reset
- `POST /api/auth/password-reset/confirm`: Confirm password reset

### Users
- `GET /api/users/me`: Get current user information
- `PUT /api/users/me`: Update current user

### Categories
- `GET /api/categories`: List all categories
- `POST /api/categories`: Create a new category
- `GET /api/categories/{id}`: Get a specific category
- `PUT /api/categories/{id}`: Update a category
- `DELETE /api/categories/{id}`: Delete a category
- `POST /api/categories/defaults`: Create default categories

### Expenses
- `GET /api/expenses`: List all expenses with optional filtering
- `POST /api/expenses`: Create a new expense
- `GET /api/expenses/{id}`: Get a specific expense
- `PUT /api/expenses/{id}`: Update an expense
- `DELETE /api/expenses/{id}`: Delete an expense
- `GET /api/expenses/summary/monthly`: Get monthly expense summary

### Budgets
- `GET /api/budgets-list`: List all budgets
- `GET /api/budgets/{id}`: Get a specific budget
- `POST /api/budgets`: Create a new budget
- `PUT /api/budgets/{id}`: Update a budget
- `DELETE /api/budgets/{id}`: Delete a budget
- `GET /api/budgets/stats`: Get budget statistics
- `GET /api/budgets/overview/current`: Get current budgets overview

### Reports
- `GET /api/reports/csv`: Download CSV report
- `GET /api/reports/pdf`: Download PDF report
- `GET /api/reports/summary/annual`: Get annual summary data

## Development

### Database Migrations
The application uses SQLAlchemy for database ORM, and migrations can be handled with Alembic.

### Testing
Run tests with pytest:
```
pytest
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. 