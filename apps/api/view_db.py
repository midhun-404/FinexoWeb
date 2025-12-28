
import sqlite3
import os

# Path to the database
db_path = 'finexo.db'

if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    exit()

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

def print_table(table_name):
    print(f"\n--- {table_name} ---")
    try:
        cursor.execute(f"SELECT * FROM {table_name}")
        rows = cursor.fetchall()
        
        # Get column names
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = [col[1] for col in cursor.fetchall()]
        print(f"Columns: {columns}")
        
        if not rows:
            print("(No data)")
        else:
            for row in rows:
                print(row)
    except sqlite3.OperationalError as e:
        print(f"Error reading {table_name}: {e}")

print(f"Database: {db_path}")
print_table('users')
print_table('incomes')
print_table('expenses')

conn.close()
