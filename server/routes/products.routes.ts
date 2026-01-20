
import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware";
import { logger } from "../utils/logger";
import { db } from "../db";
import * as schema from "../../shared/schema";
import { eq } from "drizzle-orm";
import { requireFeature } from "../feature-flags-middleware";
import { isFeatureEnabled } from "../../shared/feature-flags";

const router = Router();

// ==================== PRODUCTS ROUTES ====================

router.get("/", authMiddleware, requireFeature('products_module'), async (req: AuthRequest, res: Response) => {
  try {
    const products = await db.select().from(schema.products).orderBy(schema.products.name);
    res.json(products);
  } catch (error) {
    logger.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/:id", authMiddleware, requireFeature('products_module'), async (req: AuthRequest, res: Response) => {
  try {
    const [product] = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.id, req.params.id));

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    logger.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

router.post("/", authMiddleware, requireFeature('products_create'), async (req: AuthRequest, res: Response) => {
  try {
    // Pre-process: Coerce unitPrice to string if number (backward compatibility)
    if (req.body && typeof req.body.unitPrice === 'number') {
      req.body.unitPrice = String(req.body.unitPrice);
    }

    // Feature Flag Guards
    if (!isFeatureEnabled('products_sku') && req.body.sku) {
       // Option: block or delete. Let's block if specific value provided, ensuring data integrity.
       return res.status(403).json({ error: "SKU feature is disabled" });
    }
    if (!isFeatureEnabled('products_stock_tracking') && (req.body.stockQuantity || req.body.minStockLevel)) {
       // If tracking disabled, you can't set initial stock or limits
       // But wait, what if we want to "disable tracking" but keep data? 
       // The user said "I want this implemented". Implemented means enforced.
       delete req.body.stockQuantity;
       delete req.body.minStockLevel;
       // We might default to 0 in schema insert, which is fine.
    }
    if (!isFeatureEnabled('products_pricing') && req.body.unitPrice) {
       // Maybe they only want products for catalogue without price?
       delete req.body.unitPrice; 
    }

    const parseResult = schema.insertProductSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors });
    }

    const validatedData = parseResult.data;
    const stockQuantity = validatedData.stockQuantity || 0;
    const initialAvailable = validatedData.availableQuantity !== undefined ? validatedData.availableQuantity : stockQuantity;

    const [product] = await db
      .insert(schema.products)
      .values({
        ...validatedData,
        stockQuantity,
        availableQuantity: initialAvailable,
        createdBy: req.user!.id,
      })
      .returning();

    res.json(product);
  } catch (error) {
    logger.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.patch("/:id", authMiddleware, requireFeature('products_edit'), async (req: AuthRequest, res: Response) => {
  try {
    const updates = { ...req.body, updatedAt: new Date() };
         
    // Feature Guards
    if (!isFeatureEnabled('products_sku') && updates.sku) delete updates.sku;
    if (!isFeatureEnabled('products_stock_tracking')) {
        delete updates.stockQuantity;
        delete updates.availableQuantity;
        delete updates.minStockLevel;
    }

    const [updated] = await db
      .update(schema.products)
      .set(updates)
      .where(eq(schema.products.id, req.params.id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(updated);
  } catch (error) {
    logger.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

export default router;
