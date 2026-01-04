#!/bin/bash

# Manual verification script for password reset token reuse fix
# This script demonstrates that the token cannot be reused after successful password reset

echo "=== Password Reset Token Reuse Test ==="
echo ""

API_URL="${API_URL:-http://localhost:5000}"

echo "Step 1: Request password reset for admin@example.com"
RESET_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com"}')

echo "Response: $RESET_RESPONSE"
echo ""

echo "Step 2: Check your email or database for the reset token"
echo "You can get the token from the database with:"
echo "  SELECT reset_token FROM users WHERE email = 'admin@example.com';"
echo ""
read -p "Enter the reset token: " TOKEN

if [ -z "$TOKEN" ]; then
  echo "Error: No token provided"
  exit 1
fi

echo ""
echo "Step 3: Use the token to reset password (First attempt - should succeed)"
CONFIRM_RESPONSE_1=$(curl -s -X POST "$API_URL/api/auth/reset-password-confirm" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"$TOKEN\",\"newPassword\":\"NewPassword123!\"}")

echo "Response: $CONFIRM_RESPONSE_1"
echo ""

if echo "$CONFIRM_RESPONSE_1" | grep -q "successfully"; then
  echo "✓ First attempt succeeded as expected"
else
  echo "✗ First attempt failed unexpectedly"
  exit 1
fi

echo ""
echo "Step 4: Try to use the SAME token again (Second attempt - should FAIL)"
CONFIRM_RESPONSE_2=$(curl -s -X POST "$API_URL/api/auth/reset-password-confirm" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"$TOKEN\",\"newPassword\":\"AnotherPassword456!\"}")

echo "Response: $CONFIRM_RESPONSE_2"
echo ""

if echo "$CONFIRM_RESPONSE_2" | grep -q "Invalid or expired"; then
  echo "✓ Second attempt failed as expected - TOKEN REUSE PREVENTED!"
  echo ""
  echo "=== TEST PASSED ==="
  echo "The password reset token cannot be reused after successful use."
else
  echo "✗ Second attempt succeeded - SECURITY ISSUE!"
  echo ""
  echo "=== TEST FAILED ==="
  echo "The password reset token can still be reused!"
  exit 1
fi

echo ""
echo "Note: Don't forget to reset the admin password back to its original value."

