/**
 * Audit Diff Utility
 * Generates a list of field-level changes between a "before" and "after" snapshot.
 * Used by route handlers to enrich activity log metadata with concrete diffs.
 */

/** A single field-level change */
export interface FieldChange {
  field: string;
  from: any;
  to: any;
}

/** Fields that should never appear in audit diffs */
const EXCLUDED_FIELDS = new Set([
  "id",
  "createdAt",
  "updatedAt",
  "version",
  "createdBy",
  "password",
  "refreshToken",
  "publicToken",
  "tokenExpiresAt",
]);

/**
 * Normalize a value for comparison.
 * Converts Date objects to ISO strings, trims strings, and handles nullish values.
 */
function normalize(value: any): any {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && value.toISOString) return value.toISOString();
  if (typeof value === "string") return value.trim();
  return value;
}

/**
 * Build a change diff between two objects.
 *
 * @param before - The entity state before the update
 * @param after - The entity state after the update (or the update payload)
 * @param fieldsToTrack - Optional whitelist of fields to track. If omitted, all non-excluded fields are tracked.
 * @returns Array of changes, or null if nothing changed.
 */
export function buildChangeDiff(
  before: Record<string, any>,
  after: Record<string, any>,
  fieldsToTrack?: string[]
): FieldChange[] | null {
  const changes: FieldChange[] = [];

  const keys = fieldsToTrack || Object.keys(after);

  for (const key of keys) {
    if (EXCLUDED_FIELDS.has(key)) continue;

    // Skip if the "after" object doesn't have this key
    if (!(key in after)) continue;

    const fromVal = normalize(before[key]);
    const toVal = normalize(after[key]);

    // Skip if values are the same
    if (fromVal === toVal) continue;
    // Both null/undefined → same
    if (fromVal == null && toVal == null) continue;

    // Deep-equal for objects/arrays (simple JSON comparison)
    if (
      typeof fromVal === "object" &&
      typeof toVal === "object" &&
      fromVal !== null &&
      toVal !== null
    ) {
      try {
        if (JSON.stringify(fromVal) === JSON.stringify(toVal)) continue;
      } catch {
        // If stringify fails, treat as changed
      }
    }

    changes.push({
      field: key,
      from: before[key] ?? null,
      to: after[key] ?? null,
    });
  }

  return changes.length > 0 ? changes : null;
}

/**
 * Build a compact snapshot of key financial fields from a quote/invoice.
 * Useful for creating a readable summary of what the entity looked like at a point in time.
 */
export function buildFinancialSnapshot(entity: Record<string, any>): Record<string, any> {
  const fields = [
    "status", "total", "subtotal", "discount", "cgst", "sgst", "igst",
    "shippingCharges", "currency", "validUntil", "validityDays",
    "paymentStatus", "paidAmount", "remainingAmount",
  ];

  const snapshot: Record<string, any> = {};
  for (const f of fields) {
    if (f in entity && entity[f] != null) {
      snapshot[f] = entity[f];
    }
  }
  return snapshot;
}
