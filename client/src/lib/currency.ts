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
    // or we could use the browser locale: navigator.language
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
 * Returns the symbol for a given currency code
 */
export function getCurrencySymbol(currencyCode: string = "INR"): string {
    try {
        return (0).toLocaleString('en-US', { style: 'currency', currency: currencyCode, minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace(/\d/g, '').trim();
    } catch {
        return currencyCode;
    }
}
