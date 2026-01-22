/**
 * Format a number as a currency string.
 * Handles Indian Numbering System for INR, and standard International for others.
 */
export function formatCurrency(amount: number | string | undefined | null, currencyCode: string = "INR"): string {
  const num = Number(amount) || 0;
  
  try {
    // Check if the currency is INR or unsupported by Intl properly (though Intl supports INR)
    // We specifically want "en-IN" locale for INR to get lakhs/crores formatting
    if (currencyCode.toUpperCase() === "INR") {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num);
    }

    // For other currencies, use standard locale (e.g. en-US is a safe default for formatting structure)
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  } catch (error) {
    // Fallback if currency code is invalid
    console.warn(`Invalid currency code: ${currencyCode}`, error);
    return `${currencyCode} ${num.toFixed(2)}`;
  }
}


/**
 * Safe currency formatter for PDFs. 
 * Now that we have custom fonts, we can try to use symbols again.
 * If fonts fail to load, we might get boxes, but User requested symbols.
 */
export function formatCurrencyPdf(amount: number | string | undefined | null, currencyCode: string = "INR"): string {
  // We can just reuse the main formatter which produces symbols
  return formatCurrency(amount, currencyCode);
}
