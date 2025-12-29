$baseUrl = "http://127.0.0.1:8787/api"
$email = "test-ai-" + (Get-Random) + "@example.com"
$password = "password123"

# 1. Register
Write-Host "Registering..."
$regBody = @{
    email          = $email
    password       = $password
    country        = "USA"
    currencyCode   = "USD"
    currencySymbol = "$"
} | ConvertTo-Json

try {
    $regResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $regBody -ContentType "application/json"
    $token = $regResponse.token
    Write-Host "Registered. Token acquired."
}
catch {
    Write-Error "Registration failed: $_"
    exit
}

# 2. Add some dummy data (for context)
$headers = @{ Authorization = "Bearer $token" }
try {
    $incBody = @{ amount = 5000; source = "Salary"; date = "2023-10-01" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/income/" -Method Post -Body $incBody -Headers $headers -ContentType "application/json" | Out-Null
    
    $expBody = @{ amount = 1200; category = "Food"; intent = "need"; date = "2023-10-05" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/expense/" -Method Post -Body $expBody -Headers $headers -ContentType "application/json" | Out-Null
}
catch {
    Write-Warning "Failed to add dummy data, proceeding anyway."
}

# 3. Test AI Chat
Write-Host "Testing AI Chat..."
$chatBody = @{
    message = "Based on my finances, can I afford a vacation?"
    history = @()
} | ConvertTo-Json

try {
    $aiResponse = Invoke-RestMethod -Uri "$baseUrl/felica/chat" -Method Post -Body $chatBody -Headers $headers -ContentType "application/json"
    Write-Host "AI Response:" -ForegroundColor Green
    Write-Host $aiResponse.response
}
catch {
    Write-Error "AI Request failed: $_"
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $body = $reader.ReadToEnd()
    Write-Host "Error Body: $body" -ForegroundColor Red
}
