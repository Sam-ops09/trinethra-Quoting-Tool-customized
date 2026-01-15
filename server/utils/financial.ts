/**
 * Financial calculation utilities using Decimal.js for precision.
 * 
 * JavaScript's native Number type uses IEEE 754 floating-point which can cause
 * rounding errors in financial calculations (e.g., 0.1 + 0.2 !== 0.3).
 * 
 * This module provides precise decimal arithmetic for monetary values.
 */

import Decimal from 'decimal.js';

// Configure Decimal for financial calculations
Decimal.set({
  precision: 20,        // Maximum significant digits
  rounding: Decimal.ROUND_HALF_UP,  // Standard banking rounding
  toExpNeg: -7,         // Never use exponential notation for small numbers
  toExpPos: 20,         // Only use exponential for very large numbers
});

/**
 * Safely converts a value to Decimal.
 * Handles string, number, null, undefined, and existing Decimal instances.
 */
export function toDecimal(value: string | number | null | undefined | Decimal): Decimal {
  if (value === null || value === undefined || value === '') {
    return new Decimal(0);
  }
  if (value instanceof Decimal) {
    return value;
  }
  return new Decimal(value);
}

/**
 * Adds multiple values together with decimal precision.
 */
export function add(...values: (string | number | null | undefined | Decimal)[]): Decimal {
  return values.reduce<Decimal>((sum, val) => sum.plus(toDecimal(val)), new Decimal(0));
}

/**
 * Subtracts the second value from the first with decimal precision.
 */
export function subtract(a: string | number | null | undefined, b: string | number | null | undefined): Decimal {
  return toDecimal(a).minus(toDecimal(b));
}

/**
 * Multiplies two values with decimal precision.
 */
export function multiply(a: string | number | null | undefined, b: string | number | null | undefined): Decimal {
  return toDecimal(a).times(toDecimal(b));
}

/**
 * Divides the first value by the second with decimal precision.
 * @throws Error if dividing by zero
 */
export function divide(a: string | number | null | undefined, b: string | number | null | undefined): Decimal {
  const divisor = toDecimal(b);
  if (divisor.isZero()) {
    throw new Error('Division by zero');
  }
  return toDecimal(a).dividedBy(divisor);
}

/**
 * Calculates line item subtotal (quantity × unit price) with precision.
 */
export function calculateLineSubtotal(
  quantity: string | number | null | undefined,
  unitPrice: string | number | null | undefined
): Decimal {
  return multiply(quantity, unitPrice);
}

/**
 * Calculates total from line items with precision.
 */
export function calculateSubtotal(
  items: Array<{ quantity?: string | number | null; unitPrice?: string | number | null }>
): Decimal {
  return items.reduce((total, item) => {
    return total.plus(calculateLineSubtotal(item.quantity, item.unitPrice));
  }, new Decimal(0));
}

/**
 * Calculates document total with all adjustments.
 * Formula: subtotal - discount + shipping + cgst + sgst + igst
 */
export function calculateTotal(params: {
  subtotal: string | number | null | undefined | Decimal;
  discount?: string | number | null | Decimal;
  shippingCharges?: string | number | null | Decimal;
  cgst?: string | number | null | Decimal;
  sgst?: string | number | null | Decimal;
  igst?: string | number | null | Decimal;
}): Decimal {
  const subtotal = toDecimal(params.subtotal);
  const discount = toDecimal(params.discount);
  const shipping = toDecimal(params.shippingCharges);
  const cgst = toDecimal(params.cgst);
  const sgst = toDecimal(params.sgst);
  const igst = toDecimal(params.igst);

  return subtotal.minus(discount).plus(shipping).plus(cgst).plus(sgst).plus(igst);
}

/**
 * Converts a Decimal to a string for database storage.
 * Ensures consistent formatting with 2 decimal places.
 */
export function toMoneyString(value: Decimal | string | number | null | undefined): string {
  return toDecimal(value).toFixed(2);
}

/**
 * Compares two monetary values for equality (within 2 decimal places).
 */
export function moneyEquals(
  a: string | number | null | undefined,
  b: string | number | null | undefined
): boolean {
  return toDecimal(a).toFixed(2) === toDecimal(b).toFixed(2);
}

/**
 * Checks if the first value is greater than or equal to the second.
 */
export function moneyGte(
  a: string | number | null | undefined | Decimal,
  b: string | number | null | undefined | Decimal
): boolean {
  return toDecimal(a).gte(toDecimal(b));
}

/**
 * Checks if the first value is greater than the second.
 */
export function moneyGt(
  a: string | number | null | undefined | Decimal,
  b: string | number | null | undefined | Decimal
): boolean {
  return toDecimal(a).gt(toDecimal(b));
}

/**
 * Returns the maximum of the provided values.
 */
export function moneyMax(...values: (string | number | null | undefined)[]): Decimal {
  if (values.length === 0) return new Decimal(0);
  return Decimal.max(...values.map(toDecimal));
}

/**
 * Returns the minimum of a value and zero (for non-negative enforcement).
 */
export function nonNegative(value: string | number | null | undefined): Decimal {
  return Decimal.max(toDecimal(value), new Decimal(0));
}
