import { Invoice, InvoiceItem, Client } from "@shared/schema";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class EInvoiceValidator {
  /**
   * Validates if an invoice is eligible for Indian E-Invoicing.
   * Requirements:
   * 1. 15-digit GSTIN for both Supplier & Buyer.
   * 2. 6-digit Pincodes for both.
   * 3. HSN/SAC codes for all items (min 4 digits).
   * 4. Valid Tax Invoice type.
   */
  static validate(
    invoice: Invoice,
    items: InvoiceItem[],
    client: Client,
    companyDetails: any
  ): ValidationResult {
    const errors: string[] = [];
    const isProd = process.env.NODE_ENV === "production";

    // 1. Validate Company (Supplier)
    const companyGstin = companyDetails.gstin || companyDetails.company_gstin;
    const companyZip = companyDetails.zipCode || companyDetails.company_zipCode;
    const companyAddr = companyDetails.address || companyDetails.company_address;

    if (!companyGstin || !this.isValidGSTIN(companyGstin)) {
      errors.push(`Supplier (Company) must have a valid 15-digit GSTIN.${!isProd ? " [Relaxed: Allowed in Dev]" : ""}`);
    }
    
    if (!companyZip && !this.hasValidPinCode(companyAddr || "")) {
      errors.push(`Supplier (Company) address must include a 6-digit Pincode (or set ZIP Code).${!isProd ? " [Relaxed: Allowed in Dev]" : ""}`);
    }

    // 2. Validate Client (Buyer)
    if (!client.gstin || !this.isValidGSTIN(client.gstin)) {
      errors.push(`Buyer (Client) must have a valid 15-digit GSTIN.${!isProd ? " [Relaxed: Allowed in Dev]" : ""}`);
    }
    
    const buyerAddress = client.billingAddress || client.shippingAddress || "";
    if (!this.hasValidPinCode(buyerAddress)) {
      errors.push(`Buyer (Client) address must include a 6-digit Pincode.${!isProd ? " [Relaxed: Allowed in Dev]" : ""}`);
    }

    // 3. Validate Invoice Items
    if (!items || items.length === 0) {
      const errMsg = "Invoice must have at least one item.";
      errors.push(isProd ? errMsg : `${errMsg} [Relaxed: Allowed in Dev]`);
    } else {
      items.forEach((item, index) => {
        if (!item.hsnSac || item.hsnSac.length < 4) {
          const errMsg = `Line item #${index + 1} ("${item.description}") requires a valid HSN (min 4 digits).`;
          errors.push(isProd ? errMsg : `${errMsg} [Relaxed: Allowed in Dev]`);
        }
      });
    }

    // 4. Validate Totals
    if (Number(invoice.total) <= 0) {
      const errMsg = "Invoice total must be greater than zero.";
      errors.push(isProd ? errMsg : `${errMsg} [Relaxed: Allowed in Dev]`);
    }

    // In development mode, we ignore errors that are marked as relaxed
    const fatalErrors = errors.filter(e => !e.includes("[Relaxed:"));

    return {
      isValid: isProd ? errors.length === 0 : fatalErrors.length === 0,
      errors: errors
    };
  }

  private static isValidGSTIN(gstin: string): boolean {
    if (!gstin) return false;
    return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin.trim().toUpperCase());
  }

  private static hasValidPinCode(address: string): boolean {
    if (!address) return false;
    return /\b\d{6}\b/.test(address);
  }
}
