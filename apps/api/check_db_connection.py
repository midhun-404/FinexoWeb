
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError

load_dotenv()

uri = os.getenv("MONGO_URI")
print(f"Testing connection to: {uri.split('@')[-1] if '@' in uri else uri}")

try:
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    client.server_info() # trigger connection
    print("SUCCESS: Connected to MongoDB!")
    print(f"Databases: {client.list_database_names()}")
except ServerSelectionTimeoutError as e:
    print(f"ERROR: Connection timed out. Details:\n{e}")
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
