import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware";
import { WhatsAppService } from "../services/whatsapp.service";
import { storage } from "../storage";
import { logger } from "../utils/logger";

const router = Router();

/**
 * PUBLIC GET /api/whatsapp/public/share-quote/:token
 * Used by clients viewing public quote pages.
 */
router.get("/public/share-quote/:token", async (req: any, res: Response) => {
  try {
    const token = req.params.token;
    const quote = await storage.getQuoteByToken(token);
    if (!quote) return res.status(404).json({ error: "Quote not found" });

    // Validate expiry if applicable
    if (quote.tokenExpiresAt && new Date(quote.tokenExpiresAt) < new Date()) {
        return res.status(410).json({ error: "Quote link has expired" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const { message, phone } = await WhatsAppService.buildQuoteMessage(quote.id, baseUrl);
    const url = WhatsAppService.buildWhatsAppUrl(phone, message);

    // Optional: log public sharing activity
    await storage.createActivityLog({
      userId: quote.createdBy, // Log against creator
      action: "public_share_quote_whatsapp",
      entityType: "quote",
      entityId: quote.id,
      metadata: { via: "public_token", ip: req.ip }
    });

    res.json({ url, message, phone });
  } catch (error: any) {
    logger.error("WhatsApp public quote share error:", error);
    res.status(500).json({ error: error.message || "Failed to generate public share link" });
  }
});

/**
 * GET /api/whatsapp/share-quote/:id
 * Returns a wa.me URL with pre-filled quote details.
 * REQUIRES AUTH
 */
router.get("/share-quote/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const { message, phone } = await WhatsAppService.buildQuoteMessage(req.params.id, baseUrl);
    const url = WhatsAppService.buildWhatsAppUrl(phone, message);

    await storage.createActivityLog({
      userId: req.user!.id,
      action: "share_quote_whatsapp",
      entityType: "quote",
      entityId: req.params.id,
    });

    res.json({ url, message, phone });
  } catch (error: any) {
    logger.error("WhatsApp quote share error:", error);
    res.status(500).json({ error: error.message || "Failed to generate share link" });
  }
});

/**
 * GET /api/whatsapp/share-invoice/:id
 * Returns a wa.me URL with pre-filled invoice details.
 */
router.get("/share-invoice/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { message, phone } = await WhatsAppService.buildInvoiceMessage(req.params.id);
    const url = WhatsAppService.buildWhatsAppUrl(phone, message);

    await storage.createActivityLog({
      userId: req.user!.id,
      action: "share_invoice_whatsapp",
      entityType: "invoice",
      entityId: req.params.id,
    });

    res.json({ url, message, phone });
  } catch (error: any) {
    logger.error("WhatsApp invoice share error:", error);
    res.status(500).json({ error: error.message || "Failed to generate share link" });
  }
});

export default router;
