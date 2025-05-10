import os
import sqlite3
import shutil
from datetime import datetime
from pathlib import Path

# First let's print out the current database paths and configuration
print("===== CURRENT DATABASE CONFIGURATION =====")
print(f"Current working directory: {os.getcwd()}")

# Check .env file
env_file = Path('.env')
if env_file.exists():
    print("\n.env file content (database related):")
    with open(env_file, 'r') as f:
        for line in f:
            if any(key in line for key in ['DATABASE', 'DB', 'SQL', 'POSTGRES']):
                print(f"  {line.strip()}")

# List SQLite database files
db_files = [f for f in os.listdir('.') if f.endswith('.db')]
print(f"\nFound {len(db_files)} database files in current directory:")
for i, db_file in enumerate(db_files, 1):
    file_path = Path(db_file)
    size = file_path.stat().st_size
    modified = datetime.fromtimestamp(file_path.stat().st_mtime)
    print(f"{i}. {db_file} (Size: {size:,} bytes, Modified: {modified})")

# Determine which database files have budget data
print("\n===== CHECKING DATABASE CONTENTS =====")
for db_file in db_files:
    try:
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()
        
        # Check if budgets table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='budgets'")
        if cursor.fetchone():
            # Count budgets
            cursor.execute("SELECT COUNT(*) FROM budgets")
            count = cursor.fetchone()[0]
            
            # If budgets exist, show the latest
            if count > 0:
                print(f"\nDatabase {db_file} has {count} budgets")
                cursor.execute("SELECT id, amount, year, month, created_at FROM budgets ORDER BY id DESC LIMIT 5")
                rows = cursor.fetchall()
                print("Latest budgets:")
                for row in rows:
                    print(f"  ID: {row[0]}, Amount: {row[1]}, Year: {row[2]}, Month: {row[3]}, Created: {row[4]}")
            else:
                print(f"\nDatabase {db_file} has an empty budgets table")
        else:
            print(f"\nDatabase {db_file} has no budgets table")
            
        conn.close()
    except Exception as e:
        print(f"Error examining {db_file}: {str(e)}")

# Fix the issue (only if we found conflicting databases)
print("\n===== PROPOSED SOLUTION =====")
print("We found multiple database files which can cause the API to use a different database than our test scripts.")
print("Options to fix this:")
print("1. Update .env file to explicitly set the database path")
print("2. Consolidate databases by merging data from all files")
print("3. Make a backup and create a clean database environment")

print("\nRecommended approach:")
print("1. First, backup all existing databases")
print("2. Add an explicit DATABASE_URL in .env file")
print("3. Restart the API server to use the specified database")

print("\n===== IMPLEMENTING FIX =====")
backup_dir = "db_backups"
if not os.path.exists(backup_dir):
    os.makedirs(backup_dir)
    print(f"Created backup directory: {backup_dir}")

# Backup all database files
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
for db_file in db_files:
    backup_file = f"{backup_dir}/{db_file}_{timestamp}"
    shutil.copy2(db_file, backup_file)
    print(f"Backed up {db_file} to {backup_file}")

# Update .env file to specify the database explicitly
db_to_use = "expense_tracker.db"  # We'll use this as our primary database
env_updated = False

if env_file.exists():
    with open(env_file, 'r') as f:
        env_content = f.read()
    
    # Check if DATABASE_URL is already set
    if "DATABASE_URL" not in env_content:
        # Add the explicit DATABASE_URL
        with open(env_file, 'a') as f:
            f.write(f"\n# Added explicit database path to fix multiple database issue\n")
            f.write(f"DATABASE_URL=sqlite:///./expense_tracker.db\n")
        print(f"Updated .env file to use {db_to_use} explicitly")
        env_updated = True
    else:
        print("DATABASE_URL already exists in .env file. Please check its value.")
else:
    print("No .env file found. Please create one with DATABASE_URL=sqlite:///./expense_tracker.db")

print("\n===== NEXT STEPS =====")
print("1. Restart the API server to apply the database configuration changes")
print("2. Run your tests again to confirm the issue is resolved")
print("3. If you encounter any issues, you can restore from the backups in the db_backups directory")

# Finish
if env_updated:
    print("\n✅ Database configuration updated successfully. Please restart the API server.")
else:
    print("\n⚠️ Manual intervention required: Please check your database configuration.") 