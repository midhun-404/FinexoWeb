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

# 1. Login (using previous credentials if possible, or register new)
email = f"user_analytics_{int(time.time())}@test.com"
print(f"1. Registering {email}...")
code, resp = request("POST", "/auth/register", {
    "email": email,
    "password": "password123",
    "country": "TestLand",
    "currencyCode": "TST",
    "currencySymbol": "T"
})
token = resp.get('token')

if not token:
    print("Failed to get token")
    exit(1)

# 2. Add Income
print(f"2. Adding Income of 5000...")
code, resp = request("POST", "/income/", {
    "amount": 5000,
    "source": "Salary",
    "date": "2025-12-27",
    "isRecurring": False
}, token=token)
print(f"   Response: {code}")

# 3. Add Expense
print(f"3. Adding Expense of 2000...")
code, resp = request("POST", "/expense/", {
    "amount": 2000,
    "category": "Food",
    "intent": "need",
    "date": "2025-12-27",
    "note": "Lunch"
}, token=token)
print(f"   Response: {code}")

# 4. Get Analytics
print(f"4. Getting Monthly Analytics (Default/Current)...")
code, resp = request("GET", "/analytics/monthly", token=token)
print(f"   Status: {code}")
print(f"   Data: {json.dumps(resp, indent=2)}")

# 5. Check if totals match
if resp.get('totalIncome') == 5000 and resp.get('totalExpense') == 2000:
    print("SUCCESS: Analytics matches data.")
else:
    print("FAILURE: Data mismatch.")
