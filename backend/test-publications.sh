#!/bin/bash
# Test script for backend publications endpoint

echo "Testing backend publication endpoints..."
echo ""

# Create a test user first
echo "1️⃣ Creating test user..."
REGISTER_RESPONSE=$(curl -s -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-pub-'$(date +%s)'@example.com",
    "password": "TestPassword123!",
    "full_name": "Test Publication User",
    "user_type": "candidate"
  }')

echo "Register response: $REGISTER_RESPONSE"
echo ""

# Extract token
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token // empty')
USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.user.id // empty')

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token. Trying with existing user..."
  # Try to login with an existing test user
  LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:5000/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "jean@example.com",
      "password": "user123"
    }')
  
  echo "Login response: $LOGIN_RESPONSE"
  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // empty')
  USER_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.user.id // empty')
fi

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to authenticate"
  exit 1
fi

echo "✅ Got token: $TOKEN"
echo "✅ User ID: $USER_ID"
echo ""

# Test GET publications
echo "2️⃣ Getting publications..."
curl -s "http://localhost:5000/api/publications" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo ""
echo "Test complete!"
