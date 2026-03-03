import { Router, Response } from "express";
import type { AuthRequest } from "../middleware";
import { WhatsAppService } from "../services/whatsapp.service";
import { storage } from "../storage";
import { logger } from "../utils/logger";

const router = Router();

/**
 * POST /api/whatsapp/share-quote/:id
 * Returns a wa.me URL with pre-filled quote details.
 */
router.get("/share-quote/:id", async (req: AuthRequest, res: Response) => {
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
 * POST /api/whatsapp/share-invoice/:id
 * Returns a wa.me URL with pre-filled invoice details.
 */
router.get("/share-invoice/:id", async (req: AuthRequest, res: Response) => {
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
