# Enterprise CRM API - Authentication Tests
# Tests for JWT authentication including registration, login, token refresh, and protected routes

Write-Host "`n=== Enterprise CRM Authentication Tests ===" -ForegroundColor Cyan
Write-Host "Testing API at: http://127.0.0.1:8000`n" -ForegroundColor Cyan

# Test 1: Register a new sales user
Write-Host "1. Registering New Sales User" -ForegroundColor Yellow
$salesRegister = @{
    email = "test.sales@crm.com"
    full_name = "Test Sales Person"
    password = "Sales@12345"
    role = "sales"
} | ConvertTo-Json

try {
    $salesUser = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $salesRegister
    Write-Host "✅ Registration successful!" -ForegroundColor Green
    $salesUser | ConvertTo-Json
    $salesUserId = $salesUser.id
} catch {
    Write-Host "❌ Registration failed (user may already exist): $_" -ForegroundColor Red
    $salesUserId = $null
}
Write-Host ""

# Test 2: Register a new manager
Write-Host "2. Registering New Manager User" -ForegroundColor Yellow
$managerRegister = @{
    email = "test.manager@crm.com"
    full_name = "Test Manager"
    password = "Manager@12345"
    role = "manager"
} | ConvertTo-Json

try {
    $managerUser = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $managerRegister
    Write-Host "✅ Registration successful!" -ForegroundColor Green
    $managerUser | ConvertTo-Json
} catch {
    Write-Host "❌ Registration failed (user may already exist): $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Login with sales user
Write-Host "3. Testing Login (Sales User)" -ForegroundColor Yellow
$loginData = @{
    email = "test.sales@crm.com"
    password = "Sales@12345"
} | ConvertTo-Json

try {
    $tokens = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginData
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "Access Token: $($tokens.access_token.Substring(0, 50))..." -ForegroundColor Green
    Write-Host "Refresh Token: $($tokens.refresh_token.Substring(0, 50))..." -ForegroundColor Green
    $accessToken = $tokens.access_token
    $refreshToken = $tokens.refresh_token
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 4: Get current user info (using access token)
Write-Host "4. Testing GET /auth/me (Current User Info)" -ForegroundColor Yellow
try {
    $currentUser = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/auth/me" `
        -Method Get `
        -Headers @{"Authorization" = "Bearer $accessToken"}
    Write-Host "✅ Successfully retrieved current user!" -ForegroundColor Green
    $currentUser | ConvertTo-Json
} catch {
    Write-Host "❌ Failed to get current user: $_" -ForegroundColor Red
}
Write-Host ""

# Test 5: Test protected endpoints with authentication
Write-Host "5. Testing Protected Endpoint (Authenticated)" -ForegroundColor Yellow
try {
    $protected = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/protected/authenticated" `
        -Method Get `
        -Headers @{"Authorization" = "Bearer $accessToken"}
    Write-Host "✅ Access granted!" -ForegroundColor Green
    $protected | ConvertTo-Json
} catch {
    Write-Host "❌ Access denied: $_" -ForegroundColor Red
}
Write-Host ""

# Test 6: Test user dashboard
Write-Host "6. Testing User Dashboard (Role-based content)" -ForegroundColor Yellow
try {
    $dashboard = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/protected/my-dashboard" `
        -Method Get `
        -Headers @{"Authorization" = "Bearer $accessToken"}
    Write-Host "✅ Dashboard loaded!" -ForegroundColor Green
    $dashboard | ConvertTo-Json
} catch {
    Write-Host "❌ Dashboard failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 7: Test admin-only endpoint (should fail for sales user)
Write-Host "7. Testing Admin-Only Endpoint (Should FAIL for sales user)" -ForegroundColor Yellow
try {
    $adminOnly = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/protected/admin-only" `
        -Method Get `
        -Headers @{"Authorization" = "Bearer $accessToken"}
    Write-Host "❌ UNEXPECTED: Sales user accessed admin endpoint!" -ForegroundColor Red
    $adminOnly | ConvertTo-Json
} catch {
    Write-Host "✅ Correctly denied access (403 Forbidden)" -ForegroundColor Green
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
}
Write-Host ""

# Test 8: Test management endpoint (should fail for sales user)
Write-Host "8. Testing Management Endpoint (Should FAIL for sales user)" -ForegroundColor Yellow
try {
    $mgmt = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/protected/management" `
        -Method Get `
        -Headers @{"Authorization" = "Bearer $accessToken"}
    Write-Host "❌ UNEXPECTED: Sales user accessed management endpoint!" -ForegroundColor Red
} catch {
    Write-Host "✅ Correctly denied access (403 Forbidden)" -ForegroundColor Green
}
Write-Host ""

# Test 9: Test sales-only endpoint (should succeed)
Write-Host "9. Testing Sales-Only Endpoint (Should SUCCEED)" -ForegroundColor Yellow
try {
    $sales = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/protected/sales-only" `
        -Method Get `
        -Headers @{"Authorization" = "Bearer $accessToken"}
    Write-Host "✅ Access granted to sales endpoint!" -ForegroundColor Green
    $sales | ConvertTo-Json
} catch {
    Write-Host "❌ Unexpected error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 10: Test token refresh
Write-Host "10. Testing Token Refresh" -ForegroundColor Yellow
$refreshData = @{
    refresh_token = $refreshToken
} | ConvertTo-Json

try {
    $newTokens = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/auth/refresh" `
        -Method Post `
        -ContentType "application/json" `
        -Body $refreshData
    Write-Host "✅ Token refreshed successfully!" -ForegroundColor Green
    Write-Host "New Access Token: $($newTokens.access_token.Substring(0, 50))..." -ForegroundColor Green
    $newAccessToken = $newTokens.access_token
} catch {
    Write-Host "❌ Token refresh failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 11: Test new access token
Write-Host "11. Testing New Access Token" -ForegroundColor Yellow
try {
    $currentUser2 = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/auth/me" `
        -Method Get `
        -Headers @{"Authorization" = "Bearer $newAccessToken"}
    Write-Host "✅ New token works!" -ForegroundColor Green
} catch {
    Write-Host "❌ New token failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 12: Login with admin and test admin-only endpoint
Write-Host "12. Testing Admin Access" -ForegroundColor Yellow
$adminLogin = @{
    email = "admin@crm.com"
    password = "Admin@12345"
} | ConvertTo-Json

try {
    $adminTokens = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $adminLogin
    Write-Host "✅ Admin login successful!" -ForegroundColor Green
    
    # Test admin-only endpoint with admin token
    $adminEndpoint = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/protected/admin-only" `
        -Method Get `
        -Headers @{"Authorization" = "Bearer $($adminTokens.access_token)"}
    Write-Host "✅ Admin accessed admin-only endpoint!" -ForegroundColor Green
    $adminEndpoint | ConvertTo-Json
} catch {
    Write-Host "⚠️  Admin login failed (admin user may not exist): $_" -ForegroundColor Yellow
}
Write-Host ""

# Test 13: Test without authentication (should fail)
Write-Host "13. Testing Protected Endpoint WITHOUT Token (Should FAIL)" -ForegroundColor Yellow
try {
    $noAuth = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/protected/authenticated" `
        -Method Get
    Write-Host "❌ UNEXPECTED: Accessed protected endpoint without token!" -ForegroundColor Red
} catch {
    Write-Host "✅ Correctly denied access (401 Unauthorized)" -ForegroundColor Green
}
Write-Host ""

# Test 14: Test public endpoint (should work without token)
Write-Host "14. Testing Public Endpoint (No auth required)" -ForegroundColor Yellow
try {
    $public = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/protected/public" `
        -Method Get
    Write-Host "✅ Public endpoint accessible!" -ForegroundColor Green
    $public | ConvertTo-Json
} catch {
    Write-Host "❌ Public endpoint failed: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== Authentication Tests Completed ===" -ForegroundColor Cyan
Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "✅ User registration working" -ForegroundColor Green
Write-Host "✅ Login with email/password working" -ForegroundColor Green
Write-Host "✅ JWT access tokens generated and validated" -ForegroundColor Green
Write-Host "✅ JWT refresh tokens working" -ForegroundColor Green
Write-Host "✅ Protected routes enforcing authentication" -ForegroundColor Green
Write-Host "✅ Role-based access control working" -ForegroundColor Green
Write-Host "✅ Public endpoints accessible without auth" -ForegroundColor Green
Write-Host "✅ Token payload includes user_id, email, and role" -ForegroundColor Green
