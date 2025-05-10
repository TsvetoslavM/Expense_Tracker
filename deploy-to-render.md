# Deploying Expense Tracker to Render

This guide explains how to deploy the Expense Tracker application to Render.

## Prerequisites

1. A Render account - sign up at [render.com](https://render.com)
2. Your project code pushed to a GitHub repository

## Deployment Steps

### 1. Deploy the Backend API

1. Log in to your Render dashboard
2. Click "New" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `expense-tracker-api` (or your preferred name)
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free (or select a plan that suits your needs)

5. Add the following environment variables:
   - `DEBUG`: `false`
   - `USE_SQLITE`: `false`
   - `SECRET_KEY`: (generate a secure random string)
   - `ACCESS_TOKEN_EXPIRE_MINUTES`: `60`
   - `FRONTEND_URL`: (your frontend URL, once you have it)
   - `BACKEND_CORS_ORIGINS`: `["https://your-frontend-url.onrender.com", "http://localhost:3000"]`

6. Click "Create Web Service"

### 2. Create a PostgreSQL Database

1. From your Render dashboard, click "New" and select "PostgreSQL"
2. Configure the database:
   - **Name**: `expense-tracker-db` (or your preferred name)
   - **Database**: `expense_tracker`
   - **User**: (auto-generated)
   - **Plan**: Free (or select a plan that suits your needs)
3. Click "Create Database"
4. Once created, go to your database dashboard and copy the "Internal Database URL"
5. Add this as an environment variable to your backend service:
   - Go to your backend service dashboard
   - Click "Environment" 
   - Add environment variable `DATABASE_URL` with the Internal Database URL value

### 3. Deploy the Frontend

1. From your Render dashboard, click "New" and select "Web Service"
2. Connect your GitHub repository again
3. Configure the service:
   - **Name**: `expense-tracker-frontend` (or your preferred name)
   - **Root Directory**: `frontend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or select a plan that suits your needs)

4. Add environment variables:
   - `NEXT_PUBLIC_API_URL`: (your backend API URL)

5. Click "Create Web Service"

### 4. Update Frontend-Backend Connection

1. Once your frontend is deployed, get its URL from the Render dashboard
2. Go to your backend service dashboard
3. Update the `FRONTEND_URL` environment variable with your frontend URL
4. Update the `BACKEND_CORS_ORIGINS` with your frontend URL in JSON array format

### 5. Initialize the Database

1. Go to your backend service dashboard in Render
2. Navigate to "Shell"
3. Run the following command to create test user and default data:
   ```
   python -c "from app.core.database import init_db; init_db()"
   ```

## Testing Your Deployment

1. Visit your frontend URL
2. Try logging in with the default test user:
   - Email: `test@example.com`
   - Password: `password123`
3. Create some expenses and categories to verify the application is working correctly

## Troubleshooting

- **CORS Issues**: Make sure the backend's `BACKEND_CORS_ORIGINS` includes your frontend URL
- **Database Connection Issues**: Verify the `DATABASE_URL` environment variable is correct
- **API Connection Failures**: Check that `NEXT_PUBLIC_API_URL` in the frontend points to your backend service

## Switching Back to Development Mode

When working locally, make sure to:
1. Set `USE_SQLITE` to `true` in your `.env` file
2. Set `DEBUG` to `true`
3. Update API URLs to use localhost 