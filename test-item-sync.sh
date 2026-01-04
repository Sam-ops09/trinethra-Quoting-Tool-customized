#!/bin/bash

# Test Script for Master-Child Invoice Item Synchronization
# This script tests that updating child invoice items syncs to master

echo "=========================================="
echo "Master-Child Invoice Item Sync Test"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:5000/api"
AUTH_TOKEN=""

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
    fi
}

echo "Prerequisites:"
echo "1. Server must be running (pnpm dev)"
echo "2. You must have a master invoice with child invoices"
echo "3. You need to be logged in"
echo ""

read -p "Enter your auth token (from browser cookies): " AUTH_TOKEN

if [ -z "$AUTH_TOKEN" ]; then
    echo -e "${RED}Error: Auth token is required${NC}"
    exit 1
fi

read -p "Enter master invoice ID: " MASTER_ID
read -p "Enter child invoice ID: " CHILD_ID
read -p "Enter child invoice item ID: " ITEM_ID

echo ""
echo "=========================================="
echo "Test 1: Get Master Invoice Before Update"
echo "=========================================="

curl -s -X GET "$API_URL/invoices/$MASTER_ID" \
  -H "Cookie: token=$AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  | jq '.items[] | select(.id != null) | {id, description, serialNumbers}' > /tmp/master_before.json

echo "Master items before:"
cat /tmp/master_before.json
echo ""

echo "=========================================="
echo "Test 2: Update Serial Numbers in Child"
echo "=========================================="

SERIAL_NUMBERS='["TEST-SN-001", "TEST-SN-002", "TEST-SN-003"]'

echo "Updating child invoice item with serial numbers: $SERIAL_NUMBERS"

RESPONSE=$(curl -s -X PATCH "$API_URL/invoices/$CHILD_ID/items/$ITEM_ID/serials" \
  -H "Cookie: token=$AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"serialNumbers\": $SERIAL_NUMBERS}")

echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

# Check if update was successful
if echo "$RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
    print_result 0 "Child invoice item updated"
else
    print_result 1 "Failed to update child invoice item"
    echo "$RESPONSE"
    exit 1
fi

echo ""
echo "Waiting 2 seconds for sync to complete..."
sleep 2

echo ""
echo "=========================================="
echo "Test 3: Get Master Invoice After Update"
echo "=========================================="

curl -s -X GET "$API_URL/invoices/$MASTER_ID" \
  -H "Cookie: token=$AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  | jq '.items[] | select(.id != null) | {id, description, serialNumbers}' > /tmp/master_after.json

echo "Master items after:"
cat /tmp/master_after.json
echo ""

echo "=========================================="
echo "Test 4: Verify Serial Numbers Synced"
echo "=========================================="

# Check if master item has the serial numbers
MASTER_SERIALS=$(curl -s -X GET "$API_URL/invoices/$MASTER_ID" \
  -H "Cookie: token=$AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  | jq -r '.items[0].serialNumbers')

echo "Master item serial numbers: $MASTER_SERIALS"

if echo "$MASTER_SERIALS" | grep -q "TEST-SN-001"; then
    print_result 0 "Serial numbers synced to master invoice"
else
    print_result 1 "Serial numbers NOT found in master invoice"
fi

echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="

echo ""
echo "Before:"
cat /tmp/master_before.json
echo ""
echo "After:"
cat /tmp/master_after.json
echo ""

echo "=========================================="
echo "Manual Verification Steps:"
echo "=========================================="
echo "1. Open browser and navigate to master invoice"
echo "2. Check that the line items show the serial numbers"
echo "3. The serial numbers should be: TEST-SN-001, TEST-SN-002, TEST-SN-003"
echo ""

# Cleanup
rm -f /tmp/master_before.json /tmp/master_after.json

echo "Test completed!"

