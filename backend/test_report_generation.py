import requests
import os
import json
import sys
from datetime import datetime
from pprint import pprint

# Base URL of the API
BASE_URL = "http://localhost:8000"

def login():
    """Login to the API and get the access token"""
    try:
        url = f"{BASE_URL}/api/auth/login/json"
        data = {
            "email": "test@example.com",
            "password": "password123"
        }
        response = requests.post(url, json=data)
        response.raise_for_status()
        result = response.json()
        token = result.get("access_token")
        if not token:
            print("Failed to get token from login response:")
            print(response.text)
            sys.exit(1)
        return token
    except Exception as e:
        print(f"Login failed: {str(e)}")
        sys.exit(1)

def test_csv_report(token):
    """Test generating a CSV report"""
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    # Current year
    year = datetime.now().year
    
    # Test generating a CSV report with just the year parameter
    print("\nTesting CSV report generation (year only)...")
    url = f"{BASE_URL}/api/reports/csv?year={year}"
    
    try:
        response = requests.get(url, headers=headers, stream=True)
        if response.status_code == 200:
            # Save the CSV to a file
            filename = f"expense_report_{year}.csv"
            with open(filename, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"CSV report saved to {filename}")
            print("Content-Type:", response.headers.get("Content-Type"))
            print("Content-Disposition:", response.headers.get("Content-Disposition"))
            
            # Read the first few lines of the CSV
            with open(filename, 'r', encoding='utf-8') as f:
                lines = f.readlines()[:5]  # First 5 lines
                print("\nFirst few lines of the CSV:")
                for line in lines:
                    print(line.strip())
                    
            return True
        else:
            print(f"Failed to generate CSV report: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"Error generating CSV report: {str(e)}")
        return False

def test_pdf_report(token):
    """Test generating a PDF report"""
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    # Current year and month
    year = datetime.now().year
    month = datetime.now().month
    
    # Test generating a PDF report with year and month
    print("\nTesting PDF report generation (year and month)...")
    url = f"{BASE_URL}/api/reports/pdf?year={year}&month={month}"
    
    try:
        response = requests.get(url, headers=headers, stream=True)
        if response.status_code == 200:
            # Save the PDF to a file
            filename = f"expense_report_{year}_{month}.pdf"
            with open(filename, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"PDF report saved to {filename}")
            print("Content-Type:", response.headers.get("Content-Type"))
            print("Content-Disposition:", response.headers.get("Content-Disposition"))
            return True
        else:
            print(f"Failed to generate PDF report: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"Error generating PDF report: {str(e)}")
        return False

def test_annual_summary(token):
    """Test getting annual summary data"""
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    # Current year
    year = datetime.now().year
    
    # Test getting annual summary data
    print("\nTesting annual summary API...")
    url = f"{BASE_URL}/api/reports/summary/annual?year={year}"
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            summary_data = response.json()
            print("Annual summary data:")
            print(f"Year: {summary_data.get('year')}")
            print(f"Total amount: {summary_data.get('total_amount')}")
            print("\nMonthly data:")
            for month_data in summary_data.get('monthly_data', []):
                print(f"Month {month_data.get('month')}: {month_data.get('amount')} ({month_data.get('percentage'):.2f}%)")
            
            print("\nCategory data:")
            for cat_data in summary_data.get('category_data', []):
                print(f"{cat_data.get('name')}: {cat_data.get('amount')} ({cat_data.get('percentage'):.2f}%)")
            
            return True
        else:
            print(f"Failed to get annual summary: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"Error getting annual summary: {str(e)}")
        return False

def main():
    """Main function to run the test"""
    print("Testing Report Generation APIs")
    print("=============================")
    
    # Login and get the token
    token = login()
    if not token:
        print("Login failed. Cannot proceed with tests.")
        return
    
    print("Successfully logged in and obtained token.")
    
    # Test CSV report generation
    csv_result = test_csv_report(token)
    
    # Test PDF report generation
    pdf_result = test_pdf_report(token)
    
    # Test annual summary API
    summary_result = test_annual_summary(token)
    
    # Print summary
    print("\nTest Results:")
    print(f"CSV Report Generation: {'SUCCESS' if csv_result else 'FAILED'}")
    print(f"PDF Report Generation: {'SUCCESS' if pdf_result else 'FAILED'}")
    print(f"Annual Summary API: {'SUCCESS' if summary_result else 'FAILED'}")

if __name__ == "__main__":
    main() 