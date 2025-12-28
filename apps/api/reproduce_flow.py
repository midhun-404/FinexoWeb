import urllib.request
import json
import time

BASE_URL = "http://127.0.0.1:5000/api"

def request(method, endpoint, data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    body = json.dumps(data).encode('utf-8') if data else None
    
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return response.getcode(), json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode('utf-8'))
    except Exception as e:
        return 999, str(e)

# 1. Register
email = f"user_{int(time.time())}@test.com"
print(f"1. Registering {email}...")
code, resp = request("POST", "/auth/register", {
    "email": email,
    "password": "password123",
    "country": "TestLand",
    "currencyCode": "TST",
    "currencySymbol": "T"
})
print(f"   Status: {code}, Resp: {resp}")

if code != 201:
    exit(1)

# 2. Login
print(f"2. Logging in...")
code, resp = request("POST", "/auth/login", {
    "email": email,
    "password": "password123"
})
print(f"   Status: {code}, Token: {resp.get('token')[:20]}...")
token = resp['token']

# 3. Add Income
print(f"3. Adding Income...")
income_data = {
    "amount": 5000,
    "source": "Test Salary",
    "date": "2025-12-27",
    "isRecurring": True
}
code, resp = request("POST", "/income/", income_data, token=token) # Note trailing slash
print(f"   Status: {code}, Resp: {resp}")

if code == 404:
    print("   Trying without trailing slash...")
    code, resp = request("POST", "/income", income_data, token=token)
    print(f"   Status: {code}, Resp: {resp}")
