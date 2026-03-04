import crypto from "crypto";

export interface EInvoiceData {
  irn: string;
  ackNo: string;
  ackDate: string;
  signedQrCode: string;
}

export class EInvoiceService {
  /**
   * Mock generation of IRN and QR code.
   * In production, this would call GSP/ASP APIs.
   */
  static async generateEInvoice(params: { 
    invoiceNumber: string; 
    clientId: string; 
    total: string | number;
    supplierGstin?: string;
    buyerGstin?: string;
    invoiceDate?: string | Date;
  }): Promise<EInvoiceData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const irn = crypto.createHash('sha256')
      .update(params.invoiceNumber + params.clientId + Date.now())
      .digest('hex');

    const ackNo = "122" + Math.floor(1000000000 + Math.random() * 9000000000);
    const ackDate = new Date().toISOString();

    // Mock structured QR data for India E-Invoicing
    // Format: GSTIN_SUP|GSTIN_BUY|INV_NO|INV_DATE|INV_VAL|NB_ITEMS|HSN_MAIN|IRN|GEN_DATE
    const qrParts = [
      params.supplierGstin || "29AAAAA0000A1Z5", // Mock if missing
      params.buyerGstin || "29BBBBB0000B1Z5",    // Mock if missing
      params.invoiceNumber,
      new Date(params.invoiceDate || Date.now()).toLocaleDateString('en-IN'),
      params.total,
      "1", // Mock 1 item
      "8517", // Mock HSN
      irn.substring(0, 15) + "...", // Truncated for QR size
      ackDate
    ];

    const qrDataString = qrParts.join("|");
    // Use a URL format to ensure scanners identify it as "usable data"
    const encodedData = encodeURIComponent(qrDataString);
    const verificationUrl = `https://einvoice1.gst.gov.in/verify?irn=${irn}&data=${encodedData}`;
    const signedQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(verificationUrl)}`;

    return {
      irn,
      ackNo,
      ackDate,
      signedQrCode
    };
  }

  /**
   * Mock cancellation of E-Invoice.
   * Allowed within 24 hours of generation in India.
   */
  static async cancelEInvoice(irn: string, reason: string): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`[E-Invoice Service] Cancelled IRN: ${irn} | Reason: ${reason}`);
    return true;
  }
}

export const eInvoiceService = new EInvoiceService();
