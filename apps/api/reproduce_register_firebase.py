
import requests

url = "http://127.0.0.1:5000/api/auth/register"
payload = {
    "email": "firebase_debug_user@example.com",
    "password": "password123",
    "country": "USA",
    "currencyCode": "USD", # Manually adding what might be missing
    "currencySymbol": "$"
}
headers = {"Content-Type": "application/json"}

try:
    print(f"Sending POST to {url}...")
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"CRITICAL FAILURE: {e}")
