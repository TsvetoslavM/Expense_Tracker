import os
import sqlite3
from pathlib import Path

def find_sqlite_files(start_dir="."):
    """Find all SQLite database files in the directory structure"""
    print(f"Searching for SQLite database files starting from: {os.path.abspath(start_dir)}")
    
    sqlite_files = []
    for root, dirs, files in os.walk(start_dir):
        for file in files:
            if file.endswith('.db'):
                full_path = os.path.join(root, file)
                # Check if it's a SQLite database
                if is_sqlite_db(full_path):
                    sqlite_files.append(full_path)
    
    return sqlite_files

def is_sqlite_db(file_path):
    """Check if a file is a SQLite database"""
    try:
        # Try to open the file as a SQLite database
        conn = sqlite3.connect(file_path)
        cursor = conn.cursor()
        cursor.execute("SELECT sqlite_version();")
        conn.close()
        return True
    except sqlite3.Error:
        return False

def examine_database(db_path):
    """Examine a SQLite database for tables and content"""
    print(f"\n===== Examining database: {db_path} =====")
    print(f"File size: {os.path.getsize(db_path):,} bytes")
    print(f"Last modified: {os.path.getmtime(db_path)}")
    
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get SQLite version
        cursor.execute("SELECT sqlite_version();")
        version = cursor.fetchone()[0]
        print(f"SQLite version: {version}")
        
        # Get list of tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        if not tables:
            print("No tables found in database")
        else:
            print(f"Tables found: {len(tables)}")
            for i, table in enumerate(tables, 1):
                table_name = table[0]
                # Get row count for the table
                cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
                row_count = cursor.fetchone()[0]
                
                # Get column info
                cursor.execute(f"PRAGMA table_info({table_name})")
                columns = cursor.fetchall()
                
                print(f"\nTable {i}: {table_name}")
                print(f"Rows: {row_count}")
                print(f"Columns: {len(columns)}")
                print("Column names: " + ", ".join(col[1] for col in columns))
                
                # If it's the budgets table, examine contents
                if table_name == 'budgets' and row_count > 0:
                    cursor.execute(f"SELECT id, amount, year, month, category_id, user_id FROM {table_name} ORDER BY id")
                    rows = cursor.fetchall()
                    print("\nBudget records:")
                    for row in rows:
                        print(f"  ID: {row[0]}, Amount: {row[1]}, Year: {row[2]}, Month: {row[3]}, Category: {row[4]}, User: {row[5]}")
        
        conn.close()
    except sqlite3.Error as e:
        print(f"Error examining database: {str(e)}")

def main():
    """Main function to find and examine SQLite databases"""
    print("===== SQLite Database Finder =====")
    
    # Look for database files in the current structure
    sqlite_files = find_sqlite_files()
    
    if not sqlite_files:
        print("No SQLite database files found")
        return
    
    print(f"\nFound {len(sqlite_files)} SQLite database files:")
    for i, db_file in enumerate(sqlite_files, 1):
        print(f"{i}. {db_file}")
    
    # Examine each database
    for db_file in sqlite_files:
        examine_database(db_file)
    
    # Check environment variables for database settings
    print("\n===== Environment and Configuration =====")
    for key, value in os.environ.items():
        if 'DATABASE' in key or 'DB' in key or 'SQL' in key:
            print(f"{key}: {value}")
    
    # Suggest next steps
    print("\n===== Next Steps =====")
    print("1. Check database paths in your application configuration")
    print("2. Make sure the application has write permissions to the database directory")
    print("3. Verify the database connection string in your code")

if __name__ == "__main__":
    main() 