import urllib.request
import json
import time

url = "http://127.0.0.1:5000/api/auth/register"
data = {
    "email": f"test_{int(time.time())}@example.com",
    "password": "password123",
    "country": "ValidationLand",
    "currencyCode": "VAL",
    "currencySymbol": "V"
}
headers = {
    "Content-Type": "application/json"
}

try:
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers)
    with urllib.request.urlopen(req) as response:
        print(f"Status Code: {response.getcode()}")
        print(f"Response: {response.read().decode('utf-8')}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(f"Error Content: {e.read().decode('utf-8')}")
except Exception as e:
    print(f"CRITICAL FAILURE: {e}")
