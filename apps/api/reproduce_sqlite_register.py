
import requests

url = "http://127.0.0.1:5000/api/auth/register"
payload = {
    "email": "sqlite_backend_test@example.com",
    "password": "password123",
    "country": "USA",
    "currencyCode": "USD",
    "currencySymbol": "$"
}
headers = {"Content-Type": "application/json"}

try:
    print(f"Sending POST to {url}...")
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 201:
        print("SUCCESS: User registered in SQLite.")
    else:
        print("FAILURE: Registration failed.")

except Exception as e:
    print(f"CRITICAL FAILURE: {e}")
