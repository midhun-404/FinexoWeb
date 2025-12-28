
import os
from dotenv import load_dotenv
from pymongo import MongoClient
import certifi
import requests

load_dotenv()

uri = os.getenv("MONGO_URI")
print(f"Testing connection to: {uri.split('@')[-1] if '@' in uri else uri} (WITH CERTIFI)")

try:
    # Check internet
    print("Checking internet connectivity...")
    requests.get("https://google.com", timeout=5)
    print("Internet OK.")
except Exception as e:
    print(f"Internet Check Failed: {e}")

try:
    client = MongoClient(uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=5000)
    client.server_info() # trigger connection
    print("SUCCESS: Connected to MongoDB with certifi!")
    print(f"Databases: {client.list_database_names()}")
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
