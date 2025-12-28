
import os
from pymongo import MongoClient

print(f"Testing connection to: localhost:27017")

try:
    client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=2000)
    client.server_info() # trigger connection
    print("SUCCESS: Connected to LOCAL MongoDB!")
    print(f"Databases: {client.list_database_names()}")
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
