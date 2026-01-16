import { eq, and, sql } from "drizzle-orm";
import { db } from "./db";
import { serialNumbers, invoices, invoiceItems, quotes, clients, users, activityLogs, salesOrders } from "@shared/schema";

export interface SerialValidationResult {
  valid: boolean;
  errors: {
    type: 'duplicate_in_invoice' | 'duplicate_in_quote' | 'duplicate_in_system' | 'count_mismatch' | 'empty_serial';
    message: string;
    affectedSerials?: string[];
  }[];
}

export interface SerialTraceabilityInfo {
  serialNumber: string;
  status: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  quote: {
    id: string;
    quoteNumber: string;
  };
  salesOrder?: {
    id: string;
    orderNumber: string;
  };
  invoice: {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    isMaster: boolean;
    masterInvoiceId?: string;
  };
  invoiceItem: {
    id: string;
    description: string;
    quantity: number;
  };
  product?: {
    id: string;
    name: string;
    sku: string;
  };
  vendorPo?: {
    id: string;
    poNumber: string;
  };
  warranty?: {
    startDate: string;
    endDate: string;
  };
  location?: string;
  notes?: string;
  history: {
    action: string;
    user: string;
    timestamp: string;
  }[];
}

/**
 * Validate serial numbers for an invoice item
 */
export async function validateSerialNumbers(
  invoiceId: string,
  invoiceItemId: string,
  serials: string[],
  expectedQuantity: number,
  options: {
    checkInvoiceScope?: boolean;
    checkQuoteScope?: boolean;
    checkSystemWide?: boolean;
  } = {
    checkInvoiceScope: true,
    checkQuoteScope: true,
    checkSystemWide: true,
  }
): Promise<SerialValidationResult> {
  const errors: SerialValidationResult['errors'] = [];

  // Check for empty serials
  const emptySerials = serials.filter(s => !s || s.trim().length === 0);
  if (emptySerials.length > 0) {
    errors.push({
      type: 'empty_serial',
      message: 'Empty serial numbers are not allowed',
    });
  }

  // Filter out empty serials for further checks
  const validSerials = serials.filter(s => s && s.trim().length > 0);

  // Check count mismatch
  if (validSerials.length !== expectedQuantity) {
    errors.push({
      type: 'count_mismatch',
      message: `Expected ${expectedQuantity} serial numbers, but received ${validSerials.length}`,
    });
  }

  // Check for duplicates within the submitted list
  const duplicatesInList = validSerials.filter((serial, index) =>
    validSerials.indexOf(serial) !== index
  );
  const uniqueDuplicatesInList = Array.from(new Set(duplicatesInList));

  if (uniqueDuplicatesInList.length > 0) {
    errors.push({
      type: 'duplicate_in_invoice',
      message: `Duplicate serial numbers in submission`,
      affectedSerials: uniqueDuplicatesInList,
    });
  }

  // Check duplicates in the same invoice (other items)
  if (options.checkInvoiceScope) {
    const invoiceItemsList = await db
      .select()
      .from(invoiceItems)
      .where(
        and(
          eq(invoiceItems.invoiceId, invoiceId),
          sql`${invoiceItems.id} != ${invoiceItemId}`
        )
      );

    const existingSerialsInInvoice: string[] = [];
    for (const item of invoiceItemsList) {
      if (item.serialNumbers) {
        try {
          const itemSerials = JSON.parse(item.serialNumbers);
          existingSerialsInInvoice.push(...itemSerials);
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }

    const duplicatesInInvoice = validSerials.filter(s =>
      existingSerialsInInvoice.includes(s)
    );

    if (duplicatesInInvoice.length > 0) {
      errors.push({
        type: 'duplicate_in_invoice',
        message: 'Serial numbers already used in this invoice',
        affectedSerials: duplicatesInInvoice,
      });
    }
  }

  // Check duplicates in the same quote/master invoice
  if (options.checkQuoteScope) {
    const invoice = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);

    if (invoice.length > 0) {
      const quoteId = invoice[0].quoteId;

      
      if (quoteId) {
        // Get all invoices for this quote
        const relatedInvoices = await db
          .select()
          .from(invoices)
          .where(
            and(
              eq(invoices.quoteId, quoteId),
              sql`${invoices.id} != ${invoiceId}`
            )
          );
          
        // Use existingSerialsInQuote...
        const existingSerialsInQuote: string[] = [];

        for (const relInvoice of relatedInvoices) {
            const items = await db
            .select()
            .from(invoiceItems)
            .where(eq(invoiceItems.invoiceId, relInvoice.id));

            for (const item of items) {
            if (item.serialNumbers) {
                try {
                const itemSerials = JSON.parse(item.serialNumbers);
                existingSerialsInQuote.push(...itemSerials);
                } catch (e) {
                // Skip invalid JSON
                }
            }
            }
        }

        const duplicatesInQuote = validSerials.filter(s =>
            existingSerialsInQuote.includes(s)
        );

        if (duplicatesInQuote.length > 0) {
            errors.push({
            type: 'duplicate_in_quote',
            message: 'Serial numbers already used in other invoices for this quote',
            affectedSerials: duplicatesInQuote,
            });
        }
      }
    }
  }

  // Check system-wide duplicates
  if (options.checkSystemWide) {
    const existingSerials = await db
      .select({ serialNumber: serialNumbers.serialNumber })
      .from(serialNumbers)
      .where(
        sql`${serialNumbers.serialNumber} IN (${sql.join(validSerials.map(s => sql`${s}`), sql`, `)})`
      );

    const duplicatesInSystem = existingSerials.map(s => s.serialNumber);

    if (duplicatesInSystem.length > 0) {
      errors.push({
        type: 'duplicate_in_system',
        message: 'Serial numbers already exist in the system',
        affectedSerials: duplicatesInSystem,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get traceability information for a serial number
 */
export async function getSerialTraceability(serialNumberValue: string): Promise<SerialTraceabilityInfo | null> {
  console.log('[Serial Traceability] Searching for:', serialNumberValue);

  // First check if serial exists in the serialNumbers table
  const [serial] = await db
    .select()
    .from(serialNumbers)
    .where(eq(serialNumbers.serialNumber, serialNumberValue))
    .limit(1);

  if (serial) {
    console.log('[Serial Traceability] Found in serialNumbers table:', serial.id);
    // Serial found in dedicated table, construct full traceability
    const invoice = serial.invoiceId
      ? await db.select().from(invoices).where(eq(invoices.id, serial.invoiceId)).limit(1)
      : [];

    if (invoice.length === 0) {
      console.log('[Serial Traceability] No invoice found for serial');
      return null;
    }

    const quote = invoice[0].quoteId 
      ? await db.select().from(quotes).where(eq(quotes.id, invoice[0].quoteId)).limit(1)
      : [];
    const customer = quote.length > 0
      ? await db.select().from(clients).where(eq(clients.id, quote[0].clientId)).limit(1)
      : [];

    // Fetch sales order if it exists
    const salesOrder = invoice[0].salesOrderId
      ? await db.select().from(salesOrders).where(eq(salesOrders.id, invoice[0].salesOrderId)).limit(1)
      : [];

    const invoiceItem = serial.invoiceItemId
      ? await db.select().from(invoiceItems).where(eq(invoiceItems.id, serial.invoiceItemId)).limit(1)
      : [];

    // Get history from activity logs
    const history = await db
      .select({
        action: activityLogs.action,
        userId: activityLogs.userId,
        timestamp: activityLogs.timestamp,
      })
      .from(activityLogs)
      .where(
        and(
          eq(activityLogs.entityType, 'serial_number'),
          eq(activityLogs.entityId, serial.id)
        )
      )
      .orderBy(activityLogs.timestamp);

    const historyWithUsers = await Promise.all(
      history.map(async (h) => {
        const user = await db.select().from(users).where(eq(users.id, h.userId)).limit(1);
        return {
          action: h.action,
          user: user.length > 0 ? user[0].name : 'Unknown',
          timestamp: h.timestamp.toISOString(),
        };
      })
    );

    return {
      serialNumber: serial.serialNumber,
      status: serial.status || 'unknown',
      customer: customer.length > 0
        ? {
            id: customer[0].id,
            name: customer[0].name,
            email: customer[0].email,
          }
        : {
            id: '',
            name: 'Unknown',
            email: '',
          },
      quote: quote.length > 0
        ? {
            id: quote[0].id,
            quoteNumber: quote[0].quoteNumber,
          }
        : {
            id: '',
            quoteNumber: 'Unknown',
          },
      salesOrder: salesOrder.length > 0
        ? {
            id: salesOrder[0].id,
            orderNumber: salesOrder[0].orderNumber,
          }
        : undefined,
      invoice: {
        id: invoice[0].id,
        invoiceNumber: invoice[0].invoiceNumber,
        invoiceDate: invoice[0].createdAt.toISOString(),
        isMaster: invoice[0].isMaster,
        masterInvoiceId: invoice[0].parentInvoiceId || undefined,
      },
      invoiceItem: invoiceItem.length > 0
        ? {
            id: invoiceItem[0].id,
            description: invoiceItem[0].description,
            quantity: invoiceItem[0].quantity,
          }
        : {
            id: '',
            description: 'Unknown',
            quantity: 0,
          },
      warranty: serial.warrantyStartDate && serial.warrantyEndDate
        ? {
            startDate: serial.warrantyStartDate.toISOString(),
            endDate: serial.warrantyEndDate.toISOString(),
          }
        : undefined,
      location: serial.location || undefined,
      notes: serial.notes || undefined,
      history: historyWithUsers,
    };
  }

  // Not found in serialNumbers table, check in invoice items serialNumbers JSON field
  console.log('[Serial Traceability] Not in serialNumbers table, checking invoice items...');
  const allInvoiceItems = await db.select().from(invoiceItems);
  console.log('[Serial Traceability] Found', allInvoiceItems.length, 'invoice items to check');

  for (const item of allInvoiceItems) {
    if (item.serialNumbers) {
      try {
        const itemSerials = JSON.parse(item.serialNumbers);
        if (Array.isArray(itemSerials) && itemSerials.includes(serialNumberValue)) {
          console.log('[Serial Traceability] Found in invoice item:', item.id);
          // Found in invoice item, construct traceability info
          return await constructTraceabilityFromInvoiceItem(serialNumberValue, item);
        }
      } catch (e) {
        console.error('[Serial Traceability] Error parsing serialNumbers JSON for item:', item.id, e);
        // Skip invalid JSON
      }
    }
  }

  console.log('[Serial Traceability] Serial number not found anywhere');
  return null;
}
async function constructTraceabilityFromInvoiceItem(
  serialNumberValue: string,
  item: typeof invoiceItems.$inferSelect
): Promise<SerialTraceabilityInfo | null> {
  const invoice = await db.select().from(invoices).where(eq(invoices.id, item.invoiceId)).limit(1);
  if (invoice.length === 0) return null;

  const quote = invoice[0].quoteId 
    ? await db.select().from(quotes).where(eq(quotes.id, invoice[0].quoteId)).limit(1)
    : [];
  const customer = quote.length > 0
    ? await db.select().from(clients).where(eq(clients.id, quote[0].clientId)).limit(1)
    : [];

  // Fetch sales order if it exists
  const salesOrder = invoice[0].salesOrderId
    ? await db.select().from(salesOrders).where(eq(salesOrders.id, invoice[0].salesOrderId)).limit(1)
    : [];

  return {
    serialNumber: serialNumberValue,
    status: 'delivered',
    customer: customer.length > 0
      ? {
          id: customer[0].id,
          name: customer[0].name,
          email: customer[0].email,
        }
      : {
          id: '',
          name: 'Unknown',
          email: '',
        },
    quote: quote.length > 0
      ? {
          id: quote[0].id,
          quoteNumber: quote[0].quoteNumber,
        }
      : {
          id: '',
          quoteNumber: 'Unknown',
        },
    salesOrder: salesOrder.length > 0
      ? {
          id: salesOrder[0].id,
          orderNumber: salesOrder[0].orderNumber,
        }
      : undefined,
    invoice: {
      id: invoice[0].id,
      invoiceNumber: invoice[0].invoiceNumber,
      invoiceDate: invoice[0].createdAt.toISOString(),
      isMaster: invoice[0].isMaster,
      masterInvoiceId: invoice[0].parentInvoiceId || undefined,
    },
    invoiceItem: {
      id: item.id,
      description: item.description,
      quantity: item.quantity,
    },
    history: [],
  };
}

/**
 * Log serial number change
 */
export async function logSerialNumberChange(
  userId: string,
  action: 'add' | 'edit' | 'delete',
  serialId: string
) {
  await db.insert(activityLogs).values({
    userId,
    action: `serial_number_${action}`,
    entityType: 'serial_number',
    entityId: serialId,
  });
}

/**
 * Check if user can edit serial numbers based on invoice status and role
 */
export async function canEditSerialNumbers(
  userId: string,
  invoiceId: string
): Promise<{ canEdit: boolean; reason?: string }> {
  const invoice = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);

  if (invoice.length === 0) {
    return { canEdit: false, reason: 'Invoice not found' };
  }

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (user.length === 0) {
    return { canEdit: false, reason: 'User not found' };
  }

  const userRole = user[0].role;
  const invoiceStatus = invoice[0].paymentStatus;
  const masterStatus = invoice[0].masterInvoiceStatus;

  // For master invoices, check master status
  if (invoice[0].isMaster) {
    if (masterStatus === 'draft') {
      return { canEdit: true };
    }

    if (masterStatus === 'confirmed') {
      // Only admin and sales_manager can edit
      if (userRole === 'admin' || userRole === 'sales_manager') {
        return { canEdit: true };
      }
      return { canEdit: false, reason: 'Only administrators and managers can edit serial numbers for confirmed master invoices' };
    }

    if (masterStatus === 'locked') {
      // Only admin can edit
      if (userRole === 'admin') {
        return { canEdit: true };
      }
      return { canEdit: false, reason: 'Only administrators can edit serial numbers for locked master invoices' };
    }
  }

  // For regular and child invoices
  if (invoiceStatus === 'pending' || invoiceStatus === 'partial') {
    return { canEdit: true };
  }

  if (invoiceStatus === 'paid') {
    // Only admin and sales_manager can edit
    if (userRole === 'admin' || userRole === 'sales_manager') {
      return { canEdit: true };
    }
    return { canEdit: false, reason: 'Only administrators and managers can edit serial numbers for paid invoices' };
  }

  return { canEdit: true };
}

