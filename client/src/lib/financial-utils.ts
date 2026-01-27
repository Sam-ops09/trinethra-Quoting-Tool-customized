import Decimal from "decimal.js";

// Ensure Decimal handles precision consistently
Decimal.set({ precision: 20 });

export const toDecimal = (value: number | string | Decimal | undefined | null): Decimal => {
  if (value === undefined || value === null || value === "") return new Decimal(0);
  return new Decimal(value);
};

export const calculateLineItemTotal = (quantity: number | string, unitPrice: number | string): Decimal => {
  const qty = toDecimal(quantity);
  const price = toDecimal(unitPrice);
  return qty.times(price);
};

export const calculateSubtotal = (items: Array<{ quantity: number | string; unitPrice: number | string }>): Decimal => {
  return items.reduce((sum, item) => {
    return sum.plus(calculateLineItemTotal(item.quantity, item.unitPrice));
  }, new Decimal(0));
};

export const calculateTaxAmount = (baseAmount: Decimal, taxRate: number | string): Decimal => {
  return baseAmount.times(toDecimal(taxRate)).dividedBy(100);
};

export const calculateQuoteTotals = (
  items: Array<{ quantity: number | string; unitPrice: number | string }>,
  discountPercent: number | string,
  shippingCharges: number | string,
  taxRates: { cgst: number | string; sgst: number | string; igst: number | string }
) => {
  const subtotal = calculateSubtotal(items);
  const discountAmount = calculateTaxAmount(subtotal, discountPercent); // calculateTaxAmount works for percentage calc
  const taxableAmount = subtotal.minus(discountAmount);

  const cgstAmount = calculateTaxAmount(taxableAmount, taxRates.cgst);
  const sgstAmount = calculateTaxAmount(taxableAmount, taxRates.sgst);
  const igstAmount = calculateTaxAmount(taxableAmount, taxRates.igst);
  const shipping = toDecimal(shippingCharges);

  const total = taxableAmount
    .plus(cgstAmount)
    .plus(sgstAmount)
    .plus(igstAmount)
    .plus(shipping);

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    shipping,
    total,
  };
};

export const formatDecimal = (value: Decimal): string => {
  return value.toFixed(2);
};
