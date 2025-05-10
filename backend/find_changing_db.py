import os
import time
import requests
import json
from datetime import datetime
import threading

# Configuration
API_URL = "http://localhost:8000"
TEST_USER = {
    "email": "test@example.com",
    "password": "password123"
}
DB_FILES_TO_MONITOR = [
    "expense_tracker.db",
    "test.db", 
    "sql_app.db"
]

class DatabaseMonitor:
    def __init__(self, db_files):
        self.db_files = db_files
        self.file_stats = {}
        self.monitoring = False
        self.monitor_thread = None
        
    def start_monitoring(self):
        """Start monitoring database files for changes"""
        self.monitoring = True
        self.monitor_thread = threading.Thread(target=self._monitor_loop)
        self.monitor_thread.daemon = True
        self.monitor_thread.start()
        print("Started monitoring database files...")
        
    def stop_monitoring(self):
        """Stop monitoring database files"""
        self.monitoring = False
        if self.monitor_thread:
            self.monitor_thread.join(timeout=1.0)
        print("Stopped monitoring database files")
        
    def _monitor_loop(self):
        """Continuously monitor database files for changes"""
        while self.monitoring:
            self._check_files()
            time.sleep(0.5)  # Check every half second
            
    def _check_files(self):
        """Check the database files for changes"""
        for db_file in self.db_files:
            if os.path.exists(db_file):
                current_stat = os.stat(db_file)
                
                # If we have previous stats for this file
                if db_file in self.file_stats:
                    prev_stat = self.file_stats[db_file]
                    
                    # Check if the file was modified
                    if current_stat.st_mtime != prev_stat.st_mtime or current_stat.st_size != prev_stat.st_size:
                        modified_time = datetime.fromtimestamp(current_stat.st_mtime)
                        print(f"🔄 Database file changed: {db_file}")
                        print(f"   - Size: {prev_stat.st_size:,} -> {current_stat.st_size:,} bytes")
                        print(f"   - Modified: {modified_time}")
                
                # Update our record of the file's stats
                self.file_stats[db_file] = current_stat

def login():
    """Login to the API and get authentication token"""
    try:
        print(f"Logging in as {TEST_USER['email']}")
        response = requests.post(
            f"{API_URL}/api/auth/login/json",
            json=TEST_USER
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            print(f"✅ Login successful, token obtained")
            return token
        else:
            print(f"❌ Login failed with status code {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error during login: {str(e)}")
        return None

def create_budget_api(token, budget_data):
    """Create a budget through the API"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        print(f"Sending POST request to {API_URL}/api/budgets")
        
        response = requests.post(
            f"{API_URL}/api/budgets",
            json=budget_data,
            headers=headers
        )
        
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            budget = response.json()
            print("API response data:")
            print(json.dumps(budget, indent=2))
            return budget.get("id")
        else:
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error creating budget through API: {str(e)}")
        return None

def main():
    """Monitor database files and make an API call to see which one changes"""
    print("===== DATABASE CHANGE MONITOR =====")
    
    # First, print out info about the database files
    print("\nInitial database file info:")
    for db_file in DB_FILES_TO_MONITOR:
        if os.path.exists(db_file):
            stat = os.stat(db_file)
            size = stat.st_size
            modified = datetime.fromtimestamp(stat.st_mtime)
            print(f"{db_file}: Size={size:,} bytes, Modified={modified}")
        else:
            print(f"{db_file}: File does not exist")
    
    # Start monitoring database files
    monitor = DatabaseMonitor(DB_FILES_TO_MONITOR)
    monitor.start_monitoring()
    
    try:
        # Step 1: Log in to get authentication token
        print("\n1. LOGGING IN TO API")
        token = login()
        if not token:
            print("❌ Cannot continue without authentication token")
            return False
        
        # Step 2: Create a budget through the API
        print("\n2. CREATING BUDGET THROUGH API")
        test_id = int(time.time()) % 10000
        year = 2035  # Use a far-future year to avoid conflicts
        month = 4
        amount = 4000.0 + (test_id / 10)  # Make the amount unique with test ID
        
        budget_data = {
            "amount": amount,
            "year": year,
            "month": month,
            "period": "monthly",
            "currency": "USD",
            "category_id": 2  # Assuming category ID 2 exists
        }
        print(f"Budget data: {json.dumps(budget_data, indent=2)}")
        
        # Pause to let the monitoring establish a baseline
        print("Waiting 2 seconds before API call...")
        time.sleep(2)
        
        # Make the API call and see which database changes
        budget_id = create_budget_api(token, budget_data)
        if not budget_id:
            print("❌ API budget creation failed")
        else:
            print(f"✅ API returned budget ID: {budget_id}")
        
        # Wait to observe any changes
        print("Waiting 5 seconds to observe changes...")
        time.sleep(5)
    
    finally:
        # Stop monitoring
        monitor.stop_monitoring()
    
    # Final check of database files
    print("\nFinal database file info:")
    for db_file in DB_FILES_TO_MONITOR:
        if os.path.exists(db_file):
            stat = os.stat(db_file)
            size = stat.st_size
            modified = datetime.fromtimestamp(stat.st_mtime)
            print(f"{db_file}: Size={size:,} bytes, Modified={modified}")
        else:
            print(f"{db_file}: File does not exist")
    
    print("\n===== ANALYSIS =====")
    print("If you see a database file that changed during the API call, that's the file being used by the API.")
    print("If no files changed but the API reported success, it might be using a database file in a different location.")

if __name__ == "__main__":
    main() 