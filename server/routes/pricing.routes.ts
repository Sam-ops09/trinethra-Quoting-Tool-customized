
import { Router, Response } from "express";
import { storage } from "../storage";
import { authMiddleware, AuthRequest } from "../middleware";
import { logger } from "../utils/logger";

const router = Router();

router.get("/pricing-tiers", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const tiers = await storage.getAllPricingTiers();
    res.json(tiers);
  } catch (error) {
    logger.error("Get pricing tiers error:", error);
    res.status(500).json({ error: "Failed to fetch pricing tiers" });
  }
});

router.post("/pricing-tiers", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { name, minAmount, maxAmount, discountPercent, description, isActive } = req.body;

    if (!name || minAmount === undefined || discountPercent === undefined) {
      return res.status(400).json({ error: "Name, minAmount, and discountPercent are required" });
    }

    const tier = await storage.createPricingTier({
      name,
      minAmount,
      maxAmount,
      discountPercent,
      description,
      isActive: isActive !== false,
    });

    await storage.createActivityLog({
      userId: req.user!.id,
      action: "create_pricing_tier",
      entityType: "pricing_tier",
      entityId: tier.id,
    });

    res.json(tier);
  } catch (error: any) {
    logger.error("Create pricing tier error:", error);
    res.status(500).json({ error: error.message || "Failed to create pricing tier" });
  }
});

router.patch("/pricing-tiers/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updated = await storage.updatePricingTier(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Pricing tier not found" });
    }

    await storage.createActivityLog({
      userId: req.user!.id,
      action: "update_pricing_tier",
      entityType: "pricing_tier",
      entityId: updated.id,
    });

    res.json(updated);
  } catch (error: any) {
    logger.error("Update pricing tier error:", error);
    res.status(500).json({ error: error.message || "Failed to update pricing tier" });
  }
});

router.delete("/pricing-tiers/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    await storage.deletePricingTier(req.params.id);

    await storage.createActivityLog({
      userId: req.user!.id,
      action: "delete_pricing_tier",
      entityType: "pricing_tier",
      entityId: req.params.id,
    });

    res.json({ success: true });
  } catch (error) {
    logger.error("Delete pricing tier error:", error);
    res.status(500).json({ error: "Failed to delete pricing tier" });
  }
});


// PHASE 3 - PRICING CALCULATION ENDPOINTS
import { pricingService } from "../services/pricing.service";

router.post("/pricing/calculate-discount", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { subtotal } = req.body;

    if (!subtotal || subtotal <= 0) {
      return res.status(400).json({ error: "Valid subtotal is required" });
    }

    const result = await pricingService.calculateDiscount(subtotal);
    res.json(result);
  } catch (error: any) {
    logger.error("Calculate discount error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate discount" });
  }
});

router.post("/pricing/calculate-taxes", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, region, useIGST } = req.body;

    if (!amount || !region) {
      return res.status(400).json({ error: "Amount and region are required" });
    }

    const taxes = await pricingService.calculateTaxes(amount, region, useIGST);
    res.json(taxes);
  } catch (error: any) {
    logger.error("Calculate taxes error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate taxes" });
  }
});

router.post("/pricing/calculate-total", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { subtotal, region, useIGST, shippingCharges, customDiscount } = req.body;

    if (!subtotal || !region) {
      return res.status(400).json({ error: "Subtotal and region are required" });
    }

    const total = await pricingService.calculateQuoteTotal({
      subtotal,
      region,
      useIGST,
      shippingCharges,
      customDiscount,
    });

    res.json(total);
  } catch (error: any) {
    logger.error("Calculate total error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate total" });
  }
});

router.post("/pricing/convert-currency", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, fromCurrency, toCurrency } = req.body;

    if (!amount || !fromCurrency || !toCurrency) {
      return res.status(400).json({ error: "Amount, fromCurrency, and toCurrency are required" });
    }

    const converted = await pricingService.convertCurrency(amount, fromCurrency, toCurrency);
    res.json({ original: amount, converted, fromCurrency, toCurrency });
  } catch (error: any) {
    logger.error("Convert currency error:", error);
    res.status(500).json({ error: error.message || "Failed to convert currency" });
  }
});

export default router;
