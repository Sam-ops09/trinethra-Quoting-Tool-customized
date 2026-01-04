#!/bin/bash

# Interactive Diagnostic Tool

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║  Master-Child Invoice Sync - Interactive Diagnostic   ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check server
echo -e "${BLUE}Step 1: Checking server status...${NC}"
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}✓${NC} Server is running"
else
    echo -e "${RED}✗${NC} Server is NOT running"
    echo "  Please run: pnpm dev"
    exit 1
fi

# Step 2: Check code
echo -e "\n${BLUE}Step 2: Checking code integrity...${NC}"

if grep -q "Updating serial numbers for item" server/routes.ts && \
   grep -q "This is a child invoice. Parent:" server/routes.ts && \
   grep -q "✓ Master item updated successfully" server/routes.ts && \
   grep -q "Invalidating parent invoice:" client/src/pages/invoice-detail.tsx && \
   grep -q "getInvoiceItem" server/storage.ts; then
    echo -e "${GREEN}✓${NC} All sync code is present"
else
    echo -e "${RED}✗${NC} Some code is missing!"
    exit 1
fi

# Step 3: Interactive guidance
echo -e "\n${BLUE}Step 3: Testing guidance${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ${YELLOW}IMPORTANT: You must test on a CHILD invoice!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Master Invoice: INV-001      (single level)"
echo "  Child Invoice:  INV-001-1    (has a dash and number)"
echo "                  INV-001-2"
echo ""

read -p "Do you have a child invoice to test with? (y/n): " has_child

if [[ $has_child != "y" && $has_child != "Y" ]]; then
    echo ""
    echo "${YELLOW}You need to create a child invoice first!${NC}"
    echo ""
    echo "Steps:"
    echo "1. Open a master invoice in your browser"
    echo "2. Click 'Create Child Invoice' button"
    echo "3. Select items and create the child"
    echo "4. Then come back and run this script again"
    echo ""
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ${GREEN}Great! Now follow these steps:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. ${BLUE}Open your terminal${NC} where server is running"
echo "   Watch for logs when you update serials"
echo ""
echo "2. ${BLUE}Open browser console${NC} (Press F12)"
echo "   Go to Console tab"
echo ""
echo "3. ${BLUE}Open your CHILD invoice${NC} (e.g., INV-001-1)"
echo "   NOT the master invoice!"
echo ""
echo "4. ${BLUE}Click 'Assign Serial Numbers'${NC} on any item"
echo ""
echo "5. ${BLUE}Enter these test serial numbers:${NC}"
echo "   SN-DIAGNOSTIC-001"
echo "   SN-DIAGNOSTIC-002"
echo "   SN-DIAGNOSTIC-003"
echo ""
echo "6. ${BLUE}Click 'Save'${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Have you done the above steps? (y/n): " done_steps

if [[ $done_steps != "y" && $done_steps != "Y" ]]; then
    echo ""
    echo "Please complete the steps above and run this script again."
    echo ""
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ${YELLOW}Now let's check what happened...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Did you see a SUCCESS toast message? (y/n): " saw_toast
if [[ $saw_toast != "y" && $saw_toast != "Y" ]]; then
    echo -e "${RED}✗ No success toast${NC}"
    echo "  → The update might have failed"
    echo "  → Check browser console for errors"
    exit 1
else
    echo -e "${GREEN}✓${NC} Success toast appeared"
fi

read -p "Did server logs show 'This is a child invoice'? (y/n): " saw_child
if [[ $saw_child != "y" && $saw_child != "Y" ]]; then
    echo -e "${RED}✗ Not detected as child invoice${NC}"
    echo "  → You might be testing on a master invoice"
    echo "  → Verify invoice number has format: INV-001-1"
    exit 1
else
    echo -e "${GREEN}✓${NC} Detected as child invoice"
fi

read -p "Did server logs show '✓ Master item updated successfully'? (y/n): " saw_success
if [[ $saw_success != "y" && $saw_success != "Y" ]]; then
    echo -e "${RED}✗ Master update did not succeed${NC}"
    echo "  → Check if server showed 'No matching master item found'"
    echo "  → Item description/price might not match"
    exit 1
else
    echo -e "${GREEN}✓${NC} Master item updated in database"
fi

read -p "Did browser console show 'Invalidating parent invoice'? (y/n): " saw_invalidate
if [[ $saw_invalidate != "y" && $saw_invalidate != "Y" ]]; then
    echo -e "${YELLOW}⚠${NC} Frontend invalidation might not have triggered"
    echo "  → Try hard refresh: Cmd+Shift+R"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ${BLUE}Final Check: Verify Master Invoice${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Navigate to the MASTER invoice (INV-001)"
echo "2. Hard refresh the page: ${YELLOW}Cmd+Shift+R${NC} (Mac) or ${YELLOW}Ctrl+Shift+R${NC} (Windows)"
echo "3. Look at the item you just updated"
echo "4. Check if you see the serial numbers"
echo ""

read -p "Do you see the serial numbers in the master invoice? (y/n): " saw_serials

if [[ $saw_serials == "y" || $saw_serials == "Y" ]]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "  ${GREEN}✓✓✓ SUCCESS! Everything is working! ✓✓✓${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "The master-child invoice synchronization is working correctly!"
    echo ""
else
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "  ${RED}Issue Found: Master not showing serial numbers${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Possible reasons:"
    echo ""
    echo "1. ${YELLOW}Cache issue:${NC}"
    echo "   → Try opening in incognito/private window"
    echo "   → Clear browser cache completely"
    echo ""
    echo "2. ${YELLOW}Looking at wrong item:${NC}"
    echo "   → Make sure item description matches exactly"
    echo "   → Check unit price is the same"
    echo ""
    echo "3. ${YELLOW}Database not updated:${NC}"
    echo "   → Check server logs for actual database error"
    echo "   → Verify database connection is working"
    echo ""
    echo "4. ${YELLOW}React Query cache:${NC}"
    echo "   → Try navigating away and back"
    echo "   → Click 'Invoices' then click master invoice again"
    echo ""

    read -p "Would you like to see the detailed troubleshooting guide? (y/n): " show_guide
    if [[ $show_guide == "y" || $show_guide == "Y" ]]; then
        echo ""
        echo "Opening DETAILED_TROUBLESHOOTING.md..."
        cat DETAILED_TROUBLESHOOTING.md | less
    fi
fi

echo ""

