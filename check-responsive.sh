#!/bin/bash

# Comprehensive Responsive Design Check Script
# This script checks for responsive patterns in the QuoteProGen website

echo "🔍 QuoteProGen Responsive Design Audit"
echo "========================================"
echo ""

# Check viewport meta tag
echo "✅ 1. Viewport Meta Tag"
if grep -q 'width=device-width' client/index.html; then
  echo "   ✓ Viewport meta tag is present"
else
  echo "   ✗ Missing viewport meta tag"
fi
echo ""

# Check Tailwind responsive classes
echo "✅ 2. Responsive Tailwind Classes Usage"
echo "   Checking for sm:, md:, lg:, xl: breakpoint classes..."

sm_count=$(grep -r "sm:" client/src/pages/*.tsx 2>/dev/null | wc -l | tr -d ' ')
md_count=$(grep -r "md:" client/src/pages/*.tsx 2>/dev/null | wc -l | tr -d ' ')
lg_count=$(grep -r "lg:" client/src/pages/*.tsx 2>/dev/null | wc -l | tr -d ' ')
xl_count=$(grep -r "xl:" client/src/pages/*.tsx 2>/dev/null | wc -l | tr -d ' ')

echo "   sm: breakpoint usage: $sm_count instances"
echo "   md: breakpoint usage: $md_count instances"
echo "   lg: breakpoint usage: $lg_count instances"
echo "   xl: breakpoint usage: $xl_count instances"
echo ""

# Check page headers for responsive typography
echo "✅ 3. Responsive Page Headers"
echo "   Checking <h1> tags for responsive text sizing..."

non_responsive_h1=$(grep -r "<h1" client/src/pages/*.tsx | grep -v "sm:" | grep -v "md:" | grep -v "lg:" | wc -l | tr -d ' ')
responsive_h1=$(grep -r "<h1" client/src/pages/*.tsx | grep -E "(sm:|md:|lg:)" | wc -l | tr -d ' ')

echo "   Responsive h1 tags: $responsive_h1"
echo "   Non-responsive h1 tags: $non_responsive_h1"
echo ""

# Check for mobile-first grid patterns
echo "✅ 4. Grid Layouts"
echo "   Checking for responsive grid patterns..."

grid_patterns=$(grep -r "grid-cols-1" client/src/pages/*.tsx 2>/dev/null | wc -l | tr -d ' ')
echo "   Mobile-first grids (grid-cols-1): $grid_patterns"
echo ""

# Check for responsive padding/spacing
echo "✅ 5. Responsive Spacing"
echo "   Checking for responsive padding patterns..."

padding_patterns=$(grep -r "p-\[0-9\].*sm:p-" client/src/pages/*.tsx 2>/dev/null | wc -l | tr -d ' ')
echo "   Responsive padding patterns: $padding_patterns"
echo ""

# Check for overflow handling
echo "✅ 6. Overflow & Scroll Handling"
echo "   Checking for overflow management..."

overflow_patterns=$(grep -r -E "(overflow-|truncate|break-words)" client/src/pages/*.tsx 2>/dev/null | wc -l | tr -d ' ')
echo "   Overflow handling instances: $overflow_patterns"
echo ""

# Check for responsive flex patterns
echo "✅ 7. Flexbox Responsiveness"
echo "   Checking for responsive flex patterns..."

flex_patterns=$(grep -r "flex-col.*sm:flex-row\|flex-wrap" client/src/pages/*.tsx 2>/dev/null | wc -l | tr -d ' ')
echo "   Responsive flex patterns: $flex_patterns"
echo ""

# Summary
echo "========================================"
echo "📊 Summary"
echo "========================================"
total_pages=$(find client/src/pages -name "*.tsx" -type f | wc -l | tr -d ' ')
echo "Total pages: $total_pages"
echo ""

if [ "$sm_count" -gt 100 ] && [ "$md_count" -gt 50 ]; then
  echo "✅ RESULT: Website appears to be RESPONSIVE"
  echo "   - Strong breakpoint usage detected"
  echo "   - Mobile-first patterns present"
else
  echo "⚠️  RESULT: Some pages may need responsive improvements"
fi

echo ""
echo "🎯 Recommendations:"
echo "   1. Ensure all h1/h2 headers use responsive text sizes"
echo "   2. Use mobile-first grid patterns (grid-cols-1 md:grid-cols-2)"
echo "   3. Apply responsive padding (p-3 sm:p-4 md:p-6)"
echo "   4. Test on actual devices or browser DevTools"
echo ""

