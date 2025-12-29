$baseUrl = "http://127.0.0.1:8787"

# 1. Register
echo "--- Registering User ---"
$registerBody = @{
    email = "test@example.com"
    password = "password123"
    country = "US"
    currencyCode = "USD"
    currencySymbol = "$"
} | ConvertTo-Json

try {
    $regResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    echo "Register Success: token received"
    $token = $regResponse.token
    $userId = $regResponse.user.id
} catch {
    echo "Register Failed: $_"
    # Try login if user exists
    echo "--- Attempting Login ---"
    $loginBody = @{
        email = "test@example.com"
        password = "password123"
    } | ConvertTo-Json
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    $userId = $loginResponse.user.id
    echo "Login Success: token received"
}

$headers = @{
    Authorization = "Bearer $token"
}

# 2. Add Income
echo "--- Adding Income ---"
$incomeBody = @{
    amount = 5000
    source = "Salary"
    date = "2025-12-01"
    isRecurring = $true
} | ConvertTo-Json

try {
    $incResponse = Invoke-RestMethod -Uri "$baseUrl/api/income/" -Method Post -Headers $headers -Body $incomeBody -ContentType "application/json"
    echo "Income Added: $($incResponse.id)"
} catch {
    echo "Add Income Failed: $_"
    exit 1
}

# 3. Add Expense
echo "--- Adding Expense ---"
$expenseBody = @{
    amount = 150
    category = "Utilities"
    intent = "need"
    date = "2025-12-05"
    note = "Electric Bill"
} | ConvertTo-Json

try {
    $expResponse = Invoke-RestMethod -Uri "$baseUrl/api/expense/" -Method Post -Headers $headers -Body $expenseBody -ContentType "application/json"
    echo "Expense Added: $($expResponse.id)"
} catch {
    echo "Add Expense Failed: $_"
    exit 1
}

# 4. Get Analytics
echo "--- Fetching Analytics ---"
try {
    $analytics = Invoke-RestMethod -Uri "$baseUrl/api/analytics/monthly?month=12&year=2025" -Method Get -Headers $headers
    echo "Analytics Data:"
    echo "Total Income: $($analytics.totalIncome)"
    echo "Total Expense: $($analytics.totalExpense)"
    echo "Savings: $($analytics.savings)"
    
    if ($analytics.totalIncome -eq 5000 -and $analytics.totalExpense -eq 150) {
        echo "VERIFICATION PASSED: Analytics numbers match."
    } else {
        echo "VERIFICATION FAILED: Analytics numbers mismatch."
        exit 1
    }
} catch {
    echo "Get Analytics Failed: $_"
    exit 1
}
