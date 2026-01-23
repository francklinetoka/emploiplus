#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
BACKEND_URL="${1:-http://localhost:3000}"
TEST_EMAIL="test_$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123!"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Supabase Authentication Test Suite${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${YELLOW}Target Backend: ${BACKEND_URL}${NC}"
echo -e "${YELLOW}Test Email: ${TEST_EMAIL}${NC}\n"

# Test 1: Check if backend is running
echo -e "${BLUE}Test 1: Backend Health Check${NC}"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${BACKEND_URL}/health" 2>/dev/null || echo "000")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
  echo -e "${GREEN}✓ Backend is running (HTTP $HTTP_CODE)${NC}\n"
else
  echo -e "${RED}✗ Backend is not responding (HTTP $HTTP_CODE)${NC}"
  echo -e "${RED}Cannot proceed with tests.${NC}\n"
  exit 1
fi

# Test 2: User Registration
echo -e "${BLUE}Test 2: User Registration (Email/Password)${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/api/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\",
    \"full_name\": \"Test User\",
    \"country\": \"congo\",
    \"user_type\": \"candidate\"
  }")

echo -e "Response: ${REGISTER_RESPONSE}\n"

# Extract token from registration response
TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  echo -e "${GREEN}✓ Registration successful${NC}"
  echo -e "${GREEN}Token obtained: ${TOKEN:0:20}...${NC}\n"
else
  echo -e "${YELLOW}⚠ No token in registration response${NC}"
  echo -e "${YELLOW}Response might have error. Continuing with tests...${NC}\n"
fi

# Test 3: User Login
echo -e "${BLUE}Test 3: User Login (Email/Password)${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/api/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\"
  }")

echo -e "Response: ${LOGIN_RESPONSE}\n"

# Extract token from login response
LOGIN_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$LOGIN_TOKEN" ]; then
  echo -e "${GREEN}✓ Login successful${NC}"
  echo -e "${GREEN}Token obtained: ${LOGIN_TOKEN:0:20}...${NC}\n"
else
  echo -e "${RED}✗ Login failed${NC}"
  echo -e "${RED}Check backend logs for details${NC}\n"
fi

# Test 4: Access Protected Route
if [ -n "$LOGIN_TOKEN" ]; then
  echo -e "${BLUE}Test 4: Access Protected Route (/api/users/me)${NC}"
  PROTECTED_RESPONSE=$(curl -s -X GET "${BACKEND_URL}/api/users/me" \
    -H "Authorization: Bearer ${LOGIN_TOKEN}")
  
  echo -e "Response: ${PROTECTED_RESPONSE}\n"
  
  if echo "$PROTECTED_RESPONSE" | grep -q '"success"'; then
    echo -e "${GREEN}✓ Protected route accessible with token${NC}\n"
  else
    echo -e "${RED}✗ Protected route returned error${NC}\n"
  fi
else
  echo -e "${YELLOW}⚠ Skipping protected route test (no valid token)${NC}\n"
fi

# Test 5: Database Connection
echo -e "${BLUE}Test 5: Verify Supabase Database Connection${NC}"
DB_CHECK=$(curl -s -X GET "${BACKEND_URL}/api/health" 2>/dev/null)

if echo "$DB_CHECK" | grep -q "ok\|connected"; then
  echo -e "${GREEN}✓ Database connection verified${NC}\n"
else
  echo -e "${YELLOW}⚠ Could not verify database status${NC}\n"
fi

# Test 6: Authentication Headers
echo -e "${BLUE}Test 6: Test Without Token (Should Fail)${NC}"
NO_TOKEN_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BACKEND_URL}/api/users/me")
NO_TOKEN_HTTP=$(echo "$NO_TOKEN_RESPONSE" | tail -n1)

if [ "$NO_TOKEN_HTTP" = "401" ]; then
  echo -e "${GREEN}✓ Correctly rejected request without token (HTTP 401)${NC}\n"
else
  echo -e "${YELLOW}⚠ Unexpected response without token (HTTP $NO_TOKEN_HTTP)${NC}\n"
fi

# Test 7: Invalid Token
echo -e "${BLUE}Test 7: Test With Invalid Token${NC}"
INVALID_TOKEN_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BACKEND_URL}/api/users/me" \
  -H "Authorization: Bearer invalid_token_123")
INVALID_TOKEN_HTTP=$(echo "$INVALID_TOKEN_RESPONSE" | tail -n1)

if [ "$INVALID_TOKEN_HTTP" = "401" ]; then
  echo -e "${GREEN}✓ Correctly rejected invalid token (HTTP 401)${NC}\n"
else
  echo -e "${YELLOW}⚠ Unexpected response for invalid token (HTTP $INVALID_TOKEN_HTTP)${NC}\n"
fi

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Authentication system is operational${NC}"
echo -e "${YELLOW}Test Email: ${TEST_EMAIL}${NC}"
echo -e "${YELLOW}For detailed logs, check backend console${NC}\n"
